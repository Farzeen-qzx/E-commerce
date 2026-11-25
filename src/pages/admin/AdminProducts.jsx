import { useState } from "react";
import toast from "react-hot-toast";

import {
    useQuery,
    useMutation,
    useQueryClient
} from "@tanstack/react-query";

import {
    getAdminProducts,
    addAdminProduct,
    updateAdminProduct,
    deleteAdminProduct
} from "../../services/adminProductService";

import AdminSidebar from "../../components/admin/AdminSidebar";

function AdminProducts() {

    const queryClient = useQueryClient();

    const [showForm, setShowForm] = useState(false);
    const [editId, setEditId] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);

    const productsPerPage = 5;

    const initialProduct = {
        name: "",
        brand: "",
        category: "",
        price: "",
        stock: "",
        rating: "",
        imageKey: "",
        description: ""
    };

    const [product, setProduct] = useState(initialProduct);

    // Fetch Products
    const {
        data,
        isPending,
        isError
    } = useQuery({
        queryKey: ["adminProducts"],
        queryFn: getAdminProducts
    });

    // Refresh Products
    function refreshProducts() {

        queryClient.invalidateQueries({
            queryKey: ["adminProducts"]
        });

        queryClient.invalidateQueries({
            queryKey: ["adminDashboard"]
        });

    }

    // Reset Form
    function resetForm() {

        setProduct(initialProduct);
        setEditId(null);
        setShowForm(false);

    }

    // Add Product Mutation
    const addMutation = useMutation({

        mutationFn: addAdminProduct,

        onSuccess: function() {

            refreshProducts();
            resetForm();
            setCurrentPage(1);

            toast.success("Product added successfully!");

        },

        onError: function() {

            toast.error("Failed to add product.");

        }

    });

    // Update Product Mutation
    const updateMutation = useMutation({

        mutationFn: updateAdminProduct,

        onSuccess: function() {

            refreshProducts();
            resetForm();

            toast.success("Product updated successfully!");

        },

        onError: function() {

            toast.error("Failed to update product.");

        }

    });

    // Move Product to Trash Mutation
    const trashMutation = useMutation({

        mutationFn: function(id) {

            return updateAdminProduct({
                id: id,
                product: {
                    isDeleted: true
                }
            });

        },

        onSuccess: function() {

            refreshProducts();

            toast.success("Product moved to Trash successfully!");

        },

        onError: function() {

            toast.error("Failed to move product to Trash.");

        }

    });

    // Permanently Delete Product Mutation
    const deleteMutation = useMutation({

        mutationFn: deleteAdminProduct,

        onSuccess: function() {

            refreshProducts();

            toast.success("Product deleted permanently!");

        },

        onError: function() {

            toast.error("Failed to delete product.");

        }

    });

    // Handle Input Changes
    function handleChange(event) {

        const { name, value } = event.target;

        setProduct(function(previous) {

            return {
                ...previous,
                [name]: value
            };

        });

    }

    // Open Add Form
    function handleAdd() {

        setProduct(initialProduct);
        setEditId(null);
        setShowForm(true);

    }

    // Open Edit Form
    function handleEdit(item) {

        setProduct({
            name: item.name,
            brand: item.brand,
            category: item.category,
            price: item.price,
            stock: item.stock,
            rating: item.rating,
            imageKey: item.imageKey,
            description: item.description
        });

        setEditId(item.id);
        setShowForm(true);

    }

    // Submit Form
    function handleSubmit(event) {

        event.preventDefault();

        const productData = {
            ...product,
            price: Number(product.price),
            stock: Number(product.stock),
            rating: Number(product.rating)
        };

        if (editId !== null) {

            updateMutation.mutate({
                id: editId,
                product: productData
            });

        } else {

            addMutation.mutate(productData);

        }

    }

    // Move Product to Trash
    function handleDelete(id) {

        const confirmed = window.confirm(
            "Are you sure you want to move this product to Trash?"
        );

        if (confirmed) {

            trashMutation.mutate(id);

        }

    }

    // Permanently Delete Product
    function handlePermanentDelete(id) {

        const confirmed = window.confirm(
            "Are you sure you want to permanently delete this product? This action cannot be undone."
        );

        if (confirmed) {

            deleteMutation.mutate(id);

        }

    }

    const isSaving =
        addMutation.isPending || updateMutation.isPending;

    // All Products
    const allProducts = Array.isArray(data?.data)
        ? data.data
        : [];

    // Show Only Active Products
    const products = allProducts.filter(function(item) {

        return item.isDeleted !== true;

    });

    // Pagination Calculations
    const totalPages = Math.ceil(
        products.length / productsPerPage
    );

    // Calculate Valid Current Page
    const validCurrentPage = totalPages > 0
        ? Math.min(currentPage, totalPages)
        : 1;

    const lastIndex = validCurrentPage * productsPerPage;
    const firstIndex = lastIndex - productsPerPage;

    const currentProducts = products.slice(
        firstIndex,
        lastIndex
    );

    // Loading State
    if (isPending) {

        return (
            <p className="p-8">
                Loading products...
            </p>
        );

    }

    // Error State
    if (isError) {

        return (
            <p className="p-8 text-red-600">
                Failed to load products.
            </p>
        );

    }

    return (

        <div className="min-h-screen bg-gray-100 flex flex-col lg:flex-row">

            <AdminSidebar />

            <div className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8">

                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">

                    <h1 className="text-2xl sm:text-3xl font-bold">
                        Manage Products
                    </h1>

                    <button
                        onClick={handleAdd}
                        className="bg-green-800 text-white px-5 py-3 rounded-lg w-full sm:w-auto"
                    >
                        Add Product
                    </button>

                </div>

                {/* Product Form */}
                {showForm && (

                    <form
                        onSubmit={handleSubmit}
                        className="bg-white p-4 sm:p-6 rounded-xl shadow mb-8"
                    >

                        <h2 className="text-xl font-bold mb-5">

                            {editId !== null
                                ? "Edit Product"
                                : "Add New Product"
                            }

                        </h2>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                            <input
                                type="text"
                                name="name"
                                placeholder="Product Name"
                                value={product.name}
                                onChange={handleChange}
                                required
                                className="border p-3 rounded-lg w-full"
                            />

                            <input
                                type="text"
                                name="brand"
                                placeholder="Brand"
                                value={product.brand}
                                onChange={handleChange}
                                required
                                className="border p-3 rounded-lg w-full"
                            />

                            <input
                                type="text"
                                name="category"
                                placeholder="Category"
                                value={product.category}
                                onChange={handleChange}
                                required
                                className="border p-3 rounded-lg w-full"
                            />

                            <input
                                type="number"
                                name="price"
                                placeholder="Price"
                                value={product.price}
                                onChange={handleChange}
                                min="0"
                                required
                                className="border p-3 rounded-lg w-full"
                            />

                            <input
                                type="number"
                                name="stock"
                                placeholder="Stock"
                                value={product.stock}
                                onChange={handleChange}
                                min="0"
                                required
                                className="border p-3 rounded-lg w-full"
                            />

                            <input
                                type="number"
                                name="rating"
                                placeholder="Rating"
                                value={product.rating}
                                onChange={handleChange}
                                min="0"
                                max="5"
                                step="0.1"
                                required
                                className="border p-3 rounded-lg w-full"
                            />

                            <input
                                type="text"
                                name="imageKey"
                                placeholder="Image Key"
                                value={product.imageKey}
                                onChange={handleChange}
                                required
                                className="border p-3 rounded-lg w-full sm:col-span-2"
                            />

                            <textarea
                                name="description"
                                placeholder="Product Description"
                                value={product.description}
                                onChange={handleChange}
                                required
                                className="border p-3 rounded-lg w-full sm:col-span-2"
                                rows="4"
                            />

                        </div>

                        {/* Form Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3 mt-5">

                            <button
                                type="submit"
                                disabled={isSaving}
                                className="bg-green-800 text-white px-6 py-3 rounded-lg disabled:opacity-50"
                            >

                                {isSaving
                                    ? "Saving..."
                                    : editId !== null
                                        ? "Update Product"
                                        : "Save Product"
                                }

                            </button>

                            <button
                                type="button"
                                onClick={resetForm}
                                className="bg-gray-500 text-white px-6 py-3 rounded-lg"
                            >
                                Cancel
                            </button>

                        </div>

                        {/* Form Errors */}
                        {(addMutation.isError || updateMutation.isError) && (

                            <p className="text-red-600 mt-4">
                                Failed to save product. Please try again.
                            </p>

                        )}

                    </form>

                )}

                {/* Products Table */}
                <div className="bg-white rounded-xl shadow overflow-x-auto">

                    <table className="w-full min-w-[850px] text-left">

                        <thead className="bg-gray-100">

                            <tr>

                                <th className="p-4">ID</th>
                                <th className="p-4">Product</th>
                                <th className="p-4">Brand</th>
                                <th className="p-4">Category</th>
                                <th className="p-4">Price</th>
                                <th className="p-4">Stock</th>
                                <th className="p-4">Action</th>

                            </tr>

                        </thead>

                        <tbody>

                            {products.length === 0 ? (

                                <tr>

                                    <td colSpan="7" className="text-center p-12">

                                        <h3 className="text-xl font-semibold text-gray-700">
                                            No Products Available
                                        </h3>

                                        <p className="text-gray-500 mt-2">
                                            You haven't added any products yet.
                                        </p>

                                        <button
                                            onClick={handleAdd}
                                            className="bg-green-800 text-white px-5 py-2 rounded-lg mt-4"
                                        >
                                            Add Your First Product
                                        </button>

                                    </td>

                                </tr>

                            ) : (

                                currentProducts.map(function(item) {

                                    return (

                                        <tr
                                            key={item.id}
                                            className="border-t"
                                        >

                                            <td className="p-4">
                                                {item.id}
                                            </td>

                                            <td className="p-4 font-medium">
                                                {item.name}
                                            </td>

                                            <td className="p-4">
                                                {item.brand}
                                            </td>

                                            <td className="p-4">
                                                {item.category}
                                            </td>

                                            <td className="p-4">
                                                ₹{item.price}
                                            </td>

                                            <td className="p-4">
                                                {item.stock}
                                            </td>

                                            <td className="p-4">

                                                <div className="flex gap-2">

                                                    {/* Edit Button */}
                                                    <button
                                                        onClick={function() {
                                                            handleEdit(item);
                                                        }}
                                                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                                                    >
                                                        Edit
                                                    </button>

                                                    {/* Trash Button */}
                                                    <button
                                                        onClick={function() {
                                                            handleDelete(item.id);
                                                        }}
                                                        disabled={trashMutation.isPending}
                                                        className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
                                                    >
                                                        Trash
                                                    </button>

                                                    {/* Permanent Delete Button */}
                                                    <button
                                                        onClick={function() {
                                                            handlePermanentDelete(item.id);
                                                        }}
                                                        disabled={deleteMutation.isPending}
                                                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg disabled:opacity-50"
                                                    >
                                                        Delete
                                                    </button>

                                                </div>

                                            </td>

                                        </tr>

                                    );

                                })

                            )}

                        </tbody>

                    </table>

                </div>

                {/* Pagination */}
                {totalPages > 1 && (

                    <div className="flex flex-wrap justify-center items-center gap-3 sm:gap-4 mt-6">

                        <button
                            onClick={function() {
                                setCurrentPage(validCurrentPage - 1);
                            }}
                            disabled={validCurrentPage === 1}
                            className="bg-gray-700 text-white px-4 py-2 rounded disabled:opacity-40"
                        >
                            Previous
                        </button>

                        <span className="font-medium">
                            Page {validCurrentPage} of {totalPages}
                        </span>

                        <button
                            onClick={function() {
                                setCurrentPage(validCurrentPage + 1);
                            }}
                            disabled={validCurrentPage === totalPages}
                            className="bg-gray-700 text-white px-4 py-2 rounded disabled:opacity-40"
                        >
                            Next
                        </button>

                    </div>

                )}

            </div>

        </div>

    );

}

export default AdminProducts;