import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom';

import apiInstance from '../../utils/axios';



function PaymentSuccess() {
    const [loading, setIsLoading] = useState(true)
    const [orderResponse, setOrderResponse] = useState([])
    const [order, setOrder] = useState([])


    const axios = apiInstance
    const param = useParams()

    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');
    const payaplOrderId = urlParams.get('payapl_order_id');

    console.log(param);
    console.log(sessionId);
    console.log(payaplOrderId);

    // Get order details
    useEffect(() => {
        axios.get(`checkout/${param?.order_oid}/`).then((res) => {
            setOrder(res.data);
            if (res.data?.payment_status === "paid") {
                setIsLoading(false);
            }
        }).catch((err) => {
            console.error("Order fetch error:", err);
        });
    }, [param?.order_oid])


    // Payment Processing
    useEffect(() => {
        if (!param?.order_oid) return;

        const formData = new FormData();
        formData.append('order_oid', param?.order_oid);
        formData.append('session_id', sessionId || '');
        formData.append('payapl_order_id', payaplOrderId || '');

        setIsLoading(true);

        axios.post(`payment-success/`, formData)
            .then((res) => {
                setOrderResponse(res.data);
                setIsLoading(false);
                // Re-fetch order to get updated payment status
                axios.get(`checkout/${param?.order_oid}/`).then((r) => setOrder(r.data));
            })
            .catch((err) => {
                console.error("Payment verification error:", err);
                setIsLoading(false);
            });

    }, [param?.order_oid, sessionId, payaplOrderId]);

    const isOrderPaid = order?.payment_status === "paid" || 
                        orderResponse?.message === "Payment Successfull" || 
                        orderResponse?.message === "Already Paid" ||
                        orderResponse?.status === "paid";

    return (
        <div style={{ backgroundColor: "#f8fafc", minHeight: "85vh", padding: "40px 0" }}>
            <main>
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-lg-8 col-md-10">
                            {loading && (
                                <div className="card border-0 shadow-sm rounded-4 p-5 text-center bg-white">
                                    <div className="spinner-border text-primary mx-auto mb-3" style={{ width: "3.5rem", height: "3.5rem" }} role="status">
                                        <span className="visually-hidden">Verifying...</span>
                                    </div>
                                    <h4 className="fw-bold text-dark mb-1">Confirming Payment...</h4>
                                    <p className="text-muted mb-0">Please wait while we verify your order transaction.</p>
                                </div>
                            )}

                            {!loading && isOrderPaid && (
                                <div className="card border-0 shadow-sm rounded-4 p-4 p-md-5 text-center bg-white">
                                    <div className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3" style={{ width: "80px", height: "80px", backgroundColor: "#dcfce7" }}>
                                        <i className="fas fa-check text-success" style={{ fontSize: "38px" }}></i>
                                    </div>
                                    <span className="badge bg-success-subtle text-success border border-success-subtle px-3 py-2 rounded-pill fw-semibold mx-auto mb-2">
                                        Payment Verified &amp; Confirmed
                                    </span>
                                    <h2 className="fw-bold text-dark mb-2">Thank You For Your Order! 🎉</h2>
                                    <p className="text-muted mb-4" style={{ fontSize: "1.05rem" }}>
                                        Your payment was successful and order <strong className="text-dark">#{order.oid || param?.order_oid}</strong> has been placed. We have sent the confirmation details to <strong>{order.email}</strong>.
                                    </p>

                                    <div className="d-flex flex-wrap justify-content-center gap-2 mb-4">
                                        <Link to={`/track-order/${order.oid || param?.order_oid}/`} className="btn btn-warning rounded-pill px-4 py-2 fw-semibold text-dark shadow-sm">
                                            <i className="fas fa-truck-fast me-2"></i> Track Order Live
                                        </Link>
                                        <button
                                            className="btn btn-primary rounded-pill px-4 py-2 fw-semibold shadow-sm"
                                            data-bs-toggle="modal"
                                            data-bs-target="#exampleModal"
                                        >
                                            <i className="fas fa-eye me-2"></i> Order Details
                                        </button>
                                        <Link to={`/invoice/${order.oid || param?.order_oid}/`} className="btn btn-outline-secondary rounded-pill px-4 py-2 fw-semibold">
                                            <i className="fas fa-file-invoice me-2"></i> Download Invoice
                                        </Link>
                                        <Link to="/" className="btn btn-light border rounded-pill px-4 py-2 fw-semibold">
                                            <i className="fas fa-shopping-bag me-2"></i> Continue Shopping
                                        </Link>
                                    </div>

                                    <div className="p-3 rounded-3 text-start small" style={{ backgroundColor: "#f1f5f9" }}>
                                        <div className="d-flex justify-content-between mb-1">
                                            <span className="text-muted">Order ID:</span>
                                            <span className="fw-bold text-dark">#{order.oid || param?.order_oid}</span>
                                        </div>
                                        <div className="d-flex justify-content-between mb-1">
                                            <span className="text-muted">Total Amount Paid:</span>
                                            <span className="fw-bold text-success">${order.total}</span>
                                        </div>
                                        <div className="d-flex justify-content-between">
                                            <span className="text-muted">Delivery To:</span>
                                            <span className="text-dark">{order.full_name} ({order.city}, {order.country})</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {!loading && !isOrderPaid && (
                                <div className="card border-0 shadow-sm rounded-4 p-5 text-center bg-white">
                                    <div className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3" style={{ width: "80px", height: "80px", backgroundColor: "#fef3c7" }}>
                                        <i className="fas fa-clock text-warning" style={{ fontSize: "38px" }}></i>
                                    </div>
                                    <h3 className="fw-bold text-dark mb-2">Order Status: Pending</h3>
                                    <p className="text-muted mb-4">
                                        We are awaiting confirmation from the payment provider for Order #{order.oid || param?.order_oid}.
                                    </p>
                                    <div className="d-flex justify-content-center gap-2">
                                        <Link to={`/checkout/${order.oid || param?.order_oid}/`} className="btn btn-primary rounded-pill px-4">
                                            Return to Checkout
                                        </Link>
                                        <Link to="/" className="btn btn-outline-secondary rounded-pill px-4">
                                            Go Home
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
                    <div
                        className="modal fade"
                        id="exampleModal"
                        tabIndex={-1}
                        aria-labelledby="exampleModalLabel"
                        aria-hidden="true"
                    >
                        <div className="modal-dialog">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title" id="exampleModalLabel">
                                        Order Summary
                                    </h5>
                                    <button
                                        type="button"
                                        className="btn-close"
                                        data-bs-dismiss="modal"
                                        aria-label="Close"
                                    />
                                </div>
                                <div className="modal-body">
                                    <div className="modal-body text-start text-black p-4">
                                        <h5
                                            className="modal-title text-uppercase "
                                            id="exampleModalLabel"
                                        >
                                            {order.full_name}
                                        </h5>
                                        <h6>{order.email}</h6>
                                        <h6 className="mb-5">{order.address}</h6>
                                        <p className="mb-0" style={{ color: "#35558a" }}>
                                            Payment summary
                                        </p>
                                        <hr
                                            className="mt-2 mb-4"
                                            style={{
                                                height: 0,
                                                backgroundColor: "transparent",
                                                opacity: ".75",
                                                borderTop: "2px dashed #9e9e9e"
                                            }}
                                        />
                                        <div className="d-flex justify-content-between">
                                            <p className="fw-bold mb-0">Subtotal</p>
                                            <p className="text-muted mb-0">${order.sub_total}</p>
                                        </div>
                                        <div className="d-flex justify-content-between">
                                            <p className="small mb-0">Shipping Fee</p>
                                            <p className="small mb-0">${order.shipping_amount}</p>
                                        </div>
                                        <div className="d-flex justify-content-between">
                                            <p className="small mb-0">Service Fee</p>
                                            <p className="small mb-0">${order.service_fee}</p>
                                        </div>
                                        <div className="d-flex justify-content-between">
                                            <p className="small mb-0">Tax</p>
                                            <p className="small mb-0">${order.tax_fee}</p>
                                        </div>
                                        <div className="d-flex justify-content-between">
                                            <p className="small mb-0">Discount</p>
                                            <p className="small mb-0">-${order.saved}</p>
                                        </div>
                                        <div className="d-flex justify-content-between mt-4">
                                            <p className="fw-bold">Total</p>
                                            <p className="fw-bold" style={{ color: "#35558a" }}>
                                                ${order.total}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
    )
}

export default PaymentSuccess
