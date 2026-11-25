import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";

import useCart from "../../hooks/useCart";
import { fetchProducts } from "../../api/productApi";

// Load product images
const images = import.meta.glob("../../assets/*.png", {
    eager: true,
    query: "?url",
    import: "default"
});

function Cart() {

    const {
        cart,
        isLoading,
        isError,
        updateQuantity,
        removeFromCart
    } = useCart();

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 4;

    // Fetch products
    const {
        data: products = [],
        isLoading: productsLoading,
        isError: productsError
    } = useQuery({
        queryKey: ["products"],
        queryFn: async function() {
            const response = await fetchProducts();
            return response.data;
        }
    });

    // Find product details
    function getProduct(productId) {

        return products.find(function(item) {
            return String(item.id) === String(productId);
        });

    }

    // Get product image using imageKey
    function getProductImage(product) {

        if (!product) {
            return "";
        }

        const imageKey = String(product.imageKey || "").toLowerCase();

        let frontImage = "";
        let sideImage = "";
        let backImage = "";

        Object.keys(images).forEach(function(path) {

            const filename = path.split("/").pop().toLowerCase();

            if (imageKey !== "" && filename.includes(imageKey)) {

                if (filename.startsWith("front")) {
                    frontImage = images[path];
                }

                else if (filename.startsWith("side")) {
                    sideImage = images[path];
                }

                else if (filename.startsWith("back")) {
                    backImage = images[path];
                }

            }

        });

        return frontImage || sideImage || backImage || product.image || "";

    }

    // Get available stock
    function getStock(productId) {

        const product = getProduct(productId);

        return product ? product.stock : null;

    }

    // Identify unavailable products
    const unavailableProducts = cart.filter(function(item) {

        const product = getProduct(item.productId);

        return product && product.isDeleted === true;

    });

    // Active cart products
    const activeCart = cart.filter(function(item) {

        const product = getProduct(item.productId);

        return product && product.isDeleted !== true;

    });

    // Pagination
    const totalPages = Math.ceil(activeCart.length / itemsPerPage);

    // Calculate valid current page
    const validCurrentPage = totalPages > 0
        ? Math.min(currentPage, totalPages)
        : 1;

    const startIndex = (validCurrentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    const currentProducts = activeCart.slice(startIndex, endIndex);

    // Calculate Total Price
    const totalPrice = activeCart.reduce(function(total, product) {

        return total + product.price * product.quantity;

    }, 0);

    const deliveryCharge = totalPrice >= 3000 ? 0 : 99;
    const finalTotal = totalPrice + deliveryCharge;

    // Increase Quantity
    function handleIncrease(product) {

        const stock = getStock(product.productId);

        if (stock !== null && product.quantity >= stock) {

            toast.error("Only " + stock + " items are available.");
            return;

        }

        updateQuantity({
            id: product.id,
            quantity: product.quantity + 1
        }, {
            onError: function(error) {
                toast.error(error.message || "Unable to update quantity.");
            }
        });

    }

    // Decrease Quantity
    function handleDecrease(product) {

        if (product.quantity > 1) {

            updateQuantity({
                id: product.id,
                quantity: product.quantity - 1
            }, {
                onError: function(error) {
                    toast.error(error.message || "Unable to update quantity.");
                }
            });

        }

        else {
            removeFromCart(product.id);
        }

    }

    // Remove Product
    function handleRemove(product) {
        removeFromCart(product.id);
    }

    // Remove Unavailable Product
    function handleRemoveUnavailable(product) {
        removeFromCart(product.id);
    }

    // Previous Page
    function handlePrevious() {

        if (validCurrentPage > 1) {
            setCurrentPage(validCurrentPage - 1);
        }

    }

    // Next Page
    function handleNext() {

        if (validCurrentPage < totalPages) {
            setCurrentPage(validCurrentPage + 1);
        }

    }

    // Loading
    if (isLoading || productsLoading) {

        return (
            <div className="min-h-screen flex items-center justify-center">

                <h2 className="text-2xl font-semibold text-green-800">
                    Loading your cart...
                </h2>

            </div>
        );

    }

    // Error
    if (isError || productsError) {

        return (
            <div className="min-h-screen flex items-center justify-center">

                <h2 className="text-xl font-semibold text-red-600">
                    Something went wrong while loading your cart.
                </h2>

            </div>
        );

    }

    return (

        <section className="min-h-screen bg-gray-50 px-6 py-12">

            <div className="max-w-7xl mx-auto">

                <h1 className="text-3xl font-bold text-gray-800 mb-8">
                    My Shopping Cart
                </h1>

                {/* Unavailable Product Warning */}
                {unavailableProducts.length > 0 && (

                    <div className="bg-orange-100 border border-orange-300 text-orange-800 px-5 py-4 rounded-lg mb-6">

                        <h3 className="font-bold mb-2">
                            Some products are no longer available.
                        </h3>

                        <p className="text-sm">
                            The following products have been moved to Trash.
                            Remove them from your cart to continue.
                        </p>

                        {unavailableProducts.map(function(product) {

                            return (

                                <div
                                    key={product.id}
                                    className="flex justify-between items-center gap-4 mt-3 bg-white p-3 rounded-lg"
                                >

                                    <span className="font-semibold">
                                        {product.name}
                                    </span>

                                    <button
                                        onClick={function() {
                                            handleRemoveUnavailable(product);
                                        }}
                                        className="bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700"
                                    >
                                        Remove
                                    </button>

                                </div>

                            );

                        })}

                    </div>

                )}

                {/* Empty Cart */}
                {activeCart.length === 0 ? (

                    <div className="bg-white rounded-2xl shadow-sm p-12 text-center">

                        <div className="text-6xl mb-5 text-gray-300">
                            🛒
                        </div>

                        <h2 className="text-2xl font-bold text-gray-800">
                            Your Cart is Empty
                        </h2>

                        <p className="text-gray-500 mt-3">
                            Looks like you haven't added anything to your cart yet.
                        </p>

                        <Link
                            to="/products"
                            className="inline-block mt-7 bg-green-800 text-white px-8 py-3 rounded-lg hover:bg-green-900 transition"
                        >
                            Continue Shopping
                        </Link>

                    </div>

                ) : (

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                        {/* Cart Products */}
                        <div className="lg:col-span-2 space-y-5">

                            {currentProducts.map(function(product) {

                                const stock = getStock(product.productId);

                                const isMaxStock =
                                    stock !== null && product.quantity >= stock;

                                const productDetails = getProduct(product.productId);

                                const productImage = getProductImage(
                                    productDetails || product
                                );

                                return (

                                    <div
                                        key={product.id}
                                        className="bg-white border rounded-xl p-5 flex flex-col sm:flex-row gap-6 items-center shadow-sm"
                                    >

                                        {productImage ? (

                                            <img
                                                src={productImage}
                                                alt={product.name}
                                                className="w-32 h-32 object-contain rounded-lg"
                                            />

                                        ) : (

                                            <div className="w-32 h-32 flex items-center justify-center bg-gray-100 rounded-lg text-gray-400">
                                                No Image
                                            </div>

                                        )}

                                        <div className="flex-1 text-center sm:text-left">

                                            <h2 className="text-xl font-bold text-gray-800">
                                                {product.name}
                                            </h2>

                                            <p className="text-gray-600 mt-2">
                                                Price: ₹{product.price}
                                            </p>

                                            <p className="text-gray-600 mt-2">
                                                Available Stock: {stock}
                                            </p>

                                            <p className="font-semibold mt-2">
                                                Subtotal: ₹{product.price * product.quantity}
                                            </p>

                                            {/* Quantity Controls */}
                                            <div className="flex gap-4 mt-4 items-center justify-center sm:justify-start">

                                                <button
                                                    className="bg-gray-200 px-3 py-1 rounded hover:bg-gray-300"
                                                    onClick={function() {
                                                        handleDecrease(product);
                                                    }}
                                                >
                                                    -
                                                </button>

                                                <span className="font-semibold">
                                                    {product.quantity}
                                                </span>

                                                <button
                                                    disabled={isMaxStock || stock === null}
                                                    className="bg-gray-200 px-3 py-1 rounded hover:bg-gray-300 disabled:opacity-40 disabled:cursor-not-allowed"
                                                    onClick={function() {
                                                        handleIncrease(product);
                                                    }}
                                                >
                                                    +
                                                </button>

                                            </div>

                                            {isMaxStock && (

                                                <p className="text-orange-600 text-sm mt-2">
                                                    Maximum available quantity reached.
                                                </p>

                                            )}

                                            {/* Remove Button */}
                                            <button
                                                onClick={function() {
                                                    handleRemove(product);
                                                }}
                                                className="bg-red-600 text-white px-4 py-2 rounded-lg mt-4 hover:bg-red-700"
                                            >
                                                Remove
                                            </button>

                                        </div>

                                    </div>

                                );

                            })}

                            {/* Pagination */}
                            {totalPages > 1 && (

                                <div className="flex justify-center items-center gap-3 pt-6">

                                    <button
                                        onClick={handlePrevious}
                                        disabled={validCurrentPage === 1}
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
                                                        validCurrentPage === index + 1
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
                                        disabled={validCurrentPage === totalPages}
                                        className="px-4 py-2 bg-green-800 text-white rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed"
                                    >
                                        Next
                                    </button>

                                </div>

                            )}

                            <Link
                                to="/products"
                                className="inline-block text-green-800 font-semibold hover:underline"
                            >
                                ← Continue Shopping
                            </Link>

                        </div>

                        {/* Order Summary */}
                        <div className="h-fit bg-white border rounded-xl p-6 shadow-sm">

                            <h2 className="text-2xl font-bold mb-6">
                                Order Summary
                            </h2>

                            <div className="flex justify-between mb-4 text-gray-600">
                                <span>Subtotal</span>
                                <span>₹{totalPrice}</span>
                            </div>

                            <div className="flex justify-between mb-4 text-gray-600">
                                <span>Delivery Charge</span>
                                <span>
                                    {deliveryCharge === 0 ? "FREE" : `₹${deliveryCharge}`}
                                </span>
                            </div>

                            <hr className="my-5" />

                            <div className="flex justify-between text-xl font-bold">
                                <span>Final Total</span>
                                <span className="text-green-800">
                                    ₹{finalTotal}
                                </span>
                            </div>

                            <Link
                                to="/checkout"
                                onClick={function(event) {

                                    if (unavailableProducts.length > 0) {

                                        event.preventDefault();

                                        toast.error(
                                            "Please remove unavailable products before checkout."
                                        );

                                    }

                                    else if (activeCart.length === 0) {

                                        event.preventDefault();

                                        toast.error("Your cart is empty.");

                                    }

                                }}
                                className="block text-center w-full bg-green-800 text-white py-3 rounded-lg mt-7 hover:bg-green-900 transition"
                            >
                                Proceed to Checkout
                            </Link>

                        </div>

                    </div>

                )}

            </div>

        </section>

    );

}

export default Cart;