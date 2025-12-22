import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { FiUpload, FiLoader } from "react-icons/fi";
import ProfileInput from "../../pages/dashBoard/ProfileInput.jsx";
import { useSupport } from "./useSupport.js";

function Support() {
  const { sendFeedback, isSending } = useSupport();
  const [file, setFile] = useState(null);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm();

  const issueType = watch("issue_type");

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const onSubmit = (data) => {
    const formData = new FormData();
    formData.append("subject", data.subject);

    // Conditional Order Number
    if (data.issue_type !== "other" && data.order_number) {
      formData.append("order_number", data.order_number);
    }

    formData.append("issue_type", data.issue_type);
    formData.append("description", data.description);
    formData.append("preferred_support_method", data.preferred_support_method);
    formData.append("contact_email", data.contact_email); // Backend expects 'contact_email' for both email and phone based on user snippet provided (or logic should handle which field, but snippet shows contact_email example)
    // Actually snippet says 'contact_email', but UI says 'Contact Email / Phone'.
    // I will stick to the snippet key `contact_email` but pass the value from the input.

    if (file) {
      formData.append("attachments", file);
    }

    sendFeedback(formData, {
      onSuccess: () => {
        reset();
        setFile(null);
      },
    });
  };

  return (
    <div className="mx-auto bg-white p-6">
      {/* Header */}
      <h2 className="text-xl font-semibold text-gray-900">Support</h2>
      <p className="mt-1 text-sm text-gray-600">
        Follow the steps below and fill the required fields
      </p>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2"
      >
        {/* Subject */}
        <div className="sm:col-span-2">
          <ProfileInput
            label="Subject"
            name="subject"
            error={errors.subject?.message}
          >
            <input
              type="text"
              id="subject"
              placeholder="e.g., Issue with recent order"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:ring-black"
              {...register("subject", { required: "Subject is required" })}
            />
          </ProfileInput>
        </div>

        {/* Category / Issue Type */}
        <ProfileInput
          label="Category / Issue Type"
          name="issue_type"
          error={errors.issue_type?.message}
        >
          <select
            id="issue_type"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:border-black focus:ring-black"
            {...register("issue_type", {
              required: "Please select an issue type",
            })}
          >
            <option value="">Select issue type</option>
            <option value="Order Not Delivered">Order not delivered</option>
            <option value="Wrong Item Received">Wrong item received</option>
            <option value="Payment Issue">Payment issue</option>
            <option value="Return Request">Return request</option>
            <option value="Refund Request">Return/Refund request</option>
            <option value="Account Issue">Account issue</option>
            <option value="Technical Problem">Technical problem</option>
            <option value="other">Other</option>
          </select>
        </ProfileInput>

        {/* Order Number - Conditional */}
        {issueType && issueType !== "other" && (
          <ProfileInput
            label="Order Number"
            name="order_number"
            error={errors.order_number?.message}
          >
            <input
              type="text"
              id="order_number"
              placeholder="e.g., #12345678"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:ring-black"
              {...register("order_number", {
                required: "Order number is required for this issue type",
              })}
            />
          </ProfileInput>
        )}

        {/* Description */}
        <div className="sm:col-span-2">
          <ProfileInput
            label="Description / Message"
            name="description"
            error={errors.description?.message}
          >
            <textarea
              id="description"
              rows={4}
              placeholder="Describe your issue in detail..."
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:ring-black"
              {...register("description", {
                required: "Description is required",
              })}
            />
          </ProfileInput>
        </div>

        {/* Preferred Contact Method */}
        <ProfileInput
          label="Preferred Contact Method"
          name="preferred_support_method"
        >
          <select
            id="preferred_support_method"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:ring-black"
            {...register("preferred_support_method")}
          >
            <option value="Email">Email</option>
            <option value="Phone">Phone</option>
          </select>
        </ProfileInput>

        {/* Contact Email / Phone */}
        <ProfileInput
          label="Contact Email / Phone"
          name="contact_email"
          error={errors.contact_email?.message}
        >
          <input
            type="text"
            id="contact_email"
            placeholder="e.g., johndoe@example.com or +1 555 987 6543"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:ring-black"
            {...register("contact_email", {
              required: "Contact info is required",
            })}
          />
        </ProfileInput>

        {/* File Upload */}
        <div className="sm:col-span-2">
          <ProfileInput label="File" name="file">
            <label
              htmlFor="fileUpload"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className="flex w-full cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-gray-300 px-6 py-10 text-center text-sm text-gray-600 transition-colors hover:border-black hover:text-black"
            >
              <FiUpload className="mb-2 h-6 w-6 text-gray-400" />
              {file ? (
                <span className="text-gray-800">{file.name}</span>
              ) : (
                <>
                  <span className="font-medium">Drag & drop file here</span>
                  <span className="mt-1 text-xs text-gray-500">
                    PNG, JPEG, and PDF. Maximum size is 5 MB
                  </span>
                  <span className="mt-3 inline-block rounded-md border border-gray-300 bg-white px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-50">
                    Upload File
                  </span>
                </>
              )}
              <input
                id="fileUpload"
                type="file"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
          </ProfileInput>
        </div>

        {/* Footer Buttons */}
        <div className="mt-6 flex justify-end gap-3 sm:col-span-2">
          <Link
            to="/settings"
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSending}
            className="flex items-center justify-center rounded-md bg-black px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800 focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:opacity-50"
          >
            {isSending ? (
              <>
                <FiLoader className="mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              "Submit Message"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default Support;
