import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { adminLogout } from "../../features/adminAuth/adminAuthSlice";
import AdminSidebar from "../../components/admin/AdminSidebar";

import { getAdminProducts } from "../../services/adminProductService";
import { getAdminUsers } from "../../services/adminUserService";
import { getAdminOrders } from "../../api/orderApi";

// Extract arrays from different API response formats
function getArrayData(response, key) {

    if (Array.isArray(response)) {
        return response;
    }

    if (Array.isArray(response?.data)) {
        return response.data;
    }

    if (Array.isArray(response?.[key])) {
        return response[key];
    }

    if (Array.isArray(response?.data?.[key])) {
        return response.data[key];
    }

    return [];

}

function Dashboard() {

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const admin = useSelector(function(state) {
        return state.adminAuth.admin;
    });

    // Fetch Products
    const {
        data: products = [],
        isLoading: productsLoading,
        isError: productsError,
        error: productsQueryError
    } = useQuery({

        queryKey: ["adminProducts", "dashboard-v2"],

        queryFn: async function() {

            const response = await getAdminProducts();

            console.log("Products API Response:", response.data);

            return getArrayData(response, "products");

        }

    });

    // Fetch Users
    const {
        data: users = [],
        isLoading: usersLoading,
        isError: usersError,
        error: usersQueryError
    } = useQuery({

        queryKey: ["adminUsers", "dashboard-v2"],

        queryFn: async function() {

            const response = await getAdminUsers();

            return getArrayData(response, "users");

        }

    });

    // Fetch Orders
    const {
        data: orders = [],
        isLoading: ordersLoading,
        isError: ordersError,
        error: ordersQueryError
    } = useQuery({

        queryKey: ["adminOrders", "dashboard-v2"],

        queryFn: async function() {

            const response = await getAdminOrders();

            return getArrayData(response, "orders");

        }

    });

    // Logout
function handleLogout() {

    dispatch(adminLogout());

    navigate("/login", {
        replace: true
    });

}

    // Dashboard Calculations

    const totalProducts = products.length;

    const totalUsers = users.length;

    const totalOrders = orders.length;

    // Revenue from delivered orders only
    const deliveredOrders = orders.filter(function(order) {

        return order.status === "Delivered";

    });

    const totalRevenue = deliveredOrders.reduce(function(total, order) {

        return total + Number(order.total || 0);

    }, 0);

    // Latest 5 Orders
    const recentOrders = [...orders]
        .sort(function(a, b) {

            return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);

        })
        .slice(0, 5);

    // Low Stock Products (5 or fewer)
    const lowStockProducts = products.filter(function(product) {

        return Number(product.stock || 0) <= 5;

    });

    const isLoading = productsLoading || usersLoading || ordersLoading;

    return (

        <div className="min-h-screen bg-gray-100 flex flex-col lg:flex-row">

            {/* Sidebar */}
            <AdminSidebar />

            {/* Main Section */}
            <div className="flex-1 min-w-0">

                {/* Header */}
                <header className="bg-white shadow px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">

                    <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
                        Admin Dashboard
                    </h1>

                    <div className="flex flex-wrap items-center gap-3 sm:gap-5 w-full sm:w-auto">

                        <span className="text-sm sm:text-base text-gray-600 break-all">
                            {admin?.email}
                        </span>

                        <button
                            onClick={handleLogout}
                            className="bg-red-600 text-white px-4 sm:px-5 py-2 rounded-lg hover:bg-red-700 whitespace-nowrap"
                        >
                            Logout
                        </button>

                    </div>

                </header>

                {/* Dashboard Content */}
                <main className="p-4 sm:p-6 lg:p-8">

                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">
                        Welcome to TrailNest
                    </h2>

                    <p className="text-gray-600 mt-3 mb-8">
                        Manage your products, users and orders from here.
                    </p>

                    {/* Loading */}
                    {isLoading && (
                        <p className="text-blue-600 font-semibold mb-5">
                            Loading dashboard data...
                        </p>
                    )}

                    {/* API Errors */}
                    {productsError && (
                        <p className="text-red-600 font-semibold mb-3">
                            Products Error: {productsQueryError.message}
                        </p>
                    )}

                    {usersError && (
                        <p className="text-red-600 font-semibold mb-3">
                            Users Error: {usersQueryError.message}
                        </p>
                    )}

                    {ordersError && (
                        <p className="text-red-600 font-semibold mb-3">
                            Orders Error: {ordersQueryError.message}
                        </p>
                    )}

                    {/* Statistics Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">

                        {/* Total Products */}
                        <div className="bg-white p-4 sm:p-6 rounded-xl shadow">

                            <h3 className="text-gray-500 font-medium">
                                Total Products
                            </h3>

                            <p className="text-3xl font-bold text-blue-600 mt-3">
                                {productsLoading ? "..." : totalProducts}
                            </p>

                        </div>

                        {/* Total Users */}
                        <div className="bg-white p-4 sm:p-6 rounded-xl shadow">

                            <h3 className="text-gray-500 font-medium">
                                Total Users
                            </h3>

                            <p className="text-3xl font-bold text-green-600 mt-3">
                                {usersLoading ? "..." : totalUsers}
                            </p>

                        </div>

                        {/* Total Orders */}
                        <div className="bg-white p-4 sm:p-6 rounded-xl shadow">

                            <h3 className="text-gray-500 font-medium">
                                Total Orders
                            </h3>

                            <p className="text-3xl font-bold text-purple-600 mt-3">
                                {ordersLoading ? "..." : totalOrders}
                            </p>

                        </div>

                        {/* Delivered Revenue */}
                        <div className="bg-white p-4 sm:p-6 rounded-xl shadow">

                            <h3 className="text-gray-500 font-medium">
                                Delivered Revenue
                            </h3>

                            <p className="text-2xl sm:text-3xl font-bold text-orange-600 mt-3 break-words">
                                {ordersLoading
                                    ? "..."
                                    : `₹${totalRevenue.toLocaleString("en-IN")}`
                                }
                            </p>

                        </div>

                    </div>

                    {/* Recent Orders and Low Stock */}
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 mt-8">

                        {/* Recent Orders */}
                        <div className="bg-white p-4 sm:p-6 rounded-xl shadow min-w-0">

                            <h3 className="text-xl font-bold text-gray-800 mb-5">
                                Recent Orders
                            </h3>

                            {ordersLoading ? (

                                <p>Loading orders...</p>

                            ) : ordersError ? (

                                <p className="text-red-600">
                                    Unable to load orders.
                                </p>

                            ) : recentOrders.length === 0 ? (

                                <p className="text-gray-500">
                                    No orders available.
                                </p>

                            ) : (

                                <div className="overflow-x-auto">

                                    <table className="w-full min-w-[500px] text-left">

                                        <thead>
                                            <tr className="border-b text-gray-500">

                                                <th className="py-3">Order ID</th>
                                                <th className="py-3">Customer</th>
                                                <th className="py-3">Total</th>
                                                <th className="py-3">Status</th>

                                            </tr>
                                        </thead>

                                        <tbody>

                                            {recentOrders.map(function(order) {

                                                return (

                                                    <tr
                                                        key={order.id}
                                                        className="border-b"
                                                    >

                                                        <td className="py-3">
                                                            #{order.id}
                                                        </td>

                                                        <td className="py-3">
                                                            {order.customer?.fullName || "Unknown"}
                                                        </td>

                                                        <td className="py-3">
                                                            ₹{Number(order.total || 0).toLocaleString("en-IN")}
                                                        </td>

                                                        <td className="py-3">
                                                            {order.status}
                                                        </td>

                                                    </tr>

                                                );

                                            })}

                                        </tbody>

                                    </table>

                                </div>

                            )}

                        </div>

                        {/* Low Stock Products */}
                        <div className="bg-white p-4 sm:p-6 rounded-xl shadow min-w-0">

                            <h3 className="text-xl font-bold text-gray-800 mb-5">
                                Low Stock Products
                            </h3>

                            {productsLoading ? (

                                <p>Loading products...</p>

                            ) : productsError ? (

                                <p className="text-red-600">
                                    Unable to load products.
                                </p>

                            ) : lowStockProducts.length === 0 ? (

                                <p className="text-green-600">
                                    All products have sufficient stock.
                                </p>

                            ) : (

                                <div className="space-y-4">

                                    {lowStockProducts.map(function(product) {

                                        return (

                                            <div
                                                key={product.id}
                                                className="flex flex-wrap justify-between items-center gap-3 border-b pb-3"
                                            >

                                                <div className="min-w-0">

                                                    <p className="font-medium text-gray-800 break-words">
                                                        {product.name}
                                                    </p>

                                                    <p className="text-sm text-gray-500">
                                                        Product ID: {product.id}
                                                    </p>

                                                </div>

                                                <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-semibold whitespace-nowrap">
                                                    {product.stock || 0} left
                                                </span>

                                            </div>

                                        );

                                    })}

                                </div>

                            )}

                        </div>

                    </div>

                </main>

            </div>

        </div>

    );

}

export default Dashboard;