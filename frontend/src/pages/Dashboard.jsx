import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    FolderKanban,
    MapPinned,
    Sun,
    Wind,
    Clock3,
    BadgeCheck
} from "lucide-react";

import { motion } from "framer-motion";

import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
} from "recharts";

import api from "../services/api";
import Navbar from "../components/layout/Navbar";

function Dashboard() {
    const navigate = useNavigate();

    const [user, setUser] = useState(null);

    const [stats, setStats] = useState({
        projects: 0,
        sites: 0,
        solar: 0,
        wind: 0,
        pending: 0,
        completed: 0,
    });

    const [recentProjects, setRecentProjects] = useState([]);
    const [recentSites, setRecentSites] = useState([]);
    const [recentActivity, setRecentActivity] = useState([]);

    useEffect(() => {
        fetchUser();
        fetchStats();
        fetchRecentProjects();
        fetchRecentSites();
        fetchRecentActivity();
    }, []);

    const fetchUser = async () => {
        try {
            const response = await api.get("/auth/me");
            setUser(response.data);
        } catch {
            localStorage.removeItem("access_token");
            navigate("/login");
        }
    };

    const fetchStats = async () => {
        try {
            const response = await api.get("/dashboard/stats");
            setStats(response.data);
        } catch (error) {
            console.log(error);
        }
    };

    const fetchRecentProjects = async () => {
        try {
            const response = await api.get("/projects/");
            setRecentProjects(response.data.slice(0, 5));
        } catch (error) {
            console.log(error);
        }
    };

    const fetchRecentSites = async () => {
        try {
            const response = await api.get("/sites/");
            setRecentSites(response.data.slice(0, 5));
        } catch (error) {
            console.log(error);
        }
    };
    const fetchRecentActivity = async () => {
    try {
        const projectsResponse = await api.get("/projects/");
        const sitesResponse = await api.get("/sites/");

        const activity = [];

        projectsResponse.data.slice(0, 3).forEach((project) => {
            activity.push({
                title: `Project "${project.name}" updated`,
                time: "Recently",
                color: "bg-blue-500",
            });
        });

        sitesResponse.data.slice(0, 3).forEach((site) => {
            activity.push({
                title: `Site "${site.site_name}" added`,
                time: "Recently",
                color: "bg-green-500",
            });
        });

        setRecentActivity(activity);
    } catch (error) {
        console.log(error);
    }
};

    if (!user) {
        return (
            <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center text-2xl">
                Loading...
            </div>
        );
    }

    const cards = [
        {
            title: "Projects",
            value: stats.projects,
            icon: FolderKanban,
            color: "from-blue-500 to-cyan-400"
        },
        {
            title: "Sites",
            value: stats.sites,
            icon: MapPinned,
            color: "from-indigo-500 to-blue-500"
        },
        {
            title: "Solar",
            value: stats.solar,
            icon: Sun,
            color: "from-yellow-400 to-orange-500"
        },
        {
            title: "Wind",
            value: stats.wind,
            icon: Wind,
            color: "from-cyan-400 to-sky-500"
        },
        {
            title: "Pending",
            value: stats.pending,
            icon: Clock3,
            color: "from-orange-400 to-red-500"
        },
        {
            title: "Completed",
            value: stats.completed,
            icon: BadgeCheck,
            color: "from-green-400 to-emerald-500"
        }
    ];

    const chartData = [
        { name: "Projects", value: stats.projects },
        { name: "Sites", value: stats.sites },
        { name: "Solar", value: stats.solar },
        { name: "Wind", value: stats.wind },
        { name: "Pending", value: stats.pending },
        { name: "Completed", value: stats.completed }
    ];

    return (
        <>
            <Navbar />

            <div className="min-h-screen bg-slate-950 text-white px-8 py-8">

                {/* Hero */}

                <motion.div
                    initial={{ opacity: 0, y: -30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-800 p-10 mb-10 shadow-2xl"
                >

                    <div className="absolute top-0 right-0 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl"></div>

                    <div className="absolute bottom-0 left-0 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl"></div>

                    <div className="relative z-10">

                        <p className="text-cyan-400 font-semibold tracking-wider uppercase">
                            Dashboard
                        </p>

                        <h1 className="text-6xl font-extrabold mt-3 leading-tight">
                            Welcome back,
                            <br />
                            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                                {user.full_name}
                            </span>
                        </h1>

                        <p className="text-slate-400 text-lg mt-6 max-w-2xl">
                            Monitor renewable energy projects, deployment sites,
                            environmental data and real-time analytics from one
                            centralized intelligence platform.
                        </p>

                    </div>  

                </motion.div>

                {/* Cards */}

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-7">

                    {cards.map((card, index) => {

                        const Icon = card.icon;

                        return (
                            <motion.div
                                key={card.title}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                whileHover={{
                                    scale: 1.03
                                }}
                                className="group relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/70 backdrop-blur-xl p-7 shadow-xl transition-all duration-300 hover:-translate-y-2 hover:border-cyan-500/50 hover:shadow-cyan-500/20"
                            >
                                <div className="flex justify-between items-center">

                                    <div>

                                        <p className="text-slate-400">
                                            {card.title}
                                        </p>

                                        <h2 className="text-5xl font-bold mt-3">
                                            {card.value}
                                        </h2>

                                    </div>

                                    <div
                                        className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${card.color} flex items-center justify-center shadow-xl group-hover:scale-110 transition duration-300`}
                                    >
                                        <Icon size={30} />
                                    </div>

                                </div>

                            </motion.div>
                        );

                    })}

                </div>

                {/* Chart + Activity */}

                <div className="grid lg:grid-cols-3 gap-6 mt-12">

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="lg:col-span-2 bg-slate-900 rounded-3xl border border-slate-800 p-6 shadow-xl"
                >

                    <h2 className="text-2xl font-semibold mb-6">
                        Deployment Overview
                    </h2>

                    <ResponsiveContainer width="100%" height={350}>
                        <BarChart data={chartData}>

                            <CartesianGrid
                                strokeDasharray="4 4"
                                stroke="#1e293b"
                            />

                            <XAxis
                                dataKey="name"
                                stroke="#94a3b8"
                            />

                            <YAxis
                                stroke="#94a3b8"
                            />

                            <Tooltip
                                contentStyle={{
                                    background: "#0f172a",
                                    border: "1px solid #334155",
                                    borderRadius: "14px",
                                    color: "#fff"
                                }}
                            />

                            <Bar
                                dataKey="value"
                                radius={[12,12,0,0]}
                                fill="#3b82f6"
                            />

                        </BarChart>
                    </ResponsiveContainer>

                </motion.div>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="bg-slate-900 rounded-3xl border border-slate-800 p-6 shadow-xl"
                >

                    <h2 className="text-2xl font-semibold mb-6">
                        Recent Activity
                    </h2>

                    <div className="space-y-5">

                        {recentActivity.map((activity, index) => (

                            <div
                                key={index}
                                className="flex items-start gap-4"
                            >

                                <div
                                    className={`w-3 h-3 rounded-full mt-2 ${activity.color}`}
                                />

                                <div>

                                    <p className="text-white">
                                        {activity.title}
                                    </p>

                                    <p className="text-slate-400 text-sm">
                                        {activity.time}
                                    </p>

                                </div>

                            </div>

                        ))}

                    </div>

                </motion.div>
                </div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="mt-10"
                >

                    <h2 className="text-2xl font-semibold mb-6">
                        Recent Projects
                    </h2>

                    <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden">

                        <table className="w-full">

                            <thead className="bg-slate-800">

                                <tr>

                                    <th className="text-left px-6 py-4">
                                        Project
                                    </th>

                                    <th className="text-left px-6 py-4">
                                        Type
                                    </th>

                                    <th className="text-left px-6 py-4">
                                        Status
                                    </th>

                                </tr>

                            </thead>

                            <tbody>

                                {recentProjects.map((project) => (

                                    <tr
                                        key={project.id}
                                        className="border-t border-slate-800 hover:bg-slate-800/40 transition"
                                    >

                                        <td className="px-6 py-4">
                                            {project.name}
                                        </td>

                                        <td className="px-6 py-4">
                                            {project.energy_type}
                                        </td>

                                        <td className="px-6 py-4">

                                            <span
                                                className={`px-3 py-1 rounded-full text-sm font-medium ${
                                                    project.status === "Completed"
                                                        ? "bg-green-500/20 text-green-400"
                                                        : project.status === "In Progress"
                                                        ? "bg-yellow-500/20 text-yellow-400"
                                                        : project.status === "Planning"
                                                        ? "bg-cyan-500/20 text-cyan-400"
                                                        : project.status === "Pending"
                                                        ? "bg-orange-500/20 text-orange-400"
                                                        : "bg-slate-500/20 text-slate-300"
                                                }`}
                                            >
                                                {project.status}
                                            </span>

                                        </td>

                                    </tr>

                                ))}

                            </tbody>

                        </table>

                    </div>

                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.65 }}
                    className="mt-10"
                >

                    <h2 className="text-2xl font-semibold mb-6">
                        Recent Sites
                    </h2>

                    <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden">

                        <table className="w-full">

                            <thead className="bg-slate-800">

                                <tr>

                                    <th className="text-left px-6 py-4">
                                        Site
                                    </th>

                                    <th className="text-left px-6 py-4">
                                        Energy
                                    </th>

                                    <th className="text-left px-6 py-4">
                                        Status
                                    </th>

                                </tr>

                            </thead>

                            <tbody>

                                {recentSites.map((site) => (

                                    <tr
                                        key={site.id}
                                        className="border-t border-slate-800 hover:bg-slate-800/40 transition"
                                    >

                                        <td className="px-6 py-4">
                                            {site.site_name}
                                        </td>

                                        <td className="px-6 py-4">
                                            {site.energy_type}
                                        </td>

                                        <td className="px-6 py-4">

                                            <span
                                                className={`px-3 py-1 rounded-full text-sm font-medium ${
                                                        site.status === "Completed"
                                                            ? "bg-green-500/20 text-green-400"
                                                            : site.status === "In Progress"
                                                            ? "bg-yellow-500/20 text-yellow-400"
                                                            : site.status === "Pending"
                                                            ? "bg-orange-500/20 text-orange-400"
                                                            : "bg-cyan-500/20 text-cyan-400"
                                                    }`}
                                            >
                                                {site.status}
                                            </span>

                                        </td>

                                    </tr>

                                ))}

                            </tbody>

                        </table>

                    </div>

                </motion.div>
                {/* Quick Actions */}

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    className="mt-10"
                >

                    <h2 className="text-2xl font-semibold mb-6">
                        Quick Actions
                    </h2>

                    <div className="grid md:grid-cols-3 gap-6">

                        <button
                            onClick={() => navigate("/projects")}
                            className="rounded-2xl bg-blue-600 hover:bg-blue-500 transition p-6 text-left"
                        >
                            <FolderKanban size={32}/>
                            <h3 className="mt-4 text-xl font-semibold">
                                Manage Projects
                            </h3>

                            <p className="text-blue-100 mt-2">
                                Create, update and monitor renewable projects.
                            </p>
                        </button>

                        <button
                            onClick={() => navigate("/sites")}
                            className="rounded-2xl bg-cyan-600 hover:bg-cyan-500 transition p-6 text-left"
                        >
                            <MapPinned size={32}/>
                            <h3 className="mt-4 text-xl font-semibold">
                                Manage Sites
                            </h3>

                            <p className="text-cyan-100 mt-2">
                                View deployment sites and status.
                            </p>
                        </button>

                        <button
                            onClick={() => navigate("/profile")}
                            className="rounded-2xl bg-indigo-600 hover:bg-indigo-500 transition p-6 text-left"
                        >
                            <BadgeCheck size={32}/>
                            <h3 className="mt-4 text-xl font-semibold">
                                Profile
                            </h3>

                            <p className="text-indigo-100 mt-2">
                                Update your personal information.
                            </p>
                        </button>

                    </div>

                </motion.div>

                {/* User Info */}

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="mt-10 bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl border border-slate-700 p-8 shadow-xl"
                >

                    <div className="flex items-center gap-5 mb-6">

                        <div className="w-16 h-16 rounded-full bg-gradient-to-r from-cyan-400 to-blue-600 flex items-center justify-center text-2xl font-bold">

                            {user.full_name.charAt(0)}

                        </div>

                        <div>

                            <h2 className="text-2xl font-bold">
                                {user.full_name}
                            </h2>

                            <p className="text-slate-400">
                                System Administrator
                            </p>

                        </div>

                    </div>

                    <div className="space-y-3 text-lg">

                        <p>
                            <span className="text-slate-400">Email :</span>{" "}
                            {user.email}
                        </p>

                        <p>
                            <span className="text-slate-400">Role :</span>{" "}
                            <span className="capitalize text-cyan-400">
                                {user.role}
                            </span>
                        </p>

                    </div>

                </motion.div>

            </div>
        </>
    );
}

export default Dashboard;