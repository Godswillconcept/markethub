import { useParams, Link } from "react-router-dom";
import { getImageUrl } from "../../utils/imageUtil.js";
import {
  ExclamationCircleIcon, // For "Deactivate" info icon
  EnvelopeIcon, // For email
  PhoneIcon, // For phone
  CalendarDaysIcon, // For date joined
  UsersIcon, // For roles
  UserCircleIcon, // For recent activity user icon
} from "@heroicons/react/24/outline"; // Need to install @heroicons/react if not already, using outline for some icons

const SubAdminDetails = () => {
  const { id } = useParams(); // Get the ID from the URL

  // Placeholder data - in a real app, you'd fetch this based on the `id`
  const subAdmin = {
    id: id,
    name: "Brooklyn Simmons",
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=3276&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", // Example image
    email: "ebele@stylay.com",
    phoneNumber: "+234 812 345 6789",
    dateJoined: "Jan 12, 2025",
    roles: ["Vendor Support", "Earnings & Payments"],
    status: "Active",
    currentRouteName: "Christine Brook", // Placeholder for dynamic name
  };

  const recentActivities = [
    {
      id: 1,
      type: "New User Registered",
      description:
        "John Doe (john.doe@example.com) registered as a User on March 15, 2025.",
      icon: UserCircleIcon, // Example icon
      action1: "Activate User",
      action2: "View Profile",
    },
    // Add more activities as needed
  ];

  const handleDeactivate = () => {
    if (
      window.confirm(`Are you sure you want to deactivate ${subAdmin.name}?`)
    ) {
      alert(`${subAdmin.name} has been deactivated.`);
      // Implement deactivation logic here
    }
  };

  const handleActivityAction = (action, activityId) => {
    alert(`Performed "${action}" for activity ${activityId}`);
    // Implement specific activity actions
  };

  return (
    <div className="space-y-6">
      {/* Page Header and Breadcrumbs */}
      <div className="flex flex-col justify-between border-b border-gray-200 pb-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-lg font-bold text-gray-900 md:text-lg">
            Sub Admin Details
          </h1>
          <nav className="mb-2 flex" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2">
              <li>
                <div className="flex items-center">
                  <Link
                    to="/admin/sub-admins"
                    className="text-sm font-medium text-gray-500 hover:text-gray-700"
                  >
                    Sub Admin
                  </Link>
                </div>
              </li>
              <li>
                <div className="flex items-center">
                  <svg
                    className="h-5 w-5 flex-shrink-0 text-gray-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="ml-2 text-sm font-medium text-gray-900">
                    {subAdmin.currentRouteName}{" "}
                    {/* Dynamic name from actual sub admin */}
                  </span>
                </div>
              </li>
            </ol>
          </nav>
        </div>
        <button
          onClick={handleDeactivate}
          className="mt-4 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-red-600 shadow-sm transition-colors hover:bg-red-50 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:outline-none md:mt-0"
        >
          <ExclamationCircleIcon
            className="mr-2 h-5 w-5 text-red-400"
            aria-hidden="true"
          />
          Deactivate
        </button>
      </div>

      {/* Profile Card */}
      <div className="rounded border border-gray-200">
        <div className="relative flex flex-col items-start space-y-6 rounded-lg bg-white p-6 lg:flex-row lg:items-center lg:space-y-0 lg:space-x-6 lg:p-4">
          <img
            className="mx-auto h-24 w-24 shrink-0 rounded object-cover pr-2 lg:mx-0"
            src={getImageUrl(subAdmin.avatar)}
            alt={subAdmin.name}
          />
          <div className="flex-1 text-center lg:text-left">
            <h2 className="mb-3 text-xl font-bold text-gray-900 md:text-2xl">
              {subAdmin.name}
            </h2>
            <div className="grid grid-cols-1 gap-x-6 gap-y-3 md:grid-cols-2">
              <div className="flex items-center space-x-2">
                <EnvelopeIcon className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-700">{subAdmin.email}</span>
              </div>
              <div className="flex items-center space-x-2">
                <CalendarDaysIcon className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-700">
                  Date Joined: {subAdmin.dateJoined}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <PhoneIcon className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-700">
                  {subAdmin.phoneNumber}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <UsersIcon className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-700">
                  Roles: {subAdmin.roles.join(", ")}
                </span>
              </div>
            </div>
          </div>
          <span className="inline-flex self-center rounded-full bg-emerald-100 px-2 py-0.5 text-xs leading-5 font-semibold text-emerald-800 lg:absolute lg:top-8 lg:right-8 lg:self-auto">
            {subAdmin.status}
          </span>
        </div>

        {/* Recent Activity Section */}
        <div className="mt-8">
          <h2 className="mb-2 text-lg font-semibold text-gray-900">
            Recent Activity
          </h2>
          <div className="space-y-2">
            {recentActivities.map((activity) => (
              <div
                key={activity.id}
                className="flex flex-col justify-between space-y-3 rounded-lg bg-white p-4 md:flex-row md:items-center md:space-y-0 md:space-x-4"
              >
                <div className="flex flex-1 items-center space-x-3">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-500">
                    <activity.icon className="h-5 w-5" />
                  </div>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium text-gray-900">
                      {activity.type}
                    </span>{" "}
                    <br className="md:hidden" /> {activity.description}
                  </p>
                </div>
                <div className="ml-auto flex shrink-0 flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-3">
                  <button
                    onClick={() =>
                      handleActivityAction(activity.action1, activity.id)
                    }
                    className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 focus:outline-none"
                  >
                    {activity.action1}
                  </button>
                  <button
                    onClick={() =>
                      handleActivityAction(activity.action2, activity.id)
                    }
                    className="inline-flex items-center justify-center rounded-md border border-transparent bg-gray-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-gray-800 focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 focus:outline-none"
                  >
                    {activity.action2}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubAdminDetails;
