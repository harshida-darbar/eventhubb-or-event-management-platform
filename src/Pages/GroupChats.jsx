import { React, useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaRegUser } from "react-icons/fa6";
import { IoMdLogOut } from "react-icons/io";
import { SlCalender } from "react-icons/sl";
import { IoArrowBack, IoSearch } from "react-icons/io5";
import { HiUserCircle } from "react-icons/hi";
import { FiSmile } from "react-icons/fi";
import { CiImageOn } from "react-icons/ci";
import { MdOutlineAttachFile } from "react-icons/md";
import { IoMdSend } from "react-icons/io";
import { RxCross2 } from "react-icons/rx";
import { MdCheckBoxOutlineBlank, MdOutlineCheckBox } from "react-icons/md";

import {
  query,
  collection,
  where,
  getDocs,
  serverTimestamp,
  addDoc,
  doc,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../firebase";
import { toast } from "react-toastify";
import ButtonComponent from "../Components/ButtonComponent";

function GroupChats() {
  const navigate = useNavigate();
  const bottomRef = useRef();

  const [logoutPopup, setLogoutPopup] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const [userName, setUserName] = useState("");
  const [users, setUsers] = useState([]);
  const [searchName, setSearchName] = useState("");

  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectedUsersDetails, setSelectedUsersDetails] = useState([]);

  const [showUsersLists, setShowUsersLists] = useState(false);
  const [step, setStep] = useState(1);

  const [groupName, setGroupName] = useState("");
  const [groupsList, setGroupsList] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);

  const [openGroupPopup, setOpenGroupPopup] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessages, setNewMessages] = useState("");

  const handleLogout = () => {
    localStorage.removeItem("EventHub");
    navigate("/login");
  };

  const fetchuserName = () => {
    const userData = JSON.parse(localStorage.getItem("EventHub"));
    return userData?.name || "User";
  };

  useEffect(() => {
    setUserName(fetchuserName());
  }, []);

  useEffect(() => {
      if (bottomRef.current) {
        bottomRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }, [messages]);

  const fetchUsers = async () => {
    try {
      const q = query(collection(db, "users"), where("role", "==", 2));
      const snap = await getDocs(q);

      const list = snap.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name,
      }));

      setUsers(list);
    } catch {
      toast.error("Users not Found...");
    }
  };

  useEffect(() => {
    if (showUsersLists) fetchUsers();
    fetchGroups();
  }, [showUsersLists]);

  const SearchUsers = async (text) => {
    if (!text.trim()) {
      fetchUsers();
      return;
    }

    try {
      const q = query(
        collection(db, "users"),
        where("role", "==", 2),
        where("name", ">=", text),
        where("name", "<=", text + "\uf8ff")
      );

      const snap = await getDocs(q);
      const list = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setUsers(list);
    } catch (err) {
      toast.error("Search failed — Firestore index needed");
    }
  };

  const toggleSelectUser = (id) => {
    setSelectedGroup(null);

    setSelectedUsers((prev) => {
      if (prev.includes(id)) {
        if (prev.length <= 2) {
          toast.error("At least 2 users must be selected");
          return prev;
        }
        return prev.filter((uid) => uid !== id);
      }
      return [...prev, id];
    });
  };

  useEffect(() => {
    const load = async () => {
      if (selectedUsers.length === 0) return setSelectedUsersDetails([]);

      try {
        const q = query(
          collection(db, "users"),
          where("__name__", "in", selectedUsers)
        );

        const snap = await getDocs(q);

        const list = snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setSelectedUsersDetails(list);
      } catch {
        toast.error("Failed to fetch selected users");
      }
    };

    load();
  }, [selectedUsers]);

  const createGroup = async () => {
    if (!groupName.trim()) return toast.error("Group name is required");
    if (selectedUsers.length < 2) return toast.error("Select atleast 2 users");

    try {
      const loggedInUser = JSON.parse(localStorage.getItem("EventHub"));

      const groupData = {
        createdBy: loggedInUser.name,
        groupName,
        createdAt: serverTimestamp(),
        usersId: [loggedInUser.uid, ...selectedUsers],
        users: [
          {
            id: loggedInUser.uid,
            name: loggedInUser.name,
            role: "organizer",
          },
          ...selectedUsersDetails.map((u) => ({
            id: u.id,
            name: u.name,
            role: "users",
          })),
        ],
      };

      await addDoc(collection(db, "groups"), groupData);

      toast.success("Group Created Successfully!");
      fetchGroups();
      setSelectedUsers([]);
      setSelectedUsersDetails([]);
      setGroupName("");
      setStep(1);
      setOpenGroupPopup(false);
    } catch {
      toast.error("Group not created!");
    }
  };

  const fetchGroups = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("EventHub"));

      const q = query(
        collection(db, "groups"),
        where("usersId", "array-contains", user.uid)
      );

      const snap = await getDocs(q);
      const list = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setGroupsList(list);
    } catch {
      toast.error("groups not found...");
    }
  };

  const sendMessage = async () => {
    if (!newMessages.trim()) {
      toast.error("empty message cannot sendd...");
      return;
    }

    try {
      const loginUser = JSON.parse(localStorage.getItem("EventHub"));
      const uid = loginUser?.uid;
      const userName = loginUser?.name;

      if (!selectedGroup?.id) {
        toast.error("Select Groups First!!");
        return;
      }
      const chatDocRef = doc(db, "groups", selectedGroup.id);
      await addDoc(collection(chatDocRef, "messages"),{
        msg:newMessages,
        last_msg: newMessages,
        createdBy: userName,
        createdAt: serverTimestamp(),
        sendBy: uid,
        groupId: selectedGroup.id,
        groupName: selectedGroup.groupName,
      });
      setNewMessages("");

    } catch (err) {
      console.log(err);
      toast.error("Message Cannot send!");
    }
  };

  useEffect(()=>{
      if(!selectedGroup?.id){
        setMessages([]);
        return;
      }
      const chatDocRef = collection(db,"groups",selectedGroup.id,"messages");
      const q = query(chatDocRef, orderBy("createdAt", "asc"));
      const unsubscribe = onSnapshot(q,(snapshot)=>{
      const msgs =  snapshot.docs.map((doc)=>({
            id: doc.id,
            ...doc.data(),
           }));
           setMessages(msgs);
      });
      return () => unsubscribe();
  },[selectedGroup]);

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
      <div className="bg-white shadow-lg px-4 py-3 md:px-5 md:py-5 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-2 md:gap-3">
          <IoArrowBack
            onClick={() => navigate("/maindashboard")}
            size={28}
            className="text-purple-600 cursor-pointer md:size-[35]"
          />
          <SlCalender
            size={28}
            className="bg-purple-600 text-white p-1 rounded md:size-[35]"
          />
          <h1 className="text-purple-600 text-lg md:text-2xl font-semibold">
            EventHub
          </h1>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-1 text-purple-700 font-semibold cursor-pointer 
                       outline-none border border-purple-600 rounded-2xl px-2 md:px-3
                       py-2 md:py-4 h-10 hover:bg-purple-100 transition text-sm md:text-base"
          >
            <FaRegUser size={18} className="text-purple-700 md:ml-2" />
            <span className="truncate max-w-[100px] md:max-w-[150px]">
              {userName}
            </span>
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-2 w-36 md:w-40 bg-white shadow-xl rounded-lg p-2 z-50 border border-gray-200 animate-fadeIn">
              <p
                onClick={() => navigate("/profile")}
                className="p-2 hover:bg-purple-100 rounded cursor-pointer"
              >
                My Profile
              </p>
              <p
                onClick={() => navigate("/orgchat")}
                className="p-2 hover:bg-purple-100 rounded cursor-pointer"
              >
                Chats
              </p>
              <p
                onClick={() => navigate("/wishlist")}
                className="p-2 hover:bg-purple-100 rounded cursor-pointer"
              >
                Wishlist
              </p>
              <p
                onClick={() => {
                  setShowDropdown(false);
                  setLogoutPopup(true);
                }}
                className="p-2 hover:bg-red-100 text-red-600 rounded cursor-pointer flex items-center gap-2"
              >
                <IoMdLogOut /> Logout
              </p>
            </div>
          )}
        </div>

        {logoutPopup && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 px-4">
            <div className="bg-white p-4 md:p-6 rounded-xl shadow-xl w-full max-w-[350px] text-center">
              <h2 className="text-lg md:text-xl font-semibold text-gray-700 mb-4">
                Are you sure you want to logout?
              </h2>

              <div className="flex flex-col md:flex-row justify-between gap-2">
                <ButtonComponent
                  handleClick={() => setLogoutPopup(false)}
                  label="Cancel"
                  className="w-full bg-gray-300 text-gray-700 py-2 rounded font-semibold hover:bg-gray-400"
                />
                  
                <ButtonComponent
                  handleClick={handleLogout}
                  label="Logout"
                  className="w-full bg-red-600 text-white py-2 rounded font-semibold hover:bg-red-700"
                />
                  
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white mt-4 shadow h-[calc(100vh-120px)]">
        <div className="flex flex-col md:flex-row h-full">
          <div className="bg-white w-full md:w-1/3 p-4 border-r border-gray-300 overflow-y-auto">
            <div className="flex justify-between items-center">
              <h1 className="text-xl md:text-2xl font-bold text-purple-700">
                Groups
              </h1>

              <button
                onClick={() => {
                  setOpenGroupPopup(true);
                  fetchUsers();
                }}
                className="cursor-pointer bg-purple-700 text-white px-6 py-2 rounded-lg font-semibold"
              >
                Add
              </button>
            </div>

            {openGroupPopup && (
              <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 px-4">
                <div className="bg-white p-5 rounded-xl shadow-xl w-full max-w-[400px] max-h-[90vh] overflow-y-auto">
                  <div className="flex justify-between items-center mb-3">
                    <h1 className="text-xl font-bold text-purple-700">
                      Create Group
                    </h1>
                    <button
                      onClick={() => {
                        setOpenGroupPopup(false);
                        setSelectedUsers([]);
                        setSelectedUsersDetails([]);
                        setGroupName("");
                        setStep(1);
                      }}
                      className="text-purple-700 font-bold text-xl cursor-pointer border rounded-4xl hover:bg-purple-200"
                    >
                      <RxCross2 size={25} />
                    </button>
                  </div>

                  {step === 1 && (
                    <>
                      <div className="flex w-full items-center mb-3 gap-3">
                        <p className="font-semibold text-purple-800 w-[35%] whitespace-nowrap">
                          Add Participants :
                        </p>

                        <div className="flex items-center gap-2 bg-purple-50 border border-purple-300 h-10 rounded-xl px-2 w-[65%]">
                          <IoSearch size={20} className="text-purple-600" />
                          <input
                            type="text"
                            placeholder="Search users..."
                            value={searchName}
                            onChange={(e) => {
                              setSearchName(e.target.value);
                              SearchUsers(e.target.value.toLowerCase());
                            }}
                            className="flex-1 bg-transparent outline-none text-purple-800"
                          />
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {selectedUsersDetails.map((u) => (
                          <div className="bg-purple-800 text-purple-200 flex mb-2 px-3 py-1 rounded whitespace-nowrap">
                            <p>{u.name} </p>
                          </div>
                        ))}
                      </div>

                      {users.length === 0 ? (
                        <p className="text-center text-purple-700 mt-3 font-semibold">
                          No users found...
                        </p>
                      ) : (
                        users.map((u) => (
                          <div
                            key={u.id}
                            onClick={() => toggleSelectUser(u.id)}
                            className="flex items-center bg-purple-100 p-3 rounded-lg cursor-pointer mb-2 hover:bg-purple-200"
                          >
                            <HiUserCircle
                              size={36}
                              className="text-purple-700"
                            />
                            <p className="font-semibold text-purple-900 ml-2 capitalize">
                              {u.name}
                            </p>

                            {selectedUsers.includes(u.id) ? (
                              <MdOutlineCheckBox
                                className="ml-auto text-purple-600"
                                size={28}
                              />
                            ) : (
                              <MdCheckBoxOutlineBlank
                                className="ml-auto text-purple-500"
                                size={28}
                              />
                            )}
                          </div>
                        ))
                      )}

                      {selectedUsers.length >= 2 && (
                        <ButtonComponent
                          handleClick={() => setStep(2)}
                          label="Next"
                        />
                          
                      )}
                    </>
                  )}

                  {step === 2 && (
                    <div>
                      <label className="text-purple-700 font-semibold">
                        Group Name
                      </label>
                      <input
                        type="text"
                        placeholder="Enter group name..."
                        value={groupName}
                        onChange={(e) => setGroupName(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && createGroup()}
                        className="border border-purple-400 rounded-lg px-3 py-2 w-full outline-none mt-2"
                      />

                      <ButtonComponent
                        handleClick={createGroup}
                        label="Create Group"
                      />
                        

                      <ButtonComponent
                        handleClick={() => setStep(1)}
                        label="Back"
                        className="mt-2 text-purple-700 w-full py-2 bg-gray-400 rounded-lg font-semibold cursor-pointer"
                      />
                        
                    </div>
                  )}
                </div>
              </div>
            )}

            {groupsList.length === 0 ? (
              <p className="text-gray-500 mt-10 justify-center flex">
                No groups found...
              </p>
            ) : (
              groupsList.map((g) => (
                <div
                  key={g.id}
                  onClick={() => setSelectedGroup(g)}
                  className="bg-purple-100 mt-4 p-3 rounded cursor-pointer hover:bg-purple-200"
                >
                  <div className="flex items-center gap-2">
                    <HiUserCircle size={36} className="text-purple-700" />
                    <div>
                      <h3 className="font-bold text-purple-800 capitalize">
                        {g.groupName}
                      </h3>
                      <p className="text-xs text-purple-600">
                        {g.users?.length} members
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="flex flex-col w-full md:w-2/2 h-full">
            <div className="flex text-purple-800 gap-2 items-center p-3 border-b border-gray-300">
              <HiUserCircle size={36} />

              {selectedGroup ? (
                <h1 className="font-bold text-xl capitalize">
                  {selectedGroup.groupName}
                </h1>
              ) : selectedUsersDetails.length > 0 ? (
                <div className="flex gap-2 flex-wrap">
                  {selectedUsersDetails.map((u) => (
                    <div
                      key={u.id}
                      className="bg-purple-200 text-purple-900 px-2 py-1 rounded-lg font-semibold"
                    >
                      {u.name}
                    </div>
                  ))}
                </div>
              ) : (
                <h1 className="font-bold text-xl">Select A Group</h1>
              )}
            </div>

              <div className="flex-1 overflow-y-auto p-4 bg-purple-50 flex flex-col gap-3">
                {messages.length > 0 ? (
                  messages.map((m, i) => (
                    <div
                      key={i}
                      className={`p-3 rounded-lg max-w-[75%] ${
                        m.sendBy === JSON.parse(localStorage.getItem("EventHub"))?.uid
                          ? "bg-purple-600 text-white ml-auto"
                          : "bg-gray-300 text-gray-900 mr-auto font-semibold w-[200px]"
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
              <div className="flex items-center gap-2 border border-gray-300 rounded px-2 py-2 w-full">
                <input
                  type="text"
                  value={newMessages}
                  onKeyDown={(e)=>e.key === "Enter" && sendMessage()}
                  onChange={(e)=>setNewMessages(e.target.value)}
                  placeholder="Type a message..."
                  className="outline-none bg-transparent flex-1 text-gray-700"
                />
                <FiSmile size={20} className="cursor-pointer text-purple-600" />
                <CiImageOn
                  size={20}
                  className="cursor-pointer text-purple-600"
                />
                <MdOutlineAttachFile
                  size={20}
                  className="cursor-pointer text-purple-600"
                />
                <button className="bg-purple-600 text-white rounded-full p-2 cursor-pointer">
                  <IoMdSend 
                  onClick={()=>sendMessage()}
                  size={18} />
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default GroupChats;
