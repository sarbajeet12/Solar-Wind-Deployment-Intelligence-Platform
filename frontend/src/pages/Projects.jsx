import { useEffect, useState } from "react";
import api from "../services/api";

function Projects() {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        location: "",
        energy_type: "Solar"
    });

    const [editingId, setEditingId] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    const [message, setMessage] = useState("");
    const [isError, setIsError] = useState(false);

    useEffect(() => {
        fetchProjects();
    }, []);

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
            energy_type: project.energy_type
        });

        setMessage("Editing project...");
        setIsError(false);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this project?")) {
            return;
        }

        try {
            await api.delete(`/projects/${id}`);

            setMessage("Project deleted successfully.");
            setIsError(false);

            await fetchProjects();

        } catch (error) {
            setMessage(
                error.response?.data?.detail ||
                "Unable to delete project."
            );
            setIsError(true);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {

            if (isEditing) {

                await api.put(`/projects/${editingId}`, {
                    ...formData,
                    status: "Planning"
                });

                setMessage("Project updated successfully.");

            } else {

                await api.post("/projects/", formData);

                setMessage("Project created successfully.");
            }

            setIsError(false);

            setFormData({
                name: "",
                description: "",
                location: "",
                energy_type: "Solar"
            });

            setEditingId(null);
            setIsEditing(false);

            await fetchProjects();

        } catch (error) {

            setMessage(
                error.response?.data?.detail ||
                "Operation failed."
            );

            setIsError(true);
        }
    };

    const cancelEdit = () => {
        setEditingId(null);
        setIsEditing(false);

        setFormData({
            name: "",
            description: "",
            location: "",
            energy_type: "Solar"
        });

        setMessage("");
        setIsError(false);
    };

    if (loading) {
        return <h2>Loading Projects...</h2>;
    }

    return (
        <div style={{ padding: "40px" }}>

            <h1>Project Management</h1>

            <h2>
                {isEditing ? "Update Project" : "Create New Project"}
            </h2>

            <form onSubmit={handleSubmit}>

                <div style={{ marginBottom: "15px" }}>
                    <label>Project Name</label>
                    <br />
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div style={{ marginBottom: "15px" }}>
                    <label>Description</label>
                    <br />
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                    />
                </div>

                <div style={{ marginBottom: "15px" }}>
                    <label>Location</label>
                    <br />
                    <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div style={{ marginBottom: "20px" }}>
                    <label>Energy Type</label>
                    <br />
                    <select
                        name="energy_type"
                        value={formData.energy_type}
                        onChange={handleChange}
                    >
                        <option value="Solar">Solar</option>
                        <option value="Wind">Wind</option>
                    </select>
                </div>

                <button type="submit">
                    {isEditing ? "Update Project" : "Create Project"}
                </button>

                {isEditing && (
                    <button
                        type="button"
                        onClick={cancelEdit}
                        style={{ marginLeft: "10px" }}
                    >
                        Cancel
                    </button>
                )}

            </form>

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
    );
}

export default Projects;