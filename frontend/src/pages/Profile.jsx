import Navbar from "../components/Navbar";
import { useEffect, useState } from "react";
import api from "../services/api";

function Profile() {
    const [user, setUser] = useState({
        full_name: "",
        email: "",
        role: ""
    });

    const [message, setMessage] = useState("");

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await api.get("/auth/me");
            setUser(response.data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleChange = (e) => {
        setUser({
            ...user,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await api.put("/auth/profile", {
                full_name: user.full_name
            });

            setUser(response.data);
            setMessage("Profile updated successfully.");
        } catch (error) {
            console.error(error);
            setMessage("Failed to update profile.");
        }
    };

    return (
        <>
            <Navbar />
                <div style={{ padding: "40px" }}>
                    <h1>My Profile</h1>

                    <form onSubmit={handleSubmit}>

                        <div style={{ marginBottom: "15px" }}>
                            <label>Full Name</label>
                            <br />
                            <input
                                type="text"
                                name="full_name"
                                value={user.full_name}
                                onChange={handleChange}
                            />
                        </div>

                        <div style={{ marginBottom: "15px" }}>
                            <label>Email</label>
                            <br />
                            <input
                                type="email"
                                value={user.email}
                                disabled
                            />
                        </div>

                        <div style={{ marginBottom: "15px" }}>
                            <label>Role</label>
                            <br />
                            <input
                                type="text"
                                value={user.role}
                                disabled
                            />
                        </div>

                        <button type="submit">
                            Update Profile
                        </button>

                    </form>

                    {message && (
                        <p>{message}</p>
                    )}
                </div>
            </>
        );
}

export default Profile;