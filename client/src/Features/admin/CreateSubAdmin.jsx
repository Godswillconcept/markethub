import { useState, useEffect } from "react";
import { CheckIcon } from "@heroicons/react/20/solid";
import PhoneInput from "../../ui/PhoneInput.jsx";
const roles = [
  { id: "vendor_management", name: "Vendor Management", type: "checkbox" },
  { id: "products_management", name: "Products Management", type: "checkbox" },
  { id: "collection", name: "Collection", type: "radio" },
  { id: "orders", name: "Orders", type: "radio" },
  { id: "earnings_payments", name: "Earnings & Payments", type: "radio" },
  { id: "feedback_support", name: "Feedback & Support", type: "radio" },
  { id: "notification_panel", name: "Notification Panel", type: "radio" },
];

const CreateSubAdmin = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    selectedRoles: [], // For checkboxes
    selectedRadioRole: "", // For radio buttons
    password: "",
    reEnterPassword: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhoneChange = (value) => {
    setFormData((prev) => ({ ...prev, phoneNumber: value }));
  };

  const handleRoleChange = (roleId, type) => {
    if (type === "checkbox") {
      setFormData((prev) => {
        const newRoles = prev.selectedRoles.includes(roleId)
          ? prev.selectedRoles.filter((id) => id !== roleId)
          : [...prev.selectedRoles, roleId];
        return { ...prev, selectedRoles: newRoles };
      });
    } else if (type === "radio") {
      setFormData((prev) => ({ ...prev, selectedRadioRole: roleId }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Basic validation
    if (formData.password !== formData.reEnterPassword) {
      alert("Passwords do not match!");
      return;
    }
    console.log("Submitting form data:", formData);
    // Here you would send data to your API
    alert("Sub Admin creation initiated (check console)");
    onClose(); // Close modal on successful submission
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
        <form onSubmit={handleSubmit}>
          <div className="p-6 md:p-8">
            <h2 className="mb-2 text-center text-xl font-bold text-gray-900 md:text-2xl">
              Create Sub Admin
            </h2>
            <p className="mb-6 text-center text-sm text-gray-500">
              Kindly provide the informations below.
            </p>

            {/* Input Fields */}
            <div className="mb-6 space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Sub Admin's Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none sm:text-sm"
                  placeholder="Enter the name of the sub admin"
                  required
                />
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
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none sm:text-sm"
                  placeholder="Enter the mail of the sub admin"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="phoneNumber"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Sub Admin phone number
                </label>
                <PhoneInput
                  value={formData.phoneNumber}
                  onChange={handlePhoneChange}
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
                    {role.type === "checkbox" ? (
                      // Custom Checkbox
                      <input
                        type="checkbox"
                        name="selectedRoles"
                        value={role.id}
                        checked={formData.selectedRoles.includes(role.id)}
                        onChange={() => handleRoleChange(role.id, role.type)}
                        className="sr-only" // Hide native checkbox
                      />
                    ) : (
                      // Custom Radio
                      <input
                        type="radio"
                        name="selectedRadioRole"
                        value={role.id}
                        checked={formData.selectedRadioRole === role.id}
                        onChange={() => handleRoleChange(role.id, role.type)}
                        className="sr-only" // Hide native radio
                      />
                    )}

                    {/* Custom visual indicator for Checkbox */}
                    {role.type === "checkbox" && (
                      <div
                        className={`relative flex h-5 w-5 items-center justify-center rounded border-2 transition-all duration-200 ease-in-out ${formData.selectedRoles.includes(role.id) ? "border-emerald-500 bg-emerald-500" : "border-gray-300 bg-white"} `}
                      >
                        {formData.selectedRoles.includes(role.id) && (
                          <CheckIcon className="h-4 w-4 text-white" />
                        )}
                      </div>
                    )}
                    {/* Custom visual indicator for Radio */}
                    {role.type === "radio" && (
                      <div
                        className={`relative flex h-5 w-5 items-center justify-center rounded-full border-2 transition-all duration-200 ease-in-out ${formData.selectedRadioRole === role.id ? "border-emerald-500" : "border-gray-300"} `}
                      >
                        {formData.selectedRadioRole === role.id && (
                          <div className="h-2.5 w-2.5 rounded-full bg-emerald-500"></div>
                        )}
                      </div>
                    )}
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
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none sm:text-sm"
                  placeholder="Enter a password"
                  required
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
                  name="reEnterPassword"
                  value={formData.reEnterPassword}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none sm:text-sm"
                  placeholder="Enter a password"
                  required
                />
              </div>
            </div>
          </div>

          {/* Modal Footer (Button) */}
          <div className="border-t border-gray-200 p-6 pt-0 md:p-8">
            {" "}
            {/* Added border-t for separation */}
            <button
              type="submit"
              className="w-full rounded-md bg-gray-900 px-4 py-3 text-base font-semibold text-white transition duration-150 ease-in-out hover:bg-gray-800 focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 focus:outline-none"
            >
              Next
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateSubAdmin;
