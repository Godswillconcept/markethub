import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

<<<<<<<< HEAD:src/Features/productFeature/WomenPage.jsx
import { products, journalEntries } from "../../data/Product.js";
import ProductSet from "../../ui/ProductSet.jsx";
import JournalCard from "../journalsFeature/JournalCard.jsx";
========

import ProductSet from "../../ui/ProductSet.jsx";
import JournalCard from "../../Features/journalsFeature/JournalCard.jsx";
import { useProductsByCategory } from "./useProductByCategory.js";
import { useSearchParams } from "react-router";
import Pagination from "../../ui/Pagination.jsx";
import { journalEntries } from "../../data/Product.js";
>>>>>>>> e9886a266a378b88d7583f91611d681c35bafebc:src/Features/productFeatures/WomenPage.jsx

function WomenPage() {
  const [searchParams] = useSearchParams();
  const page = Number(searchParams.get("page")) || 1;

  const { products, pagination } = useProductsByCategory(page);

  return (
    <>
      <section>
        <h1 className="mb-5 text-center text-2xl font-bold">Women</h1>
        {/* <ProductGrid products={products} /> */}
        <ProductSet products={products} title="" columns={4} />
        <Pagination count={pagination.total} />
      </section>

      {/* Journals Section */}
      <section className="m-4 mt-12 rounded-2xl border border-neutral-200 bg-white p-6 shadow-md">
        <h2 className="text-xl font-bold text-neutral-800">Journals</h2>
        <div className="mt-6 grid grid-cols-1 gap-6 border-t border-neutral-200 pt-10 sm:grid-cols-2 lg:grid-cols-3">
          {journalEntries.map((journal) => (
            <JournalCard key={journal.id} journal={journal} />
          ))}
        </div>
      </section>
    </>
  );
}

export default WomenPage;
