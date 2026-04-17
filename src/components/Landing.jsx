import React from 'react'
import landing from "../assets/landing.png"
import servicework from "../assets/workerpaid.png"
import sample from "../assets/customersatisfaction.png"
import search from "../assets/search.svg"
import { TypeAnimation } from 'react-type-animation';
import customer1 from '../assets/customer1.png'
import customer2 from '../assets/customer2.png'
import "./sample.css"
import Testimonialcard from './Testimonialcard'
import ScrollFadeIn from './ScrollFadeIn'
import { AnimatedInput } from './AnimatedInput'
import worker from "../assets/workerworking.png"
import { useNavigate } from 'react-router-dom'


const Landing = () => {

    var wordarr = ["Search for massages", "Search for Servicing", "Search for Facials"];
    const navigate=useNavigate();



    // const [placeholder, setPlaceholder] = useState("");
    // const [placeholderIndex, setPlaceholderIndex] = useState(0);
    // const typingSpeed = 150;

    // useEffect(() => {
    //     const intervalId = setInterval(() => {
    //         setPlaceholder(passedPlaceholder.slice(0, placeholderIndex));
    //         setPlaceholderIndex(prev => (prev + 1 > passedPlaceholder.length ? 0 : prev + 1));
    //     }, typingSpeed);
    //     return () => clearInterval(intervalId);
    // }, [placeholderIndex, passedPlaceholder]);


    return (
        <>

            <ScrollFadeIn>
                <div className=' w-full h-100   flex flex-row flex-wrap justify-center  items-center  gap-4 '>
                    <p className='text-center text-7xl font-extrabold dark:text-white'>Home services at </p> <p className='text-center text-cyan-500 text-6xl font-extrabold'>your doorstep</p>

                </div>

                <div className='flex flex-row flex-wrap  gap-4 justify-center'>
                    <AnimatedInput type="text" className="w-100 h-15 pl-2 text-[20px] rounded-xl text  border border-gray-400 bg-white bg-no-repeat bg-left bg-contain focus:outline-2 focus: outline-cyan-500 focus:outline-offset-4 focus:border focus:border-cyan-500 "  placeholders={wordarr}   />
                    <button className="bg-cyan-500 w-15 h-15 text-center text-white rounded-full  flex flex-row items-center justify-center  font-bold text-[12px] cursor-pointer hover:bg-cyan-700" onClick={()=>navigate("/login")}>
                        <img src={search} className='object-contain h-10 w-10' alt="" />
                    </button>


                </div>
            </ScrollFadeIn>

            {/* about us section begins */}
            <ScrollFadeIn>
                <div className='text-center mt-60  text-6xl font-bold  text-cyan-500'>About Us</div>

                <div className='w-full   h-190 mt-10 flex flex-row  justify-center items-center flex-wrap gap-24 md:gap-15 pt-8 '>
                    <div className=' h-70 w-140 flex flex-col gap-2 sm:gap-16 items-center'>
                        <div className=" w-full flex flex-row flex-wrap items-center justify-center  gap-2 font-bold text-[28px]">
                            <p className=' text-black dark:text-white'>Providing solutions,</p>
                            <p className='text-cyan-500'>one service at a time</p>
                        </div>
                        <div className=" text-wrap text-[20px] w-full text-center dark:text-white">
                            Lorem ipsum dolor sit amet consectetur adipisicing elit. Facilis similique odit nam nihil minus laborum maiores modi illo nostrum? Iste adipisci quisquam saepe sed vel qui necessitatibus veniam, pariatur perferendis non aperiam temporibus est modi odit repudiandae dolor voluptatibus eaque.
                        </div>
                    </div>
                    <div className='  h-90 w-100 '>
                        <img src={worker} className='object-contain h-full w-full ' alt="" />
                    </div>
                </div>
            </ScrollFadeIn>

            <ScrollFadeIn>
                <div className='w-full  h-190 mt-20   flex flex-row  justify-center items-center flex-wrap-reverse gap-10 md:gap-15 pt-8'>
                    <div className='  h-90 w-100 flex justify-center items-center'>
                        <img src={servicework} className='object-contain h-full w-full ' alt="" />
                    </div>
                    <div className=' h-70 w-140 flex flex-col gap-2 sm:gap-16 items-center'>
                        <div className=" w-full flex flex-row flex-wrap items-center justify-center  gap-2 font-bold text-[28px]">
                            <p className='dark:text-white text-black'>Providing solutions,</p>
                            <p className='text-cyan-500'>one service at a time</p>
                        </div>
                        <div className=" text-wrap text-[20px] w-full text-center dark:text-white">
                            Lorem ipsum dolor sit amet consectetur adipisicing elit. Facilis similique odit nam nihil minus laborum maiores modi illo nostrum? Iste adipisci quisquam saepe sed vel qui necessitatibus veniam, pariatur perferendis non aperiam temporibus est modi odit repudiandae dolor voluptatibus eaque.
                        </div>
                    </div>

                </div>
            </ScrollFadeIn>

            <ScrollFadeIn>
                <div className='w-full  h-190 mt-20   flex flex-row  justify-center items-center flex-wrap gap-30 md:gap-15 pt-8'>
                    <div className=' h-70 w-140 flex flex-col gap-2 sm:gap-16 items-center'>
                        <div className=" w-full flex flex-row flex-wrap items-center justify-center  gap-2 font-bold text-[28px]">
                            <p className='dark:text-white text-black'>Providing solutions,</p>
                            <p className='text-cyan-500'>one service at a time</p>
                        </div>
                        <div className=" text-wrap text-[20px] w-full text-center dark:text-white text-black">
                            Lorem ipsum dolor sit amet consectetur adipisicing elit. Facilis similique odit nam nihil minus laborum maiores modi illo nostrum? Iste adipisci quisquam saepe sed vel qui necessitatibus veniam, pariatur perferendis non aperiam temporibus est modi odit repudiandae dolor voluptatibus eaque.
                        </div>
                    </div>
                    <div className='  h-90 w-100 '>
                        <img src={sample} className='object-contain h-[50%] w-full sm: h-full sm: w-full rounded-lg' alt="" />
                    </div>
                </div>
            </ScrollFadeIn>


            {/* testimonial section begins */}

            <ScrollFadeIn>
                <div className='text-5xl font-bold mt-12 text-cyan-500 text-center'>
                    Our Testimonials
                </div>
                <div className=' mt-32 mb-20 overflow-x-hidden flex flex-row gap-8 shrink-0 no-scrollbar'>

                    <div className="flex animate-marquee-infinite w-max">

                        <div className="flex flex-row gap-8 px-4 ">
                            <Testimonialcard image={customer1} review="'Spider-man, Spider-man, haanchi funchi Spider-man'" author="Mademoisille Raakhi" />
                            <Testimonialcard image={customer2} review="'Poore Baabe di Amer, Jatt don't care '" author="Monseiur Deepak" />
                            <Testimonialcard image={customer1} review="'Spider-man, Spider-man, haanchi funchi Spider-man'" author="Mademoisille Raakhi" />
                            <Testimonialcard image={customer2} review="'Poore Baabe di Amer, Jatt don't care '" author="Monseiur Deepak" />
                            <Testimonialcard image={customer1} review="'Spider-man, Spider-man, haanchi funchi Spider-man'" author="Mademoisille Raakhi" />
                            <Testimonialcard image={customer2} review="'Poore Baabe di Amer, Jatt don't care '" author="Monseiur Deepak" />

                        </div>

                        <div className="flex flex-row gap-8 px-4 ">
                            <Testimonialcard image={customer1} review="'Spider-man, Spider-man, haanchi funchi Spider-man'" author="Mademoisille Raakhi" />
                            <Testimonialcard image={customer2} review="'Poore Baabe di Amer, Jatt don't care '" author="Monseiur Deepak" />
                            <Testimonialcard image={customer1} review="'Spider-man, Spider-man, haanchi funchi Spider-man'" author="Mademoisille Raakhi" />
                            <Testimonialcard image={customer2} review="'Poore Baabe di Amer, Jatt don't care '" author="Monseiur Deepak" />
                            <Testimonialcard image={customer1} review="'Spider-man, Spider-man, haanchi funchi Spider-man'" author="Mademoisille Raakhi" />
                        </div>

                    </div>
                </div>
            </ScrollFadeIn>

        </>
    )
}

export default Landing

// <TypeAnimation sequence={wordarr} repeat={Infinity} />