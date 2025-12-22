// import { useForm } from "react-hook-form";
// import InputField from "../../ui/InputField";
// import SubmitButton from "../../ui/SubmitButton";
// import Logo from "../../ui/Logo";
// import { Link } from "react-router";
// import { useForgotPassword } from "./useForgotPassword";


// function ForgotPassword() {
//   const {
//     register,
//     handleSubmit,
//     formState: { errors, isSubmitting },
//   } = useForm({
//     defaultValues: {
//       email: ""
//     }
//   });
//   const { forgotPassword, isPending } = useForgotPassword();

//   const onSubmit = async (data) => {
//     try {
//       console.log("Form submitted:", data);
//       // TODO: Add your password reset logic here
//       // await re word(data.email);
//       forgotPassword(data);
//     } catch (error) {
//       console.error("Error:", error);
//     }
//   };

//   return (
//     <div>
//       <form
//         onSubmit={handleSubmit(onSubmit)}
//         className="mx-auto max-w-md rounded-2xl bg-white p-8 shadow"
//         noValidate
//       >
//         <Logo />
//         <h1 className="mb-2 text-center text-2xl font-bold text-gray-800">
//           Forgot Password
//         </h1>
//         <p className="mb-6 text-center text-gray-600">
//           Kindly enter the email address you used to sign up.
//         </p>
//         <InputField
//           label="Email Address*"
//           error={errors.email?.message}
//         >
//           <input
//             type="email"
//             id="email"
//             className={`mt-1 block w-full border bg-white px-4 py-2 ${errors.email ? "border-red-500" : "border-gray-300"
//               } rounded-md focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none`}
//             placeholder="Enter your Email Address"
//             {...register("email", {
//               required: "Email is required",
//               pattern: {
//                 value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
//                 message: "Invalid email address"
//               }
//             })}
//           />
//         </InputField>

//         <SubmitButton
//           variant="black"
//           label={isPending ? "Sending..." : "Reset Password"}
//           disabled={isPending}
//           type="submit"
//         />
//         <div className="flex justify-center">
//           <p className="center mt-6 inline-block rounded-full bg-white px-4 py-2 text-center text-sm text-gray-600 shadow">
//             Remeber password?{" "}
//             <Link
//               to="/login"
//               className="font-medium text-indigo-600 hover:underline"
//             >
//               Log in
//             </Link>
//           </p>
//         </div>
//       </form>
//     </div>
//   );
// }

// export default ForgotPassword;


import { useForm } from "react-hook-form";
import { useState, useEffect, useCallback } from "react"; // Import useState, useEffect, useCallback
import InputField from "../../ui/InputField.jsx";
import SubmitButton from "../../ui/SubmitButton.jsx";
import Logo from "../../ui/Logo.jsx";
import { Link } from "react-router-dom"; // Change 'react-router' to 'react-router-dom' if not already
import { useForgotPassword } from "./useForgotPassword.js";


function ForgotPassword() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset, // Use reset to clear the form after successful submission
  } = useForm({
    defaultValues: {
      email: ""
    }
  });

  const { forgotPassword, isPending, getTimerExpiry, clearTimer } = useForgotPassword();

  // State for the remaining time in seconds
  const [remainingTime, setRemainingTime] = useState(0);
  // State to track if the email was successfully sent (used for displaying the success message)
  const [emailSent, setEmailSent] = useState(false);

  // Function to calculate the remaining time
  const calculateRemainingTime = useCallback(() => {
    const expiryTime = getTimerExpiry();
    if (expiryTime) {
      const timeRemainingMs = expiryTime - Date.now();
      if (timeRemainingMs > 1000) { // Check if more than 1 second remains
        setRemainingTime(Math.ceil(timeRemainingMs / 1000));
        setEmailSent(true);
        return true;
      } else {
        // Timer has expired
        setRemainingTime(0);
        setEmailSent(false);
        clearTimer(); // Clear localStorage
        return false;
      }
    }
    setRemainingTime(0);
    setEmailSent(false);
    return false;
  }, [getTimerExpiry, clearTimer]);


  // 1. Initial check when component mounts
  useEffect(() => {
    calculateRemainingTime();
  }, [calculateRemainingTime]);


  // 2. Timer countdown effect
  useEffect(() => {
    if (emailSent && remainingTime > 0) {
      const timer = setInterval(() => {
        // Recalculate based on localStorage to handle multiple tabs/refreshes accurately
        const isTimerActive = calculateRemainingTime();
        if (!isTimerActive) {
          clearInterval(timer);
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [emailSent, remainingTime, calculateRemainingTime]);

  // Format the time for display (e.g., 05:30)
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
  };


  const onSubmit = (data) => {
    // Only proceed if a timer isn't already active
    if (emailSent) return;

    try {
      console.log("Form submitted:", data);
      forgotPassword(data, {
        onSuccess: () => {
          setEmailSent(true);
          calculateRemainingTime();
          reset(); // Clear the form input on successful submission
        }
      });
    } catch (error) {
      console.error("Error:", error);
      setEmailSent(false); // Ensure state is correct on error
      clearTimer();
    }
  };

  const isFormDisabled = isPending || emailSent;

  return (
    <div>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mx-auto max-w-md rounded-2xl bg-white p-8 shadow"
        noValidate
      >
        <Logo />
        <h1 className="mb-2 text-center text-2xl font-bold text-gray-800">
          Forgot Password
        </h1>

        {emailSent && remainingTime > 0 ? (
          // Success/Timer Message Display
          <div className="text-center">
            <p className="mb-6 text-green-600 font-semibold">
              ✅ Success! Check your email inbox (and spam folder) for the password reset link.
            </p>
            <p className="mb-6 text-gray-600">
              You can request a new link after **{formatTime(remainingTime)}**
            </p>
          </div>
        ) : (
          // Default Message & Input Field
          <>
            <p className="mb-6 text-center text-gray-600">
              Kindly enter the email address you used to sign up.
            </p>
            <InputField
              label="Email Address*"
              error={errors.email?.message}
            >
              <input
                type="email"
                id="email"
                className={`mt-1 block w-full border bg-white px-4 py-2 ${errors.email ? "border-red-500" : "border-gray-300"
                  } rounded-md focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none`}
                placeholder="Enter your Email Address"
                disabled={isFormDisabled} // Disable input while sending or timer is active
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address"
                  }
                })}
              />
            </InputField>
          </>
        )}

        <SubmitButton
          variant="black"
          label={isPending ? "Sending..." : "Reset Password"}
          disabled={isFormDisabled} // Disable button while sending or timer is active
          type="submit"
        />
        <div className="flex justify-center">
          <p className="center mt-6 inline-block rounded-full bg-white px-4 py-2 text-center text-sm text-gray-600 shadow">
            Remeber password?{" "}
            <Link
              to="/login"
              className="font-medium text-indigo-600 hover:underline"
            >
              Log in
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}

export default ForgotPassword;