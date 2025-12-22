/**
 * Check if a user has a specific role
 * @param {Object} user - The user object from useUser
 * @param {string|string[]} requiredRole - The role(s) to check for
 * @returns {boolean} - Whether the user has the required role(s)
 */
export const hasRole = (user, requiredRole) => {
    if (!user) return false;

    // Handle both flat and nested user structures
    const roles = user.roles || user.user?.roles;

    if (!roles) return false;

    const userRoles = roles.map(role => typeof role === 'object' ? role.name : role);

    if (Array.isArray(requiredRole)) {
        return requiredRole.some(role => userRoles.includes(role));
    }

    return userRoles.includes(requiredRole);
};

/**
 * Check if user is authenticated
 * @param {Object} user - The user object from useUser
 * @returns {boolean} - Whether the user is authenticated
 */
export const isAuthenticated = (user) => {
    return !!user?.user?.id;
};
