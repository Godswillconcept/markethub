import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "react-hot-toast";
import { CartProvider } from "./Features/cart";
import { AuthProvider } from "./Features/authentication/AuthContext.jsx";
import { NotificationProvider } from "./contexts/NotificationContext.jsx";
import { Suspense, lazy } from "react";
import Spinner from "./ui/Spinner.jsx";

// Layouts
import MainLayout from "./layouts/MainLayout.jsx";
import DashboardLayout from "./Features/dashboardFeature/DashboardLayout.jsx";

// Lazy Loaded Components
// Auth Pages
import SignupPage from "./pages/SignupPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import ForgotPasswordPage from "./pages/ForgotPasswordPage.jsx";
import SetUpPasswordPage from "./pages/SetUpPasswordPage.jsx";
import CheckEmailPage from "./pages/CheckEmailPage.jsx";
import EmailVerification from "./Features/authentication/EmailVerification.jsx";

// Main Pages
import LandingPage from "./pages/LandingPage.jsx";
import ProductsPage from "./Features/productFeatures/ProductsPage.jsx";
import ProductDetailPage from "./Features/productFeatures/ProductDetailPage.jsx";
import CategoryPage from "./Features/productFeatures/CategoryPage.jsx";
import JournalPage from "./pages/JournalPage.jsx";
import VendorPage from "./pages/VendorPage.jsx";
import VendorDetailsPage from "./pages/VendorDetailsPage.jsx";
import VendorFormPage from "./pages/VendorFormPage.jsx";

// Cart
import CartPage from "./pages/CartPage.jsx";
import Cart from "./Features/cart/Cart.jsx";
import CartSummary from "./Features/cart/CartSummary.jsx";
import PaymentSummary from "./Features/cart/PaymentSummary.jsx";
import PaymentVerificationPage from "./Features/cart/PaymentVerificationPage.jsx";

// Dashboard
import ProfilePage from "./pages/dashBoard/ProfilePage.jsx";
import NotificationsListPage from "./pages/dashBoard/NotificationsListPage.jsx";
import PasswordPage from "./pages/dashBoard/PasswordPage.jsx";
import OrderPage from "./pages/dashBoard/OrderPage.jsx";
import OrderDetailPage from "./Features/dashboardFeature/OrderDetailPage.jsx";
import PendingReviewsPage from "./pages/dashBoard/PendingReviewsPage.jsx";
import PendingRateReviewsPage from "./pages/dashBoard/PendingRateReviewsPage.jsx";
import RecentPage from "./pages/dashBoard/RecentPage.jsx";
import AddressesPage from "./pages/dashBoard/AddressesPage.jsx";
import NewAddressPage from "./Features/dashboardFeature/NewAddressPage.jsx";
import FollowedPage from "./pages/dashBoard/FollowedPage.jsx";
import WishListPage from "./pages/dashBoard/WishListPage.jsx";
import SupportPage from "./pages/dashBoard/SupportPage.jsx";

// Utils
import ProtectedRoute from "./Features/authentication/ProtectedRoute.jsx";
import EditAddressPage from "./Features/dashboardFeature/EditAddressPage.jsx";
// import SearchMain from "./Features/productFeatures/SearchMain";
// import SearchLayout from "./layouts/SearchLayout";

// Admin Imports (These are still imported directly to be used inside AdminLayout route children,
// to fully lazy load admin children they should also be lazy loaded, but starting with the Layout)
import AdminDashboard from "./Features/admin/dashboard/AdminDashboard.jsx";
import VendorsApplication from "./Features/admin/vendorApplication/VendorsApplication.jsx";
import ApplicantDetail from "./Features/admin/vendorApplication/ApplicantDetail.jsx";
import VendorList from "./Features/admin/vendorList/VendorList.jsx";
import VendorDetailPage from "./Features/admin/vendorList/VendorDetailPage.jsx";
import VendorProducts from "./Features/admin/vendorProduct/VendorProducts.jsx";
import UsersList from "./Features/admin/adminUsers/UsersList.jsx";
import AdminUsersDetailPage from "./Features/admin/adminUsers/AdminUsersDetailPage.jsx";
import AdminVendorProductDetail from "./Features/admin/vendorProduct/AdminVendorProductDetail.jsx";
import AdminProductCollection from "./Features/admin/collections/AdminProductCollection.jsx";
import CollectionDetail from "./Features/admin/collections/CollectionDetail.jsx";
import OrdersList from "./Features/admin/orders/OrdersList.jsx";
import OrderDetail from "./Features/admin/orders/OrderDetail.jsx";
import Earnings from "./Features/admin/adminVendorEarnings/Earnings.jsx";
import Feedback from "./Features/admin/FeedBack.jsx";
import FeedbackDetail from "./Features/admin/FeedbackDetail.jsx";
import AdminNotification from "./Features/admin/AdminNotification.jsx";
import SubAdmin from "./Features/admin/subAdmin/SubAdmin.jsx";
import SubAdminDetails from "./Features/admin/subAdmin/SubAdminDetails.jsx";
import AdminJournal from "./Features/admin/AdminJournal.jsx";
import AdminJournalDetail from "./Features/admin/AdminJournalDetail.jsx";
import JournalDetailPage from "./pages/JournalDetailPage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";

// Lazy Loaded Components
const AuthLayout = lazy(
  () => import("./Features/authentication/AuthLayout.jsx"),
);
const AdminLayout = lazy(() => import("./Features/admin/AdminLayout.jsx"));
const VendorDashboardPage = lazy(
  () => import("./pages/VendorDashboardPage.jsx"),
);
const VendorDashboard = lazy(
  () => import("./Features/vendorFeature/VendorDashboard.jsx"),
);
const VendorEarningPage = lazy(() => import("./pages/VendorEarningPage.jsx"));
const VendorProfile = lazy(
  () => import("./Features/vendorFeature/VendorProfile.jsx"),
);
const VendorProductDetail = lazy(
  () => import("./Features/vendorFeature/VendorProductDetail.jsx"),
);

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ReactQueryDevtools initialIsOpen={false} />
      <BrowserRouter>
        <AuthProvider>
          <NotificationProvider>
            <CartProvider>
              <Suspense fallback={<Spinner />}>
                <Routes>
                  {/* index/landing page */}
                  <Route index element={<LandingPage />} />
                  {/* authentication pages Start */}
                  <Route element={<AuthLayout />}>
                    <Route path="signup" element={<SignupPage />} />
                    <Route path="login" element={<LoginPage />} />
                    <Route
                      path="forgot-password"
                      element={<ForgotPasswordPage />}
                    />
                    <Route path="check-email" element={<CheckEmailPage />} />
                    <Route
                      path="reset-password/:reset_token"
                      element={<SetUpPasswordPage />}
                    />
                    <Route path="verify-email" element={<EmailVerification />} />
                  </Route>
                  {/* authentication pages End */}

                  {/* Admin Routes Start - Protected with admin role */}
                  <Route
                    element={
                      <ProtectedRoute requiredRole="admin">
                        <AdminLayout />
                      </ProtectedRoute>
                    }
                  >
                    <Route path="/admin/dashboard" element={<AdminDashboard />} />
                    <Route
                      path="/admin/applications"
                      element={<VendorsApplication />}
                    />
                    <Route
                      path="/admin/applications/:id"
                      element={<ApplicantDetail />}
                    />
                    <Route path="/admin/vendors" element={<VendorList />} />
                    <Route path="/admin/users" element={<UsersList />} />
                    <Route
                      path="/admin/users/:id"
                      element={<AdminUsersDetailPage />}
                    />
                    <Route
                      path="/admin/vendors/:id"
                      element={<VendorDetailPage />}
                    />
                    <Route
                      path="/admin/vendor-products"
                      element={<VendorProducts />}
                    />
                    <Route
                      path="/admin/vendor-products/:productId"
                      element={<AdminVendorProductDetail />}
                    />
                    <Route path="/admin/orders" element={<OrdersList />} />
                    <Route path="/admin/orders/:id" element={<OrderDetail />} />
                    <Route path="/admin/earnings" element={<Earnings />} />
                    <Route path="/admin/feedbacks" element={<Feedback />} />
                    <Route
                      path="/admin/feedback/:id"
                      element={<FeedbackDetail />}
                    />
                    <Route
                      path="/admin/notifications"
                      element={<AdminNotification />}
                    />
                    <Route path="/admin/sub-admins" element={<SubAdmin />} />
                    <Route
                      path="/admin/sub-admins/:id"
                      element={<SubAdminDetails />}
                    />
                    <Route path="/admin/journals" element={<AdminJournal />} />
                    <Route
                      path="/admin/journals/:journalId"
                      element={<AdminJournalDetail />}
                    />
                    <Route
                      path="/admin/collections"
                      element={<AdminProductCollection />}
                    />
                    <Route
                      path="/admin/collections/:id"
                      element={<CollectionDetail />}
                    />
                  </Route>
                  {/* Admin Routes End - Protected with admin role */}

                  {/* Product pages with MainLayout Start */}
                  <Route element={<MainLayout />}>
                    <Route path="/products" element={<ProductsPage />} />

                    {/* Category routes with nested product routes */}
                    <Route path="/categories">
                      <Route path=":categoryId">
                        <Route index element={<CategoryPage />} />
                        <Route
                          path="products"
                          element={<CategoryPage showAllProducts />}
                        />
                      </Route>
                    </Route>
                  </Route>
                  {/* Product pages with MainLayout End */}

                  {/* Other public pages Start */}
                  <Route path="/products/:slug" element={<ProductDetailPage />} />
                  <Route path="/landing" element={<LandingPage />} />
                  <Route path="/journals" element={<JournalPage />} />
                  <Route path="/journals/:slug" element={<JournalDetailPage />} />
                  <Route path="/vendor/apply" element={<VendorFormPage />} />
                  <Route path="/vendors" element={<VendorPage />} />
                  <Route
                    path="/vendor/:vendorId"
                    element={<VendorDetailsPage />}
                  />

                  {/* cart pages */}
                  <Route path="/cart" element={<CartPage />}>
                    <Route index element={<Cart />} />
                    <Route path="summary" element={<CartSummary />} />
                    <Route path="payment" element={<PaymentSummary />} />
                    <Route path="verify" element={<PaymentVerificationPage />} />
                    <Route
                      path="verify/:reference"
                      element={<PaymentVerificationPage />}
                    />
                  </Route>

                  {/* Other public pages End */}

                  {/* Vendor Dashboard - Protected with vendor role Start */}
                  <Route
                    path="/vendor/dashboard"
                    element={
                      <ProtectedRoute requiredRole="vendor">
                        <VendorDashboardPage />
                      </ProtectedRoute>
                    }
                  >
                    <Route index element={<VendorDashboard />} />

                    {/* Product routes */}
                    <Route path="products">
                      <Route index element={<VendorDashboard />} />
                      <Route
                        path=":productId"
                        element={<VendorProductDetail />}
                      />
                    </Route>

                    {/* Earnings */}
                    <Route path="earnings" element={<VendorEarningPage />} />

                    {/* Profile */}
                    <Route path="profile" element={<VendorProfile />} />
                  </Route>
                  {/* Vendor Dashboard - Protected with vendor role End */}

                  {/* Dashboard - Protected for authenticated users Start */}
                  <Route
                    path="/settings"
                    element={
                      <ProtectedRoute>
                        <DashboardLayout />
                      </ProtectedRoute>
                    }
                  >
                    <Route path="profile" element={<ProfilePage />} />
                    <Route path="notifications" element={<NotificationsListPage />} />
                    <Route path="password" element={<PasswordPage />} />
                  </Route>

                  {/* Order routes - specific before general */}
                  <Route
                    path="orders/:orderId"
                    element={
                      <ProtectedRoute>
                        <OrderDetailPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="orders"
                    element={
                      <ProtectedRoute>
                        <OrderPage />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="pending-reviews"
                    element={
                      <ProtectedRoute>
                        <PendingReviewsPage />
                      </ProtectedRoute>
                    }
                  >
                    <Route path=":productId" element={<PendingRateReviewsPage />} />
                  </Route>

                  <Route
                    path="recent"
                    element={
                      <ProtectedRoute>
                        <RecentPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="addresses"
                    element={
                      <ProtectedRoute>
                        <AddressesPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="addresses/new"
                    element={
                      <ProtectedRoute>
                        <NewAddressPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="addresses/edit/:id"
                    element={
                      <ProtectedRoute>
                        <EditAddressPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="followed"
                    element={
                      <ProtectedRoute>
                        <FollowedPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="wishlist"
                    element={
                      <ProtectedRoute>
                        <WishListPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="support"
                    element={
                      <ProtectedRoute>
                        <SupportPage />
                      </ProtectedRoute>
                    }
                  />
                  {/* Dashboard - Protected for authenticated users End */}

                  {/* Not Found Route */}
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </Suspense>
            </CartProvider>
          </NotificationProvider>
        </AuthProvider>
        <Toaster />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
