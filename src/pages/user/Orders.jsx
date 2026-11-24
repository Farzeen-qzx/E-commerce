import { useState } from "react";
import { useSelector } from "react-redux";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchOrders, cancelOrder } from "../../api/orderApi";

function Orders() {

    const user = useSelector(function(state) {
        return state.auth.user;
    });

    const queryClient = useQueryClient();

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 4;

    // Fetch orders
    const { data = [], isLoading, isError } = useQuery({
        queryKey: ["orders", user?.id],
        queryFn: function() {
            return fetchOrders(user.id);
        },
        enabled: !!user?.id
    });

    // Pagination calculations
    const totalPages = Math.ceil(data.length / itemsPerPage);

    const startIndex = (currentPage - 1) * itemsPerPage;

    const endIndex = startIndex + itemsPerPage;

    const currentOrders = data.slice(startIndex, endIndex);

    // Cancel order
    const cancelMutation = useMutation({
        mutationFn: cancelOrder,

        onSuccess: function() {
            queryClient.invalidateQueries({
                queryKey: ["orders", user.id]
            });
        }
    });

    function handleCancel(orderId) {

        const confirmCancel = window.confirm(
            "Are you sure you want to cancel this order?"
        );

        if (confirmCancel) {
            cancelMutation.mutate(orderId);
        }
    }

    // Previous Page
    function handlePrevious() {

        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }

    }

    // Next Page
    function handleNext() {

        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }

    }

    if (!user) {
        return (
            <div className="min-h-screen flex justify-center items-center">
                <h2 className="text-xl font-semibold">
                    Please login to view your orders.
                </h2>
            </div>
        );
    }

    // Loading
    if (isLoading) {
        return (
            <div className="min-h-screen flex justify-center items-center">
                <h2 className="text-xl font-semibold text-green-800">
                    Loading your orders...
                </h2>
            </div>
        );
    }

    // Error
    if (isError) {
        return (
            <div className="text-center py-20">
                <h2 className="text-xl text-red-600 font-semibold">
                    Failed to load orders.
                </h2>
            </div>
        );
    }

    return (

        <div className="min-h-screen bg-gray-50 py-12 px-6">

            <div className="max-w-5xl mx-auto">

                {/* Page Heading */}

                <div className="mb-10">

                    <h1 className="text-4xl font-bold text-green-900">
                        My Orders
                    </h1>

                    <p className="text-gray-500 mt-2">
                        Track and manage all your TrailNest orders.
                    </p>

                </div>

                {/* Empty Orders */}

                {data.length === 0 ? (

                    <div className="bg-white rounded-2xl shadow-sm p-12 text-center">

                        <h2 className="text-2xl font-bold text-gray-800">
                            No Orders Yet!
                        </h2>

                        <p className="text-gray-500 mt-3">
                            You haven't placed any orders yet. Start exploring our trekking collection.
                        </p>

                    </div>

                ) : (

                    <>

                        {/* Orders List */}

                        <div className="space-y-7">

                            {currentOrders.map(function(order) {

                                return (

                                    <div
                                        key={order.id}
                                        className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition"
                                    >

                                        {/* Order Header */}

                                        <div className="flex flex-wrap justify-between items-center gap-4 bg-green-50 px-6 py-5">

                                            <div>

                                                <p className="text-sm text-gray-500">
                                                    Order ID
                                                </p>

                                                <h3 className="font-bold text-green-900 text-lg">
                                                    #{order.id}
                                                </h3>

                                            </div>

                                            <div>

                                                <p className="text-sm text-gray-500">
                                                    Order Date
                                                </p>

                                                <p className="font-semibold text-gray-800">
                                                    {new Date(order.createdAt).toLocaleDateString()}
                                                </p>

                                            </div>

                                            <div>

                                                <span
                                                    className={`px-4 py-2 rounded-full text-sm font-bold ${
                                                        order.status === "Cancelled"
                                                            ? "bg-red-100 text-red-700"
                                                            : order.status === "Processing"
                                                            ? "bg-orange-100 text-orange-700"
                                                            : order.status === "Delivered"
                                                            ? "bg-green-100 text-green-700"
                                                            : "bg-yellow-100 text-yellow-700"
                                                    }`}
                                                >
                                                    {order.status}
                                                </span>

                                            </div>

                                        </div>

                                        {/* Order Products */}

                                        <div className="p-6">

                                            <h3 className="font-bold text-gray-800 text-lg mb-4">
                                                Ordered Products
                                            </h3>

                                            <div className="space-y-4">

                                                {order.products.map(function(product, index) {

                                                    return (

                                                        <div
                                                            key={index}
                                                            className="flex justify-between items-center border-b border-gray-100 pb-4"
                                                        >

                                                            <div>

                                                                <p className="font-semibold text-gray-800">
                                                                    {product.name}
                                                                </p>

                                                                <p className="text-sm text-gray-500">
                                                                    Quantity: {product.quantity}
                                                                </p>

                                                            </div>

                                                        </div>

                                                    );

                                                })}

                                            </div>

                                            {/* Order Total */}

                                            <div className="flex justify-between items-center mt-6 pt-4 border-t">

                                                <span className="text-gray-600 font-medium">
                                                    Total Amount
                                                </span>

                                                <span className="text-2xl font-bold text-green-800">
                                                    ₹{order.total}
                                                </span>

                                            </div>

                                            {/* Cancel Button */}

                                            {(order.status === "Pending" ||
                                              order.status === "Processing") && (

                                                <div className="mt-6 flex justify-end">

                                                    <button
                                                        onClick={function() {
                                                            handleCancel(order.id);
                                                        }}
                                                        disabled={cancelMutation.isPending}
                                                        className="bg-red-600 text-white px-7 py-3 rounded-xl font-bold shadow-md hover:bg-red-700 hover:shadow-lg active:scale-95 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        {cancelMutation.isPending
                                                            ? "Cancelling..."
                                                            : "✕ Cancel Order"}
                                                    </button>

                                                </div>

                                            )}

                                        </div>

                                    </div>

                                );

                            })}

                        </div>

                        {/* Pagination */}

                        {totalPages > 1 && (

                            <div className="flex justify-center items-center gap-3 mt-10">

                                <button
                                    onClick={handlePrevious}
                                    disabled={currentPage === 1}
                                    className="px-4 py-2 bg-green-800 text-white rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed"
                                >
                                    Previous
                                </button>

                                {Array.from(
                                    { length: totalPages },
                                    function(_, index) {

                                        return (

                                            <button
                                                key={index}
                                                onClick={function() {
                                                    setCurrentPage(index + 1);
                                                }}
                                                className={`px-4 py-2 rounded-lg ${
                                                    currentPage === index + 1
                                                        ? "bg-green-800 text-white"
                                                        : "bg-gray-200 text-gray-800"
                                                }`}
                                            >
                                                {index + 1}
                                            </button>

                                        );

                                    }
                                )}

                                <button
                                    onClick={handleNext}
                                    disabled={currentPage === totalPages}
                                    className="px-4 py-2 bg-green-800 text-white rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed"
                                >
                                    Next
                                </button>

                            </div>

                        )}

                    </>

                )}

            </div>

        </div>

    );

}

export default Orders;