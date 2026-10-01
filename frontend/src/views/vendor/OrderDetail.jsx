import React, { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom';

import apiInstance from '../../utils/axios';
import UserData from '../plugin/UserData';
import Sidebar from './Sidebar';


function OrderDetail() {
  const userData = UserData();
  const param = useParams();
  const axios = apiInstance;

  const [order, setOrder] = useState(() => {
    try {
      const cached = localStorage.getItem(`vendor_order_detail_${param?.oid}`);
      return cached ? JSON.parse(cached) : {};
    } catch {
      return {};
    }
  });

  const [orderItems, setOrderItems] = useState(() => {
    try {
      const cached = localStorage.getItem(`vendor_order_detail_${param?.oid}`);
      return cached ? JSON.parse(cached).orderitem || [] : [];
    } catch {
      return [];
    }
  });

  const [loading, setLoading] = useState(!order?.oid);

  if (userData?.vendor_id === 0) {
    window.location.href = '/vendor/register/'
  }

  useEffect(() => {
    if (!userData?.vendor_id || !param?.oid) return;

    const fetchData = async () => {
      try {
        const response = await axios.get(
          `vendor/orders/${userData.vendor_id}/${param.oid}/`
        );
        setOrder(response.data);
        setOrderItems(response.data.orderitem || []);
        setLoading(false);
        localStorage.setItem(`vendor_order_detail_${param.oid}`, JSON.stringify(response.data));
      } catch (error) {
        console.error("Error fetching order detail:", error.response?.data || error.message);
        setLoading(false);
      }
    };

    fetchData();
  }, [userData?.vendor_id, param?.oid]);

  return (
    <div className="container-fluid" id="main">
      <div className="row row-offcanvas row-offcanvas-left h-100">
        <Sidebar />
        <div className="col-md-9 col-lg-10 main">
          <div className="mb-3 mt-3">
            <main className="mb-5">
              <div className="container-fluid px-2 px-md-4">
                {/* Header */}
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h3 className="mb-0 fw-bold">
                    <i className="fas fa-shopping-cart text-primary me-2" />
                    Order #{order?.oid || param?.oid}
                  </h3>
                  <Link to="/vendor/orders/" className="btn btn-outline-secondary btn-sm rounded-pill px-3">
                    <i className="fas fa-arrow-left me-1"></i> Back to Orders
                  </Link>
                </div>

                {loading && !order?.oid && (
                  <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="text-muted mt-2 small">Loading order details...</p>
                  </div>
                )}

                {/* Section: Metrics Row 1 */}
                <div className="row g-2 g-md-3 mb-3">
                  <div className="col-6 col-md-3">
                    <div className="rounded-3 shadow-sm p-3 h-100" style={{ backgroundColor: "#E0F2FE" }}>
                      <p className="text-secondary small mb-1">Total</p>
                      <h4 className="fw-bold mb-0 text-dark">${order?.total || 0}</h4>
                    </div>
                  </div>
                  <div className="col-6 col-md-3">
                    <div className="rounded-3 shadow-sm p-3 h-100" style={{ backgroundColor: "#F3E8FF" }}>
                      <p className="text-secondary small mb-1">Payment</p>
                      <h5 className="fw-bold mb-0 text-dark text-truncate">{order?.payment_status?.toUpperCase() || "N/A"}</h5>
                    </div>
                  </div>
                  <div className="col-6 col-md-3">
                    <div className="rounded-3 shadow-sm p-3 h-100" style={{ backgroundColor: "#DBEAFE" }}>
                      <p className="text-secondary small mb-1">Order Status</p>
                      <h5 className="fw-bold mb-0 text-dark text-truncate">{order?.order_status || "Pending"}</h5>
                    </div>
                  </div>
                  <div className="col-6 col-md-3">
                    <div className="rounded-3 shadow-sm p-3 h-100" style={{ backgroundColor: "#DCFCE7" }}>
                      <p className="text-secondary small mb-1">Shipping</p>
                      <h4 className="fw-bold mb-0 text-dark">${order?.shipping_amount || 0}</h4>
                    </div>
                  </div>
                </div>

                {/* Section: Metrics Row 2 */}
                <div className="row g-2 g-md-3 mb-4">
                  <div className="col-4">
                    <div className="rounded-3 shadow-sm p-2 p-md-3 h-100" style={{ backgroundColor: "#FEF3C7" }}>
                      <p className="text-secondary small mb-1">Tax</p>
                      <h6 className="fw-bold mb-0 text-dark">${order?.tax_fee || 0}</h6>
                    </div>
                  </div>
                  <div className="col-4">
                    <div className="rounded-3 shadow-sm p-2 p-md-3 h-100" style={{ backgroundColor: "#FCE7F3" }}>
                      <p className="text-secondary small mb-1">Service Fee</p>
                      <h6 className="fw-bold mb-0 text-dark">${order?.service_fee || 0}</h6>
                    </div>
                  </div>
                  <div className="col-4">
                    <div className="rounded-3 shadow-sm p-2 p-md-3 h-100" style={{ backgroundColor: "#EDE9FE" }}>
                      <p className="text-secondary small mb-1">Discount</p>
                      <h6 className="fw-bold mb-0 text-danger">-${order?.saved || 0}</h6>
                    </div>
                  </div>
                </div>

                {/* Section: Items Table */}
                <div className="card shadow-sm border-0 rounded-4 overflow-hidden mb-4">
                  <div className="card-header bg-white py-3 border-bottom">
                    <h5 className="mb-0 fw-bold">Order Items ({orderItems?.length || 0})</h5>
                  </div>
                  <div className="table-responsive">
                    <table className="table align-middle mb-0 bg-white">
                      <thead className="bg-light">
                        <tr>
                          <th>Product</th>
                          <th>Price</th>
                          <th>Qty</th>
                          <th>Total</th>
                          <th className='text-danger'>Discount</th>
                          <th>Tracking Info</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orderItems?.map((item, index) => (
                          <tr key={item.id || index}>
                            <td>
                              <div className="d-flex align-items-center">
                                <img
                                  src={item?.product?.image}
                                  style={{ width: 60, height: 60, objectFit: "cover", borderRadius: 8 }}
                                  alt=""
                                  loading="lazy"
                                />
                                <div className="ms-2">
                                  <Link to={`/detail/${item?.product?.slug}`} className="fw-bold text-dark text-decoration-none d-block">
                                    {item?.product?.title}
                                  </Link>
                                  {item?.size && item?.size !== 'No Size' && (
                                    <span className="badge bg-light text-dark border me-1 small">Size: {item.size}</span>
                                  )}
                                  {item?.color && item?.color !== 'No Color' && (
                                    <span className="badge bg-light text-dark border small">Color: {item.color}</span>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td>
                              <p className="fw-semibold mb-0">${item?.product?.price || item?.price}</p>
                            </td>
                            <td>
                              <span className="badge bg-secondary-subtle text-dark border">{item?.qty}</span>
                            </td>
                            <td>
                              <span className="fw-bold mb-0 text-dark">${item?.sub_total}</span>
                            </td>
                            <td>
                              <span className="text-danger fw-semibold">-${item?.saved || 0}</span>
                            </td>
                            <td>
                              {item.tracking_id && item.tracking_id !== 'undefined' ? (
                                <div>
                                  <span className="badge bg-success-subtle text-success border border-success-subtle mb-1 d-inline-block">
                                    <i className="fas fa-truck me-1"></i> {item?.delivery_couriers?.name || 'Courier Assigned'}
                                  </span>
                                  <div className="small font-monospace text-dark fw-bold">
                                    AWB: {item.tracking_id}
                                  </div>
                                </div>
                              ) : (
                                <span className="badge bg-secondary-subtle text-secondary border">
                                  No Tracking Yet
                                </span>
                              )}
                            </td>
                            <td>
                              {(!item.tracking_id || item.tracking_id === 'undefined') ? (
                                <Link className="btn btn-primary btn-sm rounded-pill px-3 shadow-sm" to={`/vendor/orders/${param.oid}/${item.id}/`}>
                                  <i className='fas fa-plus me-1'></i> Add Tracking
                                </Link>
                              ) : (
                                <div className="d-flex gap-1 flex-wrap">
                                  <Link className="btn btn-outline-secondary btn-sm rounded-pill px-2 py-1" to={`/vendor/orders/${param.oid}/${item.id}/`}>
                                    <i className='fas fa-edit'></i> Edit
                                  </Link>
                                  <Link className="btn btn-outline-primary btn-sm rounded-pill px-2 py-1" to={`/track-order/${param.oid}/?tracking_id=${item.tracking_id}`}>
                                    <i className='fas fa-location-arrow'></i> Track
                                  </Link>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}

                        {orderItems.length < 1 && !loading && (
                          <tr>
                            <td colSpan="7" className="text-center py-4 text-muted">
                              No Order Items Found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrderDetail