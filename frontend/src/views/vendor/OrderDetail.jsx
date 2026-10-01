import React, { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom';

import apiInstance from '../../utils/axios';
import UserData from '../plugin/UserData';
import Sidebar from './Sidebar';


function OrderDetail() {

  const [order, setOrder] = useState([])
  const [orderItems, setOrderItems] = useState([])

  if (UserData()?.vendor_id === 0) {
    window.location.href = '/vendor/register/'
  }

  const axios = apiInstance
  const userData = UserData()
  const param = useParams()

 useEffect(() => {

    if (!userData?.vendor_id || !param?.oid) {
        console.log(
            "Waiting for vendor ID or order ID...",
            userData?.vendor_id,
            param?.oid
        );
        return;
    }

    const fetchData = async () => {

        try {

            console.log(
                "Fetching order:",
                userData.vendor_id,
                param.oid
            );

            const response = await axios.get(
                `vendor/orders/${userData.vendor_id}/${param.oid}/`
            );

            console.log("ORDER DETAIL:", response.data);

            setOrder(response.data);
            setOrderItems(response.data.orderitem || []);

        } catch (error) {

            console.error(
                "Error fetching order detail:",
                error.response?.data || error.message
            );

        }
    };

    fetchData();

}, [userData?.vendor_id, param?.oid]);
  return (
    <div className="container-fluid" id="main" >
      <div className="row row-offcanvas row-offcanvas-left h-100">
        <Sidebar />
        <div className="col-md-9 col-lg-10 main">
          <div className="mb-3 mt-3" style={{ marginBottom: 300 }}>
            <div>
              <main className="mb-5">
                {/* Container for demo purpose */}
                <div className="container px-4">
                  {/* Section: Summary */}
                  <section className="mb-5">
                    <h3 className="mb-3">
                      {" "}
                      <i className="fas fa-shopping-cart text-primary" /> #{order.oid}{" "}
                    </h3>

                    <div className="row gx-xl-5">
                      <div className="col-lg-3 mb-4 mb-lg-0">
                        <div
                          className="rounded shadow"
                          style={{ backgroundColor: "#B2DFDB" }}
                        >
                          <div className="card-body">
                            <div className="d-flex align-items-center">
                              <div className="">
                                <p className="mb-1">Total</p>
                                <h2 className="mb-0">
                                  ${order?.total}
                                  <span
                                    className=""
                                    style={{ fontSize: "0.875rem" }}
                                  ></span>
                                </h2>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="col-lg-3 mb-4 mb-lg-0">
                        <div
                          className="rounded shadow"
                          style={{ backgroundColor: "#D1C4E9" }}
                        >
                          <div className="card-body">
                            <div className="d-flex align-items-center">
                              <div className="">
                                <p className="mb-1">Payment Status</p>
                                <h2 className="mb-0">
                                  {order?.payment_status?.toUpperCase()}

                                  <span
                                    className=""
                                    style={{ fontSize: "0.875rem" }}
                                  ></span>
                                </h2>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="col-lg-3 mb-4 mb-lg-0">
                        <div
                          className="rounded shadow"
                          style={{ backgroundColor: "#BBDEFB" }}
                        >
                          <div className="card-body">
                            <div className="d-flex align-items-center">
                              <div className="">
                                <p className="mb-1">Order Status</p>
                                <h2 className="mb-0">
                                  {order.order_status}
                                  <span
                                    className=""
                                    style={{ fontSize: "0.875rem" }}
                                  ></span>
                                </h2>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="col-lg-3 mb-4 mb-lg-0">
                        <div
                          className="rounded shadow"
                          style={{ backgroundColor: "#bbfbeb" }}
                        >
                          <div className="card-body">
                            <div className="d-flex align-items-center">
                              <div className="">
                                <p className="mb-1">Shipping Amount</p>
                                <h2 className="mb-0">
                                  ${order.shipping_amount}
                                  <span
                                    className=""
                                    style={{ fontSize: "0.875rem" }}
                                  ></span>
                                </h2>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="col-lg-4 mb-4 mb-lg-0 mt-5">
                        <div
                          className="rounded shadow"
                          style={{ backgroundColor: "#bbf7fb" }}
                        >
                          <div className="card-body">
                            <div className="d-flex align-items-center">
                              <div className="">
                                <p className="mb-1">Tax Fee</p>
                                <h2 className="mb-0">
                                  ${order.tax_fee}

                                  <span
                                    className=""
                                    style={{ fontSize: "0.875rem" }}
                                  ></span>
                                </h2>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="col-lg-4 mb-4 mb-lg-0 mt-5">
                        <div
                          className="rounded shadow"
                          style={{ backgroundColor: "#eebbfb" }}
                        >
                          <div className="card-body">
                            <div className="d-flex align-items-center">
                              <div className="">
                                <p className="mb-1">Service Fee</p>
                                <h2 className="mb-0">
                                  ${order.service_fee}
                                  <span
                                    className=""
                                    style={{ fontSize: "0.875rem" }}
                                  ></span>
                                </h2>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="col-lg-4 mb-4 mb-lg-0 mt-5">
                        <div
                          className="rounded shadow"
                          style={{ backgroundColor: "#bbc5fb" }}
                        >
                          <div className="card-body">
                            <div className="d-flex align-items-center">
                              <div className="">
                                <p className="mb-1">Discount Fee</p>
                                <h2 className="mb-0">
                                  -${order.saved}
                                  <span
                                    className=""
                                    style={{ fontSize: "0.875rem" }}
                                  ></span>
                                </h2>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </section>




                  {/* Section: Summary */}
                  {/* Section: MSC */}
                  <section className="">
                    <div className="row rounded shadow p-3">
                      <div className="col-lg-12 mb-4 mb-lg-0">
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
                            {orderItems?.map((order, index) => (
                              <tr key={index}>
                                <td>
                                  <div className="d-flex align-items-center">
                                    <img
                                      src={order?.product?.image}
                                      style={{ width: 70, height: 70, objectFit: "cover", borderRadius: 8 }}
                                      alt=""
                                    />
                                    <Link to={`/detail/${order.product.slug}`} className="fw-bold text-dark ms-2 mb-0">
                                      {order?.product?.title}
                                    </Link>
                                  </div>
                                </td>
                                <td>
                                  <p className="fw-normal mb-1">${order.product.price}</p>
                                </td>
                                <td>
                                  <p className="fw-normal mb-1">{order.qty}</p>
                                </td>
                                <td>
                                  <span className="fw-normal mb-1">${order.sub_total}</span>
                                </td>
                                <td>
                                  <span className="fw-normal mb-1 text-danger"> -${order.saved}</span>
                                </td>
                                <td>
                                  {order.tracking_id && order.tracking_id !== 'undefined' ? (
                                    <div>
                                      <span className="badge bg-success-subtle text-success border border-success-subtle mb-1 d-inline-block">
                                        <i className="fas fa-truck me-1"></i> {order.delivery_couriers?.name || 'Courier Assigned'}
                                      </span>
                                      <div className="small font-monospace text-dark fw-bold">
                                        AWB: {order.tracking_id}
                                      </div>
                                    </div>
                                  ) : (
                                    <span className="badge bg-secondary-subtle text-secondary border">
                                      No Tracking Yet
                                    </span>
                                  )}
                                </td>
                                <td>
                                  {order.tracking_id == null || order.tracking_id === 'undefined' || !order.tracking_id ? (
                                    <Link className="btn btn-primary btn-sm rounded-pill" to={`/vendor/orders/${param.oid}/${order.id}/`}>
                                      Add Tracking <i className='fas fa-plus ms-1'></i>
                                    </Link>
                                  ) : (
                                    <div className="d-flex gap-1 flex-wrap">
                                      <Link className="btn btn-outline-secondary btn-sm rounded-pill" to={`/vendor/orders/${param.oid}/${order.id}/`}>
                                        <i className='fas fa-edit'></i> Edit
                                      </Link>
                                      <Link className="btn btn-outline-primary btn-sm rounded-pill" to={`/track-order/${param.oid}/?tracking_id=${order.tracking_id}`}>
                                        <i className='fas fa-location-arrow'></i> Track
                                      </Link>
                                    </div>
                                  )}
                                </td>
                              </tr>
                            ))}

                            {orderItems.length < 1 && (
    <tr>
        <td colSpan="6" className="text-center">
            <h5 className="mt-4">
                No Order Item
            </h5>
        </td>
    </tr>
)}

                          </tbody>
                        </table>
                      </div>
                    </div>
                  </section>
                </div>
              </main>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrderDetail