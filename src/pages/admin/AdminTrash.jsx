import {
    useQuery,
    useMutation,
    useQueryClient
} from "@tanstack/react-query";

import {
    getAdminProducts,
    updateAdminProduct,
    deleteAdminProduct
} from "../../services/adminProductService";

import AdminSidebar from "../../components/admin/AdminSidebar";

function AdminTrash() {

    const queryClient = useQueryClient();

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

    }

    // Restore Product
    const restoreMutation = useMutation({

        mutationFn: function(id) {

            return updateAdminProduct({
                id: id,
                product: {
                    isDeleted: false
                }
            });

        },

        onSuccess: refreshProducts

    });

    // Permanently Delete Product
    const deleteMutation = useMutation({

        mutationFn: deleteAdminProduct,

        onSuccess: refreshProducts

    });

    // Empty Trash
    const emptyTrashMutation = useMutation({

        mutationFn: async function(products) {

            const results = await Promise.all(
                products.map(function(item) {
                    return deleteAdminProduct(item.id);
                })
            );

            return results;

        },

        onSuccess: refreshProducts

    });

    // All Products
    const allProducts = Array.isArray(data?.data)
        ? data.data
        : [];

    // Deleted Products Only
    const trashedProducts = allProducts.filter(function(item) {

        return item.isDeleted === true;

    });

    // Restore Product
    function handleRestore(id) {

        const confirmed = window.confirm(
            "Are you sure you want to restore this product?"
        );

        if (confirmed) {

            restoreMutation.mutate(id);

        }

    }

    // Permanently Delete Product
    function handlePermanentDelete(id) {

        const confirmed = window.confirm(
            "This product will be permanently deleted. This action cannot be undone. Continue?"
        );

        if (confirmed) {

            deleteMutation.mutate(id);

        }

    }

    // Empty Trash
    function handleEmptyTrash() {

        if (trashedProducts.length === 0) {
            return;
        }

        const confirmed = window.confirm(
            "Are you sure you want to permanently delete all products in Trash?"
        );

        if (confirmed) {

            emptyTrashMutation.mutate(trashedProducts);

        }

    }

    const isDeleting =
        deleteMutation.isPending ||
        emptyTrashMutation.isPending;

    // Loading
    if (isPending) {

        return (
            <p className="p-8">
                Loading Trash...
            </p>
        );

    }

    // Error
    if (isError) {

        return (
            <p className="p-8 text-red-600">
                Failed to load Trash.
            </p>
        );

    }

    return (

        <div className="min-h-screen bg-gray-100 flex flex-col lg:flex-row">

            <AdminSidebar />

            <div className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8">

                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">

                    <div>

                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
                            Trash
                        </h1>

                        <p className="text-gray-500 mt-2">
                            Manage your deleted products.
                        </p>

                    </div>

                    <button
                        onClick={handleEmptyTrash}
                        disabled={
                            trashedProducts.length === 0 ||
                            isDeleting
                        }
                        className="bg-red-600 text-white px-5 py-3 rounded-lg disabled:opacity-50 w-full sm:w-auto"
                    >
                        {emptyTrashMutation.isPending
                            ? "Emptying..."
                            : "Empty Trash"
                        }
                    </button>

                </div>

                {/* Errors */}
                {(restoreMutation.isError ||
                    deleteMutation.isError ||
                    emptyTrashMutation.isError) && (

                    <p className="bg-red-100 text-red-700 p-4 rounded-lg mb-5">
                        An operation failed. Please try again.
                    </p>

                )}

                {/* Trash Count */}
                <div className="bg-white rounded-xl shadow p-5 mb-6">

                    <p className="text-gray-500">
                        Deleted Products
                    </p>

                    <p className="text-3xl font-bold text-red-600 mt-2">
                        {trashedProducts.length}
                    </p>

                </div>

                {/* Products Table */}
                <div className="bg-white rounded-xl shadow overflow-x-auto">

                    <table className="w-full min-w-[750px] text-left">

                        <thead className="bg-gray-100">

                            <tr>

                                <th className="p-4">ID</th>
                                <th className="p-4">Product</th>
                                <th className="p-4">Brand</th>
                                <th className="p-4">Category</th>
                                <th className="p-4">Price</th>
                                <th className="p-4">Actions</th>

                            </tr>

                        </thead>

                        <tbody>

                            {trashedProducts.length === 0 ? (

                                <tr>

                                    <td
                                        colSpan="6"
                                        className="text-center p-12"
                                    >

                                        <h3 className="text-xl font-semibold text-gray-700">
                                            Trash is Empty
                                        </h3>

                                        <p className="text-gray-500 mt-2">
                                            Deleted products will appear here.
                                        </p>

                                    </td>

                                </tr>

                            ) : (

                                trashedProducts.map(function(item) {

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

                                                <div className="flex gap-2">

                                                    <button
                                                        onClick={function() {
                                                            handleRestore(item.id);
                                                        }}
                                                        disabled={
                                                            restoreMutation.isPending ||
                                                            isDeleting
                                                        }
                                                        className="bg-green-700 text-white px-4 py-2 rounded-lg disabled:opacity-50"
                                                    >
                                                        Restore
                                                    </button>

                                                    <button
                                                        onClick={function() {
                                                            handlePermanentDelete(item.id);
                                                        }}
                                                        disabled={
                                                            isDeleting ||
                                                            restoreMutation.isPending
                                                        }
                                                        className="bg-red-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
                                                    >
                                                        Delete Permanently
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

            </div>

        </div>

    );

}

export default AdminTrash;