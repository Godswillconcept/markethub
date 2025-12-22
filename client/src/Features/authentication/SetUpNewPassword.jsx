// import { useState } from "react";
// import IconHeader from "../../ui/IconHeader";
// import InputField from "../../ui/InputField";
// import SubmitButton from "../../ui/SubmitButton";
// import { LuKey } from "react-icons/lu";

// function SetUpNewPassword() {
//   const [error] = useState(false);
//   return (
//     <div>
//       <form className="mx-auto max-w-md rounded-2xl bg-white p-8 shadow">
//         <IconHeader icon={LuKey} />
//         <h1 className="mb-2 text-center text-2xl font-bold text-gray-800">
//           Set up your new password
//         </h1>

//         <InputField label="Password*">
//           <input
//             type="password"
//             id="newPassword"
//             name="password"
//             className={`mt-1 block w-full border bg-white px-4 py-2 ${
//               error ? "border-red-500" : "border-gray-300"
//             } rounded-md focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none`}
//             placeholder="Enter your Password"
//             required
//           />
//         </InputField>
//         <InputField label="Confirm Password*">
//           <input
//             type="password"
//             id="confirmPassword"
//             name="confirmPassword"
//             className={`mt-1 block w-full border bg-white px-4 py-2 ${
//               error ? "border-red-500" : "border-gray-300"
//             } rounded-md focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none`}
//             placeholder="Enter Password"
//             required
//           />
//         </InputField>

//         <SubmitButton variant="black" label="Reset Password" />
//       </form>
//     </div>
//   );
// }

// export default SetUpNewPassword;

import { useForm } from "react-hook-form";
import { useParams, useNavigate } from "react-router-dom";
import { LuKey } from "react-icons/lu"; // Assuming react-icons is available
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import IconHeader from "../../ui/IconHeader.jsx";
import InputField from "../../ui/InputField.jsx";
import SubmitButton from "../../ui/SubmitButton.jsx";
import { useResetPassword } from "./useResetPassword.js";


// Key used to store the email when initiating the reset
const RESET_EMAIL_KEY = "resetEmail";

function SetUpNewPassword() {
  // Get the reset_token from URL parameters
  const { reset_token: resetToken } = useParams();


  // Retrieve the email stored during the forgot password request
  const storedEmail = localStorage.getItem(RESET_EMAIL_KEY);
  console.log("local storage email:", storedEmail);


  // Use the custom hook for the mutation
  const { resetPassword, isResetting, resetError } = useResetPassword();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      password: "",
      passwordConfirm: "",
    },
  });

  const onSubmit = (data) => {
    // Replaced alert() with the recommended visible error message component for flow consistency
    if (!resetToken) {
      console.error("Error: Missing reset token in URL.");
      // This case is already handled below by the early return component
      return;
    }
    if (!storedEmail) {
      console.error("Error: Email is missing. Please restart the password reset process.");
      // This case is already handled below by the early return component
      return;
    }

    // Build the final payload required by the backend
    const payload = {
      email: storedEmail,
      newPassword: data.password,
      confirmPassword: data.passwordConfirm,
      reset_token: resetToken,
    };
    console.log("form data:", payload);

    resetPassword(payload);
  };

  const password = watch("password");
  const isFormDisabled = isResetting || !resetToken || !storedEmail;

  // Alternative to alert(): use a visible error message banner/box
  if (!resetToken) {
    return (
      <div className="mx-auto max-w-md rounded-2xl bg-white p-8 shadow text-center mt-20">
        <IconHeader icon={LuKey} />
        <h1 className="text-xl font-bold text-red-600">Invalid Link</h1>
        <p className="mt-4 text-gray-600">The password reset link is invalid or expired. Please request a new one.</p>
      </div>
    );
  }
  if (!storedEmail) {
    return (
      <div className="mx-auto max-w-md rounded-2xl bg-white p-8 shadow text-center mt-20">
        <IconHeader icon={LuKey} />
        <h1 className="text-xl font-bold text-red-600">Missing Data</h1>
        <p className="mt-4 text-gray-600">The process was interrupted. Please return to the "Forgot Password" page and try again.</p>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-start min-h-screen pt-12 bg-gray-50">
      <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl" noValidate>
        <IconHeader icon={LuKey} />
        <h1 className="mb-2 text-center text-3xl font-bold text-gray-800">
          Set up your new password
        </h1>
        <p className="mb-6 text-center text-sm text-gray-500">
          {/* Show the email the reset applies to for clarity */}
          Resetting password for: <span className="font-semibold text-gray-800">{storedEmail}</span>
        </p>

        {/* --- Password Field --- */}
        <InputField
          label="New Password*"
          error={errors.password?.message}
        >
          <input
            type="password"
            id="password"
            className={`mt-1 block w-full border bg-white px-4 py-2 ${errors.password ? "border-red-500" : "border-gray-300"
              } rounded-md focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none`}
            placeholder="Enter a new password (min 8 chars)"
            disabled={isFormDisabled}
            {...register("password", {
              required: "Password is required",
              minLength: {
                value: 8,
                message: "Password needs a minimum of 8 characters",
              },
            })}
          />
        </InputField>

        {/* --- Confirm Password Field --- */}
        <InputField
          label="Confirm Password*"
          error={errors.passwordConfirm?.message}
        >
          <input
            type="password"
            id="passwordConfirm"
            className={`mt-1 block w-full border bg-white px-4 py-2 ${errors.passwordConfirm ? "border-red-500" : "border-gray-300"
              } rounded-md focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none`}
            placeholder="Confirm Password"
            disabled={isFormDisabled}
            {...register("passwordConfirm", {
              required: "Confirming your password is required",
              validate: (value) =>
                value === password || "Passwords must match",
            })}
          />
        </InputField>

        {/* API Error Display */}
        {resetError && (
          <p className="mt-4 text-sm text-red-600 text-center">
            {resetError.message}
          </p>
        )}

        <SubmitButton
          variant="black"
          label={isResetting ? "Resetting..." : "Reset Password"}
          disabled={isFormDisabled}
          type="submit"
        />
      </form>
    </div>
  );
}

export default SetUpNewPassword