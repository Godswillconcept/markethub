import { useState } from "react";
import { Upload } from "lucide-react";
import MDEditor from "@uiw/react-md-editor";

const AdminCreateJournal = ({ onClose }) => {
  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [tags, setTags] = useState("");
  const [category, setCategory] = useState("");
  const [content, setContent] = useState("");
  const [featuredImage, setFeaturedImage] = useState(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFeaturedImage({
        file,
        url: URL.createObjectURL(file),
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = {
      title,
      caption,
      tags: tags.split(",").map((tag) => tag.trim()),
      category,
      content,
      featuredImage,
    };
    console.log("New Journal Entry:", formData);
    alert("Journal created successfully!");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 py-8 backdrop-blur-sm">
      <div className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="mb-6 text-center text-xl font-semibold">
          Create New Journal
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Blog Title */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Blog Title
            </label>
            <input
              type="text"
              placeholder="Enter the title of your blog post"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-black focus:outline-none"
            />
          </div>

          {/* Caption */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Caption
            </label>
            <input
              type="text"
              placeholder="Caption your blog"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-black focus:outline-none"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Tags
            </label>
            <input
              type="text"
              placeholder="Add tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-black focus:outline-none"
            />
            <p className="mt-1 text-xs text-gray-400">
              Separate tags with commas
            </p>
          </div>

          {/* Category */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-black focus:outline-none"
            >
              <option value="">Select category</option>
              <option value="tech">Tech</option>
              <option value="design">Design</option>
              <option value="business">Business</option>
            </select>
          </div>

          {/* Content Body */}
          <div className="mt-4">
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Content Body
            </label>
            <div className="[&_.w-md-editor]:rounded-md [&_.w-md-editor]:border [&_.w-md-editor]:border-gray-300 [&_.w-md-editor]:shadow-sm">
              <MDEditor
                value={content}
                onChange={setContent}
                preview="edit"
                height={200}
                data-color-mode="light"
                placeholder="Start typing your content here..."
              />
            </div>
            <div className="mt-4 rounded-md border border-gray-200 bg-gray-50 p-4">
              <h3 className="mb-2 text-sm font-medium text-gray-700">
                Preview
              </h3>
              <MDEditor.Markdown
                source={content}
                style={{ whiteSpace: "pre-wrap" }}
              />
            </div>
          </div>

          {/* Featured Image */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Featured Image
            </label>
            <label className="relative flex h-40 cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed border-gray-300 transition hover:border-black">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              {featuredImage ? (
                <img
                  src={featuredImage.url}
                  alt="Preview"
                  className="h-full w-full rounded-md object-cover"
                />
              ) : (
                <div className="text-center text-gray-500">
                  <Upload className="mx-auto mb-2" size={36} />
                  <p className="text-sm">
                    Click to upload or drag and drop
                    <br />
                    <span className="text-xs text-gray-400">
                      (5MB max, image files only)
                    </span>
                  </p>
                </div>
              )}
            </label>
          </div>

          {/* Publish Button */}
          <button
            type="submit"
            className="w-full rounded-md bg-black py-3 text-white transition hover:bg-gray-800"
          >
            Publish
          </button>
        </form>

        {/* Close Button */}
        {onClose && (
          <button
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

export default AdminCreateJournal;
