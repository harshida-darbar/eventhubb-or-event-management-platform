import React, { useEffect, useState } from "react";
import { SlCalender } from "react-icons/sl";
import { IoArrowBack } from "react-icons/io5";
import { IoEyeSharp } from "react-icons/io5";
import { FaRegUser } from "react-icons/fa6";
import { IoMdLogOut } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { db } from "../firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  deleteDoc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import ButtonComponent from "../Components/ButtonComponent";

function MyTickets() {
  const [tickets, setTickets] = useState([]);
  const [logoutPopup, setLogoutPopup] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [cancelPopup, setCancelPop] = useState(null);
  const [alertPopup, setAlertPopup] = useState("");
  const [userName, setUserName] = useState("");
  const navigate = useNavigate();

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

  const userId = JSON.parse(localStorage.getItem("EventHub"))?.uid;
  useEffect(() => {
    const q = query(collection(db, "orders"), where("bookedBy", "==", userId));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const liveTickets = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setTickets(liveTickets);
    });

    return () => unsubscribe();
  }, [userId]);

  const confirmCancel = async (ticket) => {
    try {
      await deleteDoc(doc(db, "orders", ticket.id));
      const eventRef = doc(db, "events", ticket.eventId);
      const eventSnap = await getDoc(eventRef);

      if (eventSnap.exists()) {
        const eventData = eventSnap.data();
        const config = eventData.ticket_config;

        await updateDoc(eventRef, {
          ticket_config: {
            totalTickets: config.totalTickets,
            availableTickets: config.availableTickets + ticket.users.length,
            soldTickets: config.soldTickets - ticket.users.length,
          },
        });
      }

      setCancelPop(null);
      toast.success("Ticket cancelled successfully!");
    } catch (err) {
      setAlertPopup("Unable to cancel ticket");
    }
  };

  const handleCancel = (ticket) => {
    const eventDateTime = new Date(`${ticket.startdate} ${ticket.starttime}`);
    const now = new Date();

    if (now >= eventDateTime) {
      setAlertPopup("Event already started. Cancellation not allowed.");
      return;
    }

    const diffHours = (eventDateTime - now) / (1000 * 60 * 60);

    if (diffHours < 24) {
      setCancelPop(ticket);
      return;
    }
    confirmCancel(ticket);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-xl py-3 px-5 flex justify-between items-center">
        <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3">
          <IoArrowBack
            onClick={() => navigate("/maindashboard")}
            size={28}
            className="text-purple-600 cursor-pointer sm:size-[35px]"
          />

          <SlCalender
            size={28}
            className="bg-purple-600 text-white p-1 rounded sm:size-[35px]"
          />

          <h1 className="text-purple-600 text-xl sm:text-2xl font-semibold">
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
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 px-4">
            <div className="bg-white p-5 sm:p-6 rounded-lg shadow-xl w-full max-w-xs sm:w-[350px] text-center">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-700 mb-4">
                Are you sure you want to logout?
              </h2>

              <div className="flex gap-3">
                <ButtonComponent
                  handleClick={() => setLogoutPopup(false)}
                  label="Cancel"
                  className="bg-gray-300 text-gray-700  hover:bg-gray-400"
                />

                <ButtonComponent
                  handleClick={handleLogout}
                  label="Logout"
                  className=" bg-red-600 hover:bg-red-700"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-5 bg-white shadow-lg m-5 rounded">
        <h2 className="text-2xl font-semibold text-center text-purple-800">
          My Tickets
        </h2>

        <div className="hidden md:block overflow-x-auto mt-5">
          <table className="min-w-full text-left border border-gray-300">
            <thead className="bg-purple-100 text-purple-800">
              <tr>
                <th className="px-4 py-2 border-r border-gray-300">#</th>
                <th className="px-4 py-2 border-r border-gray-300">
                  Event Name
                </th>
                <th className="px-4 py-2 border-r border-gray-300">
                  Start Date
                </th>
                <th className="px-4 py-2 border-r border-gray-300">
                  Start Time
                </th>
                <th className="px-4 py-2 border-r border-gray-300">
                  Price Per Ticket
                </th>
                <th className="px-4 py-2 border-r border-gray-300">
                  Total Price
                </th>
                <th className="px-4 py-2 border-r border-gray-300">
                  Total Users
                </th>
                <th className="px-4 py-2 border-r border-gray-300">
                  Scanned At
                </th>
                <th className="px-4 py-2 border-r border-gray-300">Action</th>
                <th className="px-4 py-2">Options</th>
              </tr>
            </thead>

            <tbody>
              {tickets.map((ticket, index) => (
                <tr key={index} className="border border-gray-300">
                  <td className="px-4 py-2 border-r border-gray-300">
                    {index + 1}
                  </td>
                  <td className="px-4 py-2 border-r border-gray-300">
                    {ticket.eventName}
                  </td>
                  <td className="px-4 py-2 border-r border-gray-300">
                    {ticket.startdate}
                  </td>
                  <td className="px-4 py-2 border-r border-gray-300">
                    {ticket.starttime}
                  </td>
                  <td className="px-4 py-2 border-r border-gray-300">
                    ₹{ticket.pricePerTicket}
                  </td>
                  <td className="px-4 py-2 border-r border-gray-300">
                    ₹{ticket.totalPrice}
                  </td>
                  <td className="px-4 py-2 border-r border-gray-300">
                    {ticket.users.length}
                  </td>
                  <td className="px-4 py-2 border-r border-gray-300">
                    {ticket.scannedAt
                      ? new Date(ticket.scannedAt).toLocaleString()
                      : "Not scanned"}
                  </td>

                  <td className="px-4 py-2 text-center border-r border-gray-300">
                    <IoEyeSharp
                      onClick={() =>
                        navigate("/ticketsview", {
                          state: { ticket, showQR: true },
                        })
                      }
                      size={22}
                      className="text-purple-800 cursor-pointer "
                    />
                  </td>
                  <td className="px-4 py-2 border-r border-gray-300 ">
                    <ButtonComponent
                      handleClick={() => handleCancel(ticket)}
                      label="Cancel"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="md:hidden mt-6 space-y-4">
          {tickets.map((ticket, index) => (
            <div 
              key={index}
              className="border border-gray-300 p-4 rounded-lg shadow-sm"
            >
              <div className="flex justify-between">
                <h3 className="text-lg font-semibold text-purple-700">
                  {ticket.eventName}
                </h3>
                <span className="text-gray-500">#{index + 1}</span>
              </div>

              <p className="mt-1 text-gray-700">
                <span className="font-semibold">Date:</span>{" "}
                {ticket.createdAt?.seconds
                  ? new Date(
                      ticket.createdAt.seconds * 1000
                    ).toLocaleDateString()
                  : new Date(ticket.createdAt).toLocaleDateString()}
              </p>

              <p className="text-gray-700">
                <span className="font-semibold">Price/Ticket:</span> ₹
                {ticket.pricePerTicket}
              </p>

              <p className="text-gray-700">
                <span className="font-semibold">Total Price:</span> ₹
                {ticket.totalPrice}
              </p>

              <p className="text-gray-700">
                <span className="font-semibold">Total Users:</span>{" "}
                {ticket.users.length}
              </p>

              <p className="text-gray-700">
                <span className="font-semibold">Scanned At:</span>{" "}
                {ticket.scannedAt
                  ? new Date(ticket.scannedAt).toLocaleString()
                  : "Not scanned"}
              </p>

              <ButtonComponent
                label="View Ticket"
                handleClick={() =>
                  navigate("/ticketsview", {
                    state: { ticket, showQR: true },
                  })
                }
              />
            </div>
          ))}
        </div>

        {tickets.length === 0 && (
          <p className="text-center text-gray-500 mt-4">
            No tickets booked yet.
          </p>
        )}
      </div>

      {cancelPopup && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-[350px] text-center">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">
              This event will start within 24 hours. Are you sure you want to
              cancel this ticket?
            </h2>

            <div className="flex justify-between gap-3">
              <ButtonComponent
                handleClick={() => setCancelPop(null)}
                label="No"
              />
              <ButtonComponent
                handleClick={() => confirmCancel(cancelPopup)}
                label="Cancel"
              />
            </div>
          </div>
        </div>
      )}

      {alertPopup && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-[350px] text-center">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">
              {alertPopup}
            </h2>

            <ButtonComponent
              handleClick={() => setAlertPopup("")}
              label="OK"
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default MyTickets;
