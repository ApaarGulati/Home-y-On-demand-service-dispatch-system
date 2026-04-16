import React, { useState } from 'react'
import Navbar from './Navbar'
import { useNavigate } from 'react-router-dom';
import { redirect } from 'react-router-dom';

const isNumeric = (val) => !isNaN(val) && Number.isFinite(+val);
const isAlpha = (str) => !(/^[A-Za-z]+$/.test(str));


const handlesubmit = async (role, location, fname, mname, lname, phnum, email, passwd) => {
  if (location.length == 0 || fname.length == 0 || mname.length == 0 || lname.length == 0 || phnum.length == 0 || email.length == 0 || passwd.length == 0) {
    alert("No fields should be left empty. Please ensure.")
    return;
  }

  //error checks 
  var arr = location.split(",")
  if ((!(isNumeric(arr[0]) && isNumeric(arr[1]))) || arr.length != 2) {
    alert("Kindly enter valid location")
    return;
  }

  if (isNumeric(fname) || isNumeric(mname) || isNumeric(lname) || isAlpha(fname) || isAlpha(mname) || isAlpha(lname)) {
    alert("please enter a valid name")
    return;
  }


  if (phnum.length != 10 || !(isNumeric(phnum))) {
    alert("Please enter a valid phone number")
    return;
  }

  if (!(email.endsWith(".com") && email.includes("@"))) {
    alert("please enter a valid email id")
    return;
  }

  var payload = {
    "email": email,
    "password": passwd,
    "role_type": (role == "consumer" ? "app_user" : "worker"),
    "phone": parseInt(phnum),
    "first_name": fname,
    "middle_name": mname,
    "last_name": lname,
    "longitude": parseFloat(arr[1].trim()),
    "latitude": parseFloat(arr[0].trim())
  }


  console.log(payload);
  console.log("connecting to the server and fetching response");
  var response = await fetch("http://127.0.0.1:5000/api/auth/register", { method: "POST", headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  var jresponse=await response.json();

  if(jresponse.status==="error"){
    alert(jresponse.message);
    return;
  }

  if(jresponse.status==="success"){
    alert(jresponse.message);
    redirect("/login")
    // navigate("/login")
    return ;
  }



}






const CreateAccount = () => {
  const navigate = useNavigate();
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  // State to track if they are a 'worker' or 'consumer'
  const [userRole, setUserRole] = useState('consumer');

  const [firstname, setfirstname] = useState("");
  const [middlename, setmiddlename] = useState("");
  const [lastname, setlastname] = useState("");
  const [phonenum, setphonenum] = useState("");
  const [email, setemail] = useState("");
  const [password, setpassword] = useState("");


  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        setLoading(false);
      },
      () => {
        setLoading(false);
        alert("Unable to retrieve your location");
      }
    );
  };




  return (
    <>
      <Navbar />
      <div className='min-h-screen w-full flex flex-col items-center justify-center py-10 px-4 '>

        <div className='w-full max-w-2xl bg-white dark:bg-transparent p-6 md:p-10 rounded-3xl shadow-2xl flex flex-col gap-6'>

          <h1 className='text-3xl font-extrabold dark:text-white text-center text-gray-800'>
            Create Account
          </h1>

          <form className='flex flex-col gap-5' onSubmit={(e) => e.preventDefault()}>

            {/* NEW: Are you a? Section */}
            <div className='flex flex-col items-start w-full gap-2'>
              <label className='ml-4 text-sm font-semibold dark:text-gray-300 text-gray-600'>
                Are you a?
              </label>
              <div className='flex w-full gap-4'>
                <button
                  type="button"
                  onClick={() => setUserRole('worker')}
                  className={`flex-1 py-3 rounded-full font-bold border-2 transition-all ${userRole === 'worker'
                    ? 'bg-cyan-500 border-cyan-500 text-white shadow-md'
                    : 'bg-transparent border-gray-200 text-gray-500 hover:border-cyan-200'
                    }`}
                >
                  Worker
                </button>
                <button
                  type="button"
                  onClick={() => setUserRole('consumer')}
                  className={`flex-1 py-3 rounded-full font-bold border-2 transition-all ${userRole === 'consumer'
                    ? 'bg-cyan-500 border-cyan-500 text-white shadow-md'
                    : 'bg-transparent border-gray-200 text-gray-500 hover:border-cyan-200'
                    }`}
                >
                  Consumer
                </button>
              </div>
            </div>

            {/* Names Grid */}
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              <div className='flex flex-col items-start'>
                <label className='ml-4 mb-1 text-sm font-semibold dark:text-gray-300 text-gray-600'>First Name</label>
                <input type="text" placeholder='First' value={firstname} onChange={(e) => setfirstname(e.target.value)} className='bg-white dark:bg-gray-800 dark:text-white rounded-full px-5 w-full border-2 border-cyan-500 h-12 outline-none focus:ring-2 focus:ring-cyan-300' />
              </div>
              <div className='flex flex-col items-start'>
                <label className='ml-4 mb-1 text-sm font-semibold dark:text-gray-300 text-gray-600'>Middle Name</label>
                <input type="text" placeholder='Middle' value={middlename} onChange={(e) => setmiddlename(e.target.value)} className='bg-white dark:bg-gray-800 dark:text-white rounded-full px-5 w-full border-2 border-cyan-500 h-12 outline-none focus:ring-2 focus:ring-cyan-300' />
              </div>
              <div className='flex flex-col items-start'>
                <label className='ml-4 mb-1 text-sm font-semibold dark:text-gray-300 text-gray-600'>Last Name</label>
                <input type="text" placeholder='Last' value={lastname} onChange={(e) => setlastname(e.target.value)} className='bg-white dark:bg-gray-800 dark:text-white rounded-full px-5 w-full border-2 border-cyan-500 h-12 outline-none focus:ring-2 focus:ring-cyan-300' />
              </div>
            </div>

            {/* Location Field */}
            <div className='flex flex-col items-start w-full relative'>
              <label className='ml-4 mb-1 text-sm font-semibold dark:text-gray-300 text-gray-600'>Location</label>
              <div className='w-full relative'>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder='Enter location or use GPS'
                  className='bg-white dark:bg-gray-800 dark:text-white rounded-full pl-5 pr-32 w-full border-2 border-cyan-500 h-12 outline-none'
                />
                <button
                  type="button"
                  onClick={handleGetLocation}
                  className='absolute right-2 top-1/2 -translate-y-1/2 bg-cyan-500 text-white text-[10px] md:text-xs font-bold py-2 px-3 rounded-full hover:bg-cyan-600 transition-colors'
                >
                  {loading ? '...' : '📍 Use GPS'}
                </button>
              </div>
            </div>

            <div className='flex flex-col items-start w-full'>
              <label className='ml-4 mb-1 text-sm font-semibold dark:text-gray-300 text-gray-600'>Phone Number</label>
              <input type="text" placeholder='Enter your phone number' value={phonenum} onChange={(e) => setphonenum(e.target.value)} className='bg-white dark:bg-gray-800 dark:text-white rounded-full px-5 w-full border-2 border-cyan-500 h-12 outline-none' />
            </div>

            <div className='flex flex-col items-start w-full'>
              <label className='ml-4 mb-1 text-sm font-semibold dark:text-gray-300 text-gray-600'>Email Address</label>
              <input type="email" placeholder='name@email.com' value={email} onChange={(e) => setemail(e.target.value)} className='bg-white dark:bg-gray-800 dark:text-white rounded-full px-5 w-full border-2 border-cyan-500 h-12 outline-none' />
            </div>

            <div className='flex flex-col items-start w-full'>
              <label className='ml-4 mb-1 text-sm font-semibold dark:text-gray-300 text-gray-600'>Password</label>
              <input type="password" placeholder='Create password' value={password} onChange={(e) => setpassword(e.target.value)} className='bg-white dark:bg-gray-800 dark:text-white rounded-full px-5 w-full border-2 border-cyan-500 h-12 outline-none' />
            </div>

            <button className="bg-cyan-500 w-full h-14 text-white rounded-full font-bold text-lg cursor-pointer hover:bg-cyan-600 hover:shadow-lg transform active:scale-95 transition-all mt-4" onClick={() => handlesubmit(userRole, location, firstname, middlename, lastname, phonenum, email, password)}>
              Create Account
            </button>
          </form>

          <div className='text-center'>
            <span className='text-gray-500 dark:text-gray-400 text-sm'>Already have an account? </span>
            <button className='text-cyan-500 font-bold underline cursor-pointer hover:text-cyan-700 text-sm' onClick={() => navigate("/login")}>
              Login
            </button>
          </div>

        </div>
      </div>
    </>
  )
}

export default CreateAccount