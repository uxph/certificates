import React from "react";
import Link from "next/link";

const RegistrationForm = ({
  helixpayCode,
  setHelixpayCode,
  selectedWorkshops,
  loading,
  message,
  onSubmit,
  setMessage,
  eventSlug,
}) => {
  const status = {
    info: "text-gray-400",
    error: "text-red-400",
    success: "text-green-400",
  };

  return (
    <div className="max-w-prose w-full mt-8">
      <p className="font-light text-base md:text-xl tracking-wide text-center mb-4">
        Enter your{" "}
        <span className="underline font-semibold">Helixpay code</span> to
        proceed with your registration.
      </p>

      <div className="flex gap-4 md:text-lg text-base">
        <input
          type="text"
          name="helixpayCode"
          value={helixpayCode}
          onChange={(e) => {
            setMessage({ status: "info", message: "" });
            setHelixpayCode(e.target.value);
          }}
          className="grow border  rounded-sm w-full py-2 px-3 border-gray-800  placeholder-gray-400"
          placeholder="Enter your Helixpay code"
        />
        <button
          disabled={
            loading ||
            !selectedWorkshops["blockA"] ||
            !selectedWorkshops["blockB"] ||
            !helixpayCode.trim()
          }
          className="relative text-white disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer uppercase bg-[#1b50d8] hover:bg-[#1b50d8]/80 border border-[#1b50d8] py-2 px-6 rounded-sm font-semibold tracking-wider flex gap-2 items-center justify-center min-w-[120px]"
          onClick={onSubmit}
        >
          {loading && <span className="icon-[eos-icons--loading]"></span>}
          <span>Register</span>
        </button>
      </div>

      <div className="h-8 mt-2">
        {message.message && (
          <p
            className={`${
              status[message.status]
            } md:text-base text-sm text-center font-medium`}
          >
            {message.message}
          </p>
        )}
      </div>

      {/* Link to check registration */}
      <div className="mt-4 text-center">
        <p className="text-sm">
          Already registered?{' '}
          <Link
            href={`/workshop-registration/${eventSlug}/online/check-registration`}
            className="text-[#1b50d8] underline font-medium hover:text-[#1b50d8]/80"
          >
            Check your registration here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegistrationForm;
