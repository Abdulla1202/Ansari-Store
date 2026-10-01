import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import UseProfileData from "../plugin/UseProfileData";

function Sidebar() {
    const userProfile = UseProfileData();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (userProfile) {
            setLoading(false);
        }
    }, [userProfile]);

    return (
        <div className="col-lg-3">

            {!loading && userProfile && (
                <>
                    <div className="d-flex justify-content-center align-items-center flex-column mb-4 shadow rounded-3">

                        <img
                            src={userProfile?.image || ""}
                            style={{
                                width: 120,
                                height: 120,
                                borderRadius: "50%",
                                objectFit: "cover",
                            }}
                            alt=""
                        />

                        <div className="text-center">
                            <h3 className="mb-0">
                                {userProfile?.full_name || ''}
                            </h3>

                            <p className="mt-0">
                                <Link to="/customer/settings/">
                                    <i className="fas fa-edit me-2"></i>
                                    Edit Account
                                </Link>
                            </p>
                        </div>
                    </div>

                    <ol className="list-group">

                        <li className="list-group-item">
                            <Link
                                to="/customer/account/"
                                className="fw-bold text-dark"
                            >
                                <i className="fas fa-user me-2"></i>
                                Account
                            </Link>
                        </li>

                        <li className="list-group-item">
                            <Link
                                to="/customer/orders/"
                                className="fw-bold text-dark"
                            >
                                <i className="fas fa-shopping-cart me-2"></i>
                                Orders
                            </Link>
                        </li>

                        <li className="list-group-item">
                            <Link
                                to="/track-order/"
                                className="fw-bold text-dark d-flex align-items-center justify-content-between"
                            >
                                <span>
                                    <i className="fas fa-truck text-warning me-2"></i>
                                    Track Order
                                </span>
                                <span className="badge bg-warning text-dark rounded-pill" style={{ fontSize: "0.7rem" }}>Live</span>
                            </Link>
                        </li>

                        <li className="list-group-item">
                            <Link
                                to="/customer/wishlist/"
                                className="fw-bold text-dark"
                            >
                                <i className="fas fa-heart text-danger me-2"></i>
                                Wishlist
                            </Link>
                        </li>

                        <li className="list-group-item">
                            <Link
                                to="/customer/notifications/"
                                className="fw-bold text-dark"
                            >
                                <i className="fas fa-bell text-primary me-2"></i>
                                Notifications
                            </Link>
                        </li>

                        <li className="list-group-item">
                            <Link
                                to="/customer/settings/"
                                className="fw-bold text-dark"
                            >
                                <i className="fas fa-gear me-2 text-secondary"></i>
                                Settings
                            </Link>
                        </li>

                        <li className="list-group-item">
                            <Link
                                to="/logout"
                                className="fw-bold text-danger"
                            >
                                <i className="fas fa-sign-out me-2"></i>
                                Logout
                            </Link>
                        </li>

                    </ol>
                </>
            )}

        </div>
    );
}

export default Sidebar;