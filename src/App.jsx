import Navbar from "./components/Navbar";
import "./App.css";
import Footer from "./components/Footer";
import Landing from "./components/Landing";
import ScrollFadeIn from "./components/ScrollFadeIn";
import Login from "./components/Login";


function App() {


  return (
    <>
       <ScrollFadeIn>
        <Navbar />
      </ScrollFadeIn>
      <ScrollFadeIn>
        <Landing />
      </ScrollFadeIn>
      <Footer /> 
      {/* <Login/> */}
    </>
  )
}

export default App
