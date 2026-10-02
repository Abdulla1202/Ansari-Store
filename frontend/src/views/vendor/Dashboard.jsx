import React, { useState, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom';
import moment from 'moment';
import Chart from "chart.js/auto";
import { Pie, Line } from "react-chartjs-2";

import apiInstance from '../../utils/axios';
import UserData from '../plugin/UserData';
import Sidebar from './Sidebar';
import Swal from 'sweetalert2';



function Dashboard() {

  const axios = apiInstance
  const userData = UserData()
  const navigate = useNavigate()
  const vendorId = userData?.vendor_id

  const [stats, setStats] = useState(() => {
    try {
      const c = localStorage.getItem(`cached_vendor_stats_${vendorId}`);
      return c ? JSON.parse(c) : null;
    } catch {
      return null;
    }
  });
  const [products, setProducts] = useState(() => {
    try {
      const c = localStorage.getItem(`cached_vendor_products_${vendorId}`);
      return c ? JSON.parse(c) : [];
    } catch {
      return [];
    }
  });
  const [orders, setOrders] = useState(() => {
    try {
      const c = localStorage.getItem(`cached_vendor_orders_${vendorId}`);
      return c ? JSON.parse(c) : [];
    } catch {
      return [];
    }
  });
  const [orderChartData, setOrderChartData] = useState(() => {
    try {
      const c = localStorage.getItem(`cached_vendor_order_chart_${vendorId}`);
      return c ? JSON.parse(c) : null;
    } catch {
      return null;
    }
  });
  const [productsChartData, setProductsChartData] = useState(() => {
    try {
      const c = localStorage.getItem(`cached_vendor_product_chart_${vendorId}`);
      return c ? JSON.parse(c) : null;
    } catch {
      return null;
    }
  });

  if (UserData()?.vendor_id === 0) {
    window.location.href = '/vendor/register/'
  }

  if (vendorId) {
    useEffect(() => {
      const fetchData = async () => {
        try {
          const response = await axios.get(`vendor/stats/${vendorId}/`)
          setStats(response.data[0]);
          localStorage.setItem(`cached_vendor_stats_${vendorId}`, JSON.stringify(response.data[0]));
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      };
      fetchData();
    }, [vendorId]);

    useEffect(() => {
      const fetchData = async () => {
        try {
          const response = await axios.get(`vendor/products/${vendorId}/`)
          setProducts(response.data);
          localStorage.setItem(`cached_vendor_products_${vendorId}`, JSON.stringify(response.data));
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      };
      fetchData();
    }, [vendorId]);

    useEffect(() => {
      const fetchData = async () => {
        try {
          const response = await axios.get(`vendor/orders/${vendorId}/`)
          setOrders(response.data);
          localStorage.setItem(`cached_vendor_orders_${vendorId}`, JSON.stringify(response.data));
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      };
      fetchData();
    }, [vendorId]);
  }

  useEffect(() => {
    if (!vendorId) return;
    const fetchChartData = async () => {
      try {
        const order_response = await axios.get(`vendor-orders-report-chart/${vendorId}/`);
        setOrderChartData(order_response.data);
        localStorage.setItem(`cached_vendor_order_chart_${vendorId}`, JSON.stringify(order_response.data));

        const product_response = await axios.get(`vendor-products-report-chart/${vendorId}/`);
        setProductsChartData(product_response.data);
        localStorage.setItem(`cached_vendor_product_chart_${vendorId}`, JSON.stringify(product_response.data));
      } catch (error) {
        console.log(error);
      }
    };
    fetchChartData();
  }, [vendorId])

  const order_months = orderChartData?.map(item => item.month);
  const order_counts = orderChartData?.map(item => item.orders);

  const product_labels = productsChartData?.map(item => item.month);
  const product_count = productsChartData?.map(item => item.orders);

  const order_data = {
    labels: order_months,
    datasets: [
      {
        label: "Total Orders",
        data: order_counts,
        fill: true,
        backgroundColor: "rgba(75,192,192,0.2)",
        borderColor: "rgba(75,192,192,1)"
      },


    ]
  }

  const product_data = {
    labels: product_labels,
    datasets: [
      {
        label: "Total Products",
        data: product_count,
        fill: true,
        backgroundColor: "#ba9ede",
        borderColor: "#6100e0"
      },


    ]
  }



  return (
    <div className="container-fluid" id="main" >
      <div className="row row-offcanvas row-offcanvas-left h-100">
        <Sidebar />
        <div className="col-md-9 col-lg-10 main mt-4">
          <div className="row mb-4">
            <div className="col-xl-4 col-lg-6 mb-3">
              <div className="card border-0 shadow-sm rounded-4 text-white" style={{ background: "linear-gradient(135deg, #10b981 0%, #059669 100%)" }}>
                <div className="card-body p-4 d-flex justify-content-between align-items-center">
                  <div>
                    <span className="text-uppercase small fw-semibold text-white-50">Total Products</span>
                    <h2 className="fw-bold mt-1 mb-0">{stats?.products || 0}</h2>
                  </div>
                  <div className="rounded-circle p-3 d-flex align-items-center justify-content-center" style={{ backgroundColor: "rgba(255,255,255,0.2)", width: 64, height: 64 }}>
                    <i className="bi bi-grid-3x3-gap-fill fs-3" />
                  </div>
                </div>
              </div>
            </div>
            <div className="col-xl-4 col-lg-6 mb-3">
              <div className="card border-0 shadow-sm rounded-4 text-white" style={{ background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)" }}>
                <div className="card-body p-4 d-flex justify-content-between align-items-center">
                  <div>
                    <span className="text-uppercase small fw-semibold text-white-50">Total Orders</span>
                    <h2 className="fw-bold mt-1 mb-0">{stats?.orders || 0}</h2>
                  </div>
                  <div className="rounded-circle p-3 d-flex align-items-center justify-content-center" style={{ backgroundColor: "rgba(255,255,255,0.2)", width: 64, height: 64 }}>
                    <i className="bi bi-cart-check-fill fs-3" />
                  </div>
                </div>
              </div>
            </div>

            <div className="col-xl-4 col-lg-6 mb-3">
              <div className="card border-0 shadow-sm rounded-4 text-white" style={{ background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)" }}>
                <div className="card-body p-4 d-flex justify-content-between align-items-center">
                  <div>
                    <span className="text-uppercase small fw-semibold text-white-50">Total Revenue</span>
                    <h2 className="fw-bold mt-1 mb-0">${stats?.revenue || 0}</h2>
                  </div>
                  <div className="rounded-circle p-3 d-flex align-items-center justify-content-center" style={{ backgroundColor: "rgba(255,255,255,0.2)", width: 64, height: 64 }}>
                    <i className="bi bi-currency-dollar fs-3" />
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/*/row*/}
          <hr />
          <div className="row mb-1 mt-4">
            <div className="col">
              <h4>Chart Analytics</h4>
            </div>
          </div>
          <Link className='btn btn-primary me-2'>Daily Report</Link>
          <Link className='btn btn-primary me-2'>Monthly Report</Link>
          <Link className='btn btn-primary me-2'>Yearly Report</Link>
          <div className="row my-3 g-3">
            <div className="col-12 col-xl-6">
              <div className="card shadow-sm border-0 rounded-4 h-100">
                <div className="card-body p-3">
                  <h6 className="fw-bold mb-3 text-secondary">Orders Trend</h6>
                  <div style={{ position: "relative", height: "260px", width: "100%" }}>
                    <Line data={order_data} options={{ responsive: true, maintainAspectRatio: false }} />
                  </div>
                </div>
              </div>
            </div>
            <div className="col-12 col-xl-6">
              <div className="card shadow-sm border-0 rounded-4 h-100">
                <div className="card-body p-3">
                  <h6 className="fw-bold mb-3 text-secondary">Products Growth</h6>
                  <div style={{ position: "relative", height: "260px", width: "100%" }}>
                    <Line data={product_data} options={{ responsive: true, maintainAspectRatio: false }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <a id="layouts" />
          <div className="mb-3 mt-4">
            <nav className='mb-4'>
              <div className="nav nav-tabs" id="nav-tab" role="tablist">
                <button className="nav-link active" id="nav-home-tab" data-bs-toggle="tab" data-bs-target="#nav-home" type="button" role="tab" aria-controls="nav-home" aria-selected="true"> <i className='bi bi-grid-fill'></i> Products</button>
                <button className="nav-link" id="nav-profile-tab" data-bs-toggle="tab" data-bs-target="#nav-profile" type="button" role="tab" aria-controls="nav-profile" aria-selected="false"> <i className='fas fa-shopping-cart'></i> Orders</button>
              </div>
            </nav>
            <div className="tab-content" id="nav-tabContent">
              <div className="tab-pane fade show active" id="nav-home" role="tabpanel" aria-labelledby="nav-home-tab">
                <h4>Products</h4>
                <div className="table-responsive">
                  <table className="table">
                  <thead className="table-dark">
                    <tr>
                      <th scope="col">#ID</th>
                      <th scope="col">Name</th>
                      <th scope="col">Price</th>
                      <th scope="col">Quantity</th>
                      <th scope="col">Orders</th>
                      <th scope="col">Status</th>
                      <th scope="col">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products?.map((p, index) => (
                      <tr key={index}>
                        <th scope="row">#{p.sku}</th>
                        <td>{p.title}</td>
                        <td>${p.price}</td>
                        <td>{p.stock_qty}</td>
                        <td>{p.order_count}</td>
                        <td>
                          <span className={`badge ${p.status === 'published' ? 'bg-success' : 'bg-secondary'}`}>
                            {p?.status?.toUpperCase()}
                          </span>
                        </td>
                        <td>
                          <Link to={`/detail/${p.slug}`} className="btn btn-primary btn-sm mb-1 me-2" title="View"><i className="fas fa-eye" /></Link>
                          <Link to={`/vendor/product/update/${p.pid}/`} className="btn btn-success btn-sm mb-1 me-2" title="Edit"><i className="fas fa-edit" /></Link>
                        </td>
                      </tr>
                    ))}

                    {(!products || products.length < 1) &&
                      <tr>
                        <td colSpan={7}>
                          <h5 className='mt-4 p-3'>No products yet</h5>
                        </td>
                      </tr>
                    }


                  </tbody>
                </table>
                </div>
              </div>
              <div className="tab-pane fade" id="nav-profile" role="tabpanel" aria-labelledby="nav-profile-tab">
                <h4>Orders</h4>
                <div className="table-responsive">
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
                          <Link to={`/track-order/${o.oid}/`} className="btn btn-outline-info btn-sm mb-1" title="Live Tracking">
                            <i className="fas fa-truck" />
                          </Link>
                        </td>
                      </tr>
                    ))}

                    {(!orders || orders.length < 1) &&
                      <tr>
                        <td colSpan={5}>
                          <h5 className='mt-4 p-3'>No orders yet</h5>
                        </td>
                      </tr>
                    }

                  </tbody>
                </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div >
  )
}

export default Dashboard