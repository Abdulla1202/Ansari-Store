import { useState } from "react";
import apiInstance from "../../utils/axios";
import Swal from "sweetalert2";

function ForgotPassword() {

    const [email, setEmail] = useState("");

    const [otpSent, setOtpSent] = useState(false);

    const [otp, setOtp] = useState("");

    const [password, setPassword] = useState("");

    const [confirmPassword, setConfirmPassword] = useState("");

    const [loading, setLoading] = useState(false);


    // -------------------------
    // Send OTP
    // -------------------------

    const handleSendOTP = async () => {

        if (!email.trim()) {

            Swal.fire({
                icon: "warning",
                title: "Email Required",
                text: "Please enter your email address.",
            });

            return;
        }

        try {

            setLoading(true);

            const response = await apiInstance.get(
                `user/password-reset/${encodeURIComponent(
                    email.trim()
                )}/`
            );

            console.log(
                "OTP RESPONSE:",
                response.data
            );

            setOtpSent(true);

            Swal.fire({
                icon: "success",
                title: "OTP Sent",
                text: response.data.message,
            });

        } catch (error) {

            console.error(
                "OTP ERROR:",
                error.response?.data || error
            );

            Swal.fire({
                icon: "error",
                title: "Failed",
                text:
                    error.response?.data?.message ||
                    error.response?.data?.error ||
                    "Unable to send OTP.",
            });

        } finally {

            setLoading(false);

        }
    };


    // -------------------------
    // Change Password
    // -------------------------

    const handleChangePassword = async (e) => {

        e.preventDefault();

        if (!otp.trim()) {

            Swal.fire({
                icon: "warning",
                title: "OTP Required",
                text: "Please enter the OTP.",
            });

            return;
        }


        if (!password) {

            Swal.fire({
                icon: "warning",
                title: "Password Required",
                text: "Please enter a new password.",
            });

            return;
        }


        if (password.length < 8) {

            Swal.fire({
                icon: "warning",
                title: "Weak Password",
                text: "Password must be at least 8 characters.",
            });

            return;
        }


        if (password !== confirmPassword) {

            Swal.fire({
                icon: "warning",
                title: "Password Mismatch",
                text: "Passwords do not match.",
            });

            return;
        }


        try {

            setLoading(true);

            const response = await apiInstance.post(
                "user/password-change/",
                {
                    email: email.trim(),
                    otp: otp.trim(),
                    password: password,
                }
            );

            console.log(
                "PASSWORD CHANGE RESPONSE:",
                response.data
            );

            Swal.fire({
                icon: "success",
                title: "Password Changed!",
                text: "Your password has been changed successfully.",
                confirmButtonText: "Login",
            }).then(() => {

                window.location.href = "/login/";

            });

        } catch (error) {

            console.error(
                "PASSWORD CHANGE ERROR:",
                error.response?.data || error
            );

            Swal.fire({
                icon: "error",
                title: "Failed",
                text:
                    error.response?.data?.message ||
                    "Unable to change password.",
            });

        } finally {

            setLoading(false);

        }
    };


    return (
        <div className="container">

            <div className="row justify-content-center">

                <div className="col-lg-5">

                    <div className="card mt-5 p-4">

                        <h3 className="mb-4">
                            Forgot Password
                        </h3>


                        {/* EMAIL */}

                        <div className="mb-3">

                            <label className="form-label">
                                Email Address
                            </label>

                            <input
                                type="email"
                                className="form-control"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) =>
                                    setEmail(e.target.value)
                                }
                                disabled={otpSent}
                            />

                        </div>


                        {!otpSent && (

                            <button
                                type="button"
                                className="btn btn-primary w-100"
                                onClick={handleSendOTP}
                                disabled={loading}
                            >

                                {loading
                                    ? "Sending OTP..."
                                    : "Send OTP"
                                }

                            </button>

                        )}


                        {/* OTP + PASSWORD */}

                        {otpSent && (

                            <form
                                onSubmit={handleChangePassword}
                            >

                                <div className="mb-3">

                                    <label className="form-label">
                                        Enter OTP
                                    </label>

                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Enter OTP"
                                        value={otp}
                                        onChange={(e) =>
                                            setOtp(e.target.value)
                                        }
                                    />

                                </div>


                                <div className="mb-3">

                                    <label className="form-label">
                                        New Password
                                    </label>

                                    <input
                                        type="password"
                                        className="form-control"
                                        placeholder="Enter new password"
                                        value={password}
                                        onChange={(e) =>
                                            setPassword(e.target.value)
                                        }
                                    />

                                </div>


                                <div className="mb-3">

                                    <label className="form-label">
                                        Confirm Password
                                    </label>

                                    <input
                                        type="password"
                                        className="form-control"
                                        placeholder="Confirm new password"
                                        value={confirmPassword}
                                        onChange={(e) =>
                                            setConfirmPassword(
                                                e.target.value
                                            )
                                        }
                                    />

                                </div>


                                <button
                                    type="submit"
                                    className="btn btn-success w-100"
                                    disabled={loading}
                                >

                                    {loading
                                        ? "Changing Password..."
                                        : "Change Password"
                                    }

                                </button>

                            </form>

                        )}

                    </div>

                </div>

            </div>

        </div>
    );
}

export default ForgotPassword;