import React, { useState, useEffect } from "react";
import { Clock, MapPin, Phone, IndianRupee, Calendar } from "lucide-react";
import Usernav from "../components/Usernav";

const WorkerBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [activeTab, setActiveTab] = useState("pending"); // 'pending' or 'history'
  const [loading, setLoading] = useState(false);

  // --- 1. FETCH LIVE DATA ---
  const fetchBookings = async (status) => {
    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:5000/api/bookings/worker-bookings?status=${status}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include", // Sends JWT Cookie
        }
      );

      const result = await response.json();
      if (result.status === "success") {
        setBookings(result.data);
      } else {
        console.error("Failed to fetch:", result.message);
        setBookings([]);
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings(activeTab);
  }, [activeTab]);

  // --- 2. DECLINE ACTION ---
  const handleDecline = async (bookingId) => {

    try {
      const response = await fetch(
        `http://localhost:5000/api/bookings/decline-booking`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ booking_id: bookingId }),
        }
      );

      const result = await response.json();
      if (result.status === "success") {
        alert("Booking declined successfully.");
        fetchBookings(activeTab); // Refresh the current tab to remove the declined job
      } else {
        alert(result.message);
      }
    } catch (err) {
      alert("Failed to decline booking. Please try again.");
    }
  };
  const handleAccept = async (bookingId) => {

    try {
      const response = await fetch(
        `http://localhost:5000/api/bookings/accept-booking`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ booking_id: bookingId }),
        }
      );

      const result = await response.json();
      if (result.status === "success") {
        alert("Booking accepted successfully.");
        fetchBookings(activeTab); // Refresh the current tab to remove the declined job
      } else {
        alert(result.message);
      }
    } catch (err) {
      alert("Failed to accept booking. Please try again.");
    }
  };

  // Helper function to format the start time from the "start to end" string
  const formatStartTime = (timeString) => {
    if (!timeString) return "Time TBD";
    const startTimeStr = timeString.split(" to ")[0];
    const dateObj = new Date(startTimeStr);
    return dateObj.toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  return (
    <>
      <Usernav page="Bookings" />
      <div className="min-h-screen bg-transparent py-8 px-4 md:px-10">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            My Assignments
          </h1>

          {/* Tab Switcher */}
          <div className="flex gap-6 border-b border-gray-200 mb-8">
            {["pending", "history"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 text-sm font-semibold capitalize transition-all ${
                  activeTab === tab
                    ? "text-cyan-600 border-b-2 border-cyan-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab === "history" ? "Work History" : "Upcoming Jobs"}
              </button>
            ))}
          </div>

          {/* Bookings List */}
          <div className="space-y-4">
            {loading ? (
              <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-cyan-500"></div>
              </div>
            ) : bookings.length > 0 ? (
              bookings.map((job) => (
                <div
                  key={job.booking_id}
                  className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col md:flex-row justify-between gap-4">
                    {/* Left: Job Info */}
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3">
                        <span
                          className={`text-[10px] uppercase font-black px-2 py-1 rounded-full ${
                            job.status === "pending"
                              ? "bg-yellow-100 text-yellow-700"
                              : job.status === "completed"
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {job.status.replace("_", " ")}
                        </span>
                        <h2 className="font-bold text-gray-800 text-lg">
                          {job.service}
                        </h2>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600">
                        <div className="flex items-start gap-2">
                          <Clock
                            size={16}
                            className="mt-0.5 text-cyan-500 shrink-0"
                          />
                          <span>{formatStartTime(job.scheduled_time)}</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <MapPin
                            size={16}
                            className="mt-0.5 text-cyan-500 shrink-0"
                          />
                          <span className="line-clamp-2">
                            {job.customer.address}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone size={16} className="text-cyan-500 shrink-0" />
                          <span>{job.customer.phone}</span>
                        </div>
                        <div className="flex items-center gap-2 font-bold text-gray-900">
                          <IndianRupee
                            size={16}
                            className="text-green-600 shrink-0"
                          />
                          <span>Payout: ₹{job.payout.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex flex-row md:flex-col justify-end gap-3 border-t md:border-t-0 pt-4 md:pt-0 md:pl-6 border-gray-100 min-w-[140px]">
                      {job.status === "pending" && (
                        <>
                          <button className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-white px-6 py-2.5 rounded-lg font-bold text-sm transition-colors shadow-sm"
                          onClick={ () => handleAccept(job.booking_id)}>
                            Accept Job
                          </button>
                          <button
                            onClick={() => handleDecline(job.booking_id)}
                            className="flex-1 border-2 border-red-100 hover:bg-red-50 text-red-600 px-6 py-2 rounded-lg font-bold text-sm transition-colors"
                          >
                            Decline
                          </button>
                        </>
                      )}

                      {/* Add more buttons here later (e.g., "Mark as Done" for 'ongoing' jobs) */}

                      {activeTab === "history" && (
                        <div className="flex-1 flex items-center justify-end md:justify-center">
                          <span className="text-xs font-bold text-gray-400 uppercase">
                            Archived
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
                <Calendar className="mx-auto text-gray-300 mb-4" size={48} />
                <p className="text-gray-500 font-medium">
                  No {activeTab} bookings found.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default WorkerBookings;
