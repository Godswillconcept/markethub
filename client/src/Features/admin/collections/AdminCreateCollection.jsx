import { useState, useMemo } from "react";

export default function AdminCreateCollection({ onClose }) {
  // form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [startDateTime, setStartDateTime] = useState("");
  const [endDateTime, setEndDateTime] = useState("");
  const [query, setQuery] = useState("");

  // sample products (in a real app these come from an API)
  const initialProducts = useMemo(
    () => [
      {
        id: 1,
        title: "Floral Summer Dress",
        brand: "TrendyWear",
        price: "₦12,000",
        img: null,
      },
      {
        id: 2,
        title: "Floral Summer Dress",
        brand: "TrendyWear",
        price: "₦12,000",
        img: null,
      },
      {
        id: 3,
        title: "Floral Summer Dress",
        brand: "TrendyWear",
        price: "₦12,000",
        img: null,
      },
      {
        id: 4,
        title: "Floral Summer Dress",
        brand: "TrendyWear",
        price: "₦12,000",
        img: null,
      },
    ],
    [],
  );

  const [products, setProducts] = useState(initialProducts);

  // derived state
  const filteredProducts = useMemo(() => {
    if (!query.trim()) return products;
    const q = query.toLowerCase();
    return products.filter(
      (p) =>
        p.title.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q),
    );
  }, [products, query]);

  // handlers
  function handleFile(e) {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    if (f.size > 4 * 1024 * 1024) {
      alert("File too large — maximum is 4 MB.");
      return;
    }
    const url = URL.createObjectURL(f);
    setImagePreview(url);
  }

  function removeProduct(id) {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }

  function handleCreate() {
    // Basic validation
    if (!name.trim()) return alert("Please enter a collection name.");
    // assemble payload
    const payload = {
      name: name.trim(),
      description: description.trim(),
      startDateTime: startDateTime || null,
      endDateTime: endDateTime || null,
      products: products.map((p) => p.id),
    };
    console.log("Create payload:", payload);
    alert("Collection created (demo) — check console for payload.");
  }

  // UI note: this component is meant to be mounted as an overlay/modal.
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm transition-opacity duration-300"
      onClick={onClose}
    >
      <main
        className="relative h-[90vh] w-full max-w-3xl scale-100 transform overflow-hidden rounded bg-white opacity-100 shadow-sm transition-all duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
          aria-label="Close modal"
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
        <div className="flex h-full flex-col overflow-hidden">
          {/* Header */}
          <div className="border-gray-200 bg-white px-6 py-2">
            <h1 className="text-center text-xl font-semibold text-gray-900">
              Create New Collection
            </h1>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-6 md:p-8">
            <form
              className="flex flex-1 flex-col overflow-hidden"
              onSubmit={(e) => e.preventDefault()}
            >
              <div className="space-y-4 overflow-auto pr-2">
                {/* Collection Name */}
                <div>
                  <label
                    htmlFor="name"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Collection Name
                  </label>
                  <input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={`E.g.,"Summer Essentials"`}
                    className="block w-full rounded-md border border-gray-200 px-4 py-3 shadow-sm placeholder:text-slate-400"
                  />
                </div>

                {/* Description */}
                <div>
                  <label
                    htmlFor="desc"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Description
                  </label>
                  <textarea
                    id="desc"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Brief summary of what the collection is about, its purpose, or theme."
                    rows={3}
                    className="placeholder:text-slate-400focus:outline-none block w-full resize-none rounded-md border border-gray-200 px-4 shadow focus:ring-slate-300"
                  />
                </div>

                {/* Upload box */}
                <div>
                  <p className="mb-2 text-sm text-slate-700">Upload Image</p>
                  <label
                    htmlFor="image"
                    className="group block cursor-pointer rounded-xl border border-gray-200 bg-gray-50/80 p-6 text-center hover:border-gray-300"
                  >
                    <div className="mx-auto mb-3 flex h-24 w-24 items-center justify-center rounded-lg bg-gray-100">
                      {/* simple placeholder icon */}
                      {imagePreview ? (
                        <img
                          src={imagePreview}
                          alt="preview"
                          className="h-full w-full rounded-md object-cover"
                        />
                      ) : (
                        <svg
                          width="48"
                          height="48"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <rect
                            x="3"
                            y="3"
                            width="18"
                            height="14"
                            rx="2"
                            stroke="#9CA3AF"
                            strokeWidth="1.2"
                          />
                          <circle
                            cx="8.5"
                            cy="7.5"
                            r="1"
                            stroke="#9CA3AF"
                            strokeWidth="1.2"
                          />
                          <path
                            d="M21 17l-5-5-5 5"
                            stroke="#9CA3AF"
                            strokeWidth="1.2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </div>
                    <div className="text-sm text-slate-500">
                      Click to browse (4 mb max)
                    </div>
                    <input
                      id="image"
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={handleFile}
                    />
                  </label>
                </div>

                {/* Date/time fields */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Start Date & Time
                    </label>
                    <input
                      type="datetime-local"
                      value={startDateTime}
                      onChange={(e) => setStartDateTime(e.target.value)}
                      className="w-full rounded-md border border-gray-200 px-4 py-3 shadow placeholder:text-slate-400 focus:ring-1 focus:ring-slate-300 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      End Date & Time
                    </label>
                    <input
                      type="datetime-local"
                      value={endDateTime}
                      onChange={(e) => setEndDateTime(e.target.value)}
                      className="w-full rounded-md border border-gray-200 px-4 py-3 shadow placeholder:text-slate-400 focus:ring-2 focus:ring-slate-300 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Products in collection */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Products in Collection
                  </label>
                  <div className="relative">
                    <input
                      placeholder="Search Product"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      className="w-full rounded-md border border-gray-200 px-10 py-3 shadow placeholder:text-slate-400 focus:ring-2 focus:ring-slate-300 focus:outline-none"
                    />
                    <div className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400">
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M21 21l-4.35-4.35"
                          stroke="#9CA3AF"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <circle
                          cx="11"
                          cy="11"
                          r="6"
                          stroke="#9CA3AF"
                          strokeWidth="1.5"
                        />
                      </svg>
                    </div>
                  </div>

                  <div className="mt-4 max-h-56 overflow-auto rounded-lg border border-gray-100">
                    {filteredProducts.length === 0 ? (
                      <div className="p-6 text-sm text-slate-500">
                        No products found.
                      </div>
                    ) : (
                      filteredProducts.map((p) => (
                        <div
                          key={p.id}
                          className="flex items-center justify-between px-4 py-3 hover:bg-gray-50"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-gray-200">
                              {/* product thumb (placeholder) */}
                              <svg
                                width="36"
                                height="36"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <rect
                                  x="3"
                                  y="3"
                                  width="18"
                                  height="14"
                                  rx="2"
                                  stroke="#D1D5DB"
                                  strokeWidth="1.2"
                                />
                              </svg>
                            </div>
                            <div>
                              <div className="text-sm font-medium text-slate-900">
                                {p.title}
                              </div>
                              <div className="text-xs text-slate-400">
                                {p.brand} · {p.price}
                              </div>
                            </div>
                          </div>

                          <div>
                            <button
                              type="button"
                              onClick={() => removeProduct(p.id)}
                              className="inline-flex items-center rounded-md bg-black px-3 py-1 text-sm font-medium text-white shadow-sm hover:opacity-90 focus:ring-2 focus:ring-black focus:ring-offset-2 focus:outline-none"
                              aria-label={`Remove ${p.title}`}
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Footer Create button - sticky on small screens */}
              <div className="mt-6 flex-none">
                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={handleCreate}
                    className="inline-flex justify-center rounded-md border border-transparent bg-black px-4 py-2 text-sm font-medium text-white shadow focus:ring-2 focus:ring-offset-2 focus:outline-none"
                  >
                    Create Collection
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
