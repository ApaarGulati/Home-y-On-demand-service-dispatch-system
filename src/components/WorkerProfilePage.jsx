import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Wallet as WalletIcon,
  MapPin,
  Phone,
  Mail,
  User as UserIcon,
  Camera,
  Briefcase,
} from "lucide-react";
import ScrollFadeIn from "../components/ScrollFadeIn";

const WorkerProfilePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [balance, setBalance] = useState(0);
  const [services, setServices] = useState([]);
  const [isProcessingWithdrawal, setIsProcessingWithdrawal] = useState(false);

  // --- CUSTOM POPUP STATE ---
  const [popup, setPopup] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "info", // 'info', 'success', 'error', 'confirm'
    onConfirm: null,
  });

  const showPopup = (title, message, type = "info", onConfirm = null) => {
    setPopup({ isOpen: true, title, message, type, onConfirm });
  };

  const closePopup = () => {
    setPopup({ ...popup, isOpen: false });
  };

  // State for the actual saved data
  const [userData, setUserData] = useState({
    full_name: "",
    email: "",
    phone: "",
    profile_pic: "",
  });

  // State for the form while editing
  const [formData, setFormData] = useState({ ...userData });

  // --- 1. FETCH PROFILE ON MOUNT ---
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/auth/workerprofile",
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
          }
        );

        const data = await response.json();
        if (data.status === "success") {
          const profile = data.data;
          const initialData = {
            full_name: profile.name || "",
            email: profile.email || "",
            phone: profile.phone || "",
            profile_pic: profile.profile_pic || "",
          };
          setUserData(initialData);
          setFormData(initialData);
          setBalance(profile.current_balance);
          setServices(profile.services || []);
        } else {
          navigate("/login");
        }
      } catch (err) {
        console.error("Profile fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [navigate]);

  // --- 2. UPDATE PROFILE HANDLER ---
  const handleSave = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/update-worker-profile",
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            name: formData.full_name,
            phone: formData.phone,
          }),
        }
      );

      const data = await response.json();
      if (data.status === "success") {
        setUserData({ ...formData });
        setIsEditing(false);
        showPopup("Success", "Profile updated successfully!", "success");
      } else {
        showPopup("Error", data.message || "Update failed", "error");
      }
    } catch (err) {
      showPopup("Error", "Failed to connect to server.", "error");
    }
  };

  // --- 3. WITHDRAW FUNDS API HANDLER ---
  const triggerWithdrawal = () => {
    if (Number(balance) <= 0) {
      showPopup(
        "Notice",
        "You have no earnings available to withdraw.",
        "info"
      );
      return;
    }

    // Ask for confirmation using our custom popup
    showPopup(
      "Confirm Withdrawal",
      `Are you sure you want to withdraw your entire balance of ₹${Number(
        balance
      ).toFixed(2)} to your bank account?`,
      "confirm",
      executeWithdrawal // Pass the function to run if they click Confirm
    );
  };

  const executeWithdrawal = async () => {
    setIsProcessingWithdrawal(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/wallet/withdraw-funds",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );

      const data = await response.json();

      if (data.status === "success") {
        setBalance(data.new_balance); // Instantly updates UI to ₹0.00
        showPopup("Success", data.message, "success");
      } else {
        showPopup("Withdrawal Failed", data.message, "error");
      }
    } catch (err) {
      showPopup(
        "Error",
        "Failed to process withdrawal. Please try again.",
        "error"
      );
    } finally {
      setIsProcessingWithdrawal(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCancel = () => {
    setFormData({ ...userData });
    setIsEditing(false);
  };

  const InputField = ({
    label,
    name,
    type = "text",
    isTextArea = false,
    icon: Icon,
  }) => (
    <div className="flex flex-col gap-2">
      {label && (
        <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-2">
          {Icon && <Icon size={14} className="text-cyan-500" />} {label}
        </label>
      )}
      {isTextArea ? (
        <textarea
          name={name}
          value={formData[name]}
          onChange={handleInputChange}
          disabled={!isEditing}
          rows="3"
          className={`p-3 rounded-xl border transition-all resize-none ${
            isEditing
              ? "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:border-cyan-500 outline-none dark:text-white"
              : "bg-gray-50 dark:bg-gray-900 border-transparent text-gray-800 dark:text-gray-200 cursor-not-allowed"
          }`}
        />
      ) : (
        <input
          type={type}
          name={name}
          value={formData[name]}
          onChange={handleInputChange}
          disabled={!isEditing || name === "email"}
          className={`p-3 rounded-xl border transition-all ${
            isEditing && name !== "email"
              ? "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:border-cyan-500 outline-none dark:text-white"
              : "bg-gray-50 dark:bg-gray-900 border-transparent text-gray-800 dark:text-gray-200 cursor-not-allowed"
          }`}
        />
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-cyan-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent transition-colors duration-300 pt-24 pb-16 relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <ScrollFadeIn>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">
                Professional Profile
              </h1>
              <p className="text-gray-500 dark:text-gray-400 font-medium">
                Manage your service details, personal info, and earnings.
              </p>
            </div>

            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="bg-cyan-500 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-cyan-600 transition-all shadow-lg shadow-cyan-500/20 active:scale-95"
              >
                Edit Profile
              </button>
            ) : (
              <div className="flex gap-3">
                <button
                  onClick={handleCancel}
                  className="bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-5 py-2 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="bg-cyan-500 text-white px-5 py-2 rounded-xl font-bold shadow-lg shadow-cyan-500/30"
                >
                  Save Changes
                </button>
              </div>
            )}
          </div>
        </ScrollFadeIn>

        {/* --- WALLET SECTION --- */}
        <ScrollFadeIn>
          <div className="mb-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-3xl p-6 text-white shadow-xl flex flex-wrap items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-md">
                <WalletIcon size={32} />
              </div>
              <div>
                <p className="text-cyan-100 text-[10px] font-black uppercase tracking-widest opacity-80">
                  Available Earnings
                </p>
                <h3 className="text-3xl font-black tracking-tighter">
                  ₹{Number(balance).toFixed(2)}
                </h3>
              </div>
            </div>
            {/* UPDATED BUTTON */}
            <button
              onClick={triggerWithdrawal}
              disabled={isProcessingWithdrawal || Number(balance) <= 0}
              className={`bg-white text-cyan-700 px-6 py-2.5 rounded-xl font-bold text-sm shadow-md transition-colors ${
                isProcessingWithdrawal || Number(balance) <= 0
                  ? "opacity-60 cursor-not-allowed"
                  : "hover:bg-cyan-50"
              }`}
            >
              {isProcessingWithdrawal ? "Processing..." : "Withdraw Funds"}
            </button>
          </div>
        </ScrollFadeIn>

        <ScrollFadeIn>
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl shadow-sm overflow-hidden flex flex-col md:flex-row">
            {/* Left Sidebar Profile Info */}
            <div className="w-full md:w-1/3 bg-gray-50 dark:bg-gray-800/50 p-8 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-gray-100 dark:border-gray-800">
              <div className="relative">
                <img
                  src={
                    userData.profile_pic ||
                    `https://ui-avatars.com/api/?name=${userData.full_name}&background=06b6d4&color=fff&size=150`
                  }
                  alt="Profile"
                  className="w-32 h-32 rounded-full object-cover border-4 border-white dark:border-gray-900 shadow-lg"
                />
                {isEditing && (
                  <button className="absolute bottom-0 right-0 bg-cyan-500 text-white p-2 rounded-full shadow-lg hover:bg-cyan-600 transition-transform active:scale-90">
                    <Camera size={16} />
                  </button>
                )}
              </div>
              <h2 className="mt-4 text-xl font-bold text-gray-900 dark:text-white text-center leading-tight">
                {userData.full_name || "Worker Name"}
              </h2>
              <span className="mt-1 px-3 py-1 bg-cyan-100 dark:bg-cyan-900/40 text-cyan-600 dark:text-cyan-400 rounded-full text-[10px] font-black uppercase tracking-tighter">
                Verified Professional
              </span>
            </div>

            {/* Form Fields & Services */}
            <div className="w-full md:w-2/3 p-8 flex flex-col gap-8">
              <section>
                <h3 className="text-sm font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <UserIcon size={16} /> Basic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <InputField label="Full Name" name="full_name" />
                  <InputField label="Phone Number" name="phone" type="tel" />
                </div>
              </section>

              {/* Services Provided Section */}
              <section className="border-t border-gray-100 dark:border-gray-800 pt-6">
                <h3 className="text-sm font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Briefcase size={16} /> Services Provided
                </h3>

                {services.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {services.map((service, index) => (
                      <div
                        key={index}
                        className="bg-cyan-50 border border-cyan-100 text-cyan-700 dark:bg-cyan-900/20 dark:border-cyan-800/50 dark:text-cyan-300 px-4 py-3 rounded-xl flex flex-col gap-1"
                      >
                        <div className="flex items-center gap-2 font-bold text-sm">
                          <span className="w-2 h-2 rounded-full bg-cyan-500 shrink-0"></span>
                          {service.name || service}
                        </div>
                        {service.price !== undefined && (
                          <span className="text-[11px] font-black uppercase opacity-70 ml-4 tracking-widest">
                            ₹{service.price} / {service.type?.replace("_", " ")}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                      No services linked to this profile yet.
                    </p>
                  </div>
                )}
              </section>
            </div>
          </div>
        </ScrollFadeIn>
      </div>

      {/* --- CUSTOM POPUP UI --- */}
      {popup.isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity">
          <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-sm p-8 space-y-6 animate-in fade-in zoom-in-95 duration-200 border border-gray-100 dark:border-gray-800 text-center">
            <h3
              className={`text-xl font-black ${
                popup.type === "error"
                  ? "text-red-500"
                  : popup.type === "success"
                  ? "text-green-500"
                  : "text-gray-900 dark:text-white"
              }`}
            >
              {popup.title}
            </h3>

            <p className="text-gray-600 dark:text-gray-300 text-sm whitespace-pre-wrap">
              {popup.message}
            </p>

            <div className="flex gap-3 pt-2">
              {popup.type === "confirm" ? (
                <>
                  <button
                    onClick={closePopup}
                    className="flex-1 py-3 rounded-xl font-bold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      closePopup();
                      if (popup.onConfirm) popup.onConfirm();
                    }}
                    className="flex-1 py-3 rounded-xl font-bold text-white bg-cyan-500 hover:bg-cyan-600 transition-colors shadow-lg shadow-cyan-500/30"
                  >
                    Yes, Withdraw
                  </button>
                </>
              ) : (
                <button
                  onClick={closePopup}
                  className="w-full py-3 rounded-xl font-bold text-white bg-cyan-500 hover:bg-cyan-600 transition-colors shadow-lg shadow-cyan-500/30"
                >
                  Okay
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkerProfilePage;
