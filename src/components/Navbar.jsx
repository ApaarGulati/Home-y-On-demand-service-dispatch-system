import React from 'react'
import "./Navbar.css"
import logo from '../assets/logo3.png'; 
import { Navigate, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate=useNavigate()
  return (
    <div className=' h-15  flex flex-row items-center justify-center gap-[30%] sm:gap-[40%] md:gap-[70%] xl:gap-[80%] '>
      <div className=" w-50 h-15 cursor-pointer ">
        <img src={logo} className='w-[100%] h-[100%] object-contain' alt="" onClick={()=>navigate("/")} />
      </div>
      <button className="bg-cyan-500 w-35 h-10 text-center text-white   flex flex-row items-center justify-center rounded-l-full rounded-r-full font-bold text-[12px] cursor-pointer hover:bg-cyan-700" onClick={()=>navigate("/login")}>Sign up/Login</button>
    </div>
  )
}

export default Navbar
