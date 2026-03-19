import React, { useState } from "react";
import ScrollFadeIn from "../components/ScrollFadeIn";

// --- MOCK DATA (Modeled strictly after your ER Diagram) ---
const mockBookings = [
  {
    booking_id: "BK-1024",
    service_name: "Deep Tissue Massage", // From SERVICE table
    worker_name: "Alice Johnson", // From ACCOUNT table
    start_time: "2026-03-16T10:00:00", // From BOOKING table
    base_amount: 850, // From TRANSACTIONS table
    status: "ongoing", // From BOOKING table
    has_review: false, // Derived from REVIEW table existence
    worker_image: "https://i.pravatar.cc/150?img=1",
  },
  {
    booking_id: "BK-0982",
    service_name: "AC Repair & Maintenance",
    worker_name: "Bob Smith",
    start_time: "2026-03-10T14:30:00",
    base_amount: 800,
    status: "completed",
    has_review: false, // Needs a review!
    worker_image: "https://i.pravatar.cc/150?img=11",
  },
  {
    booking_id: "BK-0845",
    service_name: "Deep House Cleaning",
    worker_name: "Levi Ackerman",
    start_time: "2026-02-28T09:00:00",
    base_amount: 1600,
    status: "completed",
    has_review: true, // Already reviewed
    worker_image: "https://i.pravatar.cc/150?img=13",
  },
  {
    booking_id: "BK-0810",
    service_name: "Full Glam Makeup",
    worker_name: "RuPaul",
    start_time: "2026-02-15T11:00:00",
    base_amount: 1500,
    status: "cancelled",
    has_review: false,
    worker_image: "https://i.pravatar.cc/150?img=36",
  },
];

// --- BOOKING CARD COMPONENT ---
const BookingCard = ({ booking }) => {
  // Safely parse the SQL timestamp into readable formats
  const dateObj = new Date(booking.start_time);
  const dateLabel = dateObj.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const timeLabel = dateObj.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  // Dynamic styling based on the status string
  const getStatusStyle = (status) => {
    switch (status.toLowerCase()) {
      case "ongoing":
        return "bg-cyan-100 text-cyan-600 dark:bg-cyan-900/40 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800";
      case "completed":
        return "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400 border border-green-200 dark:border-green-800";
      case "cancelled":
        return "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400 border border-red-200 dark:border-red-800";
      default:
        return "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400";
    }
  };

  return (
    <ScrollFadeIn>
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-5 sm:p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row gap-6 items-start md:items-center">
        {/* 1. Image & Primary Service Info */}
        <div className="flex items-center gap-4 w-full md:w-1/3">
          <img
            src={booking.worker_image}
            alt={booking.worker_name}
            className="w-16 h-16 rounded-full object-cover border-2 border-gray-100 dark:border-gray-800 shrink-0"
          />
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-cyan-500 tracking-wider uppercase">
              #{booking.booking_id}
            </span>
            <h3 className="font-bold text-lg text-gray-800 dark:text-white leading-tight">
              {booking.service_name}
            </h3>
          </div>
        </div>

        {/* 2. Date & Provider Details */}
        <div className="grid grid-cols-2 md:flex md:flex-row gap-4 sm:gap-8 w-full md:w-1/2">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
              Scheduled For
            </span>
            <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
              {dateLabel}
            </span>
            <span className="text-xs text-gray-500 font-medium">
              {timeLabel}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
              Provider
            </span>
            <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
              {booking.worker_name}
            </span>
            <span className="text-xs text-cyan-600 dark:text-cyan-400 font-bold">
              ₹{booking.base_amount}
            </span>
          </div>
        </div>

        {/* 3. Status Badge & Contextual Actions */}
        <div className="flex flex-row md:flex-col items-center md:items-end gap-3 w-full md:w-1/4 justify-between mt-2 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-gray-100 dark:border-gray-800">
          <span
            className={`px-4 py-1 rounded-full text-[11px] font-black uppercase tracking-wider ${getStatusStyle(
              booking.status
            )}`}
          >
            {booking.status}
          </span>

          {/* Action buttons based on status & review existence */}
          {booking.status === "ongoing" && (
            <button className="text-cyan-600 dark:text-cyan-400 font-bold text-sm hover:underline flex items-center gap-1">
              <span className="animate-pulse h-2 w-2 bg-cyan-500 rounded-full inline-block"></span>
              Track Worker
            </button>
          )}

          {booking.status === "completed" && !booking.has_review && (
            <button className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-4 py-2 rounded-lg text-xs font-bold hover:opacity-80 transition-opacity w-full md:w-auto text-center">
              Rate Service
            </button>
          )}

          {booking.status === "completed" && booking.has_review && (
            <span className="text-xs font-medium text-gray-400 italic">
              Review submitted
            </span>
          )}
        </div>
      </div>
    </ScrollFadeIn>
  );
};

// --- MAIN PAGE COMPONENT ---
const AppointmentPage = () => {
  // State to handle which tab is currently active
  const [filter, setFilter] = useState("All");

  // Filter the mock array based on the selected tab
  const filteredData = mockBookings.filter((b) =>
    filter === "All" ? true : b.status.toLowerCase() === filter.toLowerCase()
  );

  const tabs = ["All", "Ongoing", "Completed", "Cancelled"];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300 pt-24 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Header Section */}
        <ScrollFadeIn>
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">
            My Appointments
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mb-8 font-medium">
            View and manage your service history and upcoming bookings.
          </p>
        </ScrollFadeIn>

        {/* Filter Tabs Navigation */}
        <div className="flex gap-3 mb-8 border-b border-gray-200 dark:border-gray-800 pb-4 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-6 py-2 rounded-full font-bold text-sm transition-all shrink-0 ${
                filter === tab
                  ? "bg-cyan-500 text-white shadow-md shadow-cyan-500/20"
                  : "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* List of Bookings */}
        <div className="flex flex-col gap-5">
          {filteredData.length > 0 ? (
            filteredData.map((booking) => (
              <BookingCard key={booking.booking_id} booking={booking} />
            ))
          ) : (
            <div className="py-20 flex flex-col items-center justify-center bg-white dark:bg-gray-900 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
              <span className="text-4xl mb-3 opacity-50">📂</span>
              <p className="text-gray-500 dark:text-gray-400 font-bold text-lg">
                No {filter !== "All" ? filter.toLowerCase() : ""} bookings
                found.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AppointmentPage;
