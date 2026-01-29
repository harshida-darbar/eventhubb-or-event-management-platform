import React, { useEffect, useState } from "react";
import { FaUserFriends } from "react-icons/fa";
import { MdEvent } from "react-icons/md";
import { IoMdBook } from "react-icons/io";
import { ImSearch } from "react-icons/im";
import { FaUserCircle } from "react-icons/fa";
import { FaRegEye } from "react-icons/fa";
import { MdDelete, MdLogout } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import block from "../assets/icons/block.jpg";
import unblock from "../assets/icons/unblock.jpg";
import { toast } from "react-toastify";
import {
  collection,
  getDocs,
  query,
  updateDoc,
  where,
  doc,
} from "firebase/firestore";
import { db } from "../firebase";
import ButtonComponent from "../Components/ButtonComponent";
import SearchBarComponent from "./SearchBarComponent";

function Admin() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [searchName, setSearchName] = useState("");
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [logoutPopup, setLogoutPopup] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const usersPerPage = 5;

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("role", "==", 2));
        const snapshot = await getDocs(q);
        const snap = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUsers(snap);
        setAllUsers(snap);
      } catch (err) {
        toast.error("users not foundd.....");
      }
    };
    fetchUsers();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("EventHub");
    navigate("/login");
  };

  const searchUsers = async (text) => {
    if (!text.trim()) {
      setUsers(allUsers);
      return;
    }

    try {
      const usersRef = collection(db, "users");
      const q = query(
        usersRef,
        where("role", "==", 2),
        where("name", ">=", text.toLowerCase()),
        where("name", "<=", text.toLowerCase() + "\uf8ff")
      );

      const snapshot = await getDocs(q);
      const results = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setUsers(results);
    } catch (err) {
      toast.error("User Not Found...");
    }
  };

  const updateStatus = async (id, value) => {
    try {
      await updateDoc(doc(db, "users", id), { status: value });

      const msg =
        value === 1
          ? "User Activated"
          : value === 0
          ? "User Blocked"
          : "User Deleted";

      toast.success(msg);

      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, status: value } : u))
      );
    } catch (err) {
      toast.error("Failed to update user status");
    }
  };

  const lastUser = currentPage * usersPerPage;
  const firstUser = lastUser - usersPerPage;
  const currentUsers = users.slice(firstUser, lastUser);
  const totalPages = Math.ceil(users.length / usersPerPage);

  return (
    <div className="bg-gray-50 min-h-screen p-0">
      <div className="w-full flex flex-col md:flex-row">
        <div className="bg-white w-full h-[610px] md:w-[280px] p-8 shadow-lg rounded-none whitespace-nowrap">
          <h1 className="font-bold text-2xl text-purple-700">Admin Panel</h1>
          <p className="text-gray-400 font-semibold">Management Dashboard</p>

          <div className="border-b border-gray-300 my-5"></div>

          <div className="space-y-4 cursor-pointer">
            <div className="flex bg-purple-700 p-2 gap-2 rounded">
              <FaUserFriends size={25} className="text-white" />
              <h1 className="text-white font-semibold">User Management</h1>
            </div>

            <div
              onClick={() => navigate("/manageorganizer")}
              className="flex gap-2 text-gray-600 hover:text-purple-700"
            >
              <FaUserCircle size={25} />
              <h1 className="font-semibold">Organizer Management</h1>
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
            className="flex mt-10 md:mt-[250px] px-12 py-3 gap-1 cursor-pointer text-red-500 border border-red-300 rounded-lg"
          >
            <MdLogout className="mt-1" />
            <button className="">Log Out</button>
          </div>
        </div>

        <div className="bg-purple-50 w-full h-[610px] p-8 shadow rounded-none">
          <h1 className="text-purple-700 font-semibold text-2xl">
            User Management
          </h1>
          <p className="text-gray-500 mt-1 font-semibold text-sm">
            Manage and monitor all your users
          </p>

          <div className="w-full px-4 mt-8 flex justify-center">
            <SearchBarComponent
              value={searchName}
              onChange={(e) => {
                setSearchName(e.target.value);
                searchUsers(e.target.value);
              }}
              placeholder="Search Users..."
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
                  <th className="px-4 py-2  flex justify-center">Status</th>
                  <th className="px-4 py-2 border border-gray-300">Actions</th>
                </tr>
              </thead>

              <tbody>
                {currentUsers.map((u) => (
                  <tr key={u.id} className="bg-white hover:bg-gray-50">
                    <td className="px-4 py-2 border border-gray-300">
                      {u.name}
                    </td>
                    <td className="px-4 py-2 border border-gray-300">
                      {u.email}
                    </td>
                    <td className="px-4 py-2 border border-gray-300">
                      {u.role}
                    </td>
                    <td className="px-4 py-2 border border-gray-300">
                      {u.createdAt
                        ? typeof u.createdAt === "string"
                          ? new Date(u.createdAt).toLocaleDateString("en-IN")
                          : new Date(
                              u.createdAt.seconds * 1000
                            ).toLocaleDateString("en-IN")
                        : "—"}
                    </td>

                    <td className="px-4 py-3 border border-gray-300 text-center">
                      <span
                        className={`px-4 py-1 rounded cursor-pointer 
                        ${
                          u.status === 1
                            ? "bg-green-200 text-green-800 border border-green-800 rounded-lg"
                            : u.status === 0
                            ? "bg-yellow-100 text-yellow-800 border border-yellow-800 rounded-lg"
                            : "bg-red-200 text-red-800  border border-red-800 rounded-lg"
                        }
                      `}
                      >
                        {u.status === 1
                          ? "Active"
                          : u.status === 0
                          ? "Blocked"
                          : "Deleted"}
                      </span>
                    </td>

                    <td className="px-4 py-2 border border-gray-300">
                      <div className="flex items-center gap-2">
                        <FaRegEye
                          onClick={() => navigate(`/usersdetails/${u.id}`)}
                          size={22}
                          className="text-purple-600 cursor-pointer"
                        />

                        <img
                          src={u.status === 0 ? unblock : block}
                          onClick={() => {
                            if (u.status === -1) return;
                            updateStatus(u.id, u.status === 0 ? 1 : 0);
                          }}
                          alt="block icon"
                          className={`w-5 
                        ${u.status === -1 ? "opacity-50" : "cursor-pointer"}
                      `}
                        />

                        <MdDelete
                          onClick={() => {
                            if (u.status === -1) return;
                            setSelectedUserId(u.id);
                            setShowDeletePopup(true);
                          }}
                          size={22}
                          className={`${
                            u.status === -1
                              ? "text-gray-400"
                              : "text-purple-600 cursor-pointer"
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
                    className=" bg-gray-300 text-gray-700 hover:bg-gray-400"
                  />

                  <ButtonComponent
                    handleClick={() => {
                      updateStatus(selectedUserId, -1);
                      setShowDeletePopup(false);
                    }}
                    label="Delete"
                    className="bg-red-600 text-white hover:bg-red-700"
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
                  className="w-full bg-gray-300 text-gray-700 py-2 rounded font-semibold hover:bg-gray-400 cursor-pointer"
                />

                <ButtonComponent
                  handleClick={handleLogout}
                  label="Logout"
                  className="w-full bg-red-600 text-white py-2 rounded font-semibold hover:bg-red-700 cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Admin;


