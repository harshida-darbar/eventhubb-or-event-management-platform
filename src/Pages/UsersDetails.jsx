import React, { useEffect, useState } from "react";
import { SlCalender } from "react-icons/sl";
import { IoArrowBack } from "react-icons/io5";
import { useNavigate, useParams } from "react-router-dom";
import { db } from "../firebase";
import { getDoc, doc } from "firebase/firestore";
import { toast } from "react-toastify";

function UsersDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const docRef = doc(db, "users", id);
        const snapshot = await getDoc(docRef);
        if (snapshot.exists()) {
          setUsers([{ id: snapshot.id, ...snapshot.data() }]);
        } else {
          toast.error("User not found!");
        }
      } catch (err) {
        toast.error("Users not foundd...");
      }
    };
    fetchUsers();
  }, [id]);

  return (
    <div>
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-xl p-5 flex justify-between items-center">
          <div className="flex items-center gap-3 p-3">
            <button
              onClick={() => navigate("/admin")}
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
                User Details
              </h1>

              {users.map((u) => (
                <div
                  key={u.id}
                  className="space-y-3 text-gray-700 text-lg bg-purple-50 p-4 rounded-lg shadow-inner"
                >
                  <p>
                    <span className="font-semibold text-purple-700">Name:</span>{" "}
                    {u.name}
                  </p>

                  <p>
                    <span className="font-semibold text-purple-700">
                      Email:
                    </span>{" "}
                    {u.email}
                  </p>

                  <p>
                    <span className="font-semibold text-purple-700">Role:</span>{" "}
                    {u.role}
                  </p>

                  <p>
                    <span className="font-semibold text-purple-700">
                      Created At:
                    </span>{" "}
                    {u.createdAt || "—"}
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

export default UsersDetails;
