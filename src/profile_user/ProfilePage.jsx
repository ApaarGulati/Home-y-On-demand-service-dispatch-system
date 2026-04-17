import React, { useState } from "react";
import ScrollFadeIn from "../components/ScrollFadeIn";

const ProfilePage = () => {
  // --- MOCK DATA (Mapped to ACCOUNT and USER tables) ---
  // In a real app, you would fetch this from your backend on mount.
  const [userData, setUserData] = useState({
    full_name: "Rahul Sharma",
    email: "rahul.sharma@example.com",
    phone: "+91 9876543210",
    address: "Flat 402, Sunshine Heights, Indirapuram",
    current_location: "Ghaziabad, Uttar Pradesh",
  });

  // --- STATE ---
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ ...userData });

  // --- HANDLERS ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    // Here you would normally send an UPDATE request to your backend
    setUserData({ ...formData });
    setIsEditing(false);
  };

  const handleCancel = () => {
    // Revert form data back to saved user data
    setFormData({ ...userData });
    setIsEditing(false);
  };

  // Helper for rendering inputs cleanly
  const InputField = ({ label, name, type = "text", isTextArea = false }) => (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
        {label}
      </label>
      {isTextArea ? (
        <textarea
          name={name}
          value={formData[name]}
          onChange={handleInputChange}
          disabled={!isEditing}
          rows="3"
          className={`p-3 rounded-xl border ${
            isEditing
              ? "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:border-cyan-500 focus:outline-none dark:text-white"
              : "bg-gray-50 dark:bg-gray-900 border-transparent text-gray-800 dark:text-gray-200 cursor-not-allowed"
          } transition-all resize-none`}
        />
      ) : (
        <input
          type={type}
          name={name}
          value={formData[name]}
          onChange={handleInputChange}
          disabled={!isEditing}
          className={`p-3 rounded-xl border ${
            isEditing
              ? "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:border-cyan-500 focus:outline-none dark:text-white"
              : "bg-gray-50 dark:bg-gray-900 border-transparent text-gray-800 dark:text-gray-200 cursor-not-allowed"
          } transition-all`}
        />
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-transparent transition-colors duration-300 pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <ScrollFadeIn>
          <div className="flex justify-between items-end mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">
                My Profile
              </h1>
              <p className="text-gray-500 dark:text-gray-400 font-medium">
                Manage your personal information and address.
              </p>
            </div>

            {/* Edit / Save Action Buttons */}
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-400 px-5 py-2 rounded-lg font-bold hover:bg-cyan-200 dark:hover:bg-cyan-900/60 transition-colors"
              >
                Edit Profile
              </button>
            ) : (
              <div className="flex gap-3">
                <button
                  onClick={handleCancel}
                  className="bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-300 px-5 py-2 rounded-lg font-bold hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="bg-cyan-500 text-white px-5 py-2 rounded-lg font-bold hover:bg-cyan-600 transition-colors shadow-lg shadow-cyan-500/30"
                >
                  Save Changes
                </button>
              </div>
            )}
          </div>
        </ScrollFadeIn>

        <ScrollFadeIn>
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl shadow-sm overflow-hidden flex flex-col md:flex-row">
            {/* Left Column: Avatar & Quick Info */}
            <div className="w-full md:w-1/3 bg-gray-50 dark:bg-gray-800/50 p-8 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-gray-100 dark:border-gray-800">
              <div className="relative">
                <img
                  src="https://i.pravatar.cc/150?img=11"
                  alt="Profile"
                  className="w-32 h-32 rounded-full object-cover border-4 border-white dark:border-gray-800 shadow-md"
                />
                {isEditing && (
                  <button className="absolute bottom-0 right-0 bg-cyan-500 text-white p-2 rounded-full shadow-lg hover:bg-cyan-600 transition-colors">
                    📷
                  </button>
                )}
              </div>
              <h2 className="mt-4 text-xl font-bold text-gray-900 dark:text-white">
                {userData.full_name}
              </h2>
              <span className="mt-1 px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full text-xs font-bold uppercase tracking-wider">
                Customer
              </span>
            </div>

            {/* Right Column: Form Fields */}
            <div className="w-full md:w-2/3 p-8 flex flex-col gap-6">
              {/* Personal Details Section */}
              <div>
                <h3 className="text-lg font-bold text-gray-800 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-2 mb-4">
                  Personal Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField label="Full Name" name="full_name" />
                  <InputField label="Email Address" name="email" type="email" />
                  <InputField label="Phone Number" name="phone" type="tel" />
                </div>
              </div>

              {/* Location Details Section */}
              <div className="mt-2">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-2 mb-4">
                  Location Details
                </h3>
                <div className="flex flex-col gap-4">
                  <InputField
                    label="Street Address"
                    name="address"
                    isTextArea={true}
                  />
                  <InputField label="City / Region" name="current_location" />
                </div>
              </div>
            </div>
          </div>
        </ScrollFadeIn>
      </div>
    </div>
  );
};

export default ProfilePage;
