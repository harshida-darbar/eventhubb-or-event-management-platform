import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import SignUp from "./Pages/SignUp";
import Login from "./Pages/Login";
import MainDashboard from "./Pages/MainDashboard";
import PrivateRoute from "./Components/PrivateRoute";
import BookEvent from "./Pages/BookEvent";
import BookEventsListing from "./Pages/BookEventsListing";
import EventDetails from "./Pages/EventDetails";
import MyProfile from "./Pages/MyProfile";
import MyTickets from "./Pages/MyTickets";
import Wishlist from "./Pages/Wishlist";
import TicketsDetailsView from "./Pages/TicketsDetailsView";
import Chat from "./Pages/Chat";
import QrScanner from "./Pages/QrScanner";
import OrgChat from "./Pages/OrgChat";
import GroupChats from "./Pages/GroupChats";
import Admin from "./Pages/Admin";
import EventManagement from "./Pages/EventManagement";
import BookingManagement from "./Pages/BookingManagement";
import OrganizerManagement from "./Pages/OrganizerManagement";
import UsersDetails from "./Pages/UsersDetails";
import OrganizerDetails from "./Pages/OrganizerDetails";
import AdminOrdersDetails from "./Pages/AdminOrdersDetails";
import AdminEventDetails from "./Pages/AdminEventDetails";
import OrgRating from "./Pages/OrgRating";
import Hero from "./Pages/Hero";
import Section2 from "./Pages/Section2";
import Category from "./Pages/Category";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Banner from "./Pages/Banner";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route
            path="/maindashboard"
            element={
              <PrivateRoute>
                <MainDashboard />
              </PrivateRoute>
            }
          />
          <Route path="/bookevent" element={<BookEvent />} />
          <Route path="/booklisting/:id" element={<BookEventsListing />} />
          <Route path="/event/:id" element={<EventDetails/>}/>
          <Route path="/profile" element={<MyProfile/>}/>
          <Route path="/mytickets" element={<MyTickets/>}/>
          <Route path="/ticketsview" element={<TicketsDetailsView/>}/>
          <Route path="/qrscan" element={<QrScanner/>}/>
          <Route path="/wishlist" element={<Wishlist/>}/>
          <Route path="/chat" element={<Chat/>}/>
          <Route path="/orgchat" element={<OrgChat/>}/>
          <Route path="/groupchats" element={<GroupChats/>}/>
          <Route path="/admin" element={<Admin/>}/>
          <Route path="/manageevent" element={<EventManagement/>}/>
          <Route path="/managebooking" element={<BookingManagement/>}/>
          <Route path="/manageorganizer" element={<OrganizerManagement/>}/>
          <Route path="/usersdetails/:id" element={<UsersDetails/>}/>
          <Route path="/organizerdetails/:id" element={<OrganizerDetails/>}/>
          <Route path="/orderdetails/:id" element={<AdminOrdersDetails/>}/>
          <Route path="eventdetails/:id" element={<AdminEventDetails/>}/>
          <Route path="/ratings/:eventId" element={<OrgRating />} />
          <Route path="/hero" element={<Hero/>}/>
          <Route path="/section2" element={<Section2/>}/>
          <Route path="/banner" element={<Banner/>}/>
          <Route path="/category/:type" element={<Category/>}/>
        </Routes>
        <ToastContainer position="top-center" autoClose={2000} />
      </BrowserRouter>
    </>
  );
}

export default App;
 