import { useState } from "react";
import { X, Image as ImageIcon } from "lucide-react";

const ReplyFeedback = ({ onClose }) => {
  const [message, setMessage] = useState("");
  const [images, setImages] = useState([]);

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));

    // Limit to 4 images
    const combined = [...images, ...newImages].slice(0, 4);
    setImages(combined);
  };

  const handleRemoveImage = (index) => {
    const filtered = images.filter((_, i) => i !== index);
    setImages(filtered);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      message,
      images: images.map((img) => img.file),
    };
    console.log("Feedback reply:", payload);
    alert("Feedback submitted!");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-3xl rounded-2xl bg-white p-8 shadow-xl">
        <h2 className="mb-6 text-center text-xl font-semibold">
          Reply Feedback
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Response Message */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Response Message
            </label>
            <input
              type="text"
              placeholder='E.g. "Hi Jane, thank you for your feedback. We’re actively resolving this and will update you shortly."'
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-black focus:outline-none"
            />
          </div>

          {/* Upload Image */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Upload Image
            </label>

            <div className="flex items-start gap-4">
              {/* Drop Zone */}
              <label className="flex h-48 w-full cursor-pointer flex-col items-center justify-center rounded-md border border-gray-300 transition hover:border-black">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <div className="flex flex-col items-center text-gray-500">
                  <ImageIcon size={48} className="mb-2 opacity-70" />
                  <span className="text-sm">Click to browse (4 mb max)</span>
                </div>
              </label>

              {/* Image Preview List */}
              <div className="flex flex-col gap-3">
                {images.map((img, index) => (
                  <div
                    key={index}
                    className="relative h-16 w-16 overflow-hidden rounded-md border border-gray-200"
                  >
                    <img
                      src={img.url}
                      alt={`upload-${index}`}
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute top-1 right-1 rounded-full bg-white p-0.5 shadow hover:bg-gray-100"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full rounded-md bg-black py-3 text-white transition hover:bg-gray-800"
          >
            Submit
          </button>
        </form>

        {/* Close Button */}
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
};

export default ReplyFeedback;
