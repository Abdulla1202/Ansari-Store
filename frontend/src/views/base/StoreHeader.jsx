import React, { useContext, useState, useEffect } from 'react'
import { useAuthStore } from '../../store/auth';
import { Link } from 'react-router-dom';
import { CartContext } from '../plugin/Context';
import apiInstance from '../../utils/axios';
import { useNavigate } from 'react-router-dom';


function StoreHeader() {
   const [cartCount] = useContext(CartContext);

console.log("STORE HEADER CART COUNT:", cartCount);
console.log("STORE HEADER CART TYPE:", typeof cartCount);
    const [search, setSearch] = useState("")

   const [isLoggedIn, user] = useAuthStore((state) => [
    state.isLoggedIn,
    state.user,
]);

const userData = user();

console.log("USER DATA:", userData);
console.log("VENDOR ID:", userData?.vendor_id);

    const navigate = useNavigate()

    const handleSearchChange = (event) => {
        setSearch(event.target.value);
        console.log(search);
    }

    const handleSearchSubmit = () => {
        navigate(`/search?query=${search}`)
    }

    return (
        <div>
            <nav className="navbar navbar-expand-lg navbar-dark shadow-sm sticky-top" style={{ backgroundColor: "#0f172a" }}>
                <div className="container">
                    <Link className="navbar-brand fw-bold d-flex align-items-center gap-2" to="/">
                        <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: "34px", height: "34px", backgroundColor: "#4f46e5", color: "#fff" }}>
                            <i className="fas fa-shopping-bag" style={{ fontSize: "16px" }}></i>
                        </div>
                        <span>Ansari Store</span>
                    </Link>

                    <div className="d-flex align-items-center gap-2 d-lg-none">
                        {isLoggedIn() ? (
                            <Link className="btn btn-outline-light btn-sm rounded-pill px-2 py-1 d-flex align-items-center gap-1" to="/customer/account/" title="My Account" style={{ fontSize: "12px" }}>
                                <i className="fas fa-user-circle"></i>
                            </Link>
                        ) : (
                            <Link className="btn btn-primary btn-sm rounded-pill px-2 py-1 fw-bold d-flex align-items-center gap-1" to="/login" style={{ fontSize: "12px" }}>
                                <i className="fas fa-sign-in-alt"></i> Login
                            </Link>
                        )}
                        <Link className="btn btn-danger btn-sm rounded-pill px-2 py-1 d-flex align-items-center gap-1 shadow-sm" to="/cart/">
                            <i className='fas fa-shopping-cart' style={{ fontSize: "12px" }}></i>
                            <span className="badge bg-white text-danger rounded-pill px-1" style={{ fontSize: "10px" }}>
                                {cartCount || 0}
                            </span>
                        </Link>
                        <button className="navbar-toggler border-0 p-1" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                            <span className="navbar-toggler-icon" />
                        </button>
                    </div>

                    <div className="collapse navbar-collapse" id="navbarSupportedContent">
                        {/* Mobile Account Access Card */}
                        <div className="d-lg-none p-3 my-2 rounded-3 border border-secondary border-opacity-25" style={{ backgroundColor: "rgba(255, 255, 255, 0.06)" }}>
                            {isLoggedIn() ? (
                                <div className="d-flex align-items-center justify-content-between">
                                    <div className="d-flex align-items-center gap-2 text-white">
                                        <div className="rounded-circle bg-primary d-flex align-items-center justify-content-center text-white" style={{ width: "32px", height: "32px" }}>
                                            <i className="fas fa-user"></i>
                                        </div>
                                        <div>
                                            <div className="fw-bold small">{userData?.username || "Account"}</div>
                                            <span className="text-success small" style={{ fontSize: "11px" }}>● Logged In</span>
                                        </div>
                                    </div>
                                    <div className="d-flex gap-2">
                                        <Link className="btn btn-sm btn-outline-light rounded-pill px-3 py-1" to="/customer/account/" style={{ fontSize: "12px" }}>
                                            Profile
                                        </Link>
                                        <Link className="btn btn-sm btn-outline-danger rounded-pill px-3 py-1" to="/logout" style={{ fontSize: "12px" }}>
                                            Logout
                                        </Link>
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <div className="text-white fw-bold small mb-1">
                                        <i className="fas fa-user-circle me-1 text-primary"></i> Account Login / Register
                                    </div>
                                    <p className="text-secondary mb-2" style={{ fontSize: "12px" }}>
                                        Sign in to place orders, track shipments & save wishlist
                                    </p>
                                    <div className="d-flex gap-2">
                                        <Link className="btn btn-primary btn-sm flex-fill rounded-pill py-2 fw-bold text-center" to="/login">
                                            <i className="fas fa-sign-in-alt me-1"></i> Login
                                        </Link>
                                        <Link className="btn btn-outline-light btn-sm flex-fill rounded-pill py-2 fw-bold text-center" to="/register">
                                            <i className="fas fa-user-plus me-1"></i> Register
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>

                        <ul className="navbar-nav me-auto mb-2 mb-lg-0 align-items-lg-center">
                            <li className="nav-item">
                                <Link className="nav-link fw-semibold px-3 text-warning" to="/track-order/">
                                    <i className="fas fa-truck me-1"></i> Track Order
                                </Link>
                            </li>

                            <li className="nav-item dropdown">
                                <a className="nav-link dropdown-toggle px-3" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false" >
                                    <i className="fas fa-user-circle me-1"></i> Account
                                </a>
                                <ul className="dropdown-menu shadow border-0 rounded-3" aria-labelledby="navbarDropdown">
                                    <li><Link to={'/customer/account/'} className="dropdown-item py-2"><i className='fas fa-user me-2 text-primary'></i> Profile</Link></li>
                                    <li><Link className="dropdown-item py-2" to={`/customer/orders/`}><i className='fas fa-shopping-cart me-2 text-success'></i> Orders</Link></li>
                                    <li><Link className="dropdown-item py-2" to={`/track-order/`}><i className='fas fa-truck me-2 text-warning'></i> Track Order</Link></li>
                                    <li><Link className="dropdown-item py-2" to={`/customer/wishlist/`}><i className='fas fa-heart me-2 text-danger'></i> Wishlist</Link></li>
                                    <li><Link className="dropdown-item py-2" to={`/customer/notifications/`}><i className='fas fa-bell me-2 text-info'></i> Notifications</Link></li>
                                    <li><hr className="dropdown-divider" /></li>
                                    <li><Link className="dropdown-item py-2" to={`/customer/settings/`}><i className='fas fa-gear me-2 text-secondary'></i> Settings</Link></li>
                                </ul>
                            </li>

                            <li className="nav-item dropdown">
                                <a className="nav-link dropdown-toggle px-3" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false" >
                                    <i className="fas fa-store me-1"></i> Vendor
                                </a>
                                <ul className="dropdown-menu shadow border-0 rounded-3" aria-labelledby="navbarDropdown">
                                    <li><Link className="dropdown-item py-2" to="/vendor/dashboard/"> <i className='fas fa-chart-line me-2 text-primary'></i> Dashboard</Link></li>
                                    <li><Link className="dropdown-item py-2" to="/vendor/products/"> <i className='bi bi-grid-fill me-2 text-success'></i> Products</Link></li>
                                    <li><Link className="dropdown-item py-2" to="/vendor/product/new/"> <i className='fas fa-plus-circle me-2 text-info'></i> Add Product</Link></li>
                                    <li><Link className="dropdown-item py-2" to="/vendor/orders/"> <i className='fas fa-box-open me-2 text-warning'></i> Orders</Link></li>
                                    <li><Link className="dropdown-item py-2" to="/vendor/earning/"> <i className='fas fa-dollar-sign me-2 text-success'></i> Earnings</Link></li>
                                    <li><Link className="dropdown-item py-2" to="/vendor/reviews/"> <i className='fas fa-star me-2 text-warning'></i> Reviews</Link></li>
                                    <li><Link className="dropdown-item py-2" to="/vendor/coupon/"> <i className='fas fa-tag me-2 text-secondary'></i> Coupons</Link></li>
                                    <li><Link className="dropdown-item py-2" to="/vendor/notifications/"> <i className='fas fa-bell me-2 text-danger'></i> Notifications</Link></li>
                                    <li><hr className="dropdown-divider" /></li>
                                    <li><Link className="dropdown-item py-2" to="/vendor/settings/"> <i className='fas fa-gear me-2 text-dark'></i> Settings</Link></li>
                                </ul>
                            </li>
                        </ul>

                        {/* Search Bar */}
                        <div className="d-flex align-items-center me-3 my-2 my-lg-0 position-relative">
                            <input
                                onChange={handleSearchChange}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit()}
                                value={search}
                                name='search'
                                className="form-control rounded-pill px-3 py-1 bg-dark text-white border-secondary"
                                type="text"
                                placeholder="Search products..."
                                style={{ minWidth: "200px", fontSize: "0.9rem" }}
                            />
                            <button
                                onClick={handleSearchSubmit}
                                className="btn btn-sm btn-primary rounded-circle position-absolute end-0 me-1"
                                style={{ width: "28px", height: "28px", padding: 0 }}
                                type="button"
                            >
                                <i className="fas fa-search" style={{ fontSize: "11px" }}></i>
                            </button>
                        </div>

                        {/* User action buttons */}
                        <div className="d-flex align-items-center gap-2">
                            {isLoggedIn() ? (
                                <>
                                    <Link className="btn btn-outline-light btn-sm rounded-pill px-3" to={'/customer/account/'}>
                                        <i className="fas fa-user me-1"></i> Account
                                    </Link>
                                    <Link className="btn btn-outline-danger btn-sm rounded-pill px-3" to="/logout">
                                        Logout
                                    </Link>
                                </>
                            ) : (
                                <>
                                    <Link className="btn btn-outline-light btn-sm rounded-pill px-3" to="/login">
                                        Login
                                    </Link>
                                    <Link className="btn btn-primary btn-sm rounded-pill px-3" to="/register">
                                        Register
                                    </Link>
                                </>
                            )}
                            
                            {/* Cart Button */}
                            <Link className="btn btn-danger btn-sm rounded-pill px-3 d-none d-lg-flex align-items-center gap-2 shadow-sm" to="/cart/">
                                <i className='fas fa-shopping-cart'></i>
                                <span className="badge bg-white text-danger rounded-pill" id='cart-total-items'>
                                    {cartCount || 0}
                                </span>
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Mobile Fixed Bottom Navigation Bar */}
            <div 
                className="d-block d-lg-none fixed-bottom shadow-lg" 
                style={{ 
                    backgroundColor: "#0f172a", 
                    borderTop: "1px solid rgba(255, 255, 255, 0.12)",
                    zIndex: 1040,
                    backdropFilter: "blur(10px)"
                }}
            >
                <div className="d-flex justify-content-around align-items-center py-2 px-1">
                    <Link to="/" className="text-center text-decoration-none py-1" style={{ flex: 1, color: "#cbd5e1" }}>
                        <i className="fas fa-home d-block mb-1" style={{ fontSize: "18px" }}></i>
                        <span style={{ fontSize: "10px", fontWeight: "500" }}>Home</span>
                    </Link>

                    <Link to="/search" className="text-center text-decoration-none py-1" style={{ flex: 1, color: "#cbd5e1" }}>
                        <i className="fas fa-search d-block mb-1" style={{ fontSize: "18px" }}></i>
                        <span style={{ fontSize: "10px", fontWeight: "500" }}>Search</span>
                    </Link>

                    <Link to="/cart/" className="text-center text-decoration-none py-1 position-relative" style={{ flex: 1, color: "#cbd5e1" }}>
                        <div className="position-relative d-inline-block">
                            <i className="fas fa-shopping-cart" style={{ fontSize: "18px" }}></i>
                            {Boolean(cartCount && cartCount > 0) && (
                                <span 
                                    className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" 
                                    style={{ fontSize: "9px", padding: "2px 5px" }}
                                >
                                    {cartCount}
                                </span>
                            )}
                        </div>
                        <span className="d-block" style={{ fontSize: "10px", fontWeight: "500", marginTop: "2px" }}>Cart</span>
                    </Link>

                    <Link to="/track-order/" className="text-center text-decoration-none text-warning py-1" style={{ flex: 1 }}>
                        <i className="fas fa-truck d-block mb-1" style={{ fontSize: "18px" }}></i>
                        <span style={{ fontSize: "10px", fontWeight: "600" }}>Track</span>
                    </Link>

                    {isLoggedIn() ? (
                        <Link to="/customer/account/" className="text-center text-decoration-none py-1" style={{ flex: 1, color: "#cbd5e1" }}>
                            <i className="fas fa-user-circle d-block mb-1 text-primary" style={{ fontSize: "18px" }}></i>
                            <span style={{ fontSize: "10px", fontWeight: "500" }}>Account</span>
                        </Link>
                    ) : (
                        <Link to="/login" className="text-center text-decoration-none py-1" style={{ flex: 1, color: "#38bdf8" }}>
                            <i className="fas fa-sign-in-alt d-block mb-1" style={{ fontSize: "18px" }}></i>
                            <span style={{ fontSize: "10px", fontWeight: "700" }}>Login</span>
                        </Link>
                    )}
                </div>
            </div>
        </div>
    )
}

export default StoreHeader