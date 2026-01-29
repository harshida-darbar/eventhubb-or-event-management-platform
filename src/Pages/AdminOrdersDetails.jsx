import React, { useEffect, useState } from "react";
import { SlCalender } from "react-icons/sl";
import { IoArrowBack } from "react-icons/io5";
import { useNavigate, useParams } from "react-router-dom";
import { db } from "../firebase";
import { getDoc, doc } from "firebase/firestore";
import { toast } from "react-toastify";

function AdminOrdersDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [orders, setOrders] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const docRef = doc(db, "orders", id);
        const snapshot = await getDoc(docRef);

        if (snapshot.exists()) {
          setOrders(snapshot.data());
        } else {
          toast.error("Order not found.");
        }
      } catch (err) {
        toast.error("Error loading order...");
      }
    };
    fetchOrders();
  }, [id]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-xl p-5 flex justify-between items-center">
        <div className="flex items-center gap-3 p-3">
          <button
            onClick={() => navigate("/managebooking")}
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

      <div className="flex justify-center">
        <div className="bg-white mt-5 shadow-2xl w-[500px] rounded-xl p-6">
          <h1 className="text-purple-800 text-2xl font-bold mb-4 border-b pb-2">
            Order Details
          </h1>
          {orders ? (
            <div className="space-y-3 text-gray-700 text-lg bg-purple-50 p-4 rounded-lg shadow-inner">
              <p>
                <span className="font-semibold text-purple-700">Name:</span>{" "}
                {orders.eventName}
              </p>

              <p>
                <span className="font-semibold text-purple-700">
                  Booked By:
                </span>{" "}
                {orders.bookedByName}
              </p>

              <p>
                <span className="font-semibold text-purple-700">
                  Created At:
                </span>{" "}
                      {orders.createdAt
                        ? typeof orders.createdAt === "string"
                          ? new Date(orders.createdAt).toLocaleDateString("en-IN")
                          : new Date(
                              orders.createdAt.seconds * 1000
                            ).toLocaleDateString("en-IN")
                        : "—"}
              </p>

              <p>
                <span className="font-semibold text-purple-700">
                  Price per Ticket:
                </span>{" "}
                {orders.pricePerTicket}
              </p>

              <p>
                <span className="font-semibold text-purple-700">
                  Total Price:
                </span>{" "}
                {orders.totalPrice}
              </p>

              <p>
                <span className="font-semibold text-purple-700">Users:</span>{" "}
                {orders.users?.map((u, index) => (
                  <div key={index}>
                    <p>
                      <span className="font-semibold text-purple-700">
                        user's name:
                      </span>{" "}
                      {u.name}
                    </p>
                  </div>
                ))}
              </p>
            </div>
          ) : (
            <p className="text-center text-gray-500">Loading...</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminOrdersDetails;
