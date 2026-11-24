import { useState } from "react";

import {
    useQuery,
    useMutation,
    useQueryClient
} from "@tanstack/react-query";

import {
    getAdminUsers,
    updateUserStatus
} from "../../services/adminUserService";

import AdminSidebar from "../../components/admin/AdminSidebar";

function AdminUsers() {

    const queryClient = useQueryClient();

    const [search, setSearch] = useState("");

    // Fetch Users
    const {
        data,
        isPending,
        isError
    } = useQuery({
        queryKey: ["adminUsers"],
        queryFn: getAdminUsers
    });

    // Block / Unblock Mutation
    const statusMutation = useMutation({

        mutationFn: updateUserStatus,

        onSuccess: function() {

            queryClient.invalidateQueries({
                queryKey: ["adminUsers"]
            });

        }

    });

    // Handle Search
    function handleSearch(event) {

        setSearch(event.target.value);

    }

    // Handle Block / Unblock
    function handleStatus(item) {

        statusMutation.mutate({

            id: item.id,

            isBlocked: !item.isBlocked

        });

    }

    // Loading State
    if (isPending) {

        return (
            <p className="p-8">
                Loading users...
            </p>
        );

    }

    // Error State
    if (isError) {

        return (
            <p className="p-8 text-red-600">
                Failed to load users.
            </p>
        );

    }

    // Users Data
    const users = data.data || [];

    // Search Filter
    const filteredUsers = users.filter(function(item) {

        const name = item.name || "";
        const email = item.email || "";

        return (
            name.toLowerCase().includes(search.toLowerCase()) ||
            email.toLowerCase().includes(search.toLowerCase())
        );

    });

    return (

        <div className="min-h-screen bg-gray-100 flex flex-col lg:flex-row">

            <AdminSidebar />

            <div className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8">

                {/* Header */}

                <div className="mb-6">

                    <h1 className="text-2xl sm:text-3xl font-bold">
                        Manage Users
                    </h1>

                    <p className="text-gray-500 mt-2">
                        View and manage registered users.
                    </p>

                </div>


                {/* Search */}

                <div className="bg-white p-4 sm:p-5 rounded-xl shadow mb-6">

                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={search}
                        onChange={handleSearch}
                        className="w-full border p-3 rounded-lg outline-none focus:ring-2 focus:ring-green-700"
                    />

                </div>


                {/* Mutation Error */}

                {statusMutation.isError && (

                    <p className="text-red-600 mb-4">
                        Failed to update user status. Please try again.
                    </p>

                )}


                {/* Users Table */}

                <div className="bg-white rounded-xl shadow overflow-x-auto">

                    <table className="w-full min-w-[650px] text-left">

                        <thead className="bg-gray-100">

                            <tr>

                                <th className="p-4">
                                    ID
                                </th>

                                <th className="p-4">
                                    Name
                                </th>

                                <th className="p-4">
                                    Email
                                </th>

                                <th className="p-4">
                                    Status
                                </th>

                                <th className="p-4">
                                    Action
                                </th>

                            </tr>

                        </thead>


                        <tbody>

                            {users.length === 0 ? (

                                <tr>

                                    <td colSpan="5" className="text-center p-12">

                                        <h3 className="text-xl font-semibold text-gray-700">
                                            No Users Available
                                        </h3>

                                        <p className="text-gray-500 mt-2">
                                            No users have registered yet.
                                        </p>

                                    </td>

                                </tr>

                            ) : filteredUsers.length === 0 ? (

                                <tr>

                                    <td colSpan="5" className="text-center p-12">

                                        <h3 className="text-xl font-semibold text-gray-700">
                                            No Users Found
                                        </h3>

                                        <p className="text-gray-500 mt-2">
                                            No users match "{search}".
                                        </p>

                                    </td>

                                </tr>

                            ) : (

                                filteredUsers.map(function(item) {

                                    return (

                                        <tr
                                            key={item.id}
                                            className="border-t"
                                        >

                                            <td className="p-4">
                                                {item.id}
                                            </td>

                                            <td className="p-4 font-medium">
                                                {item.name || "N/A"}
                                            </td>

                                            <td className="p-4 break-all">
                                                {item.email || "N/A"}
                                            </td>

                                            <td className="p-4">

                                                {item.isBlocked ? (

                                                    <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm whitespace-nowrap">
                                                        Blocked
                                                    </span>

                                                ) : (

                                                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm whitespace-nowrap">
                                                        Active
                                                    </span>

                                                )}

                                            </td>


                                            <td className="p-4">

                                                <button
                                                    onClick={function() {
                                                        handleStatus(item);
                                                    }}
                                                    disabled={statusMutation.isPending}
                                                    className={`px-4 py-2 rounded-lg text-white disabled:opacity-50 ${
                                                        item.isBlocked
                                                            ? "bg-green-700"
                                                            : "bg-red-600"
                                                    }`}
                                                >

                                                    {statusMutation.isPending
                                                        ? "Updating..."
                                                        : item.isBlocked
                                                            ? "Unblock"
                                                            : "Block"
                                                    }

                                                </button>

                                            </td>

                                        </tr>

                                    );

                                })

                            )}

                        </tbody>

                    </table>

                </div>


                {/* Total Users */}

                <div className="mt-5 text-gray-600">

                    Total Users: {users.length}

                </div>

            </div>

        </div>

    );

}

export default AdminUsers;