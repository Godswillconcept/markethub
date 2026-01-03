import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { CheckIcon } from "@heroicons/react/20/solid";
import { useCreateSubAdmin, useUpdateSubAdmin } from "./useSubAdmin";

const roles = [
  { id: "vendor_management", name: "Vendor Management" },
  { id: "products_management", name: "Products Management" },
  { id: "collection", name: "Collection" },
  { id: "orders", name: "Orders" },
  { id: "earnings_payments", name: "Earnings & Payments" },
  { id: "feedback_support", name: "Feedback & Support" },
  { id: "notification_panel", name: "Notification Panel" },
];

const CreateSubAdmin = ({ isOpen, onClose, subAdminToEdit = {} }) => {
  const { createSubAdminApi, isCreating } = useCreateSubAdmin();
  const { updateSubAdminApi, isUpdating } = useUpdateSubAdmin();
  const isEditSession = Boolean(subAdminToEdit?.id);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      selectedRoles: [],
      password: "",
      reEnterPassword: "",
    },
  });

  useEffect(() => {
    if (isEditSession && subAdminToEdit) {
      // Map roles from API response to form format if necessary
      // Assuming subAdminToEdit.roles is array of objects {id, name} or similar
      // If roles structure from API matches roles definition, we map it.
      // For now we map based on role names or IDs.
      // Let's assume the API roles have an 'id' that maps to our 'id'.
      // If API returns roles as [{ name: 'Vendor Management', ... }], we might need to map by name.
      // For safety, let's try to map by name if ID fails, or just use what we have.
      // const mappedRoles = subAdminToEdit.roles?.map(r => r.name) || []; // Placeholder logic

      // Since we don't know exact API role structure, let's look at SubAdmin.jsx which uses role.name
      // We'll try to match name to our roles array to get the ID.
      const existingRoleIds = subAdminToEdit.roles
        ?.map((r) => {
          const found = roles.find((localRole) => localRole.name === r.name);
          return found ? found.id : r.id;
        })
        .filter(Boolean);

      reset({
        first_name: subAdminToEdit.first_name,
        last_name: subAdminToEdit.last_name,
        email: subAdminToEdit.email,
        phone: subAdminToEdit.phone,
        selectedRoles: existingRoleIds,
        password: "",
        reEnterPassword: "",
      });
    } else {
      reset({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        selectedRoles: [],
        password: "",
        reEnterPassword: "",
      });
    }
  }, [isEditSession, subAdminToEdit, reset]);

  const selectedRoles = watch("selectedRoles");
  const isWorking = isCreating || isUpdating;

  const onSubmit = (data) => {
    // Basic validation
    if (!isEditSession && data.password !== data.reEnterPassword) {
      alert("Passwords do not match!");
      return;
    }
    if (
      isEditSession &&
      data.password &&
      data.password !== data.reEnterPassword
    ) {
      alert("Passwords do not match!");
      return;
    }

    // Format data for API
    const apiData = {
      ...data,
      roles: data.selectedRoles, // Backend likely expects array of role IDs
    };

    // Remove password if empty in edit mode (optional update)
    if (isEditSession && !data.password) {
      delete apiData.password;
      delete apiData.reEnterPassword;
    }

    if (isEditSession) {
      updateSubAdminApi(
        { id: subAdminToEdit.id, ...apiData },
        {
          onSuccess: () => {
            reset();
            onClose();
          },
        },
      );
    } else {
      createSubAdminApi(apiData, {
        onSuccess: () => {
          reset();
          onClose();
        },
      });
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded bg-white shadow-xl md:max-w-xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-500 focus:outline-none"
          aria-label="Close"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="p-6 md:p-8">
            <h2 className="mb-2 text-center text-xl font-bold text-gray-900 md:text-2xl">
              {isEditSession ? "Edit Sub Admin" : "Create Sub Admin"}
            </h2>
            <p className="mb-6 text-center text-sm text-gray-500">
              Kindly provide the informations below.
            </p>

            {/* Input Fields */}
            <div className="mb-6 space-y-4">
              <div className="flex gap-4">
                <div className="w-1/2">
                  <label
                    htmlFor="first_name"
                    className="mb-1 block text-sm font-medium text-gray-700"
                  >
                    First Name
                  </label>
                  <input
                    type="text"
                    id="first_name"
                    {...register("first_name", { required: true })}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none sm:text-sm"
                    placeholder="First Name"
                  />
                </div>
                <div className="w-1/2">
                  <label
                    htmlFor="last_name"
                    className="mb-1 block text-sm font-medium text-gray-700"
                  >
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="last_name"
                    {...register("last_name", { required: true })}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none sm:text-sm"
                    placeholder="Last Name"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Sub Admin's email
                </label>
                <input
                  type="email"
                  id="email"
                  {...register("email", { required: true })}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none sm:text-sm"
                  placeholder="Enter the mail of the sub admin"
                />
              </div>
              <div>
                <label
                  htmlFor="phone"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Sub Admin phone number
                </label>
                <input
                  type="tel"
                  id="phone"
                  {...register("phone", { required: true })}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none sm:text-sm"
                  placeholder="Enter the phone number of the sub admin"
                />
              </div>
            </div>

            {/* Sub Admin's Role Section */}
            <div className="mb-6">
              <p className="mb-3 block text-sm font-medium text-gray-700">
                Sub Admin's role
              </p>
              <div className="space-y-2">
                {roles.map((role) => (
                  <label
                    key={role.id}
                    className="flex cursor-pointer items-center py-2"
                  >
                    <input
                      type="checkbox"
                      value={role.id}
                      {...register("selectedRoles")}
                      className="sr-only"
                    />
                    <div
                      className={`relative flex h-5 w-5 items-center justify-center rounded border-2 transition-all duration-200 ease-in-out ${selectedRoles && selectedRoles.includes(role.id) ? "border-emerald-500 bg-emerald-500" : "border-gray-300 bg-white"} `}
                    >
                      {selectedRoles && selectedRoles.includes(role.id) && (
                        <CheckIcon className="h-4 w-4 text-white" />
                      )}
                    </div>
                    <span className="ml-3 text-sm text-gray-700">
                      {role.name}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Password Fields */}
            <div className="mb-6 space-y-4">
              <div>
                <label
                  htmlFor="password"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Password {isEditSession && "(Leave blank to keep current)"}
                </label>
                <input
                  type="password"
                  id="password"
                  {...register("password", { required: !isEditSession })}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none sm:text-sm"
                  placeholder="Enter a password"
                />
              </div>
              <div>
                <label
                  htmlFor="reEnterPassword"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Re-enter Password
                </label>
                <input
                  type="password"
                  id="reEnterPassword"
                  {...register("reEnterPassword", { required: !isEditSession })}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none sm:text-sm"
                  placeholder="Enter a password"
                />
              </div>
            </div>
          </div>

          {/* Modal Footer (Button) */}
          <div className="border-t border-gray-200 p-6 pt-0 md:p-8">
            <button
              type="submit"
              disabled={isWorking}
              className="w-full rounded-md bg-gray-900 px-4 py-3 text-base font-semibold text-white transition duration-150 ease-in-out hover:bg-gray-800 focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 focus:outline-none disabled:bg-gray-400"
            >
              {isWorking
                ? "Proccessing..."
                : isEditSession
                  ? "Edit Sub Admin"
                  : "Create Sub Admin"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateSubAdmin;
