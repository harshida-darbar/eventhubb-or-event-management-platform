import React, { useEffect, useState } from "react";
import { SlCalender } from "react-icons/sl";
import { IoSearch } from "react-icons/io5";
import { IoArrowBack } from "react-icons/io5";
import { IoMdLogOut } from "react-icons/io";
import { FaRegUser } from "react-icons/fa6";
import { TbArrowsSort } from "react-icons/tb";
import { useNavigate } from "react-router-dom";
import CardComponent from "../Components/CardComponent";
import { db } from "../firebase";
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  query,
  orderBy,
  addDoc,
  getDocs,
  arrayUnion,
  arrayRemove,
  where,
  onSnapshot,
  startAt, endAt,
} from "firebase/firestore";
import { toast } from "react-toastify";
import { useFormik } from "formik";
import * as Yup from "yup";
import Banner from "./Banner";
import ButtonComponent from "../Components/ButtonComponent";
import SearchBarComponent from "./SearchBarComponent";

function BookEvent() {
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [allEvents, setAllEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [ticketQty, setTicketQty] = useState(1);
  const [users, setUsers] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [userName, setUserName] = useState("");
  const [logoutPopup, setLogoutPopup] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [data, setData] = useState([]);
  const [filteredTime, setFilteredtime] = useState("");
  const [showCalendar, setShowCalendar] = useState(false);
  const [tempTerm, setTempTerm] = useState("");
  const [allTypes, setAllTypes] = useState([]);
  const [tempTime, setTempTime] = useState("");
  const [minValue, setMinValue] = useState(0);
  const [maxValue, setMaxValue] = useState(15000);
  const [tempMin, setTempMin] = useState(0);
  const [tempMax, setTempMax] = useState(15000);
  const [sortOrder, setSortOrder] = useState("asc");

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const collRef = collection(db, "events");
      const allData = await getDocs(collRef);

      const eventList = [];

      for (const docSnap of allData.docs) {
        const event = { id: docSnap.id, ...docSnap.data() };

        const ratingRef = collection(db, "rating");
        const q = query(ratingRef, where("eventId", "==", event.id));
        const ratingSnap = await getDocs(q);

        event.ratings = ratingSnap.docs.map((r) => ({
          id: r.id,
          ...r.data(),
        }));

        eventList.push(event);
      }

      setEvents(eventList);
      setAllEvents(eventList);
    } catch (error) {
      toast.error("Failed to fetch events");
    } finally {
      setLoading(false);
    }
  };

  // useEffect(() => {
  //   const delay = setTimeout(fetchEvents, 400);
  //   return () => clearTimeout(delay);
  // }, [searchTerm]);

  useEffect(() => {
    fetchEvents();
  }, []);

  const openBookingModal = (event) => {
    setSelectedEvent(event);
    setShowTicketModal(true);
    setTicketQty(1);
  };

  const ticketFormik = useFormik({
    initialValues: { quantity: 1 },
    validationSchema: Yup.object({
      quantity: Yup.number()
        .min(1, "At least 1 ticket required")
        .required("Required"),
    }),
    onSubmit: (values) => {
      const qty = values.quantity;
      setTicketQty(qty);

      const tempUsers = Array.from({ length: qty }, () => ({
        name: "",
        email: "",
        age: "",
      }));
      setUsers(tempUsers);
      setShowTicketModal(false);
      setShowUserModal(true);
    },
  });

  const userFormik = useFormik({
    initialValues: { users },
    enableReinitialize: true,
    validationSchema: Yup.object({
      users: Yup.array().of(
        Yup.object({
          name: Yup.string().trim().required("Name is required"),
          email: Yup.string()
            .trim()
            .email("Invalid email")
            .required("Email is required"),
          age: Yup.number()
            .min(0, "Age cannot be negative")
            .required("Age is required"),
        })
      ),
    }),
    validateOnChange: false,
    validateOnBlur: true,
    onSubmit: async (values) => {
      try {
        const userData = JSON.parse(localStorage.getItem("EventHub"));
        if (!userData || !userData.uid) {
          toast.error("Please login");
          navigate("/login");
          return;
        }

        const eventRef = doc(db, "events", selectedEvent.id);
        const eventSnap = await getDoc(eventRef);
        if (!eventSnap.exists()) {
          toast.error("No Events");
          return;
        }
        const eventData = eventSnap.data();
        const ticketConfig = eventData.ticket_config;

        if (ticketConfig.availableTickets < ticketQty) {
          toast.error("tickets not available");
          return;
        }

        const pricePerTicket = Number(selectedEvent.price) || 0;
        const totalPrice = pricePerTicket * ticketQty;

        const orderData = {
          createdAt: new Date().toISOString(),
          eventId: selectedEvent.id,
          eventName: selectedEvent.eventName,
          users: values.users,
          pricePerTicket,
          totalPrice,
          bookedBy: userData.uid,
          bookedByName: userData.name,
          startdate: selectedEvent.startdate,
          starttime: selectedEvent.starttime,
          isScanned: false,
        };

        await addDoc(collection(db, "orders"), orderData);

        await updateDoc(eventRef, {
          ticket_config: {
            totalTickets: ticketConfig.totalTickets,
            availableTickets: ticketConfig.availableTickets - ticketQty,
            soldTickets: ticketConfig.soldTickets + ticketQty,
          },
        });

        toast.success("Order placed successfully");
        setShowUserModal(false);
      } catch (error) {
        console.error(error);
        toast.error("not placed..");
      }
    },
  });

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("EventHub"));
        if (!user?.uid) return;

        const userRef = doc(db, "users", user.uid);
        const snap = await getDoc(userRef);

        if (snap.exists()) {
          setWishlist(snap.data().wishlist || []);
        }
      } catch (error) {
        console.log(error);
      }
    };

    fetchWishlist();
  }, []);

  const isWishlisted = (id) => wishlist.some((item) => item.id === id);

  const toggleWishlist = async (event) => {
    try {
      const user = JSON.parse(localStorage.getItem("EventHub"));
      if (!user?.uid) return toast.error("Please login first!");

      const userRef = doc(db, "users", user.uid);

      if (isWishlisted(event.id)) {
        const removeItem = wishlist.find((w) => w.id === event.id);

        await updateDoc(userRef, {
          wishlist: arrayRemove(removeItem),
        });

        setWishlist((prev) => prev.filter((i) => i.id !== event.id));
        toast.success("Removed from wishlist!");
      } else {
        const newItem = { id: event.id, ...event };

        await updateDoc(userRef, {
          wishlist: arrayUnion(newItem),
        });

        setWishlist((prev) => [...prev, newItem]);
        toast.success("Added to wishlist!");
      }
    } catch (err) {
      toast.error("Error updating wishlist!");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("EventHub");
    navigate("/login");
  };

  const fetchuserData = () => {
    const userData = JSON.parse(localStorage.getItem("EventHub"));
    return userData?.name || "User";
  };

  useEffect(() => {
    setUserName(fetchuserData());
  }, []);

  useEffect(() => {
    const fetchAllEvents = async () => {
      const snap = await getDocs(collection(db, "events"));
      const list = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setData(list);
      setAllTypes([...new Set(list.map((item) => item.eventType))]);
    };

    fetchAllEvents();
  }, []);

  const searchEvents = async (text) => {
  const searchText = text.trim();

  if (!searchText) {
    fetchEvents(); 
    return;
  }

  const q = query(
    collection(db, "events"),
    orderBy("eventName"),
    startAt(searchText),
    endAt(searchText + "\uf8ff")
  );

  const snap = await getDocs(q);

  const list = snap.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  setEvents(list);
};

  const fetchFilteredEvents = async () => {
    const collRef = collection(db, "events");
    let q = collRef;

    if (tempTerm) {
      q = query(q, where("eventType", "==", tempTerm));
    }

    if (tempTime) {
      q = query(q, where("startdate", "==", tempTime));
    }

    if (tempMin !== 0 || tempMax !== 15000) {
      q = query(
        q,
        where("price", ">=", tempMin),
        where("price", "<=", tempMax)
      );
    }

    q = query(q, orderBy("startdate", sortOrder));

    const snap = await getDocs(q);
    let filtered = snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    if (searchTerm.trim()) {
      filtered = filtered.filter((item) =>
        item.eventName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setEvents(filtered);
  };

  const handleTimeFilter = (type, pickedDate, temp = false) => {
    const today = new Date();
    let selectedDate = "";

    if (type === "today") {
      selectedDate = today.toISOString().split("T")[0];
    } else if (type === "tomorrow") {
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      selectedDate = tomorrow.toISOString().split("T")[0];
    } else if (type === "calendar" && pickedDate) {
      selectedDate = pickedDate;
    }

    if (temp) setTempTime(selectedDate);
    else setFilteredtime(selectedDate);
  };

  const handleSort = () => {
    const newOrder = sortOrder === "asc" ? "desc" : "asc";
    setSortOrder(newOrder);
    fetchFilteredEvents();
  };

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("EventHub"));
    if (!user) return;

    const unsub = onSnapshot(doc(db, "users", user.uid), (snap) => {
      if (!snap.exists()) return;

      if (snap.data().status !== 1) {
        localStorage.removeItem("EventHub");
        toast.error("Unauthorized User");
        navigate("/login");
      }
    });

    return () => unsub();
  }, []);

  useEffect(() => {
    const q = collection(db, "events");

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const eventList = [];

      for (const docSnap of snapshot.docs) {
        const event = { id: docSnap.id, ...docSnap.data() };
        const ratingRef = collection(db, "rating");
        const ratingQ = query(ratingRef, where("eventId", "==", event.id));
        const ratingSnap = await getDocs(ratingQ);

        event.ratings = ratingSnap.docs.map((r) => ({
          id: r.id,
          ...r.data(),
        }));

        eventList.push(event);
      }

      setEvents(eventList);
      setAllEvents(eventList);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white  shadow-xl py-3 px-5  flex justify-between items-center">
        <div className="flex items-center gap-3">
          <IoArrowBack
            onClick={() => navigate("/maindashboard")}
            size={32}
            className="text-purple-600 cursor-pointer"
          />
          <SlCalender
            size={32}
            className="bg-purple-600 text-white p-1 rounded"
          />
          <h1 className="text-purple-600 text-xl sm:text-2xl font-semibold">
            EventHub
          </h1>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-1 text-purple-700 font-semibold cursor-pointer outline-none border border-purple-600 rounded-2xl px-3 py-2"
          >
            <FaRegUser size={20} className="text-purple-700" />
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
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-[90%] max-w-[350px] text-center">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-700 mb-4">
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
                  className="bg-red-600 text-white  hover:bg-red-700"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <section>
        <Banner />
      </section>

      <div className="flex justify-center mt-8 px-4">
        <SearchBarComponent
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            searchEvents(e.target.value);
          }}
          placeholder="Search Events Here..."
        />
      </div>

      <div className="flex justify-center mt-8 px-4">
        <div className="w-full max-w-5xl space-y-4 lg:space-y-0 lg:grid lg:grid-cols-4 lg:gap-4">
          <select
            className="h-10 px-3 border border-gray-300 rounded-lg font-semibold text-purple-700 outline-none bg-white w-full"
            onChange={(e) => setTempTerm(e.target.value)}
          >
            <option value="">Select Event Type</option>
            {allTypes.map((type, index) => (
              <option key={index} value={type}>
                {type}
              </option>
            ))}
          </select>

          <div className="relative">
            <select
              className="h-10 px-3 border border-gray-300 rounded-lg font-semibold text-purple-700 outline-none bg-white w-full"
              onChange={(e) => {
                const value = e.target.value;
                if (value === "calendar") setShowCalendar(true);
                else {
                  handleTimeFilter(value, null, true);
                  setShowCalendar(false);
                }
              }}
            >
              <option value="time">Select Time</option>
              <option value="today">Today</option>
              <option value="tomorrow">Tomorrow</option>
              <option value="calendar">Pick a Date</option>
            </select>

            {showCalendar && (
              <input
                type="date"
                className="absolute top-full left-0 mt-2 border border-gray-300 rounded-lg p-2 w-full bg-white z-10"
                onChange={(e) => {
                  handleTimeFilter("calendar", e.target.value);
                  setShowCalendar(false);
                }}
              />
            )}
          </div>

          <div className="bg-white border border-gray-300 rounded-lg p-4 flex-1">
            <div className="flex items-center justify-between gap-2 mb-3">
              <div>
                <p className="text-sm font-medium">Min Price</p>
                <input
                  value={tempMin}
                  readOnly
                  className="w-full max-w-[120px] p-2 bg-gray-200 rounded-xl text-center mt-1"
                />
              </div>

              <div>
                <p className="text-sm font-medium">Max Price</p>
                <input
                  value={tempMax}
                  readOnly
                  className="w-full max-w-[120px] p-2 bg-gray-200 rounded-xl text-center mt-1"
                />
              </div>
            </div>

            <div className="range-container">
              <div className="range-track"></div>

              <div
                className="range-fill"
                style={{
                  left: `${(tempMin / 15000) * 100}%`,
                  width: `${((tempMax - tempMin) / 15000) * 100}%`,
                }}
              ></div>

              <input
                type="range"
                min="0"
                max="15000"
                value={tempMin}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  if (v <= tempMax) setTempMin(v);
                }}
              />

              <input
                type="range"
                min="0"
                max="15000"
                value={tempMax}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  if (v >= tempMin) setTempMax(v);
                }}
              />
            </div>
          </div>
          <ButtonComponent
            label="Apply"
            handleClick={() => fetchFilteredEvents()}
          />
        </div>
      </div>

      <div className="flex justify-center px-4 mt-2 items-center">
        <div className="h-12 w-full max-w-5xl rounded-xl flex items-center gap-4">
          <div className="flex bg-white w-full max-w-[250px] rounded-lg h-10 items-center px-3 border border-gray-300">
            <TbArrowsSort size={20} className="text-purple-800" />
            <button
              onClick={handleSort}
              className="px-2 text-purple-800 font-semibold"
            >
              Sort By Date ({sortOrder})
            </button>
          </div>
        </div>
      </div>

      <div className="flex justify-center mt-8 px-4">
        <div className="max-w-5xl w-full">
          {/* <div className="text-sm text-gray-600 mb-3">
            {loading
              ? "Searching..."
              : `${events.length} result${events.length !== 1 ? "s" : ""}`}
          </div> */}

          {events.length === 0 && !loading ? (
            <div className="text-center text-gray-500 py-10">
              No events found
            </div>
          ) : (
            <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {events.map((event) => (
                <div key={event.id}>
                  <CardComponent
                    key={event.id}
                    event={event}
                    toggleWishlist={toggleWishlist}
                    isWishlisted={isWishlisted}
                    handleClick={openBookingModal}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showTicketModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50">
          <div className="bg-white p-6 rounded-xl w-[90%] max-w-[350px] shadow-xl">
            <h2 className="text-xl font-semibold text-purple-600 mb-4 text-center">
              Select Ticket Quantity
            </h2>

            <form onSubmit={ticketFormik.handleSubmit}>
              <input
                type="number"
                name="quantity"
                min="1"
                value={ticketFormik.values.quantity}
                onChange={ticketFormik.handleChange}
                className="w-full border border-gray-300 p-2 rounded outline-none focus-within:border-purple-500"
              />

              {ticketFormik.errors.quantity && (
                <p className="text-red-500 text-sm mt-1">
                  {ticketFormik.errors.quantity}
                </p>
              )}

              <div className="flex justify-between mt-5 gap-3">
                <ButtonComponent
                  type="button"
                  handleClick={() => setShowTicketModal(false)}
                  label="Cancel"
                  className="bg-gray-300 text-gray-700"
                />
                <ButtonComponent type="submit" label="Next" />
              </div>
            </form>
          </div>
        </div>
      )}

      {showUserModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-start justify-center z-50 overflow-y-auto py-8">
          <div className="bg-white p-6 rounded-xl w-[90%] max-w-[450px] shadow-xl">
            <h2 className="text-xl font-semibold text-purple-600 mb-4 text-center sticky top-0 bg-white shadow-sm py-2">
              Enter User Details
            </h2>

            <form onSubmit={userFormik.handleSubmit}>
              {users.map((_, index) => (
                <div key={index} className="mb-4 border-b border-gray-300 pb-3">
                  <p className="font-medium text-gray-700 mb-2">
                    Ticket {index + 1}
                  </p>

                  <input
                    type="text"
                    name={`users[${index}].name`}
                    placeholder="Name"
                    value={userFormik.values.users?.[index]?.name || ""}
                    onChange={userFormik.handleChange}
                    onBlur={userFormik.handleBlur}
                    className="w-full border border-gray-300 p-2 rounded mb-2 outline-none focus-within:border-purple-500"
                  />
                  {userFormik.touched.users?.[index]?.name &&
                    userFormik.errors.users?.[index]?.name && (
                      <p className="text-red-500 text-sm mb-2">
                        {userFormik.errors.users[index].name}
                      </p>
                    )}

                  <input
                    type="email"
                    name={`users[${index}].email`}
                    placeholder="Email"
                    value={userFormik.values.users?.[index]?.email || ""}
                    onChange={userFormik.handleChange}
                    onBlur={userFormik.handleBlur}
                    className="w-full border border-gray-300 p-2 rounded mb-2 outline-none focus-within:border-purple-500"
                  />
                  {userFormik.touched.users?.[index]?.email &&
                    userFormik.errors.users?.[index]?.email && (
                      <p className="text-red-500 text-sm mb-2">
                        {userFormik.errors.users[index].email}
                      </p>
                    )}

                  <input
                    type="number"
                    name={`users[${index}].age`}
                    placeholder="Age"
                    min={0}
                    value={userFormik.values.users?.[index]?.age || ""}
                    onChange={userFormik.handleChange}
                    onBlur={userFormik.handleBlur}
                    className="w-full border border-gray-300 p-2 rounded outline-none focus-within:border-purple-500"
                  />
                  {userFormik.touched.users?.[index]?.age &&
                    userFormik.errors.users?.[index]?.age && (
                      <p className="text-red-500 text-sm">
                        {userFormik.errors.users[index].age}
                      </p>
                    )}
                </div>
              ))}

              <div className="flex justify-between mt-4 gap-3">
                <ButtonComponent
                  type="button"
                  handleClick={() => setShowUserModal(false)}
                  label="Cancel"
                  className="bg-gray-300 text-gray-700 hover:bg-gray-400"
                />

                <ButtonComponent type="submit" label="Confirm Booking" />
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default BookEvent;
