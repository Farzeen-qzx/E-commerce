import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

// Fetch orders belonging to a user
export async function fetchOrders(userId) {
  const response = await axios.get(`${API_URL}/orders?userId=${userId}`);

  return response.data;
}

// Cancel an order
export async function cancelOrder(orderId) {
  const response = await axios.patch(`${API_URL}/orders/${orderId}`, {
    status: "Cancelled",
  });

  return response.data;
}

// Admin: Fetch all orders
export async function getAdminOrders() {
  const response = await axios.get(`${API_URL}/orders`);

  return response.data;
}

// Admin: Update order status
export async function updateOrderStatus({ id, status }) {
  const response = await axios.patch(`${API_URL}/orders/${id}`, {
    status: status,
  });

  return response.data;
}
