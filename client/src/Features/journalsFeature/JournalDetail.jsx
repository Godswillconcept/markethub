import { ChevronLeft, Calendar, Eye, Tag } from "lucide-react";
import { useBlogDetail } from "./useBlogDetail.js";
import { useNavigate } from "react-router";

function JournalDetail() {
  const { blog, isLoading, error } = useBlogDetail();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-gray-300 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Loading article...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="max-w-md px-4 text-center">
          <p className="text-lg font-medium text-red-600">
            Error loading article
          </p>
          <p className="mt-2 text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <p className="text-gray-600">No article found</p>
      </div>
    );
  }

  // Parse featured images if they exist
  const featuredImages = blog.featured_images
    ? typeof blog.featured_images === "string"
      ? JSON.parse(blog.featured_images)
      : blog.featured_images
    : [];

  // Parse tags if they exist
  const tags = blog.tags
    ? typeof blog.tags === "string"
      ? JSON.parse(blog.tags)
      : blog.tags
    : [];

  // Format date
  const formattedDate = blog.created_at
    ? new Date(blog.created_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  // Split content into paragraphs
  const paragraphs = blog.content
    ? blog.content.split("\n\n").filter((p) => p.trim())
    : [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Navigation Header */}
      <div className="sticky top-0 z-10 border-b border-gray-100 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto max-w-4xl px-4 py-4 sm:px-6 lg:px-8">
          <button
            onClick={() => navigate("/journals")}
            className="group flex items-center text-sm font-medium text-gray-600 transition-colors duration-200 hover:text-gray-900"
          >
            <ChevronLeft className="mr-1 h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back to Articles
          </button>
        </div>
      </div>

      {/* Article Container */}
      <article className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Article Header */}
        <header className="mb-8">
          {/* Category Badge */}
          {blog.category && (
            <div className="mb-4">
              <span className="inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                {blog.category}
              </span>
            </div>
          )}

          {/* Title */}
          <h1 className="mb-6 text-3xl leading-tight font-bold text-gray-900 sm:text-4xl lg:text-5xl">
            {blog.title}
          </h1>

          {/* Excerpt */}
          {blog.excerpt && (
            <p className="mb-6 text-xl leading-relaxed text-gray-600">
              {blog.excerpt}
            </p>
          )}

          {/* Meta Information */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
            {formattedDate && (
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                <time dateTime={blog.created_at}>{formattedDate}</time>
              </div>
            )}
            {blog.view_count !== undefined && (
              <div className="flex items-center gap-1.5">
                <Eye className="h-4 w-4" />
                <span>{blog.view_count.toLocaleString()} views</span>
              </div>
            )}
          </div>
        </header>

        {/* Featured Image */}
        {featuredImages.length > 0 && (
          <div className="relative mb-12 overflow-hidden rounded-2xl shadow-2xl">
            <div className="flex aspect-[16/9] items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300">
              <div className="text-center text-gray-500">
                <svg
                  className="mx-auto mb-2 h-16 w-16"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <p className="text-sm">{featuredImages[0]}</p>
              </div>
            </div>
          </div>
        )}

        {/* Article Content */}
        <div className="prose prose-lg prose-gray max-w-none">
          {paragraphs.map((paragraph, index) => (
            <p
              key={index}
              className="mb-6 text-lg leading-relaxed text-gray-700"
            >
              {paragraph}
            </p>
          ))}
        </div>

        {/* Tags Section */}
        {tags.length > 0 && (
          <div className="mt-12 border-t border-gray-200 pt-8">
            <div className="flex items-start gap-3">
              <Tag className="mt-1 h-5 w-5 flex-shrink-0 text-gray-400" />
              <div className="flex flex-wrap gap-2">
                {tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-block cursor-pointer rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Additional Images */}
        {featuredImages.length > 1 && (
          <div className="mt-12 grid grid-cols-2 gap-4">
            {featuredImages.slice(1).map((image, index) => (
              <div
                key={index}
                className="flex aspect-video items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-gray-200 to-gray-300 shadow-lg"
              >
                <div className="text-center text-gray-500">
                  <svg
                    className="mx-auto mb-2 h-12 w-12"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <p className="text-xs">{image}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Share Section */}
        <div className="mt-12 border-t border-gray-200 pt-8">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Last updated:{" "}
              {blog.updated_at
                ? new Date(blog.updated_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : "N/A"}
            </p>
            <button className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800">
              Share Article
            </button>
          </div>
        </div>
      </article>
    </div>
  );
}

export default JournalDetail;
