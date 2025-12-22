function AuthImage() {
  return (
    <div className="relative h-full w-full">
      <img
        src="/authImage.jpg"
        alt="Auth visual"
        className="h-full w-full object-cover"
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, rgba(16, 25, 40, 0.6), rgba(16, 25, 40, 0))",
        }}
      />
      <div className="absolute bottom-6 mx-6 max-w-lg rounded-md border border-gray-500 bg-black/60 px-6 py-4 text-neutral-300 shadow-lg">
        <p className="text-md leading-relaxed">
          Discover fashion that fits your vibe, from trusted vendors to emerging
          brands, Stylay brings style, variety, and convenience straight to your
          fingertips.
        </p>
      </div>
    </div>
  );
}

export default AuthImage;
