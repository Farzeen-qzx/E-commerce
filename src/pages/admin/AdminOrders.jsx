import { useState } from "react";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { getAdminOrders, updateOrderStatus } from "../../api/orderApi";

import AdminSidebar from "../../components/admin/AdminSidebar";

function AdminOrders() {
  const queryClient = useQueryClient();

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("newest");

  const ordersPerPage = 5;

  // Fetch Orders
  const { data, isPending, isError } = useQuery({
    queryKey: ["adminOrders"],
    queryFn: getAdminOrders,
  });

  // Update Order Status
  const statusMutation = useMutation({
    mutationFn: updateOrderStatus,

    onSuccess: function () {
      queryClient.invalidateQueries({
        queryKey: ["adminOrders"],
      });
    },
  });

  // Handle Status Change
  function handleStatusChange(id, status) {
    statusMutation.mutate({
      id: id,
      status: status,
    });
  }

  // Loading
  if (isPending) {
    return <p className="p-6 lg:p-8">Loading orders...</p>;
  }

  // Error
  if (isError) {
    return <p className="p-6 lg:p-8 text-red-600">Failed to load orders.</p>;
  }

  const orders = data || [];

  // Filter Orders
  const filteredOrders = orders.filter(function (item) {
    const customerName = item.customer?.fullName || "";
    const customerEmail = item.customer?.email || "";
    const orderId = String(item.id || "");

    const matchesSearch =
      customerName.toLowerCase().includes(search.toLowerCase()) ||
      customerEmail.toLowerCase().includes(search.toLowerCase()) ||
      orderId.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "All" || item.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Sort Orders
  const sortedOrders = [...filteredOrders].sort(function (a, b) {
    if (sortBy === "newest") {
      return new Date(b.createdAt) - new Date(a.createdAt);
    }

    if (sortBy === "oldest") {
      return new Date(a.createdAt) - new Date(b.createdAt);
    }

    if (sortBy === "highest") {
      return Number(b.total || 0) - Number(a.total || 0);
    }

    if (sortBy === "lowest") {
      return Number(a.total || 0) - Number(b.total || 0);
    }

    return 0;
  });

  // Pagination
  const totalPages = Math.ceil(sortedOrders.length / ordersPerPage);

  const startIndex = (currentPage - 1) * ordersPerPage;

  const currentOrders = sortedOrders.slice(
    startIndex,
    startIndex + ordersPerPage,
  );

  // Status Options
  const statusOptions = [
    "All",
    "Pending",
    "Processing",
    "Shipped",
    "Delivered",
    "Cancelled",
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col lg:flex-row">
      <AdminSidebar />

      <div className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8">
        {/* Header */}

        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold">Manage Orders</h1>

          <p className="text-gray-500 mt-2">View and manage customer orders.</p>
        </div>

        {/* Summary Cards */}

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5 mb-6">
          <div className="bg-white p-5 rounded-xl shadow">
            <p className="text-gray-500">Total Orders</p>

            <h2 className="text-2xl font-bold mt-2">{orders.length}</h2>
          </div>

          <div className="bg-white p-5 rounded-xl shadow">
            <p className="text-gray-500">Pending Orders</p>

            <h2 className="text-2xl font-bold mt-2 text-yellow-600">
              {
                orders.filter(function (item) {
                  return item.status === "Pending";
                }).length
              }
            </h2>
          </div>

          <div className="bg-white p-5 rounded-xl shadow sm:col-span-2 xl:col-span-1">
            <p className="text-gray-500">Delivered Orders</p>

            <h2 className="text-2xl font-bold mt-2 text-green-700">
              {
                orders.filter(function (item) {
                  return item.status === "Delivered";
                }).length
              }
            </h2>
          </div>
        </div>

        {/* Search */}

        <div className="bg-white p-4 rounded-xl shadow mb-6">
          <input
            type="text"
            placeholder="Search by order ID, customer name or email..."
            value={search}
            onChange={function (event) {
              setSearch(event.target.value);
              setCurrentPage(1);
            }}
            className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Status Filters */}

        <div className="flex flex-wrap gap-2 sm:gap-3 mb-6">
          {statusOptions.map(function (status) {
            return (
              <button
                key={status}
                onClick={function () {
                  setStatusFilter(status);
                  setCurrentPage(1);
                }}
                className={`px-3 sm:px-5 py-2 rounded-lg font-medium text-sm sm:text-base transition ${
                  statusFilter === status
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-200"
                }`}
              >
                {status === "All" ? "All Orders" : status}
              </button>
            );
          })}
        </div>

        {/* Sorting */}

        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
          <h2 className="text-xl font-semibold">Orders List</h2>

          <select
            value={sortBy}
            onChange={function (event) {
              setSortBy(event.target.value);
              setCurrentPage(1);
            }}
            className="border rounded-lg p-3 bg-white w-full sm:w-auto"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="highest">Highest Amount</option>
            <option value="lowest">Lowest Amount</option>
          </select>
        </div>

        {/* Mutation Error */}

        {statusMutation.isError && (
          <p className="text-red-600 mb-4">Failed to update order status.</p>
        )}

        {/* Orders Table */}

        <div className="bg-white rounded-xl shadow overflow-x-auto">
          <table className="w-full min-w-[1100px] text-left">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-4">Order ID</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Email</th>
                <th className="p-4">Products</th>
                <th className="p-4">Total</th>
                <th className="p-4">Payment</th>
                <th className="p-4">Status</th>
                <th className="p-4">Date</th>
                <th className="p-4">Action</th>
              </tr>
            </thead>

            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center p-12">
                    <h3 className="text-xl font-semibold text-gray-700">
                      No Orders Available
                    </h3>

                    <p className="text-gray-500 mt-2">
                      No customers have placed orders yet.
                    </p>
                  </td>
                </tr>
              ) : sortedOrders.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center p-12">
                    <h3 className="text-xl font-semibold text-gray-700">
                      No Matching Orders
                    </h3>

                    <p className="text-gray-500 mt-2">
                      No orders match your search or selected filter.
                    </p>

                    <button
                      onClick={function () {
                        setSearch("");
                        setStatusFilter("All");
                        setCurrentPage(1);
                      }}
                      className="bg-blue-600 text-white px-5 py-2 rounded-lg mt-4"
                    >
                      Clear Filters
                    </button>
                  </td>
                </tr>
              ) : (
                currentOrders.map(function (item) {
                  return (
                    <tr key={item.id} className="border-t">
                      <td className="p-4 font-medium">#{item.id}</td>

                      <td className="p-4">
                        {item.customer?.fullName || "N/A"}
                      </td>

                      <td className="p-4 break-all">
                        {item.customer?.email || "N/A"}
                      </td>

                      <td className="p-4">{item.products?.length || 0}</td>

                      <td className="p-4 font-semibold">₹{item.total}</td>

                      <td className="p-4">
                        {item.customer?.paymentMethod === "cod"
                          ? "Cash on Delivery"
                          : item.customer?.paymentMethod === "online"
                            ? "Online Payment"
                            : "N/A"}
                      </td>

                      <td className="p-4">
                        <select
                          value={item.status || "Pending"}
                          onChange={function (event) {
                            handleStatusChange(item.id, event.target.value);
                          }}
                          disabled={statusMutation.isPending}
                          className="border rounded-lg p-2 disabled:opacity-50"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Processing">Processing</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>

                      <td className="p-4">
                        {item.createdAt
                          ? new Date(item.createdAt).toLocaleDateString()
                          : "N/A"}
                      </td>

                      <td className="p-4">
                        <button
                          onClick={function () {
                            setSelectedOrder(item);
                          }}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 whitespace-nowrap"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}

        {sortedOrders.length > 0 && (
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mt-6">
            <p className="text-gray-600 text-sm sm:text-base">
              Showing {startIndex + 1} to{" "}
              {Math.min(startIndex + ordersPerPage, sortedOrders.length)} of{" "}
              {sortedOrders.length} orders
            </p>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={function () {
                  setCurrentPage(currentPage - 1);
                }}
                disabled={currentPage === 1}
                className="px-3 sm:px-4 py-2 bg-white rounded-lg border disabled:opacity-40"
              >
                Previous
              </button>

              {Array.from({ length: totalPages }, function (_, index) {
                return index + 1;
              }).map(function (page) {
                return (
                  <button
                    key={page}
                    onClick={function () {
                      setCurrentPage(page);
                    }}
                    className={`px-3 sm:px-4 py-2 rounded-lg ${
                      currentPage === page
                        ? "bg-blue-600 text-white"
                        : "bg-white border hover:bg-gray-100"
                    }`}
                  >
                    {page}
                  </button>
                );
              })}

              <button
                onClick={function () {
                  setCurrentPage(currentPage + 1);
                }}
                disabled={currentPage === totalPages}
                className="px-3 sm:px-4 py-2 bg-white rounded-lg border disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Order Details Modal */}

        {selectedOrder && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 sm:p-4">
            <div className="bg-white w-full max-w-2xl rounded-xl p-4 sm:p-6 shadow-xl max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}

              <div className="flex justify-between items-center gap-3 mb-6">
                <h2 className="text-xl sm:text-2xl font-bold break-all">
                  Order Details #{selectedOrder.id}
                </h2>

                <button
                  onClick={function () {
                    setSelectedOrder(null);
                  }}
                  className="text-gray-500 text-2xl shrink-0"
                >
                  &times;
                </button>
              </div>

              {/* Customer Information */}

              <h3 className="font-bold text-lg mb-3">Customer Information</h3>

              <div className="space-y-2 mb-6 break-words">
                <p>
                  <strong>Name:</strong>{" "}
                  {selectedOrder.customer?.fullName || "N/A"}
                </p>

                <p>
                  <strong>Email:</strong>{" "}
                  {selectedOrder.customer?.email || "N/A"}
                </p>

                <p>
                  <strong>Phone:</strong>{" "}
                  {selectedOrder.customer?.phone || "N/A"}
                </p>

                <p>
                  <strong>Address:</strong>{" "}
                  {selectedOrder.customer?.address || "N/A"}
                </p>
              </div>

              {/* Ordered Products */}

              <h3 className="font-bold text-lg mb-3">Ordered Products</h3>

              <div className="space-y-3 mb-6">
                {(selectedOrder.products || []).map(function (product, index) {
                  return (
                    <div
                      key={product.id || index}
                      className="border rounded-lg p-3 flex justify-between items-start gap-3"
                    >
                      <div className="min-w-0">
                        <p className="font-medium break-words">
                          {product.name || "Product"}
                        </p>

                        <p className="text-gray-500 text-sm">
                          Quantity: {product.quantity || 1}
                        </p>
                      </div>

                      <p className="font-semibold shrink-0">
                        ₹{product.price || 0}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Payment Information */}

              <h3 className="font-bold text-lg mb-3">Payment Information</h3>

              <div className="space-y-2 mb-6">
                <p>
                  <strong>Payment Method:</strong>{" "}
                  {selectedOrder.customer?.paymentMethod === "cod"
                    ? "Cash on Delivery"
                    : selectedOrder.customer?.paymentMethod === "online"
                      ? "Online Payment"
                      : "N/A"}
                </p>

                <p>
                  <strong>Subtotal:</strong> ₹{selectedOrder.subtotal || 0}
                </p>

                <p>
                  <strong>Delivery Charge:</strong> ₹
                  {selectedOrder.deliveryCharge || 0}
                </p>

                <p className="text-lg font-bold">
                  Total: ₹{selectedOrder.total || 0}
                </p>
              </div>

              {/* Order Status */}

              <p className="mb-6">
                <strong>Order Status:</strong>{" "}
                {selectedOrder.status || "Pending"}
              </p>

              {/* Close Button */}

              <button
                onClick={function () {
                  setSelectedOrder(null);
                }}
                className="w-full bg-gray-900 text-white py-3 rounded-lg hover:bg-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminOrders;
