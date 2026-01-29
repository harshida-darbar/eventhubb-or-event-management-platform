import React, { useState, useEffect } from "react";
import { SlCalender } from "react-icons/sl";
import { IoArrowBack } from "react-icons/io5";
import { useNavigate, useParams } from "react-router-dom";
import { db } from "../firebase";
import { toast } from "react-toastify";
import { getDoc,doc } from "firebase/firestore";

function AdminEventDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [events, setEvents] = useState(null);

  useEffect(() => {
      const fetchEvents = async () => {
        try {
          const docRef = doc(db, "events", id);
          const snapshot = await getDoc(docRef);
          if (snapshot.exists()) {
            setEvents(snapshot.data());
          } else {
            toast.error("not found...");
          }
        } catch (err) {
          toast.error("Events not found...");
        }
      };
      fetchEvents();
    },
    [id]);
    
  return (
    <div>
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-xl p-5 flex justify-between items-center">
          <div className="flex items-center gap-3 p-3">
            <button
              onClick={() => navigate("/manageevent")}
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
        <div className=" flex justify-center">
          <div className="flex justify-center">
            <div className="bg-white mt-5 shadow-2xl w-[500px] rounded-xl p-6">
              <h1 className="text-purple-800 text-2xl font-bold mb-4 border-b pb-2">
                Event Details
              </h1>

              {events ? (
                <div
                  className="space-y-3 text-gray-700 text-lg bg-purple-50 p-4 rounded-lg shadow-inner"
                >
                  <p>
                    <span className="font-semibold text-purple-700">
                      Event Name:
                    </span>{" "}
                    {events.eventName}
                  </p>

                  <p>
                    <span className="font-semibold text-purple-700">
                      Event Type:
                    </span>{" "}
                    {events.eventType}
                  </p>

                  <p>
                    <span className="font-semibold text-purple-700">
                      Description:
                    </span>{" "}
                    {events.description}
                  </p>

                  <p>
                    <span className="font-semibold text-purple-700">
                      Created By:
                    </span>{" "}
                    {events.createdBy}
                  </p>

                  <p>
                    <span className="font-semibold text-purple-700">
                      Created At:
                    </span>{" "}
                      {events.createdAt
                        ? typeof events.createdAt === "string"
                          ? new Date(events.createdAt).toLocaleDateString("en-IN")
                          : new Date(
                              events.createdAt.seconds * 1000
                            ).toLocaleDateString("en-IN")
                        : "—"}
                  </p>

                  <p>
                    <span className="font-semibold text-purple-700">Date:</span>{" "}
                    {events.date}
                  </p>
                  <p>
                    <span className="font-semibold text-purple-700">
                      Price:
                    </span>{" "}
                    {events.price}
                  </p>
                  
                  <p>
                    <span className="font-semibold text-purple-700">
                      Sold Tickets:
                    </span>{" "}
                    {events.ticket_config.soldTickets}
                  </p>
                  <p>
                    <span className="font-semibold text-purple-700">
                      Available Tickets:
                    </span>{" "}
                    {events.ticket_config.availableTickets}
                  </p>
                  <p>
                    <span className="font-semibold text-purple-700">
                      Total Tickets:
                    </span>{" "}
                    {events.ticket_config.totalTickets}
                  </p>
                </div> ) : (
            <p className="text-center text-gray-500">Loading...</p>
          )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminEventDetails;
