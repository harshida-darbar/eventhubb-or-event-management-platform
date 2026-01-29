import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { SlCalender } from "react-icons/sl";
import { FaRegUser } from "react-icons/fa6";
import { IoMdLogOut } from "react-icons/io";
import { IoArrowBack } from "react-icons/io5";
import { IoFilterSharp } from "react-icons/io5";
import { MdVideocam } from "react-icons/md";
import { PiNotePencilDuotone } from "react-icons/pi";
import { HiUserCircle } from "react-icons/hi";
import { FiSmile } from "react-icons/fi";
import { CiImageOn } from "react-icons/ci";
import { MdOutlineAttachFile } from "react-icons/md";
import { IoMdSend } from "react-icons/io";
import {
  addDoc,
  collection,
  onSnapshot,
  query,
  serverTimestamp,
  where,
  orderBy,
} from "firebase/firestore";
import { db } from "../firebase";
import ButtonComponent from "../Components/ButtonComponent";

function OrgChat() {
  const navigate = useNavigate();
  const bottomRef = useRef(null);

  const [showDropdown, setShowDropdown] = useState(false);
  const [userName, setUserName] = useState("");
  const [logoutPopup, setLogoutPopup] = useState(false);
  const [chatUsers, setChatUsers] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessages, setNewMessages] = useState("");
  const [currentUser, setCurrentUser] = useState(null);

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

  useEffect(() => {
    const usersData = JSON.parse(localStorage.getItem("EventHub"));
    setCurrentUser(usersData);
    const organizerId = usersData?.uid;
    if (!organizerId) return;

    const q = query(
      collection(db, "chats"),
      where("userIds", "array-contains", organizerId)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const chats = snapshot.docs.map((doc) => ({
        chatId: doc.id,
        ...doc.data(),
      }));
      setChatUsers(chats);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!selectedChat) return;

    const chatId = selectedChat.chatId;

    const q = query(
      collection(db, "chats", chatId, "messages"),
      orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMessages(msgs);
    });
    return () => unsubscribe();
  }, [selectedChat]);

  const sendMessage = async () => {
    if (!newMessages.trim() || !selectedChat) return;

    const userData = JSON.parse(localStorage.getItem("EventHub"));

    await addDoc(collection(db, "chats", selectedChat.chatId, "messages"), {
      msg: newMessages,
      createdBy: userData.name,
      createdAt: serverTimestamp(),
      sendAt: serverTimestamp(),
      sendBy: userData.uid,
    });

    setNewMessages("");
  };

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <div>
      <div className="min-h-screen bg-gradiant-to-br from-purple-100 to-purple-200">
        <div className="bg-white shadow-lg p-5 flex justify-between items-center sticky top-0 ">
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

          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-1 text-purple-700 font-semibold cursor-pointer outline-none border border-purple-600 rounded-2xl px-2 py-5 h-10 hover:bg-purple-100 transition"
            >
              <FaRegUser size={20} className="text-purple-700 ml-2" />
              <span>{userName}</span>
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-2 w-40 bg-white shadow-xl rounded-lg p-2 z-50 border border-gray-200 animate-fadeIn">
                <p
                  className="p-2 hover:bg-purple-100 rounded cursor-pointer"
                  onClick={() => navigate("/profile")}
                >
                  My Profile
                </p>
                <p
                  className="p-2 hover:bg-purple-100 rounded cursor-pointer"
                  onClick={() => navigate("/groupchats")}
                >
                  Group Chats
                </p>
                <p
                  onClick={() => navigate("/qrscan")}
                  className="p-2 hover:bg-purple-100 rounded cursor-pointer"
                >
                  Scan QR
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
              <div className="bg-white p-6 rounded-xl shadow-xl w-[350px] text-center">
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

        <div className="bg-white mt-7 shadow">
          <div className="flex flex-col md:flex-row h-[calc(100vh-120px)]">
            <div className="bg-white w-full md:w-[30%] p-6 border-r border-gray-300 overflow-y-auto">
              <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-purple-700">Chat</h1>
                <div className="flex gap-3 text-purple-700 cursor-pointer">
                  <IoFilterSharp size={22} />
                  <MdVideocam size={22} />
                  <PiNotePencilDuotone size={22} />
                </div>
              </div>

              {chatUsers.map((chat) => {
                const otherUser = chat.users.find((u) => u.role === "user");
                return (
                  <div
                    key={chat.chatId}
                    onClick={() => setSelectedChat(chat)}
                    className="flex bg-purple-100 mt-5 p-4 rounded gap-2 cursor-pointer text-purple-800 hover:bg-purple-200"
                  >
                    <HiUserCircle size={35} />
                    <p className="font-semibold text-lg">{otherUser?.name}</p>
                  </div>
                );
              })}
            </div>

            <div className="flex flex-col w-full md:w-[70%]">
              <div className="flex items-center gap-3 p-4">
                <HiUserCircle size={40} className="text-purple-700" />
                <h2 className="text-xl font-bold text-purple-800">
                  {selectedChat
                    ? selectedChat.users.find((u) => u.role === "user")?.name
                    : "Select a chat"}
                </h2>
              </div>

              <div className="flex-1 p-4 md:p-6 overflow-y-auto flex flex-col gap-3 bg-purple-50">
                {!selectedChat ? (
                  <p className="text-center text-gray-500 mt-20 text-lg">
                    Select a chat to start conversation...
                  </p>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`max-w-[60%] p-3 rounded-lg ${
                        msg.sendBy === currentUser.uid
                          ? "bg-purple-600 text-white ml-auto"
                          : "bg-gray-200 text-gray-900 mr-auto"
                      }`}
                    >
                      {msg.msg}
                    </div>
                  ))
                )}
                <div ref={bottomRef}></div>
              </div>

              {selectedChat && (
                <div className="p-3 flex items-center gap-3 border-t border-gray-300 bg-white">
                  <div
                    className="flex items-center gap-2 border border-gray-300 rounded px-3 py-2 w-full
  max-md:gap-1 max-md:px-2"
                  >
                    <input
                      type="text"
                      value={newMessages}
                      onChange={(e) => setNewMessages(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                      placeholder="Type a message..."
                      className="outline-none bg-transparent flex-1 text-gray-700 px-2 min-w-0"
                    />

                    <div className="flex gap-2 items-center">
                      <FiSmile
                        size={22}
                        className="cursor-pointer text-purple-600"
                      />
                      <CiImageOn
                        size={22}
                        className="cursor-pointer text-purple-600"
                      />
                      <MdOutlineAttachFile
                        size={22}
                        className="cursor-pointer text-purple-600"
                      />

                      <button
                        onClick={sendMessage}
                        className="bg-purple-600 text-white rounded-full p-2 cursor-pointer"
                      >
                        <IoMdSend size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrgChat;
