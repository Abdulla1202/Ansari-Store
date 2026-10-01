import React from 'react'
import { Link, useLocation } from 'react-router-dom';
import UserData from '../plugin/UserData';


function Sidebar() {
    const location = useLocation();
    const isActiveLink = (currentPath, linkPath) => {
        return currentPath.includes(linkPath);
    };

    if (UserData()?.vendor_id === 0) {
        window.location.href = '/vendor/register/'
    }

    return (
        <>
            {/* Desktop Sidebar */}
            <div className="col-md-3 col-lg-2 sidebar-offcanvas bg-dark navbar-dark d-none d-md-block p-3" id="sidebar" role="navigation">
                <ul className="nav nav-pills flex-column mb-auto nav flex-column pl-1 pt-2">
                    <li className="mb-3">
                        <Link to="/vendor/dashboard/" className={isActiveLink(location.pathname, '/vendor/dashboard/') ? "nav-link text-white active" : "nav-link text-white"}>
                            <i className="bi bi-speedometer" /> Dashboard
                        </Link>
                    </li>
                    <li className="mb-3">
                        <Link to="/vendor/products/" className={isActiveLink(location.pathname, '/vendor/products/') ? "nav-link text-white active" : "nav-link text-white"}>
                            <i className="bi bi-grid" /> Products
                        </Link>
                    </li>
                    <li className="mb-3">
                        <Link to="/vendor/orders/" className={isActiveLink(location.pathname, '/vendor/orders/') ? "nav-link text-white active" : "nav-link text-white"}>
                            <i className="bi bi-cart-check" /> Orders
                        </Link>
                    </li>
                    <li className="mb-3">
                        <Link to="/vendor/earning/" className={isActiveLink(location.pathname, '/vendor/earning/') ? "nav-link text-white active" : "nav-link text-white"}>
                            <i className="bi bi-currency-dollar" /> Earning
                        </Link>
                    </li>
                    <li className="mb-3">
                        <Link to="/vendor/reviews/" className={isActiveLink(location.pathname, '/vendor/reviews/') ? "nav-link text-white active" : "nav-link text-white"}>
                            <i className="bi bi-star" /> Reviews
                        </Link>
                    </li>
                    <li className="mb-3">
                        <Link to="/vendor/product/new/" className={isActiveLink(location.pathname, '/vendor/product/new/') ? "nav-link text-white active" : "nav-link text-white"}>
                            <i className="bi bi-plus-circle" /> Add Product
                        </Link>
                    </li>
                    <li className="mb-3">
                        <Link to={`/vendor/coupon/`} className={isActiveLink(location.pathname, '/vendor/coupon/') ? "nav-link text-white active" : "nav-link text-white"}>
                            <i className="bi bi-tag" /> Coupon &amp; Discount
                        </Link>
                    </li>
                    <li className="mb-3">
                        <Link to={`/vendor/notifications/`} className={isActiveLink(location.pathname, '/vendor/notifications/') ? "nav-link text-white active" : "nav-link text-white"}>
                            <i className="bi bi-bell" /> Notifications
                        </Link>
                    </li>
                    <li className="mb-3">
                        <Link to="/vendor/settings/" className={isActiveLink(location.pathname, '/vendor/settings/') ? "nav-link text-white active" : "nav-link text-white"}>
                            <i className="bi bi-gear-fill" /> Settings
                        </Link>
                    </li>
                    <li className="mb-3">
                        <Link to="/logout" className="nav-link text-danger">
                            <i className="bi bi-box-arrow-left" /> Logout
                        </Link>
                    </li>
                </ul>
            </div>

            {/* Mobile Responsive Horizontal Scroll Bar */}
            <div className="col-12 d-md-none bg-dark py-2 px-2 mb-3 shadow-sm rounded-3">
                <div className="d-flex overflow-auto gap-2 align-items-center py-1" style={{ whiteSpace: "nowrap", scrollbarWidth: "none" }}>
                    <Link to="/vendor/dashboard/" className={`btn btn-sm rounded-pill px-3 py-1 ${isActiveLink(location.pathname, '/vendor/dashboard/') ? "btn-primary text-white" : "btn-outline-light text-white"}`}>
                        <i className="bi bi-speedometer me-1" /> Dashboard
                    </Link>
                    <Link to="/vendor/orders/" className={`btn btn-sm rounded-pill px-3 py-1 ${isActiveLink(location.pathname, '/vendor/orders/') ? "btn-primary text-white" : "btn-outline-light text-white"}`}>
                        <i className="bi bi-cart-check me-1" /> Orders
                    </Link>
                    <Link to="/vendor/products/" className={`btn btn-sm rounded-pill px-3 py-1 ${isActiveLink(location.pathname, '/vendor/products/') ? "btn-primary text-white" : "btn-outline-light text-white"}`}>
                        <i className="bi bi-grid me-1" /> Products
                    </Link>
                    <Link to="/vendor/product/new/" className={`btn btn-sm rounded-pill px-3 py-1 ${isActiveLink(location.pathname, '/vendor/product/new/') ? "btn-primary text-white" : "btn-outline-light text-white"}`}>
                        <i className="bi bi-plus-circle me-1" /> Add Product
                    </Link>
                    <Link to="/vendor/earning/" className={`btn btn-sm rounded-pill px-3 py-1 ${isActiveLink(location.pathname, '/vendor/earning/') ? "btn-primary text-white" : "btn-outline-light text-white"}`}>
                        <i className="bi bi-currency-dollar me-1" /> Earning
                    </Link>
                    <Link to="/vendor/reviews/" className={`btn btn-sm rounded-pill px-3 py-1 ${isActiveLink(location.pathname, '/vendor/reviews/') ? "btn-primary text-white" : "btn-outline-light text-white"}`}>
                        <i className="bi bi-star me-1" /> Reviews
                    </Link>
                    <Link to="/vendor/coupon/" className={`btn btn-sm rounded-pill px-3 py-1 ${isActiveLink(location.pathname, '/vendor/coupon/') ? "btn-primary text-white" : "btn-outline-light text-white"}`}>
                        <i className="bi bi-tag me-1" /> Coupons
                    </Link>
                    <Link to="/vendor/notifications/" className={`btn btn-sm rounded-pill px-3 py-1 ${isActiveLink(location.pathname, '/vendor/notifications/') ? "btn-primary text-white" : "btn-outline-light text-white"}`}>
                        <i className="bi bi-bell me-1" /> Notifications
                    </Link>
                    <Link to="/vendor/settings/" className={`btn btn-sm rounded-pill px-3 py-1 ${isActiveLink(location.pathname, '/vendor/settings/') ? "btn-primary text-white" : "btn-outline-light text-white"}`}>
                        <i className="bi bi-gear-fill me-1" /> Settings
                    </Link>
                    <Link to="/logout" className="btn btn-sm btn-outline-danger rounded-pill px-3 py-1 text-danger">
                        <i className="bi bi-box-arrow-left me-1" /> Logout
                    </Link>
                </div>
            </div>
        </>
    )
}

export default Sidebar