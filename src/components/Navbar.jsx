import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../features/auth/authSlice";
import useCart from "../hooks/useCart";

function Navbar() {

    const user = useSelector(function(state) {
        return state.auth.user;
    });

    const { cart, isLoading } = useCart();

    const dispatch = useDispatch();
    const navigate = useNavigate();

    // Calculate total different products
    const cartCount = cart.length;

    // Logout
    function handleLogout() {
        dispatch(logout());
        navigate("/");
    }

    return (
        <nav className="bg-white shadow-sm sticky top-0 z-50">

            <div className="max-w-7xl mx-auto flex justify-between items-center px-8 py-5">

                {/* Logo */}
                <Link to="/" className="text-3xl font-bold text-green-800">
                    TrailNest<span className="text-orange-500">.</span>
                </Link>

                {/* Navigation Links */}
                <div className="flex items-center gap-10 text-gray-700 font-medium">

                    {/* Always visible */}
                    <Link to="/" className="hover:text-green-700 transition">
                        Home
                    </Link>

                    <Link to="/products" className="hover:text-green-700 transition">
                        Products
                    </Link>

                    {/* Only visible when logged in */}
                    {user && (
                        <>
                            <Link to="/wishlist" className="hover:text-green-700 transition">
                                Wishlist ♡
                            </Link>

                            {/* Cart Badge */}
                            <Link to="/cart" className="relative hover:text-green-700 transition">
                                Cart

                                {!isLoading && cartCount > 0 && (
                                    <span className="absolute -top-3 -right-4 bg-orange-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                                        {cartCount}
                                    </span>
                                )}
                            </Link>

                            {/* My Orders */}
                            <Link to="/orders" className="hover:text-green-700 transition">
                                My Orders
                            </Link>

                            {/* Profile */}
                            <Link to="/profile" className="hover:text-green-700 transition">
                                Profile
                            </Link>
                        </>
                    )}

                </div>

                {/* Authentication */}
                <div className="flex items-center gap-4">

                    {user ? (
                        <>
                            <span className="text-green-800 font-semibold">
                                Hi, {user.fullName}
                            </span>

                            <button
                                onClick={handleLogout}
                                className="bg-green-800 text-white px-6 py-2.5 rounded-full hover:bg-green-900 transition"
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link
                                to="/login"
                                className="bg-green-800 text-white px-6 py-2.5 rounded-full hover:bg-green-900 transition"
                            >
                                Login
                            </Link>

                            <Link
                                to="/register"
                                className="border border-green-800 text-green-800 px-6 py-2.5 rounded-full hover:bg-green-50 transition"
                            >
                                Register
                            </Link>
                        </>
                    )}

                </div>

            </div>

        </nav>
    );
}

export default Navbar;