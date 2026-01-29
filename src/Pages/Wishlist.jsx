import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SlCalender } from "react-icons/sl";
import { IoArrowBack } from "react-icons/io5";
import { FaHeart } from "react-icons/fa";
import { FaRegUser } from "react-icons/fa6";
import { IoMdLogOut } from "react-icons/io";
import { doc, getDoc, updateDoc, arrayRemove, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { toast } from "react-toastify";
import ButtonComponent from "../Components/ButtonComponent";

function Wishlist() {
  const navigate = useNavigate();
  const [wishlist, setWishlist] = useState([]);
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
    const fetchWishlist = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("EventHub"));
        const uid = user?.uid;
        if (!uid) return;

        const ref = doc(db, "users", uid);
        const snapshot = await getDoc(ref);

        if (snapshot.exists()) {
          setWishlist(snapshot.data().wishlist || []);
        }
      } catch (err) {
        console.log(err);
        toast.error("Failed to load wishlist");
      }
    };

    fetchWishlist();
  }, []);

  const removeFromWishlist = async (event) => {
    try {
      const user = JSON.parse(localStorage.getItem("EventHub"));
      if (!user?.uid) return toast.error("login...");

      const userRef = doc(db, "users", user.uid);

      await updateDoc(userRef, {
        wishlist: arrayRemove(event),
      });

      setWishlist((prev) => prev.filter((item) => item.id !== event.id));
      toast.success("Removed from wishlist!");
    } catch (err) {
      console.log(err);
      toast.error("Failed to remove");
    }
  };

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

  useEffect(() => {
  if (wishlist.length === 0) return;

  const unsubscribers = [];

  const fetchRealtimeEvents = () => {
    const updated = [];

    wishlist.forEach((item) => {
      const eventId = item.id;

      const eventRef = doc(db, "events", eventId);

      const unsub = onSnapshot(eventRef, (snap) => {
        if (snap.exists()) {
          updated.push({
            ...item,        
            ...snap.data(),  
          });

          setWishlist([...updated]);
        }
      });

      unsubscribers.push(unsub);
    });
  };

  fetchRealtimeEvents();

  return () => unsubscribers.forEach((u) => u());
}, [wishlist.length]);


  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-xl p-4 md:p-5 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <IoArrowBack
            onClick={() => navigate("/bookevent")}
            size={30}
            className="text-purple-600 cursor-pointer"
          />
          <SlCalender
            size={30}
            className="bg-purple-600 text-white p-1 rounded"
          />
          <h1 className="text-purple-600 text-xl md:text-2xl font-semibold">
            EventHub
          </h1>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 text-purple-700 font-semibold border border-purple-600 rounded-xl px-3 py-2"
          >
            <FaRegUser size={18} />
            <span className="capitalize">{userName}</span>
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-2 w-40 bg-white shadow-lg rounded-lg p-2 z-50 border border-gray-200">
              <p className="p-2 hover:bg-purple-100 rounded cursor-pointer" onClick={() => navigate("/profile")}>My Profile</p>
              <p className="p-2 hover:bg-purple-100 rounded cursor-pointer" onClick={() => navigate("/mytickets")}>My Tickets</p>
              <p className="p-2 hover:bg-purple-100 rounded cursor-pointer" onClick={() => navigate("/wishlist")}>Wishlist</p>

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
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-sm text-center">
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

      <div className="flex justify-center">
        <div className="bg-white mt-10 w-full max-w-3xl p-5 rounded-2xl shadow-xl mx-3">
          <h1 className="text-purple-800 text-2xl font-bold text-center">
            My Wishlist
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 p-5 max-w-screen mx-auto">
        {wishlist.length === 0 ? (
          <p className="text-gray-600 mt-5 text-center col-span-full">
            No items in wishlist...
          </p>
        ) : (
          wishlist.map((e, i) => (
            <div
              key={i}
              className="relative border border-gray-300 p-4 rounded-xl shadow-md bg-white"
            >
              <h3 className="text-xl text-purple-800">{e.eventName}</h3>

              <FaHeart
                onClick={() => removeFromWishlist(e)}
                size={25}
                className="absolute top-4 right-4 text-red-500 cursor-pointer"
              />

              <p className="text-sm text-gray-500 mt-1">{e.description}</p>
              <p className="text-sm text-gray-500 mt-1"><strong>ID:</strong> {e.id}</p>
              <p className="text-sm text-gray-500 mt-1"><strong>Price:</strong> {e.price}</p>
              <p className="text-sm text-gray-500 mt-1"><strong>Start Date:</strong> {e.startdate}</p>
              <p className="text-sm text-gray-500 mt-1"><strong>End Date:</strong> {e.enddate}</p>
              <p className="text-sm text-gray-500 mt-1"><strong>Start Time:</strong> {e.starttime}</p>
              <p className="text-sm text-gray-500 mt-1"><strong>End Time:</strong> {e.endtime}</p>
              <p className="text-sm text-gray-500 mt-1"><strong>Type:</strong> {e.eventType}</p>
              <p className="text-sm text-gray-500 mt-1"><strong>Total Tickets:</strong> {e.ticket_config?.totalTickets}</p>
              <p className="text-sm text-gray-500 mt-1"><strong>Sold Tickets:</strong> {e.ticket_config?.soldTickets}</p>
              <p className="text-sm text-gray-500 mt-1"><strong>Available:</strong> {e.ticket_config?.availableTickets}</p>
              <p className="text-sm text-gray-500 mt-1"><strong>Location:</strong> {e.location}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Wishlist;
