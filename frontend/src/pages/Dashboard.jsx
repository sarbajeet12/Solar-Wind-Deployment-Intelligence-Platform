import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";

function Dashboard() {
    const navigate = useNavigate();

    const [user, setUser] = useState(null);

    const [stats, setStats] = useState({
        projects: 0,
        sites: 0,
        solar: 0,
        wind: 0,
        pending: 0,
        completed: 0
    });

    useEffect(() => {
        fetchUser();
        fetchStats();
    }, []);

    const fetchUser = async () => {
        try {
            const response = await api.get("/auth/me");
            setUser(response.data);
        } catch (error) {
            alert("Session expired. Please login again.");
            localStorage.removeItem("access_token");
            navigate("/login");
        }
    };
    
    const fetchStats = async () => {
        try {
            const response = await api.get("/dashboard/stats");
            setStats(response.data);
        } catch (error) {

            console.error(error);
        }
    };

    if (!user) {
        return <h2>Loading...</h2>;
    }

    return (
        <>
            <Navbar />

            <div style={{ padding: "30px" }}>
                <h1>Dashboard</h1>

                <hr />

                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(3, 1fr)",
                        gap: "20px",
                        marginBottom: "30px"
                    }}
                >

                    <div style={{
                        border: "1px solid #ddd",
                        padding: "20px",
                        borderRadius: "10px",
                        textAlign: "center"
                    }}>
                        <h3>Total Projects</h3>
                        <h2>{stats.projects}</h2>
                    </div>

                    <div style={{
                        border: "1px solid #ddd",
                        padding: "20px",
                        borderRadius: "10px",
                        textAlign: "center"
                    }}>
                        <h3>Total Sites</h3>
                        <h2>{stats.sites}</h2>
                    </div>

                    <div style={{
                        border: "1px solid #ddd",
                        padding: "20px",
                        borderRadius: "10px",
                        textAlign: "center"
                    }}>
                        <h3>Solar Sites</h3>
                        <h2>{stats.solar}</h2>
                    </div>

                    <div style={{
                        border: "1px solid #ddd",
                        padding: "20px",
                        borderRadius: "10px",
                        textAlign: "center"
                    }}>
                        <h3>Wind Sites</h3>
                        <h2>{stats.wind}</h2>
                    </div>

                    <div style={{
                        border: "1px solid #ddd",
                        padding: "20px",
                        borderRadius: "10px",
                        textAlign: "center"
                    }}>
                        <h3>Pending Sites</h3>
                        <h2>{stats.pending}</h2>
                    </div>

                    <div style={{
                        border: "1px solid #ddd",
                        padding: "20px",
                        borderRadius: "10px",
                        textAlign: "center"
                    }}>
                        <h3>Completed Sites</h3>
                        <h2>{stats.completed}</h2>
                    </div>

                </div>

                <h3>Welcome, {user.full_name}</h3>

                <p>
                    <strong>Email:</strong> {user.email}
                </p>

                <p>
                    <strong>Role:</strong> {user.role}
                </p>
            </div>
        </>
    );
}

export default Dashboard;