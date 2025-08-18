"use client";
import React, { useState } from "react";
import Image from "next/image";
export default function OnsiteRegistration({ options }) {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    eventId: "",
    eventCode: "",
  });

  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "info", text: "" });
  const [successData, setSuccessData] = useState(null);
  const [copied, setCopied] = useState(false);

  // Helper function to get enhanced message styles
  const getMessageStyles = (type) => {
    if (type === "success") {
      return "bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md shadow-sm text-center font-semibold text-lg";
    }
    return "";
  };

  // Client-side validation (only presence + email format)
  const errors = {};
  if (!form.firstName.trim()) errors.firstName = "First name is required.";
  if (!form.lastName.trim()) errors.lastName = "Last name is required.";
  if (!form.email.trim()) errors.email = "Email is required.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
    errors.email = "Enter a valid email.";
  if (!form.eventId) errors.eventId = "Please select an event.";
  if (!form.eventCode.trim()) errors.eventCode = "Event code is required.";

  const isValid = Object.keys(errors).length === 0;

  function onChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setMessage({ type: "info", text: "" });
  }

  function onBlur(e) {
    setTouched((t) => ({ ...t, [e.target.name]: true }));
  }

  async function copyCode() {
    if (!successData?.code) return;
    try {
      await navigator.clipboard.writeText(successData.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Fallback if clipboard not allowed
      const ta = document.createElement("textarea");
      ta.value = successData.code;
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      } finally {
        document.body.removeChild(ta);
      }
    }
  }

  async function onSubmit(e) {
    e.preventDefault();
    setTouched({
      firstName: true,
      lastName: true,
      email: true,
      eventId: true,
      eventCode: true,
    });

    if (!isValid) {
      setMessage({ type: "error", text: "Please fix the errors above." });
      return;
    }

    try {
      setLoading(true);
      // send to backend for secure validation
      const res = await fetch("/api/onsite-registration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          eventName: options.find((op) => op.value === form.eventId),
        }),
      });
      const result = await res.json();

      if (res.ok) {
        setSuccessData({
          firstName: form.firstName.trim(),
          eventName: result.eventName,
          code: result.code, // <- generated event code from API
        });
        setMessage({ type: "success", text: result.message || "" });
      } else {
        setMessage({ type: "error", text: result.error || "Invalid code." });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Something went wrong." });
    } finally {
      setLoading(false);
    }
  }

  if (successData) {
    return (
      <div className="relative overflow-hidden flex w-full h-screen max-h-screen max-w-screen text-gray-800 justify-center items-center flex-col px-4 py-16">
        {/* Hero banner */}
        <Image
          src="/conf-assets/02_Main.svg"
          alt="UXPH Mini 2025 Banner"
          fill
          className="pointer-events-none object-cover opacity-10 z-0"
        />

        <div className="flex items-center w-24 md:w-52 h-24 md:h-52 relative">
          <Image
            alt="UXPH Mini Logo"
            src={"/Logo_UXPHMini.png"}
            fill={true}
            className="object-contain"
          />
        </div>
        <div className="w-full max-w-prose bg-white border border-gray-300 rounded-md p-6 ">
          <p className="text-2xl md:text-3xl font-bold text-gray-800 text-center">
            Congratulations {successData.firstName}!
          </p>

          <p className="text-gray-600 text-center mt-4">
            You have successfully registered to:
          </p>
          <p className="text-gray-800 text-center font-semibold mt-1">
            {successData.eventName}
          </p>

          <p className="font-light text-base md:text-lg tracking-wide text-center text-gray-600 mt-6">
            Please take a screenshot or copy the event code below for your
            reference:
          </p>

          <div className="mt-4 flex items-stretch gap-2 justify-center">
            <input
              readOnly
              value={successData.code || ""}
              className="grow border border-gray-800 rounded-sm py-2 px-3 bg-transparent text-gray-800 tracking-widest text-center"
            />
            <button
              onClick={copyCode}
              className="uppercase bg-main hover:bg-main/80 border border-main px-4 rounded-sm font-semibold tracking-wider text-white"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>

          {message.text && (
            <div
              className={`mt-3 ${
                message.type === "success"
                  ? getMessageStyles("success")
                  : `text-center text-base md:text-lg ${
                      message.type === "error"
                        ? "text-red-400"
                        : "text-gray-300"
                    }`
              }`}
            >
              {message.text}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden flex w-full h-screen text-gray-800 justify-start py-16 items-center flex-col px-4">
      {/* Hero banner */}
      <Image
        src="/conf-assets/02_Main.svg"
        alt="UXPH Mini 2025 Banner"
        fill
        className="pointer-events-none object-cover opacity-10 z-0"
      />

   
      <div className="flex items-center w-24 md:w-52 h-24 md:h-52 relative">
        <Image
          alt="UXPH Mini Logo"
          src={"/Logo_UXPHMini.png"}
          fill={true}
          className="object-contain"
        />
      </div>

      <h1 className="text-4xl font-bold mb-6">Onsite Registration</h1>
      <form onSubmit={onSubmit} className="flex flex-col gap-3 w-full max-w-md">
        <input
          name="firstName"
          value={form.firstName}
          onChange={onChange}
          onBlur={onBlur}
          placeholder="First Name"
          className="border border-gray-800 rounded-sm py-2 px-3 bg-transparent text-gray-800"
        />
        {touched.firstName && errors.firstName && (
          <span className="text-red-400 text-sm">{errors.firstName}</span>
        )}

        <input
          name="lastName"
          value={form.lastName}
          onChange={onChange}
          onBlur={onBlur}
          placeholder="Last Name"
          className="border border-gray-800 rounded-sm py-2 px-3 bg-transparent text-gray-800"
        />
        {touched.lastName && errors.lastName && (
          <span className="text-red-400 text-sm">{errors.lastName}</span>
        )}

        <input
          name="email"
          type="email"
          value={form.email}
          onChange={onChange}
          onBlur={onBlur}
          placeholder="Email"
          className="border border-gray-800 rounded-sm py-2 px-3 bg-transparent text-gray-800"
        />
        {touched.email && errors.email && (
          <span className="text-red-400 text-sm">{errors.email}</span>
        )}

        <select
          name="eventId"
          value={form.eventId}
          onChange={onChange}
          onBlur={onBlur}
          className="border border-gray-800 rounded-sm py-2 px-3 bg-white text-gray-800"
        >
          <option value="">Select Event</option>
          {options.map((option) => (
            <option value={option.value} key={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {touched.eventId && errors.eventId && (
          <span className="text-red-400 text-sm">{errors.eventId}</span>
        )}

        <input
          name="eventCode"
          value={form.eventCode}
          onChange={onChange}
          onBlur={onBlur}
          placeholder="Event Code"
          className="border border-gray-800 rounded-sm py-2 px-3 bg-transparent text-gray-800 tracking-widest"
        />
        {touched.eventCode && errors.eventCode && (
          <span className="text-red-400 text-sm">{errors.eventCode}</span>
        )}

        <button
          type="submit"
          disabled={loading}
          className="uppercase bg-main hover:bg-main/80 border border-main py-2 rounded-sm font-semibold tracking-wider text-white mt-2"
        >
          {loading ? "Verifying..." : "Register"}
        </button>

        {message.text && (
          <div
            className={`mt-2 ${
              message.type === "success"
                ? getMessageStyles("success")
                : `text-base md:text-lg text-center ${
                    message.type === "error"
                      ? "text-red-400"
                      : "text-gray-600"
                  }`
            }`}
          >
            {message.text}
          </div>
        )}
      </form>
    </div>
  );
}
