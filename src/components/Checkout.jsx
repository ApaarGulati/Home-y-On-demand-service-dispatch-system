import React, { useState } from "react";
import {
  Ticket,
  CreditCard,
  Store,
  Calendar,
  Clock,
  ChevronLeft,
  Timer,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import MessageDialog from "./MessageDialog";



const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const service = location.state?.service;

  // --- States ---
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);
  const [bookingDate, setBookingDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [bookingTime, setBookingTime] = useState("10:00");
  const [duration, setDuration] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [dialog, setdialog] = useState({ isOpen: false, message: "" });

  const showAlert = (string) => {
    setDialog({
      isOpen: true,
      message: string
    });
  };

  const closeDialog = () => {
    setDialog({ ...dialog, isOpen: false });
  };

  // Safety check for direct URL access
  if (!service) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-neutral-950">
        <h2 className="text-2xl font-bold dark:text-white mb-4">
          No service selected
        </h2>
        <button
          onClick={() => navigate("/services")}
          className="px-6 py-2 bg-cyan-500 text-white rounded-xl font-bold"
        >
          Return to Marketplace
        </button>
      </div>
    );
  }

  const totalPrice = service.price - discount;

  const handleApplyCoupon = () => {
    if (coupon.toUpperCase() === "SAVE100") {
      setDiscount(100);
      showAlert("Coupon Applied! ₹100 discounted. ")
    } else {
      showAlert("Invalid Coupon code")
    }
  };

  const handlePayNow = async () => {
    try {
      setIsSubmitting(true);

      // 1. Construct Start Time (ISO Format)
      const start = new Date(`${bookingDate}T${bookingTime}:00`);

      // 2. Calculate End Time (Handling date rollover)
      const end = new Date(start.getTime());
      end.setHours(start.getHours() + Number(duration));

      const payload = {
        worker_id: service.worker_id,
        service_id: service.service_id,
        sched_start: start.toISOString().replace("Z", ""), // "YYYY-MM-DDTHH:MM:SS"
        sched_end: end.toISOString().replace("Z", ""),
      };

      // URL updated to match your @bookings_bp.route('/book-service')
      const response = await fetch(
        "http://localhost:5000/api/bookings/book-service",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (response.ok && data.status === "success") {
        navigate("/home");
      } else {
        // This catches 401 Unauthorized or 403 Forbidden (Role Issues)
        showAlert(data.message || `Error ${response.status}: Booking failed.`);
      }
    } catch (err) {
      console.error("Checkout Error:", err);
      showAlert("Network Error: Could not connect to backend.")
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center py-10 px-4 bg-gray-50 dark:bg-neutral-950">
      <button
        onClick={() => navigate("/services")}
        className="absolute top-6 left-6 flex items-center gap-2 text-gray-500 hover:text-cyan-500 font-bold"
      >
        <ChevronLeft size={20} /> Back to Services
      </button>

      <div className="w-full max-w-xl bg-white dark:bg-neutral-900 p-8 md:p-10 rounded-3xl shadow-2xl flex flex-col gap-8 border border-gray-100 dark:border-neutral-800">
        <h1 className="text-3xl font-black dark:text-white text-center text-gray-800">
          Finalize Booking
        </h1>

        {/* Service Details Card */}
        <div className="p-5 rounded-2xl bg-cyan-50/50 dark:bg-cyan-950/20 border border-cyan-100 dark:border-cyan-900/50">
          <p className="text-[10px] text-cyan-600 dark:text-cyan-400 uppercase tracking-widest font-black mb-1">
            Provider Details
          </p>
          <h2 className="text-xl font-bold dark:text-white">{service.title}</h2>
          <div className="flex items-center gap-2 mt-1 text-gray-600 dark:text-gray-300">
            <Store size={16} className="text-cyan-500" />
            <span className="text-sm font-semibold">{service.worker_name}</span>
          </div>
        </div>

        {/* Date, Time, and Duration Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold uppercase tracking-widest text-gray-500">
              Appointment Date
            </label>
            <div className="relative">
              <Calendar
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="date"
                value={bookingDate}
                onChange={(e) => setBookingDate(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold uppercase tracking-widest text-gray-500">
              Start Time
            </label>
            <div className="relative">
              <Clock
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="time"
                value={bookingTime}
                onChange={(e) => setBookingTime(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2 md:col-span-2">
            <label className="text-xs font-bold uppercase tracking-widest text-gray-500">
              Estimated Assistance (Hours)
            </label>
            <div className="relative">
              <Timer
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white outline-none focus:ring-2 focus:ring-cyan-500 appearance-none cursor-pointer"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((h) => (
                  <option key={h} value={h}>
                    {h} {h === 1 ? "Hour" : "Hours"}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Coupon Section */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold uppercase tracking-widest text-gray-500 ml-1">
            Coupon Code
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Ticket
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder="SAVE100"
                value={coupon}
                onChange={(e) => setCoupon(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white focus:ring-2 focus:ring-cyan-500 outline-none"
              />
            </div>
            <button
              onClick={handleApplyCoupon}
              className="px-6 py-3 bg-neutral-800 dark:bg-white dark:text-black text-white font-bold rounded-xl hover:opacity-90 transition-opacity"
            >
              Apply
            </button>
          </div>
        </div>

        {/* Pricing & Booking Button */}
        <div className="flex flex-col gap-4 border-t border-gray-100 dark:border-neutral-800 pt-6">
          <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-neutral-800/50 rounded-2xl">
            <div className="flex flex-col">
              <span className="text-xs text-gray-400 font-bold uppercase">
                Total Price
              </span>
              <span className="text-3xl font-black text-cyan-600">
                ₹{totalPrice.toFixed(2)}
              </span>
            </div>
            {discount > 0 && (
              <span className="text-xs font-bold text-emerald-500 bg-emerald-100 dark:bg-emerald-900/20 px-3 py-1 rounded-full">
                SAVING ₹{discount}
              </span>
            )}
          </div>

          <button
            disabled={isSubmitting}
            onClick={handlePayNow}
            className={`w-full py-4 bg-cyan-500 hover:bg-cyan-600 text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-3 shadow-lg shadow-cyan-500/20 transition-all ${isSubmitting ? "opacity-70 cursor-not-allowed" : "active:scale-95"
              }`}
          >
            {isSubmitting ? (
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-white"></div>
            ) : (
              <>
                <CreditCard size={22} /> Confirm & Pay Now
              </>
            )}
          </button>
        </div>
      </div>
      <MessageDialog
        isOpen={dialog.isOpen}
        message={dialog.message}
        onOk={closeDialog}
      />
    </div>
  );
};

export default Checkout;
