import { useEffect, useState } from "react";
import api from "../services/api";
import Navbar from "../components/layout/Navbar";
import StatCard from "../components/ui/StatCard";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import PageHeader from "../components/ui/PageHeader";

import {
    FolderKanban,
    Sun,
    Wind,
    BadgeCheck,
    Plus
} from "lucide-react";

import { motion } from "framer-motion";

function Projects() {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        location: "",
        energy_type: "Solar",
        status: "Planning"
    });

    const [editingId, setEditingId] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    const [message, setMessage] = useState("");
    const [isError, setIsError] = useState(false);

    useEffect(() => {
        fetchProjects();
    }, []);

    const showMessage = (text, error = false) => {
        setMessage(text);
        setIsError(error);

        setTimeout(() => {
            setMessage("");
        }, 3000);
    };

    const fetchProjects = async () => {
        try {
            const response = await api.get("/projects/");
            setProjects(response.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleEdit = (project) => {
        setEditingId(project.id);
        setIsEditing(true);

        setFormData({
            name: project.name,
            description: project.description,
            location: project.location,
            energy_type: project.energy_type,
            status: project.status
        });

        showMessage("Editing project...");
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this project?")) {
            return;
        }

        try {
            await api.delete(`/projects/${id}`);

            showMessage("Project deleted successfully.");

            await fetchProjects();

        } catch (error) {

            showMessage(
                error.response?.data?.detail ||
                "Unable to delete project.",
                true
            );
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {

            if (isEditing) {

                await api.put(`/projects/${editingId}`, formData);

                showMessage("Project updated successfully.");

            } else {

                await api.post("/projects/", {
                    name: formData.name,
                    description: formData.description,
                    location: formData.location,
                    energy_type: formData.energy_type,
                });

                showMessage("Project created successfully.");
            }

            setFormData({
                name: "",
                description: "",
                location: "",
                energy_type: "Solar",
                status: "Planning"
            });

            setEditingId(null);
            setIsEditing(false);

            await fetchProjects();

        } catch (error) {

            showMessage(
                error.response?.data?.detail ||
                "Operation failed.",
                true
            );
        }
    };

    const cancelEdit = () => {
        setEditingId(null);
        setIsEditing(false);

        setFormData({
            name: "",
            description: "",
            location: "",
            energy_type: "Solar",
            status: "Planning"
        });

        setMessage("");
        setIsError(false);
    };
    const totalProjects = projects.length;

    const solarProjects =
        projects.filter(
            p => p.energy_type === "Solar"
        ).length;

    const windProjects =
        projects.filter(
            p => p.energy_type === "Wind"
        ).length;

    const completedProjects =
        projects.filter(
            p => p.status === "Completed"
        ).length;

    if (loading) {
        return <h2>Loading Projects...</h2>;
    }

    return (
        <>
            <Navbar />

            <div className="min-h-screen bg-slate-950 text-white px-8 py-8">

                <PageHeader
    badge="Projects"
    title="Renewable Energy Projects"
    subtitle="Create, organize and manage renewable energy deployment projects from one centralized workspace."
>
    <Button>
        <Plus size={18} />
        New Project
    </Button>
</PageHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">

                    <StatCard
                        title="Projects"
                        value={totalProjects}
                        icon={FolderKanban}
                        color="from-blue-500 to-cyan-500"
                    />

                    <StatCard
                        title="Solar"
                        value={solarProjects}
                        icon={Sun}
                        color="from-yellow-400 to-orange-500"
                    />

                    <StatCard
                        title="Wind"
                        value={windProjects}
                        icon={Wind}
                        color="from-cyan-400 to-sky-500"
                    />

                    <StatCard
                        title="Completed"
                        value={completedProjects}
                        icon={BadgeCheck}
                        color="from-green-400 to-emerald-500"
                    />

                </div>

                <Card className="mb-10">

                    <h2 className="text-2xl font-bold text-white mb-6">
                        {isEditing ? "Update Project" : "Create New Project"}
                    </h2>

                    <form onSubmit={handleSubmit}>

                    <div className="mb-5">
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Project Name
                        </label>

                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none transition"
                        />
                    </div>

                    <div className="mb-5">
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Description
                        </label>

                        <textarea
                            rows={4}
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white focus:border-cyan-500 focus:outline-none transition"
                        />
                    </div>

                   <div className="mb-5">
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Location
                        </label>

                        <input
                            type="text"
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            required
                            className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none transition"
                        />
                    </div>

                    <div className="mb-5">
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Energy Type
                        </label>

                        <select
                            name="energy_type"
                            value={formData.energy_type}
                            onChange={handleChange}
                            className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white focus:border-cyan-500 focus:outline-none transition"
                        >
                            <option value="Solar">Solar</option>
                            <option value="Wind">Wind</option>
                        </select>
                    </div>

                    <div className="mb-5">
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Status
                        </label>

                        <select
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white focus:border-cyan-500 focus:outline-none transition"
                        >
                            <option value="Planning">Planning</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                        </select>
                    </div>

                    <Button type="submit">
                        {isEditing ? "Update Project" : "Create Project"}
                    </Button>

                    {isEditing && (
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={cancelEdit}
                            className="ml-3"
                        >
                            Cancel
                        </Button>
                    )}

                </form>
            </Card>


                {message && (
                    <p
                        style={{
                            color: isError ? "red" : "green",
                            marginTop: "20px",
                            fontWeight: "bold"
                        }}
                    >
                        {message}
                    </p>
                )}

                <hr style={{ margin: "40px 0" }} />

                <h2>Existing Projects</h2>

                {projects.length === 0 ? (
                    <p>No projects found.</p>
                ) : (
                    <table
                        border="1"
                        cellPadding="10"
                        style={{
                            width: "100%",
                            borderCollapse: "collapse"
                        }}
                    >
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Description</th>
                                <th>Location</th>
                                <th>Energy Type</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {projects.map((project) => (
                                <tr key={project.id}>
                                    <td>{project.id}</td>
                                    <td>{project.name}</td>
                                    <td>{project.description}</td>
                                    <td>{project.location}</td>
                                    <td>{project.energy_type}</td>
                                    <td>{project.status}</td>

                                    <td>

                                        <button
                                            onClick={() => handleEdit(project)}
                                        >
                                            Edit
                                        </button>

                                        {" "}

                                        <button
                                            onClick={() => handleDelete(project.id)}
                                            style={{
                                                backgroundColor: "red",
                                                color: "white"
                                            }}
                                        >
                                            Delete
                                        </button>

                                    </td>

                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

            </div>
        </>
    );
}

export default Projects;