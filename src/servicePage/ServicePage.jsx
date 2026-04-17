import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // 1. Import it
import { categories } from "./data";

const ServicePage = () => {
  const navigate = useNavigate();
  // --- NEW: BACKEND DATA STATE ---
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- UI STATE ---
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(20000);
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState("recommended");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 18;

  // --- 1. FETCH DATA FROM FLASK BACKEND ---
  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        // Important: Replace 5000 with your actual Flask port if different
        const response = await axios.get("http://localhost:5000/get-services", {
          withCredentials: true, // MANDATORY: Sends the HttpOnly JWT cookie!
        });

        if (response.data.status === "success") {
          setProviders(response.data.data);
        } else {
          setError(response.data.message);
        }
      } catch (err) {
        // If it fails, they probably aren't logged in (No Cookie)
        setError(
          err.response?.data?.message || "Failed to load. Please log in first."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  // --- RESET TO PAGE 1 ON FILTER CHANGE ---
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, minPrice, maxPrice, minRating, sortBy]);

  // --- 2. FILTER LOGIC (Updated to match Backend JSON keys) ---
  const filteredProviders = providers.filter((provider) => {
    // Backend returns 'title' (e.g., "Deep Tissue Massage") and 'worker_name' (e.g., "by Alice")
    const matchesSearch =
      provider.worker_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      provider.title.toLowerCase().includes(searchTerm.toLowerCase());

    // Note: If your backend get-services doesn't return 'category', we skip this
    // or you can add logic to map service_id to a category.
    // Assuming backend returns a 'category' string for now, or we ignore it if "All".
    const matchesCategory =
      selectedCategory === "All" || provider.category === selectedCategory;

    const matchesPrice =
      provider.price >= minPrice && provider.price <= maxPrice;
    const matchesRating = provider.rating >= minRating;

    return matchesSearch && matchesCategory && matchesPrice && matchesRating;
  });

  // --- 3. SORT LOGIC ---
  const sortedAndFilteredProviders = [...filteredProviders].sort((a, b) => {
    if (sortBy === "price-asc") return a.price - b.price;
    if (sortBy === "price-desc") return b.price - a.price;
    if (sortBy === "rating-desc") return b.rating - a.rating;
    return 0; // recommended
  });

  // --- PAGINATION MATH ---
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProviders = sortedAndFilteredProviders.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(
    sortedAndFilteredProviders.length / itemsPerPage
  );

  // --- LOADING & ERROR UI ---
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-cyan-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-gray-950 gap-4">
        <h2 className="text-2xl font-bold text-red-500">Oops!</h2>
        <p className="text-gray-600 dark:text-gray-400">{error}</p>

        {/* 3. Use it in the button! */}
        <button
          onClick={() => navigate("/login")}
          className="px-6 py-2 bg-cyan-500 text-white rounded-lg font-bold"
        >
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors duration-300">
      <div className="max-w-7xl mx-auto p-4 md:p-8 flex flex-col md:flex-row gap-8 pt-10">
        {/* --- SIDEBAR: Filters --- */}
        <div className="w-full md:w-1/4 flex flex-col gap-8 bg-gray-50 dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 h-fit">
          <h2 className="text-2xl font-extrabold text-gray-800 dark:text-white">
            Filters
          </h2>

          {/* Category Filter */}
          <div className="flex flex-col gap-3">
            <h3 className="font-bold text-gray-600 dark:text-gray-400 uppercase text-xs tracking-widest">
              Categories
            </h3>
            {categories.map((category) => (
              <label
                key={category}
                className="flex items-center gap-3 cursor-pointer group"
              >
                <input
                  type="radio"
                  name="category"
                  value={category}
                  checked={selectedCategory === category}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="accent-cyan-500 w-5 h-5 cursor-pointer"
                />
                <span className="text-gray-700 dark:text-gray-300 font-medium group-hover:text-cyan-500 transition-colors">
                  {category}
                </span>
              </label>
            ))}
          </div>

          {/* Price Filter */}
          <div className="flex flex-col gap-3">
            <h3 className="font-bold text-gray-600 dark:text-gray-400 uppercase text-xs tracking-widest">
              Price Range
            </h3>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={minPrice}
                onChange={(e) => setMinPrice(Number(e.target.value))}
                className="w-full p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg dark:text-white focus:border-cyan-500 outline-none"
              />
              <span className="text-gray-400">-</span>
              <input
                type="number"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg dark:text-white focus:border-cyan-500 outline-none"
              />
            </div>
          </div>

          {/* Rating Filter */}
          <div className="flex flex-col gap-3">
            <h3 className="font-bold text-gray-600 dark:text-gray-400 uppercase text-xs tracking-widest">
              Min Rating
            </h3>
            <select
              value={minRating}
              onChange={(e) => setMinRating(Number(e.target.value))}
              className="w-full p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg dark:text-white focus:border-cyan-500 outline-none cursor-pointer"
            >
              <option value={0}>Any Rating</option>
              <option value={3}>3+ Stars</option>
              <option value={4}>4+ Stars</option>
              <option value={4.5}>4.5+ Stars</option>
            </select>
          </div>
        </div>

        {/* --- MAIN CONTENT --- */}
        <div className="w-full md:w-3/4 flex flex-col gap-6">
          <input
            type="text"
            placeholder="Search for services (e.g. Massage, Plumbing)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-4 rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 dark:text-white focus:border-cyan-500 outline-none shadow-sm transition-all"
          />

          {/* Results Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentProviders.length > 0 ? (
              currentProviders.map((provider) => (
                <div
                  key={`${provider.worker_id}-${provider.service_id}`}
                  className="group bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-4 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full"
                >
                  <div className="relative overflow-hidden rounded-xl h-48 mb-4">
                    {/* Using the Pravatar image we set up in the backend! */}
                    <img
                      src={provider.image}
                      alt={provider.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />

                    {/* Display exact distance from user */}
                    <div className="absolute top-2 left-2 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm px-2 py-1 rounded-md text-[10px] font-bold text-cyan-600 uppercase tracking-tighter">
                      {provider.distance_km} km away
                    </div>
                  </div>

                  <div className="flex flex-col flex-grow">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-1">
                      {provider.title}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-4">
                      {provider.worker_name}
                    </p>

                    <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-between items-end">
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-1">
                          <span className="text-yellow-500 text-lg">★</span>
                          <span className="font-bold text-gray-800 dark:text-gray-200">
                            {provider.rating}
                          </span>
                        </div>
                        <span className="text-[11px] text-gray-400 font-medium">
                          ({provider.reviewCount} reviews)
                        </span>
                      </div>
                      <div className="text-2xl font-black text-cyan-600">
                        ₹{provider.price}
                      </div>
                    </div>
                  </div>

                  {/* NOTE: We will wire this button up to POST /book-service next! */}
                  <button
                    onClick={() =>
                      console.log(
                        `Ready to book ${provider.worker_id} for ${provider.service_id}!`
                      )
                    }
                    className="w-full mt-5 py-3 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-white font-bold rounded-xl hover:bg-cyan-500 hover:text-white transition-all duration-300"
                  >
                    Book Now
                  </button>
                </div>
              ))
            ) : (
              <div className="col-span-full py-20 text-center bg-gray-50 dark:bg-gray-900 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-800">
                <p className="text-gray-500 dark:text-gray-400 font-bold text-xl">
                  No services match your filters.
                </p>
              </div>
            )}
          </div>

          {/* Pagination omitted for brevity, keeping your exact same logic! */}
        </div>
      </div>
    </div>
  );
};

export default ServicePage;
