import InputField from "../../ui/InputField.jsx";
import Logo from "../../ui/Logo.jsx";
import SubmitButton from "../../ui/SubmitButton.jsx";
import { Link, useNavigate, useLocation } from "react-router";
import { useForm } from "react-hook-form";
import useLogin from "./useLogin.js";
import { useEffect } from "react";

function LoginForm() {
  const navigate = useNavigate();
  const location = useLocation();
  // const { register, handleSubmit, reset, formState } = useForm();
  const { handleSubmit, register, formState, reset } = useForm({
    mode: "onChange", // ensures real-time validation
  });

  const { errors } = formState;
  const { login, isPending } = useLogin();
  // Get redirect information from navigation state
  const returnTo = location.state?.returnTo || location.state?.from || "/";
  const redirectMessage = location.state?.message;

  // Show message if redirected from cart
  useEffect(() => {
    if (redirectMessage) {
      console.log("Redirect message:", redirectMessage);
    }
  }, [redirectMessage]);

  // const [error] = useState(false);
  const onSubmit = (data) => {
    login(data, {
      onSuccess: (response) => {
        console.log("✅ Login successful");
        reset();

        // Smart navigation: returnTo or role-based
        // Access user role directly from response (which is safer than localStorage async)
        // Adjust based on your API response structure (response.data or response.user)
        const user = response?.data?.user || response?.data || response?.user;

        let target = returnTo;
        if (target === "/") {
          // Check roles safely
          // Assuming role can be a string property OR inside a roles array
          const userRoles = user?.roles || [];
          const roleName =
            user?.role ||
            (Array.isArray(userRoles) && userRoles[0]?.name?.toLowerCase());

          console.log("User Role for Redirect:", roleName);

          switch (roleName) {
            case "admin":
              target = "/admin/dashboard";
              break;
            case "vendor":
              target = "/vendor/dashboard";
              break;
            case "user":
            default:
              target = "/landing";
          }
        }
        console.log("🔄 Redirecting to:", target);
        navigate(target, { replace: true });
      },
      onError: (error) => {
        console.error("❌ Login failed:", error);
      },
    });
  };
  return (
    // <div className="flex flex-col items-center justify-center bg-gray-50">
    <div>
      <form
        className="mx-auto mt-36 max-w-md rounded-2xl bg-white p-8 shadow"
        onSubmit={handleSubmit(onSubmit)}
      >
        <Logo />
        <h1 className="mb-2 text-center text-2xl font-bold text-gray-800">
          Login to Stylay
        </h1>
        <p className="mb-6 text-center text-gray-600">
          Welcome back! Please enter your details.
        </p>
        <InputField
          label="Email Address*"
          name="email"
          error={errors.email?.message}
        >
          <input
            type="email"
            id="email"
            name="email"
            className={`mt-1 block w-full border bg-white px-4 py-2 ${
              errors.email?.message ? "border-red-500" : "border-gray-300"
            } rounded-md focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none`}
            placeholder="Enter your Email Address"
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: "Invalid email address",
              },
            })}
          />
        </InputField>
        <InputField
          label="Password*"
          name="password"
          error={errors.password?.message}
        >
          <input
            type="password"
            id="password"
            name="password"
            className={`mt-1 block w-full border bg-white px-4 py-2 ${
              errors.password?.message ? "border-red-500" : "border-gray-300"
            } rounded-md focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none`}
            placeholder="Enter Password"
            {...register("password", { required: "Password is required" })}
          />
        </InputField>
        <div className="mb-4 flex justify-end text-sm">
          <Link to="/forgot-password" className="text-gray-600 hover:underline">
            Forgot password
          </Link>
        </div>
        <SubmitButton
          variant="black"
          label={isPending ? "Signing in..." : "Sign in"}
          disabled={isPending}
        />
        {/* <SubmitButton
          variant="google"
          type="button"
          disabled={isPending}
          label={
            <>
              <img
                src="https://www.svgrepo.com/show/355037/google.svg"
                alt="Google"
                className="h-5 w-5"
              />
              Continue with Google
            </>
          }
        /> */}
      </form>
      <div className="flex justify-center">
        <p className="center mt-6 inline-block rounded-full bg-white px-4 py-2 text-center text-sm text-gray-600 shadow">
          Don’t have an account?{" "}
          <Link
            to="/signup"
            className="font-medium text-indigo-600 hover:underline"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

export default LoginForm;
