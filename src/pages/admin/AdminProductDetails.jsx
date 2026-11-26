import { useQuery } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import AdminSidebar from "../../components/admin/AdminSidebar";

// Import product images
const images = import.meta.glob("../../assets/*.png", {
  eager: true,
  query: "?url",
  import: "default",
});

// Find product images
function getProductImages(product) {
  const imageKey = String(product.imageKey || "").toLowerCase();

  let frontImage = "";
  let sideImage = "";
  let backImage = "";

  Object.keys(images).forEach(function (path) {
    const filename = path.split("/").pop().toLowerCase();

    if (imageKey !== "" && filename.includes(imageKey)) {
      if (filename.startsWith("front")) {
        frontImage = images[path];
      } else if (filename.startsWith("side")) {
        sideImage = images[path];
      } else if (filename.startsWith("back")) {
        backImage = images[path];
      }
    }
  });

  return [
    { name: "Front View", image: frontImage },
    { name: "Side View", image: sideImage },
    { name: "Back View", image: backImage },
  ].filter(function (item) {
    return item.image !== "";
  });
}

function AdminProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL;

  // Fetch Selected Product
  const { data, isPending, isError } = useQuery({
    queryKey: ["adminProduct", id],

    queryFn: async function () {
      const response = await axios.get(`${API_URL}/products/${id}`);

      return response.data;
    },
  });

  // Loading
  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <h2 className="text-xl font-semibold text-green-800">
          Loading product details...
        </h2>
      </div>
    );
  }

  // Error
  if (isError || !data || data.isDeleted === true) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <h2 className="text-xl font-semibold text-red-600">
          Unable to load product details.
        </h2>

        <button
          onClick={function () {
            navigate("/admin/products");
          }}
          className="bg-green-800 text-white px-5 py-2 rounded-lg"
        >
          Back to Products
        </button>
      </div>
    );
  }

  const product = data;
  const productImages = getProductImages(product);

  // Fallback Image
  if (productImages.length === 0 && product.image) {
    productImages.push({
      name: "Product Image",
      image: product.image,
    });
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col lg:flex-row">
      {/* Admin Sidebar */}
      <AdminSidebar />

      <div className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
            Product Details
          </h1>

          <button
            onClick={function () {
              navigate("/admin/products");
            }}
            className="bg-gray-700 hover:bg-gray-800 text-white px-5 py-3 rounded-lg"
          >
            Back to Products
          </button>
        </div>

        {/* Product Details */}
        <div className="bg-white rounded-xl shadow-sm p-5 sm:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Product Images */}
            <div>
              <h2 className="text-xl font-bold mb-5">Product Images</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {productImages.length > 0 ? (
                  productImages.map(function (item, index) {
                    return (
                      <div key={index} className="border rounded-xl p-4">
                        <img
                          src={item.image}
                          alt={product.name + " " + item.name}
                          className="w-full h-52 object-contain"
                        />

                        <p className="text-center font-medium mt-3 text-gray-700">
                          {item.name}
                        </p>
                      </div>
                    );
                  })
                ) : (
                  <div className="col-span-full bg-gray-100 rounded-xl p-10 text-center">
                    <p className="text-gray-500">
                      No product images available.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Product Information */}
            <div>
              <h2 className="text-xl font-bold mb-5">Product Information</h2>

              <div className="space-y-5">
                <div>
                  <p className="text-sm text-gray-500">Product ID</p>
                  <p className="font-semibold text-gray-800">{product.id}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Product Name</p>
                  <p className="font-semibold text-gray-800 text-lg">
                    {product.name}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Brand</p>
                  <p className="font-semibold text-gray-800">
                    {product.brand || "N/A"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Category</p>
                  <p className="font-semibold text-gray-800">
                    {product.category || "N/A"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Price</p>
                  <p className="font-bold text-green-800 text-xl">
                    ₹{product.price}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Available Stock</p>
                  <p className="font-semibold text-gray-800">{product.stock}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Rating</p>
                  <p className="font-semibold text-gray-800">
                    ⭐ {product.rating || "No rating"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Image Key</p>
                  <p className="font-semibold text-gray-800">
                    {product.imageKey || "N/A"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Description</p>
                  <p className="text-gray-700 leading-relaxed">
                    {product.description || "No description available."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminProductDetails;
