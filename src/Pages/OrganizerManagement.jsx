import React, { useEffect, useState } from "react";
import { FaUserFriends } from "react-icons/fa";
import { MdEvent } from "react-icons/md";
import { IoMdBook } from "react-icons/io";
import { ImSearch } from "react-icons/im";
import { FaUserCircle } from "react-icons/fa";
import { MdDelete, MdLogout } from "react-icons/md";
import { FaRegEye } from "react-icons/fa";
import block from "../assets/icons/block.jpg";
import unblock from "../assets/icons/unblock.jpg";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  collection,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../firebase";
import ButtonComponent from "../Components/ButtonComponent";
import SearchBarComponent from "./SearchBarComponent";

function OrganizerManagement() {
  const navigate = useNavigate();
  const [organizer, setOrganizer] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [searchName, setSearchName] = useState("");
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState([]);
  const [logoutPopup, setLogoutPopup] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const organizersPerPage = 5;

  const handleLogout = () => {
    localStorage.removeItem("EventHub");
    navigate("/login");
  };

  useEffect(() => {
    const fetchOrganizer = async () => {
      try {
        const orgRef = collection(db, "users");
        const q = query(orgRef, where("role", "==", 1));
        const snapshot = await getDocs(q);
        const snap = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setOrganizer(snap);
        setAllUsers(snap);
      } catch (err) {
        toast.error("Organizer not found.....");
      }
    };
    fetchOrganizer();
  }, []);

  const searhOrganizer = async (text) => {
    if (!text.trim()) {
      setOrganizer(allUsers);
      return;
    }
    try {
      const organizerRef = collection(db, "users");
      const q = query(
        organizerRef,
        where("role", "==", 1),
        where("name", ">=", text.toLowerCase()),
        where("name", "<=", text.toLowerCase() + "\uf8ff")
      );
      const snapshot = await getDocs(q);
      const snap = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setOrganizer(snap);
    } catch (err) {
      toast.error("Organizer Not Found.....");
    }
  };

  const updateStatus = async (id, values) => {
    try {
      await updateDoc(doc(db, "users", id), { status: values });
      const msgs =
        values === 1 ? "active" : values === 0 ? "blocked.." : "deleted...";
      toast.success(msgs);
      setOrganizer((prev) =>
        prev.map((o) => (o.id === id ? { ...o, status: values } : o))
      );
    } catch (err) {
      console.error("updateStatus error:", err);
      toast.error("status not updated...");
    }
  };

  const lastOrganizerIndex = currentPage * organizersPerPage;
  const firstOrganizerIndex = lastOrganizerIndex - organizersPerPage;
  const currentOrganizer = organizer.slice(
    firstOrganizerIndex,
    lastOrganizerIndex
  );
  const totalPages = Math.ceil(organizer.length / organizersPerPage);

  return (
    <div className="bg-gray-50 h-screen p-0">
      <div className="w-full flex flex-col md:flex-row">
        <div className="bg-white w-full md:w-[280px] p-8 shadow-lg rounded-none whitespace-nowrap">
          <h1 className="font-bold text-2xl text-purple-700">Admin Panel</h1>
          <p className="text-gray-400 font-semibold">Management Dashboard</p>

          <div className="border-b border-gray-300 my-5"></div>

          <div className="space-y-4 cursor-pointer">
            <div
              onClick={() => navigate("/admin")}
              className="flex gap-2 text-gray-600 hover:text-purple-700"
            >
              <FaUserFriends size={25} />
              <h1 className="font-semibold">User Management</h1>
            </div>

            <div
              className="
                  flex bg-purple-700 p-2 gap-2 rounded"
            >
              <FaUserCircle size={25} className="text-white" />
              <h1 className="font-semibold text-white">Organizer Management</h1>
            </div>

            <div
              onClick={() => navigate("/manageevent")}
              className="flex gap-2 text-gray-600 hover:text-purple-700"
            >
              <MdEvent size={25} />
              <h1 className="font-semibold">All Events</h1>
            </div>

            <div
              onClick={() => navigate("/managebooking")}
              className="flex gap-2 text-gray-600 hover:text-purple-700"
            >
              <IoMdBook size={25} />
              <h1 className="font-semibold">All Bookings</h1>
            </div>
          </div>
          <div
            onClick={() => {
              setShowDropdown(false);
              setLogoutPopup(true);
            }}
            className="flex mt-[250px] px-14 py-3 gap-1 cursor-pointer text-red-500 border border-red-300 outline-none rounded-lg "
          >
            <MdLogout className="mt-1" />
            <button>Log Out</button>
          </div>
        </div>

        <div className="bg-purple-50 min-h-screen w-full p-10 shadow rounded-none">
          <h1 className="text-purple-700 font-semibold text-2xl">
            Organizer Management
          </h1>
          <p className="text-gray-500 mt-1 font-semibold text-sm">
            Manage and monitor all your users
          </p>

          <div className="w-full px-4 mt-8 flex justify-center">
            <SearchBarComponent
              value={searchName}
              onChange={(e)=>{
                setSearchName(e.target.value);
                searhOrganizer(e.target.value);
              }}
              placeholder="Search Organizer....."
            />
          </div>

          <div className="bg-white mt-5 overflow-x-auto rounded-lg shadow-sm">
            <table className="min-w-full text-left border border-gray-300">
              <thead className="text-purple-700 bg-gray-100">
                <tr>
                  <th className="px-4 py-2 border border-gray-300">Name</th>
                  <th className="px-4 py-2 border border-gray-300">Email</th>
                  <th className="px-4 py-2 border border-gray-300">Role</th>
                  <th className="px-4 py-2 border border-gray-300">
                    Created At
                  </th>
                  <th className="px-4 py-2 flex justify-center">Status</th>
                  <th className="px-4 py-2 border border-gray-300">Actions</th>
                </tr>
              </thead>

              <tbody>
                {currentOrganizer.map((o, i) => (
                  <tr key={o.id} className="bg-white hover:bg-gray-50">
                    <td className="px-4 py-2 border border-gray-300">
                      {o.name}
                    </td>
                    <td className="px-4 py-2 border border-gray-300">
                      {o.email}
                    </td>
                    <td className="px-4 py-2 border border-gray-300">
                      {o.role}
                    </td>
                    <td className="px-4 py-2 border border-gray-300">
                      {o.createdAt
                        ? typeof o.createdAt === "string"
                          ? new Date(o.createdAt).toLocaleDateString("en-IN")
                          : new Date(
                              o.createdAt.seconds * 1000
                            ).toLocaleDateString("en-IN")
                        : "—"}
                    </td>
                    <td className="px-4 py-3 border border-gray-300 text-center">
                      <span
                        className={`px-4 py-1 rounded cursor-pointer 
                          ${
                            o.status === 1
                              ? "bg-green-200 text-green-800 border border-green-800 rounded-lg"
                              : o.status === 0
                              ? "bg-yellow-100 text-yellow-700 border border-yellow-800 rounded-lg"
                              : "bg-red-200 text-red-800 border border-red-800 rounded-lg"
                          }
                        `}
                      >
                        {o.status === 1
                          ? "Active"
                          : o.status === 0
                          ? "Blocked"
                          : "Deleted"}
                      </span>
                    </td>

                    <td className="px-4 py-2 border border-gray-300">
                      <div className="flex items-center gap-2 whitespace-nowrap">
                        <FaRegEye
                          onClick={() => {
                            navigate(`/organizerdetails/${o.id}`);
                          }}
                          size={22}
                          className="text-purple-600 cursor-pointer"
                        />
                        <img
                          src={o.status === 0 ? unblock : block}
                          onClick={() => {
                            if (o.status === -1) return;
                            updateStatus(o.id, o.status === 0 ? 1 : 0);
                          }}
                          size={22}
                          className={`w-5 ${
                            o.status === -1 ? "opacity-50" : "cursor-pointer"
                          }  `}
                        />
                        <MdDelete
                          onClick={() => {
                            if (o.status === -1) return;
                            setSelectedUserId(o.id);
                            setShowDeletePopup(true);
                          }}
                          size={22}
                          className={`cursor-pointer ${
                            o.status === -1
                              ? "text-gray-400 cursor-not-allowed"
                              : "text-purple-600"
                          }`}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-center items-center mt-4 gap-4">
            <button
              onClick={() => setCurrentPage((prev) => prev - 1)}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded-lg font-semibold 
              ${
                currentPage === 1
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-purple-600 text-white cursor-pointer"
              }
            `}
            >
              Previous
            </button>

            <span className="font-semibold text-purple-700">
              Page {currentPage} of {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage((prev) => prev + 1)}
              disabled={currentPage === totalPages}
              className={`px-4 py-2 rounded-lg font-semibold 
                ${
                  currentPage === totalPages
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-purple-600 text-white cursor-pointer"
                }
              `}
            >
              Next
            </button>
          </div>

          {showDeletePopup && (
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50">
              <div className="bg-white p-6 rounded-lg shadow-xl w-[350px] text-center">
                <h2 className="text-xl font-semibold text-gray-700 mb-4">
                  Are you sure you want to delete this user?
                </h2>

                <div className="flex justify-between gap-3">
                  <ButtonComponent
                    handleClick={() => setShowDeletePopup(false)}
                    label="Cancel"
                    className="bg-gray-300 text-gray-700  hover:bg-gray-400 "
                  />
                    

                  <ButtonComponent
                    handleClick={() => {
                      updateStatus(selectedUserId, -1);
                      setShowDeletePopup(false);
                    }}
                    label="Delete"
                    className="bg-red-600 hover:bg-red-700"
                  />
                    
                </div>
              </div>
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
                  className="bg-red-600 hover:bg-red-700"
                />
                  
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default OrganizerManagement;
