import React from 'react';
import { Menu, X } from 'lucide-react';
import logo from "../assets/logo3.png";
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useEffect } from 'react';
import { jwtDecode } from "jwt-decode";

const Usernav = (props) => {
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState(props.page);
    const navigate = useNavigate();
    const [user_role, setRole] = useState(localStorage.getItem("userRole"));

    useEffect(() => {
      const updateNav = () => {
        setRole(localStorage.getItem("userRole"));
      };

      // Listen for the custom event we fired in Login.jsx
      window.addEventListener("authChange", updateNav);

      return () => window.removeEventListener("authChange", updateNav);
    }, []);

    const navLinks = ['Home', (user_role=="app_user"?"Book now":"Reviews"), 'Bookings', 'Profile'];
    
    const handleLogout = async () => {
      try {
        await fetch("http://localhost:5000/api/auth/logout", {
          method: "POST",
          credentials: "include", // Essential to tell the browser which cookie to kill
        });
        localStorage.clear();
        // Now that the cookie is gone, we can safely redirect
        navigate("/login");
        
      } catch (err) {
        console.error("Logout failed", err);
      }
    };

    return (
      <nav className="bg-transparent px-6 py-4">
        <div className="flex flex-row items-center justify-between max-w-7xl mx-auto">
          {/* Logo Placeholder */}
          <div
            className="w-40 text-cyan-500 font-black text-2xl cursor-pointer"
            onClick={() => navigate("/home")}
          >
            <img
              src={logo}
              className="w-full h-full object-contain"
              alt="Logo"
            />
          </div>

          {/* Desktop Links */}
          <div className="hidden md:flex flex-row items-center gap-10">
            {navLinks.map((link) => (
              <div
                key={link}
                onClick={() => {
                  setActiveTab(link);
                  if (link === "Home") {
                    navigate("/home");
                  } else if (link === "Book now" || link === "Reviews") {
                    if (user_role === "app_user") {
                      navigate("/services");
                    } else {
                      navigate("/Reviews");
                    }
                  } else if (link === "Bookings") {
                    if (user_role === "app_user") {
                      navigate("/appointments");
                    } else {
                      navigate("/workerappointments");
                    }
                  } else {
                    navigate("/profile");
                  }
                }}
                className={`cursor-pointer text-[14px] transition-all duration-300 pb-1 ${
                  activeTab === link
                    ? "text-cyan-500 border-b-2 border-cyan-500 font-bold"
                    : "dark:text-white text-black hover:text-cyan-300"
                }`}
              >
                {link}
              </div>
            ))}
          </div>

          {/* Action Button & Hamburger */}
          <div className="flex items-center gap-4">
          {user_role.length==0?<button className="hidden md:block bg-cyan-500 px-6 py-2 text-white rounded-full font-bold text-[12px] hover:bg-cyan-700 transition-colors cursor-pointer" onClick={handleLogout}>Logout</button>:<button className='hidden md:block bg-cyan-500 px-6 py-2 text-white rounded-full font-bold text-[12px] hover:bg-cyan-700 transition-colors cursor-pointer' onClick={()=>navigate("/login")}>Login</button>}
            {/* Mobile Toggle */}
            <button
              className="md:hidden dark:text-white text-black"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X size={28} /> : <Menu size={38} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={`${
            isOpen ? "max-h-70 opacity-100" : "max-h-0 opacity-0"
          } md:hidden overflow-hidden transition-all duration-300 ease-in-out`}
        >
          <div className="flex flex-col gap-4 mt-4 pb-4">
            {navLinks.map((link) => (
              <div
                key={link}
                onClick={() => {
                  setActiveTab(link);
                  setIsOpen(false);
                }}
                className={`text-base py-2 cursor-pointer transition-all ${
                  activeTab === link
                    ? "text-cyan-500 border-l-4 border-cyan-500 pl-2 font-bold"
                    : "dark:text-white text-black pl-2"
                }`}
              >
                {link}
              </div>
            ))}
            <button
              className="bg-cyan-500 text-white py-2 rounded-full font-bold text-sm"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </div>
      </nav>
    );
}

export default Usernav
