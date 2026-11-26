import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="bg-green-950 text-white mt-16">
      <div className="max-w-7xl mx-auto px-8 py-12 grid grid-cols-1 md:grid-cols-4 gap-10">
        {/* Brand */}
        <div>
          <h2 className="text-3xl font-bold mb-4">
            TrailNest<span className="text-orange-500">.</span>
          </h2>
          <p className="text-gray-300 leading-7">
            Explore the outdoors with confidence. Find quality trekking and
            camping essentials for your next adventure.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-lg font-semibold mb-5">Quick Links</h3>

          <ul className="space-y-3 text-gray-300">
            <li>
              {" "}
              <Link to="/" className="hover:text-orange-400 transition">
                {" "}
                Home
              </Link>
            </li>
            <li>
              {" "}
              <Link to="/products" className="hover:text-orange-400 transition">
                {" "}
                Products
              </Link>
            </li>
            <li>
              {" "}
              <Link to="/wishlist" className="hover:text-orange-400 transition">
                {" "}
                Wishlist
              </Link>
            </li>
            <li>
              {" "}
              <Link to="/cart" className="hover:text-orange-400 transition">
                {" "}
                Cart
              </Link>
            </li>
          </ul>
        </div>

        {/* Customer Support */}
        <div>
          <h3 className="text-lg font-semibold mb-5"> Customer Support </h3>
          <ul className="space-y-3 text-gray-300">
            <li>
              {" "}
              <a
                href="mailto:support@trailnest.com"
                className="hover:text-orange-400 transition"
              >
                Contact Us
              </a>
            </li>
            <li>
              {" "}
              <a href="#" className="hover:text-orange-400 transition">
                {" "}
                FAQs
              </a>
            </li>
            <li>
              {" "}
              <a href="#" className="hover:text-orange-400 transition">
                {" "}
                Shipping Information
              </a>
            </li>
          </ul>
        </div>

        {/* Social Media */}
        <div>
          <h3 className="text-lg font-semibold mb-5"> Follow Us</h3>

          <div className="flex gap-5 text-gray-300">
            <a
              href="https://www.instagram.com/"
              target="_blank"
              rel="noreferrer"
              className="hover:text-orange-400 transition"
            >
              {" "}
              Instagram
            </a>

            <a
              href="https://www.facebook.com/"
              target="_blank"
              rel="noreferrer"
              className="hover:text-orange-400 transition"
            >
              {" "}
              Facebook
            </a>

            <a
              href="https://www.youtube.com/"
              target="_blank"
              rel="noreferrer"
              className="hover:text-orange-400 transition"
            >
              {" "}
              YouTube
            </a>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-green-800">
        <div className="max-w-7xl mx-auto px-8 py-5 text-center text-gray-400 text-sm">
          © 2026 TrailNest. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
export default Footer;
