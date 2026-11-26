import { useEffect } from "react";
import { Toaster, toast } from "react-hot-toast";

import { Route, Routes, useLocation, useNavigate } from "react-router-dom";

// User Pages
import Home from "./pages/user/Home";
import Products from "./pages/user/Products";
import ProductDetails from "./pages/user/ProductDetails";
import Cart from "./pages/user/Cart";
import Checkout from "./pages/user/Checkout";
import OrderConfirmation from "./pages/user/OrderConfirmation";
import Orders from "./pages/user/Orders";
import Wishlist from "./pages/user/Wishlist";
import Register from "./pages/user/Register";
import Login from "./pages/user/Login";
import Profile from "./pages/user/profile";

// Admin Pages
import Dashboard from "./pages/admin/Dashboard";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminProductDetails from "./pages/admin/AdminProductDetails";
import AdminTrash from "./pages/admin/AdminTrash";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminOrders from "./pages/admin/AdminOrders";

// Components
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminProtectedRoute from "./components/admin/AdminProtectedRoute";
import Footer from "./components/Footer";

function App() {
  const location = useLocation();
  const navigate = useNavigate();

  const message = location.state?.toastMessage || "";

  const isAdminRoute = location.pathname.startsWith("/admin");

  // Show React Hot Toast Notification
  useEffect(
    function () {
      if (!message) {
        return;
      }

      toast.success(message, {
        id: `route-toast-${location.key}`,
      });

      // Clear notification message from route state
      navigate(location.pathname, {
        replace: true,
        state: null,
      });
    },
    [message, location.pathname, location.key, navigate],
  );

  return (
    <>
      {/* React Hot Toast */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
        }}
      />

      {!isAdminRoute && <Navbar />}

      <Routes>
        {/* User Routes */}

        <Route path="/" element={<Home />} />

        <Route path="/products" element={<Products />} />

        <Route path="/products/:id" element={<ProductDetails />} />

        <Route
          path="/cart"
          element={
            <ProtectedRoute>
              <Cart />
            </ProtectedRoute>
          }
        />

        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <Checkout />
            </ProtectedRoute>
          }
        />

        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <Orders />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route path="/order-confirmation" element={<OrderConfirmation />} />

        <Route
          path="/wishlist"
          element={
            <ProtectedRoute>
              <Wishlist />
            </ProtectedRoute>
          }
        />

        <Route path="/register" element={<Register />} />

        <Route path="/login" element={<Login />} />

        {/* Admin Routes */}

        <Route
          path="/admin/dashboard"
          element={
            <AdminProtectedRoute>
              <Dashboard />
            </AdminProtectedRoute>
          }
        />

        {/* Admin Products */}
        <Route
          path="/admin/products"
          element={
            <AdminProtectedRoute>
              <AdminProducts />
            </AdminProtectedRoute>
          }
        />

        {/* Admin Product Details */}
        <Route
          path="/admin/products/:id"
          element={
            <AdminProtectedRoute>
              <AdminProductDetails />
            </AdminProtectedRoute>
          }
        />

        <Route
          path="/admin/trash"
          element={
            <AdminProtectedRoute>
              <AdminTrash />
            </AdminProtectedRoute>
          }
        />

        <Route
          path="/admin/users"
          element={
            <AdminProtectedRoute>
              <AdminUsers />
            </AdminProtectedRoute>
          }
        />

        <Route
          path="/admin/orders"
          element={
            <AdminProtectedRoute>
              <AdminOrders />
            </AdminProtectedRoute>
          }
        />
      </Routes>

      {!isAdminRoute && <Footer />}
    </>
  );
}

export default App;
