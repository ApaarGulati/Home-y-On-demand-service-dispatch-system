import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Wallet as WalletIcon,
  MapPin,
  Phone,
  Mail,
  User as UserIcon,
  Camera,
} from "lucide-react";
import ScrollFadeIn from "../components/ScrollFadeIn";

const ProfilePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [balance, setBalance] = useState(0);

  // State for the actual saved data
  const [userData, setUserData] = useState({
    full_name: "",
    email: "",
    phone: "",
    address: "",
    current_location: "",
  });

  // State for the form while editing
  const [formData, setFormData] = useState({ ...userData });

  // --- 1. FETCH PROFILE ON MOUNT ---
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/auth/profile", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include", // Sends the JWT cookie
        });

        const data = await response.json();
        if (data.status === "success") {
          const profile = data.data;
          const initialData = {
            full_name: profile.name || "",
            email: profile.email || "",
            phone: profile.phone || "",
            address: profile.address || "",
            current_location: profile.location || "",
          };
          setUserData(initialData);
          setFormData(initialData);
          setBalance(profile.current_balance);
        } else {
          // If token is invalid or missing, redirect to login
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
        "http://localhost:5000/api/auth/update-profile",
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            name: formData.full_name,
            phone: formData.phone,
            address: formData.address,
            location: formData.current_location,
            // Note: Email is usually kept read-only for security
          }),
        }
      );

      const data = await response.json();
      if (data.status === "success") {
        setUserData({ ...formData });
        setIsEditing(false);
        alert("Profile updated successfully!");
      } else {
        alert(data.message || "Update failed");
      }
    } catch (err) {
      alert("Failed to connect to server");
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
      <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-2">
        {Icon && <Icon size={14} className="text-cyan-500" />} {label}
      </label>
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
          disabled={!isEditing || name === "email"} // Email is usually locked
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
    <div className="min-h-screen bg-transparent transition-colors duration-300 pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <ScrollFadeIn>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">
                My Profile
              </h1>
              <p className="text-gray-500 dark:text-gray-400 font-medium">
                Manage your personal information and wallet funds.
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
          <div className="mb-8 bg-linear-to-br from-cyan-500 to-cyan-500 rounded-3xl p-6 text-white shadow-xl flex flex-wrap items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-md">
                <WalletIcon size={32} />
              </div>
              <div>
                <p className="text-cyan-100 text-[10px] font-black uppercase tracking-widest opacity-80">
                  Wallet Balance
                </p>
                <h3 className="text-3xl font-black tracking-tighter">
                  ₹{balance}
                </h3>
              </div>
            </div>
            <button className="bg-white text-cyan-700 px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-cyan-50 transition-colors shadow-md">
              Add Funds
            </button>
          </div>
        </ScrollFadeIn>

        <ScrollFadeIn>
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl shadow-sm overflow-hidden flex flex-col md:flex-row">
            {/* Left Sidebar Profile Info */}
            <div className="w-full md:w-1/3 bg-gray-50 dark:bg-gray-800/50 p-8 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-gray-100 dark:border-gray-800">
              <div className="relative">
                <img
                  src={`https://ui-avatars.com/api/?name=${userData.full_name}&background=06b6d4&color=fff&size=150`}
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
                {userData.full_name || "User Name"}
              </h2>
              <span className="mt-1 px-3 py-1 bg-cyan-100 dark:bg-cyan-900/40 text-cyan-600 dark:text-cyan-400 rounded-full text-[10px] font-black uppercase tracking-tighter">
                Member Since 2026
              </span>
            </div>

            {/* Form Fields */}
            <div className="w-full md:w-2/3 p-8 flex flex-col gap-8">
              <section>
                <h3 className="text-sm font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <UserIcon size={16} /> Basic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <InputField label="Full Name" name="full_name" />
                  <InputField label="Email Address" name="email" type="email" />
                  <InputField label="Phone Number" name="phone" type="tel" />
                </div>
              </section>

              <section>
                <h3 className="text-sm font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <MapPin size={16} /> Location Details
                </h3>
                <div className="flex flex-col gap-5">
                  <InputField
                    label=""
                    name="address"
                    isTextArea={true}
                  />
                </div>
              </section>
            </div>
          </div>
        </ScrollFadeIn>
      </div>
    </div>
  );
};

export default ProfilePage;
