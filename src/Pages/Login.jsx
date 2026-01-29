import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { IoEyeSharp } from "react-icons/io5";
import { FaEyeSlash } from "react-icons/fa";
import { signInWithEmailAndPassword, getAuth } from "firebase/auth";
import { getFirestore, doc, getDoc, updateDoc } from "firebase/firestore";
import { app } from "../firebase";

const auth = getAuth(app);
const db = getFirestore(app);

const checkWishlistField = async (uid) => {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);

  if (snap.exists()) {
    const data = snap.data();

    if (!data.wishlist) {
      await updateDoc(ref, { wishlist: [] });
    }
  }
};

function Login() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const user = localStorage.getItem("EventHub");
    if (user) {
      navigate("/maindashboard");
    }
  }, [navigate]);

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .email("Invalid email address")
        .required("Email is required"),
      password: Yup.string()
        .min(6, "Password must be at least 6 characters")
        .required("Password is required"),
    }),

    onSubmit: async (values, { resetForm }) => {
      try {
        setLoading(true);

        const userCredential = await signInWithEmailAndPassword(
          auth,
          values.email,
          values.password
        );

        const uid = userCredential.user.uid;

        await checkWishlistField(uid);

        const docRef = doc(db, "users", uid);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
          toast.error("User data not found in Firestore!");
          return;
        }
        const userData = docSnap.data();

        if (userData.status === 0) {
          toast.error("Blocked...");
          setLoading(false);
          resetForm();
          return;
        }

        if (userData.status === -1) {
          toast.error("Deleted....");
          setLoading(false);
          resetForm();
          return;
        }

        if (userData.status === 1) {
          localStorage.setItem(
            "EventHub",
            JSON.stringify({
              email: values.email,
              uid: uid,
              role: userData.role,
              name: userData.name,
            })
          );

          toast.success("Login Successful!");
          resetForm();
          navigate("/maindashboard");
        }
      } catch (error) {
        toast.error("Invalid Email or Password!");
        console.error("Firebase Error:", error.message);
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <div className="bg-gray-200 min-h-screen flex justify-center items-center px-4">
      <div className="bg-white w-full max-w-md rounded-xl shadow-lg p-8">
        <form onSubmit={formik.handleSubmit}>
          <h1 className="text-center font-bold text-3xl text-purple-800 mb-6">
            Login
          </h1>

          <div className="mb-4">
            <label className="font-semibold">Email</label>
            <input
              type="email"
              name="email"
              placeholder="Enter Your Email"
              className="border border-gray-300 w-full h-10 mt-1 p-2 rounded focus:outline-none focus:border-purple-500"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.email && formik.errors.email && (
              <p className="text-red-500 text-sm mt-1">{formik.errors.email}</p>
            )}
          </div>

          <div className="mb-6">
            <label className="font-semibold">Password</label>
            <div className="relative flex items-center">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Enter Your Password"
                className="border border-gray-300 w-full h-10 mt-1 p-2 rounded focus:outline-none focus:border-purple-500"
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 text-gray-600 cursor-pointer"
              >
                {showPassword ? (
                  <FaEyeSlash size={20} />
                ) : (
                  <IoEyeSharp size={23} />
                )}
              </span>
            </div>

            {formik.touched.password && formik.errors.password && (
              <p className="text-red-500 text-sm mt-1">
                {formik.errors.password}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full h-10 rounded-md font-semibold transition cursor-pointer flex items-center justify-center
              ${
                loading
                  ? "bg-purple-400 cursor-not-allowed"
                  : "bg-purple-700 hover:bg-purple-800 text-white"
              }
            `}
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              "Login"
            )}
          </button>

          <p className="font-medium text-gray-700 text-center mt-5">
            New User?{" "}
            <Link
              to="/signup"
              className="text-purple-700 hover:underline cursor-pointer"
            >
              Sign Up
            </Link>
          </p>

        </form>
      </div>
    </div>
  );
}

export default Login;
