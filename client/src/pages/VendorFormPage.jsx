import { useState } from "react";
import VendorRegistrationForm from "../Features/vendorFeature/VendorRegistrationForm.jsx";
import Footer from "../ui/Footer.jsx";
import GlideSlider from "../ui/GlideSlider.jsx";
import Header from "../ui/Header.jsx";

export default function VendorFormPage() {
  const [showForm, setShowForm] = useState(false);

  const toggleForm = () => {
    setShowForm(!showForm);
  };
  return (
    <div>
      <Header />
      <section className="bg-white py-8 text-center md:py-10">
        <div className="mx-auto max-w-3xl px-4">
          <h1 className="mb-4 text-2xl leading-tight font-semibold text-black md:text-3xl">
            Sell Smarter. Stylay Does the Heavy Lifting.
          </h1>

          <p className="md:text-md text-base leading-relaxed text-black">
            Join Stylay’s trusted network of fashion vendors, we handle your
            product uploads, presentation, and promotions, so you can focus on
            growing your business.
          </p>
        </div>
      </section>
      <GlideSlider />
      <button
        onClick={toggleForm}
        className="mx-auto mt-5 mb-5 block rounded-lg bg-black px-6 py-3 text-center text-white transition-all duration-200 hover:bg-gray-900"
      >
        {showForm ? "Thank You" : "Join Us"}
      </button>
      {showForm && <VendorRegistrationForm />}
      <Footer />
    </div>
  );
}
