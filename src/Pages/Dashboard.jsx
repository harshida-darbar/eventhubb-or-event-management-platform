import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SlCalender } from "react-icons/sl";
import { IoSearch } from "react-icons/io5";
import { BiBookReader } from "react-icons/bi";
import { AiOutlineBarChart } from "react-icons/ai";
import { FaRegUser } from "react-icons/fa6";
import { IoMdLogOut } from "react-icons/io";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import Hero from "./Hero";
import Section2 from "./Section2";
import ButtonComponent from "../Components/ButtonComponent";

function Dashboard() {
  const navigate = useNavigate();
  const [logoutPopup, setLogoutPopup] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [userName, setUserName] = useState("");

  const handleLogout = () => {
    localStorage.removeItem("EventHub");
    navigate("/login");
  };

  const fetchuserData = () => {
    const userData = JSON.parse(localStorage.getItem("EventHub"));
    const userName = userData?.name || "User";
    return userName;
  };

  useEffect(() => {
    const name = fetchuserData();
    setUserName(name);
  }, []);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("EventHub"));
    if (!user) return;

    const unsub = onSnapshot(doc(db, "users", user.uid), (snap) => {
      if (!snap.exists()) return;

      const data = snap.data();

      if (data.status !== 1) {
        localStorage.removeItem("EventHub");
        toast.error("Unauthorized User");
        navigate("/login");
      }
    });

    return () => unsub();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-xl py-3 px-6 flex justify-between items-center">
        <div className="flex items-center gap-3 p-3">
          <SlCalender
            size={35}
            className="bg-purple-600 text-white p-1 rounded"
          />
          <h1 className="text-purple-600 text-2xl font-semibold">EventHub</h1>
        </div>

        <div className="hidden md:flex text-purple-600 lg:ml-[700px] font-semibold cursor-pointer gap-6 text-[17px]">
          <p
            className="hover:text-purple-700"
            onClick={() => navigate("/bookevent")}
          >
            All Events
          </p>
          <p
            className="hover:text-purple-700"
            onClick={() => navigate("/chat")}
          >
            Chats
          </p>
          <p
            className="hover:text-purple-700"
            onClick={() => navigate("/mytickets")}
          >
            My Bookings
          </p>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 text-purple-700 font-semibold border border-purple-600 rounded-xl px-2 py-2"
          >
            <FaRegUser size={18} />
            <span className="capitalize">{userName}</span>
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-2 w-40 bg-white shadow-lg rounded-lg p-2 z-50 border border-gray-200">
              <p
                className="p-2 hover:bg-purple-100 rounded cursor-pointer"
                onClick={() => navigate("/profile")}
              >
                My Profile
              </p>
              <p
                className="p-2 hover:bg-purple-100 rounded cursor-pointer"
                onClick={() => navigate("/mytickets")}
              >
                My Tickets
              </p>
              <p
                className="p-2 hover:bg-purple-100 rounded cursor-pointer"
                onClick={() => navigate("/wishlist")}
              >
                Wishlist
              </p>

              <p
                className="p-2 hover:bg-red-100 text-red-600 rounded cursor-pointer flex items-center gap-2"
                onClick={() => {
                  setShowDropdown(false);
                  setLogoutPopup(true);
                }}
              >
                <IoMdLogOut /> Logout
              </p>
            </div>
          )}
        </div>

        {logoutPopup && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-[350px] text-center">
              <h2 className="text-xl font-semibold text-gray-700 mb-4">
                Are you sure you want to logout?
              </h2>

              <div className="flex justify-between gap-3">
                <ButtonComponent
                  handleClick={() => setLogoutPopup(false)}
                  label="Cancel"
                  className=" bg-gray-300 text-gray-700  hover:bg-gray-400"
                />
                  

                <ButtonComponent
                  handleClick={handleLogout}
                  label="Logout"
                  className="bg-red-600 text-white hover:bg-red-700"
                />
                  
              </div>
            </div>
          </div>
        )}
      </div>

      <section className="w-full h-[30vh] md:h-[350px] xl:h-[550px] sm:h-[200px] lg:h-[340px]">
        <Hero />
      </section>

      <section className="mt-5">
        <Section2 />
      </section>

      <div className="text-center mt-20">
        <h1 className="text-4xl font-bold mb-2">Find Your Next Adventure</h1>
        <p className="text-3xl font-semibold mb-4 text-purple-600">
          Exciting Events Nearby
        </p>
        <p className="max-w-md mx-auto text-gray-600">
          Explore workshops, concerts, and meetups in your city. <br />
          Discover events that match your passions and connect with others.
        </p>

        <div className="flex gap-5 items-center justify-center mt-5">
          <ButtonComponent
          handleClick={() => navigate("/bookevent")}
          label=" Explore Events"
           className="bg-purple-600 hover:bg-purple-700 px-5 py-2 lg:w-[200px] rounded-md font-semibold transition cursor-pointer"
        />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-16 mb-20 w-full max-w-[1200px] mx-auto px-4 cursor-pointer">
        <div
          onClick={() => navigate("/bookevent")}
          className="bg-white shadow-xl p-6 rounded-xl transition-transform hover:scale-[1.02]"
        >
          <IoSearch size={40} className="text-green-700 mb-2" />
          <h1 className="font-semibold text-xl">Explore Events</h1>
          <p className="text-gray-500">
            Find events near you easily. Filter by type, date, or location.
          </p>
        </div>

        <div
          onClick={() => navigate("/bookevent")}
          className="bg-white shadow-xl p-6 rounded-xl transition-transform hover:scale-[1.02]"
        >
          <BiBookReader size={40} className="text-indigo-700 mb-2" />
          <h1 className="font-semibold text-xl">Seamless Booking</h1>
          <p className="text-gray-500">
            Reserve your spot in just a few clicks.
          </p>
        </div>

        <div
          onClick={() => navigate("/bookevent")}
          className="bg-white shadow-xl p-6 rounded-xl transition-transform hover:scale-[1.02]"
        >
          <AiOutlineBarChart size={40} className="text-pink-600 mb-2" />
          <h1 className="font-semibold text-xl">Stay Updated</h1>
          <p className="text-gray-500">
            Get notifications about new events & special offers.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
