import React, { useEffect, useState } from "react";
import { SlCalender } from "react-icons/sl";
import { TfiControlForward } from "react-icons/tfi";
import { IoArrowBack } from "react-icons/io5";
import { data, useNavigate } from "react-router-dom";
import { FaRegUser } from "react-icons/fa6";
import { IoMdLogOut } from "react-icons/io";
import { onSnapshot, doc } from "firebase/firestore";
import { db } from "../firebase";
import ButtonComponent from "../Components/ButtonComponent";

function MyProfile() {
  const navigate = useNavigate();

  const [userData, setUserData] = useState(null);
  const [logoutPopup, setLogoutPopup] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [userName, setUserName] = useState("");
  const [editView, setEditView] = useState(false);

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

  const fetchuserData = () => {
    const data = JSON.parse(localStorage.getItem("EventHub"));
    setUserData(data);
  };

  useEffect(() => {
    fetchuserData();
  }, []);

  const editViewOpen = () => {
    setEditView(data);
  };
  useEffect(() => {
    editViewOpen();
  }, []);

  const handleSave = () => {
    const updatedUser = {
      ...userData,
      name: userData.name,
      email: userData.email,
      role: userData.role,
    };
    localStorage.setItem("EventHub", JSON.stringify(updatedUser));
    setEditView(false);
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

  return (
    <div className="min-h-screen bg-gradiant-to-br from-purple-100 to-purple-200">
      <div className="bg-white shadow-xl py-3 px-5 flex justify-between items-center sticky top-0">
        <div className="flex items-center gap-3 p-2 sm:p-3">
          <IoArrowBack
            onClick={() => navigate("/maindashboard")}
            size={30}
            className="text-purple-600 cursor-pointer"
          />
          <SlCalender
            size={30}
            className="bg-purple-600 text-white p-1 rounded"
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
      </div>

      <div className="flex justify-center items-center mt-10 px-4">
        <div className="bg-white p-5 shadow-2xl rounded-3xl w-full max-w-md border border-purple-200 mb-5">
          <div className="flex flex-col items-center">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-purple-500 flex items-center justify-center shadow-lg text-white text-3xl sm:text-4xl font-bold">
              {userName?.charAt(0)?.toUpperCase()}
            </div>

            <h2 className="text-2xl sm:text-3xl font-semibold text-purple-800 mt-4">
              My Profile
            </h2>
            <p className="text-gray-500 text-sm">
              Manage your personal information
            </p>
          </div>

          <div className="mt-7 space-y-4">
            <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-xl border border-purple-200">
              <FaRegUser className="text-purple-700" size={22} />
              {editView ? (
                <input
                  type="text"
                  value={userData?.name}
                  onChange={(e) =>
                    setUserData({ ...userData, name: e.target.value })
                  }
                  className="outline-none w-full bg-transparent border-b border-purple-300"
                />
              ) : (
                <span className="text-lg font-semibold break-all">
                  {userData?.name}
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-xl border border-purple-200">
              <span className="text-purple-700 text-xl">@</span>
              {editView ? (
                <input
                  type="email"
                  value={userData?.email}
                  onChange={(e) =>
                    setUserData({ ...userData, email: e.target.value })
                  }
                  className="outline-none w-full bg-transparent border-b border-purple-300"
                />
              ) : (
                <span className="text-lg font-semibold break-all">
                  {userData?.email}
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-xl border border-purple-200">
              <TfiControlForward className="text-purple-700" size={22} />
              <span className="text-lg font-semibold">{userData?.role}</span>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <ButtonComponent
                handleClick={() => setEditView(true)}
                label="Edit"
                className="sm:w-1/2 bg-green-500 hover:bg-green-700"
              />

              <ButtonComponent
                handleClick={handleSave}
                label="Save"
                className="sm:w-1/2 bg-gray-500 hover:bg-gray-600"
              />
            </div>
          </div>
        </div>
      </div>
      {logoutPopup && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 px-4">
          <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-xs text-center">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-700 mb-4">
              Are you sure you want to logout?
            </h2>

            <div className="flex gap-3">
              <ButtonComponent
                handleClick={() => setLogoutPopup(false)}
                label="Cancel"
                className=" bg-gray-300 text-gray-700 hover:bg-gray-400"
              />

              <ButtonComponent
                handleClick={handleLogout}
                label="Logout"
                className=" bg-red-600 text-white  hover:bg-red-700"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyProfile;
