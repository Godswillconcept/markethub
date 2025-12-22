import { useForm, Controller } from "react-hook-form";

import InputField from "../../ui/InputField.jsx";
import Checkbox from "../../ui/Checkbox.jsx";
import SubmitButton from "../../ui/SubmitButton.jsx";
import SignUpHeading from "../../ui/SignUpHeading.jsx";
import PhoneInput from "../../ui/PhoneInput.jsx";
import { Link } from "react-router";
import { useSignup } from "./useSignup.js";
import { useNavigate } from "react-router";

function SignUpForm() {
  // const { handleSubmit, register, formState, getValues, reset } = useForm();
  const {
    handleSubmit,
    setError,
    register,
    formState,
    getValues,
    reset,
    clearErrors,
    control,
  } = useForm({
    mode: "onChange", // ensures real-time validation
  });

  const { errors, isValid } = formState;
  const navigate = useNavigate();

  const { signup, isPending } = useSignup();

  function onSubmitSignUp(data) {
    const { confirmPassword, terms, ...payload } = data;

    signup(payload, {
      onSuccess: () => {
        reset();
        navigate("/phoneVerification", { state: { email: payload.email } });
      },
      // Error is now handled globally by useSignup hook with toast
    });
  }

  return (
    <div className="mx-auto mt-36 flex w-full max-w-lg flex-col items-center">
      <SignUpHeading />

      <form onSubmit={handleSubmit(onSubmitSignUp)}>
        <h1 className="mb-2 text-center text-2xl font-bold text-gray-800">
          Welcome, Lets personalize your Stylay experience
        </h1>
        <p className="mb-6 text-center text-gray-600">
          Kindly provide us with your personal information.
        </p>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <InputField
            label="First Name"
            name="first_name"
            error={errors.first_name?.message}
          >
            <input
              type="text"
              id="fName"
              name="first_name"
              className={`mt-1 block w-full border bg-white px-4 py-2 ${
                errors.first_name ? "border-red-500" : "border-gray-300"
              } rounded-md focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none`}
              placeholder="Enter First Name"
              {...register("first_name", {
                required: "First Name is required",
              })}
              disabled={isPending}
            />
          </InputField>
          <InputField
            label={"Last Name"}
            name="last_name"
            error={errors.last_name?.message}
          >
            <input
              type="text"
              id="lName"
              name="last_name"
              className={`mt-1 block w-full border bg-white px-4 py-2 ${
                errors.last_name ? "border-red-500" : "border-gray-300"
              } rounded-md focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none`}
              placeholder="Enter Last Name"
              {...register("last_name", { required: "Last Name is required" })}
              disabled={isPending}
            />
          </InputField>
        </div>
        <InputField
          label="Phone number"
          name="phone"
          error={errors.phone?.message}
        >
          <Controller
            name="phone"
            control={control}
            rules={{ required: "Phone number is required" }}
            render={({ field: { value, onChange } }) => (
              <PhoneInput
                value={value}
                onChange={onChange}
                placeholder="Enter phone number"
                error={errors.phone}
                disabled={isPending}
              />
            )}
          />
        </InputField>
        <InputField
          label="Email address"
          name="email"
          error={errors.email?.message}
        >
          <input
            type="email"
            id="email"
            name="email"
            className={`mt-1 block w-full border bg-white px-4 py-2 ${
              errors.email ? "border-red-500" : "border-gray-300"
            } rounded-md focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none`}
            placeholder="Enter your Email address"
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: "Invalid email address",
              },
            })}
            disabled={isPending}
          />
        </InputField>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <InputField
            label="Password"
            name="password"
            error={errors.password?.message}
          >
            <input
              type="password"
              id="password"
              name="password"
              className={`mt-1 block w-full border bg-white px-4 py-2 ${
                errors.password ? "border-red-500" : "border-gray-300"
              } rounded-md focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none`}
              placeholder="Enter Password"
              {...register("password", { required: "Password is required" })}
              disabled={isPending}
            />
          </InputField>
          <InputField
            label="Confirm Password"
            name="confirmPassword"
            error={errors.confirmPassword?.message}
          >
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              className={`mt-1 block w-full border bg-white px-4 py-2 ${
                errors.confirmPassword ? "border-red-500" : "border-gray-300"
              } rounded-md focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none`}
              placeholder="Confirm Password"
              {...register("confirmPassword", {
                required: "Confirm Password is required",
                validate: (value) =>
                  value === getValues("password") || "Passwords do not match",
              })}
              disabled={isPending}
            />
          </InputField>
        </div>
        <Checkbox
          label={
            <>
              I have read and duly accept the
              <button type="button" className="text-indigo-600 hover:underline">
                Terms of Use
              </button>
            </>
          }
          name="terms"
          error={errors.terms?.message}
          register={register("terms", {
            required: "You must accept the terms",
          })}
          disabled={isPending}
        />
        <SubmitButton
          variant="black"
          label={isPending ? "Signing up..." : "Next"}
          disabled={!isValid || isPending}
        />
        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-medium text-indigo-600 hover:underline"
          >
            Log in
          </Link>
        </p>
      </form>
    </div>
  );
}

export default SignUpForm;
