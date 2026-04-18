import { useState } from "react";
import { useNavigate } from "react-router-dom";








import Navbar from "./Navbar";

const Login = () => {







  const navigate = useNavigate();
  const [email, setemail] = useState("");
  const [passwd, setpasswd] = useState("");







  const handlesubmit = async (email, password) => {
    if (email.length == 0 || password.length == 0) {
      alert("None of the fields should be empty");
      return;
    }

    if (!(email.includes("@") && email.endsWith(".com"))) {
      alert("Please enter a valid email id");
      return;
    }

    var payload = {
      email: email,



      password: password,
    };

    const response = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });
    // if(!response.ok){
    //   alert("An error occurred. Please try again.")







    // }

    const translation = await response.json();

    if (translation.status === "error") {
      alert(translation.message);
      return;



    }

    if (translation.status === "success") {
      // alert(translation.message);
      localStorage.setItem("userRole", translation.role);
      

      // Trigger a custom event to wake up the Navbar
      window.dispatchEvent(new Event("authChange"));

      navigate("/home");





    }

  };

  return (
    <>
      <Navbar />
      {/* Container: Changed h-146 to min-h-screen to ensure it covers the page */}
      <div className="min-h-screen w-full flex flex-col items-center justify-center py-10 px-4 ">
        {/* Card Wrapper: This adds the "anchor" we discussed */}





        <div className="w-full max-w-md bg-white dark:bg-transparent p-8 rounded-3xl shadow-2xl flex flex-col gap-8">
          {/* Title: Adjusted text size for mobile */}



          <h1 className="text-3xl md:text-4xl font-extrabold dark:text-white text-center text-gray-800">
            Login
          </h1>

          <form
            className="flex flex-col gap-6"
            onSubmit={(e) => e.preventDefault()}
          >
            {/* Email Input Group */}
            <div className="flex flex-col items-start w-full">
              <label className="ml-4 mb-1 text-sm font-semibold dark:text-gray-300 text-gray-600">
                Email Address
              </label>
              <input
                type="email"
                placeholder="Enter your email here "
                value={email}
                onChange={(e) => setemail(e.target.value)}
                className="bg-white dark:bg-gray-800 dark:text-white rounded-full px-5 w-full border-2 border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-300 h-12 transition-all"
              />
            </div>

            {/* Password Input Group */}
            <div className="flex flex-col items-start w-full">
              <label className="ml-4 mb-1 text-sm font-semibold  dark:text-gray-300 text-gray-600">
                Password
              </label>
              <input
                type="password"
                placeholder="Enter your password here"
                value={passwd}
                onChange={(e) => setpasswd(e.target.value)}
                className="bg-white dark:bg-gray-800 dark:text-white rounded-full px-5 w-full border-2 border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-300 h-12 transition-all"
              />
              <button
                type="button"
                className="text-cyan-500 text-xs underline cursor-pointer ml-4 mt-2 hover:text-cyan-700"
              >
                Forgot Password?
              </button>
            </div>

            {/* Login Button */}
            <button
              className="bg-cyan-500 w-full h-12 text-white rounded-full font-bold text-lg cursor-pointer hover:bg-cyan-600 hover:shadow-lg transform active:scale-95 transition-all mt-4"
              onClick={() => handlesubmit(email, passwd)}
            >
              Login
            </button>
          </form>

          {/* Footer Link */}
          <div className="text-center">
            <span className="text-gray-500 dark:text-gray-400 text-sm">
              Don't have an account?{" "}
            </span>
            <button
              className="text-cyan-500 font-bold underline cursor-pointer hover:text-cyan-700 text-sm"
              onClick={() => navigate("/createaccount")}
            >
              Create Account
            </button>

          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
