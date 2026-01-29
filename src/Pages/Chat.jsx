import React, { useEffect, useState, useRef } from "react";
import { FaRegUser } from "react-icons/fa6";
import { IoMdLogOut } from "react-icons/io";
import { SlCalender } from "react-icons/sl";
import { IoArrowBack } from "react-icons/io5";
import { MdOutlineAttachFile } from "react-icons/md";
import { HiUserCircle } from "react-icons/hi";
import { FiSmile } from "react-icons/fi";
import { CiImageOn } from "react-icons/ci";
import { IoMdSend } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import {
  getDoc,
  doc,
  addDoc,
  query,
  where,
  getDocs,
  collection,
  serverTimestamp,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../firebase";
import { toast } from "react-toastify";
import ButtonComponent from "../Components/ButtonComponent";

function Chat() {
  const navigate = useNavigate();
  const bottomRef = useRef(null);

  const [logoutPopup, setLogoutPopup] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [userName, setUserName] = useState("");
  const [chatUsers, setChatUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState("");
  const [messageList, setMessageList] = useState([]);
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);


  const fetchOrganizer = async () => {
    const stored = JSON.parse(localStorage.getItem("EventHub"));
    const eventId = stored?.chatEventId;
    if (!eventId) return null;

    const docRef = doc(db, "events", eventId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const eventData = docSnap.data();
      return {
        id: eventData.userId,
        name: eventData.createdBy,
        role: "organizer",
        eventId,
      };
    }
    return null;
  };

  const fetchChatUsers = async (loggedInUserId) => {
    const q = query(
      collection(db, "chats"),
      where("userIds", "array-contains", loggedInUserId)
    );

    const snap = await getDocs(q);

    const usersList = snap.docs.map((d) => {
      const data = d.data();
      const otherUser = data.users.find((u) => u.id !== loggedInUserId) || {
        name: "Unknown",
        id: "unknown",
      };
      return {
        chatId: d.id,
        id: otherUser.id,
        name: otherUser.name,
        role: otherUser.role,
      };
    });

    return usersList;
  };

  const loadChatUsers = async () => {
    const stored = JSON.parse(localStorage.getItem("EventHub"));
    if (!stored) return;
    const loggedInUserId = stored.uid;

    const organizer = await fetchOrganizer();
    const otherUsers = await fetchChatUsers(loggedInUserId);

    const allUsers = organizer
      ? [organizer, ...otherUsers.filter((u) => u.id !== organizer.id)]
      : otherUsers;

    setChatUsers(allUsers);
  };

  useEffect(() => {
    const fetchGroups = async () => {
      const loginUser = JSON.parse(localStorage.getItem("EventHub"));
      if (!loginUser) return;
      const uid = loginUser.uid;

      const q = query(
        collection(db, "groups"),
        where("usersId", "array-contains", uid)
      );

      const snap = await getDocs(q);

      const groupList = snap.docs.map((d) => ({
        // normalize group object: id and groupName
        id: d.id,
        groupName: d.data().groupName || d.data().name || "Unnamed Group",
        ...d.data(),
      }));

      setGroups(groupList);
    };

    fetchGroups();
  }, []);

  useEffect(() => {
    loadChatUsers();
    const name = JSON.parse(localStorage.getItem("EventHub"))?.name || "User";
    setUserName(name);
  }, []);

  const chatForEvent = async (user) => {
    setSelectedGroup(null);
    setMessageList([]);

    const stored = JSON.parse(localStorage.getItem("EventHub"));
    if (!stored) return toast.error("User not found");

    const eventId = stored.chatEventId;
    const loggedInUser = stored.name;
    const loggedInUserId = stored.uid;

    if (!eventId || !loggedInUser) return toast.error("User not found");

    const q = query(
      collection(db, "chats"),
      where("eventId", "==", eventId),
      where("userIds", "array-contains", loggedInUserId)
    );

    const snap = await getDocs(q);

    if (!snap.empty) {
      const existingChatDoc = snap.docs.find((d) =>
        d.data().userIds.includes(user.id)
      );
      if (existingChatDoc) {
        setSelectedUser({ ...user, chatId: existingChatDoc.id });
        return;
      }
    }
    const chatRef = await addDoc(collection(db, "chats"), {
      eventId,
      userIds: [user.id, loggedInUserId],
      users: [
        { name: user.name, id: user.id, role: user.role || "organizer" },
        { name: loggedInUser, id: loggedInUserId, role: "user" },
      ],
      createdAt: serverTimestamp(),
    });

    setSelectedUser({ ...user, chatId: chatRef.id });
  };

  const openGroupChat = (group) => {
    setSelectedUser(null);
    setMessageList([]);
    setSelectedGroup(group);
  };

  useEffect(() => {
    let unsub = null;
    const readGroup = (group) => {
      const msgRef = collection(db, "groups", group.id, "messages");
      const q = query(msgRef, orderBy("createdAt", "asc"));
      return onSnapshot(q, (snap) => {
        const msgs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setMessageList(msgs);
      });
    };

    const readChat = (chatId) => {
      const chatDocRef = doc(db, "chats", chatId);
      const messageRef = collection(chatDocRef, "messages");
      const q = query(messageRef, orderBy("createdAt", "asc"));
      return onSnapshot(q, (snap) => {
        const msgs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setMessageList(msgs);
      });
    };

    if (selectedGroup) {
      unsub = readGroup(selectedGroup);
    } else if (selectedUser?.chatId) {
      unsub = readChat(selectedUser.chatId);
    } else {
      setMessageList([]);
    }

    return () => {
      if (typeof unsub === "function") unsub();
    };
  }, [selectedGroup, selectedUser]);

  const sendMessage = async () => {
    if (!messages.trim()) return toast.error("Cannot send empty message");

    const storedd = JSON.parse(localStorage.getItem("EventHub"));
    const loggedInUser = storedd?.name;
    const sendById = storedd?.uid;

    try {
      if (selectedGroup) {
        await addDoc(collection(db, "groups", selectedGroup.id, "messages"), {
          msg: messages,
          createdBy: loggedInUser,
          createdAt: serverTimestamp(),
          sendBy: sendById,
        });
        setMessages("");
        return;
      }

      if (selectedUser?.chatId) {
        const chatDocRef = doc(db, "chats", selectedUser.chatId);
        await addDoc(collection(chatDocRef, "messages"), {
          msg: messages,
          createdBy: loggedInUser,
          createdAt: serverTimestamp(),
          sendBy: sendById,
        });
        setMessages("");
        return;
      }

      toast.error("Select a chat first!");
    } catch (err) {
      console.error(err);
      toast.error("Message Not Sent");
    }
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messageList]);

  const handleLogout = () => {
    localStorage.removeItem("EventHub");
    navigate("/login");
  };

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("EventHub"));
    if (!user) return;

    const unsub = onSnapshot(doc(db, "users", user.uid), (snap) => {
      if (!snap.exists()) return;

      const data = snap.data();

      if (data.status !== 1) {
        localStorage.removeItem("EventHub");
        toast.error("Unauthorized User");
        navigate("/login");
      }
    });

    return () => unsub();
  }, []);

  return (
    <div className="min-h-screen bg-gradiant-to-br from-purple-100 to-purple-200">
      <div className="bg-white  shadow-xl py-3 px-5 flex justify-between items-center sticky top-0">
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
            className="flex items-center gap-1 sm:gap-2 text-purple-700 font-semibold border border-purple-600 rounded-xl
      px-2 sm:px-4 py-2"
          >
            <FaRegUser size={18} />
            <span className="capitalize ">{userName}</span>
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-2 w-36 sm:w-40 bg-white shadow-lg rounded-lg p-2 z-50 border border-gray-200">
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
      </div>

      <div className="flex flex-col md:flex-row gap-2 mt-7 h-[calc(100vh-120px)]">
        <div className="bg-white w-full md:w-[30%] p-6 border-r border-gray-300 overflow-y-auto">
          <h1 className="text-2xl font-bold text-purple-700">Chat</h1>

          {chatUsers.length > 0 ? (
            chatUsers.map((user) => (
              <div
                key={user.id}
                onClick={() => chatForEvent(user)}
                className="bg-purple-100 mt-5 p-5 rounded cursor-pointer hover:bg-purple-200"
              >
                <div className="flex text-purple-800 gap-2">
                  <HiUserCircle size={40} />
                  <h1 className="font-bold text-xl mt-1">{user.name}</h1>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 mt-5">No chats yet</p>
          )}
          {groups.length > 0 ? (
            groups.map((g) => (
              <div
                key={g.id}
                onClick={() => openGroupChat(g)}
                className="bg-purple-100 mt-5 p-5 rounded cursor-pointer hover:bg-purple-200"
              >
                <div className="flex text-purple-800 gap-2">
                  <HiUserCircle size={40} />
                  <h1 className="font-bold text-xl mt-1">{g.groupName}</h1>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 mt-3">No groups</p>
          )}
        </div>

        <div className="flex flex-col w-full md:w-[70%]">
          <div className="flex text-purple-800 gap-2 items-center p-4 border-b border-gray-300">
            <HiUserCircle size={40} />
            <h1 className="font-bold text-xl">
              {selectedGroup?.groupName ||
                selectedUser?.name ||
                "Select a chat"}
            </h1>
          </div>

          <div className="flex-1 overflow-y-auto p-4 bg-purple-50 flex flex-col gap-3">
            {messageList.length > 0 ? (
              messageList.map((m) => (
                <div
                  key={m.id}
                  className={`p-3 rounded-lg max-w-[75%] ${
                    m.sendBy ===
                    JSON.parse(localStorage.getItem("EventHub"))?.uid
                      ? "text-white bg-purple-500 font-semibold ml-auto"
                      : "text-gray-700 bg-purple-200 font-semibold mr-auto"
                  }`}
                >
                  {m.msg}
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center mt-10">
                Start conversation...
              </p>
            )}
            <div ref={bottomRef}></div>
          </div>

          <div className="p-3 border-t border-gray-300 bg-white">
            <div className="flex items-center gap-2 border border-gray-300 rounded px-3 py-2 w-full">
              <input
                type="text"
                value={messages}
                onChange={(e) => setMessages(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Type a message..."
                className="outline-none bg-transparent flex-1 text-gray-700 px-2 min-w-0"
              />
              <FiSmile size={22} className="cursor-pointer text-purple-600" />
              <CiImageOn size={22} className="cursor-pointer text-purple-600" />
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
                className="bg-red-600 hover:bg-red-700"
              />
                
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Chat;
