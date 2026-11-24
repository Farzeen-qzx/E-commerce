
import { useState } from "react";
import { useSelector } from "react-redux";

import {
    useQuery,
    useMutation,
    useQueryClient
} from "@tanstack/react-query";

import { useParams, useNavigate } from "react-router-dom";

import {
    SiNike,
    SiAdidas,
    SiPuma
} from "react-icons/si";

import { fetchProducts } from "../../api/productApi";

import {
    fetchWishlist,
    addWishlistItem,
    removeWishlistItem
} from "../../api/wishlistApi";

import useCart from "../../hooks/useCart";


// Brand Logos
const brandLogos = {
    Nike: SiNike,
    Adidas: SiAdidas,
    Puma: SiPuma
};


const images = import.meta.glob("../assets/*.png", {
    eager: true,
    query: "?url",
    import: "default"
});


function getProductImages(product) {

    const views = {
        Front: "",
        Side: "",
        Back: ""
    };

    const imageKey = String(product.imageKey || "").toLowerCase();

    if (!imageKey) {
        return views;
    }

    Object.keys(images).forEach(function(path) {

        const filename = path.split("/").pop().toLowerCase();

        if (filename.includes(imageKey)) {

            if (filename.startsWith("front")) {
                views.Front = images[path];
            }

            else if (filename.startsWith("side")) {
                views.Side = images[path];
            }

            else if (filename.startsWith("back")) {
                views.Back = images[path];
            }
        }
    });

    return views;
}


function ProductDetails() {

    const { id } = useParams();

    const navigate = useNavigate();

    const queryClient = useQueryClient();

    const { addToCart } = useCart();


    const user = useSelector(function(state) {
        return state.auth.user;
    });


    const [selectedView, setSelectedView] = useState("Front");

    const [message, setMessage] = useState("");


    // Fetch products
    const {
        data: products = [],
        isLoading,
        isError
    } = useQuery({

        queryKey: ["products"],

        queryFn: async function() {

            const response = await fetchProducts();

            return response.data;
        }
    });


    // Fetch wishlist
    const { data: wishlist = [] } = useQuery({

        queryKey: ["wishlist", user?.id],

        queryFn: function() {

            return fetchWishlist(user.id);
        },

        enabled: !!user?.id
    });


    // Find selected product
    // Exclude products moved to Trash

    const product = products.find(function(item) {

        return String(item.id) === id && item.isDeleted !== true;
    });


    // Add wishlist mutation
    const addWishlistMutation = useMutation({

        mutationFn: function(product) {

            return addWishlistItem(user.id, product);
        },

        onSuccess: function() {

            queryClient.invalidateQueries({
                queryKey: ["wishlist", user.id]
            });

            setMessage("Product added to wishlist!");
        }
    });


    // Remove wishlist mutation
    const removeWishlistMutation = useMutation({

        mutationFn: function(wishlistId) {

            return removeWishlistItem(wishlistId);
        },

        onSuccess: function() {

            queryClient.invalidateQueries({
                queryKey: ["wishlist", user.id]
            });

            setMessage("Product removed from wishlist!");
        }
    });


    // Loading state
    if (isLoading) {

        return (
            <div className="min-h-screen flex items-center justify-center">

                <p className="text-xl font-semibold">
                    Loading product details...
                </p>

            </div>
        );
    }


    // Error state
    if (isError) {

        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4">

                <p className="text-red-500 text-xl">
                    Failed to load product details.
                </p>

                <button
                    onClick={function() {
                        navigate("/products");
                    }}
                    className="bg-green-700 text-white px-5 py-2 rounded-lg"
                >
                    Back to Products
                </button>

            </div>
        );
    }


    // Product not found or moved to Trash
    if (!product) {

        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4">

                <h2 className="text-2xl font-bold">
                    Product Not Found
                </h2>

                <p className="text-gray-500">
                    This product is unavailable or has been removed.
                </p>

                <button
                    onClick={function() {
                        navigate("/products");
                    }}
                    className="bg-green-700 text-white px-5 py-2 rounded-lg"
                >
                    Back to Products
                </button>

            </div>
        );
    }


    // Get product images
    const views = getProductImages(product);

    const availableViews = Object.keys(views).filter(function(view) {
        return !!views[view];
    });

    const currentImage = views[selectedView] || views.Front || views.Side || views.Back;


    // Get brand logo
    const BrandLogo = brandLogos[product.brand];


    // Check wishlist
    const isWishlisted = wishlist.some(function(item) {

        return String(item.productId) === String(product.id);
    });


    // Add to cart
    function handleAddToCart() {

        if (!user) {

            alert("Please login to add products to your cart.");

            navigate("/login");

            return;
        }


        if (product.stock <= 0) {

            setMessage("Sorry, this product is out of stock.");

            return;
        }


        addToCart(product, {

            onSuccess: function() {

                setMessage("Product added to cart successfully!");
            },

            onError: function(error) {

                setMessage(error.message || "Unable to add product to cart.");
            }
        });
    }


    // Add or remove wishlist
    function handleWishlist() {

        if (!user) {

            alert("Please login to add products to your wishlist.");

            navigate("/login");

            return;
        }


        const exists = wishlist.find(function(item) {

            return String(item.productId) === String(product.id);
        });


        if (exists) {

            removeWishlistMutation.mutate(exists.id);
        }

        else {

            addWishlistMutation.mutate(product);
        }
    }


    return (

        <section className="min-h-screen bg-gray-50 px-4 py-10">

            <div className="max-w-6xl mx-auto">


                {/* Back Button */}

                <button
                    onClick={function() {
                        navigate("/products");
                    }}
                    className="mb-8 text-green-700 font-semibold hover:underline"
                >
                    ← Back to Products
                </button>


                {/* Message */}

                {message && (

                    <div className="mb-5 p-3 bg-green-100 text-green-800 rounded-lg">

                        {message}

                    </div>
                )}


                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 bg-white p-6 md:p-10 rounded-2xl shadow">


                    {/* Product Images */}

                    <div>

                        <div className="bg-gray-100 rounded-xl p-6 flex items-center justify-center min-h-[400px]">

                            {currentImage ? (

                                <img
                                    src={currentImage}
                                    alt={product.name}
                                    className="w-full max-h-[400px] object-contain"
                                />

                            ) : (

                                <p className="text-gray-500">
                                    Image not available
                                </p>

                            )}

                        </div>


                        {/* Image View Buttons */}

                        <div className="flex gap-3 mt-5 justify-center">

                            {availableViews.map(function(view) {

                                return (

                                    <button
                                        key={view}
                                        onClick={function() {
                                            setSelectedView(view);
                                        }}
                                        className={`px-5 py-2 rounded-lg border ${
                                            selectedView === view
                                                ? "bg-green-700 text-white"
                                                : "bg-white text-gray-700"
                                        }`}
                                    >
                                        {view}
                                    </button>

                                );
                            })}

                        </div>

                    </div>



                    {/* Product Information */}

                    <div className="flex flex-col justify-center">


                        {/* Category */}

                        <p className="text-green-700 font-semibold uppercase tracking-wide">
                            {product.category}
                        </p>


                        {/* Brand Logo and Name */}

                        <div className="flex items-center gap-3 mt-3">

                            {BrandLogo && (
                                <BrandLogo size={30} />
                            )}

                            <p className="text-gray-600 font-semibold">
                                {product.brand || "Brand not specified"}
                            </p>

                        </div>


                        {/* Product Name */}

                        <h1 className="text-3xl md:text-4xl font-bold mt-3 text-gray-900">
                            {product.name}
                        </h1>


                        {/* Rating */}

                        <div className="mt-4 flex items-center gap-2">

                            <span className="text-yellow-500 text-xl">
                                ★
                            </span>

                            <span className="font-semibold">
                                {product.rating}
                            </span>

                            <span className="text-gray-500">
                                / 5
                            </span>

                        </div>


                        {/* Price */}

                        <p className="text-3xl font-bold text-green-700 mt-6">
                            ₹{product.price}
                        </p>


                        {/* Stock */}

                        <div className="mt-5">

                            {product.stock > 0 ? (

                                <p className="text-green-600 font-semibold">
                                    In Stock ({product.stock} available)
                                </p>

                            ) : (

                                <p className="text-red-600 font-semibold">
                                    Out of Stock
                                </p>

                            )}

                        </div>


                        {/* Description */}

                        <div className="mt-7">

                            <h2 className="text-xl font-bold text-gray-900 mb-3">
                                Product Description
                            </h2>

                            <p className="text-gray-600 leading-7">
                                {product.description || "No description available."}
                            </p>

                        </div>


                        {/* Buttons */}

                        <div className="flex flex-col sm:flex-row gap-4 mt-8">


                            <button
                                onClick={handleAddToCart}
                                disabled={product.stock <= 0}
                                className="flex-1 bg-green-700 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-800 disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                                Add to Cart
                            </button>


                            <button
                                onClick={handleWishlist}
                                disabled={addWishlistMutation.isPending || removeWishlistMutation.isPending}
                                className="flex-1 border border-green-700 text-green-700 py-3 px-6 rounded-lg font-semibold hover:bg-green-50 disabled:opacity-50"
                            >
                                {isWishlisted
                                    ? "♥ Remove from Wishlist"
                                    : "♡ Add to Wishlist"}
                            </button>


                        </div>


                    </div>


                </div>

            </div>

        </section>

    );
}


export default ProductDetails;
