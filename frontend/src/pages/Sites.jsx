import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Navbar from "../components/layout/Navbar";
import { useEffect, useState } from "react";
import api from "../services/api";
import StatCard from "../components/ui/StatCard";
import Button from "../components/ui/Button";
import PageHeader from "../components/ui/PageHeader";

import {
    MapPinned,
    Sun,
    Wind,
    CheckCircle,
    Plus
} from "lucide-react";

import { motion } from "framer-motion";

function Sites() {
    const [sites, setSites] = useState([]);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    const [formData, setFormData] = useState({
        site_name: "",
        latitude: "",
        longitude: "",
        state: "",
        district: "",
        energy_type: "Solar",
        project_id: "",
        status: "Pending"
    });

    const [editingId, setEditingId] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {
        fetchSites();
        fetchProjects();
    }, []);

    const fetchSites = async () => {
        try {
            const response = await api.get("/sites/");
            setSites(response.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchProjects = async () => {
        try {
            const response = await api.get("/projects/");
            setProjects(response.data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleChange = (e) => {
    setFormData({
        ...formData,
        [e.target.name]: e.target.value
    });
};

    const handleEdit = (site) => {

    setEditingId(site.id);
    setIsEditing(true);

    setFormData({
        site_name: site.site_name,
        latitude: site.latitude,
        longitude: site.longitude,
        state: site.state,
        district: site.district,
        energy_type: site.energy_type,
        project_id: String(site.project_id),
        status: site.status
    });

    setMessage("Editing site...");
};

const handleDelete = async (id) => {

    if (!window.confirm("Are you sure you want to delete this site?")) {
        return;
    }

    try {

        await api.delete(`/sites/${id}`);

        setMessage("Site deleted successfully.");

        fetchSites();

    } catch (error) {

        setMessage(
            error.response?.data?.detail ||
            "Unable to delete site."
        );

    }

};

const handleSubmit = async (e) => {
    e.preventDefault();

    try {

        if (isEditing) {

            await api.put(`/sites/${editingId}`, {
                ...formData,
                latitude: parseFloat(formData.latitude),
                longitude: parseFloat(formData.longitude),
                project_id: parseInt(formData.project_id)
            });

            setMessage("Site updated successfully.");

        } else {

            await api.post("/sites/", {
                site_name: formData.site_name,
                latitude: parseFloat(formData.latitude),
                longitude: parseFloat(formData.longitude),
                state: formData.state,
                district: formData.district,
                energy_type: formData.energy_type,
                project_id: parseInt(formData.project_id)
            });

            setMessage("Site created successfully.");
        }

        setFormData({
            site_name: "",
            latitude: "",
            longitude: "",
            state: "",
            district: "",
            energy_type: "Solar",
            project_id: "",
            status: "Pending"
        });

        setEditingId(null);
        setIsEditing(false);

        await fetchSites();

    } catch (error) {

        console.error(error);

        setMessage(
            error.response?.data?.detail ||
            "Operation failed."
        );

    }
};

    if (loading) {
        return <h2>Loading...</h2>;
    }
const solarCount = sites.filter(
    (site) => site.energy_type === "Solar"
).length;

const windCount = sites.filter(
    (site) => site.energy_type === "Wind"
).length;

const completedCount = sites.filter(
    (site) => site.status === "Completed"
).length;

   return (
<>
    <Navbar />

    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="min-h-screen bg-[#050816] p-6"
    >

        <PageHeader
            title="Renewable Energy Sites"
            subtitle="Manage solar and wind deployment sites with geolocation and project mapping."
            badge="SITES"
            action={
                <Button icon={Plus}>
                    New Site
                </Button>
            }
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mt-8">

            <StatCard
                title="Sites"
                value={sites.length}
                icon={MapPinned}
                color="from-cyan-500 to-blue-500"
            />

            <StatCard
                title="Solar"
                value={solarCount}
                icon={Sun}
                color="from-yellow-500 to-orange-500"
            />

            <StatCard
                title="Wind"
                value={windCount}
                icon={Wind}
                color="from-sky-500 to-cyan-400"
            />

            <StatCard
                title="Completed"
                value={completedCount}
                icon={CheckCircle}
                color="from-green-500 to-emerald-400"
            />

        </div>

        <div className="mt-8">


            <Card className="mt-8" hover={false}>

    <h2 className="text-2xl font-bold text-white mb-8">
        {isEditing ? "Update Site" : "Create New Site"}
    </h2>

    <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
    >

        <Input
            label="Site Name"
            name="site_name"
            value={formData.site_name}
            onChange={handleChange}
            placeholder="Enter Site Name"
            required
        />

        <Input
            label="State"
            name="state"
            value={formData.state}
            onChange={handleChange}
            placeholder="Odisha"
            required
        />

        <Input
            label="Latitude"
            name="latitude"
            type="number"
            step="any"
            value={formData.latitude}
            onChange={handleChange}
            placeholder="20.2961"
            required
        />

        <Input
            label="Longitude"
            name="longitude"
            type="number"
            step="any"
            value={formData.longitude}
            onChange={handleChange}
            placeholder="85.8245"
            required
        />

        <Input
            label="District"
            name="district"
            value={formData.district}
            onChange={handleChange}
            placeholder="Khordha"
            required
        />

        <div>

            <label className="block mb-2 text-sm font-medium text-slate-300">
                Energy Type
            </label>

            <select
                name="energy_type"
                value={formData.energy_type}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-cyan-500"
            >
                <option value="Solar">Solar</option>
                <option value="Wind">Wind</option>
            </select>

        </div>

        <div>

            <label className="block mb-2 text-sm font-medium text-slate-300">
                Project
            </label>

            <select
                name="project_id"
                value={formData.project_id}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-cyan-500"
                required
            >

                <option value="">Select Project</option>

                {projects.map((project) => (
                    <option
                        key={project.id}
                        value={project.id}
                    >
                        {project.name}
                    </option>
                ))}

            </select>

        </div>

        <div>

            <label className="block mb-2 text-sm font-medium text-slate-300">
                Status
            </label>

            <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-cyan-500"
            >
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
            </select>

        </div>

        <div className="md:col-span-2 flex gap-4 mt-4">

            <Button type="submit">

                {isEditing
                    ? "Update Site"
                    : "Create Site"}

            </Button>

            {isEditing && (

                <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {

                        setIsEditing(false);
                        setEditingId(null);

                        setFormData({
                            site_name: "",
                            latitude: "",
                            longitude: "",
                            state: "",
                            district: "",
                            energy_type: "Solar",
                            project_id: "",
                            status: "Pending",
                        });

                        setMessage("");

                    }}
                >
                    Cancel
                </Button>

            )}

        </div>

    </form>

</Card>

{message && (
    <p
        style={{
            color:
                message.includes("failed") ||
                message.includes("Unable")
                    ? "red"
                    : "green",
            marginTop: "20px",
            fontWeight: "bold",
        }}
    >
        {message}
    </p>
)}

<hr />
<Card className="mt-8">

    <h2 className="text-2xl font-bold text-white mb-6">
        Existing Sites
    </h2>

    <div className="overflow-x-auto">

        <table className="w-full text-sm">

            <thead>

                <tr className="border-b border-slate-700 text-slate-400">

                    <th className="text-left py-3 px-3">Site</th>
                    <th className="text-left py-3 px-3">Project</th>
                    <th className="text-left py-3 px-3">Energy</th>
                    <th className="text-left py-3 px-3">State</th>
                    <th className="text-left py-3 px-3">District</th>
                    <th className="text-left py-3 px-3">Status</th>
                    <th className="text-center py-3 px-3">Actions</th>

                </tr>

            </thead>

            <tbody>

                {sites.map((site) => (

                    <tr
                        key={site.id}
                        className="border-b border-slate-800 hover:bg-slate-800/50 transition"
                    >

                        <td className="py-4 px-3 font-medium text-white">
                            {site.site_name}
                        </td>

                        <td className="py-4 px-3 text-slate-300">
                            {site.project_id}
                        </td>

                        <td className="py-4 px-3 text-slate-300">
                            {site.energy_type}
                        </td>

                        <td className="py-4 px-3 text-slate-300">
                            {site.state}
                        </td>

                        <td className="py-4 px-3 text-slate-300">
                            {site.district}
                        </td>

                        <td className="py-4 px-3">

                            <span
                                className={`px-3 py-1 rounded-full text-xs font-semibold
                                ${
                                    site.status === "Completed"
                                        ? "bg-green-500/20 text-green-400"
                                        : site.status === "In Progress"
                                        ? "bg-yellow-500/20 text-yellow-400"
                                        : "bg-blue-500/20 text-blue-400"
                                }`}
                            >
                                {site.status}
                            </span>

                        </td>

                        <td className="py-4 px-3 flex justify-center gap-3">

                            <Button
                                variant="secondary"
                                onClick={() => handleEdit(site)}
                            >
                                Edit
                            </Button>

                            <Button
                                variant="danger"
                                onClick={() => handleDelete(site.id)}
                            >
                                Delete
                            </Button>

                        </td>

                    </tr>

                ))}

            </tbody>

        </table>

    </div>

</Card>
</div>
</motion.div>

</>
);
}

export default Sites;