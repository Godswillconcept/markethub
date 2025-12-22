import { useState } from "react";
import Footer from "../../ui/Footer.jsx";
import GlideSlider from "../../ui/GlideSlider.jsx";
import Header from "../../ui/Header.jsx";
import VendorRegistrationForm from "./VendorRegistrationForm.jsx";

const Vendor = () => {
  const [showForm, setShowForm] = useState(false);

  const toggleForm = () => {
    setShowForm(!showForm);
  };
  return (
    <div className="min-h-screen overflow-hidden bg-white">
      {/* Navigation Header */}
      <Header />

      {/* Hero Section */}
      <section className="relative px-4 pt-20 pb-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="mb-4 text-4xl leading-tight font-bold text-gray-900 sm:text-5xl lg:text-4xl">
            Sell Smarter. Stylay Does the Heavy Lifting.
          </h1>

          <p className="text-md mx-auto max-w-3xl leading-relaxed font-bold text-gray-600 sm:text-xl">
            Join Stylay's trusted network of fashion vendors, we handle your
            product uploads, presentation, and promotions, so you can focus on
            growing your business.
          </p>
        </div>
      </section>

      {/* Fashion Gallery Section */}

      <section className="py-12">
        <GlideSlider />
        <div className="mt-12 text-center">
          <button
            onClick={toggleForm}
            className="rounded-md bg-black px-8 py-3 text-lg font-semibold text-white transition-colors duration-200 hover:bg-gray-800"
          >
            {showForm ? "Thank You" : "Join Us"}
          </button>
        </div>
        {showForm && (
          <div className="mx-auto mt-10">
            <VendorRegistrationForm />
          </div>
        )}
      </section>
      <section>
        <Footer />
      </section>
    </div>
  );
};

export default Vendor;
