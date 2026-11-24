import { NavLink } from "react-router-dom";

function AdminSidebar() {

    function getLinkStyle({ isActive }) {

        return isActive
            ? "flex-1 lg:flex-none lg:w-full block text-center lg:text-left px-3 sm:px-5 py-3 rounded-lg bg-green-800 text-white font-semibold whitespace-nowrap"
            : "flex-1 lg:flex-none lg:w-full block text-center lg:text-left px-3 sm:px-5 py-3 rounded-lg text-gray-300 hover:bg-green-800 hover:text-white whitespace-nowrap";

    }

    return (

        <aside className="w-full lg:w-64 lg:min-h-screen shrink-0 bg-gray-900 text-white p-4 lg:p-5">

            <h2 className="text-2xl font-bold mb-5 lg:mb-10">
                TrailNest
            </h2>

            <nav className="flex flex-wrap gap-2 lg:flex-col">

                <NavLink
                    to="/admin/dashboard"
                    end
                    className={getLinkStyle}
                >
                    Dashboard
                </NavLink>

                <NavLink
                    to="/admin/products"
                    className={getLinkStyle}
                >
                    Products
                </NavLink>

                <NavLink
                    to="/admin/trash"
                    className={getLinkStyle}
                >
                    Trash
                </NavLink>

                <NavLink
                    to="/admin/users"
                    className={getLinkStyle}
                >
                    Users
                </NavLink>

                <NavLink
                    to="/admin/orders"
                    className={getLinkStyle}
                >
                    Orders
                </NavLink>

            </nav>

        </aside>

    );

}

export default AdminSidebar;