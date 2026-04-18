import React, { useState, useEffect } from 'react';
import { Clock, MapPin, Phone, IndianRupee, ChevronRight, Calendar } from 'lucide-react';
import Usernav from '../components/Usernav';

const WorkerBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' or 'history'
  const [loading, setLoading] = useState(false);

  // Simulating the API call to your Flask backend
  const fetchBookings = async (status) => {
    setLoading(true);
    try {
      // In reality: const response = await fetch(`/worker-bookings?status=${status}`, { headers: { 'Authorization': `Bearer ${token}` } });
      // const result = await response.json();
      // setBookings(result.data);

      // Mock data matching your backend's row formatting
      const mockData = status === 'pending' ? [
        {
          booking_id: 101,
          service: "Professional Plumber Consultation",
          status: "pending",
          scheduled_time: "2024-05-20T10:00:00 to 2024-05-20T12:00:00",
          customer: {
            name: "Rahul Sharma",
            phone: "+91 98765 43210",
            address: "Flat 402, Sunshine Apts, Sector 45, Gurgaon, HR, 122003"
          },
          payout: 199.00
        }
      ] : [
        {
          booking_id: 99,
          service: "AC Service & Gas Recharge",
          status: "completed",
          scheduled_time: "2024-05-15T14:00:00 to 2024-05-15T16:00:00",
          customer: {
            name: "Anjali Gupta",
            phone: "+91 99887 76655",
            address: "House 12, Park Street, New Delhi, DL, 110001"
          },
          payout: 449.00
        }
      ];
      setBookings(mockData);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings(activeTab);
  }, [activeTab]);

  return (
    <>
      <Usernav page="Bookings" />
      <div className="min-h-screen bg-transparent py-8 px-4 md:px-10">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">My Bookings</h1>

          {/* Tab Switcher */}
          <div className="flex gap-6 border-b border-gray-200 mb-8">
            {['pending', 'history'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 text-sm font-semibold capitalize transition-all ${activeTab === tab
                    ? "text-cyan-600 border-b-2 border-cyan-600"
                    : "text-gray-500 hover:text-gray-700"
                  }`}
              >
                {tab === 'history' ? 'Work History' : 'Upcoming Jobs'}
              </button>
            ))}
          </div>

          {/* Bookings List */}
          <div className="space-y-4">
            {loading ? (
              <p className="text-center text-gray-500 py-10">Loading assignments...</p>
            ) : bookings.length > 0 ? (
              bookings.map((job) => (
                <div key={job.booking_id} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex flex-col md:flex-row justify-between gap-4">

                    {/* Left: Job Info */}
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded ${job.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                          }`}>
                          {job.status}
                        </span>
                        <h2 className="font-bold text-gray-800 text-lg">{job.service}</h2>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600">
                        <div className="flex items-start gap-2">
                          <Clock size={16} className="mt-0.5 text-cyan-500" />
                          <span>{new Date(job.scheduled_time.split(' to ')[0]).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <MapPin size={16} className="mt-0.5 text-cyan-500" />
                          <span className="line-clamp-1">{job.customer.address}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone size={16} className="text-cyan-500" />
                          <span>{job.customer.phone}</span>
                        </div>
                        <div className="flex items-center gap-2 font-bold text-gray-900">
                          <IndianRupee size={16} className="text-green-600" />
                          <span>Payout: ₹{job.payout}</span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex flex-row md:flex-col justify-end gap-2 border-t md:border-t-0 pt-4 md:pt-0 md:pl-6 border-gray-100">
                      <button className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-white px-6 py-2 rounded-lg font-bold text-sm transition-colors">
                        Accept
                      </button>
                      {job.status === 'pending' && (
                        <button className="flex-1 border border-gray-300 hover:bg-gray-50 text-gray-700 px-6 py-2 rounded-lg font-bold text-sm transition-colors">
                          Decline
                        </button>
                      )}
                    </div>

                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
                <Calendar className="mx-auto text-gray-300 mb-2" size={48} />
                <p className="text-gray-500">No {activeTab} bookings found.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default WorkerBookings;