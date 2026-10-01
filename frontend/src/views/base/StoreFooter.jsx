import React from 'react';
import { Link } from 'react-router-dom';

function StoreFooter() {
  return (
    <footer style={{ backgroundColor: '#0f172a', color: '#94a3b8' }} className="pt-5 pb-4 mt-5">
      <div className="container">
        {/* Main Footer Links */}
        <div className="row g-4 pb-4 border-bottom border-secondary border-opacity-25">
          {/* Brand info */}
          <div className="col-lg-4 col-md-6">
            <div className="d-flex align-items-center gap-2 mb-3">
              <div
                className="rounded-circle d-flex align-items-center justify-content-center"
                style={{
                  width: '36px',
                  height: '36px',
                  backgroundColor: '#4f46e5',
                  color: '#ffffff',
                }}
              >
                <i className="fas fa-shopping-bag" style={{ fontSize: '17px' }}></i>
              </div>
              <h4 className="fw-bold text-white mb-0">Ansari Store</h4>
            </div>
            <p className="small mb-3 text-secondary" style={{ lineHeight: '1.7' }}>
              Your premium marketplace for top-tier products from verified vendors. Enjoy lightning-fast shipping, real-time live order tracking, and 100% secure payments.
            </p>
            <div className="d-flex gap-2">
              <span className="badge bg-dark border border-secondary text-light px-3 py-2 rounded-pill">
                <i className="fas fa-shield-alt text-success me-1"></i> Verified Platform
              </span>
              <span className="badge bg-dark border border-secondary text-light px-3 py-2 rounded-pill">
                <i className="fas fa-satellite-dish text-info me-1"></i> Live Telemetry
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="col-lg-2 col-md-3 col-6">
            <h6 className="fw-bold text-white mb-3 text-uppercase" style={{ fontSize: '0.85rem', letterSpacing: '0.8px' }}>
              Shop & Explore
            </h6>
            <ul className="list-unstyled small mb-0 d-flex flex-column gap-2">
              <li>
                <Link to="/" className="text-secondary text-decoration-none hover-white">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/track-order/" className="text-warning text-decoration-none fw-semibold">
                  <i className="fas fa-truck me-1"></i> Track Order
                </Link>
              </li>
              <li>
                <Link to="/cart/" className="text-secondary text-decoration-none">
                  Shopping Cart
                </Link>
              </li>
              <li>
                <Link to="/search?query=" className="text-secondary text-decoration-none">
                  Search Products
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Portal */}
          <div className="col-lg-3 col-md-3 col-6">
            <h6 className="fw-bold text-white mb-3 text-uppercase" style={{ fontSize: '0.85rem', letterSpacing: '0.8px' }}>
              Customer Portal
            </h6>
            <ul className="list-unstyled small mb-0 d-flex flex-column gap-2">
              <li>
                <Link to="/customer/account/" className="text-secondary text-decoration-none">
                  My Profile
                </Link>
              </li>
              <li>
                <Link to="/customer/orders/" className="text-secondary text-decoration-none">
                  Order History
                </Link>
              </li>
              <li>
                <Link to="/customer/wishlist/" className="text-secondary text-decoration-none">
                  Saved Wishlist
                </Link>
              </li>
              <li>
                <Link to="/customer/notifications/" className="text-secondary text-decoration-none">
                  Notifications
                </Link>
              </li>
              <li>
                <Link to="/customer/settings/" className="text-secondary text-decoration-none">
                  Account Settings
                </Link>
              </li>
            </ul>
          </div>

          {/* Vendor & Support */}
          <div className="col-lg-3 col-md-6">
            <h6 className="fw-bold text-white mb-3 text-uppercase" style={{ fontSize: '0.85rem', letterSpacing: '0.8px' }}>
              Vendor & Support
            </h6>
            <ul className="list-unstyled small mb-3 d-flex flex-column gap-2">
              <li>
                <Link to="/vendor/dashboard/" className="text-secondary text-decoration-none">
                  Vendor Dashboard
                </Link>
              </li>
              <li>
                <Link to="/vendor/register/" className="text-secondary text-decoration-none">
                  Become a Seller
                </Link>
              </li>
              <li>
                <Link to="/vendor/orders/" className="text-secondary text-decoration-none">
                  Manage Shipments
                </Link>
              </li>
            </ul>

            <div className="p-3 rounded-3" style={{ backgroundColor: '#1e293b' }}>
              <div className="small fw-semibold text-white mb-1">
                <i className="fas fa-lock text-success me-1"></i> Payment Gateways
              </div>
              <div className="d-flex align-items-center gap-2 text-white-50" style={{ fontSize: '1.25rem' }}>
                <i className="fab fa-stripe" title="Stripe Verified"></i>
                <i className="fab fa-paypal" title="PayPal Verified"></i>
                <i className="fab fa-cc-visa" title="Visa"></i>
                <i className="fab fa-cc-mastercard" title="Mastercard"></i>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright bar */}
        <div className="d-flex flex-wrap justify-content-between align-items-center pt-3 small text-secondary">
          <p className="mb-0">
            &copy; {new Date().getFullYear()} <strong className="text-white">Ansari Store</strong>. All rights reserved.
          </p>
          <div className="d-flex gap-3">
            <Link to="/track-order/" className="text-secondary text-decoration-none">
              Tracking Portal
            </Link>
            <span>&bull;</span>
            <span className="text-secondary">Fast & Secure Commerce</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default StoreFooter;