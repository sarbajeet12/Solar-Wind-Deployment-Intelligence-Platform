import Navbar from "../components/Navbar";
import { useState } from "react";
import api from "../services/api";

function ChangePassword() {
    const [formData, setFormData] = useState({
        current_password: "",
        new_password: "",
        confirm_password: ""
    });

    const [message, setMessage] = useState("");

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await api.put(
                "/auth/change-password",
                formData
            );

            setMessage(response.data.message);

            setFormData({
                current_password: "",
                new_password: "",
                confirm_password: ""
            });

        } catch (error) {
            setMessage(
                error.response?.data?.detail ||
                "Something went wrong."
            );
        }
    };

    return (
        <>
            <Navbar />
                <div style={{ padding: "40px" }}>
                    <h1>Change Password</h1>

                    <form onSubmit={handleSubmit}>

                        <div style={{ marginBottom: "15px" }}>
                            <label>Current Password</label>
                            <br />
                            <input
                                type="password"
                                name="current_password"
                                value={formData.current_password}
                                onChange={handleChange}
                            />
                        </div>

                        <div style={{ marginBottom: "15px" }}>
                            <label>New Password</label>
                            <br />
                            <input
                                type="password"
                                name="new_password"
                                value={formData.new_password}
                                onChange={handleChange}
                            />
                        </div>

                        <div style={{ marginBottom: "15px" }}>
                            <label>Confirm Password</label>
                            <br />
                            <input
                                type="password"
                                name="confirm_password"
                                value={formData.confirm_password}
                                onChange={handleChange}
                            />
                        </div>

                        <button type="submit">
                            Change Password
                        </button>

                    </form>

                    {message && (
                        <p>{message}</p>
                    )}
                </div>
            </>
            );
        }

        export default ChangePassword;