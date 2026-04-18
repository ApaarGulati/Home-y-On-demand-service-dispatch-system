import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { categories } from "./data";
import { MapPin, Star, Search } from "lucide-react";

const ServicePage = () => {
  const navigate = useNavigate();

  // --- DATA & REFRESH STATE ---
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshData, setRefreshData] = useState(false);

  // --- FILTER STATE ---
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(20000);
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState("recommended");
  const [currentPage, setCurrentPage] = useState(1);

  // --- ADDRESS MODAL STATE ---
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [isSubmittingAddress, setIsSubmittingAddress] = useState(false);
  const [addressForm, setAddressForm] = useState({
    address_type: "home",
    street_line_1: "",
    street_line_2: "",
    city: "",
    state: "",
    postal_code: "",
    country: "India",
  });

  // --- NOTIFICATION STATE ---
  const [notification, setNotification] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
  });

  const showNotification = (title, message, type = "info") => {
    setNotification({ isOpen: true, title, message, type });
  };

  // --- 1. RESET PAGINATION ---
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, minPrice, maxPrice, minRating, sortBy]);

  // --- 2. FETCH SERVICES ---
  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        const url = new URL("http://localhost:5000/api/services/get-services");
        url.searchParams.append("page", currentPage);
        if (searchTerm) url.searchParams.append("search", searchTerm);
        if (selectedCategory !== "All")
          url.searchParams.append("category", selectedCategory);
        url.searchParams.append("min_price", minPrice);
        url.searchParams.append("max_price", maxPrice);
        if (minRating > 0) url.searchParams.append("min_rating", minRating);

        const response = await fetch(url.toString(), {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });

        const data = await response.json();

        if (data.status === "success") {
          setProviders(data.data);
          setError(null);
        } else {
          setError(data.message);
        }
      } catch (err) {
        setError(err.message || "Connection failed.");
      } finally {
        setLoading(false);
      }
    };

    const delayDebounceFn = setTimeout(() => fetchServices(), 300);
    return () => clearTimeout(delayDebounceFn);
  }, [
    searchTerm,
    selectedCategory,
    minPrice,
    maxPrice,
    minRating,
    currentPage,
    refreshData,
  ]);

  // --- 3. SEARCH SYNC ---
  useEffect(() => {
    const output = localStorage.getItem("Searchquery");
    if (output) {
      setSearchTerm(output);
      localStorage.removeItem("Searchquery");
    }
  }, []);

  // --- 4. ADDRESS SUBMIT ---
  const handleAddressSubmit = async () => {
    if (
      !addressForm.address_type ||
      !addressForm.street_line_1 ||
      !addressForm.city ||
      !addressForm.state ||
      !addressForm.postal_code
    ) {
      showNotification(
        "Missing Fields",
        "Please fill required fields (*)",
        "error"
      );
      return;
    }

    setIsSubmittingAddress(true);
    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/update-address",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(addressForm),
        }
      );

      const data = await response.json();
      if (data.status === "success") {
        setShowAddressModal(false);
        setError(null);
        setRefreshData(!refreshData);
        showNotification("Success", "Location updated!", "success");
      } else {
        showNotification("Error", data.message, "error");
      }
    } catch (err) {
      showNotification("Error", "Server connection failed.", "error");
    } finally {
      setIsSubmittingAddress(false);
    }
  };

  // --- 5. COMPONENT HELPERS ---
  const currentProviders = [...providers].sort((a, b) => {
    if (sortBy === "price-asc") return a.price - b.price;
    if (sortBy === "price-desc") return b.price - a.price;
    if (sortBy === "rating-desc") return b.rating - a.rating;
    return 0;
  });

  const renderAddressModal = () => (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-white dark:bg-gray-900 w-full max-w-lg rounded-3xl p-8 shadow-2xl border border-gray-100 dark:border-gray-800 animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-black mb-6 dark:text-white">
          Set Your Location
        </h2>
        <div className="space-y-4">
          <select
            name="address_type"
            value={addressForm.address_type}
            onChange={(e) =>
              setAddressForm({ ...addressForm, address_type: e.target.value })
            }
            className="w-full p-3 bg-gray-50 dark:bg-gray-800 border rounded-xl dark:text-white"
          >
            <option value="home">Home</option>
            <option value="work">Work</option>
          </select>
          <input
            type="text"
            placeholder="Street Line 1 *"
            value={addressForm.street_line_1}
            onChange={(e) =>
              setAddressForm({ ...addressForm, street_line_1: e.target.value })
            }
            className="w-full p-3 bg-gray-50 dark:bg-gray-800 border rounded-xl dark:text-white"
          />
          <input
            type="text"
            placeholder="Street Line 2"
            value={addressForm.street_line_2}
            onChange={(e) =>
              setAddressForm({ ...addressForm, street_line_2: e.target.value })
            }
            className="w-full p-3 bg-gray-50 dark:bg-gray-800 border rounded-xl dark:text-white"
          />
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="City *"
              value={addressForm.city}
              onChange={(e) =>
                setAddressForm({ ...addressForm, city: e.target.value })
              }
              className="w-full p-3 bg-gray-50 dark:bg-gray-800 border rounded-xl dark:text-white"
            />
            <input
              type="text"
              placeholder="State *"
              value={addressForm.state}
              onChange={(e) =>
                setAddressForm({ ...addressForm, state: e.target.value })
              }
              className="w-full p-3 bg-gray-50 dark:bg-gray-800 border rounded-xl dark:text-white"
            />
          </div>
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Pincode *"
              value={addressForm.postal_code}
              onChange={(e) =>
                setAddressForm({ ...addressForm, postal_code: e.target.value })
              }
              className="w-full p-3 bg-gray-50 dark:bg-gray-800 border rounded-xl dark:text-white"
            />
            <input
              type="text"
              placeholder="Country"
              value={addressForm.country}
              onChange={(e) =>
                setAddressForm({ ...addressForm, country: e.target.value })
              }
              className="w-full p-3 bg-gray-50 dark:bg-gray-800 border rounded-xl dark:text-white"
            />
          </div>
        </div>
        <div className="flex gap-3 mt-8">
          <button
            onClick={() => setShowAddressModal(false)}
            className="flex-1 py-3 font-bold text-gray-500 bg-gray-100 rounded-xl"
          >
            Cancel
          </button>
          <button
            onClick={handleAddressSubmit}
            disabled={isSubmittingAddress}
            className="flex-1 py-3 bg-cyan-500 text-white font-bold rounded-xl shadow-lg shadow-cyan-500/30"
          >
            {isSubmittingAddress ? "Saving..." : "Save Address"}
          </button>
        </div>
      </div>
    </div>
  );

  // --- 6. RENDER LOGIC ---
  if (loading && providers.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-cyan-500"></div>
      </div>
    );
  }

  if (error) {
    const isLocationError =
      error.includes("address") || error.includes("nearby workers");
    return (
      <div className="min-h-screen flex items-center justify-center bg-transparent p-4">
        {isLocationError ? (
          <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-3xl p-8 shadow-2xl text-center border dark:border-gray-800">
            <div className="bg-cyan-100 p-5 rounded-full text-cyan-600 mb-6 inline-block">
              <MapPin size={40} />
            </div>
            <h2 className="text-2xl font-black dark:text-white mb-3">
              Location Required
            </h2>
            <p className="text-gray-500 mb-8">
              We need your address to find professionals near you.
            </p>
            <button
              onClick={() => setShowAddressModal(true)}
              className="w-full py-4 bg-cyan-500 text-white rounded-2xl font-bold shadow-lg shadow-cyan-500/30"
            >
              Set Address Now
            </button>
          </div>
        ) : (
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-500 mb-4">
              Error: {error}
            </h2>
            <button
              onClick={() => navigate("/login")}
              className="px-6 py-2 bg-cyan-500 text-white rounded-lg font-bold"
            >
              Go to Login
            </button>
          </div>
        )}
        {showAddressModal && renderAddressModal()}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent transition-colors pt-10 relative">
      <div className="max-w-7xl mx-auto p-4 md:p-8 flex flex-col md:flex-row gap-8">
        {/* SIDEBAR */}
        <div className="w-full md:w-1/4 flex flex-col gap-8 bg-gray-50 dark:bg-gray-900 p-6 rounded-xl border dark:border-gray-800 h-fit">
          <h2 className="text-2xl font-extrabold dark:text-white">Filters</h2>
          <div className="flex flex-col gap-3">
            <h3 className="font-bold text-gray-400 uppercase text-xs tracking-widest">
              Categories
            </h3>
            {categories.map((cat) => (
              <label
                key={cat}
                className="flex items-center gap-3 cursor-pointer group"
              >
                <input
                  type="radio"
                  name="category"
                  checked={selectedCategory === cat}
                  onChange={() => setSelectedCategory(cat)}
                  className="accent-cyan-500 w-5 h-5"
                />
                <span className="text-gray-700 dark:text-gray-300 group-hover:text-cyan-500 transition-colors">
                  {cat}
                </span>
              </label>
            ))}
          </div>
          {/* Price & Rating filters here (same as previous) */}
        </div>

        {/* MAIN */}
        <div className="w-full md:w-3/4 flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              placeholder="Search for services..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 p-4 rounded-xl border dark:border-gray-800 bg-white dark:bg-gray-900 dark:text-white focus:border-cyan-500 outline-none"
            />
            <button
              onClick={() => setShowAddressModal(true)}
              className="flex items-center justify-center gap-2 bg-gray-900 text-white px-6 py-4 rounded-xl font-bold hover:bg-cyan-600 transition-colors"
            >
              <MapPin size={20} />
              Set Location
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentProviders.map((provider) => (
              <div
                key={`${provider.worker_id}-${provider.service_id}`}
                className="group bg-white dark:bg-gray-900 border dark:border-gray-800 rounded-2xl p-4 shadow-sm hover:shadow-xl transition-all"
              >
                <div className="relative overflow-hidden rounded-xl h-48 mb-4">
                  <img
                    src={provider.image}
                    alt={provider.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-duration-500"
                  />
                  <div className="absolute top-2 left-2 bg-white/90 px-2 py-1 rounded text-[10px] font-bold text-cyan-600">
                    {provider.distance_km} km away
                  </div>
                </div>
                <div className="flex flex-col flex-grow">
                  <h3 className="text-xl font-bold dark:text-white">
                    {provider.title}
                  </h3>
                  <p className="text-gray-500 text-sm mb-4">
                    {provider.worker_name}
                  </p>
                  <div className="mt-auto pt-4 border-t dark:border-gray-800 flex justify-between items-end">
                    <div className="flex items-center gap-1">
                      <Star
                        size={16}
                        className="text-yellow-500 fill-yellow-500"
                      />
                      <span className="font-bold dark:text-gray-200">
                        {provider.rating}
                      </span>
                    </div>
                    <div className="text-2xl font-black text-cyan-600">
                      ₹{provider.price}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() =>
                    navigate("/checkout", { state: { service: provider } })
                  }
                  className="w-full mt-5 py-3 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-white font-bold rounded-xl hover:bg-cyan-500 hover:text-white transition-all"
                >
                  Book Now
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showAddressModal && renderAddressModal()}

      {notification.isOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[110] p-4">
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 max-w-sm w-full text-center space-y-4">
            <h3
              className={`text-xl font-black ${
                notification.type === "error"
                  ? "text-red-500"
                  : "text-green-500"
              }`}
            >
              {notification.title}
            </h3>
            <p className="text-gray-500 text-sm">{notification.message}</p>
            <button
              onClick={() =>
                setNotification({ ...notification, isOpen: false })
              }
              className="w-full py-3 bg-cyan-500 text-white rounded-xl font-bold shadow-lg shadow-cyan-500/30"
            >
              Okay
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServicePage;
