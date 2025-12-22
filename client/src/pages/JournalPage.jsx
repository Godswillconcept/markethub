import { useSearchParams } from "react-router-dom";
import { useBlogs } from "../Features/journalsFeature/useBlogs.js";
import Header from "../ui/Header.jsx";
import Footer from "../ui/Footer.jsx";
import JournalGrid from "../Features/journalsFeature/JournalGrid.jsx";
import Pagination from "../ui/Pagination.jsx";
import { PAGE_SIZE } from "../utils/constants.js";
import Spinner from "../ui/Spinner.jsx";

function JournalPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = Number(searchParams.get("page")) || 1;

  const { blogs, total, isLoading } = useBlogs(currentPage);

  const handlePageChange = (page) => {
    searchParams.set("page", page);
    setSearchParams(searchParams);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-12 md:px-8 lg:px-16">
        <h1 className="mb-8 text-3xl font-bold text-gray-900 md:text-4xl">
          Journal
        </h1>

        {isLoading ? (
          <Spinner />
        ) : (
          <>
            <JournalGrid journals={blogs} />

            <div className="mt-12">
              <Pagination count={total || 0} />
            </div>
          </>
        )}
      </main>
      <Footer />
    </>
  );
}

export default JournalPage;
