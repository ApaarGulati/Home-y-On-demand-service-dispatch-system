import React, { useState } from 'react';
import { Ticket, CreditCard, Store } from 'lucide-react'; // Optional: for icons
import { useNavigate } from 'react-router-dom';
const Checkout = () => {
  const [coupon, setCoupon] = useState('');
  const [discount, setDiscount] = useState(0);
  const navigate=useNavigate();
  
  // Mock data - in a real app, these would come from props or state
  const item = {
    name: "Premium Wellness Retreat",
    provider: "Serenity Springs Spa",
    basePrice: 299.00
  };

  const totalPrice = item.basePrice - discount;

  const handleApplyCoupon = () => {
    // Simple logic: if coupon is "SAVE10", give $10 off
    if (coupon.toUpperCase() === 'SAVE10') {
      setDiscount(10);
    } else {
      alert("Invalid Coupon");
    }
  };

  return (
    <div className='min-h-screen w-full flex flex-col items-center justify-center py-10 px-4 bg-gray-50 dark:bg-neutral-950'>
      <div className='w-full max-w-xl bg-white dark:bg-neutral-900 p-8 md:p-10 rounded-3xl shadow-2xl flex flex-col gap-8 border border-gray-100 dark:border-neutral-800'>
        
        <h1 className='text-3xl font-extrabold dark:text-white text-center text-gray-800'>
          Booking Details
        </h1>

        {/* Item Summary Section */}
        <div className='flex flex-col gap-2 p-4 rounded-2xl bg-gray-50 dark:bg-neutral-800/50 border border-gray-100 dark:border-neutral-800'>
          <div className='flex justify-between items-start'>
            <div>
              <p className='text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold'>Service</p>
              <h2 className='text-xl font-bold dark:text-white'>{item.name}</h2>
            </div>
          </div>
          
          <div className='flex items-center gap-2 mt-2 text-gray-600 dark:text-gray-300'>
            <Store size={18} />
            <span className='text-sm font-medium'>{item.provider}</span>
          </div>
        </div>

        {/* Coupon Section */}
        <div className='flex flex-col gap-3'>
          <label className='text-sm font-semibold dark:text-gray-300 ml-1'>Have a coupon?</label>
          <div className='flex gap-2'>
            <div className='relative flex-1'>
              <Ticket className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400' size={18} />
              <input 
                type="text" 
                placeholder="Enter code"
                value={coupon}
                onChange={(e) => setCoupon(e.target.value)}
                className='w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white focus:ring-2 focus:ring-cyan-500 outline-none transition-all'
              />
            </div>
            <button 
              onClick={handleApplyCoupon}
              className='px-6 py-3 bg-cyan-500 dark:bg-cyan-500 dark:text-white text-white font-bold rounded-xl hover:opacity-90 transition-opacity'
            >
              Apply
            </button>
          </div>
        </div>

        {/* Price Breakdown */}
        <div className='flex flex-col gap-3 border-t border-gray-100 dark:border-neutral-800 pt-6'>
          <div className='flex justify-between text-gray-600 dark:text-gray-400'>
            <span>Base Price</span>
            <span>${item.basePrice.toFixed(2)}</span>
          </div>
          
          {discount > 0 && (
            <div className='flex justify-between text-green-600 dark:text-green-400 font-medium'>
              <span>Discount</span>
              <span>-${discount.toFixed(2)}</span>
            </div>
          )}

          <div className='flex justify-between items-center mt-2'>
            <span className='text-xl font-bold dark:text-white'>Total Amount</span>
            <span className='text-3xl font-black text-cyan-500 dark:text-cyan-500'>
              ${totalPrice.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Pay Button */}
        <button className='w-full py-4 bg-cyan-500 hover:bg-cyan-600 text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-3 shadow-lg shadow-blue-200 dark:shadow-none transition-all active:scale-[0.98]' onClick={()=>navigate("/orderconfirmed")}>
          <CreditCard size={22} />
          Pay Now
        </button>
        
        <p className='text-center text-xs text-gray-400 dark:text-neutral-500'>
          Secure checkout powered by Stripe. Cancellation policies apply.
        </p>
      </div>
    </div>
  );
};

export default Checkout;