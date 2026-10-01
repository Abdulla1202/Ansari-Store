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

                    <button className="navbar-toggler border-0" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                        <span className="navbar-toggler-icon" />
                    </button>

                    <div className="collapse navbar-collapse" id="navbarSupportedContent">
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
                            <Link className="btn btn-danger btn-sm rounded-pill px-3 d-flex align-items-center gap-2 shadow-sm" to="/cart/">
                                <i className='fas fa-shopping-cart'></i>
                                <span className="badge bg-white text-danger rounded-pill" id='cart-total-items'>
                                    {cartCount || 0}
                                </span>
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>
        </div>
    )
}

export default StoreHeader