import { useState } from "react";
import Logo from "./Logo.jsx";

function PhoneVerification() {
  const [otp] = useState(new Array(6).fill(""));

  return (
    <div className="font-sans text-gray-900 antialiased">
      <div className="flex min-h-screen flex-col items-center justify-start px-4 py-8">
        {/* Progress Bar */}
        <div className="mb-10 h-1 w-40 rounded-full bg-gray-200">
          <div className="h-1 w-[45%] rounded-full bg-gray-900"></div>
        </div>
        <Logo />
        <div className="w-full max-w-md text-center">
          <h1 className="mb-2 text-3xl font-bold md:text-4xl">
            Verify your phone number
          </h1>
          <p className="mb-8 text-gray-500">
            Enter the code we sent to +234********677
          </p>
        </div>

        {/* OTP Verification Form */}
        <form className="w-full max-w-sm">
          <div
            className="mb-6 flex justify-center gap-2 sm:gap-3"
            //onPaste={handlePaste}
          >
            {otp.map((data, index) => (
              <input
                key={index}
                type="text"
                name="otp"
                maxLength="1"
                className="h-12 w-12 border border-gray-300 text-center text-2xl font-semibold transition focus:border-transparent focus:ring-2 focus:ring-gray-800 focus:outline-none sm:h-14 sm:w-14"
                value={data}
                //onChange={(e) => handleChange(e.target, index)}
                //onKeyDown={(e) => handleKeyDown(e, index)}
                //onFocus={(e) => e.target.select()}
                //ref={(el) => (inputRefs.current[index] = el)}
                aria-label={`OTP digit ${index + 1}`}
              />
            ))}
          </div>
          <p className="mb-6 text-center text-sm text-gray-600">
            Time remaining:{" "}
            {/* <span className="font-semibold">{formatTime(timer)}</span> */}
            <span className="font-semibold">2:59s</span>
          </p>
          <button
            type="submit"
            className="w-full rounded-lg bg-gray-900 py-3 font-semibold text-white transition-colors hover:bg-gray-800 focus:ring-2 focus:ring-gray-800 focus:ring-offset-2 focus:outline-none"
            disabled={otp.join("").length < 6}
          >
            Verify
          </button>
        </form>

        <div className="mt-4 text-center text-sm text-gray-600">
          <span>Didn't get the code?</span>
          <button
            //onClick={handleResendCode}
            className="ml-1 cursor-pointer font-semibold text-gray-900 hover:underline focus:outline-none"
            //disabled={isTimerActive}
          >
            Resend it
          </button>
        </div>
      </div>
    </div>
  );
}

export default PhoneVerification;
