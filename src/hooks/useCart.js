
import {
    useQuery,
    useMutation,
    useQueryClient
} from "@tanstack/react-query";

import { useSelector } from "react-redux";

import axios from "axios";

import {
    fetchCart,
    addCartItem,
    updateCartItem,
    removeCartItem,
    clearUserCart
} from "../api/cartApi";


function useCart() {

    const queryClient = useQueryClient();

    const user = useSelector(function(state) {
        return state.auth.user;
    });

    const API_URL = import.meta.env.VITE_API_URL;


    // FETCH CART

    const cartQuery = useQuery({

        queryKey: ["cart", user?.id],

        queryFn: async function() {

            const response = await fetchCart(user.id);

            return response.data;
        },

        enabled: Boolean(user?.id)
    });


    // ADD TO CART

    const addMutation = useMutation({

        mutationFn: async function(product) {

            if (!user?.id) {
                throw new Error("Please login to add products to cart.");
            }

            // Get latest product information

            const productResponse = await axios.get(
                `${API_URL}/products/${product.id}`
            );

            const latestProduct = productResponse.data;


            // Check whether product is in Trash

            if (latestProduct.isDeleted === true) {
                throw new Error("This product is no longer available.");
            }


            // Check stock

            if (latestProduct.stock <= 0) {
                throw new Error("This product is out of stock.");
            }


            // Get current cart

            const currentCart = await fetchCart(user.id);

            const existingProduct = currentCart.data.find(function(item) {

                return String(item.productId) === String(product.id);
            });


            if (existingProduct) {

                if (existingProduct.quantity >= latestProduct.stock) {

                    throw new Error(
                        "You cannot add more than the available stock."
                    );
                }

                return updateCartItem(existingProduct.id, {

                    quantity: existingProduct.quantity + 1

                });
            }


            // Add new cart item

            return addCartItem({

                userId: user.id,

                productId: latestProduct.id,

                name: latestProduct.name,

                category: latestProduct.category,

                price: latestProduct.price,

                rating: latestProduct.rating,

                imageKey: latestProduct.imageKey,

                image: latestProduct.image || "",

                quantity: 1

            });
        },


        onSuccess: function() {

            queryClient.invalidateQueries({

                queryKey: ["cart", user.id]

            });
        }
    });



    // UPDATE QUANTITY

    const updateMutation = useMutation({

        mutationFn: async function(data) {

            if (data.quantity < 1) {

                throw new Error("Quantity must be at least 1.");
            }


            // Get current cart

            const currentCart = await fetchCart(user.id);

            const cartItem = currentCart.data.find(function(item) {

                return String(item.id) === String(data.id);
            });


            if (!cartItem) {

                throw new Error("Cart item not found.");
            }


            // Get latest product information

            const productResponse = await axios.get(

                `${API_URL}/products/${cartItem.productId}`

            );

            const latestProduct = productResponse.data;


            // Check whether product is in Trash

            if (latestProduct.isDeleted === true) {

                throw new Error(
                    "This product has been moved to Trash and is unavailable."
                );
            }


            // Check stock

            if (data.quantity > latestProduct.stock) {

                throw new Error(

                    "Only " + latestProduct.stock + " items are available."

                );
            }


            return updateCartItem(data.id, {

                quantity: data.quantity

            });
        },


        onSuccess: function() {

            queryClient.invalidateQueries({

                queryKey: ["cart", user.id]

            });
        }
    });



    // REMOVE FROM CART

    const removeMutation = useMutation({

        mutationFn: removeCartItem,

        onSuccess: function() {

            queryClient.invalidateQueries({

                queryKey: ["cart", user.id]

            });
        }
    });



    // CLEAR CART

    const clearMutation = useMutation({

        mutationFn: function() {

            return clearUserCart(user.id);
        },

        onSuccess: function() {

            queryClient.invalidateQueries({

                queryKey: ["cart", user.id]

            });
        }
    });



    // RETURN CART FUNCTIONS

    return {

        cart: cartQuery.data || [],

        isLoading: cartQuery.isLoading,

        isError: cartQuery.isError,

        addToCart: addMutation.mutate,

        updateQuantity: updateMutation.mutate,

        removeFromCart: removeMutation.mutate,

        clearCart: clearMutation.mutate

    };

}


export default useCart;
