import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SlCalender } from "react-icons/sl";
import { FaRegUser } from "react-icons/fa6";
import { IoMdLogOut } from "react-icons/io";
import { IoSearch, IoLocationOutline } from "react-icons/io5";
import { BiBookReader } from "react-icons/bi";
import { MdStarRate, MdOutlineReviews } from "react-icons/md";
import { AiOutlineBarChart } from "react-icons/ai";
import { FaEye } from "react-icons/fa";
import { CiSliderHorizontal } from "react-icons/ci";
import { WiTime3 } from "react-icons/wi";
import { BsCalendarDate } from "react-icons/bs";
import { MdOutlinePriceChange } from "react-icons/md";
import { MdEdit, MdDelete } from "react-icons/md";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import {
  getFirestore,
  addDoc,
  updateDoc,
  deleteDoc,
  collection,
  getDocs,
  doc,
  query,
  where,
} from "firebase/firestore";
import { app } from "../firebase";
import ButtonComponent from "../Components/ButtonComponent";

const db = getFirestore(app);

function OrganizerDashboard() {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [events, setEvents] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [userName, setUserName] = useState("");
  const [logoutPopup, setLogoutPopup] = useState(false);

 const fetchEvents = async () => {
  try {
    const userData = JSON.parse(localStorage.getItem("EventHub"));

    if (!userData || !userData.uid) {
      toast.error("User Not Logged In...");
      return;
    }

    const collRef = collection(db, "events");
    const qEvents = query(collRef, where("userId", "==", userData.uid));
    const eventSnap = await getDocs(qEvents);

    const eventList = [];

    for (const docSnap of eventSnap.docs) {
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
  } catch (error) {
    toast.error("Failed to fetch events");
  }
};


  useEffect(() => {
    fetchEvents();
  }, []);

  const formik = useFormik({
    initialValues: {
      eventName: "",
      description: "",
      eventType: "",
      tickets: "",
      price: "",
      startdate: "",
      enddate: "",
      starttime: "",
      endtime: "",
      location: "",
    },
    validationSchema: Yup.object({
      eventName: Yup.string()
        .trim()
        .min(3, "Event name must be at least 3 characters")
        .required("Event name is required"),

      description: Yup.string()
        .trim()
        .min(10, "Description must be at least 10 characters")
        .required("Description is required"),

      eventType: Yup.string().trim().required("Please select an event type"),

      price: Yup.number()
        .typeError("Price must be a number")
        .min(0, "Price cannot be negative")
        .required("Price is required"),

      tickets: Yup.number()
        .typeError("Tickets must be a number")
        .min(1, "There must be at least 1 ticket")
        .required("Number of tickets is required"),

      startdate: Yup.date().required("Start date is required"),

      enddate: Yup.date()
        .required("End date is required")
        .min(Yup.ref("startdate"), "End date must be after start date"),

      starttime: Yup.string().required("Start time is required"),

      endtime: Yup.string()
        .required("End time is required")
        .test(
          "is-greater",
          "End time must be after start time",
          function (value) {
            const { startdate, enddate, starttime } = this.parent;
            if (startdate !== enddate) return true;

            return value > starttime;
          }
        ),

      location: Yup.string().trim().required("Location is required"),
    }),

    onSubmit: async (values, { resetForm }) => {
      try {
        const userData = JSON.parse(localStorage.getItem("EventHub"));
        if (!userData || !userData.uid) {
          toast.error("User Not Logged In...");
          return;
        }

        if (editMode) {
          const docRef = doc(db, "events", editId);
          await updateDoc(docRef, {
            ...values,
            ticket_config: {
              totalTickets: Number(values.tickets),
              soldTickets: values.soldTickets || 0,
              availableTickets:
                Number(values.tickets) -
                (values.ticket_config?.soldTickets || 0),
            },
          });
          toast.success("Event Updated Successfully!");
        } else {
          const newEvent = {
            ...values,
            createdAt: new Date().toISOString(),
            userId: userData.uid,
            createdBy: userData.name,
            ticket_config: {
              totalTickets: Number(values.tickets),
              soldTickets: 0,
              availableTickets: Number(values.tickets),
            },
          };
          await addDoc(collection(db, "events"), newEvent);
          toast.success("Event Created Successfully!");
        }
        resetForm();
        setShowModal(false);
        setEditMode(false);
        setEditId(null);
        fetchEvents();
      } catch (error) {
        toast.error("Something went wrong...");
      }
    },
  });

  const handleEdit = (event) => {
    setShowModal(true);
    setEditMode(true);
    setEditId(event.id);

    formik.setValues({
      eventName: event.eventName,
      description: event.description,
      eventType: event.eventType,
      price: event.price,
      tickets: event.ticket_config?.totalTickets || "",
      startdate: event.startdate,
      enddate: event.enddate,
      starttime: event.starttime,
      endtime: event.endtime,
      location: event.location,
    });
  };

  const handleDelete = async (eventId) => {
    try {
      const docRef = doc(db, "events", eventId);
      await deleteDoc(docRef);
      toast.success("Event Deleted Successfully!");
      fetchEvents();
    } catch (error) {
      toast.error("Failed to Delete Event!");
    }
  };

  const today = new Date();
  today.setDate(today.getDate() - 1);
  const minDate = today.toISOString().split("T")[0];

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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-[#F2F2F2]  shadow-lg p-4 sm:p-5 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-3 p-2">
          <SlCalender
            size={35}
            className="bg-purple-600 text-white p-1 rounded"
          />
          <h1 className="text-purple-600 text-xl sm:text-2xl font-semibold">
            EventHub
          </h1>
        </div>

        <div className="relative outline-none cursor-pointer">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 text-purple-700 font-semibold border border-purple-600 rounded-xl px-3 h-10 hover:bg-purple-100 transition cursor-pointer"
          >
            <FaRegUser size={20} className="text-purple-700" />
            <span className="text-sm sm:text-base">{userName}</span>
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-2 w-36 sm:w-40 bg-white shadow-xl rounded-lg p-2 border border-gray-200">
              <p
                className="p-2 hover:bg-purple-100 rounded cursor-pointer"
                onClick={() => navigate("/profile")}
              >
                My Profile
              </p>
              <p
                className="p-2 hover:bg-purple-100 rounded cursor-pointer"
                onClick={() => navigate("/qrscan")}
              >
                Scan QR
              </p>
              <p
                className="p-2 hover:bg-purple-100 rounded cursor-pointer"
                onClick={() => navigate("/orgchat")}
              >
                Chats
              </p>
              <p
                className="p-2 hover:bg-purple-100 rounded cursor-pointer"
                onClick={() => navigate("/groupchats")}
              >
                Group Chats
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

      {logoutPopup && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl w-[90%] max-w-[350px] text-center">
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
                className="bg-red-600 hover:bg-red-700"
              />
                
            </div>
          </div>
        </div>
      )}

      <div className="text-center mt-14 sm:mt-20 px-4 sm:px-6">
        <h1 className="text-3xl sm:text-4xl font-bold mb-3">
          Empower Your Events
        </h1>
        <p className="text-2xl sm:text-3xl font-semibold mb-4 text-purple-600">
          Create & Manage
        </p>
        <p className="max-w-md mx-auto text-gray-600 text-sm sm:text-base">
          Design amazing experiences for your attendees. <br />
          Track registrations and optimize your events efficiently.
        </p>

        <div className="flex justify-center mt-6">
          <ButtonComponent
            handleClick={() => {
              setShowModal(true);
              setEditMode(false);
              formik.resetForm();
            }}
            label="  Create Event"
            className="bg-purple-500 text-white border border-purple-600 rounded-lg w-[150px] sm:w-[170px]"
          />
          
        </div>
      </div>

      <div className="flex flex-col items-center mt-10 mb-20 w-full px-4 gap-6">
        {events.map((event) => (
          <div
            key={event.id}
            className="bg-purple-200 shadow-xl p-4 sm:p-6 w-full max-w-[800px] rounded-2xl border border-gray-100 transition hover:shadow-2xl"
          >
            <div className="flex justify-between items-center">
              <h1 className="text-lg sm:text-xl font-bold text-purple-800">
                {event.eventName}
              </h1>

              <div className="flex gap-3 sm:gap-4">
                <MdEdit
                  size={25}
                  onClick={() => handleEdit(event)}
                  className="text-green-600 hover:text-green-800 cursor-pointer"
                />
                <MdDelete
                  size={25}
                  onClick={() => handleDelete(event.id)}
                  className="text-red-600 hover:text-red-800 cursor-pointer"
                />
                <FaEye
                  size={25}
                  onClick={() => navigate(`/event/${event.id}`)}
                  className="text-blue-600 hover:text-blue-800 cursor-pointer"
                />
              </div>
            </div>

            <div className="mt-3 text-gray-500 text-lg sm:text-base">
              {event.description}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 text-gray-700 font-medium text-sm sm:text-base">
              <div className="flex items-center gap-2">
                <CiSliderHorizontal className="text-purple-800" />
                {event.eventType}
              </div>
              <div className="flex items-center gap-2">
                <MdOutlinePriceChange className="text-purple-800" /> ₹
                {event.price}
              </div>

              <div className="flex items-center gap-2">
                <BsCalendarDate className="text-purple-800" /> {event.startdate}
              </div>
              <div className="flex items-center gap-2">
                <BsCalendarDate className="text-purple-800" /> {event.enddate}
              </div>

              <div className="flex items-center gap-2">
                <WiTime3 className="text-purple-800" /> {event.starttime}
              </div>
              <div className="flex items-center gap-2">
                <WiTime3 className="text-purple-800" /> {event.endtime}
              </div>

              <div className="flex items-center gap-2">
                <IoLocationOutline className="text-purple-800" />{" "}
                {event.location}
              </div>
            </div>

            <div className="flex flex-wrap gap-4 sm:gap-6 mt-4 text-gray-800 font-semibold text-sm">
              <p>Total Tickets: {event.ticket_config?.totalTickets}</p>
              <p>Sold Tickets: {event.ticket_config?.soldTickets}</p>
              <p>Available Tickets: {event.ticket_config?.availableTickets}</p>
            </div>

            <div className="mt-3 text-gray-700 flex flex-wrap items-center gap-3 text-sm sm:text-base">
              <h2 className="font-semibold">Ratings & Reviews:</h2>

              {event.ratings?.length > 0 ? (
                <>
                  <div className="flex items-center gap-1">
                    <MdStarRate className="text-yellow-500" />
                    <span className="font-semibold">
                      {(
                        event.ratings.reduce(
                          (a, r) => a + Number(r.rating),
                          0
                        ) / event.ratings.length
                      ).toFixed(1)}
                    </span>
                  </div>

                  <button
                    onClick={() => navigate(`/ratings/${event.id}`)}
                    className="text-purple-600 underline font-medium cursor-pointer"
                  >
                    Show All Reviews
                  </button>
                </>
              ) : (
                <p className="text-gray-500">No Ratings Yet</p>
              )}
            </div>
          </div>
        ))}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-[1200px] mt-10 mb-6 px-4">
          <div className="bg-purple-200 shadow-xl p-5 rounded-xl text-center">
            <IoSearch size={40} className="text-purple-700 mx-auto mb-2" />
            <h1 className="font-semibold text-xl">Event Management</h1>
            <p className="text-gray-500 text-sm sm:text-base">
              Organize, edit, and manage all events in one dashboard.
            </p>
          </div>

          <div className="bg-purple-200 shadow-xl p-5 rounded-xl text-center">
            <BiBookReader size={40} className="text-blue-800 mx-auto mb-2" />
            <h1 className="font-semibold text-xl">Booking Insights</h1>
            <p className="text-gray-500 text-sm sm:text-base">
              Track registrations & attendee analytics.
            </p>
          </div>

          <div className="bg-purple-200 shadow-xl p-5 rounded-xl text-center">
            <AiOutlineBarChart
              size={40}
              className="text-purple-600 mx-auto mb-2"
            />
            <h1 className="font-semibold text-xl">Grow Your Audience</h1>
            <p className="text-gray-500 text-sm sm:text-base">
              Promote events and expand your reach.
            </p>
          </div>
        </div>
      </div>

      {showModal && (
       <div className="fixed inset-0 bg-black/40 backdrop-blur-xl 
                flex justify-center items-start overflow-auto 
                z-50 p-4 outline-none">

          <div
            className="bg-white p-6 sm:p-8 rounded-2xl shadow-2xl 
                    w-full max-w-xl sm:max-w-3xl h-auto
                    relative mt-24 sm:mt-0"
          >
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-5 text-xl text-gray-600 hover:text-red-600 cursor-pointer"
            >
              ×
            </button>

            <h1 className="font-bold text-center text-2xl sm:text-3xl text-purple-600 mb-6">
              {editMode ? "Update Event" : "Create Event"}
            </h1>

            <form onSubmit={formik.handleSubmit}>
              <div className="mb-5">
                <label className="font-semibold text-gray-700">
                  Event Name
                </label>
                <input
                  type="text"
                  name="eventName"
                  className="w-full h-10 border border-gray-300 p-2 rounded mt-1 focus:border-purple-500 text-sm sm:text-base outline-none"
                  {...formik.getFieldProps("eventName")}
                />
                {formik.touched.eventName && formik.errors.eventName && (
                  <p className="text-red-500 text-sm mt-1">
                    {formik.errors.eventName}
                  </p>
                )}
              </div>

              <div className="mb-5">
                <label className="font-semibold text-gray-700">
                  Event Description
                </label>
                <textarea
                  name="description"
                  rows={4}
                  className="w-full border border-gray-300 p-2 rounded mt-1 focus:border-purple-500 text-sm sm:text-base outline-none"
                  {...formik.getFieldProps("description")}
                />
                {formik.touched.description && formik.errors.description && (
                  <p className="text-red-500 text-sm mt-1">
                    {formik.errors.description}
                  </p>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-5">
                <div className="w-full">
                  <label className="font-semibold text-gray-700">
                    Event Type
                  </label>
                  <select
                    name="eventType"
                    className="w-full h-10 border border-gray-300 p-2 rounded mt-1 text-sm sm:text-base outline-none focus-within:border-purple-500"
                    {...formik.getFieldProps("eventType")}
                  >
                    <option value="">Select Type</option>
                    <option value="workshop">Workshop</option>
                    <option value="meetup">Meetup</option>
                    <option value="concert">Concert</option>
                    <option value="conference">Conference</option>
                    <option value="sports">Sport</option>
                    <option value="music">Music</option>
                    <option value="dance">Dance</option>
                    <option value="health">Health</option>

                  </select>
                  {formik.touched.eventType && formik.errors.eventType && (
                    <p className="text-red-500 text-sm mt-1">
                      {formik.errors.eventType}
                    </p>
                  )}
                </div>

                <div className="w-full">
                  <label className="font-semibold text-gray-700">Price</label>
                  <div className="flex items-center border border-gray-300 rounded mt-1 focus-within:border-purple-500 px-3 py-1 outline-none">
                    <buton
                      type="button"
                      onClick={() =>
                        formik.setFieldValue(
                          "price",
                          Math.max(Number(formik.values.price || 0) - 1, 0)
                        )
                      }
                      className="px-3 text-lg text-gray-600 font-bold"
                    >
                      -
                    </buton>

                    <input
                      type="number"
                      name="price"
                      className="w-full text-center h-8 border-none focus:outline-none text-sm sm:text-base outline-none"
                      {...formik.getFieldProps("price")}
                    />

                    <button
                      type="button"
                      onClick={() =>
                        formik.setFieldValue(
                          "price",
                          Number(formik.values.price || 0) + 1
                        )
                      }
                      className="px-3 text-lg text-gray-600 font-bold outline-none"
                    >
                      +
                    </button>
                  </div>
                  {formik.touched.price && formik.errors.price && (
                    <p className="text-red-500 text-sm mt-1">
                      {formik.errors.price}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-5 mt-5">
                <div className="w-full">
                  <label className="font-semibold text-gray-700">
                    Start Date
                  </label>
                  <input
                    type="date"
                    name="startdate"
                    min={minDate}
                    className="w-full h-10 border border-gray-300 p-2 rounded mt-1 text-sm sm:text-base  outline-none focus-within:border-purple-500"
                    {...formik.getFieldProps("startdate")}
                  />
                  {formik.touched.startdate && formik.errors.startdate && (
                    <p className="text-red-500 text-sm mt-1">
                      {formik.errors.startdate}
                    </p>
                  )}
                </div>

                <div className="w-full">
                  <label className="font-semibold text-gray-700">
                    End Date
                  </label>
                  <input
                    type="date"
                    name="enddate"
                    min={minDate}
                    className="w-full h-10 border border-gray-300 p-2 rounded mt-1 text-sm sm:text-base outline-none focus-within:border-purple-500"
                    {...formik.getFieldProps("enddate")}
                  />
                  {formik.touched.enddate && formik.errors.enddate && (
                    <p className="text-red-500 text-sm mt-1">
                      {formik.errors.enddate}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-5 mt-5">
                <div className="w-full">
                  <label className="font-semibold text-gray-700">
                    Start Time
                  </label>
                  <input
                    type="time"
                    name="starttime"
                    className="w-full h-10 border border-gray-300 p-2 rounded mt-1 text-sm sm:text-base  outline-none focus-within:border-purple-500"
                    {...formik.getFieldProps("starttime")}
                  />
                  {formik.touched.starttime && formik.errors.starttime && (
                    <p className="text-red-500 text-sm mt-1">
                      {formik.errors.starttime}
                    </p>
                  )}
                </div>

                <div className="w-full">
                  <label className="font-semibold text-gray-700">
                    End Time
                  </label>
                  <input
                    type="time"
                    name="endtime"
                    className="w-full h-10 border border-gray-300 p-2 rounded mt-1 text-sm sm:text-base  outline-none focus-within:border-purple-500"
                    {...formik.getFieldProps("endtime")}
                  />
                  {formik.touched.endtime && formik.errors.endtime && (
                    <p className="text-red-500 text-sm mt-1">
                      {formik.errors.endtime}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-5">
                <label className="font-semibold text-gray-700">
                  Tickets Quantity
                </label>
                <input
                  type="number"
                  name="tickets"
                  className="w-full h-10 border border-gray-300 p-2 rounded mt-1 text-sm sm:text-base outline-none focus-within:border-purple-500"
                  {...formik.getFieldProps("tickets")}
                />
                {formik.touched.tickets && formik.errors.tickets && (
                  <p className="text-red-500 text-sm mt-1">
                    {formik.errors.tickets}
                  </p>
                )}
              </div>

              <div className="mt-5">
                <label className="font-semibold text-gray-700">Location</label>
                <input
                  type="text"
                  name="location"
                  className="w-full h-10 border border-gray-300 p-2 rounded mt-1 text-sm sm:text-base outline-none focus-within:border-purple-500"
                  {...formik.getFieldProps("location")}
                />
                {formik.touched.location && formik.errors.location && (
                  <p className="text-red-500 text-sm mt-1">
                    {formik.errors.location}
                  </p>
                )}
              </div>

              <div className="flex justify-center mt-6">
                <button
                  type="submit"
                  className="bg-purple-600 text-white px-6 sm:px-8 py-2 rounded-md font-semibold hover:bg-purple-800 w-full text-sm sm:text-base outline-none cursor-pointer"
                >
                  {editMode ? "Update Event" : "Create +"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
export default OrganizerDashboard;
