import React, { useState } from "react";
import Navbar from "./Navbar";
import { useNavigate } from "react-router-dom";
import MessageDialog from "./MessageDialog";


// Utility functions for validation
const isNumeric = (val) => !isNaN(val) && Number.isFinite(+val);
// Renamed to isNotAlpha for clearer logic logic
const isNotAlpha = (str) => !/^[A-Za-z]+$/.test(str);

const CreateAccount = () => {
  const navigate = useNavigate();

  // State management
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [userRole, setUserRole] = useState("consumer");
  const [firstname, setfirstname] = useState("");
  const [middlename, setmiddlename] = useState("");
  const [lastname, setlastname] = useState("");
  const [phonenum, setphonenum] = useState("");
  const [email, setemail] = useState("");
  const [password, setpassword] = useState("");

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





  // Replaced parameter passing with direct state access and added event (e)
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevents the default page reload

    // Check for empty required fields
    if (
      !location ||
      !firstname ||
      !phonenum ||
      !email ||
      !password
    ) {
      showAlert("No required fields should be left empty. Please ensure all fields are filled.");
      return;
    }

    // Location validation
    const arr = location.split(",");
    if (
      arr.length !== 2 ||
      !isNumeric(arr[0].trim()) ||
      !isNumeric(arr[1].trim())
    ) {
      showAlert(
        "Kindly enter a valid location in 'Latitude, Longitude' format (e.g., 28.5, 77.2)"
      );
      return;
    }

    // Name validation using the corrected isNotAlpha
    if (isNotAlpha(firstname)) {
      showAlert("Please enter a valid first and last name (letters only).");
      return;
    }

    // Phone validation
    if (phonenum.length !== 10 || !isNumeric(phonenum)) {
      showAlert("Please enter a valid 10-digit phone number.");
      return;
    }

    const payload = {
      email: email,
      password: password,
      role_type: userRole === "consumer" ? "app_user" : "worker",
      phone: parseInt(phonenum, 10), // Note: Standard practice is to send phones as strings, but kept as int if your backend requires it
      first_name: firstname,
      middle_name: middlename,
      last_name: lastname,
      longitude: parseFloat(arr[1].trim()),
      latitude: parseFloat(arr[0].trim()),
    };

    console.log("Connecting to the server and fetching response...", payload);

    try {
      const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const jresponse = await response.json();

      if (jresponse.status === "error") {
        showAlert(jresponse.message);
        return;
      }

      if (jresponse.status === "success") {
        showAlert(jresponse.message);
        navigate("/login");
      }
    } catch (error) {
      // Gracefully handle server downtime or network errors
      showAlert(
        "Could not connect to the server. Please check your connection or try again later."
      );
      console.error("Registration Error:", error);
    }


  }



  const handleGetLocation = () => {
    // 1. Prevent overlapping requests if we are already fetching
    if (loading) return;

    if (!navigator.geolocation) {
      showAlert("Geolocation is not supported by your browser");
      return;
    }

    setLoading(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        setLoading(false);
      },
      (error) => {
        setLoading(false);

        // Log the actual browser error to your console
        console.warn("Geolocation API Error:", error);

        // Handle the specific HTML5 Geolocation error codes
        switch (error.code) {
          case error.PERMISSION_DENIED:
            showAlert(
              "Location access was denied. Please allow location permissions in your browser settings."
            );
            break;
          case error.POSITION_UNAVAILABLE:
            showAlert(
              "Location information is unavailable. (If you see a 429 in the network tab, it causes this error)."
            );
            break;
          case error.TIMEOUT:
            showAlert(
              "The request to get your location timed out. Please try again."
            );
            break;
          default:
            showAlert("An unknown error occurred while fetching your location.");
            break;
        }
      },
      {
        // Optional: Tweak settings to use cached data to reduce network calls
        maximumAge: 60000, // Accept a location cached within the last 60 seconds
        timeout: 10000, // Stop trying after 10 seconds
        enableHighAccuracy: false, // Set to true if you need pinpoint accuracy, but false uses less battery/network
      }
    );
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen w-full flex flex-col items-center justify-center py-10 px-4">
        <div className="w-full max-w-2xl bg-white dark:bg-transparent p-6 md:p-10 rounded-3xl shadow-2xl flex flex-col gap-6">
          <h1 className="text-3xl font-extrabold dark:text-white text-center text-gray-800">
            Create Account
          </h1>

          {/* Form tag now handles the submission */}
          <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
            {/* Are you a? Section */}
            <div className="flex flex-col items-start w-full gap-2">
              <label className="ml-4 text-sm font-semibold dark:text-gray-300 text-gray-600">
                Are you a?
              </label>
              <div className="flex w-full gap-4">
                <button
                  type="button"
                  onClick={() => setUserRole("worker")}
                  className={`flex-1 py-3 rounded-full font-bold border-2 transition-all ${userRole === "worker"
                    ? "bg-cyan-500 border-cyan-500 text-white shadow-md"
                    : "bg-transparent border-gray-200 text-gray-500 hover:border-cyan-200"
                    }`}
                >
                  Worker
                </button>
                <button
                  type="button"
                  onClick={() => setUserRole("consumer")}
                  className={`flex-1 py-3 rounded-full font-bold border-2 transition-all ${userRole === "consumer"
                    ? "bg-cyan-500 border-cyan-500 text-white shadow-md"
                    : "bg-transparent border-gray-200 text-gray-500 hover:border-cyan-200"
                    }`}
                >
                  Consumer
                </button>
              </div>
            </div>

            {/* Names Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col items-start">
                <label className="ml-4 mb-1 text-sm font-semibold dark:text-gray-300 text-gray-600">
                  First Name
                </label>
                <input
                  type="text"
                  placeholder="First"
                  value={firstname}
                  onChange={(e) => setfirstname(e.target.value)}
                  className="bg-white dark:bg-gray-800 dark:text-white rounded-full px-5 w-full border-2 border-cyan-500 h-12 outline-none focus:ring-2 focus:ring-cyan-300"
                />
              </div>
              <div className="flex flex-col items-start">
                <label className="ml-4 mb-1 text-sm font-semibold dark:text-gray-300 text-gray-600">
                  Middle Name
                </label>
                <input
                  type="text"
                  placeholder="Middle"
                  value={middlename}
                  onChange={(e) => setmiddlename(e.target.value)}
                  className="bg-white dark:bg-gray-800 dark:text-white rounded-full px-5 w-full border-2 border-cyan-500 h-12 outline-none focus:ring-2 focus:ring-cyan-300"
                />
              </div>
              <div className="flex flex-col items-start">
                <label className="ml-4 mb-1 text-sm font-semibold dark:text-gray-300 text-gray-600">
                  Last Name
                </label>
                <input
                  type="text"
                  placeholder="Last"
                  value={lastname}
                  onChange={(e) => setlastname(e.target.value)}
                  className="bg-white dark:bg-gray-800 dark:text-white rounded-full px-5 w-full border-2 border-cyan-500 h-12 outline-none focus:ring-2 focus:ring-cyan-300"
                />
              </div>
            </div>

            {/* Location Field */}
            <div className="flex flex-col items-start w-full relative">
              <label className="ml-4 mb-1 text-sm font-semibold dark:text-gray-300 text-gray-600">
                Location
              </label>
              <div className="w-full relative">
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Lat, Lng or use GPS"
                  className="bg-white dark:bg-gray-800 dark:text-white rounded-full pl-5 pr-32 w-full border-2 border-cyan-500 h-12 outline-none"
                />
                <button
                  type="button"
                  onClick={handleGetLocation}
                  disabled={loading}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-cyan-500 text-white text-[10px] md:text-xs font-bold py-2 px-3 rounded-full hover:bg-cyan-600 transition-colors"
                >
                  {loading ? "..." : "📍 Use GPS"}
                </button>
              </div>
            </div>

            <div className="flex flex-col items-start w-full">
              <label className="ml-4 mb-1 text-sm font-semibold dark:text-gray-300 text-gray-600">
                Phone Number
              </label>
              <input
                type="text"
                placeholder="Enter your 10-digit phone number"
                value={phonenum}
                onChange={(e) => setphonenum(e.target.value)}
                className="bg-white dark:bg-gray-800 dark:text-white rounded-full px-5 w-full border-2 border-cyan-500 h-12 outline-none"
              />
            </div>

            <div className="flex flex-col items-start w-full">
              <label className="ml-4 mb-1 text-sm font-semibold dark:text-gray-300 text-gray-600">
                Email Address
              </label>
              <input
                type="email"
                placeholder="name@email.com"
                value={email}
                onChange={(e) => setemail(e.target.value)}
                className="bg-white dark:bg-gray-800 dark:text-white rounded-full px-5 w-full border-2 border-cyan-500 h-12 outline-none"
              />
            </div>

            <div className="flex flex-col items-start w-full">
              <label className="ml-4 mb-1 text-sm font-semibold dark:text-gray-300 text-gray-600">
                Password
              </label>
              <input
                type="password"
                placeholder="Create password"
                value={password}
                onChange={(e) => setpassword(e.target.value)}
                className="bg-white dark:bg-gray-800 dark:text-white rounded-full px-5 w-full border-2 border-cyan-500 h-12 outline-none"
              />
            </div>

            {/* Changed to type="submit" and removed onClick */}
            <button
              type="submit"
              className="bg-cyan-500 w-full h-14 text-white rounded-full font-bold text-lg cursor-pointer hover:bg-cyan-600 hover:shadow-lg transform active:scale-95 transition-all mt-4"
            >
              Create Account
            </button>
          </form>

          <div className="text-center">
            <span className="text-gray-500 dark:text-gray-400 text-sm">
              Already have an account?{" "}
            </span>
            <button
              className="text-cyan-500 font-bold underline cursor-pointer hover:text-cyan-700 text-sm"
              onClick={() => navigate("/login")}
            >
              Login
            </button>
          </div>
        </div>

      </div>
      <MessageDialog
        isOpen={dialog.isOpen}
        message={dialog.message}
        onOk={closeDialog}
      />
    </>
  );
};

export default CreateAccount;
