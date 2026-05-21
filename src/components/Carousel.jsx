import React from 'react';
import { Star, Zap, ChevronRight } from 'lucide-react';

const Carousel = (props) => {
    const services = [
        {
            id: 1,
            title: "Professional Plumber Consultation",
            rating: "4.82",
            price: "199",
            isInstant: true,
            image: "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?q=80&w=400&auto=format&fit=crop",
        },
        {
            id: 2,
            title: "Full Home Deep Cleaning",
            rating: "4.95",
            price: "899",
            isInstant: false,
            image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=400&auto=format&fit=crop",
        },
        {
            id: 3,
            title: "AC Service & Gas Recharge",
            rating: "4.78",
            price: "449",
            isInstant: true,
            image: "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?q=80&w=400&auto=format&fit=crop",
        },
        {
            id: 4,
            title: "Sofa & Upholstery Cleaning",
            rating: "4.89",
            price: "299",
            isInstant: false,
            image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=400&auto=format&fit=crop",
        },
        {
            id: 5,
            title: "Electrical Wiring & Repair",
            rating: "4.71",
            price: "149",
            isInstant: true,
            image: "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?q=80&w=400&auto=format&fit=crop",
        },
        {
            id: 6,
            title: "Pest Control Treatment",
            rating: "4.92",
            price: "599",
            isInstant: false,
            image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=400&auto=format&fit=crop",
        },
        {
            id: 7,
            title: "Kitchen Chimney Cleaning",
            rating: "4.85",
            price: "349",
            isInstant: true,
            image: "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?q=80&w=400&auto=format&fit=crop",
        }
    ];
    return (
        <>
            <div className='mt-30 '>
                <section className="py-8 px-4 md:px-10 max-w-[1400px] mx-auto bg-transparent">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl md:text-2xl font-bold dark:text-white text-gray-900">{props.text}</h2>
                        <button className="border border-gray-300 px-4 py-1.5 rounded-lg text-cyan-500 font-semibold text-xs hover:bg-gray-50 transition-colors">
                            See all
                        </button>
                    </div>

                    {/* Cards Container */}
                    <div className="relative group">
                        <div className="flex overflow-x-auto gap-4 pb-4 no-scrollbar snap-x">
                            {services.map((service) => (
                                // REDUCED: Card overall width
                                <div key={service.id} className="w-[160px] md:w-[180px] flex-shrink-0 snap-start cursor-pointer">

                                    {/* Image Container - REDUCED: Fixed Height instead of aspect-square */}
                                    <div className="h-[120px] md:h-[140px] bg-gray-100 rounded-xl overflow-hidden mb-3">
                                        <img
                                            src={service.image}
                                            alt={service.title}
                                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                        />
                                    </div>

                                    {/* Details */}
                                    <div className="space-y-0.5">
                                        {/* REDUCED: Smaller font size and line height */}
                                        <h3 className="font-semibold dark:text-white text-gray-800 text-sm leading-snug h-10 line-clamp-2">
                                            {service.title}
                                        </h3>

                                        {/* REDUCED: Switched to text-xs */}
                                        <div className="flex items-center gap-1.5 text-xs dark:text-white text-gray-600">
                                            <div className="flex items-center ">
                                                <Star size={12} className="fill-gray-600 mr-1" />
                                                <span>{service.rating}</span>
                                            </div>
                                            {service.isInstant && (
                                                <div className="flex items-center text-cyan-500">
                                                    <span className="mx-0.5">•</span>
                                                    <Zap size={12} className="text-green-600 fill-green-600 mr-1" />
                                                    <span>Instant</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* REDUCED: Smaller price text */}
                                        <div className=" text-cyan-500 font-bold text-sm">
                                            ₹{service.price}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Right Arrow Navigation (Desktop Only) */}
                        <button className="hidden md:flex absolute right-[-20px] top-[70px] -translate-y-1/2 bg-white shadow-xl border border-gray-100 p-2 rounded-full z-10 hover:bg-gray-50">
                            <ChevronRight size={20} className='text-gray-700' />
                        </button>
                    </div>
                </section>
            </div>

        </>

    );
};

export default Carousel;