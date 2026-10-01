import React, { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom';

import apiInstance from '../../utils/axios';
import UserData from '../plugin/UserData';
import Sidebar from './Sidebar';
import Swal from 'sweetalert2';

function OrderItemDetail() {
    const [orderItems, setOrderItems] = useState([])
    const [order, setOrder] = useState([])
    const [courier, setCourier] = useState([])
    const [trackingData, setTrackingData] = useState({
        tracking_id: "",
        delivery_couriers: "",
        notify_buyer: false,
    })
    const [loading, setLoading] = useState(false)

    const handleTrackingDataChange = (event) => {
        setTrackingData({
            ...trackingData,
            [event.target.name]: event.target.type === 'checkbox' ? event.target.checked : event.target.value
        })
        console.log(trackingData);
    }


    const axios = apiInstance
    const userData = UserData()
    const param = useParams()

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`vendor/order-item-detail/${param.id}/`);
                setOrder(response.data.order);
                setOrderItems(response.data);
                if (response.data) {
                    setTrackingData(prev => ({
                        ...prev,
                        tracking_id: response.data.tracking_id || "",
                        delivery_couriers: response.data.delivery_couriers?.id || response.data.delivery_couriers || "",
                    }));
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        const fetchCourier = async () => {
            try {
                const response = await axios.get(`vendor/couriers/`);
                console.log("COURIERS API RESPONSE:", response.data);
                setCourier(response.data);
            } catch (error) {
                console.error("COURIERS ERROR:", error);
            }
        };

        fetchCourier();
        fetchData();
    }, []);

  const handleOnSubmit = async (e) => {
    e.preventDefault();

    if (!trackingData.delivery_couriers) {
        Swal.fire({
            icon: "warning",
            title: "Please select a delivery courier",
        });
        return;
    }

    if (!trackingData.tracking_id) {
        Swal.fire({
            icon: "warning",
            title: "Please enter tracking ID",
        });
        return;
    }

    setLoading(true);

    try {
        const formdata = new FormData();

        formdata.append("tracking_id", trackingData.tracking_id);
        formdata.append(
            "delivery_couriers",
            trackingData.delivery_couriers
        );
        formdata.append(
            "notify_buyer",
            trackingData.notify_buyer
        );

        const response = await axios.patch(
            `vendor/order-item-detail/${param.id}/`,
            formdata
        );

        console.log("TRACKING RESPONSE:", response.data);

        setLoading(false);

        await Swal.fire({
            icon: "success",
            title: "Tracking ID Added",
            text: "Tracking information saved successfully.",
        });

    } catch (error) {
        console.error("TRACKING ERROR:", error);

        setLoading(false);

        Swal.fire({
            icon: "error",
            title: "Failed to save tracking data",
            text:
                error.response?.data?.message ||
                "Something went wrong while saving tracking information.",
        });
    }
};


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
                                            <i className="fas fa-shopping-cart text-primary" /> #{order.oid}
                                        </h3>
                                    </section>

                                    <section className="">
                                        <div className="row rounded shadow p-3">
                                            <div className="col-lg-12 mb-4 mb-lg-0">
                                                <form onSubmit={handleOnSubmit}>
                                                    <div className="mb-3">
                                                        <label htmlFor="exampleInputEmail1" className="form-label">
                                                            <i className='fas fa-truck'></i> Choose Delivery Courier
                                                        </label>
                                                        <select required onChange={handleTrackingDataChange} name="delivery_couriers" value={trackingData.delivery_couriers} className="form-select">
                                                            <option value="">Select Delivery Courier</option>
                                                            {courier.map((c, index) => (
                                                                <option key={index} value={c.id}>{c.name}</option>
                                                            ))}
                                                        </select>
                                                        <div id="emailHelp" className="form-text">
                                                            <span className="" style={{ color: "gray" }}>
                                                                <a href="">Contact us</a> if you can't find a shipping couriers
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="mb-3">
                                                        <label htmlFor="exampleInputPassword1" className="form-label">
                                                            <i className='fas fa-link'></i> Tracking ID
                                                        </label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            onChange={handleTrackingDataChange}
                                                            name="tracking_id"
                                                            placeholder="Enter Tracking ID / AWB Number"
                                                            value={trackingData.tracking_id}
                                                        />
                                                    </div>
                                                    <div className="mb-3 form-check">
                                                        <input onChange={handleTrackingDataChange} name='notify_buyer' type="checkbox" className="form-check-input" id="exampleCheck1" />
                                                        <label className="form-check-label" htmlFor="exampleCheck1">
                                                            Notify Buyer
                                                        </label>
                                                    </div>
                                                    <Link to={`/vendor/orders/${order.oid}/`} className="btn btn-outline-secondary me-2"><i className='fas fa-arrow-left'></i> Go Back</Link>
                                                    {loading === true
                                                        ? <button type="submit" disabled className="btn btn-primary">Saving Tracking Data <i className='fas fa-spinner fa-spin'></i></button>
                                                        : <button type="submit" className="btn btn-primary">Save Tracking Info</button>
                                                    }
                                                </form>
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

export default OrderItemDetail