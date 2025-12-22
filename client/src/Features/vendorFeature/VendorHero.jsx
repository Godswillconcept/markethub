function VendorHero() {
  return (
    <section className="bg-[#F9F7F6] pt-5 lg:pt-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid min-h-[70vh] grid-cols-1 items-center gap-12 lg:grid-cols-2">
          {/* Left Content */}
          <div className="space-y-8">
            <h1 className="text-3xl leading-tight font-bold text-gray-900 sm:text-4xl lg:text-6xl">
              TOP NIGERIAN <br /> DESIGNERS
            </h1>

            <div className="space-y-4">
              <p className="text-lg font-semibold text-gray-900 lg:text-2xl">
                Shop Everything You Love in One Place
              </p>
              <p className="max-w-lg text-base leading-relaxed text-gray-700 lg:text-xl">
                From fashion to electronics, Stylay brings Nigeria's best
                Sellers to your doorstep.
              </p>
            </div>
          </div>

          {/* Right Image */}
          <div className="hidden justify-center lg:flex">
            <div className="w-full max-w-md">
              <img
                src="/HeroImage.png"
                alt="Model in green dress"
                className="h-auto w-full rounded-2xl object-contain"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default VendorHero;
