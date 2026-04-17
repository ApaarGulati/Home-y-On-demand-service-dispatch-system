import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import Footer from "./components/Footer";
import Landing from "./components/Landing";
import Navbar from "./components/Navbar";
import ScrollFadeIn from "./components/ScrollFadeIn";
import ServicePage from "./servicePage/ServicePage";
// Make sure this path matches wherever you saved the new file!
import AppointmentPage from "./appointmentPage/AppointmentPage";
import ProfilePage from "./profile_user/ProfilePage";
import Login from "./components/Login";
import CreateAccount from "./components/CreateAccount";
import Checkout from "./components/Checkout";
import OrderConfirmed from "./components/OrderConfirmed";
import axios from "axios";

// 1. Set the exact base URL of your Flask server
axios.defaults.baseURL = "http://localhost:5000";

// 2. Force every single request to send and receive cookies
axios.defaults.withCredentials = true;

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* HOME ROUTE */}
        <Route
          path="/"
          element={
            <>
              <ScrollFadeIn>
                <Navbar />
              </ScrollFadeIn>
              <ScrollFadeIn>
                <Landing />
              </ScrollFadeIn>
              <Footer />
            </>
          }
        />

        {/* SERVICES MARKETPLACE ROUTE */}
        <Route
          path="/services"
          element={
            <>
              <ServicePage />
              <Footer />
            </>
          }
        />

        {/* --- NEW: PAST & ONGOING APPOINTMENTS ROUTE --- */}
        <Route
          path="/appointments"
          element={
            <>
              <Navbar />
              <AppointmentPage />
              <Footer />
            </>
          }
        />
        <Route
          path="/profile"
          element={
            <>
              <Navbar />
              <ProfilePage />
              <Footer />
            </>
          }
        />

        <Route
          path="/login"
          element={
            <>
              <Login/>
            </>
          }
        />

        <Route path="/createaccount" element={
        <>
          <CreateAccount/>
        </>
        }/>

        <Route path="/checkout" element={
          <>
            <Checkout/>
          </>
        }/>

        <Route path="/orderconfirmed" element={
          <>
            <OrderConfirmed/>
          </>
        }/>

      </Routes>

      
    </BrowserRouter>
  );
}

export default App;
