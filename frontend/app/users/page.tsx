"use client";

import { useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { mockUserList } from "@/data/mockUserList";

import {
  FaEdit,
  FaTrash,
  FaPlus,
} from "react-icons/fa";

export default function UsersPage() {
  const [users, setUsers] = useState(mockUserList);
  const [search, setSearch] = useState("");

  const [showModal, setShowModal] =
    useState(false);

  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    role: "USER",
  });

  const deleteUser = (id: string) => {
    setUsers(
      users.filter((u) => u.id !== id)
    );
  };

  const addUser = () => {
    if (
      !newUser.name ||
      !newUser.email
    )
      return;

    const user = {
      id: String(users.length + 1),
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
    };

    setUsers([...users, user]);

    setNewUser({
      name: "",
      email: "",
      role: "USER",
    });

    setShowModal(false);
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      user.email
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      user.role
        .toLowerCase()
        .includes(search.toLowerCase())
  );

  return (
    <AppLayout>
      <div className="bg-white rounded-xl shadow-md p-6">

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">
            User Management
          </h1>

          <button
            onClick={() =>
              setShowModal(true)
            }
            className="flex items-center gap-2 bg-[#005BAC] text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <FaPlus />
            Add User
          </button>
        </div>

        <div className="mb-5">
          <input
            type="text"
            placeholder="🔍 Search users..."
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
            className="border rounded-lg px-4 py-2 w-80 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-3 text-left">
                ID
              </th>
              <th className="p-3 text-left">
                Name
              </th>
              <th className="p-3 text-left">
                Email
              </th>
              <th className="p-3 text-left">
                Role
              </th>
              <th className="p-3 text-center">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {filteredUsers.map(
              (user) => (
                <tr
                  key={user.id}
                  className="border-b hover:bg-gray-50"
                >
                  <td className="p-3">
                    {user.id}
                  </td>

                  <td className="p-3">
                    {user.name}
                  </td>

                  <td className="p-3">
                    {user.email}
                  </td>

                  <td className="p-3">
                    <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-sm">
                      {user.role}
                    </span>
                  </td>

                  <td className="p-3">
                    <div className="flex justify-center gap-4">

                      <button className="text-blue-600 hover:text-blue-800">
                        <FaEdit />
                      </button>

                      <button
                        onClick={() =>
                          deleteUser(
                            user.id
                          )
                        }
                        className="text-red-600 hover:text-red-800"
                      >
                        <FaTrash />
                      </button>

                    </div>
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>

      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

          <div className="bg-white rounded-xl p-6 w-96 shadow-xl">

            <h2 className="text-2xl font-bold mb-4">
              Add User
            </h2>

            <div className="space-y-4">

              <input
                type="text"
                placeholder="Name"
                value={newUser.name}
                onChange={(e) =>
                  setNewUser({
                    ...newUser,
                    name: e.target.value,
                  })
                }
                className="w-full border rounded-lg p-3"
              />

              <input
                type="email"
                placeholder="Email"
                value={newUser.email}
                onChange={(e) =>
                  setNewUser({
                    ...newUser,
                    email:
                      e.target.value,
                  })
                }
                className="w-full border rounded-lg p-3"
              />

              <select
                value={newUser.role}
                onChange={(e) =>
                  setNewUser({
                    ...newUser,
                    role:
                      e.target.value,
                  })
                }
                className="w-full border rounded-lg p-3"
              >
                <option>
                  USER
                </option>

                <option>
                  ADMIN
                </option>

                <option>
                  SUPERADMIN
                </option>
              </select>

              <div className="flex justify-end gap-3">

                <button
                  onClick={() =>
                    setShowModal(
                      false
                    )
                  }
                  className="px-4 py-2 border rounded-lg"
                >
                  Cancel
                </button>

                <button
                  onClick={addUser}
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