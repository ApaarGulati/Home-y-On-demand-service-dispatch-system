import React, { useState, useEffect } from 'react';
import Usernav from './Usernav';
import ScrollFadeIn from './ScrollFadeIn';
import { AnimatedInput } from './AnimatedInput';
import search from "../assets/search.svg";
import Carousel from './Carousel';
import Footer from './Footer';
import { useNavigate } from 'react-router-dom';
import { Check ,Save, Loader2} from 'lucide-react';

const Home = () => {

    var wordarr = ["Search for massages", "Search for Servicing", "Search for Facials"];
    const navigate = useNavigate();
    const [query, setquery] = useState("");
    const [isUser, setisUser] = useState(true);

    const [skills, setSkills] = useState([
        { id: 1, name: "General Plumbing", completed: false },
        { id: 2, name: "Pipe Leakage Repair", completed: true },
        { id: 3, name: "Bathroom Fitting Installation", completed: false },
        { id: 4, name: "Water Heater Service", completed: false },
        { id: 5, name: "Drainage Cleaning", completed: false },
        { id: 6, name: "Emergency Repair Services", completed: false },
    ]);

    const [isSaving, setIsSaving] = useState(false);

    const toggleSkill = (id) => {
        setSkills(prevSkills =>
            prevSkills.map(skill =>
                skill.id === id ? { ...skill, completed: !skill.completed } : skill
            )
        );
    };

    const completedCount = skills.filter(s => s.completed).length;


    const handlesearch = (input) => {
        localStorage.setItem("Searchquery", input);
        navigate("/services")

    }


    useEffect(() => {
        var output = localStorage.getItem("userRole");
        if (output === "app_user") {
            setisUser(true);
        } else {
            setisUser(false);
        }

    }, [])
<<<<<<< HEAD
    
    
=======

    const handleSave = () => {
        
        setIsSaving(true);
        // Simulate API call
        setTimeout(() => {
            setIsSaving(false);
            alert("Skills updated successfully!");
        }, 1500);
    };




>>>>>>> 13202cec90e788af351750950077a8aa1f860923
    return (
        <>
            <Usernav />
            <ScrollFadeIn>
                <div className=' w-full h-100   flex flex-row flex-wrap justify-center  items-center  gap-4 bg-transparent'>
                    {isUser == true ? <><p className='text-center text-7xl font-extrabold dark:text-white'>Home services at </p> <p className='text-center text-cyan-500 text-6xl font-extrabold'>your doorstep</p></> : <><p className='text-center text-7xl font-extrabold dark:text-white'>Own your craft.</p> <p className='text-center text-cyan-500 text-6xl font-extrabold'>Own your time.</p></>}
                </div>

                {isUser && <div className='flex flex-row flex-wrap  gap-4 justify-center'>
                    <AnimatedInput type="text" value={query} onChange={(e) => setquery(e.target.value)} className="w-100 h-15 pl-2 text-[20px] rounded-xl text  border border-gray-400 bg-white bg-no-repeat bg-left bg-contain focus:outline-2 focus: outline-cyan-500 focus:outline-offset-4 focus:border focus:border-cyan-500 " placeholders={wordarr} />
                    <button className="bg-cyan-500 w-15 h-15 text-center text-white rounded-full  flex flex-row items-center justify-center  font-bold text-[12px] cursor-pointer hover:bg-cyan-700" onClick={() => handlesearch(query)}>
                        <img src={search} className='object-contain h-10 w-10' alt="" />
                    </button>
                </div>}
            </ScrollFadeIn>


            {isUser && <><ScrollFadeIn>
                <Carousel text="Recommended for you" />
            </ScrollFadeIn>

                <ScrollFadeIn>
                    <Carousel text="Quickies" />
                </ScrollFadeIn>

                <ScrollFadeIn>
                    <Carousel text="Deep shit" />
                </ScrollFadeIn></>}


            {!isUser && <ScrollFadeIn>
                <div className="max-w-md mx-auto my-10 bg-transparent dark:bg-gray-950 rounded-2xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-800">
                    {/* Header with Progress */}
                    <div className="b-dark:bg-gray-950 p-6 text-black dark:text-white">
                        <h2 className="text-xl font-bold mb-1">Skillset</h2>
                        <p className="text-gray-400 text-sm">
                            {completedCount} of {skills.length} skills added
                        </p>

                        {/* Progress Bar */}
                        <div className="w-full bg-gray-800 h-2 rounded-full mt-4">
                            <div
                                className="bg-cyan-500 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${(completedCount / skills.length) * 100}%` }}
                            />
                        </div>
                    </div>

                    {/* Checklist Items */}
                    <div className="p-4 space-y-2">
                        {skills.map((skill) => (
                            <div
                                key={skill.id}
                                onClick={() => toggleSkill(skill.id)}
                                className={`group flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all border-2 
              ${skill.completed
                                        ? "bg-cyan-50 border-cyan-200 dark:bg-cyan-950/20 dark:border-cyan-800"
                                        : "bg-white border-transparent hover:border-gray-200 dark:bg-gray-900 dark:hover:border-gray-700"
                                    }`}
                            >
                                <span className={`text-[15px] font-medium transition-colors ${skill.completed ? "text-cyan-700 dark:text-cyan-400 font-bold" : "text-gray-700 dark:text-gray-300"
                                    }`}>
                                    {skill.name}
                                </span>

                                {/* Custom Checkbox */}
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all
              ${skill.completed
                                        ? "bg-cyan-500 border-cyan-500 scale-110"
                                        : "bg-transparent border-gray-300 dark:border-gray-600 group-hover:border-cyan-400"
                                    }`}>
                                    {skill.completed && <Check size={14} className="text-white stroke-[4px]" />}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="p-5 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="w-full bg-cyan-500 hover:bg-cyan-600 disabled:bg-cyan-800 text-white h-12 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-cyan-500/20"
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 size={18} className="animate-spin" />
                                    Saving Changes...
                                </>
                            ) : (
                                <>
                                    <Save size={18} />
                                    Save Skills
                                </>
                            )}
                        </button>
                    </div>

                    {/* Subtle Footer */}
                    <div className="p-4 bg-gray-50 dark:bg-gray-900 text-center">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            Fixed skill set based on your primary category
                        </p>
                    </div>
                </div>

            </ScrollFadeIn>}




            <Footer />






        </>

    );
};

export default Home;