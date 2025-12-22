import JournalCard from "../Features/journalsFeature/JournalCard.jsx";
import JournalGrid from "../Features/journalsFeature/JournalGrid.jsx";
import ProductCard from "./ProductCard.jsx";
import ProductSet from "./ProductSet.jsx";
import { journalEntries } from "../data/Product.js";
import { useBlogs } from "../Features/journalsFeature/useBlogs.js";

function FeaturedSection({ trendingProducts }) {
  const { blogs, isLoading } = useBlogs();
  const landingBlog = blogs?.slice(0, 4)
  return (
    <div className="bg-neutral-100 p-2 sm:p-4">
      {/* Decorative Border */}
      <div className="rounded-2xl p-1 shadow">
        <div className="rounded-[14px] bg-white py-5">
          {/* Trending Now Section */}
          <section>
            <ProductSet
              title="TRENDING NOW"
              products={trendingProducts}
              showViewMore
              onViewMore={() => { }}
            />

          </section>


          <section className="mt-5 mb-5 rounded border border-neutral-200 p-4 shadow-2xl">
            <h2 className="text-grey-700 mb-5 border-b border-neutral-200 pb-4 text-2xl font-medium">
              Journal
            </h2>
            <JournalGrid journals={landingBlog} />
          </section>
        </div>
      </div>
    </div>
  );
}

export default FeaturedSection;
