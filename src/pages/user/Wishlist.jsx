import { useState } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";

import {
    useQuery,
    useMutation,
    useQueryClient
} from "@tanstack/react-query";

import { useNavigate } from "react-router-dom";

import {
    fetchWishlist,
    removeWishlistItem
} from "../../api/wishlistApi";

import useCart from "../../hooks/useCart";

function Wishlist() {

    const navigate = useNavigate();

    const queryClient = useQueryClient();

    const { addToCart } = useCart();

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 4;

    // Get logged-in user from Redux
    const user = useSelector(function(state) {
        return state.auth.user;
    });

    // Fetch wishlist using TanStack Query
    const {
        data: wishlist = [],
        isLoading,
        isError,
        error
    } = useQuery({

        queryKey: ["wishlist", user?.id],

        queryFn: function() {
            return fetchWishlist(user.id);
        },

        enabled: !!user?.id

    });

    // Pagination calculations
    const totalPages = Math.ceil(wishlist.length / itemsPerPage);

    const startIndex = (currentPage - 1) * itemsPerPage;

    const endIndex = startIndex + itemsPerPage;

    const currentProducts = wishlist.slice(startIndex, endIndex);

    // Remove wishlist mutation
    const removeMutation = useMutation({

        mutationFn: function(wishlistId) {
            return removeWishlistItem(wishlistId);
        },

        onSuccess: function() {

            queryClient.invalidateQueries({
                queryKey: ["wishlist", user.id]
            });

            toast.success("Product removed from wishlist!");

        },

        onError: function() {

            toast.error("Failed to remove product from wishlist.");

        }

    });

    // Remove product from wishlist
    function handleRemove(product) {

        removeMutation.mutate(product.id);

    }

    // Add product to cart
    function handleAddToCart(product) {

        addToCart({
            id: product.productId,
            name: product.name,
            category: product.category,
            price: product.price,
            rating: product.rating,
            image: product.image
        });

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

    // Not logged in
    if (!user) {

        return (

            <div className="min-h-screen flex flex-col items-center justify-center">

                <h2 className="text-2xl font-bold">
                    Please login to view your wishlist.
                </h2>

                <button
                    onClick={function() {
                        navigate("/login");
                    }}
                    className="bg-green-800 text-white px-6 py-3 rounded-full mt-5"
                >
                    Login
                </button>

            </div>

        );

    }

    // Loading
    if (isLoading) {

        return (

            <div className="min-h-screen flex items-center justify-center">

                <h2 className="text-xl font-semibold">
                    Loading wishlist...
                </h2>

            </div>

        );

    }

    // Error
    if (isError) {

        return (

            <div className="min-h-screen flex items-center justify-center">

                <p className="text-red-600">
                    Error: {error.message}
                </p>

            </div>

        );

    }

    return (

        <section className="min-h-screen bg-gray-50 py-12 px-6">

            <div className="max-w-7xl mx-auto">

                <h1 className="text-4xl font-bold text-center mb-10">
                    My Wishlist
                </h1>

                {/* Empty Wishlist */}

                {wishlist.length === 0 ? (

                    <div className="text-center py-20">

                        <p className="text-xl text-gray-500">
                            Your wishlist is empty.
                        </p>

                        <button
                            onClick={function() {
                                navigate("/products");
                            }}
                            className="bg-green-800 text-white px-6 py-3 rounded-full mt-6"
                        >
                            Explore Products
                        </button>

                    </div>

                ) : (

                    <>

                        {/* Wishlist Products */}

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">

                            {currentProducts.map(function(product) {

                                return (

                                    <div
                                        key={product.id}
                                        className="bg-white rounded-2xl shadow-md overflow-hidden"
                                    >

                                        <img
                                            src={product.image}
                                            alt={product.name}
                                            className="w-full h-56 object-contain p-4"
                                        />

                                        <div className="p-5">

                                            <p className="text-sm text-green-700">
                                                {product.category}
                                            </p>

                                            <h2 className="text-xl font-bold mt-2">
                                                {product.name}
                                            </h2>

                                            <p className="text-lg font-bold text-green-800 mt-3">
                                                ₹{product.price}
                                            </p>

                                            <p className="text-yellow-500 mt-2">
                                                ⭐ {product.rating}
                                            </p>

                                            {/* Add to Cart */}

                                            <button
                                                onClick={function() {
                                                    handleAddToCart(product);
                                                }}
                                                className="w-full bg-green-800 text-white py-3 rounded-full mt-5 hover:bg-green-900"
                                            >
                                                Add to Cart
                                            </button>

                                            {/* Remove from Wishlist */}

                                            <button
                                                onClick={function() {
                                                    handleRemove(product);
                                                }}
                                                disabled={removeMutation.isPending}
                                                className="w-full border border-red-500 text-red-500 py-3 rounded-full mt-3 hover:bg-red-50 disabled:opacity-50"
                                            >
                                                Remove from Wishlist
                                            </button>

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

        </section>

    );

}

export default Wishlist;