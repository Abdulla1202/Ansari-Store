import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom';

import apiInstance from '../../utils/axios';
import UserData from '../plugin/UserData';
import Sidebar from './Sidebar';
import { deleteProduct } from '../plugin/DeleteProduct';

function Products() {
    const axios = apiInstance
    const userData = UserData()
    const vendorId = userData?.vendor_id

    const [products, setProducts] = useState(() => {
        try {
            const cached = localStorage.getItem(`cached_vendor_products_${vendorId}`);
            return cached ? JSON.parse(cached) : [];
        } catch {
            return [];
        }
    });

    if (UserData()?.vendor_id === 0) {
        window.location.href = '/vendor/register/'
    }
    
    const fetchData = async () => {
        if (!vendorId) return;
        try {
            const response = await axios.get(`vendor/products/${vendorId}/`)
            setProducts(response.data);
            localStorage.setItem(`cached_vendor_products_${vendorId}`, JSON.stringify(response.data));
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    useEffect(() => {
        fetchData();
    }, [vendorId]);

    const handleDeleteProduct = async (productPid) => {
        try {
            await deleteProduct(vendorId, productPid)
            await fetchData();
        } catch (error) {
            console.log(error);
        }
    }


    const handleFilterProduct = async (param) => {
        try {
            const response = await axios.get(`vendor-product-filter/${vendorId}?filter=${param}`)
            setProducts(response.data);
            if (param === 'no-filter') {
                localStorage.setItem(`cached_vendor_products_${vendorId}`, JSON.stringify(response.data));
            }
        } catch (error) {
            console.log(error);
        }
    }

    return (
        <div className="container-fluid" id="main" >
            <div className="row row-offcanvas row-offcanvas-left h-100">
                <Sidebar />
                <div className="col-md-9 col-lg-10 main mt-4">
                    <>
                        <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-2">
                            <h4 className="fw-bold mb-0">
                                <i className="bi bi-grid me-2 text-primary" /> All Products
                            </h4>
                            <div className="d-flex gap-2">
                                <div className="dropdown">
                                    <button
                                        className="btn btn-outline-secondary dropdown-toggle"
                                        type="button"
                                        id="dropdownMenuButton1"
                                        data-bs-toggle="dropdown"
                                        aria-expanded="false"
                                    >
                                        Filter <i className="fas fa-sliders ms-1" />
                                    </button>
                                    <ul className="dropdown-menu dropdown-menu-end shadow-sm border-0" aria-labelledby="dropdownMenuButton1">
                                        <li>
                                            <button className="dropdown-item" onClick={() => handleFilterProduct('no-filter')}>
                                                No Filter
                                            </button>
                                        </li>
                                        <li>
                                            <button className="dropdown-item" onClick={() => handleFilterProduct('published')}>
                                                Status: Published
                                            </button>
                                        </li>
                                        <li>
                                            <button className="dropdown-item" onClick={() => handleFilterProduct('draft')}>
                                                Status: In Draft
                                            </button>
                                        </li>
                                        <li>
                                            <button className="dropdown-item" onClick={() => handleFilterProduct('in-review')}>
                                                Status: In-review
                                            </button>
                                        </li>
                                        <li>
                                            <button className="dropdown-item" onClick={() => handleFilterProduct('disabled')}>
                                                Status: Disabled
                                            </button>
                                        </li>

                                        <li><hr className="dropdown-divider" /></li>
                                        <li>
                                            <button className="dropdown-item" onClick={() => handleFilterProduct('latest')}>
                                                Date: Latest
                                            </button>
                                        </li>
                                        <li>
                                            <button className="dropdown-item" onClick={() => handleFilterProduct('oldest')}>
                                                Date: Oldest
                                            </button>
                                        </li>
                                    </ul>
                                </div>
                                <Link to={'/vendor/product/new/'} className='btn btn-primary'>
                                    <i className="fas fa-plus me-1"></i> Add Product
                                </Link>
                            </div>
                        </div>
                    </>

                    {/* Mobile Card List (d-md-none) */}
                    <div className="d-md-none mt-3">
                        {products?.map((p, index) => (
                            <div key={index} className="card border-0 shadow-sm rounded-4 mb-3 p-3 bg-white">
                                <div className="d-flex align-items-center justify-content-between mb-2">
                                    <span className="badge bg-light text-muted border font-monospace">#{p.sku || p.pid}</span>
                                    <span className={`badge ${p.status === 'published' ? 'bg-success' : 'bg-secondary'}`}>
                                        {p?.status?.toUpperCase()}
                                    </span>
                                </div>
                                <div className="d-flex gap-3 align-items-center mb-3">
                                    {p.image ? (
                                        <img
                                            src={p.image}
                                            alt={p.title}
                                            className="rounded-3 object-fit-cover shadow-sm"
                                            style={{ width: '60px', height: '60px' }}
                                        />
                                    ) : (
                                        <div className="rounded-3 bg-light d-flex align-items-center justify-content-center text-muted" style={{ width: '60px', height: '60px' }}>
                                            <i className="bi bi-image fs-4"></i>
                                        </div>
                                    )}
                                    <div className="flex-grow-1">
                                        <h6 className="fw-bold mb-1 text-dark" style={{ fontSize: '0.95rem' }}>{p.title}</h6>
                                        <div className="d-flex align-items-center gap-3 small text-muted">
                                            <span>Price: <strong className="text-primary">${p.price}</strong></span>
                                            <span>Qty: <strong>{p.stock_qty}</strong></span>
                                            <span>Orders: <strong>{p.order_count || 0}</strong></span>
                                        </div>
                                    </div>
                                </div>
                                <div className="d-flex gap-2 pt-2 border-top">
                                    <Link to={`/detail/${p.slug}`} className="btn btn-outline-primary btn-sm flex-fill rounded-pill py-2">
                                        <i className="fas fa-eye me-1" /> View
                                    </Link>
                                    <Link to={`/vendor/product/update/${p.pid}/`} className="btn btn-outline-success btn-sm flex-fill rounded-pill py-2">
                                        <i className="fas fa-edit me-1" /> Edit
                                    </Link>
                                    <button type='button' onClick={() => handleDeleteProduct(p.pid)} className="btn btn-outline-danger btn-sm rounded-pill px-3 py-2">
                                        <i className="fas fa-trash" />
                                    </button>
                                </div>
                            </div>
                        ))}

                        {(!products || products.length < 1) && (
                            <div className="card border-0 shadow-sm rounded-4 p-4 text-center my-3">
                                <i className="bi bi-box-seam fs-1 text-muted mb-2"></i>
                                <h6 className="text-muted mb-0">No Products Found</h6>
                            </div>
                        )}
                    </div>

                    {/* Desktop / Tablet Table View (d-none d-md-block) */}
                    <div className="d-none d-md-block mb-3 mt-2">
                        <div className="table-responsive card border-0 shadow-sm rounded-4 overflow-hidden">
                            <table className="table align-middle mb-0">
                                <thead className="table-dark">
                                    <tr>
                                        <th scope="col">#ID</th>
                                        <th scope="col">Name</th>
                                        <th scope="col">Price</th>
                                        <th scope="col">Quantity</th>
                                        <th scope="col">Orders</th>
                                        <th scope="col">Status</th>
                                        <th scope="col" style={{ minWidth: "140px" }}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {products?.map((p, index) => (
                                        <tr key={index}>
                                            <th scope="row">#{p.sku || p.pid}</th>
                                            <td className="fw-semibold">{p.title}</td>
                                            <td className="fw-bold text-primary">${p.price}</td>
                                            <td>{p.stock_qty}</td>
                                            <td>{p.order_count || 0}</td>
                                            <td>
                                                <span className={`badge ${p.status === 'published' ? 'bg-success' : 'bg-secondary'}`}>
                                                    {p?.status?.toUpperCase()}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="d-flex align-items-center gap-2">
                                                    <Link to={`/detail/${p.slug}`} className="btn btn-primary btn-sm rounded-circle p-2" title="View">
                                                        <i className="fas fa-eye" />
                                                    </Link>
                                                    <Link to={`/vendor/product/update/${p.pid}/`} className="btn btn-success btn-sm rounded-circle p-2" title="Edit">
                                                        <i className="fas fa-edit" />
                                                    </Link>
                                                    <button type='button' onClick={() => handleDeleteProduct(p.pid)} className="btn btn-danger btn-sm rounded-circle p-2" title="Delete">
                                                        <i className="fas fa-trash" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}

                                    {(!products || products.length < 1) &&
                                         <tr>
                                             <td colSpan={7}>
                                                 <h5 className='p-3 mt-4 text-center text-muted'>No Products Yet</h5>
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
    )
}

export default Products