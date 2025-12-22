// src/pages/Collection.jsx
import { useMemo, useState } from "react";
import {
  PencilSquareIcon,
  TrashIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
// import CollectionDetail from "./CollectionDetail";
import Pagination from "../Pagination.jsx";
import { Link } from "react-router";
import AdminFilterBar from "../AdminFilterBar.jsx";
import AdminCreateCollection from "./AdminCreateCollection.jsx";
import { collectionsData } from "../../../data/Product.js";
import Table from "../Table.jsx";

const headers = [
  { key: "name", label: "Collection Name", className: "w-62" },
  { key: "createdOn", label: "Created On", className: "w-42" },
  { key: "productsCount", label: "Products", className: "w-60" },
  { key: "price", label: "Price", className: "w-42" },
  { key: "category", label: "Category", className: "w-32" },
  { key: "action", label: "Action", className: "w-28" },
];

const AdminProductCollection = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    category: "All",
    vendor: "All",
    active: "All",
  });

  const filterConfig = [
    {
      key: "category",
      label: "Category",
      options: ["All", "Electronics", "Fashion", "Digital Product", "Mobile"],
    },
    {
      key: "vendor",
      label: "Vendor",
      options: ["All"],
    },
    {
      key: "active",
      label: "Active",
      options: ["All", "Active", "Inactive"],
    },
  ];

  const itemsPerPage = 7;
  const totalItems = collectionsData.length;

  const handleFilterChange = (filterName, value) => {
    setFilters((prev) => ({ ...prev, [filterName]: value }));
  };

  const handleResetFilters = () => {
    setFilters({
      category: "All",
      vendor: "All",
      active: "All",
    });
    setSearchTerm("");
  };

  const filteredCollections = useMemo(() => {
    return collectionsData.filter((collection) => {
      const matchesSearch = collection.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesCategory =
        filters.category === "All" || collection.category === filters.category;
      // Add more filter conditions as needed
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, filters]);

  const handleCreateNewClick = () => {
    setShowCreateForm(true);
  };

  const handleCloseCreateForm = () => {
    setShowCreateForm(false);
  };

  const renderCollectionRow = (collection) => {
    return [
      <td key="name" className="px-6 py-4 text-sm font-medium text-gray-900">
        <Link to={`/admin/collections/${collection.id}`}>{collection.name}</Link>
      </td>,
      <td key="createdOn" className="px-6 py-4 text-center text-sm">
        {collection.createdOn}
      </td>,
      <td
        key="productsCount"
        className="px-6 py-4 text-center text-sm text-gray-500"
      >
        {collection.productsCount}
      </td>,
      <td key="price" className="px-6 py-4 text-sm text-gray-500">
        {collection.price}
      </td>,
      <td key="product" className="px-6 py-4 text-sm font-medium text-gray-900">
        {collection.category}
      </td>,
      <td key="action" className="px-6 py-4">
        <div className="flex items-center space-x-3">
          <button className="text-gray-500 hover:text-gray-700">
            <PencilSquareIcon className="h-5 w-5" />
          </button>
          <button className="text-red-500 hover:text-red-700">
            <TrashIcon className="h-5 w-5" />
          </button>
        </div>
      </td>,
    ];
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {showCreateForm && (
        <AdminCreateCollection onClose={handleCloseCreateForm} />
      )}
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Collections</h1>
          <button
            onClick={handleCreateNewClick}
            className="inline-flex items-center gap-2 rounded-md bg-black px-4 py-2 text-sm font-medium text-white"
          >
            <PlusIcon className="h-5 w-5" />
            Create New Collection
          </button>
        </div>

        <AdminFilterBar
          filters={filters}
          filterConfig={filterConfig}
          onFilterChange={handleFilterChange}
          onSearch={searchTerm}
          onSearchChange={setSearchTerm}
          onResetFilters={handleResetFilters}
          searchPlaceholder="Search collections..."
        />

        {/* Collections Table */}

        <div className="overflow-x-auto">
          <Table
            headers={headers}
            data={filteredCollections}
            renderRow={renderCollectionRow}
            className="rounded-lg bg-white p-6 shadow"
          />
        </div>

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          className="mt-4"
        />
      </div>
    </div>
  );
};

export default AdminProductCollection;
