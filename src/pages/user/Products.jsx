
import { useState } from "react";
import { useSelector } from "react-redux";

import {
    useQuery,
    useMutation,
    useQueryClient
} from "@tanstack/react-query";

import { useNavigate, useSearchParams } from "react-router-dom";

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


// Automatically import PNG images from src/assets
const images = import.meta.glob("../../assets/*.png", {
    eager: true,
    query: "?url",
    import: "default"
});


// Find product images
function getProductImages(product) {

    const views = {
        Front: "",
        Side: "",
        Back: ""
    };

    const imageKey = String(product.imageKey || "").toLowerCase();

    Object.keys(images).forEach(function(path) {

        const filename = path.split("/").pop().toLowerCase();

        if (filename.includes(imageKey) && imageKey !== "") {

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


function Products() {

    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { addToCart } = useCart();


    // Read category from URL
    const [searchParams, setSearchParams] = useSearchParams();

    const category = searchParams.get("category") || "All";


    // Selected brand
    const [selectedBrand, setSelectedBrand] = useState("All");


    // Logged-in user
    const user = useSelector(function(state) {
        return state.auth.user;
    });


    // States
    const [search, setSearch] = useState("");

    const [message, setMessage] = useState("");
    const [wishlistMessage, setWishlistMessage] = useState("");


    // Pagination and Sorting States
    const [currentPage, setCurrentPage] = useState(1);

    const itemsPerPage = 6;

    const [sortOrder, setSortOrder] = useState("");


    // Fetch products
    const {
        data: products = [],
        isLoading,
        isError,
        error
    } = useQuery({

        queryKey: ["products"],

        queryFn: async function() {

            const response = await fetchProducts();

            return response.data;

        }

    });


    // Fetch wishlist
    const {
        data: wishlist = []
    } = useQuery({

        queryKey: ["wishlist", user?.id],

        queryFn: function() {
            return fetchWishlist(user.id);
        },

        enabled: !!user?.id

    });


    // Add wishlist mutation
    const addWishlistMutation = useMutation({

        mutationFn: function(product) {

            return addWishlistItem(user.id, product);

        },

        onSuccess: function(data, product) {

            setWishlistMessage(product.name + " added to wishlist!");

            queryClient.invalidateQueries({
                queryKey: ["wishlist", user.id]
            });

            setTimeout(function() {
                setWishlistMessage("");
            }, 2000);

        },

        onError: function() {

            setWishlistMessage("Unable to add product to wishlist.");

            setTimeout(function() {
                setWishlistMessage("");
            }, 2000);

        }

    });


    // Remove wishlist mutation
    const removeWishlistMutation = useMutation({

        mutationFn: function(item) {

            return removeWishlistItem(item.wishlistId);

        },

        onSuccess: function(data, item) {

            setWishlistMessage(item.productName + " removed from wishlist!");

            queryClient.invalidateQueries({
                queryKey: ["wishlist", user.id]
            });

            setTimeout(function() {
                setWishlistMessage("");
            }, 2000);

        },

        onError: function() {

            setWishlistMessage("Unable to remove product from wishlist.");

            setTimeout(function() {
                setWishlistMessage("");
            }, 2000);

        }

    });


    // Show only active products
    const activeProducts = Array.isArray(products)
        ? products.filter(function(product) {
            return product.isDeleted !== true;
        })
        : [];


    // Attach images to active products
    const productsWithImages = activeProducts.map(function(product) {

        const views = getProductImages(product);

        return {
            ...product,
            views: views,
            image: views.Front || views.Side || views.Back || ""
        };

    });


    // Search, Category and Brand Filter
    const filteredProducts = productsWithImages.filter(function(product) {

        const matchesSearch = String(product.name || "")
            .toLowerCase()
            .includes(search.toLowerCase());

        const matchesCategory =
            category.toLowerCase() === "all" ||
            String(product.category || "").toLowerCase() === category.toLowerCase();

        const matchesBrand =
            selectedBrand === "All" ||
            String(product.brand || "").toLowerCase() === selectedBrand.toLowerCase();

        return matchesSearch && matchesCategory && matchesBrand;

    });


    // Price Sorting
    const sortedProducts = [...filteredProducts].sort(function(a, b) {

        if (sortOrder === "low-to-high") {
            return Number(a.price) - Number(b.price);
        }

        if (sortOrder === "high-to-low") {
            return Number(b.price) - Number(a.price);
        }

        return 0;

    });


    // Pagination
    const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);

    const startIndex = (currentPage - 1) * itemsPerPage;

    const endIndex = startIndex + itemsPerPage;

    const currentProducts = sortedProducts.slice(startIndex, endIndex);


    // Add to Cart
    function handleAddToCart(product) {

        if (!user) {

            alert("Please login to add products to your cart.");

            navigate("/login");

            return;

        }


        if (product.stock <= 0) {

            setMessage("Sorry, this product is out of stock.");

            setTimeout(function() {
                setMessage("");
            }, 2000);

            return;

        }


        addToCart(product, {

            onSuccess: function() {

                setMessage(product.name + " added to cart successfully!");

                setTimeout(function() {
                    setMessage("");
                }, 2000);

            },

            onError: function(error) {

                setMessage(error.message || "Unable to add product to cart.");

                setTimeout(function() {
                    setMessage("");
                }, 2000);

            }

        });

    }


    // Add or Remove Wishlist
    function handleWishlist(product) {

        if (!user) {

            alert("Please login to add products to your wishlist.");

            navigate("/login");

            return;

        }


        const exists = wishlist.find(function(item) {

            return String(item.productId) === String(product.id);

        });


        if (exists) {

            removeWishlistMutation.mutate({
                wishlistId: exists.id,
                productName: product.name
            });

        }

        else {

            addWishlistMutation.mutate(product);

        }

    }


    // Check Wishlist
    function isWishlisted(product) {

        return wishlist.some(function(item) {

            return String(item.productId) === String(product.id);

        });

    }


    // Loading State
    if (isLoading) {

        return (

            <div className="min-h-screen flex items-center justify-center">

                <h2 className="text-2xl font-semibold text-green-800">
                    Loading products...
                </h2>

            </div>

        );

    }


    // Error State
    if (isError) {

        return (

            <div className="min-h-screen flex items-center justify-center">

                <h2 className="text-xl font-semibold text-red-600">
                    Error: {error.message}
                </h2>

            </div>

        );

    }


    return (

        <section className="bg-gray-50 min-h-screen py-12 px-6">

            <div className="max-w-7xl mx-auto">

                {/* Heading */}

                <h1 className="text-4xl font-bold text-center text-gray-900">
                    Outdoor Essentials
                </h1>

                <p className="text-center text-gray-500 mt-3">
                    Discover everything you need for your next adventure.
                </p>


                {/* Search */}

                <div className="flex justify-center mt-8">

                    <input
                        type="text"
                        placeholder="Search products..."
                        value={search}
                        onChange={function(e) {

                            setSearch(e.target.value);
                            setCurrentPage(1);

                        }}
                        className="w-full max-w-md border border-gray-300 rounded-full px-5 py-3 outline-none focus:ring-2 focus:ring-green-700"
                    />

                </div>


                {/* Categories */}

                <div className="flex justify-center flex-wrap gap-4 mt-6">

                    {["All", "Trekking", "Camping", "Hiking"].map(function(item) {

                        return (

                            <button
                                key={item}
                                onClick={function() {

                                    setCurrentPage(1);

                                    if (item === "All") {
                                        setSearchParams({});
                                    }

                                    else {
                                        setSearchParams({
                                            category: item
                                        });
                                    }

                                }}
                                className={`px-6 py-2 rounded-full font-medium transition ${
                                    category.toLowerCase() === item.toLowerCase()
                                        ? "bg-green-800 text-white"
                                        : "bg-white text-gray-700 border hover:bg-green-100"
                                }`}
                            >
                                {item}
                            </button>

                        );

                    })}

                </div>


                {/* Brand Filter */}

                <div className="mt-6">

                    <p className="text-center text-gray-700 font-semibold mb-3">
                        Shop by Brand
                    </p>

                    <div className="flex justify-center flex-wrap gap-4">

                        {["All", "Nike", "Adidas", "Puma"].map(function(brand) {

                            const BrandLogo = brandLogos[brand];

                            return (

                                <button
                                    key={brand}
                                    onClick={function() {

                                        setSelectedBrand(brand);
                                        setCurrentPage(1);

                                    }}
                                    className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition ${
                                        selectedBrand === brand
                                            ? "bg-green-800 text-white"
                                            : "bg-white text-gray-700 border hover:bg-green-100"
                                    }`}
                                >

                                    {BrandLogo && <BrandLogo size={24} />}

                                    {brand === "All" ? "All Brands" : brand}

                                </button>

                            );

                        })}

                    </div>

                </div>


                {/* Price Sorting */}

                <div className="flex justify-end mt-8">

                    <select
                        value={sortOrder}
                        onChange={function(e) {

                            setSortOrder(e.target.value);
                            setCurrentPage(1);

                        }}
                        className="border border-gray-300 rounded-lg px-4 py-3 bg-white outline-none focus:ring-2 focus:ring-green-700"
                    >

                        <option value="">
                            Sort by Price
                        </option>

                        <option value="low-to-high">
                            Price: Low to High
                        </option>

                        <option value="high-to-low">
                            Price: High to Low
                        </option>

                    </select>

                </div>


                {/* Toast Notifications */}

                <div className="fixed top-5 right-5 z-[100] space-y-3">

                    {message && (

                        <div className="bg-green-800 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-pulse">

                            <span className="text-xl">✓</span>

                            <p className="font-medium">
                                {message}
                            </p>

                        </div>

                    )}


                    {wishlistMessage && (

                        <div className="bg-pink-600 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3">

                            <span className="text-xl">❤️</span>

                            <p className="font-medium">
                                {wishlistMessage}
                            </p>

                        </div>

                    )}

                </div>


                {/* Product Cards */}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mt-10">

                    {currentProducts.map(function(product) {

                        const BrandLogo = brandLogos[product.brand];

                        return (

                            <div
                                key={product.id}
                                className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition overflow-hidden"
                            >

                                {/* Product Image */}

                                <div className="relative">

                                    <button
                                        onClick={function() {
                                            navigate(`/products/${product.id}`);
                                        }}
                                        className="w-full h-56 bg-gray-100 flex items-center justify-center cursor-pointer"
                                    >

                                        {product.image ? (

                                            <img
                                                src={product.image}
                                                alt={product.name}
                                                className="w-full h-full object-contain p-3"
                                            />

                                        ) : (

                                            <span className="text-gray-400">
                                                Image not available
                                            </span>

                                        )}

                                    </button>


                                    {/* Wishlist */}

                                    <button
                                        onClick={function() {
                                            handleWishlist(product);
                                        }}
                                        disabled={
                                            addWishlistMutation.isPending ||
                                            removeWishlistMutation.isPending
                                        }
                                        className={`absolute top-4 right-4 bg-white rounded-full w-11 h-11 text-2xl shadow-md ${
                                            isWishlisted(product)
                                                ? "text-red-500"
                                                : "text-gray-500"
                                        }`}
                                    >
                                        {isWishlisted(product) ? "❤️" : "♡"}
                                    </button>

                                </div>


                                {/* Product Details */}

                                <div className="p-5">

                                    <p className="text-sm text-green-700 font-medium">
                                        {product.category}
                                    </p>


                                    {/* Brand Logo and Name */}

                                    <div className="flex items-center gap-2 mt-2">

                                        {BrandLogo && (
                                            <BrandLogo size={20} />
                                        )}

                                        <p className="text-sm text-gray-500">
                                            {product.brand || "Not specified"}
                                        </p>

                                    </div>


                                    <h2 className="text-xl font-bold text-gray-900 mt-2">
                                        {product.name}
                                    </h2>


                                    {/* Price and Rating */}

                                    <div className="flex justify-between items-center mt-3">

                                        <p className="text-xl font-bold text-green-800">
                                            ₹{product.price}
                                        </p>

                                        <p className="text-yellow-500 font-medium">
                                            ⭐ {product.rating}
                                        </p>

                                    </div>


                                    {/* Stock Availability */}

                                    <div className="mt-3">

                                        {product.stock <= 0 ? (

                                            <p className="text-red-600 font-semibold">
                                                Out of Stock
                                            </p>

                                        ) : product.stock <= 3 ? (

                                            <p className="text-orange-600 font-semibold">
                                                Only {product.stock} left!
                                            </p>

                                        ) : (

                                            <p className="text-green-700 font-medium">
                                                {product.stock} in stock
                                            </p>

                                        )}

                                    </div>


                                    {/* Add to Cart */}

                                    <button
                                        onClick={function() {
                                            handleAddToCart(product);
                                        }}
                                        disabled={product.stock <= 0}
                                        className={`w-full text-white py-3 rounded-full mt-5 transition ${
                                            product.stock <= 0
                                                ? "bg-gray-400 cursor-not-allowed"
                                                : "bg-green-800 hover:bg-green-900"
                                        }`}
                                    >
                                        {product.stock <= 0
                                            ? "Out of Stock"
                                            : "Add to Cart"}
                                    </button>


                                    <p className="text-center text-sm text-gray-400 mt-3">
                                        Click image to view details
                                    </p>

                                </div>

                            </div>

                        );

                    })}

                </div>


                {/* No Products */}

                {sortedProducts.length === 0 && (

                    <p className="text-center text-gray-500 mt-12 text-lg">
                        No products found.
                    </p>

                )}


                {/* Pagination */}

                {totalPages > 1 && (

                    <div className="flex justify-center items-center gap-3 mt-12">

                        <button
                            onClick={function() {
                                setCurrentPage(currentPage - 1);
                            }}
                            disabled={currentPage === 1}
                            className="px-4 py-2 rounded-lg border bg-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-green-100"
                        >
                            Previous
                        </button>


                        {Array.from({ length: totalPages }, function(_, index) {

                            const pageNumber = index + 1;

                            return (

                                <button
                                    key={pageNumber}
                                    onClick={function() {
                                        setCurrentPage(pageNumber);
                                    }}
                                    className={`w-10 h-10 rounded-lg font-semibold ${
                                        currentPage === pageNumber
                                            ? "bg-green-800 text-white"
                                            : "bg-white border hover:bg-green-100"
                                    }`}
                                >
                                    {pageNumber}
                                </button>

                            );

                        })}


                        <button
                            onClick={function() {
                                setCurrentPage(currentPage + 1);
                            }}
                            disabled={currentPage === totalPages}
                            className="px-4 py-2 rounded-lg border bg-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-green-100"
                        >
                            Next
                        </button>

                    </div>

                )}

            </div>

        </section>

    );

}

export default Products;
