
import { useEffect } from "react";

import {
    Route,
    Routes,
    useLocation,
    useNavigate
} from "react-router-dom";

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

    // Clear toast message after 3 seconds
    useEffect(function() {

        if (!message) {
            return;
        }

        const timer = setTimeout(function() {

            navigate(location.pathname, {
                replace: true,
                state: null
            });

        }, 3000);

        return function() {
            clearTimeout(timer);
        };

    }, [message, location.pathname, navigate]);

    return (
        <>

            {!isAdminRoute && <Navbar />}

            {/* Toast Notification */}

            {message && (

                <div className="fixed top-5 right-5 z-[100] space-y-3">

                    <div className="bg-green-800 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-pulse">

                        <span className="text-xl">
                            ✓
                        </span>

                        <p className="font-medium">
                            {message}
                        </p>

                    </div>

                </div>

            )}

            <Routes>

                {/* User Routes */}

                <Route
                    path="/"
                    element={<Home />}
                />

                <Route
                    path="/products"
                    element={<Products />}
                />

                <Route
                    path="/products/:id"
                    element={<ProductDetails />}
                />

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

                <Route
                    path="/order-confirmation"
                    element={<OrderConfirmation />}
                />

                <Route
                    path="/wishlist"
                    element={
                        <ProtectedRoute>
                            <Wishlist />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/register"
                    element={<Register />}
                />

                <Route
                    path="/login"
                    element={<Login />}
                />

                {/* Admin Routes */}

                <Route
                    path="/admin/dashboard"
                    element={
                        <AdminProtectedRoute>
                            <Dashboard />
                        </AdminProtectedRoute>
                    }
                />

                <Route
                    path="/admin/products"
                    element={
                        <AdminProtectedRoute>
                            <AdminProducts />
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
