import { Link, useLocation } from "react-router-dom";

function OrderConfirmation() {
  const location = useLocation();
  const order = location.state?.order;

  if (!order) {
    return (
      <section className="min-h-screen bg-gray-50 flex flex-col justify-center items-center text-center p-6">
        <h1 className="text-2xl font-bold text-gray-800">
          No Order Details Found
        </h1>

        <p className="text-gray-500 mt-3">
          Please place an order to see your confirmation.
        </p>

        <Link
          to="/products"
          className="bg-green-800 text-white px-6 py-3 rounded-lg mt-6 hover:bg-green-900"
        >
          Continue Shopping
        </Link>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-gray-50 flex justify-center items-center p-6">
      <div className="bg-white max-w-2xl w-full rounded-2xl shadow-lg p-8">
        {/* Success Message */}

        <div className="text-center">
          <div className="w-20 h-20 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-5xl mx-auto mb-5">
            ✓
          </div>

          <h1 className="text-3xl font-bold text-gray-800">
            Order Placed Successfully!
          </h1>

          <p className="text-gray-500 mt-3">
            Thank you for shopping with TrailNest. Your adventure starts here!
          </p>
        </div>

        <hr className="my-7" />

        {/* Order Details */}

        <div>
          <h2 className="text-xl font-bold mb-5">Order Details</h2>

          <div className="space-y-3 text-gray-700">
            <p>
              <strong>Order ID:</strong> {order.id}
            </p>

            <p>
              <strong>Customer:</strong> {order.customer.fullName}
            </p>

            <p>
              <strong>Email:</strong> {order.customer.email}
            </p>

            <p>
              <strong>Phone:</strong> {order.customer.phone}
            </p>

            <p>
              <strong>Address:</strong> {order.customer.address}
            </p>

            <p>
              <strong>Payment Method:</strong>{" "}
              {order.customer.paymentMethod === "cod"
                ? "Cash on Delivery"
                : "Online Payment (Demo)"}
            </p>

            <p>
              <strong>Order Status:</strong>{" "}
              <span className="text-orange-600 font-semibold">
                {order.status}
              </span>
            </p>

            <p>
              <strong>Order Date:</strong>{" "}
              {new Date(order.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        <hr className="my-7" />

        {/* Ordered Products */}

        <div>
          <h2 className="text-xl font-bold mb-5">Ordered Products</h2>

          {order.products.map(function (product, index) {
            return (
              <div
                key={index}
                className="flex justify-between items-center mb-5"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-16 h-16 object-contain rounded-lg"
                  />

                  <div>
                    <h3 className="font-semibold">{product.name}</h3>

                    <p className="text-sm text-gray-500">
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
        </div>

        <hr className="my-6" />

        {/* Price Summary */}

        <div className="space-y-3">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>₹{order.subtotal}</span>
          </div>

          <div className="flex justify-between">
            <span>Delivery Charge</span>

            <span>
              {order.deliveryCharge === 0 ? "FREE" : `₹${order.deliveryCharge}`}
            </span>
          </div>

          <div className="flex justify-between text-xl font-bold text-green-800 pt-3 border-t">
            <span>Final Total</span>
            <span>₹{order.total}</span>
          </div>
        </div>

        {/* Continue Shopping */}

        <Link
          to="/products"
          className="block text-center bg-green-800 text-white py-3 rounded-lg mt-8 hover:bg-green-900 transition"
        >
          Continue Shopping
        </Link>
      </div>
    </section>
  );
}

export default OrderConfirmation;
