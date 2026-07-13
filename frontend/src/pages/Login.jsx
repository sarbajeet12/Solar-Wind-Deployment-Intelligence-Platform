import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";

function Login() {
    const navigate = useNavigate();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const formData = new URLSearchParams();
            formData.append("username", username);
            formData.append("password", password);

            const response = await api.post(
                "/auth/login",
                formData,
                {
                    headers: {
                        "Content-Type":
                            "application/x-www-form-urlencoded",
                    },
                }
            );

            localStorage.setItem(
                "access_token",
                response.data.access_token
            );

            alert("Login Successful!");

            navigate("/dashboard");

        } catch (error) {
            console.error(error);

            alert(
                error.response?.data?.detail ||
                "Invalid Username or Password"
            );
        }
    };

    return (
        <div
            style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100vh",
                background: "#f5f5f5",
            }}
        >
            <form
                onSubmit={handleLogin}
                style={{
                    display: "flex",
                    flexDirection: "column",
                    width: "320px",
                    gap: "15px",
                    background: "#fff",
                    padding: "30px",
                    borderRadius: "8px",
                    boxShadow: "0 0 10px rgba(0,0,0,0.1)",
                }}
            >
                <h2 style={{ textAlign: "center" }}>
                    Login
                </h2>

                <input
                    type="text"
                    placeholder="Email"
                    value={username}
                    onChange={(e) =>
                        setUsername(e.target.value)
                    }
                    required
                    style={{
                        padding: "10px",
                        fontSize: "16px",
                    }}
                />

                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) =>
                        setPassword(e.target.value)
                    }
                    required
                    style={{
                        padding: "10px",
                        fontSize: "16px",
                    }}
                />

                <button
                    type="submit"
                    style={{
                        padding: "10px",
                        background: "#1976d2",
                        color: "white",
                        border: "none",
                        borderRadius: "5px",
                        cursor: "pointer",
                        fontSize: "16px",
                    }}
                >
                    Login
                </button>

                <p
                    style={{
                        textAlign: "center",
                        marginTop: "10px",
                    }}
                >
                    Don't have an account?{" "}
                    <Link to="/register">
                        Register
                    </Link>
                </p>
            </form>
        </div>
    );
}

export default Login;