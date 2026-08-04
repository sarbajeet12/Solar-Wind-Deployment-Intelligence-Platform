import Navbar from "../components/layout/Navbar";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
    User,
    Save,
    Lock,
    KeyRound
} from "lucide-react";

import api from "../services/api";
import PageHeader from "../components/ui/PageHeader";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";

function Profile() {

    const [user, setUser] = useState({
        full_name: "",
        email: "",
        role: "",
    });

    const [message, setMessage] = useState("");

    const [passwordData, setPasswordData] = useState({
        current_password: "",
        new_password: "",
        confirm_password: "",
    });

    const [passwordMessage, setPasswordMessage] = useState("");

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
            [e.target.name]: e.target.value,
        });
    };

    const handlePasswordInput = (e) => {
        setPasswordData({
            ...passwordData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {

            const response = await api.put("/auth/profile", {
                full_name: user.full_name,
            });

            setUser(response.data);
            setMessage("Profile updated successfully.");

        } catch (error) {

            console.error(error);
            setMessage("Failed to update profile.");

        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();

        try {

            const response = await api.put(
                "/auth/change-password",
                passwordData
            );

            setPasswordMessage(response.data.message);

            setPasswordData({
                current_password: "",
                new_password: "",
                confirm_password: "",
            });

        } catch (error) {

            setPasswordMessage(
                error.response?.data?.detail ||
                "Something went wrong."
            );

        }
    };

    return (
        <>
            <Navbar />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="min-h-screen bg-[#050816] p-6"
            >

                <PageHeader
                    title="My Profile"
                    subtitle="Manage your personal information and account settings."
                    badge="PROFILE"
                />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">

                    {/* Profile Card */}

                    <Card hover={false}>

                        <div className="flex flex-col items-center mb-8">

                            <div className="w-24 h-24 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center shadow-xl">

                                <User size={42} className="text-white" />

                            </div>

                            <h2 className="text-2xl font-bold text-white mt-4">
                                {user.full_name || "User"}
                            </h2>

                            <p className="text-slate-400">
                                {user.role}
                            </p>

                        </div>

                        <form
                            onSubmit={handleSubmit}
                            className="space-y-5"
                        >

                            <Input
                                label="Full Name"
                                name="full_name"
                                value={user.full_name}
                                onChange={handleChange}
                                placeholder="Enter your full name"
                            />

                            <Input
                                label="Email"
                                type="email"
                                value={user.email}
                                disabled
                                className="opacity-70 cursor-not-allowed"
                            />

                            <Input
                                label="Role"
                                value={user.role}
                                disabled
                                className="opacity-70 cursor-not-allowed"
                            />

                            <Button
                                type="submit"
                                className="w-full"
                            >
                                <Save size={18} />
                                Update Profile
                            </Button>

                        </form>

                        {message && (

                            <div
                                className={`mt-5 rounded-xl px-4 py-3 text-center font-medium ${
                                    message.includes("Failed")
                                        ? "bg-red-500/20 text-red-400"
                                        : "bg-green-500/20 text-green-400"
                                }`}
                            >
                                {message}
                            </div>

                        )}

                    </Card>

                    {/* Password Card */}

                    <Card hover={false}>

                        <div className="flex items-center gap-3 mb-8">

                            <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center">

                                <Lock className="text-white" />

                            </div>

                            <div>

                                <h2 className="text-2xl font-bold text-white">
                                    Security
                                </h2>

                                <p className="text-slate-400">
                                    Change your account password
                                </p>

                            </div>

                        </div>

                        <form
                            onSubmit={handlePasswordChange}
                            className="space-y-5"
                        >

                            <Input
                                label="Current Password"
                                type="password"
                                name="current_password"
                                value={passwordData.current_password}
                                onChange={handlePasswordInput}
                                placeholder="Current Password"
                            />

                            <Input
                                label="New Password"
                                type="password"
                                name="new_password"
                                value={passwordData.new_password}
                                onChange={handlePasswordInput}
                                placeholder="New Password"
                            />

                            <Input
                                label="Confirm Password"
                                type="password"
                                name="confirm_password"
                                value={passwordData.confirm_password}
                                onChange={handlePasswordInput}
                                placeholder="Confirm Password"
                            />

                            <Button
                                type="submit"
                                className="w-full"
                            >
                                <KeyRound size={18} />
                                Change Password
                            </Button>

                        </form>

                        {passwordMessage && (

                            <div
                                className={`mt-5 rounded-xl px-4 py-3 text-center font-medium ${
                                    passwordMessage.includes("wrong") ||
                                    passwordMessage.includes("failed") ||
                                    passwordMessage.includes("Something")
                                        ? "bg-red-500/20 text-red-400"
                                        : "bg-green-500/20 text-green-400"
                                }`}
                            >
                                {passwordMessage}
                            </div>

                        )}

                    </Card>

                </div>

            </motion.div>

        </>
    );
}

export default Profile;