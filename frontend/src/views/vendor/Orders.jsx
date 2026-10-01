import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom';
import moment from 'moment';

import apiInstance from '../../utils/axios';
import UserData from '../plugin/UserData';
import Sidebar from './Sidebar';

function Orders() {
    const axios = apiInstance
    const userData = UserData()
    const vendorId = userData?.vendor_id

    const [orders, setOrders] = useState(() => {
        try {
            const cached = localStorage.getItem(`cached_vendor_orders_${vendorId}`);
            return cached ? JSON.parse(cached) : [];
        } catch {
            return [];
        }
    });

    const [loading, setLoading] = useState(() => !localStorage.getItem(`cached_vendor_orders_${vendorId}`));

    if (UserData()?.vendor_id === 0) {
        window.location.href = '/vendor/register/'
      }

    useEffect(() => {
        const fetchData = async () => {
            if (!vendorId) return;
            try {
                const response = await axios.get(`vendor/orders/${vendorId}/`)
                setOrders(response.data);
                localStorage.setItem(`cached_vendor_orders_${vendorId}`, JSON.stringify(response.data));
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [vendorId]);
    return (
        <div className="container-fluid" id="main" >
            <div className="row row-offcanvas row-offcanvas-left h-100">
                <Sidebar />
                <div className="col-md-9 col-lg-10 main">
                    <div className="mb-3 mt-3">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h4 className="fw-bold mb-0"><i className="bi bi-cart-check-fill text-primary me-2"></i> All Orders</h4>
                            {!loading && orders?.length > 0 && (
                                <span className="badge bg-light text-secondary border px-3 py-2 rounded-pill">
                                    {orders.length} Total
                                </span>
                            )}
                        </div>

                        <div className="card shadow-sm border-0 rounded-4 overflow-hidden">
                            <div className="table-responsive">
                                <table className="table align-middle mb-0">
                                    <thead className="table-dark">
                                        <tr>
                                            <th scope="col">#ID</th>
                                            <th scope="col">Name</th>
                                            <th scope="col">Date</th>
                                            <th scope="col">Status</th>
                                            <th scope="col">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loading && (
                                            <tr>
                                                <td colSpan="5" className="text-center py-4">
                                                    <div className="spinner-border text-primary" role="status">
                                                        <span className="visually-hidden">Loading...</span>
                                                    </div>
                                                    <p className="text-muted mt-2 small">Loading your orders...</p>
                                                </td>
                                            </tr>
                                        )}

                                        {!loading && orders?.map((o, index) => (
                                            <tr key={index}>
                                                <th scope="row" className="font-monospace">#{o.oid}</th>
                                                <td className="fw-semibold">{o.full_name}</td>
                                                <td className="small text-muted">{moment(o.date).format("MM/DD/YYYY")}</td>
                                                <td>
                                                    <span className={`badge ${
                                                        o.order_status === 'Fulfilled' ? 'bg-success' :
                                                        o.order_status === 'Partially Fulfilled' ? 'bg-primary' :
                                                        o.order_status === 'Processing' ? 'bg-warning text-dark' : 'bg-secondary'
                                                    }`}>
                                                        {o.order_status}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="d-flex gap-1">
                                                        <Link to={`/vendor/orders/${o.oid}/`} className="btn btn-primary btn-sm rounded-pill px-2 py-1" title="View Order">
                                                            <i className="fas fa-eye me-1" /> View
                                                        </Link>
                                                        <Link to={`/track-order/${o.oid}/`} className="btn btn-outline-info btn-sm rounded-pill px-2 py-1" title="Track Order">
                                                            <i className="fas fa-truck" />
                                                        </Link>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}

                                        {!loading && orders?.length === 0 && (
                                            <tr>
                                                <td colSpan="5" className="text-center py-5 text-muted">
                                                    <h5>No orders found</h5>
                                                    <p className="small mb-0">When customers place orders, they will appear here.</p>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Orders