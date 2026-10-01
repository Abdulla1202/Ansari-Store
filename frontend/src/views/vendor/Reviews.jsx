import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom';

import apiInstance from '../../utils/axios';
import UserData from '../plugin/UserData';
import Sidebar from './Sidebar';

function Reviews() {
  const [reviews, setReviews] = useState([])
 const [updateReviews, setUpdateReviews] = useState({})

  const axios = apiInstance
  const userData = UserData()

  if (UserData()?.vendor_id === 0) {
    window.location.href = '/vendor/register/'
  }

  // Fetch Reviews
  const fetchData = async () => {
    try {
      const response = await axios.get(
        `vendor-reviews/${userData?.vendor_id}/`
      )

      setReviews(response.data);

    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  useEffect(() => {
    if (userData?.vendor_id) {
      fetchData();
    }
  }, [userData?.vendor_id]);


  // Reply input change
 const handleReplyChange = (event, reviewId) => {
  setUpdateReviews({
    ...updateReviews,
    [reviewId]: event.target.value
  })
}


  // Submit Reply
const handleReplySubmit = async (e, reviewId) => {
  e.preventDefault();

  const reply = updateReviews[reviewId] || "";

  if (!reply.trim()) {
    alert("Please enter a reply.");
    return;
  }

  try {
    const formdata = new FormData();

    formdata.append(
      "reply",
      reply.trim()
    );

    const response = await axios.patch(
      `vendor-reviews/${userData?.vendor_id}/${reviewId}/`,
      formdata
    );

    console.log("Reply updated:", response.data);

    // Sirf isi review ka input clear hoga
    setUpdateReviews((prev) => ({
      ...prev,
      [reviewId]: ""
    }));

    // Reviews refresh
    await fetchData();

  } catch (error) {
    console.error(
      "Error updating review:",
      error.response?.data || error.message
    );
  }
};


  return (
    <div className="container-fluid" id="main">

      <div className="row row-offcanvas row-offcanvas-left h-100">

        <Sidebar />

        <div className="col-md-9 col-lg-10 main mt-4">

          <h4>
            <i className="fas fa-star" /> Reviews and Rating
          </h4>

          <section
            className="p-4 p-md-5 text-center text-lg-start shadow-1-strong rounded"
            style={{
              backgroundImage:
                "url(https://mdbcdn.b-cdn.net/img/Photos/Others/background2.webp)"
            }}
          >

            <div className="row d-flex justify-content-center align-items-center">

              <div className="col-md-10">

                {reviews.map((review, index) => (

                  <div
                    className="card mt-3 mb-3"
                    key={review.id || index}
                  >

                    <div className="card-body m-3">

                      <div className="row">

                        {/* Profile Image */}
                        <div className="col-lg-4 d-flex justify-content-center align-items-center mb-4 mb-lg-0">

                          <img
                            src={review.profile?.image}
                            className="rounded-circle img-fluid shadow-1"
                            alt="User avatar"
                            style={{
                              width: 200,
                              height: 200,
                              objectFit: "cover"
                            }}
                          />

                        </div>


                        {/* Review Details */}
                        <div className="col-lg-8">

                          <p className="text-dark mb-2">
                            <b>Review: </b>
                            {review.review}
                          </p>


                          {/* Reply */}
                          <p className="text-dark mb-2 d-flex">

                            <b>Reply:</b>

                            {review.reply === null || review.reply === ""
                              ? (
                                <span className="ms-2">
                                  No Response
                                </span>
                              )
                              : (
                                <span className="ms-2">
                                  {review.reply}
                                </span>
                              )
                            }

                          </p>


                          {/* User Name */}
                          <p className="text-dark mb-2">

                            <strong>Name</strong>:

                            {review.profile?.full_name}

                          </p>


                          {/* Product */}
                          <p className="mb-0">

                            <b>Product</b>:

                            {review?.product?.title}

                          </p>


                          {/* Rating */}
                          <p className="mb-0 mt-2">

                            <b>Rating:</b>

                            {review.rating === 1 && (
                              <>
                                <span className="me-2 ms-2">
                                  1
                                </span>

                                <i className="fas fa-star" />
                              </>
                            )}

                            {review.rating === 2 && (
                              <>
                                <span className="me-2 ms-2">
                                  2
                                </span>

                                <i className="fas fa-star" />
                                <i className="fas fa-star" />
                              </>
                            )}

                            {review.rating === 3 && (
                              <>
                                <span className="me-2 ms-2">
                                  3
                                </span>

                                <i className="fas fa-star" />
                                <i className="fas fa-star" />
                                <i className="fas fa-star" />
                              </>
                            )}

                            {review.rating === 4 && (
                              <>
                                <span className="me-2 ms-2">
                                  4
                                </span>

                                <i className="fas fa-star" />
                                <i className="fas fa-star" />
                                <i className="fas fa-star" />
                                <i className="fas fa-star" />
                              </>
                            )}

                            {review.rating === 5 && (
                              <>
                                <span className="me-2 ms-2">
                                  5
                                </span>

                                <i className="fas fa-star" />
                                <i className="fas fa-star" />
                                <i className="fas fa-star" />
                                <i className="fas fa-star" />
                                <i className="fas fa-star" />
                              </>
                            )}

                          </p>

{/* Reply Form */}
<form
  onSubmit={(e) => handleReplySubmit(e, review.id)}
  className="mt-3"
>
  <input
    type="text"
    name="reply"
    value={updateReviews[review.id] || ""}
    onChange={(e) => handleReplyChange(e, review.id)}
    className="form-control"
    placeholder="Write your reply..."
  />

  <button
    type="submit"
    className="btn btn-success mt-2"
  >
    Reply
  </button>
</form>
                          {/* View Review */}
                          <div className="d-flex mt-3">

                            <div className="btn-group">

                              <Link
                                to={`/vendor/reviews/${review.id}/`}
                                className="btn btn-primary"
                              >

                                <i className="fas fa-eye"></i>

                                {" "}View Review

                              </Link>

                            </div>

                          </div>

                        </div>

                      </div>

                    </div>

                  </div>

                ))}


                {/* No Reviews */}
                {reviews.length === 0 && (
                  <h5 className="mt-4 p-3">
                    No reviews yet
                  </h5>
                )}

              </div>

            </div>

          </section>

        </div>

      </div>

    </div>
  )
}

export default Reviews