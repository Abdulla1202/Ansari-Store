import React, { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom';

import apiInstance from '../../utils/axios';
import UserData from '../plugin/UserData';
import Sidebar from './Sidebar';
import Swal from 'sweetalert2';

function OrderItemDetail() {
    const param = useParams();
    const axios = apiInstance;
    const userData = UserData();

    const [orderItems, setOrderItems] = useState(() => {
        try {
            const cached = localStorage.getItem(`vendor_order_item_${param.id}`);
            return cached ? JSON.parse(cached) : {};
        } catch {
            return {};
        }
    });

    const [order, setOrder] = useState(() => orderItems?.order || {});

    const [courier, setCourier] = useState(() => {
        try {
            const cached = localStorage.getItem("vendor_couriers");
            return cached ? JSON.parse(cached) : [];
        } catch {
            return [];
        }
    });

    const [trackingData, setTrackingData] = useState({
        tracking_id: orderItems?.tracking_id || "",
        delivery_couriers: orderItems?.delivery_couriers?.id || orderItems?.delivery_couriers || "",
        notify_buyer: true,
    });
    const [loading, setLoading] = useState(false);

    const handleTrackingDataChange = (event) => {
        setTrackingData({
            ...trackingData,
            [event.target.name]: event.target.type === 'checkbox' ? event.target.checked : event.target.value
        });
    };

    useEffect(() => {
        const fetchCourier = async () => {
            try {
                const response = await axios.get(`vendor/couriers/`);
                setCourier(response.data || []);
                localStorage.setItem("vendor_couriers", JSON.stringify(response.data || []));
            } catch (error) {
                console.error("COURIERS ERROR:", error);
            }
        };

        const fetchData = async () => {
            try {
                const response = await axios.get(`vendor/order-item-detail/${param.id}/`);
                if (response.data) {
                    setOrder(response.data.order || {});
                    setOrderItems(response.data);
                    setTrackingData(prev => ({
                        ...prev,
                        tracking_id: response.data.tracking_id || "",
                        delivery_couriers: response.data.delivery_couriers?.id || response.data.delivery_couriers || "",
                    }));
                    localStorage.setItem(`vendor_order_item_${param.id}`, JSON.stringify(response.data));
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchCourier();
        fetchData();
    }, [param.id]);

    const handleOnSubmit = async (e) => {
        e.preventDefault();

        if (!trackingData.delivery_couriers) {
            Swal.fire({
                icon: "warning",
                title: "Please select a delivery courier",
            });
            return;
        }

        if (!trackingData.tracking_id || !trackingData.tracking_id.trim()) {
            Swal.fire({
                icon: "warning",
                title: "Please enter tracking ID / AWB Number",
            });
            return;
        }

        setLoading(true);

        try {
            const formdata = new FormData();
            formdata.append("tracking_id", trackingData.tracking_id.trim());
            formdata.append("delivery_couriers", trackingData.delivery_couriers);
            formdata.append("notify_buyer", trackingData.notify_buyer);

            const response = await axios.patch(
                `vendor/order-item-detail/${param.id}/`,
                formdata
            );

            setLoading(false);

            // Clear cache to refresh
            localStorage.removeItem(`vendor_order_item_${param.id}`);
            if (param.oid) {
                localStorage.removeItem(`vendor_order_detail_${param.oid}`);
            }

            await Swal.fire({
                icon: "success",
                title: "Tracking ID Saved!",
                text: "Tracking information and buyer notification updated successfully.",
            });

        } catch (error) {
            console.error("TRACKING ERROR:", error);
            setLoading(false);

            Swal.fire({
                icon: "error",
                title: "Failed to save tracking",
                text: error.response?.data?.message || "Something went wrong while saving tracking information.",
            });
        }
    };

    return (
        <div className="container-fluid" id="main">
            <div className="row row-offcanvas row-offcanvas-left h-100">
                <Sidebar />
                <div className="col-md-9 col-lg-10 main">
                    <div className="mb-4 mt-3">
                        <main className="mb-5">
                            <div className="container-fluid px-2 px-md-4">
                                <div className="d-flex justify-content-between align-items-center mb-4">
                                    <h4 className="fw-bold mb-0">
                                        <i className="fas fa-truck text-primary me-2" />
                                        Tracking for Order #{order?.oid || param?.oid}
                                    </h4>
                                    <Link to={`/vendor/orders/${order?.oid || param?.oid}/`} className="btn btn-outline-secondary btn-sm rounded-pill px-3">
                                        <i className='fas fa-arrow-left me-1'></i> Order Details
                                    </Link>
                                </div>

                                {orderItems?.product && (
                                    <div className="card shadow-sm border-0 rounded-4 p-3 mb-4 bg-light">
                                        <div className="d-flex align-items-center">
                                            <img
                                                src={orderItems.product.image}
                                                style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 10 }}
                                                alt=""
                                            />
                                            <div className="ms-3">
                                                <h6 className="fw-bold mb-1">{orderItems.product.title}</h6>
                                                <span className="badge bg-primary me-2">Qty: {orderItems.qty}</span>
                                                <span className="fw-semibold text-dark">${orderItems.price} each</span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="card shadow-sm border-0 rounded-4 p-3 p-md-4 bg-white">
                                    <form onSubmit={handleOnSubmit}>
                                        <div className="mb-3">
                                            <label className="form-label fw-semibold">
                                                <i className='fas fa-truck text-primary me-1'></i> Choose Delivery Courier
                                            </label>
                                            <select
                                                required
                                                onChange={handleTrackingDataChange}
                                                name="delivery_couriers"
                                                value={trackingData.delivery_couriers}
                                                className="form-select rounded-3 py-2"
                                            >
                                                <option value="">Select Delivery Courier</option>
                                                {courier.map((c) => (
                                                    <option key={c.id} value={c.id}>{c.name}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label fw-semibold">
                                                <i className='fas fa-barcode text-primary me-1'></i> Tracking ID / AWB Number
                                            </label>
                                            <input
                                                type="text"
                                                className="form-control rounded-3 py-2 font-monospace"
                                                onChange={handleTrackingDataChange}
                                                name="tracking_id"
                                                placeholder="e.g. 12839482910"
                                                value={trackingData.tracking_id}
                                                required
                                            />
                                        </div>

                                        <div className="mb-4 form-check">
                                            <input
                                                onChange={handleTrackingDataChange}
                                                name='notify_buyer'
                                                type="checkbox"
                                                className="form-check-input"
                                                id="notifyBuyerCheck"
                                                checked={Boolean(trackingData.notify_buyer)}
                                            />
                                            <label className="form-check-label small" htmlFor="notifyBuyerCheck">
                                                <strong>Notify Buyer by Email:</strong> Send automated email to buyer with live tracking link and courier details.
                                            </label>
                                        </div>

                                        <div className="d-flex gap-2">
                                            <button
                                                type="submit"
                                                disabled={loading}
                                                className="btn btn-primary rounded-pill px-4 py-2 fw-bold shadow-sm"
                                            >
                                                {loading ? (
                                                    <span><i className='fas fa-spinner fa-spin me-1'></i> Saving...</span>
                                                ) : (
                                                    <span><i className='fas fa-check-circle me-1'></i> Save Tracking Info</span>
                                                )}
                                            </button>
                                            <Link
                                                to={`/vendor/orders/${order?.oid || param?.oid}/`}
                                                className="btn btn-outline-secondary rounded-pill px-4 py-2"
                                            >
                                                Cancel
                                            </Link>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </main>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default OrderItemDetail