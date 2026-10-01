import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import apiInstance from '../../utils/axios';
import Swal from 'sweetalert2';

function TrackOrder() {
  const { order_oid: routeOrderOid } = useParams();
  const [searchParams] = useSearchParams();
  const queryOrderOid = searchParams.get('order_oid');
  const queryTrackingId = searchParams.get('tracking_id');

  const [orderIdInput, setOrderIdInput] = useState(routeOrderOid || queryOrderOid || '');
  const [trackingData, setTrackingData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedItemIndex, setSelectedItemIndex] = useState(0);

  const fetchTracking = async (oid) => {
    if (!oid || !oid.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await apiInstance.get(`customer/track-order/${oid.trim()}/`);
      setTrackingData(res.data);

      // If a specific tracking_id was in URL query, select that item
      if (queryTrackingId && res.data.items) {
        const foundIdx = res.data.items.findIndex(
          (it) => it.tracking_id === queryTrackingId
        );
        if (foundIdx !== -1) {
          setSelectedItemIndex(foundIdx);
        }
      }
    } catch (err) {
      console.error('Error fetching tracking info:', err);
      setError(
        err.response?.data?.message ||
        'Unable to find tracking information for this Order ID. Please check the ID and try again.'
      );
      setTrackingData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const targetOid = routeOrderOid || queryOrderOid;
    if (targetOid) {
      setOrderIdInput(targetOid);
      fetchTracking(targetOid);
    }
  }, [routeOrderOid, queryOrderOid]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!orderIdInput.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Order ID Required',
        text: 'Please enter your Order ID to track your package.',
      });
      return;
    }
    fetchTracking(orderIdInput.trim());
  };

  const copyToClipboard = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: 'Tracking ID copied to clipboard!',
      showConfirmButton: false,
      timer: 2000,
    });
  };

  const activeItem = trackingData?.items?.[selectedItemIndex] || trackingData?.items?.[0];

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '85vh', paddingBottom: '60px' }}>
      {/* Top Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
          color: '#ffffff',
          padding: '45px 15px 55px 15px',
          textAlign: 'center',
          boxShadow: '0 4px 20px rgba(79, 70, 229, 0.15)',
        }}
      >
        <div className="container">
          <h2 className="fw-bold mb-2">
            <i className="fas fa-shipping-fast me-2"></i> Live Package Tracker
          </h2>
          <p className="mb-4 text-white-50" style={{ fontSize: '1.05rem' }}>
            Real-time delivery updates and logistics tracking for your orders
          </p>

          {/* Search Box */}
          <div className="row justify-content-center">
            <div className="col-lg-6 col-md-8">
              <form onSubmit={handleSearchSubmit} className="d-flex bg-white p-2 rounded-pill shadow-lg">
                <span className="input-group-text bg-transparent border-0 ps-3 text-muted">
                  <i className="fas fa-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control border-0 shadow-none px-2"
                  placeholder="Enter Order ID (e.g., ORD12345 or #...)"
                  value={orderIdInput}
                  onChange={(e) => setOrderIdInput(e.target.value)}
                  style={{ fontSize: '1rem' }}
                />
                <button
                  type="submit"
                  className="btn btn-primary rounded-pill px-4 fw-semibold"
                  style={{ backgroundColor: '#4f46e5', borderColor: '#4f46e5' }}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <i className="fas fa-spinner fa-spin me-2"></i> Tracking...
                    </>
                  ) : (
                    'Track Order'
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      <div className="container mt-n4" style={{ marginTop: '-30px' }}>
        {/* Error message */}
        {error && (
          <div className="alert alert-danger shadow-sm rounded-4 text-center p-4">
            <i className="fas fa-exclamation-triangle fa-2x mb-3 text-danger"></i>
            <h5>Tracking Information Not Found</h5>
            <p className="mb-0 text-muted">{error}</p>
          </div>
        )}

        {/* Loading spinner */}
        {loading && (
          <div className="card shadow-sm border-0 rounded-4 p-5 text-center bg-white my-4">
            <div className="spinner-border text-primary mx-auto mb-3" role="status" style={{ width: '3rem', height: '3rem' }}>
              <span className="visually-hidden">Loading...</span>
            </div>
            <h5 className="text-secondary">Fetching live logistics telemetry...</h5>
          </div>
        )}

        {/* Tracking Details Card */}
        {trackingData && !loading && (
          <div className="row g-4">
            {/* Top Overview Bar */}
            <div className="col-12">
              <div className="card border-0 shadow-sm rounded-4 bg-white p-4">
                <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
                  <div>
                    <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-3 py-2 rounded-pill fw-semibold mb-2">
                      <i className="fas fa-receipt me-1"></i> Order #{trackingData.order_oid}
                    </span>
                    <h4 className="fw-bold mb-1 text-dark">
                      Shipping to {trackingData.customer_name || 'Customer'}
                    </h4>
                    <p className="text-muted mb-0 small">
                      <i className="fas fa-map-marker-alt text-danger me-1"></i>
                      {[trackingData.address, trackingData.city, trackingData.state, trackingData.country]
                        .filter(Boolean)
                        .join(', ')}
                    </p>
                  </div>

                  <div className="text-end">
                    <span className="text-muted d-block small">Estimated Delivery</span>
                    <span className="fs-5 fw-bold text-success">
                      <i className="fas fa-calendar-check me-1"></i>
                      {activeItem?.expected_delivery || 'Within 3-5 Business Days'}
                    </span>
                  </div>
                </div>

                {/* Multiple items tabs if order has >1 items */}
                {trackingData.items?.length > 1 && (
                  <div className="mt-4 pt-3 border-top">
                    <span className="text-muted small fw-semibold me-3">Packages in this order:</span>
                    <div className="d-inline-flex gap-2 flex-wrap mt-2">
                      {trackingData.items.map((it, idx) => (
                        <button
                          key={idx}
                          onClick={() => setSelectedItemIndex(idx)}
                          className={`btn btn-sm rounded-pill px-3 py-1 ${
                            selectedItemIndex === idx ? 'btn-primary' : 'btn-outline-secondary'
                          }`}
                        >
                          Package {idx + 1}: {it.product_title?.substring(0, 18)}...
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Main Tracker Card */}
            {activeItem && (
              <>
                <div className="col-lg-8">
                  <div className="card border-0 shadow-sm rounded-4 bg-white p-4 h-100">
                    {/* Carrier & Tracking ID Box */}
                    <div
                      className="p-3 rounded-4 mb-4"
                      style={{ backgroundColor: '#f1f5f9', border: '1px solid #e2e8f0' }}
                    >
                      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
                        <div className="d-flex align-items-center gap-3">
                          <div
                            className="d-flex align-items-center justify-content-center rounded-3 shadow-sm"
                            style={{
                              width: '54px',
                              height: '54px',
                              backgroundColor: '#4f46e5',
                              color: '#ffffff',
                              fontSize: '24px',
                            }}
                          >
                            <i className="fas fa-truck"></i>
                          </div>
                          <div>
                            <div className="text-muted small fw-semibold">Carrier Partner</div>
                            <h5 className="mb-0 fw-bold text-dark">{activeItem.courier_name}</h5>
                          </div>
                        </div>

                        <div className="d-flex align-items-center gap-2">
                          <div className="text-end">
                            <div className="text-muted small fw-semibold">Tracking Number / AWB</div>
                            <span
                              className="fw-bold px-2 py-1 rounded font-monospace"
                              style={{ backgroundColor: '#e2e8f0', color: '#1e293b' }}
                            >
                              {activeItem.tracking_id || 'Generating AWB...'}
                            </span>
                          </div>
                          {activeItem.tracking_id && (
                            <button
                              type="button"
                              onClick={() => copyToClipboard(activeItem.tracking_id)}
                              className="btn btn-light btn-sm rounded-circle p-2 border shadow-sm"
                              title="Copy Tracking ID"
                            >
                              <i className="fas fa-copy text-secondary"></i>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Progress Step Bar */}
                    <div className="mb-4">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <h6 className="fw-bold text-dark mb-0">Delivery Progress</h6>
                        <span className="badge bg-success rounded-pill px-3 py-2 fw-semibold">
                          <i className="fas fa-dot-circle me-1 fa-beat"></i> {activeItem.status_text}
                        </span>
                      </div>

                      {/* Visual 5-step horizontal tracker */}
                      <div className="position-relative my-4 px-2">
                        <div
                          className="progress"
                          style={{ height: '5px', backgroundColor: '#e2e8f0' }}
                        >
                          <div
                            className="progress-bar bg-success progress-bar-striped progress-bar-animated"
                            role="progressbar"
                            style={{
                              width: `${(activeItem.step_index / 4) * 100}%`,
                            }}
                          ></div>
                        </div>

                        <div className="d-flex justify-content-between position-absolute top-50 start-0 w-100 translate-middle-y px-1">
                          {[
                            { label: 'Confirmed', icon: 'fa-check' },
                            { label: 'Packed', icon: 'fa-box' },
                            { label: 'Dispatched', icon: 'fa-truck' },
                            { label: 'Out for Delivery', icon: 'fa-shipping-fast' },
                            { label: 'Delivered', icon: 'fa-home' },
                          ].map((step, idx) => {
                            const isDone = idx <= activeItem.step_index;
                            const isCurrent = idx === activeItem.step_index;
                            return (
                              <div
                                key={idx}
                                className="text-center"
                                style={{ width: '80px', marginTop: '10px' }}
                              >
                                <div
                                  className={`rounded-circle d-flex align-items-center justify-content-center mx-auto shadow-sm ${
                                    isDone
                                      ? 'bg-success text-white'
                                      : 'bg-white text-muted border border-2'
                                  }`}
                                  style={{
                                    width: isCurrent ? '34px' : '28px',
                                    height: isCurrent ? '34px' : '28px',
                                    fontSize: isCurrent ? '14px' : '11px',
                                    border: isCurrent ? '3px solid #bbf7d0' : '',
                                  }}
                                >
                                  <i className={`fas ${step.icon}`}></i>
                                </div>
                                <span
                                  className={`d-block small mt-1 ${
                                    isCurrent ? 'fw-bold text-success' : isDone ? 'text-dark' : 'text-muted'
                                  }`}
                                  style={{ fontSize: '0.72rem' }}
                                >
                                  {step.label}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Timeline Activity Checkpoints */}
                    <div className="mt-5 pt-3">
                      <h6 className="fw-bold text-dark mb-4">
                        <i className="fas fa-list-ul me-2 text-primary"></i> Tracking History & Telemetry
                      </h6>

                      <div className="timeline-container ps-2">
                        {activeItem.checkpoints?.map((cp, idx) => (
                          <div key={idx} className="d-flex mb-4 position-relative">
                            {/* Vertical Line */}
                            {idx < activeItem.checkpoints.length - 1 && (
                              <div
                                style={{
                                  position: 'absolute',
                                  left: '15px',
                                  top: '30px',
                                  bottom: '-15px',
                                  width: '2px',
                                  backgroundColor: cp.completed ? '#22c55e' : '#e2e8f0',
                                }}
                              />
                            )}

                            {/* Dot */}
                            <div
                              className={`rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 ${
                                cp.completed
                                  ? 'bg-success text-white'
                                  : 'bg-white text-muted border border-2 border-secondary'
                              }`}
                              style={{ width: '32px', height: '32px', zIndex: 1, fontSize: '13px' }}
                            >
                              <i className={cp.completed ? 'fas fa-check' : 'fas fa-clock'}></i>
                            </div>

                            {/* Content */}
                            <div className="ms-3 flex-grow-1">
                              <div className="d-flex justify-content-between align-items-start">
                                <h6
                                  className={`mb-1 fw-bold ${
                                    cp.completed ? 'text-dark' : 'text-muted'
                                  }`}
                                >
                                  {cp.title}
                                </h6>
                                <span className="badge bg-light text-muted small border">
                                  <i className="far fa-clock me-1"></i> {cp.time}
                                </span>
                              </div>
                              <p className="text-secondary small mb-1">{cp.description}</p>
                              {cp.location && (
                                <span className="small text-muted" style={{ fontSize: '0.75rem' }}>
                                  <i className="fas fa-map-pin me-1 text-danger"></i>
                                  {cp.location}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* In-App Live Telemetry Guarantee (Self-contained like Stripe Test Mode) */}
                    <div className="mt-4 pt-3 border-top">
                      <div className="d-flex align-items-center justify-content-between p-3 rounded-3" style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                        <div className="d-flex align-items-center gap-2">
                          <i className="fas fa-satellite-dish text-success fa-beat" style={{ fontSize: '1.1rem' }}></i>
                          <div>
                            <span className="fw-bold text-success small d-block">Live In-App Order Tracking Active</span>
                            <span className="text-muted" style={{ fontSize: '0.78rem' }}>
                              All checkpoints, transit movements, and delivery telemetry are updated directly inside your store account.
                            </span>
                          </div>
                        </div>
                        <span className="badge bg-success text-white px-2 py-1 small">
                          <i className="fas fa-check-circle me-1"></i> Verified
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Side: Package & Order summary */}
                <div className="col-lg-4">
                  <div className="card border-0 shadow-sm rounded-4 bg-white p-4 mb-4">
                    <h6 className="fw-bold text-dark mb-3">Package Contents</h6>
                    <div className="d-flex align-items-center gap-3 mb-3 p-2 rounded-3 bg-light">
                      {activeItem.product_image ? (
                        <img
                          src={activeItem.product_image}
                          alt={activeItem.product_title}
                          className="rounded-3 object-fit-cover shadow-sm"
                          style={{ width: '65px', height: '65px' }}
                        />
                      ) : (
                        <div
                          className="rounded-3 bg-secondary text-white d-flex align-items-center justify-content-center"
                          style={{ width: '65px', height: '65px' }}
                        >
                          <i className="fas fa-box fa-2x"></i>
                        </div>
                      )}
                      <div>
                        <h6 className="fw-bold text-dark mb-1 small">{activeItem.product_title}</h6>
                        <div className="text-muted small">Qty: {activeItem.qty}</div>
                        <div className="text-primary fw-bold small">${activeItem.sub_total}</div>
                      </div>
                    </div>

                    <div className="border-top pt-3 small">
                      <div className="d-flex justify-content-between mb-2">
                        <span className="text-muted">Vendor / Seller:</span>
                        <span className="fw-semibold text-dark">{activeItem.vendor_name}</span>
                      </div>
                      <div className="d-flex justify-content-between mb-2">
                        <span className="text-muted">Payment:</span>
                        <span className="badge bg-success-subtle text-success border border-success-subtle">
                          {trackingData.payment_status?.toUpperCase() || 'PAID'}
                        </span>
                      </div>
                      <div className="d-flex justify-content-between">
                        <span className="text-muted">Total Amount:</span>
                        <span className="fw-bold text-dark">${trackingData.total}</span>
                      </div>
                    </div>
                  </div>

                  {/* Help Card */}
                  <div
                    className="card border-0 shadow-sm rounded-4 p-4 text-white"
                    style={{ background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)' }}
                  >
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <i className="fas fa-headset fs-4 text-warning"></i>
                      <h6 className="fw-bold mb-0">Need Assistance?</h6>
                    </div>
                    <p className="small text-white-50 mb-3">
                      Have a query regarding delivery schedule, address change, or courier tracking?
                    </p>
                    <Link
                      to={`/customer/order/detail/${trackingData.order_oid}/`}
                      className="btn btn-warning btn-sm rounded-pill fw-semibold w-100 mb-2"
                    >
                      <i className="fas fa-shopping-cart me-1"></i> View Order Details
                    </Link>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default TrackOrder;
