import { Link, useSearchParams, useNavigate } from "react-router-dom";
import Table from "../Table";
import Pagination from "../Pagination";
import { useState } from "react";
import { HiOutlineDotsHorizontal } from "react-icons/hi";
import CreateSubAdmin from "./CreateSubAdmin";
import { useSubAdmin, useDeactivateSubAdmin } from "./useSubAdmin";
import { PAGE_SIZE } from "../../../utils/constants";
import Spinner from "../../../ui/Spinner";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";

const headers = [
  { key: "name", label: "Name", className: "min-w-[200px]" },
  { key: "email", label: "Email", className: "w-32" },
  { key: "role", label: "Role", className: "w-42" },
  { key: "phone", label: "Phone", className: "w-42" },
  { key: "status", label: "Status", className: "w-28" },
  { key: "action", label: "Action", className: "w-16" },
];

function SubAdmin() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [subAdminToEdit, setSubAdminToEdit] = useState(null);
  const { isLoading, subAdmins, count } = useSubAdmin();
  const { deactivateSubAdminApi, isDeactivating } = useDeactivateSubAdmin();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = !searchParams.get("page")
    ? 1
    : Number(searchParams.get("page"));

  if (isLoading) return <Spinner />;

  const setCurrentPage = (page) => {
    searchParams.set("page", page.toString());
    setSearchParams(searchParams);
  };

  const handleEdit = (subAdmin) => {
    setSubAdminToEdit(subAdmin);
    setIsModalOpen(true);
  };

  const handleDeactivate = (id) => {
    if (window.confirm("Are you sure you want to deactivate this sub-admin?")) {
      deactivateSubAdminApi(id);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSubAdminToEdit(null);
  };

  // Render each row in the table
  const renderSubAdminRow = (subAdmin) => [
    <td key="name" className="px-6 py-4 text-sm font-medium text-gray-900">
      {subAdmin.first_name} {subAdmin.last_name}
    </td>,
    <td key="email" className="px-6 py-4 text-sm text-gray-500">
      {subAdmin.email}
    </td>,
    <td key="role" className="px-6 py-4 text-sm text-gray-500">
      {subAdmin.roles[0]?.name}
    </td>,
    <td key="phone" className="px-6 py-4 text-sm font-medium text-gray-900">
      {subAdmin.phone}
    </td>,
    <td key="status" className="px-6 py-4">
      <span
        className={`inline-flex rounded px-2 py-1 text-xs leading-5 font-semibold ${subAdmin.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
      >
        {subAdmin.is_active ? "Active" : "Inactive"}
      </span>
    </td>,
    <td key="action" className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
      <Menu>
        <MenuButton className="px-4 py-2 text-sm font-medium">
          <HiOutlineDotsHorizontal />
        </MenuButton>
        <MenuItems
          anchor="bottom end"
          className="z-50 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none"
        >
          <div className="py-1">
            <MenuItem>
              <Link
                to={`/admin/sub-admins/${subAdmin.id}`}
                className="block w-full px-4 py-2 text-left text-sm text-gray-700 data-[focus]:bg-gray-100"
              >
                View
              </Link>
            </MenuItem>
            <MenuItem>
              <button
                onClick={() => handleEdit(subAdmin)}
                className="block w-full px-4 py-2 text-left text-sm text-gray-700 data-[focus]:bg-gray-100"
              >
                Edit
              </button>
            </MenuItem>
            <MenuItem>
              <button
                onClick={() => handleDeactivate(subAdmin.id)}
                disabled={isDeactivating}
                className="block w-full px-4 py-2 text-left text-sm text-gray-700 data-[focus]:bg-gray-100"
              >
                {isDeactivating ? "Deactivating..." : "Deactivate"}
              </button>
            </MenuItem>
          </div>
        </MenuItems>
      </Menu>
    </td>,
  ];

  return (
    <>
      <div className="min-h-screen p-4 sm:p-6 md:p-8 lg:p-2">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-4 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Sub-Admins</h1>
            <button
              className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white"
              onClick={() => {
                setSubAdminToEdit(null);
                setIsModalOpen(true);
              }}
            >
              Create New Sub Admin
            </button>
          </div>

          {/* Vendors Table */}
          <div className="mt-2">
            <Table
              headers={headers}
              data={subAdmins}
              renderRow={renderSubAdminRow}
              className="rounded-lg bg-white"
              theadClassName="bg-gray-50"
              onRowClick={(subAdmin) =>
                navigate(`/admin/sub-admins/${subAdmin.id}`)
              }
            />
          </div>

          {/* Pagination */}
          <Pagination
            totalItems={count}
            itemsPerPage={PAGE_SIZE}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>
      {isModalOpen && (
        <CreateSubAdmin
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          subAdminToEdit={subAdminToEdit}
        />
      )}
    </>
  );
}

export default SubAdmin;
