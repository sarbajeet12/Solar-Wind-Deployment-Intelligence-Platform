import { NavLink } from "react-router-dom";

export default function Sidebar() {
    return (
        <aside className="w-64 bg-slate-900 text-white">

            <div className="p-6 text-xl font-bold border-b border-slate-700">

                REDIP

            </div>

            <nav className="flex flex-col p-4 gap-2">

                <NavLink to="/dashboard">
                    Dashboard
                </NavLink>

                <NavLink to="/projects">
                    Projects
                </NavLink>

                <NavLink to="/sites">
                    Sites
                </NavLink>

                <NavLink to="/analysis">
                    Analysis
                </NavLink>

                <NavLink to="/profile">
                    Profile
                </NavLink>

            </nav>

        </aside>
    );
}