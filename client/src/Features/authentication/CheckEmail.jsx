//import { useState } from "react";
// import Logo from "./Logo";
// import InputField from "./InputField";
import SubmitButton from "../../ui/SubmitButton.jsx";
import IconHeader from "../../ui/IconHeader.jsx";
import { HiOutlineMail } from "react-icons/hi";
import { Link } from "react-router-dom";

function CheckEmail() {
  // const [error] = useState(false);
  return (
    <div>
      <form className="mx-auto max-w-md rounded-2xl bg-white p-8 shadow">
        <IconHeader icon={HiOutlineMail} />
        {/* <Logo /> */}

        <h1 className="mb-2 text-center text-2xl font-bold text-gray-800">
          Check your email
        </h1>
        <p className="mb-6 text-center text-gray-600">
          We sent a password reset link to <span>johnolisaxyz@gmail.com</span>
        </p>

        <SubmitButton variant="black" label="Open email app" />
        <p className="mt-4 text-center text-sm text-gray-600">
          Didn’t receive the email? ?{" "}
          <a
            href="/login"
            className="font-medium text-indigo-600 hover:underline"
          >
            Click to resend
          </a>
        </p>
      </form>
      <div className="flex justify-center">
        <p className="center mt-6 inline-block rounded-full bg-white px-4 py-2 text-center text-sm text-gray-600 shadow">
          Remember password?{" "}
          <Link
            to="/signup"
            className="font-medium text-indigo-600 hover:underline"
          >
            Login in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default CheckEmail;
