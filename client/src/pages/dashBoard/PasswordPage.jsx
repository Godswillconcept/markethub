import { useForm } from "react-hook-form";
import ProfileInput from "./ProfileInput.jsx";
import { usePasswordUpdate } from "../../Features/authentication/usePasswordUpdate.js";

function PasswordPage() {
  const { updatePassword, isLoading } = usePasswordUpdate();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    watch,
  } = useForm({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });


  const onSubmit = (data) => {
    // Only submit currentPassword and newPassword, exclude confirmPassword
    const { confirmPassword, ...passwordData } = data;
    updatePassword(passwordData, {
      onSuccess: () => {
        reset();
      }
    });
  };

  const onCancel = () => {
    reset();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Password</h1>
        <p className="mt-1 text-gray-600">Manage your password</p>
      </div>
      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <ProfileInput
          label="Current Password"
          name="currentPassword"
          error={errors.currentPassword?.message}
          className="mb-6"
        >
          <input
            type="password"
            id="currentPassword"
            {...register("currentPassword", { 
              required: "Current password is required" 
            })}
            placeholder="Enter current password"
            className="w-full rounded-lg border border-gray-300 px-3 py-3 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
          />
        </ProfileInput>

        <ProfileInput
          label="New Password"
          name="newPassword"
          error={errors.newPassword?.message}
          className="mb-6"
        >
          <input
            type="password"
            id="newPassword"
            {...register("newPassword", { 
              required: "New password is required",
              minLength: {
                value: 8,
                message: "Password must be at least 8 characters"
              }
            })}
            placeholder="Enter new password"
            className="w-full rounded-lg border border-gray-300 px-3 py-3 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
          />
        </ProfileInput>

        <ProfileInput
          label="Confirm New Password"
          name="confirmPassword"
          error={errors.confirmPassword?.message}
        >
          <input
            type="password"
            id="confirmPassword"
            {...register("confirmPassword", {
              validate: (value) =>
                value === watch("newPassword") || "Passwords do not match",
            })}
            placeholder="Confirm new password"
            className="w-full rounded-lg border border-gray-300 px-3 py-3 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
          />
        </ProfileInput>

        <div className="flex justify-end space-x-4 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Updating...' : 'Update Password'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default PasswordPage;
