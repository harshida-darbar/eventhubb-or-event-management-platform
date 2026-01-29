import React, { useEffect, useState } from "react";
import { IoArrowBack } from "react-icons/io5";
import { SlCalender } from "react-icons/sl";
import { MdMarkUnreadChatAlt } from "react-icons/md";
import { FaRegUser } from "react-icons/fa6";
import { IoMdLogOut } from "react-icons/io";
import { useNavigate, useParams } from "react-router-dom";
import { db } from "../firebase";
import { toast } from "react-toastify";
import ReactStars from "react-stars";
import { MdStarRate, MdOutlineReviews } from "react-icons/md";

import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  Timestamp,
} from "firebase/firestore";

function BookEventsListing() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [events, setEvents] = useState(null);
  const [logoutPopup, setLogoutPopup] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [userName, setUserName] = useState("");
  const [showRatingPopup, setShowRatingPopup] = useState(false);
  const [canView, setCanView] = useState(false);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [ratingList, setRatingList] = useState([]);
  const [eventName, setEventName] = useState("");

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const docRef = doc(db, "events", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setEvents(docSnap.data());
        } else {
          toast.error("Not Foundd..");
        }
      } catch (error) {
        toast.error("not foundd.....");
      }
    };
    fetchEvents();
  }, [id]);

  const handleLogout = () => {
    localStorage.removeItem("EventHub");
    navigate("/login");
  };

  const fetchuserName = () => {
    const userData = JSON.parse(localStorage.getItem("EventHub"));
    const userName = userData?.name || "User";
    return userName;
  };

  useEffect(() => {
    const name = fetchuserName();
    setUserName(name);
  }, []);

  useEffect(() => {
    const bookedUsers = async () => {
      const user = JSON.parse(localStorage.getItem("EventHub"));
      if (!user?.uid) return;

      const eventEndDateTime = new Date(`${events.enddate} ${events.endtime}`);
      const now = new Date();

      if (now < eventEndDateTime) {
        setCanView(false);
        return;
      }

      const ordersRef = collection(db, "orders");
      const q = query(
        ordersRef,
        where("eventId", "==", id),
        where("bookedBy", "==", user.uid)
      );

      const snap = await getDocs(q);

      if (!snap.empty) {
        setCanView(true);
      } else {
        setCanView(false);
      }
    };

    if (events) bookedUsers();
  }, [events]);

  const sendRating = async () => {
    const user = JSON.parse(localStorage.getItem("EventHub"));

    if (!rating || !review.trim()) {
      toast.error("required rating and review");
      return;
    }

    try {
      await addDoc(collection(db, "rating"), {
        sendBy: user.name,
        userId: user.uid,
        rating: rating,
        review: review,
        eventId: id,
        eventName: events.eventName,
        createdBy: events.createdBy,
        organizerId: events.userId,
        timestamp: new Date().toISOString(),
      });

      toast.success("Rating and Review send successfully...");
      setShowRatingPopup(false);
      setRating(0);
      setReview("");
    } catch (err) {
      toast.error("rating not send");
    }
  };

  const fetchRatings = async () => {
    try {
      const eventRef = doc(db, "events", id);
      const eventSnap = await getDoc(eventRef);

      if (eventSnap.exists()) {
        setEventName(eventSnap.data().eventName || "Event");
      }

      const ratingRef = collection(db, "rating");
      const q = query(ratingRef, where("eventId", "==", id));
      const ratingSnap = await getDocs(q);

      const list = ratingSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setRatingList(list); 
    } catch (error) {
      console.log("Error fetching ratings:", error);
    }
  };

  useEffect(() => {
    fetchRatings();
  }, []);

  if (!events) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <h2 className="text-xl text-gray-500">Loading event details...</h2>
      </div>
    );
  }

  return (
    <div>
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-xl p-5 flex justify-between items-center">
          <div className="flex items-center gap-3 p-3">
            <IoArrowBack
              onClick={() => navigate("/bookevent")}
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
              className="flex px-2 py-1.5 items-center gap-1 text-purple-700 font-semibold cursor-pointer outline-none border border-purple-600 rounded-2xl hover:bg-purple-100 transition"
            >
              <FaRegUser size={20} className="text-purple-700 ml-2" />
              <span className="capitalize">{userName}</span>
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-2 w-40 bg-white shadow-xl rounded-lg p-2 z-50 border border-gray-200 animate-fadeIn">
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
              <div className="bg-white p-6 rounded-xl shadow-xl w-[350px] text-center">
                <h2 className="text-xl font-semibold text-gray-700 mb-4">
                  Are you sure you want to logout?
                </h2>

                <div className="flex justify-between gap-3">
                  <button
                    onClick={() => setLogoutPopup(false)}
                    className="w-full bg-gray-300 text-gray-700 py-2 rounded font-semibold hover:bg-gray-400 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full bg-red-600 text-white py-2 rounded font-semibold hover:bg-red-700 cursor-pointer"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="flex justify-center">
          <div className="max-w-[500px] w-full">
            <div className="bg-white shadow-2xl mt-10 rounded p-5">
              <h1 className="text-2xl font-semibold text-purple-700 capitalize">
                {events.eventName}
              </h1>
              <p className="mt-4 text-gray-600">{events.description}</p>
              <div className="mt-3 space-y-2">
                <div className="flex gap-20">
                  <p>
                    <span className="font-semibold text-gray-700">Type:</span>{" "}
                    {events.eventType}
                  </p>
                  <p>
                    <span className="font-semibold text-gray-700">Price:</span>{" "}
                    {events.price}
                  </p>
                </div>
                <div className="flex gap-14">
                  <p>
                    <span className="font-semibold text-gray-700">Start Date:</span>{" "}
                    {events.startdate}
                  </p>
                  <p>
                    <span className="font-semibold text-gray-700">End Date:</span>{" "}
                    {events.enddate}
                  </p>
                </div>
                <div className="flex gap-25">
                  <p>
                    <span className="font-semibold text-gray-700">Start Time:</span>{" "}
                    {events.starttime}
                  </p>
                  <p>
                    <span className="font-semibold text-gray-700">End Time:</span>{" "}
                    {events.endtime}
                  </p>
                </div>
                <div className="flex gap-24">
                  <p>
                    <span className="font-semibold text-gray-700">
                      Tickets:
                    </span>{" "}
                    {events.tickets}
                  </p>
                  <p>
                    <span className="font-semibold text-gray-700">Sold:</span>{" "}
                    {events.ticket_config.soldTickets}
                  </p>
                  <p>
                    <span className="font-semibold text-gray-700">
                      Available:
                    </span>{" "}
                    {events.ticket_config.availableTickets}
                  </p>
                </div>
                <p>
                  <span className="font-semibold text-gray-700">Location:</span>{" "}
                  {events.location}
                </p>
                <p className="flex gap-1">
                  <span className="font-semibold text-gray-700">
                    Created By:
                  </span>{" "}
                  {events.createdBy}
                  <MdMarkUnreadChatAlt
                    onClick={() => {
                      const stored =
                        JSON.parse(localStorage.getItem("EventHub")) || {};
                      stored.chatEventId = id;
                      localStorage.setItem("EventHub", JSON.stringify(stored));
                      navigate("/chat");
                    }}
                    size={20}
                    className="mt-1 text-purple-700 cursor-pointer"
                  />
                </p>
                <p className="text-2xl font-semibold text-purple-700 capitalize p-2">Rating & Review</p>
                <div className="mt-5 grid grid-rows-1 sm:grid-cols-2 lg:grid-cols-2 px-4 w-full gap-3">
                  {ratingList.map((r) => (
                    <div
                      key={r.id}
                      className="p-4 bg-gray-100 rounded-xl shadow border border-gray-200"
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

                {canView && (
                  <button
                    onClick={() => setShowRatingPopup(true)}
                    className="bg-purple-600 text-white font-semibold mt-6 p-3 rounded-lg w-full
                  hover:bg-purple-700 transition"
                  >
                    Rate & Review
                  </button>
                )}
              </div>
              {showRatingPopup && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50">
                  <div className="bg-white p-6 rounded-xl shadow-xl w-[350px]">
                    <h2 className="text-xl font-semibold text-purple-700 mb-4">
                      Rate & Review
                    </h2>

                    <ReactStars
                      count={5}
                      value={rating}
                      size={35}
                      color2={"#9333EA"}
                      color1={"#d1d5db"}
                      onChange={(newRating) => setRating(newRating)}
                      edit={true}
                    />

                    <textarea
                      placeholder="Write your review..."
                      value={review}
                      onChange={(e) => setReview(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && sendRating()}
                      className="w-full mt-4 p-3 border border-gray-300 rounded-lg 
                      focus:ring-2 focus:ring-purple-500 outline-none"
                      rows={4}
                    />

                    <div className="flex justify-between gap-3 mt-4">
                      <button
                        onClick={() => setShowRatingPopup(false)}
                        className="w-full bg-gray-300 text-gray-700 py-2 rounded font-semibold hover:bg-gray-400"
                      >
                        Cancel
                      </button>

                      <button
                        onClick={() => sendRating()}
                        className="w-full bg-purple-600 text-white py-2 rounded font-semibold hover:bg-purple-700"
                      >
                        Submit
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookEventsListing;
