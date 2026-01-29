import React, { useEffect, useState } from "react";
import { SlCalender } from "react-icons/sl";
import { IoArrowBack } from "react-icons/io5";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { db } from "../firebase";
import { getDoc, doc } from "firebase/firestore";

function OrganizerDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [organizers, setOrganizers] = useState([]);

  useEffect(() => {
    const fetchOrganizers = async () => {
      try {
        const docRef = doc(db, "users", id);
        const snapshot = await getDoc(docRef);
        if (snapshot.exists()) {
          setOrganizers([{ id: snapshot.id, ...snapshot.data() }]);
        } else {
          toast.error("not found...");
        }
      } catch (err) {
        toast.error("Organizers not found...");
      }
    };
    fetchOrganizers();
  }, [id]);

  return (
    <div>
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-xl p-5 flex justify-between items-center">
          <div className="flex items-center gap-3 p-3">
            <button
              onClick={() => navigate("/manageorganizer")}
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
                Organizer Details
              </h1>

              {organizers.map((o) => (
                <div
                  key={o.id}
                  className="space-y-3 text-gray-700 text-lg bg-purple-50 p-4 rounded-lg shadow-inner"
                >
                  <p>
                    <span className="font-semibold text-purple-700">Name:</span>{" "}
                    {o.name}
                  </p>

                  <p>
                    <span className="font-semibold text-purple-700">
                      Email:
                    </span>{" "}
                    {o.email}
                  </p>

                  <p>
                    <span className="font-semibold text-purple-700">Role:</span>{" "}
                    {o.role}
                  </p>

                  <p>
                    <span className="font-semibold text-purple-700">
                      Created At:
                    </span>{" "}
                    {o.createdAt || "—"}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrganizerDetails;
