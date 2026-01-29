import React, { useEffect, useState } from "react";
import { SlCalender } from "react-icons/sl";
import { IoArrowBack } from "react-icons/io5";
import { useNavigate, useParams } from "react-router-dom";
import {
  getFirestore,
  doc,
  getDoc,
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { app } from "../firebase";
import { toast } from "react-toastify";

const db = getFirestore(app);

function EventDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const eventRef = doc(db, "events", id);
        const eventSnap = await getDoc(eventRef);
        if (eventSnap.exists()) {
          setEvent(eventSnap.data());
        } else {
          toast.error("Event not found.");
        }
      } catch (error) {
        toast.error("Failed to fetch event details.");
      }
    };
    fetchEvent();
  }, [id]);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoadingOrders(true);
      try {
        const q = query(collection(db, "orders"), where("eventId", "==", id));
        const querySnapshot = await getDocs(q);
        const allOrders = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setOrders(allOrders);
      } catch (error) {
        toast.error("Failed to fetch order details.");
      } finally {
        setLoadingOrders(false);
      }
    };

    fetchOrders();
  }, [id]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-xl p-5 flex justify-between items-center">
        <div className="flex items-center gap-3 p-3">
          <button
            onClick={() => navigate("/maindashboard")}
            className="flex items-center text-purple-600 font-semibold"
          >
            <IoArrowBack size={35} className="mr-1 cursor-pointer" />
          </button>
          <SlCalender
            size={35}
            className="bg-purple-600 text-white p-1 rounded"
          />
          <h1 className="text-purple-600 text-2xl font-semibold">EventHub</h1>
        </div>
      </div>

      <div className="p-10 space-y-8">

        <div className="bg-white shadow-xl p-8 rounded-2xl">
          {!event ? (
            <p className="text-gray-600 text-lg">Loading event details...</p>
          ) : (
            <>
            <h1 className="text-3xl font-bold text-purple-700 mb-3">Event Details</h1>
              <h1 className="text-xl font-bold text-gray-600 mb-3 underline underline-offset-2">
                {event.eventName}
              </h1>

              <div className="grid sm:grid-cols-2 gap-3 text-gray-700">
                <p>
                  <strong>Description:</strong> {event.description}
                </p>
                <p>
                  <strong>Type:</strong> {event.eventType}
                </p>
                <p>
                  <strong>Start Date:</strong> {event.startdate}
                </p>
                 <p>
                  <strong>End Date:</strong> {event.enddate}
                </p>
                 <p>
                  <strong>Start Time:</strong> {event.starttime}
                </p>
                 <p>
                  <strong>End Time:</strong> {event.endtime}
                </p>
                <p>
                  <strong>Location:</strong> {event.location}
                </p>
                <p>
                  <strong>Price:</strong> ₹{event.price}
                </p>
                <p>
                  <strong>Total Tickets:</strong>{" "}
                  {event.ticket_config?.totalTickets || 0}
                </p>
                <p>
                  <strong>Sold Tickets:</strong>{" "}
                  {event.ticket_config?.soldTickets || 0}
                </p>
                <p>
                  <strong>Available:</strong>{" "}
                  {event.ticket_config?.availableTickets || 0}
                </p>
              </div>
            </>
          )}
        </div>
        
        <div className="bg-white shadow-xl p-6 rounded-2xl">
          <h2 className="text-2xl font-bold text-purple-800 mb-4">Orders</h2>

          {loadingOrders ? (
            <p className="text-gray-600">Loading orders...</p>
          ) : orders.length === 0 ? (
            <p className="text-gray-500">No orders found for this event yet.</p>
          ) : (
            <div className="rounded-lg border border-gray-200">
              <table className="min-w-full text-left">
                <thead className="bg-purple-100 text-purple-800">
                  <tr>
                    <th className="px-4 py-2 border-b border-gray-300 border-r">#</th>
                    <th className="px-4 py-2 border-b border-gray-300 border-r">Order ID</th>
                    <th className="px-4 py-2 border-b border-gray-300 border-r">Booked By</th>
                    <th className="px-4 py-2 border-b border-gray-300 border-r">Total Price (₹)</th>
                    <th className="px-4 py-2 border-b border-gray-300 border-r">Tickets</th>
                    <th className="px-4 py-2 border-b border-gray-300">User Details</th>
                  </tr>
                </thead>

                <tbody className="text-gray-700">
                  {orders.map((order, index) => (
                    <tr
                      key={order.id}
                    >
                      <td className="px-4 py-2 border-b border-gray-200 border-r">{index + 1}</td>
                      <td className="px-4 py-2 border-b border-gray-200 border-r">{order.id}</td>
                      <td className="px-4 py-2 border-b border-gray-200 border-r">{order.bookedByName || order.bookedBy}</td>
                      <td className="px-4 py-2 border-b border-gray-200 border-r">
                        ₹{Number(order.totalPrice).toLocaleString("en-IN")}
                      </td>
                      <td className="px-4 py-2 border-b border-gray-200 border-r">
                        {order.users.length}
                      </td>
                      <td className="px-4 py-2 border-b border-gray-200">
                        <ul className="list-disc list-inside text-sm text-gray-600">
                          {order.users.map((u, i) => (
                            <li key={i}>
                              {u.name} — {u.email}
                            </li>
                          ))}
                        </ul>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        
      </div>
    </div>
  );
}

export default EventDetails;
