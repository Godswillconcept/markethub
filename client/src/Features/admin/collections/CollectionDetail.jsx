import CollectionDetailHeader from "./CollectionDetailHeader.jsx";
import CollectionImageUploader from "./CollectionImageUploader.jsx";
import CollectionDetailsCard from "./CollectionDetailsCard.jsx";
import CollectionStatsGrid from "./CollectionStatsGrid.jsx";
import CollectionDetailsTable from "./CollectionDetailsTable.jsx";

const CollectionDetail = () => {
  // Mock Data (replace with actual data fetching in a real app)
  const collectionData = {
    title: "Summer Essentials",
    createdOn: "July 15, 2025",
    lastUpdated: "July 15, 2025",
    description:
      "Curated lightweight outfits and accessories perfect for the summer season.",
    status: "Active",
    imageUrl:
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2000&q=80",
  };

  const summaryStats = [
    {
      title: "Total Products",
      value: "48",
      trend: "8.5% Up from last month",
      isPositive: true,
    },
    {
      title: "Total Sales from Collection",
      value: "₦350,000",
      trend: "1.3% Up from past week",
      isPositive: true,
    },
    {
      title: "Most Viewed Product",
      value: "Floral Summer Dress",
      trend: "1240 Views",
      isPositive: true,
    }, // Not really a trend, but a stat
    {
      title: "Best Selling Product",
      value: "Men's Linen Shirt",
      trend: "95 sold",
      isPositive: true,
    }, // Not really a trend, but a stat
  ];

  const products = [
    {
      id: 1,
      name: "Ankara Flare Gown",
      vendor: "TrendyWear",
      stock: 23,
      price: "₦115,000",
      quantity: 1,
    },
    {
      id: 2,
      name: "Men's Native Set",
      vendor: "GentleFit",
      stock: 26,
      price: "₦115,000",
      quantity: 2,
    },
    {
      id: 3,
      name: "Classic Loafers",
      vendor: "FootStyle",
      stock: 12,
      price: "₦115,000",
      quantity: 3,
    },
    // Add more mock products
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      {/* Max width for content container */}
      <CollectionDetailHeader /> {/* This specific page header */}
      <CollectionImageUploader imageUrl={collectionData.imageUrl} />
      <CollectionDetailsCard data={collectionData} />
      <CollectionStatsGrid stats={summaryStats} />
      <CollectionDetailsTable products={products} />
    </div>
  );
};

export default CollectionDetail;
