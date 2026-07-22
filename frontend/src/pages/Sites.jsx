import Navbar from "../components/Navbar";
import { useEffect, useState } from "react";
import api from "../services/api";

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

    return (
        <>
            <Navbar />

        <div style={{ padding: "40px" }}>

            <h1>Site Management</h1>

            <h2>
                {isEditing ? "Update Site" : "Create Site"}
            </h2>

            <form onSubmit={handleSubmit}>

                <div>
                    <label>Site Name</label><br />
                    <input
                        name="site_name"
                        value={formData.site_name}
                        onChange={handleChange}
                        required
                    />
                </div>

                <br />

                <div>
                    <label>Latitude</label><br />
                    <input
                        name="latitude"
                        type="number"
                        step="any"
                        value={formData.latitude}
                        onChange={handleChange}
                        required
                    />
                </div>

                <br />

                <div>
                    <label>Longitude</label><br />
                    <input
                        name="longitude"
                        type="number"
                        step="any"
                        value={formData.longitude}
                        onChange={handleChange}
                        required
                    />
                </div>

                <br />

                <div>
                    <label>State</label><br />
                    <input
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        required
                    />
                </div>

                <br />

                <div>
                    <label>District</label><br />
                    <input
                        name="district"
                        value={formData.district}
                        onChange={handleChange}
                        required
                    />
                </div>

                <br />

                <div>
                    <label>Energy Type</label><br />
                    <select
                        name="energy_type"
                        value={formData.energy_type}
                        onChange={handleChange}
                    >
                        <option value="Solar">Solar</option>
                        <option value="Wind">Wind</option>
                    </select>
                </div>

                <br />

                <div>
                    <label>Project</label><br />

                    <select
                        name="project_id"
                        value={formData.project_id}
                        onChange={handleChange}
                        required
                    >
                        <option value="">
                            Select Project
                        </option>

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

                <br />

                <div>
                    <label>Status</label><br />

                    <select
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                    >
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                    </select>

                </div>

                <br />

                <button type="submit">
                    {isEditing ? "Update Site" : "Create Site"}
                </button>

                {isEditing && (
                    <button
                        type="button"
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
                                status: "Pending"
                            });

                            setMessage("");
                        }}
                        style={{ marginLeft: "10px" }}
                    >
                        Cancel
                    </button>
                )}

            </form>

            {message && (
                <p
                    style={{
                        color:
                            message.includes("failed") ||
                            message.includes("Unable")
                                ? "red"
                                : "green",
                        marginTop: "20px",
                        fontWeight: "bold"
                    }}  
                >
                    {message}
                </p>
            )}

            <hr />

            <h2>Existing Sites</h2>

            {sites.length === 0 ? (
                <p>No sites found.</p>
            ) : (

                <table
                    border="1"
                    cellPadding="10"
                    style={{
                        borderCollapse: "collapse",
                        width: "100%"
                    }}
                >

                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Site Name</th>
                            <th>Latitude</th>
                            <th>Longitude</th>
                            <th>State</th>
                            <th>District</th>
                            <th>Energy</th>
                            <th>Status</th>
                            <th>Project ID</th>
                            <th>Actions</th>
                        </tr>
                    </thead>

                    <tbody>

                        {sites.map((site) => (

                           <tr key={site.id}>
                                <td>{site.id}</td>
                                <td>{site.site_name}</td>
                                <td>{site.latitude}</td>
                                <td>{site.longitude}</td>
                                <td>{site.state}</td>
                                <td>{site.district}</td>
                                <td>{site.energy_type}</td>
                                <td>{site.status}</td>
                                <td>{site.project_id}</td>

                                <td>

                                    <button
                                        onClick={() => handleEdit(site)}
                                    >
                                        Edit
                                    </button>

                                    {" "}

                                    <button
                                        onClick={() => handleDelete(site.id)}
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

export default Sites;
