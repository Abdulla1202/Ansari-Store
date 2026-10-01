import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import apiInstance from "../../utils/axios";
import Swal from "sweetalert2";

function ChangePassword() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        current_password: "",
        new_password: "",
        confirm_password: "",
    });

    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Check empty fields
        if (
            !formData.current_password ||
            !formData.new_password ||
            !formData.confirm_password
        ) {
            Swal.fire({
                icon: "warning",
                title: "All fields are required",
            });
            return;
        }

        // Check password match
        if (formData.new_password !== formData.confirm_password) {
            Swal.fire({
                icon: "warning",
                title: "Passwords do not match",
            });
            return;
        }

        // Check password length
        if (formData.new_password.length < 8) {
            Swal.fire({
                icon: "warning",
                title: "Password must be at least 8 characters",
            });
            return;
        }

        setLoading(true);

        try {
            const response = await apiInstance.post(
                "user/password-change-auth/",
                {
                    current_password: formData.current_password,
                    new_password: formData.new_password,
                    confirm_password: formData.confirm_password,
                }
            );
// Success
            await Swal.fire({
                icon: "success",
                title: "Password Changed",
                text:
                    response.data?.message ||
                    "Password changed successfully",
            });

            // Clear form
            setFormData({
                current_password: "",
                new_password: "",
                confirm_password: "",
            });

            // Go back to account
            navigate("/customer/account/");

        } catch (error) {
            console.error("Password change error:", error);
            console.error("STATUS:", error.response?.status);
            console.error("DATA:", error.response?.data);

            Swal.fire({
                icon: "error",
                title: "Password Change Failed",
                text:
                    error.response?.data?.message ||
                    error.response?.data?.detail ||
                    "Password change failed",
            });

        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container-fluid">
            <div className="row">

                {/* Sidebar */}
                <Sidebar />

                {/* Main Content */}
                <div className="col-lg-9 col-md-9 p-4">

                    <div className="card shadow-sm p-4">

                        <h3 className="mb-4">
                            Change Password
                        </h3>

                        <form onSubmit={handleSubmit}>

                            {/* Current Password */}
                            <div className="mb-3">
                                <label className="form-label">
                                    Current Password
                                </label>

                                <input
                                    type="password"
                                    name="current_password"
                                    className="form-control"
                                    placeholder="Enter current password"
                                    value={formData.current_password}
                                    onChange={handleChange}
                                />
                            </div>

                            {/* New Password */}
                            <div className="mb-3">
                                <label className="form-label">
                                    New Password
                                </label>

                                <input
                                    type="password"
                                    name="new_password"
                                    className="form-control"
                                    placeholder="Enter new password"
                                    value={formData.new_password}
                                    onChange={handleChange}
                                />
                            </div>

                            {/* Confirm Password */}
                            <div className="mb-3">
                                <label className="form-label">
                                    Confirm New Password
                                </label>

                                <input
                                    type="password"
                                    name="confirm_password"
                                    className="form-control"
                                    placeholder="Confirm new password"
                                    value={formData.confirm_password}
                                    onChange={handleChange}
                                />
                            </div>

                            {/* Button */}
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={loading}
                            >
                                {loading
                                    ? "Changing..."
                                    : "Change Password"}
                            </button>

                        </form>

                    </div>

                </div>
            </div>
        </div>
    );
}

export default ChangePassword;