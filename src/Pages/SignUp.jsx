import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { FcGoogle } from "react-icons/fc";
import { FaEyeSlash } from "react-icons/fa";
import { IoEyeSharp } from "react-icons/io5";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { app } from "../firebase";

const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

function SignUp() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      password: "",
    },
    validationSchema: Yup.object({
      name: Yup.string()
        .min(3, "Name must be at least 3 characters")
        .required("Name is required"),
      email: Yup.string()
        .trim()
        .email("Invalid email address")
        .required("Email is required"),
      password: Yup.string()
        .trim()
        .min(6, "Password must be at least 6 characters")
        .required("Password is required"),
    }),
    onSubmit: async (values, { resetForm }) => {
      if (!role) {
        toast.error("Please select a role!");
        return;
      }

      try {
        setLoading(true);
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          values.email,
          values.password
        );
        const uid = userCredential.user.uid;
        const roleId = role === "organizer" ? 1 : 2;

        await setDoc(doc(db, "users", uid), {
          name: values.name,
          email: values.email,
          createdAt: new Date().toISOString(),
          role: roleId,
          wishlist: [],
          status: 1,
        });

        toast.success("User Registered Successfully!", { autoClose: 1000 });
        resetForm();
        navigate("/login");
      } catch (err) {
        toast.error("Registration failed: " + err.message);
      } finally {
        setLoading(false);
      }
    },
  });

  const signUpWithGoogle = async () => {
    try {
      setLoading(true);
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      await setDoc(doc(db, "users", user.uid), {
        name: user.displayName,
        email: user.email,
        createdAt: new Date().toISOString(),
        role: 2,
        wishlist: [],
        status: 1,
      });

      toast.success("Google Sign-Up Successful!");
      navigate("/maindashboard");
    } catch (error) {
      toast.error("Google Sign-Up Failed: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-200 min-h-screen flex justify-center items-center px-7">
      <div className="bg-white w-full max-w-[470px] rounded-xl shadow-lg p-8 mt-5 mb-5">
        <form onSubmit={formik.handleSubmit}>
          <h1 className="text-center font-bold text-3xl text-purple-800 mb-6">
            Create User
          </h1>

          <div className="mb-4">
            <label className="font-semibold">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="border border-gray-300 w-full h-10 mt-1 p-2 rounded focus:outline-none focus:border-purple-500"
            >
              <option value="">Select Role</option>
              <option value="organizer">Organizer</option>
              <option value="user">User</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="font-semibold">Name</label>
            <input
              type="text"
              name="name"
              placeholder="Enter Your Name"
              className="border border-gray-300 w-full h-10 mt-1 p-2 rounded focus:outline-none focus:border-purple-500"
              {...formik.getFieldProps("name")}
            />
            {formik.touched.name && formik.errors.name && (
              <p className="text-red-500 text-sm mt-1">{formik.errors.name}</p>
            )}
          </div>

          <div className="mb-4">
            <label className="font-semibold">Email</label>
            <input
              type="email"
              name="email"
              placeholder="Enter Your Email"
              className="border border-gray-300 w-full h-10 mt-1 p-2 rounded focus:outline-none focus:border-purple-500"
              {...formik.getFieldProps("email")}
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
                {...formik.getFieldProps("password")}
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3  text-gray-600 cursor-pointer"
              >
                {showPassword ? (
                  <FaEyeSlash size={23} />
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
              "Sign Up"
            )}
          </button>

          <div
            onClick={signUpWithGoogle}
            className="flex items-center justify-center gap-2 border mt-5 rounded-md py-2 hover:bg-gray-100 cursor-pointer transition"
          >
            <FcGoogle size={24} />
            <span className="text-gray-700 font-medium">
              Sign Up With Google
            </span>
          </div>

          <p className="font-medium text-gray-700 text-center mt-5">
            Already User?{" "}
            <Link
              to="/login"
              className="text-purple-700 hover:underline cursor-pointer"
            >
              Login
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default SignUp;
