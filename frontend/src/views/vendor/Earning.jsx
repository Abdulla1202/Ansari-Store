import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom';
import { Line } from "react-chartjs-2";

import apiInstance from '../../utils/axios';
import UserData from '../plugin/UserData';
import Sidebar from './Sidebar';


function Earning() {
  const axios = apiInstance
  const userData = UserData()
  const vendorId = userData?.vendor_id

  const [earningStats, setEarningStats] = useState(() => {
    try {
      const c = localStorage.getItem(`cached_vendor_earning_stats_${vendorId}`);
      return c ? JSON.parse(c) : null;
    } catch {
      return null;
    }
  });

  const [earningStatsTracker, setEarningTracker] = useState(() => {
    try {
      const c = localStorage.getItem(`cached_vendor_earning_tracker_${vendorId}`);
      return c ? JSON.parse(c) : [];
    } catch {
      return [];
    }
  });

  const [earningChartData, setEarningChartData] = useState(() => {
    try {
      const c = localStorage.getItem(`cached_vendor_earning_tracker_${vendorId}`);
      return c ? JSON.parse(c) : null;
    } catch {
      return null;
    }
  });

  if (UserData()?.vendor_id === 0) {
    window.location.href = '/vendor/register/'
  }

  useEffect(() => {
    if (!vendorId) return;
    const fetchEarningStats = async () => {
      try {
        const [statsRes, monthlyRes] = await Promise.all([
          axios.get(`vendor-earning/${vendorId}/`),
          axios.get(`vendor-monthly-earning/${vendorId}/`)
        ]);

        if (statsRes?.data?.[0]) {
          setEarningStats(statsRes.data[0]);
          localStorage.setItem(`cached_vendor_earning_stats_${vendorId}`, JSON.stringify(statsRes.data[0]));
        }

        if (monthlyRes?.data) {
          setEarningTracker(monthlyRes.data);
          setEarningChartData(monthlyRes.data);
          localStorage.setItem(`cached_vendor_earning_tracker_${vendorId}`, JSON.stringify(monthlyRes.data));
        }
      } catch (error) {
        console.error('Error fetching earning data:', error);
      }
    };
    fetchEarningStats();
  }, [vendorId]);

  const months = earningChartData?.map(item => {
    const monthNames = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return monthNames[item.month] || `M${item.month}`;
  });
  const revenue = earningChartData?.map(item => item.total_earning);

  const revenue_data = {
    labels: months || [],
    datasets: [
      {
        label: "Revenue ($)",
        data: revenue || [],
        fill: true,
        backgroundColor: "rgba(99, 102, 241, 0.15)",
        borderColor: "#4f46e5",
        tension: 0.3
      },
    ]
  }

  return (
    <div className="container-fluid" id="main">
      <div className="row row-offcanvas row-offcanvas-left h-100">
        <Sidebar />
        <div className="col-md-9 col-lg-10 main mt-4">
          <div className="mb-4">
            <h4 className="fw-bold mb-1">
              <i className="fas fa-dollar-sign text-success me-2"></i> Earning & Revenue
            </h4>
            <p className="text-muted small">Real-time breakdown of sales performance and earnings</p>

            <div className="row g-3 my-2">
              <div className="col-12 col-md-6">
                <div
                  className="card border-0 shadow-sm rounded-4 text-white p-3"
                  style={{ background: "linear-gradient(135deg, #10b981 0%, #059669 100%)" }}
                >
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <span className="text-uppercase small fw-semibold text-white-50">Total Sales Revenue</span>
                      <h2 className="fw-bold mt-1 mb-0">${earningStats?.total_revenue || "0.00"}</h2>
                    </div>
                    <div
                      className="rounded-circle p-3 d-flex align-items-center justify-content-center"
                      style={{ backgroundColor: "rgba(255,255,255,0.2)", width: 60, height: 60 }}
                    >
                      <i className="bi bi-currency-dollar fs-3" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-12 col-md-6">
                <div
                  className="card border-0 shadow-sm rounded-4 text-white p-3"
                  style={{ background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)" }}
                >
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <span className="text-uppercase small fw-semibold text-white-50">Monthly Earning (30 Days)</span>
                      <h2 className="fw-bold mt-1 mb-0">${earningStats?.monthly_revenue || "0.00"}</h2>
                    </div>
                    <div
                      className="rounded-circle p-3 d-flex align-items-center justify-content-center"
                      style={{ backgroundColor: "rgba(255,255,255,0.2)", width: 60, height: 60 }}
                    >
                      <i className="bi bi-graph-up-arrow fs-3" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <hr className="my-4" />

            <div className="row g-4">
              <div className="col-12 col-lg-6">
                <div className="card border-0 shadow-sm rounded-4 p-3 h-100">
                  <h5 className="fw-bold mb-3 text-secondary">
                    <i className="fas fa-calendar-alt me-2 text-primary"></i> Monthly Breakdown
                  </h5>
                  <div className="table-responsive">
                    <table className="table align-middle">
                      <thead className="table-dark">
                        <tr>
                          <th scope="col">Month</th>
                          <th scope="col">Sales</th>
                          <th scope="col">Revenue</th>
                        </tr>
                      </thead>
                      <tbody>
                        {earningStatsTracker?.map((earning, index) => (
                          <tr key={earning.id || index}>
                            <th scope="row">
                              {earning.month === 1 && "January"}
                              {earning.month === 2 && "February"}
                              {earning.month === 3 && "March"}
                              {earning.month === 4 && "April"}
                              {earning.month === 5 && "May"}
                              {earning.month === 6 && "June"}
                              {earning.month === 7 && "July"}
                              {earning.month === 8 && "August"}
                              {earning.month === 9 && "September"}
                              {earning.month === 10 && "October"}
                              {earning.month === 11 && "November"}
                              {earning.month === 12 && "December"}
                            </th>
                            <td>{earning.sales_count}</td>
                            <td className="fw-bold text-success">${Number(earning.total_earning || 0).toFixed(2)}</td>
                          </tr>
                        ))}
                        {(!earningStatsTracker || earningStatsTracker.length === 0) && (
                          <tr>
                            <td colSpan={3} className="text-center text-muted py-4">No monthly records yet</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div className="col-12 col-lg-6">
                <div className="card border-0 shadow-sm rounded-4 p-3 h-100">
                  <h5 className="fw-bold mb-3 text-secondary">
                    <i className="fas fa-chart-line me-2 text-info"></i> Revenue Growth
                  </h5>
                  <div style={{ position: "relative", height: "260px", width: "100%" }}>
                    <Line
                      data={revenue_data}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            display: false
                          }
                        }
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}

export default Earning