import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Loader2, AlertCircle, X } from "lucide-react";
import Usernav from "./Usernav";
import ScrollFadeIn from "./ScrollFadeIn";
import { AnimatedInput } from "./AnimatedInput";
import Carousel from "./Carousel";
import Footer from "./Footer";
import search from "../assets/search.svg";
import MessageDialog from './MessageDialog';

const Home = () => {
    const wordarr = [
        "Search for massages",
        "Search for Servicing",
        "Search for Facials",
    ];
    const navigate = useNavigate();

    // --- UI & DATA STATES ---
    const [query, setquery] = useState("");
    const [isUser, setisUser] = useState(true);
    const [loadingSkills, setLoadingSkills] = useState(false);
    const [skills, setSkills] = useState([]);

    // --- PRICING MODAL STATES ---
    const [showPriceModal, setShowPriceModal] = useState(false);
    const [selectedSkillId, setSelectedSkillId] = useState(null);
    const [pricing, setPricing] = useState({ price: "", type: "fixed" });


    const [dialog, setDialog] = useState({ isOpen: false, message: "" });



    const showAlert = (string) => {
        setDialog({
            isOpen: true,
            message: string
        });
    };

    const closeDialog = () => {
        setDialog({ ...dialog, isOpen: false });
    };

    // --- 1. INITIAL LOAD ---
    useEffect(() => {
        const role = localStorage.getItem("userRole");
        const userType = role === "app_user";
        setisUser(userType);

        if (!userType) {
            fetchInitialSkills();
        }
    }, []);

    const fetchInitialSkills = async () => {
        setLoadingSkills(true);
        try {
            const allRes = await fetch(
                "http://localhost:5000/api/services/get-all-services-list"
            );
            const allData = await allRes.json();

            const myRes = await fetch(
                "http://localhost:5000/api/services/my-services",
                {
                    credentials: "include",
                }
            );
            const myData = await myRes.json();

            const myIds = myData.data.map((s) => s.service_id);

            const merged = allData.data.map((s) => ({
                id: s.service_id,
                name: s.service_name,
                completed: myIds.includes(s.service_id),
            }));

            setSkills(merged);
        } catch (err) {
            console.error("Failed to load skills:", err);
        } finally {
            setLoadingSkills(false);
        }
    };

    // --- 2. TOGGLE FLOW ---
    const toggleSkill = (skillId, currentlyCompleted) => {
        if (currentlyCompleted) {
            // If already added, remove it immediately
            executeToggle(skillId, true);
        } else {
            // If adding, open the price modal first
            setSelectedSkillId(skillId);
            setShowPriceModal(true);
        }
    };

    const handlePriceSubmit = () => {
        if (!pricing.price || pricing.price <= 0) {
            showAlert("Please enter a valid price");
            return;
        }
        executeToggle(selectedSkillId, false, pricing);
        setShowPriceModal(false);
        setPricing({ price: "", type: "fixed" });
    };

    const executeToggle = async (
        skillId,
        currentlyCompleted,
        priceData = null
    ) => {
        const endpoint = currentlyCompleted ? "remove-service" : "add-service";
        const method = currentlyCompleted ? "DELETE" : "POST";

        // Optimistic Update
        setSkills((prev) =>
            prev.map((s) =>
                s.id === skillId ? { ...s, completed: !s.completed } : s
            )
        );

        try {
            const body = { service_id: skillId };
            if (priceData) {
                body.base_price = priceData.price;
                body.service_type = priceData.type;
            }

            const res = await fetch(
                `http://localhost:5000/api/services/${endpoint}`,
                {
                    method: method,
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify(body),
                }
            );

            const data = await res.json();
            if (data.status !== "success") {
                // Revert UI if backend fails
                setSkills((prev) =>
                    prev.map((s) =>
                        s.id === skillId ? { ...s, completed: currentlyCompleted } : s
                    )
                );
            }
        } catch (err) {
            setSkills((prev) =>
                prev.map((s) =>
                    s.id === skillId ? { ...s, completed: currentlyCompleted } : s
                )
            );
        }
    };

    const handlesearch = (input) => {
        localStorage.setItem("Searchquery", input);
        navigate("/services");
    };

    const completedCount = skills.filter((s) => s.completed).length;

    return (
        <>
            <Usernav page="Home" />
            <ScrollFadeIn>
                <div className="w-full h-100 flex flex-row flex-wrap justify-center items-center gap-4 bg-transparent pt-10">
                    {isUser ? (
                        <>
                            <p className="text-center text-7xl font-extrabold dark:text-white leading-tight">
                                Home services at{" "}
                            </p>
                            <p className="text-center text-cyan-500 text-6xl font-extrabold">
                                your doorstep
                            </p>
                        </>
                    ) : (
                        <>
                            <p className="text-center text-7xl font-extrabold dark:text-white">
                                Own your craft.
                            </p>
                            <p className="text-center text-cyan-500 text-6xl font-extrabold">
                                Own your time.
                            </p>
                        </>
                    )}
                </div>

                {isUser && (
                    <div className="flex flex-row flex-wrap gap-4 justify-center mt-5">
                        <AnimatedInput
                            type="text"
                            value={query}
                            onChange={(e) => setquery(e.target.value)}
                            className="w-100 h-15 pl-2 text-[20px] rounded-xl border border-gray-400 bg-white focus:outline-2 focus:outline-cyan-500 focus:outline-offset-4 focus:border focus:border-cyan-500"
                            placeholders={wordarr}
                        />
                        <button
                            className="bg-cyan-500 w-15 h-15 text-center text-white rounded-full flex items-center justify-center font-bold cursor-pointer hover:bg-cyan-700 transition-colors"
                            onClick={() => handlesearch(query)}
                        >
                            <img
                                src={search}
                                className="object-contain h-10 w-10"
                                alt="search"
                            />
                        </button>
                    </div>
                )}
            </ScrollFadeIn>

            {isUser ? (
                <div className="mt-10 space-y-20">
                    <ScrollFadeIn>
                        <Carousel text="Recommended for you" />
                    </ScrollFadeIn>
                    <ScrollFadeIn>
                        <Carousel text="Quickies" />
                    </ScrollFadeIn>
                    <ScrollFadeIn>
                        <Carousel text="Trending Services" />
                    </ScrollFadeIn>
                </div>
            ) : (
                <ScrollFadeIn>
                    <div className="max-w-md mx-auto my-10 bg-white dark:bg-gray-950 rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800">
                        <div className="p-8 text-black dark:text-white border-b dark:border-gray-800">
                            <h2 className="text-2xl font-black mb-1 tracking-tight">
                                Manage Skillset
                            </h2>
                            <p className="text-gray-400 text-sm font-medium">
                                {loadingSkills
                                    ? "Loading services..."
                                    : `${completedCount} active skills`}
                            </p>
                            {!loadingSkills && (
                                <div className="w-full bg-gray-100 dark:bg-gray-800 h-2.5 rounded-full mt-5">
                                    <div
                                        className="bg-cyan-500 h-2.5 rounded-full transition-all duration-1000 ease-out"
                                        style={{
                                            width: `${(completedCount / skills.length) * 100}%`,
                                        }}
                                    />
                                </div>
                            )}
                        </div>

                        <div className="p-4 space-y-2 max-h-[450px] overflow-y-auto">
                            {loadingSkills ? (
                                <div className="flex flex-col items-center py-20 gap-3 text-gray-400">
                                    <Loader2 className="animate-spin" size={32} />
                                    <p className="text-sm font-bold">Fetching services...</p>
                                </div>
                            ) : (
                                skills.map((skill) => (
                                    <div
                                        key={skill.id}
                                        onClick={() => toggleSkill(skill.id, skill.completed)}
                                        className={`group flex items-center justify-between p-5 rounded-2xl cursor-pointer transition-all border-2 
                      ${skill.completed
                                                ? "bg-cyan-50 border-cyan-200 dark:bg-cyan-950/20 dark:border-cyan-800"
                                                : "bg-white border-transparent hover:border-gray-200 dark:bg-gray-900 dark:hover:border-gray-700"
                                            }`}
                                    >
                                        <span
                                            className={`text-[15px] transition-colors ${skill.completed
                                                ? "text-cyan-700 dark:text-cyan-400 font-bold"
                                                : "text-gray-600 dark:text-gray-400 font-medium"
                                                }`}
                                        >
                                            {skill.name}
                                        </span>
                                        <div
                                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all
                      ${skill.completed
                                                    ? "bg-cyan-500 border-cyan-500 scale-110"
                                                    : "bg-transparent border-gray-300 dark:border-gray-600 group-hover:border-cyan-400"
                                                }`}
                                        >
                                            {skill.completed && (
                                                <Check size={14} className="text-white stroke-[4px]" />
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="p-6 bg-gray-50 dark:bg-gray-900 text-center flex flex-col items-center gap-2">
                            <div className="flex items-center gap-1.5 text-cyan-600 dark:text-cyan-400">
                                <AlertCircle size={14} />
                                <p className="text-[10px] font-black uppercase tracking-widest">
                                    Real-time Updates
                                </p>
                            </div>
                            <p className="text-[11px] text-gray-500 dark:text-gray-500 leading-relaxed px-4">
                                Changes are saved immediately. These skills will define your
                                visibility in customer searches.
                            </p>
                        </div>
                    </div>
                </ScrollFadeIn>
            )}

            {/* --- PRICING MODAL --- */}
            {showPriceModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
                    <div className="bg-white dark:bg-gray-900 w-full max-w-sm rounded-3xl p-8 shadow-2xl animate-in zoom-in duration-200 border dark:border-gray-800 relative">
                        <button
                            onClick={() => setShowPriceModal(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-white"
                        >
                            <X size={20} />
                        </button>
                        <h3 className="text-2xl font-black mb-1 dark:text-white">
                            Service Pricing
                        </h3>
                        <p className="text-gray-500 text-xs mb-8 font-medium">
                            How would you like to charge for this skill?
                        </p>

                        <div className="space-y-6">
                            <div>
                                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2 block">
                                    Base Price (₹)
                                </label>
                                <input
                                    type="number"
                                    value={pricing.price}
                                    onChange={(e) =>
                                        setPricing({ ...pricing, price: e.target.value })
                                    }
                                    placeholder="e.g. 499"
                                    className="w-full p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl outline-none focus:ring-2 focus:ring-cyan-500 font-bold dark:text-white text-xl"
                                />
                            </div>

                            <div>
                                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2 block">
                                    Payment Type
                                </label>
                                <select
                                    value={pricing.type}
                                    onChange={(e) =>
                                        setPricing({ ...pricing, type: e.target.value })
                                    }
                                    className="w-full p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl outline-none focus:ring-2 focus:ring-cyan-500 font-bold dark:text-white appearance-none cursor-pointer"
                                >
                                    <option value="fixed">Fixed Rate</option>
                                    <option value="hourly">Hourly Rate</option>
                                    <option value="starting_at">Starting At</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-10">
                            <button
                                onClick={() => setShowPriceModal(false)}
                                className="flex-1 py-4 font-bold text-gray-500 bg-gray-100 dark:bg-gray-800 rounded-2xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handlePriceSubmit}
                                className="flex-1 py-4 bg-cyan-500 text-white font-bold rounded-2xl shadow-lg shadow-cyan-500/30 hover:bg-cyan-600 transition-all"
                            >
                                Add Skill
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <MessageDialog
                isOpen={dialog.isOpen}
                message={dialog.message}
                onOk={closeDialog}
            />

            <Footer />
        </>
    );
};

export default Home;