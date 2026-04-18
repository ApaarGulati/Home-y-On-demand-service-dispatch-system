import React, { useState } from 'react';
import Usernav from './Usernav';
import ScrollFadeIn from './ScrollFadeIn';
import { AnimatedInput } from './AnimatedInput';
import search from "../assets/search.svg";
import Carousel from './Carousel';
import Footer from './Footer';
import { useNavigate } from 'react-router-dom';

const Home = () => {

    var wordarr = ["Search for massages", "Search for Servicing", "Search for Facials"];
    const navigate=useNavigate();
    const [query,setquery]=useState("");
    const [isUser,setisUser]=useState(true);


    const handlesearch=(input) => {
      localStorage.setItem("Searchquery",input);
      navigate("/services")

    }


    useEffect(() => {
      var output=localStorage.getItem("userRole");
      if(output==="app_user"){
        setisUser(true);
      }else{
        setisUser(false);
      }
    
    }, [])
    
    


    return (
        <>
            <Usernav />
            <ScrollFadeIn>
                <div className=' w-full h-100   flex flex-row flex-wrap justify-center  items-center  gap-4 bg-transparent'>
                    {isUser==true?<><p className='text-center text-7xl font-extrabold dark:text-white'>Home services at </p> <p className='text-center text-cyan-500 text-6xl font-extrabold'>your doorstep</p></>: <><p className='text-center text-7xl font-extrabold dark:text-white'>Own your craft.</p> <p className='text-center text-cyan-500 text-6xl font-extrabold'>Own your time.</p></> }
                </div>

                {isUser&&<div className='flex flex-row flex-wrap  gap-4 justify-center'>
                    <AnimatedInput type="text" value={query} onChange={(e)=>setquery(e.target.value)} className="w-100 h-15 pl-2 text-[20px] rounded-xl text  border border-gray-400 bg-white bg-no-repeat bg-left bg-contain focus:outline-2 focus: outline-cyan-500 focus:outline-offset-4 focus:border focus:border-cyan-500 "   placeholders={wordarr}   />
                    <button className="bg-cyan-500 w-15 h-15 text-center text-white rounded-full  flex flex-row items-center justify-center  font-bold text-[12px] cursor-pointer hover:bg-cyan-700" onClick={()=>handlesearch(query)}>
                        <img src={search} className='object-contain h-10 w-10'  alt="" />
                    </button>
                </div>}
            </ScrollFadeIn>


            {isUser&&<><ScrollFadeIn>
                <Carousel text="Recommended for you"/>
            </ScrollFadeIn>

            <ScrollFadeIn>
                <Carousel text="Quickies"/>
            </ScrollFadeIn>

            <ScrollFadeIn>
                <Carousel text="Deep shit"/>
            </ScrollFadeIn></>}

            <Footer/>


            



        </>

    );
};

export default Home;