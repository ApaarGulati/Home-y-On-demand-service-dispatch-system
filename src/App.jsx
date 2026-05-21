import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import Footer from "./components/Footer";
import Landing from "./components/Landing";
import Navbar from "./components/Navbar";
import ScrollFadeIn from "./components/ScrollFadeIn";
import ServicePage from "./servicePage/ServicePage";
import AppointmentPageworker from "./appointmentPage/AppointmentPageworker";
import Review from "./components/Review";
// Make sure this path matches wherever you saved the new file!
import AppointmentPage from "./appointmentPage/AppointmentPage";
import ProfilePage from "./profile_user/ProfilePage";
import Login from "./components/Login";
import CreateAccount from "./components/CreateAccount";
import Checkout from "./components/Checkout";
import OrderConfirmed from "./components/OrderConfirmed";
import Home from "./components/Home";
import Usernav from "./components/Usernav";
import axios from "axios";
import WorkerProfilePage from "./components/WorkerProfilePage";
import { User } from "lucide-react";


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
              <Usernav page="Book now" />
              <ServicePage />
            </>
          }
        />

        {/* --- NEW: PAST & ONGOING APPOINTMENTS ROUTE --- */}
        <Route
          path="/appointments"
          element={
            <>
              <Usernav page="Bookings" />
              <AppointmentPage />
            </>
          }
        />
        <Route
          path="/profile"
          element={
            <>
              <Usernav page="Profile" />
              <ProfilePage />
            </>
          }
        />

        <Route 
          path="/worker-profile" 
          element={
            <>
            <Usernav page="Profile"/>
            <WorkerProfilePage /> 
            </>}
          />

        <Route
          path="/login"
          element={
            <>
              <Login />
            </>
          }
        />

        <Route
          path="/createaccount"
          element={
            <>
              <CreateAccount />
            </>
          }
        />

        <Route
          path="/checkout"
          element={
            <>
              <Checkout />
            </>
          }
        />

        <Route
          path="/orderconfirmed"
          element={
            <>
              <OrderConfirmed />
            </>
          }
        />

        <Route
          path="/home"
          element={
            <>
              <Home />
            </>
          }
        />

        <Route
          path="/workerappointments"
          element={
            <>
              <AppointmentPageworker />
            </>
          }
        />

        <Route
          path="/Reviews"
          element={
            <>
              <Review />
            </>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
