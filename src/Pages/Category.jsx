import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  collection,
  query,
  where,
  getDocs,
  onSnapshot,
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  orderBy,
  startAt,
  endAt,
  addDoc,
  getDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { toast } from "react-toastify";
import { IoArrowBack } from "react-icons/io5";
import { SlCalender } from "react-icons/sl";
import { FaRegUser } from "react-icons/fa6";
import { IoMdLogOut } from "react-icons/io";
import musicevent from "../assets/musicevent.png";
import danceevent from "../assets/danceevent.webp";
import healthevent from "../assets/healthevent.png";
import sportsevent from "../assets/sportsevent.png";
import concertevent from "../assets/concertevent.png";
import workshopevent from "../assets/workshopevent.png";
import meetupevent from "../assets/meetupevent.jpg";
import conferenceevent from "../assets/conferenceevent.jpg";
import { useFormik } from "formik";
import * as Yup from "yup";
import CardComponent from "../Components/CardComponent";
import ButtonComponent from "../Components/ButtonComponent";
import SearchBarComponent from "./SearchBarComponent";
function Category() {
  const navigate = useNavigate();
  const { type } = useParams();
  const [events, setEvents] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [logoutPopup, setLogoutPopup] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [ticketQty, setTicketQty] = useState(1);
  const [users, setUsers] = useState([]);

  const fetchCategoryEvents = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "events"), where("eventType", "==", type));
      const snap = await getDocs(q);
      const list = [];
      for (const docSnap of snap.docs) {
        const event = { id: docSnap.id, ...docSnap.data() };
        const ratingRef = collection(db, "rating");
        const ratingQ = query(ratingRef, where("eventId", "==", event.id));
        const ratingSnap = await getDocs(ratingQ);
        event.ratings = ratingSnap.docs.map((r) => ({ id: r.id, ...r.data() }));
        list.push(event);
      }
      setEvents(list);
    } catch (err) {
      toast.error("Events not found");
    }
    setLoading(false);
  };

  useEffect(() => {
    const q = query(collection(db, "events"), where("eventType", "==", type));
    const unsub = onSnapshot(q, async (snapshot) => {
      const list = [];
      for (const docSnap of snapshot.docs) {
        const event = { id: docSnap.id, ...docSnap.data() };
        const ratingRef = collection(db, "rating");
        const ratingQ = query(ratingRef, where("eventId", "==", event.id));
        const ratingSnap = await getDocs(ratingQ);
        event.ratings = ratingSnap.docs.map((r) => ({ id: r.id, ...r.data() }));
        list.push(event);
      }
      setEvents(list);
    });
    return () => unsub();
  }, [type]);

  const searchEvents = async () => {
    const text = searchTerm.trim();
    if (!text) {
      fetchCategoryEvents();
      return;
    }
    const q = query(
      collection(db, "events"),
      where("eventType", "==", type),
      orderBy("eventName"),
      startAt(text),
      endAt(text + "\uf8ff")
    );
    const snap = await getDocs(q);
    const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    setEvents(list);
  };

  const isWishlisted = (id) => wishlist.some((w) => w.id === id);
  const toggleWishlist = async (event) => {
    try {
      const user = JSON.parse(localStorage.getItem("EventHub"));
      if (!user?.uid) return toast.error("Please login first");
      const userRef = doc(db, "users", user.uid);
      if (isWishlisted(event.id)) {
        const old = wishlist.find((w) => w.id === event.id);
        await updateDoc(userRef, { wishlist: arrayRemove(old) });
        setWishlist((prev) => prev.filter((i) => i.id !== event.id));
        toast.success("Removed from wishlist");
      } else {
        const newItem = { id: event.id, ...event };
        await updateDoc(userRef, { wishlist: arrayUnion(newItem) });
        setWishlist((prev) => [...prev, newItem]);
        toast.success("Added to wishlist");
      }
    } catch (err) {
      toast.error("Wishlist error");
    }
  };

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
    fetchCategoryEvents();
  }, [type]);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("EventHub"));
    setUserName(user?.name || "User");
    if (!user) return;
    const unsub = onSnapshot(doc(db, "users", user.uid), (snap) => {
      if (!snap.exists()) return;
      if (snap.data().status !== 1) {
        toast.error("Unauthorized");
        navigate("/login");
      }
      setWishlist(snap.data().wishlist || []);
    });
    return () => unsub();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("EventHub");
    navigate("/login");
  };

  const eventSections = {
    music: {
      gradient: "bg-[linear-gradient(180deg,#15004A_-5.83%,#1A142B_49.73%)]",
      image: musicevent,
      text: "Music signifies the vibrant energy of the place! Such music events in Ahmedabad make the city alive throughout the year. From live music shows and concerts to karaoke nights and gigs at bars and cafes, music fills the silence beautifully in Ahmedabad. The city has a lot for you in store, and there isn’t any lack of music events in Ahmedabad for classical lovers or concertgoers! Music is here to heal you and make you groove with festivals and heartfelt concerts in Ahmedabad.",
      imageClass: "h-full w-full",
    },

    dance: {
      gradient: "bg-[linear-gradient(180deg,#15004A_-5.83%,#1A142B_49.73%)]",
      image: danceevent,
      text: "Bring the true star in you out at the top dance classes in Ahmedabad and be a performer like you are. You can learn your best moves, be a champ at your dancing style and participate in the top Ahmedabad dance competitions. If you aren’t much passionate about dancing but want to explore this area then you can even try out some of the fantastic dance workshops in Ahmedabad.Explore the best of dance styles and try your hands out",
      imageClass: "",
    },

    sports: {
      gradient: "bg-[linear-gradient(180deg,#566918_-5.83%,#31451A_49.73%)]",
      image: sportsevent,
      text: "Sports is about bettering ourselves. It's more about self-improvement, beating one's own record every day every moment. It helps us to gain the sportsmanship attitude not just towards game but towards life. While every sport follows different rules, participating in sports activities will help your brain take decisions faster. Participate in the sports events in Ahmedabad like a football tournament, cricket, basketball, rugby/soccer, etc to helps to build your stamina. Exercising and playing sports increase the flow of oxygen in the body. ",
      imageClass: "",
    },

    health: {
      gradient: "bg-[linear-gradient(180deg,#566918_-5.83%,#31451A_49.73%)]",
      image: healthevent,
      text: "If there is anything that will stay with you until the end of your life, it is your body. Treat your body like a temple to your soul and it will never leave you till the last breath.",
      imageClass: "",
    },

    concert: {
      gradient: "bg-[linear-gradient(180deg,#15004A_-5.83%,#1A142B_49.73%)]",
      image: concertevent,
      text: "Life can never be boring if you learn to party hard. Don't just wait for weekends, celebrate every accomplishment or even your existence. Check out the Ahmedabad nightlife scene with pool parties, discotheques, DJ Nights, pub crawls, trance festivals and many more. You will be surprised to find many happy hours booze and best DJs playing your favorite EDM at weekend party venues near you in Ahmedabad.Dance to the beats. Explore the parties in Ahmedabad.",
      imageClass: "",
    },

    workshop: {
      gradient: "bg-[linear-gradient(180deg,#566918_-5.83%,#31451A_49.73%)]",
      image: workshopevent,
      text: "Explore the events in that you simply can't miss. Step outside your comfort zone and dive into exciting new experiences.",
      imageClass: "",
    },

    meetup: {
      gradient: "bg-[linear-gradient(180deg,#566918_-5.83%,#31451A_49.73%)]",
      image: meetupevent,
      text: "Step outside your comfort zone... focus on connection, shared experiences, and growth, like, The power of gathering inspires us to be more hopeful, joyful, thoughtful, or Winnie the Pooh's I knew when I met you an adventure was going to happen, highlighting themes of friendship, community, creating opportunities, and finding belonging through shared interests, perfect for inviting people to join your group.",
      imageClass: "",
    },

    conference: {
      gradient: "bg-[linear-gradient(180deg,#566918_-5.83%,#31451A_49.73%)]",
      image: conferenceevent,
      text: "There are all the kinds of business events that suit your preferences. Be a part of huge Business summits, startup events or a relatively casual business luncheon and find the right platform to engage with such business events in Ahmedabad. Explore from the extensive business events happening in Ahmedabad; Attend events for business growth, for networking, for finding answers or just simply for personal growth.",
      imageClass: "",
    },
  };

  const current = eventSections[type.toLowerCase()];

  return (
    <div>
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-xl py-3 px-5 flex justify-between items-center">
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

          <div className="hidden md:flex text-purple-600 lg:ml-[700px] font-semibold cursor-pointer gap-6 text-[17px]">
            <p
              className="hover:text-purple-700"
              onClick={() => navigate("/bookevent")}
            >
              All Events
            </p>
            <p
              className="hover:text-purple-700"
              onClick={() => navigate("/chat")}
            >
              Chats
            </p>
            <p
              className="hover:text-purple-700"
              onClick={() => navigate("/mytickets")}
            >
              My Bookings
            </p>
          </div>

          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2 outline-none text-purple-700 font-semibold border border-purple-600 rounded-xl px-3 py-2"
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

        {current && (
          <div className="px-3 sm:px-5">
            <div
              className={`flex flex-col md:flex-row mt-10 rounded-lg 
                md:h-90 w-full text-white items-center 
                overflow-hidden ${current.gradient}`}
            >
              <div className="flex flex-col md:w-[50%] lg:w-[50%] w-full p-6">
                <h1 className="text-3xl md:text-4xl font-bold capitalize">
                  {type} Events
                </h1>
                <p className="font-semibold text-gray-300 mt-3 text-sm md:text-base">
                  {current.text}
                </p>
              </div>

              <div className="md:w-[50%] lg:w-[50%] w-full justify-end flex cursor-pointer">
                <img
                  src={current.image}
                  className={`max-w-full h-auto ${current.imageClass}`}
                />
              </div>
            </div>
          </div>
        )}

        <div className="w-full px-4 mt-8 flex justify-center">
          <SearchBarComponent
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              searchEvents(e.target.value);
            }}
            placeholder="Search Events..."
          />
        </div>

        <div className="max-w-6xl mx-auto mt-5 mb-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-4">
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
                  <div
                    key={index}
                    className="mb-4 border-b border-gray-300 pb-3"
                  >
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
    </div>
  );
}

export default Category;
