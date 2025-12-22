import { useState, useEffect, useRef } from "react";
import { FaChevronDown, FaSearch } from "react-icons/fa"; // Icons for dropdown and search
import { CheckIcon } from "@heroicons/react/20/solid"; // For custom checkbox checkmark

const audienceTypes = ["All  Users", "Vendors Only", "Users Only", "Custom"];

const customUsers = [
  // Placeholder for searchable users
  { id: "user_1", name: "Eniola Obadeji" },
  { id: "user_2", name: "Isaac Obadeji" },
  { id: "user_3", name: "Alice Smith" },
  { id: "user_4", name: "Bob Johnson" },
  { id: "user_5", name: "Charlie Brown" },
];

const AdminCreateNotification = ({ onClose }) => {
  const modalRef = useRef(null);
  const audienceTypeRef = useRef(null); // Ref for audience type dropdown
  const customAudienceRef = useRef(null); // Ref for custom audience dropdown

  const [formData, setFormData] = useState({
    title: "",
    messageBody: "",
    audienceType: "All Users",
    selectedCustomUsers: [],
    deliveryMethods: {
      inApp: true,
      email: false,
    },
    variants: [], // Add variants to form data
  });
  const [isAudienceTypeOpen, setIsAudienceTypeOpen] = useState(false);
  const [isCustomAudienceOpen, setIsCustomAudienceOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        deliveryMethods: {
          ...prev.deliveryMethods,
          [name]: checked,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleAudienceTypeSelect = (type) => {
    setFormData((prev) => ({ ...prev, audienceType: type }));
    setIsAudienceTypeOpen(false);
    if (type !== "Custom") {
      setFormData((prev) => ({ ...prev, selectedCustomUsers: [] })); // Clear custom users if not custom
      setIsCustomAudienceOpen(false); // Close custom dropdown
    }
  };

  const handleCustomUserToggle = (userId) => {
    setFormData((prev) => {
      const newSelected = prev.selectedCustomUsers.includes(userId)
        ? prev.selectedCustomUsers.filter((id) => id !== userId)
        : [...prev.selectedCustomUsers, userId];
      return { ...prev, selectedCustomUsers: newSelected };
    });
  };

  // Function to handle variant selection
  const handleVariantToggle = (variantId) => {
    setFormData((prev) => {
      const newSelected = prev.variants.map(variant =>
        variant.id === variantId
          ? { ...variant, selected: !variant.selected }
          : variant
      );
      return { ...prev, variants: newSelected };
    });
  };

  // Function to select all variants of a specific type
  const handleSelectAllOfType = (variantName) => {
    setFormData((prev) => {
      const newVariants = prev.variants.map(variant =>
        variant.name === variantName
          ? { ...variant, selected: true }
          : variant
      );
      return { ...prev, variants: newVariants };
    });
  };

  // Function to clear all variants of a specific type
  const handleClearType = (variantName) => {
    setFormData((prev) => {
      const newVariants = prev.variants.map(variant =>
        variant.name === variantName
          ? { ...variant, selected: false }
          : variant
      );
      return { ...prev, variants: newVariants };
    });
  };

  // Function to load variant data (simulating API call)
  const loadVariants = async () => {
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Mock API response based on the provided structure
      const mockVariants = [
        {
          "id": "4662",
          "name": "size",
          "value": "L"
        },
        {
          "id": "4663",
          "name": "size",
          "value": "M"
        },
        {
          "id": "4664",
          "name": "size",
          "value": "XS"
        },
        {
          "id": "4665",
          "name": "color",
          "value": "Navy"
        },
        {
          "id": "4666",
          "name": "color",
          "value": "Royal Blue"
        },
        {
          "id": "4667",
          "name": "color",
          "value": "Red"
        },
        {
          "id": "4668",
          "name": "color",
          "value": "White"
        },
        {
          "id": "4669",
          "name": "color",
          "value": "Mustard"
        },
        {
          "id": "4670",
          "name": "fit",
          "value": "Relaxed"
        },
        {
          "id": "4671",
          "name": "fit",
          "value": "Slim"
        },
        {
          "id": "4672",
          "name": "fit",
          "value": "Regular"
        },
        {
          "id": "4673",
          "name": "fit",
          "value": "Oversized"
        }
      ];

      setFormData(prev => ({ ...prev, variants: mockVariants }));
      console.log('Variants loaded successfully:', mockVariants);
    } catch (error) {
      console.error('Error loading variants:', error);
    }
  };

  // Load variants when component mounts
  useEffect(() => {
    loadVariants();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Get selected variants summary
    const selectedVariants = formData.variants.filter(v => v.selected);
    const selectedByType = selectedVariants.reduce((acc, variant) => {
      if (!acc[variant.name]) {
        acc[variant.name] = [];
      }
      acc[variant.name].push(variant.value);
      return acc;
    }, {});

    console.log("Submitting notification data:", {
      ...formData,
      selectedVariantsSummary: selectedByType
    });

    // Here you would send data to your API
    alert(`Notification creation initiated with ${selectedVariants.length} variants selected (check console)`);
    onClose(); // Close modal on successful submission
  };

  // Close modal on escape key press
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  // Close dropdowns/modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
      // Also close specific dropdowns if clicking outside of them
      if (
        audienceTypeRef.current &&
        !audienceTypeRef.current.contains(event.target)
      ) {
        setIsAudienceTypeOpen(false);
      }
      if (
        customAudienceRef.current &&
        !customAudienceRef.current.contains(event.target)
      ) {
        setIsCustomAudienceOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  // Group variants by name (size, color, fit)
  const groupedVariants = formData.variants.reduce((acc, variant) => {
    if (!acc[variant.name]) {
      acc[variant.name] = [];
    }
    acc[variant.name].push(variant);
    return acc;
  }, {});

  // Count selected variants
  const selectedCount = formData.variants.filter(v => v.selected).length;

  console.log('Current formData:', formData);
  console.log('Grouped variants:', groupedVariants);
  console.log('Selected variants count:', selectedCount);

  const filteredUsers = customUsers.filter((user) =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div
        ref={modalRef}
        className="relative max-h-[100vh] w-full max-w-xl overflow-y-auto rounded-lg bg-white shadow-xl"
      >
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
            <h2 className="mb-2 text-center text-xl font-semibold text-gray-900 md:text-2xl">
              Create New Notification
            </h2>

            {/* Notification Title */}
            <div className="mb-4">
              <label
                htmlFor="title"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Notification Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none sm:text-sm"
                placeholder="e.g. System Maintenance Scheduled"
                required
              />
            </div>

            {/* Message Body */}
            <div className="mb-4">
              <label
                htmlFor="messageBody"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Message Body
              </label>
              <textarea
                id="messageBody"
                name="messageBody"
                rows="4"
                value={formData.messageBody}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none sm:text-sm"
                placeholder="Write your message here..."
                required
              ></textarea>
            </div>

            {/* Audience Type Dropdown */}
            <div className="relative mb-4" ref={audienceTypeRef}>
              <label
                htmlFor="audienceType"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Audience Type
              </label>
              <button
                type="button"
                onClick={() => setIsAudienceTypeOpen(!isAudienceTypeOpen)}
                className="relative w-full cursor-default rounded-md border border-gray-300 bg-white py-2 pr-10 pl-3 text-left shadow-sm focus:ring-1 focus:outline-none sm:text-sm"
                aria-haspopup="listbox"
                aria-expanded={isAudienceTypeOpen ? "true" : "false"}
                aria-labelledby="listbox-label"
              >
                <span className="block truncate">{formData.audienceType}</span>
                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                  <FaChevronDown
                    className={`h-5 w-5 transform text-gray-400 transition-transform ${isAudienceTypeOpen ? "rotate-180" : ""}`}
                    aria-hidden="true"
                  />
                </span>
              </button>

              {isAudienceTypeOpen && (
                <ul
                  className="ring-opacity-5 absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black focus:outline-none sm:text-sm"
                  tabIndex="-1"
                  role="listbox"
                  aria-labelledby="listbox-label"
                >
                  {audienceTypes.map((type) => (
                    <li
                      key={type}
                      className={`relative cursor-default py-2 pr-9 pl-3 select-none ${formData.audienceType === type ? "bg-blue-600 text-white" : "text-gray-900 hover:bg-gray-100"}`}
                      id={`listbox-option-${type}`}
                      // role="option"
                      onClick={() => handleAudienceTypeSelect(type)}
                    >
                      <span
                        className={`block truncate ${formData.audienceType === type ? "font-semibold" : "font-normal"}`}
                      >
                        {type}
                      </span>
                      {formData.audienceType === type && (
                        <span className="absolute inset-y-0 right-0 flex items-center pr-4">
                          <CheckIcon className="h-5 w-5" aria-hidden="true" />
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Custom Audience Selection (Conditional) */}
            {formData.audienceType === "Custom" && (
              <div className="relative mb-4" ref={customAudienceRef}>
                <div className="mt-1 flex rounded-md border border-gray-300 shadow-sm">
                  <span className="inline-flex items-center rounded-l-md border-r border-gray-300 bg-gray-50 px-3 text-gray-500 sm:text-sm">
                    <FaSearch className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    name="searchCustomUsers"
                    id="searchCustomUsers"
                    className="block w-full flex-1 rounded-none rounded-r-md px-3 py-2 placeholder-gray-400 focus:outline-none sm:text-sm"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onFocus={() => setIsCustomAudienceOpen(true)}
                  />
                </div>

                {isCustomAudienceOpen && (
                  <ul className="ring-opacity-5 absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black focus:outline-none sm:text-sm">
                    {filteredUsers.length > 0 ? (
                      filteredUsers.map((user) => (
                        <li
                          key={user.id}
                          className={`relative cursor-default py-2 pr-9 pl-3 select-none ${formData.selectedCustomUsers.includes(user.id) ? "bg-blue-600 text-white" : "text-gray-900 hover:bg-gray-100"}`}
                          onClick={() => handleCustomUserToggle(user.id)}
                        >
                          <span
                            className={`block truncate ${formData.selectedCustomUsers.includes(user.id) ? "font-semibold" : "font-normal"}`}
                          >
                            {user.name}
                          </span>
                          {formData.selectedCustomUsers.includes(user.id) && (
                            <span className="absolute inset-y-0 right-0 flex items-center pr-4">
                              <CheckIcon
                                className="h-5 w-5"
                                aria-hidden="true"
                              />
                            </span>
                          )}
                        </li>
                      ))
                    ) : (
                      <li className="relative py-2 pr-9 pl-3 text-gray-700 select-none">
                        No users found.
                      </li>
                    )}
                  </ul>
                )}
                {formData.selectedCustomUsers.length > 0 && (
                  <div className="mt-2 text-sm text-gray-600">
                    Selected:{" "}
                    {formData.selectedCustomUsers
                      .map((id) => customUsers.find((u) => u.id === id)?.name)
                      .join(", ")}
                  </div>
                )}
              </div>
            )}

            {/* Delivery Method Checkboxes */}
            <div className="mb-6">
              <p className="mb-2 block text-sm font-medium text-gray-700">
                Delivery Method
              </p>
              <div className="flex space-x-6">
                <label className="flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    name="inApp"
                    checked={formData.deliveryMethods.inApp}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <div
                    className={`relative flex h-5 w-5 items-center justify-center rounded border-2 transition-all duration-200 ease-in-out ${formData.deliveryMethods.inApp ? "border-gray-900 bg-gray-900" : "border-gray-300 bg-white"} `}
                  >
                    {formData.deliveryMethods.inApp && (
                      <CheckIcon className="h-4 w-4 text-white" />
                    )}
                  </div>
                  <span className="ml-3 text-sm text-gray-700">
                    In-App Notification
                  </span>
                </label>
                <label className="flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    name="email"
                    checked={formData.deliveryMethods.email}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <div
                    className={`relative flex h-5 w-5 items-center justify-center rounded border-2 transition-all duration-200 ease-in-out ${formData.deliveryMethods.email ? "border-gray-900 bg-gray-900" : "border-gray-300 bg-white"} `}
                  >
                    {formData.deliveryMethods.email && (
                      <CheckIcon className="h-4 w-4 text-white" />
                    )}
                  </div>
                  <span className="ml-3 text-sm text-gray-700">Email</span>
                </label>
              </div>
            </div>

            {/* Variant Types Section */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <p className="block text-sm font-medium text-gray-700">
                  Variant Types
                </p>
                <span className="text-xs text-gray-500">
                  {selectedCount} selected
                </span>
              </div>
              <div className="space-y-4">
                {Object.keys(groupedVariants).length > 0 ? (
                  Object.entries(groupedVariants).map(([variantName, variants]) => (
                    <div key={variantName} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-900 capitalize">
                          {variantName}
                        </h4>
                        <div className="flex space-x-2">
                          <button
                            type="button"
                            onClick={() => handleSelectAllOfType(variantName)}
                            className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                          >
                            Select All
                          </button>
                          <button
                            type="button"
                            onClick={() => handleClearType(variantName)}
                            className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                          >
                            Clear
                          </button>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {variants.map((variant) => (
                          <button
                            key={variant.id}
                            type="button"
                            onClick={() => handleVariantToggle(variant.id)}
                            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium transition-colors ${variant.selected
                              ? "bg-blue-600 text-white hover:bg-blue-700"
                              : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                              }`}
                          >
                            {variant.value}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-gray-500">
                    No variant types available
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Modal Footer (Button) */}
          <div className="border-t border-gray-200 p-6 pt-0 md:p-8">
            <button
              type="submit"
              className="w-full rounded-md bg-gray-900 px-4 py-3 text-base font-semibold text-white transition duration-150 ease-in-out hover:bg-gray-800 focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 focus:outline-none"
            >
              Send Now
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminCreateNotification;

