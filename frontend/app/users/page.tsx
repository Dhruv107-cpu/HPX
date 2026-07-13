"use client";

import { useEffect, useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { getUsers, createUser, updateUser, deleteUser } from "@/services/userService";
import { formatISTDateTime } from "@/utils/dateTime";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";

interface ExtendedUserListItem {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  dob: string;
  email_id: string;
  role: string;
  is_active: boolean;
  contact_number: string;
  created_at?: string;
}

const INITIAL_USER_STATE = {
  first_name: "",
  last_name: "",
  dob: "",
  email_id: "",
  user_id: "",
  contact_number: "",
  password: "",
  role: "USER",
  is_active: true
};

const INITIAL_VALIDATION_ERRORS = {
  first_name: "",
  last_name: "",
  dob: "",
  email_id: "",
  user_id: "",
  contact_number: "",
  password: ""
};

type UserFormFields = keyof typeof INITIAL_USER_STATE;

export default function UsersPage() {
  const [users, setUsers] = useState<ExtendedUserListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [selectedDate, setSelectedDate] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage, setUsersPerPage] = useState(5);

  // Modal Workflow Handles
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newUser, setNewUser] = useState({ ...INITIAL_USER_STATE });
  const [validationErrors, setValidationErrors] = useState({ ...INITIAL_VALIDATION_ERRORS });

  const loadUsers = async (isInitial = false) => {
    try {
      if (isInitial) setLoading(true);
      const response = await getUsers();
      const rawData = Array.isArray(response) ? response : response?.data || [];
      setUsers(rawData as ExtendedUserListItem[]);
      setError(""); 
    } catch {
      setError("Failed to load users. You may not have permission.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers(true);
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, roleFilter, selectedDate]);

  const resetModalState = () => {
    setNewUser({ ...INITIAL_USER_STATE });
    setValidationErrors({ ...INITIAL_VALIDATION_ERRORS });
  };

  const handleEditClick = (user: ExtendedUserListItem) => {
    setIsEditMode(true);
    setEditingId(user.id);
    setValidationErrors({ ...INITIAL_VALIDATION_ERRORS });
    
    setNewUser({
      first_name: user.first_name || "",
      last_name: user.last_name || "",
      dob: user.dob || "",
      email_id: user.email_id || "",
      user_id: user.user_id || "",
      contact_number: user.contact_number || "",
      password: "UNCHANGED_PLACEHOLDER", 
      role: user.role || "USER",
      is_active: user.is_active !== undefined ? user.is_active : true
    });
    setShowModal(true);
  };

  const handleDelete = async (user: ExtendedUserListItem) => {
    // Mentor Update: Showing custom confirmation popup dynamically containing UserID
    if (!window.confirm(`Are you sure you want to delete ${user.user_id}?`)) return;
    try {
      await deleteUser(user.id);
      await loadUsers(false);
    } catch {
      setError("Failed to delete user.");
    }
  };

  const handleInputChange = (field: UserFormFields, value: string | boolean) => {
    setNewUser((prev) => ({ ...prev, [field]: value }));
    if (field in validationErrors) {
      setValidationErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleSaveUser = async () => {
    const errors = { ...INITIAL_VALIDATION_ERRORS };
    let hasErrors = false;

    const nameRegex = /^[A-Za-z ]+$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[6-9]\d{9}$/;

    if (!newUser.first_name?.trim()) { errors.first_name = "First name is required"; hasErrors = true; }
    else if (!nameRegex.test(newUser.first_name)) { errors.first_name = "Only letters are allowed"; hasErrors = true; }

    if (!newUser.last_name?.trim()) { errors.last_name = "Last name is required"; hasErrors = true; }
    else if (!nameRegex.test(newUser.last_name)) { errors.last_name = "Only letters are allowed"; hasErrors = true; }

    if (!newUser.dob) { errors.dob = "Date of Birth is required"; hasErrors = true; }
    if (!newUser.user_id?.trim()) { errors.user_id = "User ID is required"; hasErrors = true; }

    if (!newUser.email_id?.trim()) { errors.email_id = "Email is required"; hasErrors = true; }
    else if (!emailRegex.test(newUser.email_id)) { errors.email_id = "Please enter a valid email"; hasErrors = true; }

    if (!newUser.contact_number?.trim()) { errors.contact_number = "Phone number is required"; hasErrors = true; }
    else if (!phoneRegex.test(newUser.contact_number)) { errors.contact_number = "Please enter a valid 10-digit phone number"; hasErrors = true; }

    if (!isEditMode) {
      if (!newUser.password?.trim()) { errors.password = "Password is required"; hasErrors = true; }
      else if (newUser.password.length < 8) { errors.password = "Password must be at least 8 characters"; hasErrors = true; }
    }

    if (hasErrors) {
      setValidationErrors(errors);
      return;
    }

    try {
      if (isEditMode && editingId) {
        await updateUser(editingId, {
          first_name: newUser.first_name,
          last_name: newUser.last_name,
          dob: newUser.dob,
          user_id: newUser.user_id,
          contact_number: newUser.contact_number,
          email_id: newUser.email_id,
          role: newUser.role,
          is_active: newUser.is_active
        });
      } else {
        await createUser(newUser);
      }

      await loadUsers(false);

      setSearch("");
      setStatusFilter("");
      setRoleFilter("");
      setSelectedDate("");
      setCurrentPage(1);

      setShowModal(false);
      setError("");
      setIsEditMode(false);
      setEditingId(null);
      resetModalState();
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Action processing failed configuration.");
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch = user.email_id?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = !statusFilter ? true : statusFilter === "active" ? user.is_active : !user.is_active;
    const matchesRole = !roleFilter ? true : user.role?.toUpperCase() === roleFilter.toUpperCase();
    const matchesDate = !selectedDate ? true : user.created_at ? user.created_at.split("T")[0] === selectedDate : false;
    
    return matchesSearch && matchesStatus && matchesRole && matchesDate;
  });

  const totalUsers = users.length;
  const activeUsers = users.filter((user) => user.is_active).length;
  const inactiveUsers = users.filter((user) => !user.is_active).length;

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / usersPerPage));
  const safeCurrentPage = currentPage > totalPages ? totalPages : currentPage;
  const indexOfLastUser = safeCurrentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
    
  return (
    <AppLayout>
      {/* Container wrapper ensuring main content section scrolls smoothly while layouts remain fixed */}
      <div className="bg-white rounded-xl shadow-md p-6 max-h-[calc(100vh-120px)] overflow-y-auto text-black">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">User Management</h1>
          <button
            title="Create New User"
            onClick={() => {
              setIsEditMode(false);
              setEditingId(null);
              resetModalState();
              setShowModal(true);
            }}
            className="flex items-center gap-2 bg-[#005BAC] text-white px-4 py-2 rounded-lg hover:bg-blue-700 cursor-pointer"
          >
            <FaPlus /> Add User
          </button>
        </div>

        {error && (
          <div className="mb-5 bg-red-100 text-red-600 p-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 p-5 rounded-xl">
            <h3 className="text-gray-500">Total Users</h3>
            <p className="text-3xl font-bold text-blue-700">{totalUsers}</p>
          </div>
          <div className="bg-green-50 p-5 rounded-xl">
            <h3 className="text-gray-500">Active Users</h3>
            <p className="text-3xl font-bold text-green-700">{activeUsers}</p>
          </div>
          <div className="bg-red-50 p-5 rounded-xl">
            <h3 className="text-gray-500">Inactive Users</h3>
            <p className="text-3xl font-bold text-red-700">{inactiveUsers}</p>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
          <div className="flex flex-wrap gap-4">
            <input
              type="text"
              placeholder="Search by Email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoComplete="one-time-code"
              className="border rounded-lg px-4 py-2 w-72"
            />

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border rounded-lg px-4 py-2 cursor-pointer"
              title="Filter by Status"
            >
              <option value="">-- Select Status --</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="border rounded-lg px-4 py-2 cursor-pointer"
              title="Filter by Role"
            >
              <option value="">-- Select Role --</option>
              <option value="SUPERADMIN">SUPERADMIN</option>
              <option value="USER">USER</option>
            </select>

            <input
              type="date"
              onClick={(e) => (e.currentTarget as HTMLInputElement).showPicker?.()}
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="border rounded-lg px-4 py-2 cursor-pointer"
              title="Filter by Date"
            />
            
            <button
              title="Clear all filters and search parameters"
              onClick={() => {
                setSearch("");
                setStatusFilter("");
                setRoleFilter("");
                setSelectedDate("");
                setCurrentPage(1);
              }}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        </div>

        {/* Table View */}
        <div className="flex justify-between items-center mb-4">
          <p className="text-sm text-gray-600">
            Showing {currentUsers.length} of {filteredUsers.length} users
          </p>
        </div>

        {loading && users.length === 0 ? (
          <p className="text-gray-500">Loading users...</p>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold text-gray-700">No users found</h3>
            <p className="text-gray-500 mt-2">Try changing search or filter criteria.</p>
          </div>
        ) : (
          <>
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-3 text-left">User ID</th>
                  <th className="p-3 text-left">Name</th>
                  <th className="p-3 text-left">Email ID</th>
                  <th className="p-3 text-left">Role</th>
                  <th className="p-3 text-left">Status</th>
                  <th className="p-3 text-left">Created On</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentUsers.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-gray-50">
                    {/* Mentor Update: Font normalized matching standard column styling */}
                    <td className="p-3 text-gray-700">{user.user_id || "-"}</td>
                    <td className="p-3 capitalize">{`${user.first_name || ""} ${user.last_name || ""}`.trim() || "-"}</td>
                    <td className="p-3">{user.email_id}</td>
                    <td className="p-3">
                      <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                        {user.role}
                      </span>
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-3 py-1 rounded-full text-sm ${
                          user.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                        }`}
                      >
                        {user.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="p-3">{formatISTDateTime(user.created_at)}</td>
                    <td className="p-3">
                      <div className="flex justify-center gap-4">
                        <button 
                          onClick={() => handleEditClick(user)}
                          className="text-blue-600 hover:text-blue-800 cursor-pointer" 
                          title="Edit User"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(user)}
                          className="text-red-600 hover:text-red-800 cursor-pointer"
                          title="Delete User"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination Controls */}
            <div className="flex justify-between items-center mt-8">
              <div className="flex items-center gap-2">
                <span className="text-sm">Show</span>
                <select
                  value={usersPerPage}
                  onChange={(e) => {
                    setUsersPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="border rounded-lg px-3 py-2 cursor-pointer"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <span className="text-sm">users per page</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  title="Previous Page"
                  disabled={safeCurrentPage <= 1}
                  onClick={() => setCurrentPage(safeCurrentPage - 1)}
                  className="px-3 py-2 border rounded-lg disabled:opacity-50 cursor-pointer"
                >
                  {"<"}
                </button>

                {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                  <button
                    key={page}
                    title={`Go to Page ${page}`}
                    onClick={() => setCurrentPage(page)}
                    className={`px-4 py-2 rounded-lg border cursor-pointer ${
                      safeCurrentPage === page ? "bg-[#005BAC] text-white" : "bg-white"
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  title="Next Page"
                  disabled={safeCurrentPage >= totalPages}
                  onClick={() => setCurrentPage(safeCurrentPage + 1)}
                  className="px-3 py-2 border rounded-lg disabled:opacity-50 cursor-pointer"
                >
                  {">"}
                </button>
              </div>
            </div>
          </>
        )}

        {/* Add / Edit User Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <form 
              autoComplete="off"
              onSubmit={(e) => e.preventDefault()}
              className="bg-white p-6 rounded-xl w-full max-w-4xl shadow-xl max-h-[90vh] overflow-y-auto"
            >
              {/* Mentor Update: Displays dynamic 'Edit User - userId' at the top */}
              <h2 className="text-2xl font-bold mb-6 border-b pb-2">
                {isEditMode ? `Edit User - ${newUser.user_id}` : "Add User"}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
                {/* Mentor Update: Moved User ID to become the first field column */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">User ID</label>
                  <input
                    type="text"
                    placeholder="User ID"
                    value={newUser.user_id}
                    onChange={(e) => handleInputChange("user_id", e.target.value)}
                    disabled={isEditMode} // Mentor Update: Non-editable in edit workflow
                    className={`w-full border p-2 text-sm rounded-lg ${isEditMode ? "bg-gray-100 text-gray-500 cursor-not-allowed" : ""}`}
                  />
                  {validationErrors.user_id && <p className="text-red-500 text-xs mt-1">{validationErrors.user_id}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input
                    type="text"
                    placeholder="First Name"
                    value={newUser.first_name}
                    onChange={(e) => handleInputChange("first_name", e.target.value)}
                    className="w-full border p-2 text-sm rounded-lg"
                  />
                  {validationErrors.first_name && <p className="text-red-500 text-xs mt-1">{validationErrors.first_name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    placeholder="Last Name"
                    value={newUser.last_name}
                    onChange={(e) => handleInputChange("last_name", e.target.value)}
                    className="w-full border p-2 text-sm rounded-lg"
                  />
                  {validationErrors.last_name && <p className="text-red-500 text-xs mt-1">{validationErrors.last_name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={newUser.dob}
                    onChange={(e) => handleInputChange("dob", e.target.value)}
                    className="w-full border p-2 text-sm rounded-lg"
                  />
                  {validationErrors.dob && <p className="text-red-500 text-xs mt-1">{validationErrors.dob}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
                  <input
                    type="text"
                    placeholder="Contact Number"
                    value={newUser.contact_number}
                    onChange={(e) => handleInputChange("contact_number", e.target.value)}
                    className="w-full border p-2 text-sm rounded-lg"
                  />
                  {validationErrors.contact_number && <p className="text-red-500 text-xs mt-1">{validationErrors.contact_number}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email ID</label>
                  <input
                    type="email"
                    placeholder="Email"
                    value={newUser.email_id}
                    onChange={(e) => handleInputChange("email_id", e.target.value)}
                    className="w-full border p-2 text-sm rounded-lg"
                  />
                  {validationErrors.email_id && <p className="text-red-500 text-xs mt-1">{validationErrors.email_id}</p>}
                </div>

                {isEditMode && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">User Authorization Role</label>
                    <select
                      value={newUser.role}
                      onChange={(e) => handleInputChange("role", e.target.value)}
                      className="w-full border p-2 text-sm rounded-lg cursor-pointer"
                    >
                      <option value="USER">USER</option>
                      <option value="SUPERADMIN">SUPERADMIN</option>
                    </select>
                  </div>
                )}

                {isEditMode && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Account Operational Status</label>
                    <select
                      value={newUser.is_active ? "true" : "false"}
                      onChange={(e) => handleInputChange("is_active", e.target.value === "true")}
                      className="w-full border p-2 text-sm rounded-lg cursor-pointer"
                    >
                      <option value="true">Active</option>
                      <option value="false">Inactive</option>
                    </select>
                  </div>
                )}

                {!isEditMode && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <input
                      type="password"
                      placeholder="Password"
                      value={newUser.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                      className="w-full border p-2 text-sm rounded-lg"
                    />
                    {validationErrors.password && <p className="text-red-500 text-xs mt-1">{validationErrors.password}</p>}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-6 mt-6 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setIsEditMode(false);
                    setEditingId(null);
                    resetModalState();
                  }}
                  className="border px-4 py-2 text-sm rounded-lg cursor-pointer hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button 
                  type="button"
                  onClick={handleSaveUser} 
                  className="bg-[#005BAC] text-white px-5 py-2 text-sm rounded-lg cursor-pointer hover:bg-blue-700"
                >
                  {/* Mentor Update: Action trigger string simplified to 'Save' */}
                  Save
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
