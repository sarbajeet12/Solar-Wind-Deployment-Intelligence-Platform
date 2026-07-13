import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Dashboard() {
    const navigate = useNavigate();

    const [user, setUser] = useState(null);

    useEffect(() => {
        fetchUser();
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

    const handleLogout = () => {
        localStorage.removeItem("access_token");
        navigate("/login");
    };

    if (!user) {
        return <h2>Loading...</h2>;
    }

    return (
        <div style={{ padding: "30px" }}>
            <h1>Dashboard</h1>

            <hr />

            <h3>Welcome, {user.full_name}</h3>

            <p><strong>Email:</strong> {user.email}</p>

            <p><strong>Role:</strong> {user.role}</p>

            <br />

            <button onClick={handleLogout}>
                Logout
            </button>
        </div>
    );
}

export default Dashboard;