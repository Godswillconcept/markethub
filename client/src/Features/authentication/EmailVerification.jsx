import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router";
import Logo from "../../ui/Logo.jsx";
import { useVerification } from "./useVerification.js";
import { useResendVerification } from "./useResendCode.js";
import { useCountdownTimer } from "./useCountdownTimer.js"; // IMPORT NEW HOOK

// Use a specific key for this component's timer
const RESEND_TIMER_KEY = "resendCodeTimer";
const RESEND_DURATION_MINUTES = 10; // 10 minutes

function EmailVerification() {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;

  const { register, handleSubmit, setFocus, formState: { errors }, reset } = useForm();
  const { verify, isPending } = useVerification();
  const { resend, isPending: isResending } = useResendVerification();

  // --- USE CUSTOM HOOK ---
  const {
    remainingTime,
    isTimerActive,
    startTimer,
    formatTime
  } = useCountdownTimer(RESEND_TIMER_KEY, RESEND_DURATION_MINUTES);


  // Handle OTP submit (no change)
  const onSubmit = (data) => {
    const code = Object.values(data).join("");
    const payload = { email, code };

    verify(payload, {
      onSuccess: () => {
        reset();
        navigate("/landing");
      },
    });
  };

  // Handle Resend Click
  const handleResend = () => {
    if (isTimerActive || isResending || isPending) return;

    resend(email, {
      onSuccess: () => {
        startTimer(); // Simply call the hook function to start the timer
      },
    });
  };

  // Move focus automatically when user types (no change)
  const handleChange = (e, index) => {
    if (e.target.value.length === 1 && index < 6) {
      setFocus(`otp${index + 1}`);
    }
  };

  return (
    <div className="font-sans text-gray-900 antialiased">
      <div className="flex min-h-screen flex-col items-center justify-start px-4 py-8">
        <Logo />

        <div className="w-full max-w-md text-center">
          <h1 className="mb-2 text-3xl font-bold md:text-4xl">
            Verify your phone number
          </h1>
          <p className="mb-8 text-gray-500">
            Enter the code we sent to {email}
          </p>
        </div>

        {/* OTP Verification Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-sm">
          <div className="mb-6 flex justify-center gap-2 sm:gap-3">
            {[1, 2, 3, 4, 5, 6].map((num) => (
              <input
                key={num}
                type="text"
                maxLength="1"
                className="h-12 w-12 border border-gray-300 text-center text-2xl font-semibold transition focus:border-transparent focus:ring-2 focus:ring-gray-800 focus:outline-none sm:h-14 sm:w-14"
                {...register(`otp${num}`, {
                  required: "Required",
                  pattern: {
                    value: /^[0-9]$/,
                    message: "Must be a digit",
                  },
                })}
                disabled={isPending}
                onChange={(e) => handleChange(e, num)}
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-lg bg-gray-900 py-3 font-semibold text-white transition-colors hover:bg-gray-800 disabled:opacity-50"
          >
            {isPending ? "Verifying..." : "Verify"}
          </button>
        </form>
        <div className="mt-4 text-center text-sm text-gray-600">
          <span>Didn't get the code?</span>
          <button
            onClick={handleResend}
            className="ml-1 font-semibold text-gray-900 hover:underline focus:outline-none"
            disabled={isResending || isTimerActive || isPending}
          >
            {isResending
              ? "Sending..."
              : isTimerActive
                ? `Resend in ${formatTime(remainingTime)}` // Show timer
                : "Resend it"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default EmailVerification; 