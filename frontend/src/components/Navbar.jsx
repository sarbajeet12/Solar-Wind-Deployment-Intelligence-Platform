import { Link, useLocation, useNavigate } from "react-router-dom";
import {
    LayoutDashboard,
    FolderKanban,
    MapPinned,
    User,
    KeyRound,
    LogOut,
    SunMedium
} from "lucide-react";

function Navbar() {
    const navigate = useNavigate();
    const location = useLocation();

    const logout = () => {
        localStorage.removeItem("access_token");
        navigate("/login");
    };

    return (
        <nav className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800 shadow-lg">
            <div className="w-full flex items-center justify-between px-10 py-4">

                {/* Logo */}
                <Link
                    to="/dashboard"
                    className="flex items-center gap-3 no-underline"
                >
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg">
                        <SunMedium className="text-white" size={24} />
                    </div>

                    <div>
                        <h1 className="text-white text-xl font-bold">
                            Solar & Wind
                        </h1>

                        <p className="text-slate-400 text-sm">
                            Deployment Intelligence
                        </p>
                    </div>
                </Link>

                {/* Navigation */}
                <div className="flex items-center gap-3">

                    <Link
                        to="/dashboard"
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 ${
                            location.pathname === "/dashboard"
                                ? "bg-blue-600 text-white shadow-lg"
                                : "text-slate-300 hover:bg-slate-800 hover:text-white"
                        }`}
                    >
                        <LayoutDashboard size={18} />
                        Dashboard
                    </Link>

                    <Link
                        to="/projects"
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 ${
                            location.pathname === "/projects"
                                ? "bg-blue-600 text-white shadow-lg"
                                : "text-slate-300 hover:bg-slate-800 hover:text-white"
                        }`}
                    >
                        <FolderKanban size={18} />
                        Projects
                    </Link>

                    <Link
                        to="/sites"
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 ${
                            location.pathname === "/sites"
                                ? "bg-blue-600 text-white shadow-lg"
                                : "text-slate-300 hover:bg-slate-800 hover:text-white"
                        }`}
                    >
                        <MapPinned size={18} />
                        Sites
                    </Link>

                    <Link
                        to="/profile"
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 ${
                            location.pathname === "/profile"
                                ? "bg-blue-600 text-white shadow-lg"
                                : "text-slate-300 hover:bg-slate-800 hover:text-white"
                        }`}
                    >
                        <User size={18} />
                        Profile
                    </Link>

                    <Link
                        to="/change-password"
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 ${
                            location.pathname === "/change-password"
                                ? "bg-blue-600 text-white shadow-lg"
                                : "text-slate-300 hover:bg-slate-800 hover:text-white"
                        }`}
                    >
                        <KeyRound size={18} />
                        Password
                    </Link>

                    <button
                        onClick={logout}
                        className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl shadow-lg transition-all duration-300 hover:scale-105"
                    >
                        <LogOut size={18} />
                        Logout
                    </button>

                </div>

            </div>
        </nav>
    );
}

export default Navbar;