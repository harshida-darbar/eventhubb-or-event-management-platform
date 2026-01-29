import React, { useEffect, useState } from "react";
import { SlCalender } from "react-icons/sl";
import { IoArrowBack } from "react-icons/io5";
import { IoMdLogOut } from "react-icons/io";
import { FaRegUser } from "react-icons/fa6";
import { useParams, useNavigate } from "react-router-dom";
import { MdStarRate, MdOutlineReviews } from "react-icons/md";
import { db } from "../firebase";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import ButtonComponent from "../Components/ButtonComponent";

function OrgRating() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");
  const [logoutPopup, setLogoutPopup] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const { eventId } = useParams();
  const [ratings, setRatings] = useState([]);
  const [eventName, setEventName] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchRatings = async () => {
    try {
      const eventRef = doc(db, "events", eventId);
      const eventSnap = await getDoc(eventRef);
      if (eventSnap.exists()) {
        setEventName(eventSnap.data().eventName || "Event");
      }

      const ratingRef = collection(db, "rating");
      const q = query(ratingRef, where("eventId", "==", eventId));
      const ratingSnap = await getDocs(q);

      const list = ratingSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setRatings(list);
    } catch (error) {
      console.log("Error fetching ratings:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRatings();
  }, []);

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

  return (
    <div>
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-xl p-5 flex justify-between items-center">
          <div className="flex items-center gap-3 p-3">
            <IoArrowBack
              onClick={() => navigate("/maindashboard")}
              size={35}
              className="text-purple-600 cursor-pointer"
            />
            <SlCalender
              size={35}
              className="bg-purple-600 text-white p-1 rounded"
            />
            <h1 className="text-purple-600 text-2xl font-semibold">EventHub</h1>
          </div>

          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-1 text-purple-700 font-semibold cursor-pointer  outline-none border border-purple-600 rounded-2xl px-2 py-4  h-10"
            >
              <FaRegUser size={20} className="text-purple-700 ml-2" />
              <span className="capitalize">{userName}</span>
            </button>

            {showDropdown && (
              <div
                className="
                            absolute right-0 mt-2 w-40 bg-white shadow-lg rounded-lg p-2 
                            z-50 border border-gray-200
                          "
              >
                <p
                  className="p-2 hover:bg-purple-100 rounded cursor-pointer"
                  onClick={() => navigate("/profile")}
                >
                  My Profile
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
                    className="bg-gray-300 text-gray-700 hover:bg-gray-400"
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

        <h2 className="text-xl text-center text-gray-700 mt-20">
          Event : {eventName}
        </h2>

        {loading ? (
          <p className="text-center mt-10 text-gray-600">Loading...</p>
        ) : ratings.length === 0 ? (
          <p className="text-center mt-10 text-gray-600">No ratings found</p>
        ) : (
          <div className="mt-8 grid grid-rows-1 sm:grid-cols-2 lg:grid-cols-4 px-4 w-full gap-3">
            {ratings.map((r) => (
              <div
                key={r.id}
                className="p-4 bg-white rounded-xl shadow border border-gray-200"
              >
                <p className="flex items-center gap-2 text-lg font-semibold text-gray-800">
                  <MdStarRate className="text-yellow-500" />
                  {r.rating}
                </p>

                <p className="flex items-start gap-2 mt-2 text-gray-700">
                  <MdOutlineReviews className="text-purple-600 mt-1" />
                  {r.review}
                </p>

                <p className="mt-2 text-sm text-gray-500">— {r.sendBy}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default OrgRating;
