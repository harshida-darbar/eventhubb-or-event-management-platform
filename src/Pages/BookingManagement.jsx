import React, { useEffect, useState } from "react";
import { FaUserFriends } from "react-icons/fa";
import { MdEvent } from "react-icons/md";
import { IoMdBook } from "react-icons/io";
import { FaEye, FaUserCircle } from "react-icons/fa";
import { MdLogout } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { collection, getDocs, orderBy, query, startAt, endAt } from "firebase/firestore";
import { db } from "../firebase";
import ButtonComponent from "../Components/ButtonComponent";
import SearchBarComponent from "./SearchBarComponent";
import { toast } from "react-toastify";

function BookingManagement() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [allOrders, setAllOrders] = useState([]);
  const [searchName, setSearchName] = useState("");
  const [logoutPopup, setLogoutPopup] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 5;

  useEffect(() => {
    const fetchOrders = async () => {
      const eventRef = collection(db, "orders");
      const snapshot = await getDocs(eventRef);
      const snapp = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setOrders(snapp);
      setAllOrders(snapp);
    };
    fetchOrders();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("EventHub");
    navigate("/login");
  };

  const searchOrders = async (text) => {
  if (!text.trim()) {
    setOrders(allOrders);
    return;
  }

  try {
    const searchText = text.toLowerCase();

    const q = query(
      collection(db, "orders"),
      orderBy("eventName"),
      startAt(searchText),
      endAt(searchText + "\uf8ff")
    );

    const snapshot = await getDocs(q);
    const snapp = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    setOrders(snapp);
  } catch (err) {
    console.log(err);
    toast.error("Search Failed...");
  }
};


  const lastOrder = currentPage * usersPerPage;
  const firstOrder = lastOrder - usersPerPage;
  const currentOrders = orders.slice(firstOrder, lastOrder);
  const totalOrders = Math.ceil(orders.length / usersPerPage);

  return (
    <div className="bg-gray-50 min-h-screen p-0">
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
              className="
            flex bg-purple-700 p-2 gap-2 rounded text-white"
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
            className="flex mt-[250px] px-13 py-3 gap-1 cursor-pointer text-red-500 border border-red-300 outline-none rounded-lg"
          >
            <MdLogout className="mt-1" />
            <button>Log Out</button>
          </div>
        </div>

        <div className="bg-purple-50 w-full p-8 shadow rounded-none">
          <h1 className="text-purple-700 font-semibold text-2xl">
            Booking Management
          </h1>
          <p className="text-gray-500 mt-1 font-semibold text-sm">
            Manage and monitor all your bookings
          </p>

          <div className="w-full px-4 mt-8 flex justify-center">
            <SearchBarComponent
              value={searchName}
              onChange={(e) => {
                searchOrders(e.target.value);
                setSearchName(e.target.value);
              }}
              placeholder="Search Orders....."
            />
          </div>

          <div className="bg-white mt-5 overflow-x-auto rounded-lg shadow-sm">
            <table className="min-w-full text-left border border-gray-300">
              <thead className="text-purple-700 bg-gray-100">
                <tr>
                  <th className="px-4 py-2 border border-gray-300">
                    Event Name
                  </th>
                  <th className="px-4 py-2 border border-gray-300">
                    Booked By
                  </th>
                  <th className="px-4 py-2 border border-gray-300">Date</th>
                  <th className="px-4 py-2 border border-gray-300">Price</th>
                  <th className="px-4 py-2 border border-gray-300">
                    Total Price
                  </th>
                  <th className="px-4 py-2 border border-gray-300">Users</th>
                  <th className="px-4 py-2 border border-gray-300">Actions</th>
                </tr>
              </thead>

              <tbody>
                {currentOrders.map((o, i) => (
                  <tr key={o.id} className="bg-white hover:bg-gray-50">
                    <td className="px-4 py-2 border border-gray-300">
                      {o.eventName}
                    </td>
                    <td className="px-4 py-2 border border-gray-300">
                      {o.bookedByName}
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

                    <td className="px-4 py-2 border border-gray-300">
                      {o.pricePerTicket}
                    </td>

                    <td className="px-4 py-2 border border-gray-300">
                      ₹{Number(o.totalPrice).toLocaleString("en-IN")}
                    </td>
                    <td className="px-4 py-2 border border-gray-300">
                      <ul className=" text-gray-600 flex justify-center">
                        {o.users.length}
                      </ul>
                    </td>

                    <td className="px-4 py-2 border border-gray-300">
                      <div className="flex items-center justify-center gap-3">
                        <FaEye
                          onClick={() => navigate(`/orderdetails/${o.id}`)}
                          size={20}
                          className="text-purple-800 cursor-pointer "
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
              Page {currentPage} of {totalOrders}
            </span>

            <button
              onClick={() => setCurrentPage((prev) => prev + 1)}
              disabled={currentPage === totalOrders}
              className={`px-4 py-2 rounded-lg font-semibold 
                ${
                  currentPage === totalOrders
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-purple-600 text-white cursor-pointer"
                }
              `}
            >
              Next
            </button>
          </div>
        </div>
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
                className="bg-gray-300 text-gray-700"
              />

              <ButtonComponent
                label="Logout"
                handleClick={handleLogout}
                className="bg-red-600 text-white hover:bg-red-700"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BookingManagement;
