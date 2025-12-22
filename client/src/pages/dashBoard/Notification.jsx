import { useState } from "react";
import ToggleField from "./ToggleField.jsx";
import ProfileInput from "./ProfileInput.jsx";

function Notification() {
  const [email, setEmail] = useState("Abdulrahman.m@gmail.com");
  const [password, setPassword] = useState("");
  const [notifications, setNotifications] = useState({
    deals: true,
    sales: false,
    recommendations: false,
    updates: true,
    maintenance: false,
  });

  const toggleNotification = (key) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="mx-auto max-w-4xl rounded-2xl bg-white p-6 shadow-sm">
      {/* Header */}
      <h2 className="text-xl font-semibold text-gray-900">
        Email & Notification
      </h2>
      <p className="mb-6 text-sm text-gray-600">
        Manage email and notification settings
      </p>

      {/* Email Section */}
      <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        <ProfileInput label="Email Address" name="email">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-black/80 focus:outline-none"
          />
        </ProfileInput>

        <ProfileInput
          label="Enter Your Password (If Change Email Address)"
          name="password"
        >
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-black/80 focus:outline-none"
          />
        </ProfileInput>
      </div>

      <button className="mb-6 rounded-lg bg-black px-6 py-2 font-medium text-white">
        Update Email
      </button>

      <hr className="my-6" />

      {/* Notification Section */}
      <h3 className="mb-4 text-lg font-semibold text-gray-900">
        Manage Notification
      </h3>

      {/* Promotions */}
      <div className="mb-6">
        <h4 className="mb-3 text-sm font-semibold text-gray-700">
          Promotions & Offers
        </h4>
        <div className="space-y-4">
          <ToggleField
            label="Let me know about personalized deals and discounts based on my shopping activity."
            checked={notifications.deals}
            onChange={() => toggleNotification("deals")}
          />
          <ToggleField
            label="Alert me when there are upcoming sales, flash deals, or limited-time offers."
            checked={notifications.sales}
            onChange={() => toggleNotification("sales")}
          />
          <ToggleField
            label="Send me product recommendations I might like."
            checked={notifications.recommendations}
            onChange={() => toggleNotification("recommendations")}
          />
        </div>
      </div>

      {/* System Updates */}
      <div className="mb-6">
        <h4 className="mb-3 text-sm font-semibold text-gray-700">
          System & App Updates
        </h4>
        <div className="space-y-4">
          <ToggleField
            label="Notify me when there are new features or updates to the website or app."
            checked={notifications.updates}
            onChange={() => toggleNotification("updates")}
          />
          <ToggleField
            label="Let me know when there's scheduled downtime or service maintenance."
            checked={notifications.maintenance}
            onChange={() => toggleNotification("maintenance")}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 flex justify-end space-x-4">
        <button className="rounded-lg border border-gray-300 px-6 py-2 font-medium">
          Cancel
        </button>
        <button className="rounded-lg bg-black px-6 py-2 font-medium text-white">
          Save Changes
        </button>
      </div>
    </div>
  );
}

export default Notification;
