import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

// Fetch wishlist for a particular user
export async function fetchWishlist(userId) {
  const response = await axios.get(`${API_URL}/wishlist?userId=${userId}`);

  return response.data;
}

// Add product to wishlist
export async function addWishlistItem(userId, product) {
  const wishlistData = {
    userId: userId,
    productId: product.id,
    name: product.name,
    category: product.category,
    price: product.price,
    rating: product.rating,
    image: product.image,
  };

  const response = await axios.post(`${API_URL}/wishlist`, wishlistData);

  return response.data;
}

// Remove product from wishlist
export async function removeWishlistItem(wishlistId) {
  const response = await axios.delete(`${API_URL}/wishlist/${wishlistId}`);

  return response.data;
}
