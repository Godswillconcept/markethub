import { Link } from "react-router";

function Hero() {
  return (
    // Use a light off-white background and add padding for the fixed navbar
    <section className="relative bg-[#F9F7F6] pt-4 pb-20 lg:h-[500px] lg:pt-32 lg:pb-32">
      <div className="mx-auto max-w-7xl px-6">
        {/* Text Content Container - centered and with a max-width */}
        <div className="relative z-10 mx-auto max-w-[700px] text-center">
          <h1 className="text-[45px] font-medium tracking-tight text-neutral-900">
            Stylay: Where Trust Meets Variety
          </h1>
          <p className="mt-6 text-lg font-medium text-neutral-700 sm:text-xl">
            Shop Everything You Love in One Place. <br />
            From fashion to electronics, Stylay brings Nigeria’s best sellers to
            your doorstep.
          </p>
          <div className="mt-10">
            <Link
              to="/products"
              className="inline-block rounded-xl bg-black px-10 py-4 text-xl font-semibold text-white shadow-sm hover:bg-neutral-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
            >
              Shop Now
            </Link>
          </div>
        </div>

        {/* Desktop: Right-side Image and Sparkles Container (Absolutely Positioned) */}
        <div className="pointer-events-none absolute top-16 right-0 bottom-0 hidden w-1/2 lg:block">
          <div className="relative h-full w-full">
            <img
              src="/HeroImage.png"
              alt="Stylay hero model"
              className="absolute right-0 bottom-0 h-full max-h-[650px] w-auto object-contain"
            />
          </div>
        </div>

        {/* Mobile: Image and Sparkles Container (In-flow) */}
        <div className="relative mt-16 lg:hidden">
          <img
            src="/HeroImage.png"
            alt="Stylay hero model"
            className="relative z-10 mx-auto w-full max-w-xs object-contain"
          />
        </div>
      </div>
    </section>
  );
}

export default Hero;
