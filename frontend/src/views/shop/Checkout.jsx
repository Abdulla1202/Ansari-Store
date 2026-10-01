import { React, useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import Swal from 'sweetalert2'
import { API_BASE_URL, PAYPAL_CLIENT_ID, SERVER_URL } from '../../utils/constants';


import apiInstance from '../../utils/axios';
import GetCurrentAddress from '../plugin/UserCountry';
import UserData from '../plugin/UserData';
import CartID from '../plugin/cartID';



function Checkout() {
  const [order, setOrder] = useState([])
  const [couponCode, setCouponCode] = useState("")
  const [appliedCoupon, setAppliedCoupon] = useState("")
  const [loading, setLoading] = useState(false)
  const [paymentLoading, setPaymentLoading] = useState(false)

  // Direct Card Simulation States
  const [paymentMethod, setPaymentMethod] = useState("card"); // "card" | "stripe" | "paypal"
  const [cardNumber, setCardNumber] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardProcessing, setCardProcessing] = useState(false);

  const axios = apiInstance
  const userData = UserData()
  let cart_id = CartID()
  const param = useParams()
  let navigate = useNavigate();

  useEffect(() => {
    axios.get(`checkout/${param?.order_oid}/`).then((res) => {
      setOrder(res.data);
      if (res.data?.full_name && !cardHolder) {
        setCardHolder(res.data.full_name);
      }
    })
  }, [loading, param?.order_oid])

  const autoFillTestCard = () => {
    setCardNumber("4242 4242 4242 4242");
    setCardHolder(order?.full_name || "John Doe");
    setCardExpiry("12/28");
    setCardCvv("123");
  };

  const handleCardNumberChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
    const formatted = raw.replace(/(\d{4})/g, '$1 ').trim();
    setCardNumber(formatted);
  };

  const handleExpiryChange = (e) => {
    let raw = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (raw.length >= 3) {
      raw = raw.slice(0, 2) + '/' + raw.slice(2);
    }
    setCardExpiry(raw);
  };

  const handleSimulateCardPayment = async (e) => {
    e.preventDefault();
    if (!cardNumber.trim() || !cardExpiry.trim() || !cardCvv.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Card Details Required',
        text: 'Please enter card number, expiry, and CVV (or click Auto-Fill Test Card).',
      });
      return;
    }

    setCardProcessing(true);
    try {
      const response = await axios.post('simulate-card-payment/', {
        order_oid: param?.order_oid,
        card_number: cardNumber.replace(/\s/g, ''),
        card_holder: cardHolder || order.full_name,
        card_expiry: cardExpiry,
      });

      if (response.data.message === "Payment Successfull" || response.data.status === "paid") {
        Swal.fire({
          icon: 'success',
          title: 'Payment Successful! 🎉',
          text: 'Order confirmed successfully. Redirecting...',
          timer: 1500,
          showConfirmButton: false,
        });
        setTimeout(() => {
          navigate(`/payment-success/${order.oid || param?.order_oid}/`);
        }, 1500);
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Payment Failed',
          text: response.data.message || 'Unable to process card payment.',
        });
      }
    } catch (error) {
      console.error("Card payment error:", error);
      Swal.fire({
        icon: 'error',
        title: 'Payment Error',
        text: error.response?.data?.error || 'Unable to process card payment.',
      });
    } finally {
      setCardProcessing(false);
    }
  };


  const initialOptions = {
    clientId: PAYPAL_CLIENT_ID,
    currency: "USD",
    intent: "capture",
  };

  const handleChange = (e) => {
    const { name, value } = e.target
    switch (name) {
      case "couponCode":
        setCouponCode(value)
        break;

      default:
        break;
    }
  }

const appleCoupon = async () => {
    if (!couponCode.trim()) {
        Swal.fire({
            icon: "warning",
            title: "Coupon Code Required",
            text: "Please enter a coupon code.",
        });
        return;
    }

    setLoading(true);

    const formdata = new FormData();
    formdata.append("order_oid", param?.order_oid);
    formdata.append("coupon_code", couponCode.trim());

    try {
        const response = await axios.post("coupon/", formdata);

        console.log("COUPON RESPONSE:", response.data);

      if (response.data.message === "Coupon Activated") {

    // Applied coupon code save karo
    setAppliedCoupon(couponCode.trim());

    Swal.fire({
        icon: "success",
        title: "Coupon Applied",
        text: "Discount has been applied to your order.",
    });

    const orderResponse = await axios.get(
        `checkout/${param?.order_oid}/`
    );

    setOrder(orderResponse.data);
}

        else if (response.data.message === "Coupon Already Activated") {
            Swal.fire({
                icon: "warning",
                title: "Coupon Already Applied",
                text: "This coupon has already been applied.",
            });
        }

        else {
            Swal.fire({
                icon: "error",
                title: "Coupon Error",
                text: response.data.message || "Coupon could not be applied.",
            });
        }

        setCouponCode("");

    } catch (error) {
        console.error(
            "COUPON ERROR:",
            error.response?.data || error.message
        );

        Swal.fire({
            icon: "error",
            title: "Coupon Error",
            text:
                error.response?.data?.message ||
                "Unable to apply coupon.",
        });

        setCouponCode("");

    } finally {
        setLoading(false);
    }
};

  const payWithStripe = (event) => {
    setPaymentLoading(true)
    event.target.form.submit();
  }


  return (
    <div>
      <main>
        <main className="mb-4 mt-4">
          <div className="container">
            {/* Section: Checkout form */}
            <section className="">
              <div className="row gx-lg-5">
                <div className="col-lg-8 mb-4 mb-md-0">
                  {/* Section: Biling details */}
                  <section className="">
                    <div className="alert alert-warning">
                      <strong>Review Your Shipping &amp; Order Details </strong>
                    </div>
                    <form>
                      <h5 className="mb-4 mt-4">Shipping address</h5>
                      {/* 2 column grid layout with text inputs for the first and last names */}
                      <div className="row mb-4">

                        <div className="col-lg-12">
                          <div className="form-outline">
                            <label className="form-label" htmlFor="form6Example2">Full Name</label>
                            <input
                              type="text"
                              readOnly
                              className="form-control"
                              value={order.full_name || ""}
                            />
                          </div>
                        </div>

                        <div className="col-lg-6 mt-4">
                          <div className="form-outline">
                            <label className="form-label" htmlFor="form6Example2">Email</label>
                            <input
                              type="text"
                              readOnly
                              className="form-control"
                              value={order.email || ""}
                            />
                          </div>
                        </div>

                        <div className="col-lg-6 mt-4">
                          <div className="form-outline">
                            <label className="form-label" htmlFor="form6Example2">Mobile</label>
                            <input
                              type="text"
                              readOnly
                              className="form-control"
                              value={order.mobile || ""}
                            />
                          </div>
                        </div>
                        <div className="col-lg-6 mt-4">
                          <div className="form-outline">
                            <label className="form-label" htmlFor="form6Example2">Address</label>
                            <input
                              type="text"
                              readOnly
                              className="form-control"
                              value={order.address || ""}
                            />
                          </div>
                        </div>
                        <div className="col-lg-6 mt-4">
                          <div className="form-outline">
                            <label className="form-label" htmlFor="form6Example2">City</label>
                            <input
                              type="text"
                              readOnly
                              className="form-control"
                              value={order.city || ""}
                            />
                          </div>
                        </div>
                        <div className="col-lg-6 mt-4">
                          <div className="form-outline">
                            <label className="form-label" htmlFor="form6Example2">State</label>
                            <input
                              type="text"
                              readOnly
                              className="form-control"
                              value={order.state || ""}
                            />
                          </div>
                        </div>
                        <div className="col-lg-6 mt-4">
                          <div className="form-outline">
                            <label className="form-label" htmlFor="form6Example2">Country</label>
                            <input
                              type="text"
                              readOnly
                              className="form-control"
                              value={order.country || ""}
                            />
                          </div>
                        </div>
                      </div>


                      <h5 className="mb-4 mt-4">Billing address</h5>
                      <div className="form-check mb-2">
                        <input className="form-check-input me-2" type="checkbox" defaultValue="" id="form6Example8" defaultChecked="" />
                        <label className="form-check-label" htmlFor="form6Example8">
                          Same as shipping address
                        </label>
                      </div>
                    </form>
                  </section>
                  {/* Section: Biling details */}
                </div>
               <div className="col-lg-4 mb-4 mb-md-0">
    {/* Section: Summary */}
    <section className="shadow-4 p-4 rounded-5 mb-4">

        <h5 className="mb-3">Cart Summary</h5>

        <div className="d-flex justify-content-between mb-3">
            <span>Subtotal</span>
            <span>
    ${order.original_sub_total ?? order.sub_total}
</span>
        </div>

        <div className="d-flex justify-content-between mb-3">
            <span>Shipping</span>
            <span>${order.shipping_amount}</span>
        </div>

        <div className="d-flex justify-content-between mb-3">
            <span>Tax</span>
            <span>${order.tax_fee}</span>
        </div>

        <div className="d-flex justify-content-between mb-3">
            <span>Service Fee</span>
            <span>${order.service_fee}</span>
        </div>

        {/* Coupon Discount */}
     {order.saved > 0 && (
    <div className="d-flex justify-content-between mb-3 text-success">
        <span>
            Coupon Discount
            {appliedCoupon && ` (${appliedCoupon})`}
        </span>
        <span>- ${order.saved}</span>
    </div>
)}

        <hr className="my-4" />

        <div className="d-flex justify-content-between fw-bold mb-5">
            <span>Total</span>
            <span>${order.total}</span>
        </div>

                    <div className="shadow p-3 d-flex mt-4 mb-4">
                      {loading === true &&
                        <>
                          <input readOnly value={couponCode} name="couponCode" type="text" className='form-control' style={{ border: "dashed 1px gray" }} placeholder='Enter Coupon Code' id="" />
                          <button disabled className='btn btn-success ms-1'><i className='fas fa-spinner fa-spin'></i></button>
                        </>
                      }

                      {loading === false &&
                        <>
                          <input onChange={handleChange} value={couponCode} name="couponCode" type="text" className='form-control' style={{ border: "dashed 1px gray" }} placeholder='Enter Coupon Code' id="" />
                          <button onClick={appleCoupon} className='btn btn-success ms-1'><i className='fas fa-check-circle'></i></button>
                        </>
                      }
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-bold text-dark small text-uppercase">Select Payment Method</label>
                      <div className="row g-2">
                        <div className="col-4">
                          <button
                            type="button"
                            onClick={() => setPaymentMethod("card")}
                            className={`btn btn-sm w-100 p-2 text-center rounded-3 border ${
                              paymentMethod === "card" ? "btn-primary text-white shadow-sm" : "btn-light text-dark"
                            }`}
                          >
                            <i className="fas fa-credit-card d-block fs-5 mb-1"></i>
                            <span className="small fw-semibold">Debit Card</span>
                          </button>
                        </div>
                        <div className="col-4">
                          <button
                            type="button"
                            onClick={() => setPaymentMethod("stripe")}
                            className={`btn btn-sm w-100 p-2 text-center rounded-3 border ${
                              paymentMethod === "stripe" ? "btn-primary text-white shadow-sm" : "btn-light text-dark"
                            }`}
                          >
                            <i className="fab fa-stripe d-block fs-5 mb-1" style={{ color: paymentMethod === "stripe" ? "#fff" : "#635BFF" }}></i>
                            <span className="small fw-semibold">Stripe</span>
                          </button>
                        </div>
                        <div className="col-4">
                          <button
                            type="button"
                            onClick={() => setPaymentMethod("paypal")}
                            className={`btn btn-sm w-100 p-2 text-center rounded-3 border ${
                              paymentMethod === "paypal" ? "btn-primary text-white shadow-sm" : "btn-light text-dark"
                            }`}
                          >
                            <i className="fab fa-paypal d-block fs-5 mb-1" style={{ color: paymentMethod === "paypal" ? "#fff" : "#0079C1" }}></i>
                            <span className="small fw-semibold">PayPal</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* METHOD 1: Direct Debit / Credit Card Simulation */}
                    {paymentMethod === "card" && (
                      <div className="border rounded-4 p-3 mb-3 bg-light">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <span className="badge bg-light text-muted border px-2 py-1 small">
                            <i className="fas fa-lock text-success me-1"></i> Instant Secure Pay
                          </span>
                          <button
                            type="button"
                            onClick={autoFillTestCard}
                            className="btn btn-outline-primary btn-sm rounded-pill py-0 px-2"
                            style={{ fontSize: "0.75rem" }}
                          >
                            <i className="fas fa-magic me-1"></i> Auto-fill Test Card
                          </button>
                        </div>

                        {/* Interactive Visual Card Mockup */}
                        <div
                          className="rounded-3 p-3 text-white mb-3 shadow-sm"
                          style={{
                            background: "linear-gradient(135deg, #1e293b 0%, #334155 50%, #475569 100%)",
                            position: "relative",
                            overflow: "hidden",
                          }}
                        >
                          <div className="d-flex justify-content-between align-items-center mb-3">
                            <i className="fas fa-microchip fs-3 text-warning"></i>
                            <span className="fw-bold font-monospace" style={{ letterSpacing: "1px" }}>DEBIT CARD</span>
                          </div>
                          <div className="font-monospace fs-5 text-center mb-3" style={{ letterSpacing: "2px" }}>
                            {cardNumber || "•••• •••• •••• ••••"}
                          </div>
                          <div className="d-flex justify-content-between small text-white-50">
                            <div>
                              <div style={{ fontSize: "0.65rem" }}>CARDHOLDER</div>
                              <div className="text-white fw-semibold small text-uppercase">{cardHolder || order?.full_name || "VALUED CUSTOMER"}</div>
                            </div>
                            <div className="text-end">
                              <div style={{ fontSize: "0.65rem" }}>EXPIRES</div>
                              <div className="text-white fw-semibold small font-monospace">{cardExpiry || "MM/YY"}</div>
                            </div>
                          </div>
                        </div>

                        {/* Form Inputs */}
                        <form onSubmit={handleSimulateCardPayment}>
                          <div className="mb-2">
                            <label className="form-label small fw-semibold text-muted mb-1">Card Number</label>
                            <div className="input-group input-group-sm">
                              <span className="input-group-text bg-white"><i className="fas fa-credit-card text-muted"></i></span>
                              <input
                                type="text"
                                className="form-control"
                                placeholder="4242 4242 4242 4242"
                                value={cardNumber}
                                onChange={handleCardNumberChange}
                                maxLength={19}
                                required
                              />
                            </div>
                          </div>

                          <div className="mb-2">
                            <label className="form-label small fw-semibold text-muted mb-1">Cardholder Name</label>
                            <input
                              type="text"
                              className="form-control form-control-sm"
                              placeholder="Name on card"
                              value={cardHolder}
                              onChange={(e) => setCardHolder(e.target.value)}
                              required
                            />
                          </div>

                          <div className="row g-2 mb-3">
                            <div className="col-6">
                              <label className="form-label small fw-semibold text-muted mb-1">Expiry Date</label>
                              <input
                                type="text"
                                className="form-control form-control-sm"
                                placeholder="MM/YY"
                                value={cardExpiry}
                                onChange={handleExpiryChange}
                                maxLength={5}
                                required
                              />
                            </div>
                            <div className="col-6">
                              <label className="form-label small fw-semibold text-muted mb-1">CVV / CVC</label>
                              <input
                                type="password"
                                className="form-control form-control-sm"
                                placeholder="123"
                                value={cardCvv}
                                onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                                maxLength={4}
                                required
                              />
                            </div>
                          </div>

                          <button
                            type="submit"
                            disabled={cardProcessing}
                            className="btn btn-success btn-rounded w-100 py-2 fw-semibold shadow-sm"
                          >
                            {cardProcessing ? (
                              <>
                                <i className="fas fa-spinner fa-spin me-2"></i> Processing Payment...
                              </>
                            ) : (
                              <>
                                <i className="fas fa-lock me-2"></i> Pay ${order.total} (Instant)
                              </>
                            )}
                          </button>
                        </form>
                      </div>
                    )}

                    {/* METHOD 2: Stripe Hosted Checkout */}
                    {paymentMethod === "stripe" && (
                      <div className="border rounded-4 p-3 mb-3 bg-light text-center">
                        <p className="small text-muted mb-3">
                          You will be redirected to the secure Stripe Checkout page.
                        </p>
                        {paymentLoading === true ? (
                          <form action={`${API_BASE_URL}stripe-checkout/${param?.order_oid}/`} method="POST">
                            <button onClick={payWithStripe} type="submit" disabled className="btn btn-primary btn-rounded w-100 py-2" style={{ backgroundColor: "#635BFF", borderColor: "#635BFF" }}>
                              Redirecting to Stripe... <i className="fas fa-spinner fa-spin ms-2"></i>
                            </button>
                          </form>
                        ) : (
                          <form action={`${API_BASE_URL}stripe-checkout/${param?.order_oid}/`} method="POST">
                            <button onClick={payWithStripe} type="submit" className="btn btn-primary btn-rounded w-100 py-2 fw-semibold" style={{ backgroundColor: "#635BFF", borderColor: "#635BFF" }}>
                              <i className="fab fa-stripe me-2 fs-5 align-middle"></i> Pay ${order.total} With Stripe
                            </button>
                          </form>
                        )}
                      </div>
                    )}

                    {/* METHOD 3: PayPal Sandbox */}
                    {paymentMethod === "paypal" && (
                      <div className="border rounded-4 p-3 mb-3 bg-light">
                        <p className="small text-muted text-center mb-2">
                          Pay securely using your PayPal sandbox account or wallet.
                        </p>
                        <PayPalScriptProvider options={initialOptions}>
                          <PayPalButtons
                            className="mt-2"
                            createOrder={async () => {
                              try {
                                const orderOid = param?.order_oid;
                                if (!orderOid) throw new Error("Order ID is missing from URL");
                                const response = await axios.post(`paypal/create-order/${orderOid}/`);
                                return response.data.id;
                              } catch (error) {
                                console.error("PAYPAL CREATE ERROR:", error.response?.data || error.message);
                                throw error;
                              }
                            }}
                            onApprove={async (data) => {
                              try {
                                const response = await axios.post("paypal/capture-order/", {
                                  paypal_order_id: data.orderID,
                                  order_oid: param?.order_oid
                                });
                                if (response.data.message === "Payment Successfull" || response.data.status === "COMPLETED") {
                                  navigate(`/payment-success/${order.oid || param?.order_oid}/?payapl_order_id=${data.orderID}`);
                                }
                              } catch (error) {
                                console.error("PayPal Capture Error:", error.response?.data || error);
                                Swal.fire({
                                  icon: "error",
                                  title: "Payment Failed",
                                  text: error.response?.data?.error || "PayPal payment could not be completed"
                                });
                              }
                            }}
                            onCancel={(data) => {
                              console.log("PayPal Cancelled:", data);
                            }}
                            onError={(error) => {
                              console.error("PayPal Error:", error);
                              Swal.fire({
                                icon: "error",
                                title: "PayPal Error",
                                text: "PayPal payment was cancelled or failed."
                              });
                            }}
                          />
                        </PayPalScriptProvider>
                      </div>
                    )}
                  </section>
                </div>
              </div>
            </section>
          </div>
        </main>
      </main>
    </div>
  )
}

export default Checkout