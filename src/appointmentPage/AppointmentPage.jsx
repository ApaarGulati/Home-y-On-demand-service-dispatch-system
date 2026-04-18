import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ScrollFadeIn from "../components/ScrollFadeIn";

const BookingCard = ({ booking }) => {
  // Use sched_start from your DB schema
  const dateObj = new Date(booking.sched_start);
  const dateLabel = dateObj.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const timeLabel = dateObj.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case "ongoing":
      case "pending": // Added pending to match typical DB defaults
        return "bg-cyan-100 text-cyan-600 dark:bg-cyan-900/40 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800";
      case "completed":
        return "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400 border border-green-200 dark:border-green-800";
      case "cancelled":
        return "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400 border border-red-200 dark:border-red-800";
      case "declined":
        return "bg-red-100 text-red-700 dark:bg-red-800/40 dark:text-red-400 border border-red-200 dark:border-red-800";
      case "accepted":
        return "bg-green-100 text-green-500 dark:bg-green-900/40 dark:text-green-400 border border-green-200 dark:border-green-800";
      default:
        return "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400";
    }
  };

  return (
    <ScrollFadeIn>
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-5 sm:p-6 rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row gap-6 items-start md:items-center">
        <div className="flex items-center gap-4 w-full md:w-1/3">
          <img
            src={booking.profile}
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
              {booking.is_final ? "Amount Paid" : "Estimated Price"}
            </span>
            <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
              {booking.worker_name}
            </span>
            <div className="flex items-center gap-1">
              <span
                className={`text-xs font-bold ${
                  booking.is_final ? "text-green-600" : "text-cyan-600"
                }`}
              >
                ₹{booking.price}
              </span>
              {booking.is_final && (
                <span className="text-[9px] bg-green-100 text-green-700 px-1 rounded font-black uppercase">
                  Final
                </span>
              )}
            </div>
          </div>
        </div>

        <div>
          {booking.stat === "payment_pending" && (
            <button
              onClick={() => onFinalize(booking)} // Pass the booking to the parent state
              className="bg-cyan-500 text-white px-7 py-3 rounded-xl text-xs font-black hover:bg-cyan-600 transition-all shadow-lg shadow-cyan-500/20 "
            >
              Finalize & Pay
            </button>
          )}
        </div>
        <div>
          <span> </span>
        </div>
        <div>
          <span> </span>
        </div>

        <div className="flex flex-row md:flex-col items-center md:items-end gap-3 w-full md:w-1/4 justify-between mt-2 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-gray-100 dark:border-gray-800">
          <span
            className={`px-4 py-1 rounded-full text-[11px] font-black uppercase tracking-wider ${getStatusStyle(
              booking.stat
            )}`}
          >
            {booking.stat.replace("_", " ")}
          </span>

          {/* --- NEW ACTION BUTTONS --- */}

          {/* If worker marked it as done, user sees 'Finalize' */}

          {booking.stat === "pending" && (
            <span className="text-[10px] text-gray-400 font-bold italic">
              Awaiting worker...
            </span>
          )}

          {booking.stat === "completed" && !booking.has_review && (
            <button className="text-cyan-600 dark:text-cyan-400 font-bold text-xs hover:underline">
              View Receipt
            </button>
          )}
        </div>
      </div>
    </ScrollFadeIn>
  );
};

const AppointmentPage = () => {
  const [filter, setFilter] = useState("All");
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMyAppointments = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/bookings/my-appointments",
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            credentials: "include", // Essential for JWT Cookie!
          }
        );

        const data = await response.json();
        if (data.status === "success") {
          setBookings(data.data);
        } else if (response.status === 401) {
          navigate("/login");
        }
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMyAppointments();
  }, [navigate]);

  const filteredData = bookings.filter((b) =>
    filter === "All" ? true : b.stat.toLowerCase() === filter.toLowerCase()
  );

  const tabs = ["All", "Pending", "Accepted", "Completed", "Declined","Cancelled"];

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-cyan-500"></div>
      </div>
    );

  return (
    <div className="min-h-screen bg-transparent pt-24 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">
          My Appointments
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8 font-medium">
          View and manage your service history.
        </p>

        <div className="flex gap-3 mb-8 border-b border-gray-200 dark:border-gray-800 pb-4 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-6 py-2 rounded-full font-bold text-sm transition-all shrink-0 ${
                filter === tab
                  ? "bg-cyan-500 text-white"
                  : "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-5">
          {filteredData.length > 0 ? (
            filteredData.map((booking) => (
              <BookingCard key={booking.booking_id} booking={booking} />
            ))
          ) : (
            <div className="py-20 flex flex-col items-center justify-center">
              <p className="text-gray-500 font-bold text-lg">
                No appointments found.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AppointmentPage;




