import React from 'react'
import { Link } from 'react-router-dom';
import Sidebar from './Sidebar'
import UseProfileData from '../plugin/UseProfileData'


function Account() {
  const userProfile = UseProfileData()

  return (
    <div>
      <main className="mt-5" style={{ marginBottom: "170px" }}>
        <div className="container">
          <section className="">
            <div className="row">
              <Sidebar />
              <div className="col-lg-9 mt-1">
                <main className="mb-5" style={{}}>
                  {/* Container for demo purpose */}
                  <div className="container px-4">
                    {/* Section: Summary */}
                    <section className=""></section>
                    {/* Section: Summary */}
                    {/* Section: MSC */}
                    <section className="">
                      <div className="card border-0 shadow-sm rounded-4 p-4 mb-4">
                        <h2 className="fw-bold text-dark">Hi {userProfile?.full_name || "Valued Customer"}, 👋</h2>
                        <p className="text-muted mb-4">
                          From your account dashboard, you can easily view your <Link to="/customer/orders/" className="fw-semibold text-primary">orders</Link>, track shipments with <Link to="/track-order/" className="fw-semibold text-primary">live order tracking</Link>, manage your <Link to="/customer/wishlist/" className="fw-semibold text-primary">wishlist</Link>, <Link to="/customer/change-password/" className="fw-semibold text-primary">change password</Link>, and update your <Link to="/customer/settings/" className="fw-semibold text-primary">profile settings</Link>.
                        </p>
                        <div className="row g-3">
                          <div className="col-md-4">
                            <Link to="/customer/orders/" className="text-decoration-none">
                              <div className="p-3 border rounded-3 text-center bg-light h-100 transition-hover">
                                <i className="fas fa-shopping-bag fs-3 text-primary mb-2"></i>
                                <h6 className="fw-bold text-dark mb-1">My Orders</h6>
                                <small className="text-muted">Check order history</small>
                              </div>
                            </Link>
                          </div>
                          <div className="col-md-4">
                            <Link to="/track-order/" className="text-decoration-none">
                              <div className="p-3 border rounded-3 text-center bg-light h-100 transition-hover">
                                <i className="fas fa-truck-fast fs-3 text-success mb-2"></i>
                                <h6 className="fw-bold text-dark mb-1">Track Orders</h6>
                                <small className="text-muted">Live delivery telemetry</small>
                              </div>
                            </Link>
                          </div>
                          <div className="col-md-4">
                            <Link to="/customer/wishlist/" className="text-decoration-none">
                              <div className="p-3 border rounded-3 text-center bg-light h-100 transition-hover">
                                <i className="fas fa-heart fs-3 text-danger mb-2"></i>
                                <h6 className="fw-bold text-dark mb-1">Wishlist</h6>
                                <small className="text-muted">Saved favorites</small>
                              </div>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </section>
                    {/* Section: MSC */}
                  </div>
                  {/* Container for demo purpose */}
                </main>
              </div>
            </div>
          </section>
          {/*Section: Wishlist*/}
        </div>
      </main>

    </div>
  )
}

export default Account