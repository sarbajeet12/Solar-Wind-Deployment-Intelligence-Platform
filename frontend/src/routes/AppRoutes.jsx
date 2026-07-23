import {
    BrowserRouter,
    Routes,
    Route,
    Navigate,
} from "react-router-dom";

import Login from "../pages/Login";
import Register from "../pages/Register";
import Dashboard from "../pages/Dashboard";
import Projects from "../pages/Projects";
import Sites from "../pages/Sites";
import Profile from "../pages/Profile";
import ChangePassword from "../pages/ChangePassword";
import Analysis from "../pages/Analysis";

function ProtectedRoute({ children }) {
    const token = localStorage.getItem("access_token");

    return token ? children : <Navigate to="/login" replace />;
}

function AppRoutes() {
    return (
        <BrowserRouter>
            <Routes>

                <Route
                    path="/"
                    element={
                        localStorage.getItem("access_token")
                            ? <Navigate to="/dashboard" replace />
                            : <Navigate to="/login" replace />
                    }
                />

                <Route
                    path="/login"
                    element={
                        localStorage.getItem("access_token")
                            ? <Navigate to="/dashboard" replace />
                            : <Login />
                    }
                />

                <Route
                    path="/register"
                   element={
                        localStorage.getItem("access_token")
                            ? <Navigate to="/dashboard" replace />
                            : <Register />
                    }
                />

                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/projects"
                    element={
                        <ProtectedRoute>
                            <Projects />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/sites"
                    element={
                        <ProtectedRoute>
                            <Sites />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/analysis"
                    element={
                        <ProtectedRoute>
                            <Analysis />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/profile"
                    element={
                        <ProtectedRoute>
                            <Profile />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/change-password"
                    element={
                        <ProtectedRoute>
                            <ChangePassword />
                        </ProtectedRoute>
                    }
                />

            </Routes>
        </BrowserRouter>
    );
}

export default AppRoutes;