import React, { useEffect, useState, useContext } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FaCheckCircle, FaShoppingCart, FaSpinner } from 'react-icons/fa';

import apiInstance from '../../utils/axios';
import Addon from '../plugin/Addon';
import GetCurrentAddress from '../plugin/UserCountry';
import UserData from '../plugin/UserData';
import CartID from '../plugin/cartID';
import { addToCart } from '../plugin/addToCart';
import { addToWishlist } from '../plugin/addToWishlist';
import { CartContext } from '../plugin/Context';

function Products() {

    const [searchParams, setSearchParams] = useSearchParams();

    const getCachedData = (key, fallback = []) => {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : fallback;
        } catch (e) {
            return fallback;
        }
    };

    const [featuredProducts, setFeaturedProducts] = useState(() => getCachedData('cached_featured_products', []));
    const [products, setProducts] = useState(() => getCachedData('cached_products', []));
    const [category, setCategory] = useState(() => getCachedData('cached_category', []));
    const [brand, setBrand] = useState(() => getCachedData('cached_brand', []));
    const [selectedCategory, setSelectedCategory] = useState(null);

    let [isAddingToCart, setIsAddingToCart] = useState("Add To Cart");
    const [loadingStates, setLoadingStates] = useState({});
    let [loading, setLoading] = useState(() => !localStorage.getItem('cached_products'));

    const axios = apiInstance;
    const addon = Addon();
    const currentAddress = GetCurrentAddress();
    const userData = UserData();
    let cart_id = CartID();

    const [selectedProduct, setSelectedProduct] = useState(null);
    const [selectedColors, setSelectedColors] = useState({});
    const [selectedSize, setSelectedSize] = useState({});
    const [colorImage, setColorImage] = useState("");
    const [colorValue, setColorValue] = useState("No Color");
    const [sizeValue, setSizeValue] = useState("No Size");
    const [qtyValue, setQtyValue] = useState(1);
    let [cartCount, setCartCount] = useContext(CartContext);

    // Pagination
    // Define the number of items to be displayed per page
    const itemsPerPage = 6;

    // State hook to manage the current page being displayed (persisted in URL and sessionStorage)
    const initialPage = parseInt(searchParams.get('page') || sessionStorage.getItem('products_current_page') || '1', 10);
    const [currentPage, setCurrentPage] = useState(initialPage > 0 ? initialPage : 1);

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
        setSearchParams((prev) => {
            const p = new URLSearchParams(prev);
            p.set('page', newPage);
            return p;
        });
        sessionStorage.setItem('products_current_page', newPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Synchronize page if URL search params change (e.g. browser back / forward button)
    useEffect(() => {
        const pageFromUrl = parseInt(searchParams.get('page') || sessionStorage.getItem('products_current_page') || '1', 10);
        if (pageFromUrl > 0 && pageFromUrl !== currentPage) {
            setCurrentPage(pageFromUrl);
        }
    }, [searchParams]);

    // Calculate the index of the last item on the current page
    const indexOfLastItem = currentPage * itemsPerPage;

    // Calculate the index of the first item on the current page
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;

    // Extract a subset of items (current page) from the products array
    const filteredProducts = selectedCategory
    ? products.filter((product) => {
        const productCategoryId =
            typeof product.category === "object"
                ? product.category?.id
                : product.category;

        return String(productCategoryId) === String(selectedCategory);
    })
    : products;

    const currentItems = filteredProducts.slice(
        indexOfFirstItem,
        indexOfLastItem
    );

    // Calculate the total number of pages needed based on the total number of items
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

    // Generate an array of page numbers for pagination control
    const pageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1);

    async function fetchData(endpoint, setDataFunction, cacheKey) {
        try {
            const response = await axios.get(endpoint);
            setDataFunction(response.data);
            if (cacheKey) {
                localStorage.setItem(cacheKey, JSON.stringify(response.data));
            }
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchData('products/', setProducts, 'cached_products');
        fetchData('featured-products/', setFeaturedProducts, 'cached_featured_products');
        fetchData('category/', setCategory, 'cached_category');
        fetchData('brand/', setBrand, 'cached_brand');
    }, []);



    const handleColorButtonClick = (event, product_id, colorName, colorImage) => {
        setColorValue(colorName);
        setColorImage(colorImage);
        setSelectedProduct(product_id);

        setSelectedColors((prevSelectedColors) => ({
            ...prevSelectedColors,
            [product_id]: colorName,
        }));


    };

    const handleSizeButtonClick = (event, product_id, sizeName) => {
        setSizeValue(sizeName);
        setSelectedProduct(product_id);

        setSelectedSize((prevSelectedSize) => ({
            ...prevSelectedSize,
            [product_id]: sizeName,
        }));

    };

    const handleQtyChange = (event, product_id) => {
        setQtyValue(event.target.value);
        setSelectedProduct(product_id);
    };


    const [activeDropdown, setActiveDropdown] = useState(null);

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

    setLoadingStates((prevStates) => ({
        ...prevStates,
        [product_id]: "Adding...",
    }));

    try {

        // ================= GUEST USER =================
        if (!userData?.user_id) {

            const guestCart = JSON.parse(
                localStorage.getItem("guest_cart") || "[]"
            );

            const selectedProductData = products.find(
                (item) => item.id === product_id
            );

            if (!selectedProductData) {
                console.log("Product not found");
                return;
            }

            const selectedColor = colorValue || "No Color";
            const selectedSize = sizeValue || "No Size";
            const selectedQty = Math.max(1, Number(qtyValue || 1));

            const existingIndex = guestCart.findIndex(
                (item) =>
                    item.product?.id === product_id &&
                    item.color === selectedColor &&
                    item.size === selectedSize
            );

            if (existingIndex !== -1) {

                guestCart[existingIndex].qty += selectedQty;

                guestCart[existingIndex].sub_total =
                    Number(guestCart[existingIndex].price) *
                    Number(guestCart[existingIndex].qty);

            } else {

                guestCart.push({
                    id: `guest-${product_id}-${selectedSize}-${selectedColor}`,
                    product: selectedProductData,
                    qty: selectedQty,
                    price: price,
                    shipping_amount: shipping_amount || 0,
                    color: selectedColor,
                    size: selectedSize,
                    sub_total: Number(price) * selectedQty,
                });

            }

            localStorage.setItem(
                "guest_cart",
                JSON.stringify(guestCart)
            );

            // Header cart count
            setCartCount(guestCart.length);

            console.log(
                "GUEST CART:",
                JSON.parse(localStorage.getItem("guest_cart"))
            );

            setLoadingStates((prevStates) => ({
                ...prevStates,
                [product_id]: "Added to Cart",
            }));

            // Reset & Close Dropdown
            setColorValue("No Color");
            setSizeValue("No Size");
            setQtyValue(1);
            closeVariationDropdown(product_id);

            return;
        }


        // ================= LOGGED-IN USER =================

        await addToCart(
            product_id,
            userData.user_id,
            qtyValue,
            price,
            shipping_amount,
            currentAddress.country,
            colorValue,
            sizeValue,
            cart_id,
            setIsAddingToCart
        );

        const response = await axios.get(
            `cart-list/${cart_id}/${userData.user_id}/`
        );

        setCartCount(response.data.length);

        setLoadingStates((prevStates) => ({
            ...prevStates,
            [product_id]: "Added to Cart",
        }));

        setColorValue("No Color");
        setSizeValue("No Size");
        setQtyValue(1);
        closeVariationDropdown(product_id);

    } catch (error) {

        console.log("ADD TO CART ERROR:", error);

        setLoadingStates((prevStates) => ({
            ...prevStates,
            [product_id]: "Add to Cart",
        }));
    }
};

    const handleAddToWishlist = async (product_id) => {
        try {
            await addToWishlist(product_id, userData?.user_id)
        } catch (error) {
            console.log(error);
        }
    };


    return (
        <>
            {loading === false &&
                <div>
                    <main className="mt-4">
                        <div className="container">
                            {/* Hero Banner */}
                            <div className="hero-banner text-center position-relative overflow-hidden mb-5">
                                <div className="position-relative" style={{ zIndex: 2 }}>
                                    <span className="badge bg-warning text-dark px-3 py-2 rounded-pill fw-bold text-uppercase mb-3" style={{ letterSpacing: '1px' }}>
                                        <i className="fas fa-fire me-1"></i> Special Offers Live
                                    </span>
                                    <h1 className="display-5 fw-bold mb-3">Welcome to Ansari Store</h1>
                                    <p className="lead mx-auto mb-4 text-white-50" style={{ maxWidth: '650px' }}>
                                        Discover quality products from top vendors with fast courier shipping and real-time live order tracking.
                                    </p>
                                    <div className="d-flex justify-content-center gap-3 flex-wrap">
                                        <a href="#featured-products" className="btn btn-light btn-lg rounded-pill px-4 fw-bold text-dark shadow-sm">
                                            <i className="fas fa-shopping-bag me-2 text-primary"></i> Explore Products
                                        </a>
                                        <Link to="/track-order/" className="btn btn-outline-light btn-lg rounded-pill px-4 fw-bold">
                                            <i className="fas fa-truck me-2 text-warning"></i> Track Your Order
                                        </Link>
                                    </div>
                                </div>
                            </div>

                            {/* Trust Highlights */}
                            <div className="row g-3 mb-5">
                                <div className="col-md-3 col-6">
                                    <div className="feature-badge d-flex align-items-center gap-3">
                                        <div className="rounded-circle p-3 d-flex align-items-center justify-content-center" style={{ backgroundColor: "#e0e7ff", color: "#4f46e5" }}>
                                            <i className="fas fa-shipping-fast fs-5"></i>
                                        </div>
                                        <div>
                                            <h6 className="fw-bold mb-0 text-dark small">Fast Dispatch</h6>
                                            <small className="text-muted" style={{ fontSize: "0.75rem" }}>Reliable logistics</small>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-3 col-6">
                                    <div className="feature-badge d-flex align-items-center gap-3">
                                        <div className="rounded-circle p-3 d-flex align-items-center justify-content-center" style={{ backgroundColor: "#dcfce7", color: "#16a34a" }}>
                                            <i className="fas fa-shield-alt fs-5"></i>
                                        </div>
                                        <div>
                                            <h6 className="fw-bold mb-0 text-dark small">Secure Payment</h6>
                                            <small className="text-muted" style={{ fontSize: "0.75rem" }}>Stripe & PayPal</small>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-3 col-6">
                                    <div className="feature-badge d-flex align-items-center gap-3">
                                        <div className="rounded-circle p-3 d-flex align-items-center justify-content-center" style={{ backgroundColor: "#fef3c7", color: "#d97706" }}>
                                            <i className="fas fa-satellite-dish fs-5"></i>
                                        </div>
                                        <div>
                                            <h6 className="fw-bold mb-0 text-dark small">Live Tracking</h6>
                                            <small className="text-muted" style={{ fontSize: "0.75rem" }}>Real-time updates</small>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-3 col-6">
                                    <div className="feature-badge d-flex align-items-center gap-3">
                                        <div className="rounded-circle p-3 d-flex align-items-center justify-content-center" style={{ backgroundColor: "#f3e8ff", color: "#9333ea" }}>
                                            <i className="fas fa-headset fs-5"></i>
                                        </div>
                                        <div>
                                            <h6 className="fw-bold mb-0 text-dark small">Support 24/7</h6>
                                            <small className="text-muted" style={{ fontSize: "0.75rem" }}>Dedicated team</small>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Hot Category Section */}
                            <section className="text-center container mb-4">
                                <h3 className="fw-bold text-dark">Trending Categories 🔥</h3>
                                <p className="text-muted">Browse through top hand-picked collections</p>
                            </section>

                            <div className="d-flex justify-content-center gap-2 flex-wrap mb-5">
                                <button
                                    type="button"
                                    className={`btn rounded-pill px-4 py-2 fw-semibold ${selectedCategory === null ? 'btn-primary' : 'btn-outline-secondary'}`}
                                    onClick={() => {
                                        setSelectedCategory(null);
                                        setCurrentPage(1);
                                    }}
                                >
                                    <i className="fas fa-th-large me-2"></i> All Products
                                </button>
                                {category.map((c, index) => (
                                    <div
                                        key={c.id || index}
                                        onClick={() => {
                                            setSelectedCategory(c.id);
                                            setCurrentPage(1);
                                        }}
                                        className={`category-card d-flex align-items-center gap-2 px-3 py-2 rounded-pill ${String(selectedCategory) === String(c.id) ? 'active' : ''}`}
                                    >
                                        <img
                                            src={c.image}
                                            alt={c.title}
                                            className="rounded-circle object-fit-cover shadow-sm"
                                            style={{ width: "28px", height: "28px" }}
                                        />
                                        <span className="fw-semibold small text-dark">{c.title}</span>
                                    </div>
                                ))}
                            </div>

                            <section id="featured-products" className="text-center container mb-4">
                                <h3 className="fw-bold text-dark">Featured Products 📍</h3>
                                <p className="text-muted">
                                    Quality hand-picked items just for you
                                </p>
                            </section>
                            <section className="text-center">
                                <div className="row">
                                    {currentItems.map((product, index) => (
                                        <div
                                            className="col-lg-4 col-md-6 col-sm-6 col-12 mb-4"
                                            key={product.id}
                                            style={{ zIndex: activeDropdown === product.id ? 1050 : 1, position: "relative" }}
                                        >
                                            <div className="card shadow-sm h-100" style={{ overflow: "visible" }}>
                                                <div
                                                    className="bg-image hover-zoom ripple"
                                                    data-mdb-ripple-color="light"
                                                >
                                                    <Link to={`/detail/${product.slug}`}>
                                                        <img
                                                            src={(selectedProduct === product.id && colorImage) ? colorImage : product.image}
                                                            className="w-100"
                                                            style={{ height: "260px", objectFit: "cover" }}
                                                        />
                                                    </Link>
                                                </div>
                                                <div className="card-body" style={{ overflow: "visible" }}>

                                                    <h6 className="">By: <Link to={`/vendor/${product?.vendor?.slug}`}>{product.vendor.name}</Link></h6>
                                                    <Link to={`/detail/${product.slug}`} className="text-reset"><h5 className="card-title mb-3 ">{product.title.slice(0, 30)}...</h5></Link>
                                                    <Link to="/" className="text-reset"><p>{product?.brand.title}</p></Link>
                                                    <h6 className="mb-1">${product.price}</h6>

                                                    {((product.color && product.color.length > 0) || (product.size && product.size.length > 0)) ? (
                                                        <div className="btn-group position-relative variation-dropdown-container">
                                                            <button
                                                                className={`btn btn-primary dropdown-toggle ${activeDropdown === product.id ? 'show' : ''}`}
                                                                type="button"
                                                                onClick={(e) => toggleVariationDropdown(product.id, e)}
                                                                aria-expanded={activeDropdown === product.id ? "true" : "false"}
                                                            >
                                                                Variation
                                                            </button>
                                                            {activeDropdown === product.id && (
                                                                <>
                                                                    <div
                                                                        style={{
                                                                            position: "fixed",
                                                                            top: 0,
                                                                            left: 0,
                                                                            width: "100vw",
                                                                            height: "100vh",
                                                                            zIndex: 1040,
                                                                            background: "transparent"
                                                                        }}
                                                                        onClick={(e) => {
                                                                            e.preventDefault();
                                                                            e.stopPropagation();
                                                                            setActiveDropdown(null);
                                                                        }}
                                                                    />
                                                                    <ul
                                                                        className="dropdown-menu show shadow-lg border-0 rounded-3 p-3"
                                                                        style={{
                                                                            display: "block",
                                                                            position: "absolute",
                                                                            top: "100%",
                                                                            left: 0,
                                                                            zIndex: 1055,
                                                                            maxWidth: "340px",
                                                                            minWidth: "280px",
                                                                            backgroundColor: "#ffffff",
                                                                            boxShadow: "0 10px 30px rgba(0,0,0,0.18)"
                                                                        }}
                                                                        onClick={(e) => e.stopPropagation()}
                                                                    >
                                                                {/* Quantity */}
                                                                <div className="d-flex flex-column mb-2 mt-2 p-1">
                                                                    <div className="p-1 mt-0 pt-0 d-flex flex-wrap">
                                                                        <>
                                                                            <li>
                                                                                <input
                                                                                    type="number"
                                                                                    className='form-control'
                                                                                    placeholder='Quantity'
                                                                                    onChange={(e) => handleQtyChange(e, product.id)}
                                                                                    min={1}
                                                                                    defaultValue={1}
                                                                                />
                                                                            </li>
                                                                        </>
                                                                    </div>
                                                                </div>

                                                                {/* Size */}
                                                                {product?.size && product?.size.length > 0 && (
                                                                    <div className="d-flex flex-column">
                                                                        <li className="p-1"><b>Size</b>: {selectedSize[product.id] || 'Select a size'}</li>
                                                                        <div className="p-1 mt-0 pt-0 d-flex flex-wrap">
                                                                            {product?.size?.map((size, index) => (
                                                                                <React.Fragment key={size.id || index}>
                                                                                    <li>
                                                                                        <button
                                                                                            className="btn btn-secondary btn-sm me-2 mb-1"
                                                                                            onClick={(e) => handleSizeButtonClick(e, product.id, size.name)}
                                                                                        >
                                                                                            {size.name}
                                                                                        </button>
                                                                                    </li>
                                                                                </React.Fragment>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                )}


                                                                {/* Color */}
                                                                {product.color && product.color.length > 0 && (
                                                                    <div className="d-flex flex-column mt-3">
                                                                        <li className="p-1 color_name_div"><b>Color</b>: {selectedColors[product.id] || 'Select a color'}</li>
                                                                        <div className="p-1 mt-0 pt-0 d-flex flex-wrap">
                                                                            {product?.color?.map((color, index) => (
                                                                                <React.Fragment key={color.id || index}>
                                                                                    <input type="hidden" className={`color_name${color.id}`} name="" id="" />
                                                                                    <li>
                                                                                        <button
                                                                                            className="color-button btn p-3 me-2"
                                                                                            style={{ backgroundColor: color.color_code }}
                                                                                            onClick={(e) => handleColorButtonClick(e, product.id, color.name, color.image)}
                                                                                        >
                                                                                        </button>
                                                                                    </li>
                                                                                </React.Fragment>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                )}

                                                                {/* Add To Cart */}
                                                                <div className="d-flex mt-3 p-1 w-100">
                                                                    <button
                                                                        onClick={() => handleAddToCart(product.id, product.price, product.shipping_amount)}
                                                                        disabled={loadingStates[product.id] === 'Adding...'}
                                                                        type="button"
                                                                        className="btn btn-primary me-1 mb-1"
                                                                    >
                                                                        {loadingStates[product.id] === 'Added to Cart' ? (
                                                                            <>
                                                                                Added to Cart <FaCheckCircle />
                                                                            </>
                                                                        ) : loadingStates[product.id] === 'Adding...' ? (
                                                                            <>
                                                                                Adding to Cart <FaSpinner className='fas fa-spin' />
                                                                            </>
                                                                        ) : (
                                                                            <>
                                                                                {loadingStates[product.id] || 'Add to Cart'} <FaShoppingCart />
                                                                            </>
                                                                        )}
                                                                    </button>
                                                                </div>
                                                            </ul>
                                                            </>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleAddToCart(product.id, product.price, product.shipping_amount)}
                                                            disabled={loadingStates[product.id] === 'Adding...'}
                                                            type="button"
                                                            className="btn btn-primary me-1 mb-1"
                                                        >
                                                            {loadingStates[product.id] === 'Added to Cart' ? (
                                                                <>
                                                                    Added to Cart <FaCheckCircle />
                                                                </>
                                                            ) : loadingStates[product.id] === 'Adding...' ? (
                                                                <>
                                                                    Adding to Cart <FaSpinner className='fas fa-spin' />
                                                                </>
                                                            ) : (
                                                                <>
                                                                    {loadingStates[product.id] || 'Add to Cart'} <FaShoppingCart />
                                                                </>
                                                            )}
                                                        </button>

                                                    )}

                                                    {/* Wishlist Button */}
                                                    <button
                                                        onClick={() => handleAddToWishlist(product.id)}
                                                        type="button"
                                                        className="btn btn-danger px-3 ms-2 "
                                                    >
                                                        <i className="fas fa-heart" />
                                                    </button>

                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                            <nav className='d-flex  gap-1 pt-2'>
                                <ul className='pagination'>
                                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                        <button className="page-link" onClick={() => handlePageChange(currentPage - 1)}>
                                            <i className="ci-arrow-left me-2" />
                                            Previous
                                        </button>
                                    </li>
                                </ul>
                                <ul className="pagination">
                                    {pageNumbers.map((number) => (
                                        <li key={number} className={`page-item ${currentPage === number ? 'active' : ''}`}>
                                            <button className="page-link" onClick={() => handlePageChange(number)}>
                                                {number}
                                            </button>
                                        </li>
                                    ))}
                                </ul>

                                <ul className="pagination">
                                    <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                        <button className="page-link" onClick={() => handlePageChange(currentPage + 1)}>
                                            Next
                                            <i className="ci-arrow-right ms-3" />

                                        </button>
                                    </li>
                                </ul>

                            </nav>
                            <div>
                                <div className="d-blfock mt-5" aria-label="Page navigation" >
                                    <span className="fs-sm text-muted me-md-3">Page <b>{currentPage} </b> of <b>{totalPages}</b></span>
                                </div>
                                {totalPages !== 1 &&
                                    <div className="d-block mt-2" aria-label="Page navigation" >
                                        <span className="fs-sm text-muted me-md-3">Showing <b>{itemsPerPage}</b> of <b>{filteredProducts?.length}</b> records</span>
                                    </div>
                                }
                            </div>
                            {/*Section: Wishlist*/}
                        </div>
                    </main>

                    <main>
                        <section className="text-center container">
                            <div className="row mt-4 mb-3">
                                <div className="col-lg-6 col-md-8 mx-auto">
                                    <h1 className="fw-light">Category</h1>
                                    <p className="lead text-muted">
                                        Our Latest Categories
                                    </p>
                                </div>
                            </div>
                        </section>

<div className="text-center mb-3">
    <button
        type="button"
        className="btn btn-outline-dark"
        onClick={() => {
            setSelectedCategory(null);
            handlePageChange(1);
        }}
    >
        All Products
    </button>
</div>

<div className="d-flex justify-content-center flex-wrap gap-3 mb-4 px-2">
    {category.map((c, index) => (
        <div key={c.id || index} className="align-items-center d-flex flex-column p-3 rounded-3 shadow-sm bg-white" style={{ minWidth: "110px", maxWidth: "150px", border: "1px solid #e2e8f0" }}>
            <img src={c.image}
                alt={c.title}
                style={{ width: "65px", height: "65px", objectFit: "cover", borderRadius: "50%" }}
            />
            <p className="mb-0 mt-2">
                <button
                    type="button"
                    className="btn btn-link text-dark text-decoration-none fw-semibold p-0 text-truncate"
                    style={{ maxWidth: "120px", fontSize: "0.85rem" }}
                    onClick={() => {
                        setSelectedCategory(c.id);
                        handlePageChange(1);
                    }}
                >
                    {c.title}
                </button>
            </p>
        </div>
    ))}
</div>
<section className="text-center container mt-5">
    <div className="row py-lg-4">
        <div className="col-lg-6 col-md-8 mx-auto">
            <h1 className="fw-light">Trending Products</h1>
            <p className="lead text-muted">
                Something short and leading about the collection below—its contents
            </p>
        </div>
    </div>
</section>
<div className="album py-4 bg-light">
    <div className="container">
        <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 g-3">
            {featuredProducts.map((product, index) => (
                <div
                    className="col-lg-4 col-md-6 col-sm-6 col-12 mb-4"
                    key={product.id || index}
                >
                                            <div className="card shadow-sm h-100">
                                                <div
                                                    className="bg-image hover-zoom ripple"
                                                    data-mdb-ripple-color="light"
                                                >
                                                    <Link to={`/detail/${product.slug}`}>
                                                        <img
                                                            src={product.image}
                                                            className="w-100"
                                                            style={{ height: "260px", objectFit: "cover" }}
                                                            alt={product.title}
                                                        />
                                                    </Link>
                                                </div>
                                                <div className="card-body">
                                                    <Link to={`/detail/${product.slug}`} className="text-reset">
                                                        <h5 className="card-title mb-3 ">{product.title.slice(0, 30)}...</h5>
                                                    </Link>
                                                    <p className="text-muted small">{product?.brand?.title}</p>
                                                    <h6 className="mb-3">{addon.currency_sign}{product.price}</h6>
                                                    <button
                                                        type="button"
                                                        className="btn btn-primary me-1 mb-1"
                                                        onClick={() => handleAddToCart(product.id, product.price, product.shipping_amount)}
                                                        disabled={loadingStates[product.id] === 'Adding...'}
                                                    >
                                                        {loadingStates[product.id] === 'Added to Cart' ? (
                                                            <>Added <FaCheckCircle /></>
                                                        ) : loadingStates[product.id] === 'Adding...' ? (
                                                            <>Adding <FaSpinner className='fas fa-spin' /></>
                                                        ) : (
                                                            <>Add to Cart <FaShoppingCart /></>
                                                        )}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="btn btn-danger px-3 me-1 mb-1"
                                                        onClick={() => handleAddToWishlist(product.id)}
                                                    >
                                                        <i className="fas fa-heart" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </main>
                </div>
            }

            {loading === true && (
                <div className="container text-center py-5">
                    <div className="spinner-border text-primary my-4" role="status" style={{ width: "3rem", height: "3rem" }}>
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="text-muted fw-semibold">Loading products...</p>
                </div>
            )}
        </>




    )
}

export default Products