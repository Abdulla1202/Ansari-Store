import React, { useEffect, useState, useContext } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FaCheckCircle, FaShoppingCart, FaSpinner } from 'react-icons/fa';

import apiInstance from '../../utils/axios';
import GetCurrentAddress from '../plugin/UserCountry';
import UserData from '../plugin/UserData';
import CartID from '../plugin/cartID';
import { addToCart } from '../plugin/addToCart';
import { addToWishlist } from '../plugin/addToWishlist';
import { CartContext } from '../plugin/Context';

function Search() {
    const [products, setProducts] = useState([]);
    const [loadingStates, setLoadingStates] = useState({});
    const [loading, setLoading] = useState(true);

    const axios = apiInstance;
    const [searchParams, setSearchParams] = useSearchParams();
    const query = searchParams.get('query') || '';
    const [searchTerm, setSearchTerm] = useState(query || '');

    const currentAddress = GetCurrentAddress();
    const userData = UserData();
    let cart_id = CartID();

    const [selectedProduct, setSelectedProduct] = useState(null);
    const [selectedColors, setSelectedColors] = useState({});
    const [selectedSize, setSelectedSize] = useState({});
    const [colorImage, setColorImage] = useState('');
    const [colorValue, setColorValue] = useState('No Color');
    const [sizeValue, setSizeValue] = useState('No Size');
    const [qtyValue, setQtyValue] = useState(1);
    let [cartCount, setCartCount] = useContext(CartContext);
    const [activeDropdown, setActiveDropdown] = useState(null);

    // Keep input in sync with URL query
    useEffect(() => {
        setSearchTerm(query || '');
    }, [query]);

    useEffect(() => {
        let isMounted = true;
        setLoading(true);

        const fetchResults = async () => {
            try {
                // If query is valid, search; otherwise fetch all products
                const endpoint = (query && query.trim() !== '' && query !== 'null')
                    ? `search/?query=${encodeURIComponent(query.trim())}`
                    : 'products/';

                const response = await axios.get(endpoint);
                if (isMounted) {
                    setProducts(response.data || []);
                    setLoading(false);
                }
            } catch (error) {
                console.error('Search fetch error:', error);
                if (isMounted) {
                    setProducts([]);
                    setLoading(false);
                }
            }
        };

        fetchResults();

        return () => {
            isMounted = false;
        };
    }, [query]);

    const handleSearchSubmit = (e) => {
        if (e) e.preventDefault();
        const trimmed = searchTerm.trim();
        if (trimmed) {
            setSearchParams({ query: trimmed });
        } else {
            setSearchParams({});
        }
    };

    const handleColorButtonClick = (event, product_id, colorName, colorImg) => {
        setColorValue(colorName);
        setColorImage(colorImg);
        setSelectedProduct(product_id);
        setSelectedColors((prev) => ({
            ...prev,
            [product_id]: colorName,
        }));
    };

    const handleSizeButtonClick = (event, product_id, sizeName) => {
        setSizeValue(sizeName);
        setSelectedProduct(product_id);
        setSelectedSize((prev) => ({
            ...prev,
            [product_id]: sizeName,
        }));
    };

    const handleQtyChange = (event, product_id) => {
        setQtyValue(event.target.value);
        setSelectedProduct(product_id);
    };

    const toggleVariationDropdown = (productId, e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        setActiveDropdown((prev) => (prev === productId ? null : productId));
    };

    const closeVariationDropdown = () => {
        setActiveDropdown(null);
    };

    const handleAddToCart = async (product_id, price, shipping_amount) => {
        setLoadingStates((prev) => ({
            ...prev,
            [product_id]: 'Adding...',
        }));

        try {
            await addToCart(
                product_id,
                userData?.user_id,
                qtyValue,
                price,
                shipping_amount,
                currentAddress?.country,
                colorValue,
                sizeValue,
                cart_id
            );

            setLoadingStates((prev) => ({
                ...prev,
                [product_id]: 'Added to Cart',
            }));

            setColorValue('No Color');
            setSizeValue('No Size');
            setQtyValue(1);
            closeVariationDropdown();

            const url = userData?.user_id
                ? `cart-list/${cart_id}/${userData?.user_id}/`
                : `cart-list/${cart_id}/`;
            const response = await axios.get(url);
            setCartCount(response.data?.length || 0);
        } catch (error) {
            console.error('Error adding to cart:', error);
            setLoadingStates((prev) => ({
                ...prev,
                [product_id]: 'Add to Cart',
            }));
        }
    };

    const handleAddToWishlist = async (product_id) => {
        try {
            await addToWishlist(product_id, userData?.user_id);
        } catch (error) {
            console.error('Error adding to wishlist:', error);
        }
    };

    const hasQuery = Boolean(query && query.trim() !== '' && query !== 'null');

    return (
        <main className="mt-4 mb-5" style={{ minHeight: '70vh' }}>
            <div className="container">
                {/* Search Bar Header */}
                <div className="card shadow-sm border-0 rounded-4 p-3 mb-4 bg-white">
                    <form onSubmit={handleSearchSubmit} className="d-flex gap-2">
                        <div className="position-relative flex-grow-1">
                            <i
                                className="fas fa-search position-absolute top-50 translate-middle-y text-muted"
                                style={{ left: '16px' }}
                            ></i>
                            <input
                                type="text"
                                className="form-control rounded-pill py-2 ps-5 pe-5 border-secondary border-opacity-25"
                                placeholder="Search by title, brand, category..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ fontSize: '0.95rem' }}
                                autoFocus
                            />
                            {searchTerm && (
                                <button
                                    type="button"
                                    className="btn btn-sm btn-link text-muted position-absolute top-50 end-0 translate-middle-y me-2 p-1"
                                    onClick={() => {
                                        setSearchTerm('');
                                        setSearchParams({});
                                    }}
                                    title="Clear search"
                                >
                                    <i className="fas fa-times-circle"></i>
                                </button>
                            )}
                        </div>
                        <button type="submit" className="btn btn-primary rounded-pill px-4 fw-bold shadow-sm">
                            Search
                        </button>
                    </form>
                </div>

                {/* Status Bar */}
                <div className="d-flex justify-content-between align-items-center mb-3 px-1">
                    <h5 className="fw-bold mb-0 text-dark" style={{ fontSize: '1.1rem' }}>
                        {hasQuery ? (
                            <span>
                                Results for "<span className="text-primary">{query}</span>"
                            </span>
                        ) : (
                            <span>Explore All Products</span>
                        )}
                    </h5>
                    {!loading && (
                        <span className="badge bg-light text-secondary border px-3 py-2 rounded-pill small">
                            {products.length} {products.length === 1 ? 'item' : 'items'}
                        </span>
                    )}
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="text-center py-5">
                        <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="text-secondary mt-3 small">Fetching products...</p>
                    </div>
                )}

                {/* Empty Results State */}
                {!loading && products.length === 0 && (
                    <div className="text-center py-5 px-3 bg-white rounded-4 shadow-sm border border-light my-3">
                        <div
                            className="rounded-circle bg-light d-inline-flex align-items-center justify-content-center mb-3"
                            style={{ width: '64px', height: '64px' }}
                        >
                            <i className="fas fa-search text-muted" style={{ fontSize: '24px' }}></i>
                        </div>
                        <h5 className="fw-bold text-dark">No products found for "{query}"</h5>
                        <p className="text-muted small mb-4">
                            Try checking your spelling or searching with different keywords.
                        </p>
                        <button
                            onClick={() => {
                                setSearchTerm('');
                                setSearchParams({});
                            }}
                            className="btn btn-primary rounded-pill px-4"
                        >
                            <i className="fas fa-grid-2 me-1"></i> Browse All Products
                        </button>
                    </div>
                )}

                {/* Products Grid */}
                {!loading && products.length > 0 && (
                    <div className="row g-2 g-md-3">
                        {products.map((product) => (
                            <div
                                className="col-6 col-md-4 col-lg-3 mb-3"
                                key={product.id}
                                style={{ zIndex: activeDropdown === product.id ? 1050 : 1, position: 'relative' }}
                            >
                                <div className="card shadow-sm h-100 border-0 rounded-3 overflow-visible">
                                    <div className="bg-image hover-zoom ripple position-relative" data-mdb-ripple-color="light">
                                        <Link to={`/detail/${product.slug}`}>
                                            <img
                                                src={
                                                    selectedProduct === product.id && colorImage
                                                        ? colorImage
                                                        : product.image
                                                }
                                                className="w-100 rounded-top"
                                                alt={product.title}
                                                style={{ height: '175px', objectFit: 'cover' }}
                                                loading="lazy"
                                            />
                                        </Link>
                                    </div>

                                    <div className="card-body p-2 p-md-3 d-flex flex-column justify-content-between">
                                        <div>
                                            <div className="text-muted small text-truncate mb-1" style={{ fontSize: '0.75rem' }}>
                                                {product?.brand?.title || product?.vendor?.name}
                                            </div>
                                            <Link to={`/detail/${product.slug}`} className="text-dark text-decoration-none">
                                                <h6
                                                    className="card-title fw-semibold mb-1 text-truncate"
                                                    title={product.title}
                                                    style={{ fontSize: '0.85rem', lineHeight: '1.3' }}
                                                >
                                                    {product.title}
                                                </h6>
                                            </Link>
                                            <div className="fw-bold text-dark mb-2" style={{ fontSize: '0.95rem' }}>
                                                ₹{product.price}
                                            </div>
                                        </div>

                                        <div className="d-flex align-items-center gap-1 mt-auto">
                                            {/* Variation or Direct Add to Cart */}
                                            {((product.color && product.color.length > 0) ||
                                                (product.size && product.size.length > 0)) ? (
                                                <div className="position-relative flex-grow-1">
                                                    <button
                                                        className="btn btn-primary btn-sm rounded-pill w-100 py-1"
                                                        type="button"
                                                        onClick={(e) => toggleVariationDropdown(product.id, e)}
                                                        style={{ fontSize: '0.75rem' }}
                                                    >
                                                        Options
                                                    </button>

                                                    {activeDropdown === product.id && (
                                                        <>
                                                            <div
                                                                style={{
                                                                    position: 'fixed',
                                                                    top: 0,
                                                                    left: 0,
                                                                    width: '100vw',
                                                                    height: '100vh',
                                                                    zIndex: 1040,
                                                                    background: 'transparent',
                                                                }}
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    e.stopPropagation();
                                                                    setActiveDropdown(null);
                                                                }}
                                                            />
                                                            <div
                                                                className="dropdown-menu show shadow-lg border-0 rounded-3 p-3"
                                                                style={{
                                                                    display: 'block',
                                                                    position: 'absolute',
                                                                    bottom: '100%',
                                                                    left: 0,
                                                                    zIndex: 1055,
                                                                    maxWidth: '300px',
                                                                    minWidth: '240px',
                                                                    backgroundColor: '#ffffff',
                                                                    marginBottom: '6px',
                                                                }}
                                                                onClick={(e) => e.stopPropagation()}
                                                            >
                                                                {/* Size */}
                                                                {product?.size && product?.size.length > 0 && (
                                                                    <div className="mb-2">
                                                                        <div className="small fw-bold mb-1">
                                                                            Size: {selectedSize[product.id] || 'Select'}
                                                                        </div>
                                                                        <div className="d-flex flex-wrap gap-1">
                                                                            {product.size.map((sz, i) => (
                                                                                <button
                                                                                    key={i}
                                                                                    type="button"
                                                                                    className={`btn btn-xs btn-sm py-0 px-2 rounded ${
                                                                                        selectedSize[product.id] === sz.name
                                                                                            ? 'btn-dark'
                                                                                            : 'btn-outline-secondary'
                                                                                    }`}
                                                                                    onClick={(e) =>
                                                                                        handleSizeButtonClick(e, product.id, sz.name)
                                                                                    }
                                                                                >
                                                                                    {sz.name}
                                                                                </button>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                )}

                                                                {/* Color */}
                                                                {product?.color && product?.color.length > 0 && (
                                                                    <div className="mb-2">
                                                                        <div className="small fw-bold mb-1">
                                                                            Color: {selectedColors[product.id] || 'Select'}
                                                                        </div>
                                                                        <div className="d-flex flex-wrap gap-1">
                                                                            {product.color.map((cl, i) => (
                                                                                <button
                                                                                    key={i}
                                                                                    type="button"
                                                                                    className="rounded-circle border"
                                                                                    style={{
                                                                                        width: '22px',
                                                                                        height: '22px',
                                                                                        backgroundColor: cl.color_code || '#000',
                                                                                    }}
                                                                                    onClick={(e) =>
                                                                                        handleColorButtonClick(e, product.id, cl.name, cl.image)
                                                                                    }
                                                                                />
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                )}

                                                                {/* Add button inside dropdown */}
                                                                <button
                                                                    onClick={() =>
                                                                        handleAddToCart(product.id, product.price, product.shipping_amount)
                                                                    }
                                                                    disabled={loadingStates[product.id] === 'Adding...'}
                                                                    type="button"
                                                                    className="btn btn-primary btn-sm rounded-pill w-100 mt-2 fw-semibold"
                                                                >
                                                                    Add to Cart
                                                                </button>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() =>
                                                        handleAddToCart(product.id, product.price, product.shipping_amount)
                                                    }
                                                    disabled={loadingStates[product.id] === 'Adding...'}
                                                    type="button"
                                                    className="btn btn-primary btn-sm rounded-pill flex-grow-1 py-1"
                                                    style={{ fontSize: '0.75rem' }}
                                                >
                                                    {loadingStates[product.id] === 'Added to Cart' ? (
                                                        <span><FaCheckCircle className="me-1" /> Added</span>
                                                    ) : loadingStates[product.id] === 'Adding...' ? (
                                                        <span><FaSpinner className="fas fa-spin me-1" /> Adding</span>
                                                    ) : (
                                                        <span><FaShoppingCart className="me-1" /> Add</span>
                                                    )}
                                                </button>
                                            )}

                                            {/* Wishlist Button */}
                                            <button
                                                onClick={() => handleAddToWishlist(product.id)}
                                                type="button"
                                                className="btn btn-outline-danger btn-sm rounded-circle d-flex align-items-center justify-content-center p-0"
                                                style={{ width: '28px', height: '28px', flexShrink: 0 }}
                                                title="Add to Wishlist"
                                            >
                                                <i className="fas fa-heart" style={{ fontSize: '11px' }} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}

export default Search;