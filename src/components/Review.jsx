import React, { useState, useEffect } from "react";
import { Star, User, MessageSquare } from "lucide-react";
import Usernav from "./Usernav";

const Review = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/services/worker-reviews",
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            credentials: "include", // Important for JWT
          }
        );

        const data = await response.json();
        if (data.status === "success") {
          setReviews(data.data);
        } else {
          console.error("Failed to fetch reviews:", data.message);
        }
      } catch (error) {
        console.error("Error fetching reviews:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  // Safely calculate average rating to prevent NaN if there are 0 reviews
  const averageRating =
    reviews.length > 0
      ? (
          reviews.reduce((acc, rev) => acc + rev.rating, 0) / reviews.length
        ).toFixed(1)
      : "0.0";

  if (loading) {
    return (
        <>
            <Usernav page="Reviews"/>
            <div className="min-h-screen bg-transparent py-10 px-4 md:px-10">
                <div className="max-w-4xl mx-auto">

                    {/* Rating Summary Header */}
                    <div className="bg-gray-950 rounded-2xl p-8 mb-8 flex flex-col md:flex-row items-center justify-between text-white shadow-xl shadow-cyan-900/10">
                        <div>
                            <h1 className="text-2xl font-bold">Service Reviews</h1>
                            <p className="text-gray-400 text-sm mt-1">Feedback from your completed assignments</p>
                        </div>
                        <div className="mt-6 md:mt-0 text-center md:text-right">
                            <div className="flex items-center justify-center md:justify-end gap-2 text-4xl font-black text-cyan-500">
                                {averageRating}
                                <Star size={32} className="fill-cyan-500 text-cyan-500" />
                            </div>
                            <p className="text-xs uppercase tracking-widest text-gray-500 font-bold mt-1">
                                Overall Rating ({reviews.length} Reviews)
                            </p>
                        </div>
                    </div>

                    {/* Reviews List */}
                    <div className="grid grid-cols-1 gap-4">
                        {reviews.map((review) => (
                            <div key={review.id} className="bg-transparent border border-gray-200 rounded-2xl p-6 transition-all hover:border-cyan-300 hover:shadow-sm">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-transparent rounded-full flex items-center justify-center text-gray-400">
                                            <User size={20} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold dark:text-white text-gray-900 leading-tight">{review.customerName}</h3>
                                            <p className="text-xs text-gray-500">{review.date}</p>
                                        </div>
                                    </div>

                                    {/* Star Display */}
                                    <div className="flex gap-0.5">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                size={14}
                                                className={`${i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-200"}`}
                                            />
                                        ))}
                                    </div>
                                </div>

                                {/* Service Tag */}
                                <div className="inline-block bg-transparent text-cyan-700 text-[10px] font-black uppercase px-2 py-1 rounded-md mb-3">
                                    {review.serviceName}
                                </div>

                                {/* Comment Section */}
                                {review.comment ? (
                                    <div className="flex gap-3 dark:text-white text-gray-700 italic text-[14px] bg-transparent p-4 rounded-xl border-l-4 border-cyan-500">
                                        <MessageSquare size={16} className="text-cyan-500 shrink-0 mt-1" />
                                        <p>"{review.comment}"</p>
                                    </div>
                                ) : (
                                    <p className="text-gray-400 text-sm italic">No written comment provided.</p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
  }

  return (
    <>
      <Usernav page="Reviews" />
      <div className="min-h-screen bg-transparent py-10 px-4 md:px-10">
        <div className="max-w-4xl mx-auto">
          {/* Rating Summary Header */}
          <div className="bg-gray-950 rounded-2xl p-8 mb-8 flex flex-col md:flex-row items-center justify-between text-white shadow-xl shadow-cyan-900/10">
            <div>
              <h1 className="text-2xl font-bold">Service Reviews</h1>
              <p className="text-gray-400 text-sm mt-1">
                Feedback from your completed assignments
              </p>
            </div>
            <div className="mt-6 md:mt-0 text-center md:text-right">
              <div className="flex items-center justify-center md:justify-end gap-2 text-4xl font-black text-cyan-500">
                {averageRating}
                <Star size={32} className="fill-cyan-500 text-cyan-500" />
              </div>
              <p className="text-xs uppercase tracking-widest text-gray-500 font-bold mt-1">
                Overall Rating ({reviews.length} Reviews)
              </p>
            </div>
          </div>

          {/* Reviews List */}
          <div className="grid grid-cols-1 gap-4">
            {reviews.length > 0 ? (
              reviews.map((review) => (
                <div
                  key={review.id}
                  className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 transition-all hover:border-cyan-300 dark:hover:border-cyan-700 hover:shadow-sm"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-gray-400">
                        <User size={20} />
                      </div>
                      <div>
                        <h3 className="font-bold dark:text-white text-gray-900 leading-tight">
                          {review.customerName}
                        </h3>
                        <p className="text-xs text-gray-500">{review.date}</p>
                      </div>
                    </div>

                    {/* Star Display */}
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={14}
                          className={`${
                            i < review.rating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-200 dark:text-gray-700"
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Service Tag & Booking ID */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="inline-block bg-green-200 text-cyan-800 dark:bg-green-900/30 dark:text-green-400 text-[10px] font-black uppercase px-2 py-1 rounded-md">
                      {review.serviceName}
                    </div>
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      ID: #{review.booking_id}
                    </div>
                  </div>

                  {/* Comment Section */}
                  {review.comment ? (
                    <div className="flex gap-3 dark:text-gray-300 text-gray-700 italic text-[14px] bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border-l-4 border-cyan-500">
                      <MessageSquare
                        size={16}
                        className="text-cyan-500 shrink-0 mt-1"
                      />
                      <p>"{review.comment}"</p>
                    </div>
                  ) : (
                    <p className="text-gray-400 text-sm italic">
                      No written comment provided.
                    </p>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800">
                <Star
                  className="mx-auto text-gray-300 dark:text-gray-700 mb-3"
                  size={48}
                />
                <p className="text-gray-500 font-medium">
                  You don't have any reviews yet.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Review;
