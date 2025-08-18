"use client";
import React, { useState } from "react";
import generate from "./services/generate";
import Image from "next/image";
import Link from "next/link";

const Debugger = ({ info, setInfo }) => {
  return (
    <div className="md:block hidden absolute right-4 bottom-4 rounded-sm bg-gray-900 border border-gray-700 text-white p-2 text-sm">
      <h4 className="mb-2">Debugger:</h4>
      <div className="grid grid-cols-5">
        <div className="col-span-2 flex items-center justify-start">
          <label htmlFor="errorTrigger">Trigger Error:</label>
        </div>
        <input
          name="triggerError"
          type="checkbox"
          className="col-span-3"
          value={info["triggerError"]}
          onChange={(e) =>
            setInfo((v) => ({ ...v, triggerError: e.target.checked }))
          }
        />
      </div>
      <div className="grid grid-cols-5 gap-2 py-2">
        <div className="col-span-2 flex items-center justify-start">
          <label htmlFor="certName">Certificate Name:</label>
        </div>
        <input
          name="certName"
          className="col-span-3 border border-white px-2 py-1 rounded-sm"
          type="text"
          value={info["certName"]}
          onChange={(e) => setInfo((v) => ({ ...v, certName: e.target.value }))}
        />
      </div>
    </div>
  );
};

const Certificate = ({ title, validator }) => {
  const [message, setMessage] = useState({
    status: "info",
    message: "",
  });
  const [ticketId, setTicketId] = useState("");
  const [loading, setLoading] = useState(false);
  const [debuggerInfo, setDebuggerInfo] = useState({
    triggerError: false,
    certName: "Jordan Aiko Deja",
  });
  const submit = async () => {
    try {
      setMessage({
        status: "info",
        message: "",
      });
      setLoading(true);

      if (validator) {
        let reg = RegExp(validator.regex);
        let test = reg.test(ticketId.trim());
        if (!test)
          throw new Error(
            `Invalid ticket format. Please make sure you are following the proper ticket format.`
          );
      }

      let response = await fetch("/api/attendee", {
        method: "POST",
        body: JSON.stringify({ title: title, ticketId: ticketId.trim() }),
      });

      let result = await response.json();
      if (!result.success) throw new Error(result.error);

      let { customer_name } = result.data;
      await generate({ certName: customer_name });
      setMessage({
        status: "success",
        message:
          "Certificate successfully generated! Please check your downloads folder.",
      });
      setLoading(false);
    } catch (e) {
      setMessage({
        status: "error",
        message:
          e?.message ||
          "An error has occured. Please contact us if the symptoms persist",
      });
      setLoading(false);
    }
  };

  let status = {
    info: "text-gray-400",
    error: "text-red-400",
    success: "text-green-400",
  };

  return (
    <div className="relative overflow-hidden flex w-full h-screen max-h-screen max-w-screen text-gray-800 justify-center items-center flex-col">
      <Image
        src="/conf-assets/02_Main.svg"
        alt="UXPH Mini 2025 Banner"
        fill
        className="pointer-events-none object-cover opacity-10 z-0"
      />
      {/* Decorative background assets */}
      {/* <div className="pointer-events-none absolute top-0 left-0 w-24 md:w-40 h-24 md:h-40 z-0">
                <Image src="/conf-assets/Corner1.svg" alt="" fill className="object-contain" />
            </div>
            <div className="pointer-events-none absolute -top-8 right-0 w-24 md:w-40 h-24 md:h-40 z-0">
                <Image src="/conf-assets/Corner2.svg" alt="" fill className="object-contain" />
            </div>
            <div className="pointer-events-none absolute bottom-0 right-0 w-24 md:w-40 h-24 md:h-40 z-0">
                <Image src="/conf-assets/Corner3.svg" alt="" fill className="object-contain" />
            </div> */}
      <div className="flex items-center w-24 md:w-40 h-24 md:h-40 relative">
        <Image
          alt="UXPH Mini Logo"
          src={"/Logo_UXPHMini.png"}
          fill={true}
          className="object-contain"
        />
      </div>
      <h1 className="text-2xl md:text-5xl font-bold mt-4">
        Certificate of Attendance
      </h1>
      <p className="text-base tracking-widest my-4">for the event</p>

      <h3 className="text-lg tracking-widest mb-8 font-semibold">{title}</h3>
      <p className="font-light text-base md:text-xl tracking-wide text-center">
        Enter your{" "}
        <a href="#" className="underline font-semibold">
          ticket identification number
        </a>{" "}
        which is found below your Ticket QR Code or after your Onsite
        Registration.
      </p>
      <div className="flex max-w-prose w-full gap-4 mt-4 md:px-0 px-4 md:text-lg text-base">
        <input
          type="text"
          name={ticketId}
          value={ticketId}
          onChange={(e) => {
            setMessage({ status: "info", message: "" });
            setTicketId(e.target.value);
          }}
          className="grow border border-gray-800 rounded-sm w-full py-1 px-2 bg-transparent text-gray-800"
          placeholder={validator?.pattern || "Ticket ID No."}
        />
        <button
          disabled={loading || ticketId === ""}
          className="relative disabled:opacity-80 disabled:cursor-not-allowed cursor-pointer text-white uppercase bg-main hover:bg-main/80 border border-main py-1 rounded-sm font-semibold tracking-wider w-48 flex gap-2 items-center justify-center"
          onClick={submit}
        >
          {loading && <span className="icon-[eos-icons--loading]"></span>}
          <span>Verify</span>
        </button>
      </div>
      <div className="h-8 mt-2">
        {message.message && (
          <p
            className={`${
              status[message.status]
            } md:text-lg text-base text-center font-medium`}
          >
            {message.message}
          </p>
        )}
      </div>

      <p className="tracking-wide mt-8">
        Join the community and follow us for updates!
      </p>
      <div className="flex gap-5 items-center justify-center text-gray-800 text-xl md:text-2xl py-4">
        <Link
          target="_blank"
          href={"https://www.facebook.com/uxphofficial/"}
          className="icon-[fa-brands--facebook]"
        ></Link>
        <Link
          target="_blank"
          href={"https://instagram.com/uxphofficial/"}
          className="icon-[fa-brands--instagram]"
        ></Link>
        <Link
          target="_blank"
          href={"https://x.com/uxphofficial/"}
          className="icon-[fa-brands--twitter]"
        ></Link>
        <Link
          target="_blank"
          href={"https://www.linkedin.com/company/uxph"}
          className="icon-[fa-brands--linkedin]"
        ></Link>
      </div>
      {/* <Debugger info={debuggerInfo} setInfo={setDebuggerInfo} /> */}
    </div>
  );
};

export default Certificate;
