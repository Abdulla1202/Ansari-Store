import { React, useEffect, useState, useContext } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2'

// Icons
import { FaCheckCircle } from 'react-icons/fa';

import { addToCart } from '../plugin/addToCart';
import apiInstance from '../../utils/axios';
import GetCurrentAddress from '../plugin/UserCountry';
import UserData from '../plugin/UserData';
import CartID from '../plugin/cartID';
import { CartContext } from '../plugin/Context';

function Cart() {
    const [cart, setCart] = useState([])
    const [cartTotal, setCartTotal] = useState([])
    const [productQuantities, setProductQuantities] = useState({});
    let [isAddingToCart, setIsAddingToCart] = useState('')

    const [fullName, setFullName] = useState("")
    const [email, setEmail] = useState("")
    const [mobile, setMobile] = useState("")
    const [address, setAddress] = useState("")
    const [city, setCity] = useState("")
    const [state, setState] = useState("")
    const [country, setCountry] = useState("")
    const [cartCount, setCartCount] = useContext(CartContext);



    const axios = apiInstance
    const userData = UserData()
    let cart_id = CartID()
    const currentAddress = GetCurrentAddress()
    let navigate = useNavigate();

    // Get cart Items
const fetchCartData = (cartId, userId) => {

    // Guest cart
    if (!userId) {
        const guestCart = JSON.parse(
            localStorage.getItem("guest_cart") || "[]"
        );

        setCart(guestCart);
        setCartCount(guestCart.length);
        return;
    }

    // Logged-in cart
    const url = `cart-list/${cartId}/${userId}/`;

    axios.get(url).then((res) => {
        setCart(res.data);
        setCartCount(res.data.length);
    }).catch((error) => {
        console.error("Cart fetch error:", error);
        setCart([]);
        setCartTotal([]);
        setCartCount(0);
    });
};

    // Get Cart Totals
const fetchCartTotal = async (cartId, userId) => {

    if (!userId) {
        setCartTotal({
            sub_total: 0,
            shipping: 0,
            tax: 0,
            service_fee: 0,
            total: 0,
        });
        return;
    }

    const url = `cart-detail/${cartId}/${userId}/`;

    axios.get(url).then((res) => {
        setCartTotal(res.data);
    }).catch((error) => {
        console.error("Cart total error:", error);
        setCartTotal([]);
    });
};



useEffect(() => {
    if (!userData?.user_id) {
        const guestCart = JSON.parse(
            localStorage.getItem("guest_cart") || "[]"
        );

        console.log("CART PAGE - GUEST CART:", guestCart);

        setCart(guestCart);
        setCartCount(guestCart.length);

        const subTotal = guestCart.reduce(
            (total, item) =>
                total + Number(item.price || 0) * Number(item.qty || 0),
            0
        );

        setCartTotal({
            sub_total: subTotal,
            shipping: 0,
            tax: 0,
            service_fee: 0,
            total: subTotal,
        });

        return;
    }

    // Logged-in user
    fetchCartData(cart_id, userData.user_id);
    fetchCartTotal(cart_id, userData.user_id);

    if (currentAddress?.country) {
        setCountry(currentAddress.country);
    }
}, [userData?.user_id, cart_id, currentAddress?.country]);


   useEffect(() => {
    const initialQuantities = {};

    cart.forEach((c) => {
        initialQuantities[c.product.id] = Number(c.qty);
    });

    setProductQuantities(initialQuantities);
}, [cart]);

  const handleQtyChange = (event, product_id) => {
    const quantity = Math.max(1, Number(event.target.value));

    setProductQuantities((prevQuantities) => ({
        ...prevQuantities,
        [product_id]: quantity,
    }));
};



    const UpdateCart = async (cart_id, item_id, product_id, price, shipping_amount, color, size) => {
        const qtyValue = Math.max(
    1,
    Number(productQuantities[product_id] ?? 1)
);

        // console.log("cart_id:", cart_id);
        // console.log("item_id:", item_id);
        // console.log("qtyValue:", qtyValue);
        // console.log("product_id:", product_id);

       try {

    // ================= GUEST CART =================
    if (!userData?.user_id) {

        const guestCart = JSON.parse(
            localStorage.getItem("guest_cart") || "[]"
        );

        const updatedCart = guestCart.map((item) => {

            if (item.id === item_id) {
                return {
                    ...item,
                    qty: qtyValue,
                    sub_total: Number(item.price) * qtyValue,
                };
            }

            return item;
        });

        localStorage.setItem(
            "guest_cart",
            JSON.stringify(updatedCart)
        );

        setCart(updatedCart);
        setCartCount(updatedCart.length);

        return;
    }

    // ================= LOGGED-IN CART =================

    await addToCart(
        product_id,
        userData?.user_id,
        qtyValue,
        price,
        shipping_amount,
        currentAddress.country,
        color,
        size,
        cart_id,
        isAddingToCart
    );

    fetchCartData(cart_id, userData?.user_id);
    fetchCartTotal(cart_id, userData?.user_id);

} catch (error) {
    console.log(error);
}
    };

    // Remove Item From Cart
  const handleDeleteClick = async (cartId, itemId) => {
    // Clear from guest_cart if stored locally
    const guestCart = JSON.parse(localStorage.getItem("guest_cart") || "[]");
    const updatedGuestCart = guestCart.filter((item) => item.id !== itemId && item.product?.id !== itemId);
    localStorage.setItem("guest_cart", JSON.stringify(updatedGuestCart));

    // ================= GUEST CART =================
    if (!userData?.user_id) {
        setCart(updatedGuestCart);
        setCartCount(updatedGuestCart.length);
        return;
    }

    // ================= LOGGED-IN CART =================
    const activeCartId = cartId || cart_id;
    const url = `cart-delete/${activeCartId}/${itemId}/${userData.user_id}/`;

    try {
        await axios.delete(url);
        await fetchCartData(cart_id, userData?.user_id);
        await fetchCartTotal(cart_id, userData?.user_id);

        const cart_url = `cart-list/${cart_id}/${userData.user_id}/`;
        const response = await axios.get(cart_url);
        setCartCount(response.data.length);
    } catch (error) {
        console.error("Error deleting item, trying fallback:", error);
        try {
            await axios.delete(`cart-delete/${activeCartId}/${itemId}/`);
            await fetchCartData(cart_id, userData?.user_id);
            await fetchCartTotal(cart_id, userData?.user_id);
            const cart_url = `cart-list/${cart_id}/${userData.user_id}/`;
            const response = await axios.get(cart_url);
            setCartCount(response.data.length);
        } catch (fallbackError) {
            console.error("Cart item delete failed:", fallbackError);
        }
    }
  };
    



    // Shipping Details
    const handleChange = (e) => {
        const { name, value } = e.target;
        // Use computed property names to dynamically set the state based on input name
        switch (name) {
            case 'fullName':
                setFullName(value);
                break;
            case 'email':
                setEmail(value);
                break;
            case 'mobile':
                setMobile(value);
                break;
            case 'address':
                setAddress(value);
                break;
            case 'city':
                setCity(value);
                break;
            case 'state':
                setState(value);
                break;
            case 'country':
                setCountry(value);
                break;
            default:
                break;
        }
    };



    const createCartOrder = async () => {
            if (!userData?.user_id) {
        Swal.fire({
            icon: "warning",
            title: "Login Required",
            text: "Please login to continue to checkout.",
            showCancelButton: true,
            confirmButtonText: "Login",
            cancelButtonText: "Continue Shopping",
        }).then((result) => {
            if (result.isConfirmed) {
                navigate("/login");
            }
        });

        return;
    }

        if (!fullName || !email || !mobile || !address || !city || !state || !country) {
            // If any required field is missing, show an error message or take appropriate action
            console.log("Please fill in all required fields");
            Swal.fire({
                icon: 'warning',
                title: 'Missing Fields!',
                text: "All fields are required before checkout",
            })
            return;
        }

        try {

            const formData = new FormData();
            formData.append('full_name', fullName);
            formData.append('email', email);
            formData.append('mobile', mobile);
            formData.append('address', address);
            formData.append('city', city);
            formData.append('state', state);
            formData.append('country', country);
            formData.append('cart_id', cart_id);
            formData.append('user_id', userData ? userData.user_id : 0);

            const response = await axios.post('create-order/', formData)
            console.log(response.data.order_oid);

            navigate(`/checkout/${response.data.order_oid}`);

        } catch (error) {
            console.log(error);
        }
    }





    return (
        <div>
            <main className="mt-5">
                <div className="container">
                    {/*Main layout*/}
                    <main className="mb-6">
                        <div className="container">
                            {/* Section: Cart */}
                            <section className="">
                                <div className="row gx-lg-5 mb-5">
                                    <div className="col-lg-8 mb-4 mb-md-0">
                                        {/* Section: Product list */}
                                        <section className="mb-5">

                                           {cart.map((c, index) => (
    <div
        key={c.id || c.product?.id || index}
        className="row border-bottom mb-4"
    >
                                                    <div className="col-4 col-md-2 mb-3">
                                                        <div
                                                            className="bg-image ripple rounded-3 mb-2 overflow-hidden d-block"
                                                            data-ripple-color="light"
                                                        >
                                                            <Link to={`/detail/${c?.product?.slug}`}>
                                                                <img
                                                                    src={c?.product?.image}
                                                                    className="w-100"
                                                                    alt=""
                                                                    style={{ height: "90px", objectFit: "cover", borderRadius: "8px" }}
                                                                />
                                                            </Link>
                                                        </div>
                                                    </div>
                                                    <div className="col-8 col-md-7 mb-3">
                                                        <Link to={`/detail/${c?.product?.slug}`} className="fw-bold text-dark mb-1 d-block text-truncate">{c?.product?.title}</Link>
                                                        {c.size != "No Size" &&
                                                            <p className="mb-0 small">
                                                                <span className="text-muted me-2">Size:</span>
                                                                <span>{c.size}</span>
                                                            </p>
                                                        }
                                                        {c.color != "No Color" &&
                                                            <p className='mb-0 small'>
                                                                <span className="text-muted me-2">Color:</span>
                                                                <span>{c.color}</span>
                                                            </p>
                                                        }
                                                        <p className='mb-0 small'>
                                                            <span className="text-muted me-2">Price:</span>
                                                            <span>${c.product.price}</span>
                                                        </p>
                                                        <p className='mb-0 small'>
                                                            <span className="text-muted me-2">Vendor:</span>
                                                            <span>{c.product?.vendor?.name}</span>
                                                        </p>
                                                        <p className="mt-2 mb-0">
                                                            <button onClick={() => handleDeleteClick(c.cart_id || cart_id, c.id)} className="btn btn-outline-danger btn-sm rounded-pill px-3">
                                                                <small><i className="fas fa-trash me-1" />Remove</small>
                                                            </button>
                                                        </p>
                                                    </div>
                                                    <div className="col-12 col-md-3 mb-3 d-flex flex-column align-items-md-end justify-content-center">
                                                        <div className="d-flex justify-content-center align-items-center">
                                                            <div className="form-outline">
                                                                <input
                                                                    type="number"
                                                                    id={`qtyInput-${c.product.id}`}
                                                                    className="form-control"
                                                                    onChange={(e) => handleQtyChange(e, c.product.id)}
                                                                    value={productQuantities[c.product.id] ?? c.qty}
                                                                    min={1}

                                                                />
                                                            </div>
                                                            <button onClick={() => UpdateCart(cart_id, c.id, c.product.id, c.product.price, c.product.shipping_amount, c.color, c.size)} className='ms-2 btn btn-primary'><i className='fas fa-rotate-right'></i></button>
                                                        </div>
                                                        <h5 className="mb-2 mt-3 text-center"><span className="align-middle">${c.sub_total}</span></h5>
                                                    </div>
                                                </div>
                                            ))}

                                            {cart.length < 1 &&
                                                <>
                                                    <h5>Your Cart Is Empty</h5>
                                                    <Link to='/'> <i className='fas fa-shopping-cart'></i> Continue Shopping</Link>
                                                </>
                                            }

                                        </section>
                                        <div>
                                            <h5 className="mb-4 mt-4">Personal Information</h5>
                                            {/* 2 column grid layout with text inputs for the first and last names */}
                                            <div className="row mb-4">
                                                <div className="col">
                                                    <div className="form-outline">
                                                        <label className="form-label" htmlFor="full_name"> <i className='fas fa-user'></i> Full Name</label>
                                                        <input
                                                            type="text"
                                                            id=""
                                                            name='fullName'
                                                            className="form-control"
                                                            onChange={handleChange}
                                                            value={fullName}
                                                        />
                                                    </div>
                                                </div>

                                            </div>

                                            <div className="row mb-4">
                                                <div className="col">
                                                    <div className="form-outline">
                                                        <label className="form-label" htmlFor="form6Example1"><i className='fas fa-envelope'></i> Email</label>
                                                        <input
                                                            type="text"
                                                            id="form6Example1"
                                                            className="form-control"
                                                            name='email'
                                                            onChange={handleChange}
                                                            value={email}

                                                        />
                                                    </div>
                                                </div>
                                                <div className="col">
                                                    <div className="form-outline">
                                                        <label className="form-label" htmlFor="form6Example1"><i className='fas fa-phone'></i> Mobile</label>
                                                        <input
                                                            type="text"
                                                            id="form6Example1"
                                                            className="form-control"
                                                            name='mobile'
                                                            onChange={handleChange}
                                                            value={mobile}
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <h5 className="mb-1 mt-4">Shipping address</h5>

                                            <div className="row mb-4">
                                                <div className="col-lg-6 mt-3">
                                                    <div className="form-outline">
                                                        <label className="form-label" htmlFor="form6Example1"> Address</label>
                                                        <input
                                                            type="text"
                                                            id="form6Example1"
                                                            className="form-control"
                                                            name='address'
                                                            onChange={handleChange}
                                                            value={address}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="col-lg-6 mt-3">
                                                    <div className="form-outline">
                                                        <label className="form-label" htmlFor="form6Example1"> City</label>
                                                        <input
                                                            type="text"
                                                            id="form6Example1"
                                                            className="form-control"
                                                            name='city'
                                                            onChange={handleChange}
                                                            value={city}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="col-lg-6 mt-3">
                                                    <div className="form-outline">
                                                        <label className="form-label" htmlFor="form6Example1"> State</label>
                                                        <input
                                                            type="text"
                                                            id="form6Example1"
                                                            className="form-control"
                                                            name='state'
                                                            onChange={handleChange}
                                                            value={state}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="col-lg-6 mt-3">
                                                    <div className="form-outline">
                                                        <label className="form-label" htmlFor="form6Example1"> Country</label>
                                                        <input
                                                            type="text"
                                                            id="form6Example1"
                                                            className="form-control"
                                                            name='country'
                                                            onChange={handleChange}
                                                            value={country}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-lg-4 mb-4 mb-md-0">
                                        {/* Section: Summary */}
                                        <section className="shadow-4 p-4 rounded-5 mb-4">
                                            <h5 className="mb-3">Cart Summary</h5>
                                            <div className="d-flex justify-content-between mb-3">
                                                <span>Subtotal </span>
                                                <span>${cartTotal.sub_total?.toFixed(2)}</span>
                                            </div>
                                            <div className="d-flex justify-content-between">
                                                <span>Shipping </span>
                                                <span>${cartTotal.shipping?.toFixed(2)}</span>
                                            </div>
                                            <div className="d-flex justify-content-between">
                                                <span>Tax </span>
                                                <span>${cartTotal.tax?.toFixed(2)}</span>
                                            </div>
                                            <div className="d-flex justify-content-between">
                                                <span>Servive Fee </span>
                                                <span>${cartTotal.service_fee?.toFixed(2)}</span>
                                            </div>
                                            <hr className="my-4" />
                                            <div className="d-flex justify-content-between fw-bold mb-5">
                                                <span>Total </span>
                                                <span>${cartTotal.total?.toFixed(2)}</span>
                                            </div>
                                            {cart.length > 0 &&
                                                <button
                                                    onClick={createCartOrder}
                                                    className="btn btn-primary btn-rounded w-100"
                                                >
                                                    Got to checkout
                                                </button>
                                            }
                                        </section>
                                    </div>
                                </div>
                            </section>
                        </div>
                    </main>
                </div>
            </main>
        </div>
    )
}

export default Cart