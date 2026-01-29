import React, { useEffect, useState } from "react";
import { FaUserFriends } from "react-icons/fa";
import { MdEvent } from "react-icons/md";
import { IoMdBook } from "react-icons/io";
import { ImSearch } from "react-icons/im";
import { FaEye, FaUserCircle } from "react-icons/fa";
import { MdLogout } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { getDocs, collection, query, orderBy, startAt, endAt } from "firebase/firestore";
import { db } from "../firebase";
import ButtonComponent from "../Components/ButtonComponent";
import SearchBarComponent from "./SearchBarComponent";

function EventManagement() {
  const navigate = useNavigate();
  const [event, setEvent] = useState([]);
  const [allEvents, setAllEvents] = useState([]);
  const [searchName, setSearchName] = useState("");
  const [logoutPopup, setLogoutPopup] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 6;

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const eventRef = collection(db, "events");
        const eventSnap = await getDocs(eventRef);

        const snap = eventSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        if (snap.length === 0) {
          toast.error("No Events Found...");
        }

        setEvent(snap);
        setAllEvents(snap);
      } catch (err) {
        toast.error("Events Not Found...");
      }
    };

    fetchEvent();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("EventHub");
    navigate("/login");
  };

const searchEvents = async (text) => {
  if (!text.trim()) {
    setEvent(allEvents);
    return;
  }

  try {
    const searchText = text.toLowerCase(); 

    const q = query(
      collection(db, "events"),
      orderBy("eventName"),
      startAt(searchText),
      endAt(searchText + "\uf8ff")
    );

    const snapshot = await getDocs(q);
    const results = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    setEvent(results);
  } catch (err) {
    toast.error("Search failed");
  }
};


  const lastUser = currentPage * usersPerPage;
  const firstUser = lastUser - usersPerPage;
  const currentUsers = event.slice(firstUser, lastUser);
  const totalPages = Math.ceil(event.length / usersPerPage);

  return (
    <div>
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

              <div className="flex bg-purple-700 p-2 gap-2 rounded text-white">
                <MdEvent size={25} />
                <h1 className="font-semibold ">All Events</h1>
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
              className="flex mt-[230px] px-14 py-3 gap-1 cursor-pointer text-red-500 border border-red-300 outline-none rounded-lg"
            >
              <MdLogout className="mt-1" />
              <button>Log Out</button>
            </div>
          </div>

          <div className="bg-purple-50 w-full p-8 shadow rounded-none">
            <h1 className="text-purple-700 font-semibold text-2xl">
              Event Management
            </h1>
            <p className="text-gray-500 mt-1 font-semibold text-sm">
              Manage and monitor all your events
            </p>

          <div className="w-full px-3 mt-8 flex">
            <SearchBarComponent
              value={searchName}
              onChange={(e)=>{
                    setSearchName(e.target.value);
                    searchEvents(e.target.value);
              }}
              placeholder="Search Events...."
            />
            </div>

            <div className="bg-white mt-5 overflow-x-auto rounded-lg shadow-sm">
              <table className="min-w-full text-left border border-gray-300">
                <thead className="text-purple-700 bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 border border-gray-300 whitespace-nowrap">
                      Event Name
                    </th>
                    <th className="px-4 py-2 border border-gray-300 whitespace-nowrap">
                      Description
                    </th>
                    <th className="px-4 py-2 border border-gray-300 whitespace-nowrap">
                      Type
                    </th>
                    <th className="px-4 py-2 border border-gray-300 whitespace-nowrap">
                      Date
                    </th>
                    <th className="px-4 py-2 border border-gray-300 whitespace-nowrap">
                      Location
                    </th>
                    <th className="px-4 py-2 border border-gray-300 whitespace-nowrap">
                      Price
                    </th>
                    <th className="px-4 py-2 border border-gray-300 whitespace-nowrap">
                      Total Tickets
                    </th>
                    <th className="px-4 py-2 border border-gray-300 whitespace-nowrap">
                      Sold Tickets
                    </th>
                    <th className="px-4 py-2 border border-gray-300 whitespace-nowrap">
                      Available Tickets
                    </th>

                    <th className="px-4 py-2 border border-gray-300 whitespace-nowrap">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {currentUsers.map((e, i) => (
                    <tr key={e.id} className="bg-white hover:bg-gray-50">
                      <td className="px-4 py-2 border border-gray-300 whitespace-nowrap">
                        {e.eventName}
                      </td>
                      <td className="px-4 py-2 border border-gray-300 whitespace-nowrap">
                        {e.description}
                      </td>
                      <td className="px-4 py-2 border border-gray-300 whitespace-nowrap">
                        {e.eventType}
                      </td>
                      <td className="px-4 py-2 border border-gray-300 whitespace-nowrap">
                        {e.createdAt
                          ? typeof e.createdAt === "string"
                            ? new Date(e.createdAt).toLocaleDateString("en-IN")
                            : new Date(
                                e.createdAt.seconds * 1000
                              ).toLocaleDateString("en-IN")
                          : "—"}
                      </td>
                      <td className="px-4 py-2 border border-gray-300 whitespace-nowrap">
                        {e.location}
                      </td>
                      <td className="px-4 py-2 border border-gray-300 whitespace-nowrap">
                        {e.price}
                      </td>
                      <td className="px-4 py-2 border border-gray-300 whitespace-nowrap">
                        {e.ticket_config?.totalTickets || 0}
                      </td>
                      <td className="px-4 py-2 border border-gray-300 whitespace-nowrap">
                        {e.ticket_config?.soldTickets || 0}
                      </td>
                      <td className="px-4 py-2 border border-gray-300 whitespace-nowrap">
                        {e.ticket_config?.availableTickets || 0}
                      </td>
                      <td className="px-4 py-2 border border-gray-300 whitespace-nowrap">
                        <div className="flex items-center justify-center gap-3">
                          <FaEye
                            onClick={() => navigate(`/eventdetails/${e.id}`)}
                            size={20}
                            className="text-purple-700 cursor-pointer "
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-center items-center mt-4 gap-4 mr-24">
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
    </div>
  );
}

export default EventManagement;
