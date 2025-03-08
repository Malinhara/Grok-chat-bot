import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }

    setError("");
    setSuccess("");

    try {
      const response = await axios.post(`http://localhost:4001/user/register`, {
        email,
        password,
      });

      if (response.status === 201) {
        setSuccess("Registration successful! Redirecting to login...");
        setTimeout(() => navigate("/signin"), 2000);
      }
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong. Please try again.");
    }
  };

  return (
    <div className="flex min-h-full flex-col justify-center px-6 py-32 lg:px-8">
    <div className="sm:mx-auto sm:w-full sm:max-w-sm">
     
      <h2 className="mt-10 text-center text-2xl font-bold tracking-tight text-gray-900">
        Signup in to your account
      </h2>
    </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm"> 
      <form className="space-y-6 mt-4" onSubmit={handleRegister}>
        {/* Email Input */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-900">
            Email address
          </label>
          <input
            type="email"
            name="email"
            id="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:outline-indigo-600"
          />
        </div>

        {/* Password Input */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-900">
            Password
          </label>
          <input
            type="password"
            name="password"
            id="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:outline-indigo-600"
          />
        </div>

        {/* Error & Success Messages */}
        {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
        {success && <div className="text-green-500 text-sm mt-2">{success}</div>}

        {/* Submit Button */}
        <div>
          <button
            type="submit"
            className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-indigo-600"
          >
            Register
          </button>
        </div>
      </form>
  </div>
      {/* Redirect to Login */}
      <p className="mt-4 text-center text-sm text-gray-600">
        Already have an account?{" "}
        <button onClick={() => navigate("/")} className="text-indigo-600 hover:underline">
          Sign in
        </button>
      </p>
    </div>
  );
}
