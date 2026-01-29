import React, { useEffect, useState } from "react";
import { SlCalender } from "react-icons/sl";
import { IoArrowBack } from "react-icons/io5";
import { useLocation, useNavigate } from "react-router-dom";
import QRCode from "qrcode";
import { toast } from "react-toastify";
import { getFirestore, doc, getDoc, updateDoc } from "firebase/firestore";
import { FaRegUser } from "react-icons/fa6";
import { IoMdLogOut } from "react-icons/io";
import ButtonComponent from "../Components/ButtonComponent";

const db = getFirestore();

function TicketsDetailsView() {
  const navigate = useNavigate();
  const location = useLocation();

  const { ticket, showQR, isOrganizer } = location.state || {};
  const [ticketData, setTicketData] = useState(null);
  const [qrImage, setQrImage] = useState("");
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
    if (!ticket?.id) {
      navigate("/mytickets");
      return;
    }

    if (showQR) {
      generateQR(ticket.id);
    }

    fetchTicketFromDB(ticket.id);
  }, []);

  const generateQR = async (id) => {
    try {
      const qr = await QRCode.toDataURL(id);
      setQrImage(qr);
    } catch (error) {
      toast.error("QR not generated");
    }
  };

  const fetchTicketFromDB = async (id) => {
    try {
      const docRef = doc(db, "orders", id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setTicketData({ id, ...docSnap.data() });
      } else {
        toast.error("Not found!");
      }
    } catch (error) {
      toast.error("Not fetching ticket");
    }
  };

  if (!ticketData)
    return <p className="text-center mt-10">Loading ticket...</p>;

  const d = ticketData.createdAt?.seconds
    ? new Date(ticketData.createdAt.seconds * 1000)
    : new Date(ticketData.createdAt);

  const handleApprove = async (id) => {
    try {
      const ref = doc(db, "orders", id);
      await updateDoc(ref, {
        isScanned: true,
        scannedAt: new Date().toISOString(),
      });
      toast.success("Ticket Approved!");
      navigate("/maindashboard");
    } catch (err) {
      toast.error("Not Approve");
    }
  };

  return (
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
            className="flex items-center gap-1 text-purple-700 font-semibold cursor-pointer  outline-none border border-purple-600 rounded-2xl w-[110px] h-10"
          >
            <FaRegUser size={20} className="text-purple-700 ml-2" />
            <span>{userName}</span>
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

      <div className="flex justify-center items-center mt-7">
        <div className="p-6 shadow-xl m-5 rounded-lg w-[500px] bg-white border border-purple-200">
          <h2 className="text-2xl font-semibold text-center text-purple-800 mb-4">
            Ticket Details
          </h2>

          <div className="space-y-3 text-lg text-gray-700">
            <p>
              <strong>Event Name:</strong> {ticketData.eventName}
            </p>
            <p>
              <strong>Date:</strong> {d.toLocaleDateString()}
            </p>
            <p>
              <strong>Price / Ticket:</strong> ₹{ticketData.pricePerTicket}
            </p>
            <p>
              <strong>Total Price:</strong> ₹{ticketData.totalPrice}
            </p>
            <p>
              <strong>Total Users:</strong> {ticketData.users?.length}
            </p>
            <p>
              <strong>Order ID:</strong> {ticketData.id}
            </p>
            <p>
              <strong>Scanned At:</strong>
              {ticketData.scannedAt
                ? new Date(ticketData.scannedAt).toLocaleString()
                : "Not scanned"}
            </p>
            
            {isOrganizer && (
              <div className="flex gap-10 mt-5">
                <ButtonComponent
                  handleClick={() => navigate("/maindashboard")}
                  label="Cancel"
                  className="px-8 py-3 w-[50%] bg-gray-300 font-semibold hover:bg-gray-500 cursor-pointer"
                />

                <ButtonComponent
                  handleClick={() => handleApprove(ticketData.id)}
                  label="Approve"
                  className="border px-8 py-3 w-[50%] bg-green-500 font-semibold text-white hover:bg-green-700 cursor-pointer"
                />
                  
              </div>
            )}

          </div>

          {showQR && !isOrganizer && (
            <div className="mt-6 text-center">
              <h3 className="text-xl font-semibold text-purple-700 mb-3">
                QR Code
              </h3>
              <img
                src={qrImage}
                alt="QR"
                className="w-48 h-48 mx-auto border p-2 rounded shadow"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TicketsDetailsView;
