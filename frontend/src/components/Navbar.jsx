import { Link, useNavigate } from "react-router-dom";

function Navbar() {
    const navigate = useNavigate();

    const logout = () => {
        localStorage.removeItem("access_token");
        navigate("/login");
    };

    return (
        <nav
            style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "15px 30px",
                background: "#1976d2",
                color: "white"
            }}
        >
            <h2>Solar & Wind Deployment</h2>

            <div
                style={{
                    display: "flex",
                    gap: "20px",
                    alignItems: "center"
                }}
            >
                <Link to="/dashboard" style={{ color: "white" }}>
                    Dashboard
                </Link>

                <Link to="/projects" style={{ color: "white" }}>
                    Projects
                </Link>

                <Link to="/sites" style={{ color: "white" }}>
                    Sites
                </Link>

                <Link to="/profile" style={{ color: "white" }}>
                    Profile
                </Link>

                <Link to="/change-password" style={{ color: "white" }}>
                    Change Password
                </Link>

                <button
                    onClick={logout}
                    style={{
                        cursor: "pointer",
                        padding: "6px 12px"
                    }}
                >
                    Logout
                </button>
            </div>
        </nav>
    );
}

export default Navbar;