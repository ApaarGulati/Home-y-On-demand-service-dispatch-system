import React, { useState, useEffect } from "react";
import { Clock, MapPin, Phone, IndianRupee, Calendar } from "lucide-react";
import Usernav from "../components/Usernav";

const WorkerBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [activeTab, setActiveTab] = useState("pending");
  const [loading, setLoading] = useState(false);

  // --- CUSTOM MODAL STATE ---
  const [modal, setModal] = useState({
    isOpen: false,
    type: "alert", // 'alert', 'confirm', or 'prompt'
    title: "",
    message: "",
    inputValue: "0",
    onConfirm: null,
  });

  // Modal Helper Functions
  const showAlert = (message, title = "Notification") => {
    setModal({
      isOpen: true,
      type: "alert",
      title,
      message,
      inputValue: "",
      onConfirm: null,
    });
  };

  const showConfirm = (message, onConfirm, title = "Confirm Action") => {
    setModal({
      isOpen: true,
      type: "confirm",
      title,
      message,
      inputValue: "",
      onConfirm,
    });
  };

  const showPrompt = (
    message,
    defaultValue,
    onConfirm,
    title = "Input Required"
  ) => {
    setModal({
      isOpen: true,
      type: "prompt",
      title,
      message,
      inputValue: defaultValue,
      onConfirm,
    });
  };

  const closeModal = () => {
    setModal((prev) => ({ ...prev, isOpen: false }));
  };

  // --- 1. FETCH LIVE DATA ---
  const fetchBookings = async (status) => {
    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:5000/api/bookings/worker-bookings?status=${status}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
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

  // --- 2. ACTIONS ---

  // Accept Job
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
      if (result.status === "success") fetchBookings(activeTab);
      else showAlert(result.message, "Error");
    } catch (err) {
      showAlert("Failed to accept booking.", "Error");
    }
  };

  // Decline Job
  const handleDecline = (bookingId) => {
    showConfirm(
      "Are you sure you want to decline this booking? The user will be fully refunded.",
      async () => {
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
            showAlert("Booking declined successfully.", "Success");
            fetchBookings(activeTab);
          } else {
            showAlert(result.message, "Error");
          }
        } catch (err) {
          showAlert("Failed to decline booking.", "Error");
        }
      },
      "Decline Booking"
    );
  };

  // Start Work
  const handleStartWork = (bookingId) => {
    showConfirm(
      "Ready to start this job?",
      async () => {
        try {
          const response = await fetch(
            `http://localhost:5000/api/bookings/start-work`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify({ booking_id: bookingId }),
            }
          );
          const result = await response.json();
          if (result.status === "success") {
            fetchBookings(activeTab);
          } else {
            showAlert(result.message, "Error");
          }
        } catch (err) {
          showAlert("Failed to start work.", "Error");
        }
      },
      "Start Work"
    );
  };

  // Ask for Confirmation & Extra Charges
  const handleRequestCompletion = (bookingId) => {
    // 1. Show the prompt for extra charges
    showPrompt(
      "Enter any extra charges for materials or additional work (in ₹).\nLeave as 0 if there are no extra charges:",
      "0",
      (extraInput) => {
        // 2. Validate input
        const extraCharges = parseFloat(extraInput);
        if (isNaN(extraCharges) || extraCharges < 0) {
          showAlert(
            "Invalid amount. Please enter a valid positive number.",
            "Invalid Input"
          );
          return;
        }

        // 3. Chain into a confirmation popup
        const confirmMessage =
          extraCharges > 0
            ? `Send completion request to customer with ₹${extraCharges} in extra charges?`
            : `Send completion request to customer with NO extra charges?`;

        showConfirm(
          confirmMessage,
          async () => {
            // 4. Send to Backend
            try {
              const response = await fetch(
                `http://localhost:5000/api/bookings/request-completion`,
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  credentials: "include",
                  body: JSON.stringify({
                    booking_id: bookingId,
                    extra_charges: extraCharges,
                  }),
                }
              );

              const result = await response.json();
              if (result.status === "success") {
                showAlert("Completion request sent to customer!", "Success");
                fetchBookings(activeTab);
              } else {
                showAlert(result.message, "Error");
              }
            } catch (err) {
              showAlert("Failed to request completion.", "Error");
            }
          },
          "Confirm Request"
        );
      },
      "Extra Charges"
    );
  };

  const formatStartTime = (timeString) => {
    if (!timeString) return "Time TBD";
    const startTimeStr = timeString.split(" to ")[0];
    const dateObj = new Date(startTimeStr);
    return dateObj.toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const getTabLabel = (tab) => {
    if (tab === "pending") return "New Requests";
    if (tab === "active") return "Active Jobs";
    return "Work History";
  };

  return (
    <>
      <Usernav page="Bookings" />
      <div className="min-h-screen bg-transparent py-8 px-4 md:px-10">
        <div className="max-w-4xl mx-auto relative">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            My Assignments
          </h1>

          {/* Tab Switcher */}
          <div className="flex gap-6 border-b border-gray-200 mb-8 overflow-x-auto no-scrollbar">
            {["pending", "active", "history"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 text-sm font-semibold whitespace-nowrap transition-all ${
                  activeTab === tab
                    ? "text-cyan-600 border-b-2 border-cyan-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {getTabLabel(tab)}
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
                              : job.status === "accepted"
                              ? "bg-blue-100 text-blue-700"
                              : job.status === "ongoing"
                              ? "bg-purple-100 text-purple-700"
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
                      {/* Actions for PENDING jobs */}
                      {job.status === "pending" && (
                        <>
                          <button
                            onClick={() => handleAccept(job.booking_id)}
                            className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-white px-6 py-2.5 rounded-lg font-bold text-sm transition-colors shadow-sm"
                          >
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

                      {/* Actions for ACCEPTED jobs */}
                      {job.status === "accepted" && (
                        <button
                          onClick={() => handleStartWork(job.booking_id)}
                          className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-6 py-2.5 rounded-lg font-bold text-sm transition-colors shadow-sm"
                        >
                          Start Work
                        </button>
                      )}

                      {/* Actions for ONGOING jobs */}
                      {job.status === "ongoing" && (
                        <button
                          onClick={() =>
                            handleRequestCompletion(job.booking_id)
                          }
                          className="flex-1 bg-purple-500 hover:bg-purple-600 text-white px-6 py-2.5 rounded-lg font-bold text-sm transition-colors shadow-sm"
                        >
                          Ask Confirmation
                        </button>
                      )}

                      {/* Info for jobs waiting on User */}
                      {job.status === "pending_completion" && (
                        <div className="flex-1 flex items-center justify-end md:justify-center">
                          <span className="text-xs font-bold text-orange-500 text-center">
                            Waiting for user
                            <br />
                            to finalize & pay...
                          </span>
                        </div>
                      )}

                      {/* History Tab text */}
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

      {/* --- CUSTOM MODAL UI --- */}
      {modal.isOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-lg font-black text-gray-900">{modal.title}</h3>
            <p className="text-gray-600 text-sm whitespace-pre-wrap">
              {modal.message}
            </p>

            {/* Prompt Input Field */}
            {modal.type === "prompt" && (
              <div className="relative mt-2">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold">
                  ₹
                </span>
                <input
                  type="number"
                  value={modal.inputValue}
                  onChange={(e) =>
                    setModal({ ...modal, inputValue: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-xl py-3 pl-8 pr-4 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 font-bold text-gray-900"
                />
              </div>
            )}

            <div className="flex gap-3 pt-3">
              {/* Cancel Button (Hidden for standard alerts) */}
              {modal.type !== "alert" && (
                <button
                  onClick={closeModal}
                  className="flex-1 py-2.5 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
              )}
              {/* Confirm/OK Button */}
              <button
                onClick={() => {
                  const val = modal.inputValue;
                  const cb = modal.onConfirm;
                  closeModal(); // Close the current modal
                  if (cb) cb(val); // Execute the passed function
                }}
                className="flex-1 py-2.5 rounded-xl font-bold text-white bg-cyan-500 hover:bg-cyan-600 transition-colors shadow-lg shadow-cyan-500/30"
              >
                {modal.type === "alert" ? "OK" : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default WorkerBookings;
