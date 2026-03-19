import React from 'react'

const Login = () => {
  return (
    <div className='w-full h-146  flex flex-col  gap-15 items-center py-10'>  
      {/* login/sign up title */}
      <div className='text-5xl font-extrabold dark:text-white text-center '>Login to your account</div>
      {/* first info colun */}
      <div className='inputcontainer flex flex-col items-start w-xl '>
        <div className='ml-2 text-[12px] dark:text-white'>Enter your email</div>
        <input type="text" placeholder='Enter Here' className='bg-white rounded-l-full rounded-r-full px-4 w-full mt-2 border border-2 border-cyan-500 focus:outline-offset-2 focus:outline-2 focus:outline-cyan-500 h-8' />
      </div>

      <div className='inputcontainer flex flex-col items-start w-xl '>
        <div className='ml-2 text-[12px] dark:text-white'>Enter your Password</div>
        <input type="text" placeholder='Enter Here' className='bg-white rounded-l-full rounded-r-full px-4 w-full mt-2 border border-2 border-cyan-500 focus:outline-offset-2 focus:outline-2 focus:outline-cyan-500 h-8' />
      </div>

      <div className='flex flex-col gap-5'>
        <div className='text-cyan-500 underline cursor-pointer'>Forgot Password ?</div>
        <div className='text-cyan-500 underline cursor-pointer text-center'>Create Account</div>
      </div>
      

      <button className="bg-cyan-500 w-35 h-10 text-center text-white   flex flex-row items-center justify-center rounded-l-full rounded-r-full font-bold text-[16px] cursor-pointer hover:bg-cyan-700">Login</button>
      
      

    </div>
  )
}

export default Login
