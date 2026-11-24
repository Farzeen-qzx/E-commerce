
import { useState, useRef } from "react";
import { useSelector } from "react-redux";
import axios from "axios";

import {
    useMutation,
    useQueryClient
} from "@tanstack/react-query";

import {
    useNavigate,
    Link
} from "react-router-dom";

import useCart from "../../hooks/useCart";


// Import product images from src/assets
const images = import.meta.glob("../../assets/*.png", {
    eager: true,
    query: "?url",
    import: "default"
});


// Find product image using imageKey
function getProductImage(product) {

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


function Checkout() {

    const isSubmitting = useRef(false);

    const navigate = useNavigate();

    const queryClient = useQueryClient();


    // Get logged-in user from Redux
    const user = useSelector(function(state) {
        return state.auth.user;
    });


    const {
        cart,
        isLoading,
        isError,
        clearCart
    } = useCart();


    const API_URL = import.meta.env.VITE_API_URL;


    // Form Data
    const [formData, setFormData] = useState({

        fullName: "",
        email: "",
        phone: "",
        address: "",
        paymentMethod: ""

    });


    // Calculate Total
    const totalPrice = cart.reduce(function(total, product) {

        return total + product.price * product.quantity;

    }, 0);


    const deliveryCharge = totalPrice >= 3000 ? 0 : 99;

    const finalTotal = totalPrice + deliveryCharge;


    // CREATE ORDER AND UPDATE STOCK
    const createOrder = useMutation({

        mutationFn: async function(customerData) {

            // STEP 1: Get latest product information
            const latestProducts = await Promise.all(

                cart.map(async function(item) {

                    const response = await axios.get(
                        `${API_URL}/products/${item.productId}`
                    );

                    return {

                        cartItem: item,

                        product: response.data

                    };

                })

            );


            // STEP 2: Validate products
            latestProducts.forEach(function(item) {

                const product = item.product;

                const cartItem = item.cartItem;


                // Check whether product exists or is deleted
                if (!product || product.isDeleted === true) {

                    throw new Error(

                        cartItem.name +
                        " is no longer available. Please remove it from your cart."

                    );

                }


                // Check stock
                if (product.stock <= 0) {

                    throw new Error(

                        product.name + " is out of stock."

                    );

                }


                // Check requested quantity
                if (cartItem.quantity > product.stock) {

                    throw new Error(

                        product.name +
                        " has only " +
                        product.stock +
                        " items available."

                    );

                }

            });


            // STEP 3: Prepare cart using latest product details
            const validatedCart = latestProducts.map(function(item) {

                const productImage = getProductImage(item.product);

                return {

                    ...item.cartItem,

                    name: item.product.name,

                    category: item.product.category,

                    price: item.product.price,

                    rating: item.product.rating,

                    imageKey: item.product.imageKey,

                    image: productImage

                };

            });


            // STEP 4: Calculate latest total
            const latestSubtotal = validatedCart.reduce(

                function(total, product) {

                    return total + product.price * product.quantity;

                },

                0

            );


            const latestDeliveryCharge = latestSubtotal >= 3000 ? 0 : 99;

            const latestFinalTotal = latestSubtotal + latestDeliveryCharge;


            // STEP 5: Prepare order data
            const orderData = {

                userId: user.id,

                customer: customerData,

                products: validatedCart,

                subtotal: latestSubtotal,

                deliveryCharge: latestDeliveryCharge,

                total: latestFinalTotal,

                status: "Pending",

                createdAt: new Date().toISOString()

            };


            // STEP 6: Create Order
            const orderResponse = await axios.post(

                `${API_URL}/orders`,

                orderData

            );


            // STEP 7: Decrease Stock
            await Promise.all(

                latestProducts.map(function(item) {

                    const newStock =

                        item.product.stock - item.cartItem.quantity;


                    return axios.patch(

                        `${API_URL}/products/${item.product.id}`,

                        {

                            stock: newStock

                        }

                    );

                })

            );


            // Return created order
            return orderResponse.data;

        },


        // SUCCESS
        onSuccess: function(order) {

            // Refresh products
            queryClient.invalidateQueries({

                queryKey: ["products"]

            });


            queryClient.invalidateQueries({

                queryKey: ["adminProducts"]

            });


            queryClient.invalidateQueries({

                queryKey: ["adminDashboard"]

            });


            // Clear cart and navigate
            clearCart(undefined, {

                onSettled: function() {

                    queryClient.invalidateQueries({

                        queryKey: ["cart", user.id]

                    });


                    navigate("/order-confirmation", {

                        state: {

                            order: order

                        }

                    });

                }

            });

        },


        // ERROR
        onError: function(error) {

            console.log("Order Error:", error);

            console.log("Error Message:", error.message);

            console.log("Server Response:", error.response?.data);


            isSubmitting.current = false;

        }

    });



    // HANDLE INPUT CHANGES
    function handleChange(event) {

        setFormData({

            ...formData,

            [event.target.name]: event.target.value

        });

    }



    // SUBMIT ORDER
    function handleSubmit(event) {

        event.preventDefault();


        if (isSubmitting.current) {

            return;

        }


        // Check login
        if (!user?.id) {

            alert("Please login before placing an order.");

            navigate("/login");

            return;

        }


        // Check empty cart
        if (cart.length === 0) {

            alert("Your cart is empty!");

            return;

        }


        // Prevent multiple submissions
        isSubmitting.current = true;


        createOrder.mutate(formData);

    }



    // LOADING
    if (isLoading) {

        return (

            <div className="min-h-screen flex items-center justify-center">

                <h2 className="text-2xl font-semibold text-green-800">

                    Loading checkout...

                </h2>

            </div>

        );

    }



    // ERROR
    if (isError) {

        return (

            <div className="min-h-screen flex items-center justify-center">

                <h2 className="text-xl font-semibold text-red-600">

                    Unable to load your cart.

                </h2>

            </div>

        );

    }



    return (

        <section className="min-h-screen bg-gray-50 px-6 py-12">

            <div className="max-w-6xl mx-auto">


                <h1 className="text-3xl font-bold text-gray-800 mb-8">

                    Checkout

                </h1>



                {/* EMPTY CART */}
                {cart.length === 0 ? (

                    <div className="bg-white rounded-2xl shadow-sm p-12 text-center">

                        <h2 className="text-2xl font-bold">

                            Your Cart is Empty

                        </h2>


                        <p className="text-gray-500 mt-3">

                            Add some products before proceeding to checkout.

                        </p>


                        <Link
                            to="/products"
                            className="inline-block mt-6 bg-green-800 text-white px-8 py-3 rounded-lg hover:bg-green-900"
                        >

                            Continue Shopping

                        </Link>

                    </div>

                ) : (

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">


                        {/* CUSTOMER DETAILS */}
                        <div className="bg-white rounded-xl shadow-sm border p-7">


                            <h2 className="text-2xl font-bold mb-6">

                                Shipping Details

                            </h2>


                            <form onSubmit={handleSubmit}>


                                {/* Full Name */}
                                <label className="font-medium">

                                    Full Name

                                </label>


                                <input
                                    type="text"
                                    name="fullName"
                                    placeholder="Enter your full name"
                                    required
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    className="w-full border p-3 rounded-lg mb-5 mt-2 focus:outline-none focus:ring-2 focus:ring-green-700"
                                />


                                {/* Email */}
                                <label className="font-medium">

                                    Email Address

                                </label>


                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Enter your email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full border p-3 rounded-lg mb-5 mt-2 focus:outline-none focus:ring-2 focus:ring-green-700"
                                />


                                {/* Phone */}
                                <label className="font-medium">

                                    Phone Number

                                </label>


                                <input
                                    type="tel"
                                    name="phone"
                                    placeholder="Enter your phone number"
                                    required
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="w-full border p-3 rounded-lg mb-5 mt-2 focus:outline-none focus:ring-2 focus:ring-green-700"
                                />


                                {/* Address */}
                                <label className="font-medium">

                                    Delivery Address

                                </label>


                                <textarea
                                    name="address"
                                    placeholder="Enter your complete address"
                                    rows="4"
                                    required
                                    value={formData.address}
                                    onChange={handleChange}
                                    className="w-full border p-3 rounded-lg mb-5 mt-2 focus:outline-none focus:ring-2 focus:ring-green-700"
                                />


                                {/* Payment Method */}
                                <label className="font-medium">

                                    Payment Method

                                </label>


                                <select
                                    name="paymentMethod"
                                    required
                                    value={formData.paymentMethod}
                                    onChange={handleChange}
                                    className="w-full border p-3 rounded-lg mb-6 mt-2 focus:outline-none focus:ring-2 focus:ring-green-700"
                                >

                                    <option value="">

                                        Select Payment Method

                                    </option>


                                    <option value="cod">

                                        Cash on Delivery

                                    </option>


                                    <option value="online">

                                        Online Payment

                                    </option>

                                </select>



                                {/* ERROR MESSAGE */}
                                {createOrder.isError && (

                                    <p className="text-red-600 mb-4">

                                        {createOrder.error?.message ||

                                            "Unable to place your order. Please try again."}

                                    </p>

                                )}



                                {/* PLACE ORDER BUTTON */}
                                <button
                                    type="submit"
                                    disabled={createOrder.isPending}
                                    className="w-full bg-green-800 text-white p-3 rounded-lg font-semibold hover:bg-green-900 transition disabled:bg-gray-400"
                                >

                                    {createOrder.isPending

                                        ? "Placing Order..."

                                        : "Place Order"}

                                </button>


                            </form>


                        </div>



                        {/* ORDER SUMMARY */}
                        <div className="bg-white rounded-xl shadow-sm border p-7 h-fit">


                            <h2 className="text-2xl font-bold mb-6">

                                Your Order

                            </h2>



                            {cart.map(function(product) {

                                const productImage = getProductImage(product);

                                return (

                                    <div
                                        key={product.id}
                                        className="flex items-center gap-4 justify-between mb-5"
                                    >

                                        <div className="flex items-center gap-4">


                                            {productImage ? (

                                                <img
                                                    src={productImage}
                                                    alt={product.name}
                                                    className="w-16 h-16 object-contain rounded-lg"
                                                />

                                            ) : (

                                                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-xs text-gray-400">

                                                    No Image

                                                </div>

                                            )}


                                            <div>

                                                <h3 className="font-semibold">

                                                    {product.name}

                                                </h3>


                                                <p className="text-gray-500 text-sm">

                                                    Quantity: {product.quantity}

                                                </p>

                                            </div>


                                        </div>



                                        <span className="font-semibold">

                                            ₹{product.price * product.quantity}

                                        </span>


                                    </div>

                                );

                            })}



                            <hr className="my-5" />



                            {/* Subtotal */}
                            <div className="flex justify-between mb-4">

                                <span className="text-gray-600">

                                    Subtotal

                                </span>


                                <span>

                                    ₹{totalPrice}

                                </span>

                            </div>



                            {/* Delivery Charge */}
                            <div className="flex justify-between mb-4">

                                <span className="text-gray-600">

                                    Delivery Charge

                                </span>


                                <span>

                                    {deliveryCharge === 0

                                        ? "FREE"

                                        : `₹${deliveryCharge}`}

                                </span>

                            </div>



                            <hr className="my-5" />



                            {/* Final Total */}
                            <div className="flex justify-between text-xl font-bold">

                                <span>

                                    Final Total

                                </span>


                                <span className="text-green-800">

                                    ₹{finalTotal}

                                </span>

                            </div>



                            <p className="text-sm text-gray-500 mt-5">

                                Free delivery on orders above ₹3,000.

                            </p>


                        </div>


                    </div>

                )}

            </div>

        </section>

    );

}


export default Checkout;
