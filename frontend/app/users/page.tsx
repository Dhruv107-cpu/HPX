"use client";

import { useEffect, useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import {
  getUsers,
  createUser,
  deleteUser,
} from "@/services/userService";
import type { ApiUserListItem } from "@/types/user";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";

export default function UsersPage() {
  const [users, setUsers] = useState<ApiUserListItem[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [newUser, setNewUser] = useState({
    email_id: "",
    password: "",
  });

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await getUsers();
      setUsers(response.data);
    } catch {
      setError("Failed to load users. You may not have permission.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await deleteUser(id);
      await loadUsers();
    } catch {
      setError("Failed to deactivate user.");
    }
  };

  const handleAddUser = async () => {
    if (!newUser.email_id || !newUser.password) return;

    try {
      await createUser({
        email_id: newUser.email_id,
        password: newUser.password,
      });

      setNewUser({ email_id: "", password: "" });
      setShowModal(false);
      await loadUsers();
    } catch {
      setError("Failed to create user.");
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.email_id.toLowerCase().includes(search.toLowerCase()) ||
      user.role.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppLayout>
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">User Management</h1>

          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-[#005BAC] text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <FaPlus />
            Add User
          </button>
        </div>

        {error && (
          <p className="mb-4 text-red-600 text-sm">{error}</p>
        )}

        <div className="mb-5">
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border rounded-lg px-4 py-2 w-80 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {loading ? (
          <p className="text-gray-500">Loading users...</p>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-3 text-left">ID</th>
                <th className="p-3 text-left">Email</th>
                <th className="p-3 text-left">Role</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-b hover:bg-gray-50">
                  <td className="p-3 text-sm text-gray-600">
                    {user.id.slice(0, 8)}...
                  </td>
                  <td className="p-3">{user.email_id}</td>
                  <td className="p-3">
                    <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-sm">
                      {user.role}
                    </span>
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded-full text-sm ${
                        user.is_active
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {user.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex justify-center gap-4">
                      <button className="text-blue-600 hover:text-blue-800">
                        <FaEdit />
                      </button>

                      <button
                        onClick={() => handleDelete(user.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-96 shadow-xl">
            <h2 className="text-2xl font-bold mb-4">Add User</h2>

            <div className="space-y-4">
              <input
                type="email"
                placeholder="Email"
                value={newUser.email_id}
                onChange={(e) =>
                  setNewUser({ ...newUser, email_id: e.target.value })
                }
                className="w-full border rounded-lg p-3"
              />

              <input
                type="password"
                placeholder="Password"
                value={newUser.password}
                onChange={(e) =>
                  setNewUser({ ...newUser, password: e.target.value })
                }
                className="w-full border rounded-lg p-3"
              />

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border rounded-lg"
                >
                  Cancel
                </button>

                <button
                  onClick={handleAddUser}
                  className="px-4 py-2 bg-[#005BAC] text-white rounded-lg"
                >
                  Add User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
