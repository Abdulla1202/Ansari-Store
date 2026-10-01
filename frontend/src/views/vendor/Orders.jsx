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
            }
        };

        fetchData();
    }, []);
    return (
        <div className="container-fluid" id="main" >
            <div className="row row-offcanvas row-offcanvas-left h-100">
                <Sidebar />
                <div className="col-md-9 col-lg-10 main">
                    <div className="mb-3 mt-3" style={{ marginBottom: 300 }}>
                        <div>
                            <h4><i className="bi bi-cart-check-fill"></i> All Orders  </h4>

                            <table className="table">
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
                                    {orders?.map((o, index) => (
                                        <tr key={index}>
                                            <th scope="row">#{o.oid}</th>
                                            <td>{o.full_name}</td>
                                            <td>{moment(o.date).format("MM/DD/YYYY")}</td>
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
                                                <Link to={`/vendor/orders/${o.oid}/`} className="btn btn-primary btn-sm mb-1 me-1" title="View Order">
                                                    <i className="fas fa-eye" />
                                                </Link>
                                                <Link to={`/track-order/${o.oid}/`} className="btn btn-outline-info btn-sm mb-1" title="Track Order">
                                                    <i className="fas fa-truck" />
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}

                                    {orders?.length === 0 && (
    <tr>
        <td colSpan="5" className="text-center">
            <h5 className="mt-4 p-3">No orders yet</h5>
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
    )
}

export default Orders