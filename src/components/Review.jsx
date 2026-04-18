import React from 'react'
import { Star, User, MessageSquare } from 'lucide-react';
import Usernav from './Usernav';

const Review = () => {
    const reviews = [
        {
            id: 1,
            customerName: "Ananya Iyer",
            serviceName: "Professional Plumber Consultation",
            rating: 5,
            comment: "Arrived right on time and fixed the leak in minutes. Very professional behavior!",
            date: "2 days ago"
        },
        {
            id: 2,
            customerName: "Vikram Seth",
            serviceName: "Full Home Deep Cleaning",
            rating: 4,
            comment: "Great job on the kitchen and bathrooms. Missed a small spot in the balcony but rectified it immediately.",
            date: "1 week ago"
        },
        {
            id: 3,
            customerName: "Sonia Mirza",
            serviceName: "AC Service & Gas Recharge",
            rating: 5,
            comment: "Best technician I've had so far. Explained the issue clearly and gave maintenance tips.",
            date: "2 weeks ago"
        },
        {
            id: 4,
            customerName: "Karan Johar",
            serviceName: "Electrical Wiring & Repair",
            rating: 3,
            comment: "Work was good, but arrived 30 minutes later than the scheduled slot.",
            date: "1 month ago"
        }
    ];

    const averageRating = (reviews.reduce((acc, rev) => acc + rev.rating, 0) / reviews.length).toFixed(1);

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

export default Review
