import PendingReviewCard from "./PendingReviewCard.jsx";

const mockReviews = [
  {
    id: "1857914812",
    title: "Adjustable Foldable Laptop & Bed Side Table - Pink",
    image: "https://picsum.photos/seed/laptop/200/200",
    delivered: "16-10-25",
    rated: false,
  },
  {
    id: "337173698",
    title: "Hair Growth Essence - Beard Oil Growth",
    image: "https://picsum.photos/seed/beard-oil/200/200",
    delivered: "21-11-19",
    rated: false,
  },
  {
    id: "352169846",
    title: "Fashion Daisies Flower Rose Gold Bracelet Wrist Watch",
    image: "https://picsum.photos/seed/bracelet/200/200",
    delivered: "09-03-18",
    rated: false,
  },
  {
    id: "462158973",
    title: "Wireless Bluetooth Headphones with Microphone",
    image: "https://picsum.photos/seed/headphones/200/200",
    delivered: "05-12-25",
    rated: false,
  },
  {
    id: "579314682",
    title: "Stainless Steel Water Bottle - 1L",
    image: "https://picsum.photos/seed/water-bottle/200/200",
    delivered: "28-11-25",
    rated: false,
  },
];

function PendingReviewsPage({ data = mockReviews }) {
  return (
    <section className="">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold">
          Pending Reviews{" "}
          <span className="text-base font-normal text-gray-500">
            ({data.length})
          </span>
        </h1>
      </header>

      <div className="space-y-4">
        {data.map((item) => (
          <PendingReviewCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}

export default PendingReviewsPage;
