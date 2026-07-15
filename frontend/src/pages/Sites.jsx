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
        project_id: ""
    });

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
        console.log("Token:", localStorage.getItem("access_token"));

        const response = await api.get("/projects/");

        console.log("Projects:", response.data);

        setProjects(response.data);

    } catch (error) {
        console.log("Status:", error.response?.status);
        console.log("Response:", error.response?.data);
        console.error(error);
    }
};

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {

            await api.post("/sites/", {
                ...formData,
                latitude: parseFloat(formData.latitude),
                longitude: parseFloat(formData.longitude),
                project_id: parseInt(formData.project_id)
            });

            alert("Site created successfully.");

            setFormData({
                site_name: "",
                latitude: "",
                longitude: "",
                state: "",
                district: "",
                energy_type: "Solar",
                project_id: ""
            });

            fetchSites();

        } catch (error) {
            console.error(error);
            alert("Unable to create site.");
        }
    };

    if (loading) {
        return <h2>Loading...</h2>;
    }

    return (
        <div style={{ padding: "40px" }}>

            <h1>Site Management</h1>

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

                <button type="submit">
                    Create Site
                </button>

            </form>

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
                            </tr>

                        ))}

                    </tbody>

                </table>

            )}

        </div>
    );
}

export default Sites;