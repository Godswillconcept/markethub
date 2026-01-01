const passport = require("passport");
const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const { Op } = require("sequelize");
const AppError = require("../utils/appError");
const { User, Role, Permission } = require("../models");
const PermissionService = require("../services/permission.service");
const tokenBlacklistService = require("../services/token-blacklist-enhanced.service");
const logger = require("../utils/logger");

/**
 * Middleware to handle local authentication using Passport
 * @returns {Function} Express middleware function
 */
const localAuth = () => {
  return (req, res, next) => {
    passport.authenticate("local", { session: false }, (err, user, info) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return next(
          new AppError(info?.message || "Authentication failed", 401)
        );
      }
      // Store user in request for the next middleware
      req.user = user;
      next();
    })(req, res, next);
  };
};

const setUser = (req, res, next) => {
  return passport.authenticate(
    "jwt",
    { session: false },
    async (err, user, info) => {
      // Handle authentication errors gracefully
      if (err) {
        console.warn("JWT authentication error in setUser:", err.message);
        req.user = null;
        return next();
      }

      if (user) {
        try {
          // Load user with roles and permissions
          const userWithRoles = await User.findByPk(user.id, {
            include: [
              {
                model: Role,
                as: "roles",
                include: [
                  {
                    model: Permission,
                    as: "permissions",
                    through: { attributes: [] },
                  },
                ],
                through: { attributes: [] },
              },
            ],
          });

          if (userWithRoles) {
            req.user = userWithRoles;
          } else {
            req.user = user;
          }
        } catch (error) {
          console.warn(
            "Failed to load user roles/permissions in setUser:",
            error.message
          );
          req.user = user; // Continue with basic user if loading fails
        }
      } else {
        req.user = null;
      }
      return next();
    }
  )(req, res, next);
};
/**
 * Protect routes - check if user is authenticated using JWT
 * Attaches user object to req.user with roles
 */
const protect = async (req, res, next) => {
  try {
    // 1) Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next(new AppError("You are not authorized to access this resource", 401));
    }
    
    const token = authHeader.split(" ")[1];

    // 2) Check if token is blacklisted FIRST (before JWT verification)
    const isBlacklisted = await tokenBlacklistService.isTokenBlacklisted(token);
    if (isBlacklisted) {
      return next(
        new AppError(
          "Token has been invalidated. Please log in again.",
          401
        )
      );
    }

    // 3) Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      issuer: process.env.APP_NAME || "Stylay",
      audience: "user"
    });

    // 4) Check if user still exists
    const currentUser = await User.findByPk(decoded.id, {
      include: [
        {
          model: Role,
          as: "roles",
          include: [
            {
              model: Permission,
              as: "permissions",
              through: { attributes: [] },
            },
          ],
          through: { attributes: [] },
        },
      ],
    });

    if (!currentUser) {
      return next(new AppError("The user belonging to this token no longer exists.", 401));
    }

    // 5) Check if user is active
    if (!currentUser.is_active) {
      return next(new AppError("Your account has been deactivated. Please contact support.", 401));
    }

    // 6) Attach user to request object
    req.user = currentUser;

    // 7) Session tracking - if session ID is provided, validate and update activity
    const sessionId = req.headers['x-session-id'] || req.body.session_id;
    if (sessionId) {
      try {
        const { UserSession } = require("../models/user-session.model");
        const session = await UserSession.getSessionById(sessionId);
        
        if (session && session.isValid() && session.user_id === currentUser.id) {
          await session.updateActivity();
          req.session = session;
        }
      } catch (sessionError) {
        logger.warn("Session tracking failed:", sessionError);
        // Don't fail authentication if session tracking fails
      }
    }

    return next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return next(new AppError("Invalid token. Please log in again.", 401));
    }
    if (error.name === "TokenExpiredError") {
      return next(new AppError("Your token has expired! Please log in again.", 401));
    }
    
    logger.error("Protect middleware error:", error);
    return next(new AppError("Authentication failed", 401));
  }
};

/**
 * Middleware to handle JWT errors consistently
 */
const handleJWT = (req, res, next) => {
  return passport.authenticate(
    "jwt",
    { session: false, failWithError: true },
    (err, user, info) => {
      if (err) {
        return next(err);
      }

      if (!user) {
        const message = info?.message || "Authentication failed";
        return next(new AppError(message, 401));
      }

      req.user = user;
      return next();
    }
  )(req, res, next);
};

/**
 * Restrict route to specific roles
 * @param {...string} roles - Roles that have access to the route
 * @example router.get('/admin', restrictTo('admin'), adminController.dashboard)
 */
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError("Please log in to access this route", 401));
    }

    // Safely get user roles, defaulting to an empty array if roles is undefined
    const userRoles = req.user.roles
      ? req.user.roles.map((role) => role.name.toLowerCase())
      : [];
    const requiredRoles = roles.map((role) => role.toLowerCase());

    // Debug logging

    // Check if user has any of the required roles (case-insensitive)
    const hasRequiredRole = requiredRoles.some((role) =>
      userRoles.some((userRole) => userRole === role)
    );

    if (!hasRequiredRole) {
      console.log("Access denied. User does not have required role.");
      return next(
        new AppError("You do not have permission to perform this action", 403)
      );
    }

    next();
  };
};

/**
 * Check if user is logged in (for optional authentication)
 * Attaches user to req.user if token is valid
 */
const isLoggedIn = async (req, res, next) => {
  if (req.headers.authorization?.startsWith("Bearer")) {
    try {
      const token = req.headers.authorization.split(" ")[1];
      
      // Check blacklist first
      const isBlacklisted = await tokenBlacklistService.isTokenBlacklisted(token);
      if (isBlacklisted) {
        return next(); // Skip setting user if token is blacklisted
      }

      const decoded = await promisify(jwt.verify)(
        token,
        process.env.JWT_SECRET
      );
      const currentUser = await User.findByPk(decoded.id, {
        include: [
          {
            model: Role,
            through: { attributes: [] },
            attributes: ["id", "name", "description"],
          },
        ],
      });

      if (currentUser) {
        req.user = currentUser.get({ plain: true });
      }
    } catch (err) {
      // If token is invalid, continue without setting req.user
    }
  }
  next();
};

/**
 * Check if user is logged out
 * Prevents access to auth routes when already logged in
 */
const isLoggedOut = (req, res, next) => {
  if (req.headers.authorization?.startsWith("Bearer")) {
    return next(new AppError("You are already logged in", 400));
  }
  next();
};

/**
 * Check if user has admin role
 * Can be used as a middleware or conditionally in routes
 */
const isAdmin = (req, res, next) => {
  if (!req.user) {
    return next(new AppError("Please log in to access this route", 401));
  }

  const isAdmin =
    req.user.roles && req.user.roles.some((role) => role.name === "admin");

  if (!isAdmin) {
    return next(
      new AppError("You do not have permission to perform this action", 403)
    );
  }

  next();
};

/**
 * Check if user has customer role
 * Can be used as a middleware or conditionally in routes
 */
const isCustomer = (req, res, next) => {
  if (!req.user) {
    return next(new AppError("Please log in to access this route", 401));
  }

  const isCustomer = req.user.roles.some((role) => role.name === "customer");

  if (!isCustomer) {
    return next(
      new AppError("This action is restricted to customers only", 403)
    );
  }

  next();
};

/**
 * Check if user has vendor role
 * Can be used as a middleware or conditionally in routes
 */
const isVendor = (req, res, next) => {
  if (!req.user) {
    return next(new AppError("Please log in to access this route", 401));
  }

  // Check if user has the vendor role
  const hasVendorRole =
    req.user.roles &&
    Array.isArray(req.user.roles) &&
    req.user.roles.some((role) => role.name === "vendor");

  if (!hasVendorRole) {
    return next(new AppError("This action is restricted to vendors only", 403));
  }

  next();
};

/**
 * Role-based access control middleware
 * @param {...string} roles - Roles that have access to the route
 * @example router.get('/admin', hasRole('admin', 'superadmin'), adminController.dashboard)
 */
const hasRole = (...roles) => {
  return [
    protect,
    (req, res, next) => {
      const userRoles = req.user.roles.map((role) => role.name);
      const hasRequiredRole = roles.some((role) => userRoles.includes(role));

      if (!hasRequiredRole) {
        return next(
          new AppError("You do not have permission to perform this action", 403)
        );
      }
      next();
    },
  ];
};

/**
 * Check if user is the owner of the resource or has admin role
 * @param {Model} model - Sequelize model to check ownership against
 * @param {string} [idParam='id'] - Name of the route parameter containing the resource ID
 * @param {string} [userIdField='userId'] - Name of the field in the model that references the user
 */
const isOwnerOrAdmin = (model, idParam = "id", userIdField = "userId") => {
  return [
    protect,
    async (req, res, next) => {
      try {
        const resource = await model.findByPk(req.params[idParam]);

        if (!resource) {
          return next(new AppError("No resource found with that ID", 404));
        }

        const userRoles = req.user.roles.map((role) => role.name);

        // Grant access if user is admin
        if (userRoles.includes("admin")) {
          return next();
        }

        // Grant access if user is the owner
        if (resource[userIdField] === req.user.id) {
          return next();
        }

        return next(
          new AppError("You do not have permission to perform this action", 403)
        );
      } catch (error) {
        next(error);
      }
    },
  ];
};

/**
 * Check if user has any of the specified roles
 * Similar to restrictTo but returns a boolean instead of middleware
 * @param {Object} user - The user object with Roles
 * @param {...string} roles - Roles to check against
 * @returns {boolean} - True if user has any of the specified roles
 */
const hasAnyRole = (user, ...roles) => {
  if (!user?.roles) return false;
  const userRoles = user.roles.map((role) => role.name);
  return roles.some((role) => userRoles.includes(role));
};

/**
 * Check if user has all of the specified roles
 * @param {Object} user - The user object with Roles
 * @param {...string} roles - Roles to check against
 * @returns {boolean} - True if user has all of the specified roles
 */
const hasAllRoles = (user, ...roles) => {
  if (!user?.roles) return false;
  const userRoles = user.roles.map((role) => role.name);
  return roles.every((role) => userRoles.includes(role));
};

/**
 * Load user permissions into request
 * @returns {Function} Express middleware function
 */
const loadPermissions = async (req, res, next) => {
  if (req.user && req.user.id) {
    try {
      // Load user with roles and permissions
      const userWithPermissions = await User.findByPk(req.user.id, {
        include: [
          {
            model: Role,
            as: "roles",
            include: [
              {
                model: Permission,
                as: "permissions",
                through: { attributes: [] },
              },
            ],
            through: { attributes: [] },
          },
        ],
      });

      if (userWithPermissions) {
        req.user = userWithPermissions;
      }
    } catch (error) {
      // If loading permissions fails, continue without them
      console.warn("Failed to load user permissions:", error.message);
    }
  }

  next();
};

/**
 * Check if user has specific permission (backward compatible with admin role)
 * @param {string} permission - Permission name to check
 * @returns {Function} Express middleware function
 */
const hasPermission = (permission) => {
  return async (req, res, next) => {
    if (!req.user) {
      return next(new AppError("Authentication required", 401));
    }

    // Check if user has admin role (backward compatibility)
    if (PermissionService.hasAdminRole(req.user)) {
      return next();
    }

    // Check specific permission
    const hasPerm = await PermissionService.checkPermission(
      req.user,
      permission
    );
    if (!hasPerm) {
      return next(
        new AppError(`Access denied. Required permission: ${permission}`, 403)
      );
    }

    next();
  };
};

/**
 * Check if user has any of the specified permissions
 * @param {string[]} permissions - Array of permission names
 * @returns {Function} Express middleware function
 */
const hasAnyPermission = (permissions) => {
  return async (req, res, next) => {
    if (!req.user) {
      return next(new AppError("Authentication required", 401));
    }

    // Check if user has admin role (backward compatibility)
    if (PermissionService.hasAdminRole(req.user)) {
      return next();
    }

    // Check if user has any of the specified permissions
    const hasAnyPerm = await req.user.hasAnyPermission(permissions);
    if (!hasAnyPerm) {
      return next(
        new AppError(
          `Access denied. Required one of: ${permissions.join(", ")}`,
          403
        )
      );
    }

    next();
  };
};

/**
 * Check if user has all of the specified permissions
 * @param {string[]} permissions - Array of permission names
 * @returns {Function} Express middleware function
 */
const hasAllPermissions = (permissions) => {
  return async (req, res, next) => {
    if (!req.user) {
      return next(new AppError("Authentication required", 401));
    }

    // Check if user has admin role (backward compatibility)
    if (PermissionService.hasAdminRole(req.user)) {
      return next();
    }

    // Check if user has all specified permissions
    let hasAllPerms = true;
    for (const permission of permissions) {
      if (!(await PermissionService.checkPermission(req.user, permission))) {
        hasAllPerms = false;
        break;
      }
    }

    if (!hasAllPerms) {
      return next(
        new AppError(
          `Access denied. Required all permissions: ${permissions.join(", ")}`,
          403
        )
      );
    }

    next();
  };
};

/**
 * Restrict to users with specific permissions or admin role
 * @param {string|string[]} permissions - Permission(s) required
 * @returns {Function} Express middleware function
 */
const restrictToPermission = (permissions) => {
  return async (req, res, next) => {
    if (!req.user) {
      return next(new AppError("Authentication required", 401));
    }

    // Check if user has admin role (backward compatibility)
    if (PermissionService.hasAdminRole(req.user)) {
      return next();
    }

    const permissionArray = Array.isArray(permissions)
      ? permissions
      : [permissions];
    let hasRequiredPermission = false;

    for (const permission of permissionArray) {
      if (await PermissionService.checkPermission(req.user, permission)) {
        hasRequiredPermission = true;
        break;
      }
    }

    if (!hasRequiredPermission) {
      return next(
        new AppError(
          `Access denied. Required permission: ${permissionArray.join(" or ")}`,
          403
        )
      );
    }

    next();
  };
};

/**
 * Enhanced logout middleware with session management
 * Blacklists token and handles session cleanup
 */
const enhancedLogout = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
    const sessionId = req.headers['x-session-id'] || req.body.session_id;
    const logoutAll = req.body.logout_all === true;

    if (logoutAll) {
      // Logout all devices - revoke all sessions and tokens for user
      if (req.user) {
        const sessionService = require("../services/session.service");
        const refreshTokenService = require("../services/refresh-token.service");
        
        await sessionService.revokeAllUserSessions(req.user.id);
        await refreshTokenService.revokeAllUserRefreshTokens(req.user.id);
        
        // Blacklist current token if provided
        if (token) {
          await tokenBlacklistService.blacklistToken(token, 'access', {
            reason: 'logout_all',
            userId: req.user.id
          });
        }
      }
    } else if (sessionId) {
      // Logout specific session
      const sessionService = require("../services/session.service");
      const refreshTokenService = require("../services/refresh-token.service");
      
      await sessionService.revokeSession(sessionId);
      await refreshTokenService.revokeSessionTokens(sessionId);
      
      // Blacklist current token if provided
      if (token) {
        await tokenBlacklistService.blacklistToken(token, 'access', {
          reason: 'logout',
          userId: req.user?.id,
          sessionId: sessionId
        });
      }
    } else if (token) {
      // Simple token blacklist
      await tokenBlacklistService.blacklistToken(token, 'access', {
        reason: 'logout',
        userId: req.user?.id
      });
    }

    // Clear JWT cookie if it exists
    if (req.cookies?.jwt) {
      res.clearCookie("jwt", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
      });
    }

    next();
  } catch (error) {
    logger.error("Enhanced logout middleware error:", error);
    // Don't block the logout process even if there's an error
    next();
  }
};

/**
 * Enhanced authentication middleware with refresh token validation
 * Combines protect with refresh token checking for enhanced security
 */
const enhancedAuth = async (req, res, next) => {
  try {
    // First, run the standard protect middleware
    await protect(req, res, async (err) => {
      if (err) {
        return next(err);
      }

      // Check for refresh token in body or headers
      const refreshToken = req.body.refresh_token || req.headers['x-refresh-token'];
      
      if (refreshToken) {
        try {
          const refreshTokenService = require("../services/refresh-token.service");
          const isValid = await refreshTokenService.validateRefreshToken(refreshToken);
          
          if (!isValid) {
            return next(new AppError("Invalid or expired refresh token", 401));
          }

          // Check if refresh token is blacklisted
          const isBlacklisted = await tokenBlacklistService.isTokenBlacklisted(refreshToken);
          if (isBlacklisted) {
            return next(new AppError("Refresh token has been invalidated", 401));
          }

          // Attach refresh token info to request
          req.refreshToken = refreshToken;
        } catch (tokenError) {
          return next(new AppError("Refresh token validation failed", 401));
        }
      }

      // Session tracking with enhanced validation
      const sessionId = req.headers['x-session-id'] || req.body.session_id;
      if (sessionId && req.user) {
        try {
          const { UserSession } = require("../models/user-session.model");
          const session = await UserSession.getSessionById(sessionId);
          
          if (session) {
            // Check if session is valid and belongs to the user
            if (!session.isValid()) {
              return next(new AppError("Session has expired", 401));
            }
            
            if (session.user_id !== req.user.id) {
              return next(new AppError("Session does not belong to user", 401));
            }

            // Check if session is revoked
            if (session.is_revoked) {
              return next(new AppError("Session has been revoked", 401));
            }

            // Update session activity
            await session.updateActivity();
            req.session = session;
          }
        } catch (sessionError) {
          logger.warn("Enhanced session validation failed:", sessionError);
          // Don't fail authentication if session tracking fails
        }
      }

      next();
    });
  } catch (error) {
    logger.error("Enhanced auth middleware error:", error);
    next(error);
  }
};

/**
 * Refresh token validation middleware
 * Validates refresh tokens without requiring access token
 */
const validateRefreshToken = async (req, res, next) => {
  try {
    const refreshToken = req.body.refresh_token || req.headers['x-refresh-token'];
    
    if (!refreshToken) {
      return next(new AppError("Refresh token is required", 401));
    }

    const refreshTokenService = require("../services/refresh-token.service");
    const isValid = await refreshTokenService.validateRefreshToken(refreshToken);

    if (!isValid) {
      return next(new AppError("Invalid or expired refresh token", 401));
    }

    // Check blacklist
    const isBlacklisted = await tokenBlacklistService.isTokenBlacklisted(refreshToken);
    if (isBlacklisted) {
      return next(new AppError("Refresh token has been invalidated", 401));
    }

    // Get token data
    const tokenData = await refreshTokenService.getRefreshTokenData(refreshToken);
    if (!tokenData) {
      return next(new AppError("Refresh token not found", 401));
    }

    // Attach token data to request
    req.refreshTokenData = tokenData;
    req.refreshToken = refreshToken;

    next();
  } catch (error) {
    logger.error("Refresh token validation middleware error:", error);
    next(new AppError("Refresh token validation failed", 401));
  }
};

/**
 * Session validation middleware
 * Validates session ID and ensures it belongs to the authenticated user
 */
const validateSession = async (req, res, next) => {
  try {
    const sessionId = req.headers['x-session-id'] || req.body.session_id;
    
    if (!sessionId) {
      return next(new AppError("Session ID is required", 400));
    }

    if (!req.user) {
      return next(new AppError("User authentication required", 401));
    }

    const { UserSession } = require("../models/user-session.model");
    const session = await UserSession.getSessionById(sessionId);

    if (!session) {
      return next(new AppError("Session not found", 404));
    }

    // Verify session belongs to authenticated user
    if (session.user_id !== req.user.id) {
      return next(new AppError("Session does not belong to user", 403));
    }

    // Check if session is valid
    if (!session.isValid()) {
      return next(new AppError("Session has expired", 401));
    }

    // Check if session is revoked
    if (session.is_revoked) {
      return next(new AppError("Session has been revoked", 401));
    }

    // Update session activity
    await session.updateActivity();

    // Attach session to request
    req.session = session;

    next();
  } catch (error) {
    logger.error("Session validation middleware error:", error);
    next(new AppError("Session validation failed", 500));
  }
};

/**
 * Rate limiting middleware for authentication endpoints
 * Prevents brute force attacks on auth routes
 */
const authRateLimit = async (req, res, next) => {
  try {
    const ip = req.ip || req.connection.remoteAddress;
    const identifier = req.body.email || ip;
    
    const rateLimitService = require("../services/rate-limit.service");
    const isAllowed = await rateLimitService.checkAuthRateLimit(identifier);
    
    if (!isAllowed) {
      return next(new AppError("Too many authentication attempts. Please try again later.", 429));
    }

    next();
  } catch (error) {
    logger.error("Rate limit middleware error:", error);
    // Don't block request if rate limiting fails
    next();
  }
};

module.exports = {
  localAuth,
  protect,
  restrictTo,
  isLoggedIn,
  isLoggedOut,
  isAdmin,
  isCustomer,
  isVendor,
  hasRole,
  hasAnyRole,
  hasAllRoles,
  isOwnerOrAdmin,
  loadPermissions,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  restrictToPermission,
  setUser,
  enhancedLogout,
  enhancedAuth,
  validateRefreshToken,
  validateSession,
  authRateLimit,
};
