"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AppLayout from "@/components/layout/AppLayout";
import { updateUser } from "@/services/userService"; 
import type { ApiUser } from "@/types/user";
import axios from "axios"; 
import { FaUserEdit, FaKey, FaEnvelope, FaPhone, FaBirthdayCake, FaIdCard, FaUserTag, FaCheckCircle, FaTimesCircle } from "react-icons/fa";

interface FullUserProfile extends ApiUser {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  dob: string;
  email_id: string;
  role: string;
  is_active: boolean;
  contact_number: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<FullUserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Modals Workflows
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  // Form States
  const [editForm, setEditForm] = useState({
    first_name: "",
    last_name: "",
    dob: "",
    contact_number: "",
    email_id: ""
  });

  const [passwordForm, setPasswordForm] = useState({
    newPassword: "",
    confirmPassword: ""
  });

  const [validationError, setValidationError] = useState("");

  // Helper: Convert YYYY-MM-DD string to DD-MM-YYYY format
  const formatDateToDDMMYYYY = (dateStr: string | undefined | null): string => {
    if (!dateStr) return "-";
    if (dateStr.includes("-")) {
      const parts = dateStr.split("-");
      if (parts.length === 3 && parts[0].length === 4) {
        return `${parts[2]}-${parts[1]}-${parts[0]}`;
      }
    }
    return dateStr;
  };

  const fetchProfile = async () => {
    try {
      if (typeof window === "undefined") return;

      const token = localStorage.getItem("access_token") || localStorage.getItem("token"); 
      
      if (!token) {
        console.error("Authentication token not found in localStorage.");
        router.push("/login");
        return;
      }
      
      const response = await axios.get("http://localhost:8000/users/me", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setUser(response.data as FullUserProfile);
    } catch (err: any) {
      console.error("Profile fetch failed:", err);
      setError("Session expired or unauthorized. Redirecting...");
      setTimeout(() => {
        router.push("/login");
      }, 800);
    } finally {
      loading && setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [router]);

  const displayName = user 
    ? `${user.first_name || ""} ${user.last_name || ""}`.trim() || user.email_id?.split("@")[0]
    : "";

  const handleOpenEdit = () => {
    if (!user) return;
    setEditForm({
      first_name: user.first_name || "",
      last_name: user.last_name || "",
      dob: user.dob || "",
      contact_number: user.contact_number || "",
      email_id: user.email_id || ""
    });
    setValidationError("");
    setShowEditModal(true);
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setValidationError("");
    setSuccess("");

    if (!editForm.first_name.trim() || !editForm.last_name.trim()) {
      setValidationError("First name and Last name are required.");
      return;
    }

    try {
      await updateUser(user.id, {
        ...editForm,
        user_id: user.user_id,
        role: user.role,
        is_active: user.is_active,
        dob: editForm.dob || null, 
        contact_number: editForm.contact_number || null
      });
      setSuccess("Profile updated successfully!");
      setShowEditModal(false);
      fetchProfile();
    } catch (err: any) {
      const backendError = err?.response?.data?.detail;
      if (Array.isArray(backendError)) {
        const parsedMsgs = backendError.map((e: any) => {
          const field = e.loc && e.loc.length > 1 ? e.loc[1] : "Field";
          return `${field}: ${e.msg}`;
        });
        setValidationError(parsedMsgs.join(" | "));
      } else if (typeof backendError === "string") {
        setValidationError(backendError);
      } else {
        setValidationError("Failed to update profile changes.");
      }
    }
  };

  const handlePasswordChange = async () => {
    if (!user) return;
    setValidationError("");
    setSuccess("");

    if (passwordForm.newPassword.length < 8) {
      setValidationError("Password must be at least 8 characters long.");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setValidationError("Passwords do not match.");
      return;
    }

    try {
      await updateUser(user.id, {
        first_name: user.first_name,
        last_name: user.last_name,
        dob: user.dob || null,
        user_id: user.user_id,
        contact_number: user.contact_number || null,
        email_id: user.email_id,
        role: user.role,
        is_active: user.is_active,
        password: passwordForm.newPassword
      });
      setSuccess("Password updated successfully!");
      setShowPasswordModal(false);
      setPasswordForm({ newPassword: "", confirmPassword: "" });
    } catch (err: any) {
      const backendError = err?.response?.data?.detail;
      if (Array.isArray(backendError)) {
        const parsedMsgs = backendError.map((e: any) => {
          const field = e.loc && e.loc.length > 1 ? e.loc[1] : "Field";
          return `${field}: ${e.msg}`;
        });
        setValidationError(parsedMsgs.join(" | "));
      } else if (typeof backendError === "string") {
        setValidationError(backendError);
      } else {
        setValidationError("Failed to alter password credentials.");
      }
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex justify-center items-center h-[60vh]">
          <p className="text-gray-500 animate-pulse">Loading profile information...</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-[96%] mx-auto max-h-[calc(100vh-120px)] overflow-y-auto p-2">
        
        {error && <div className="mb-4 bg-red-100 text-red-600 p-3 rounded-lg text-sm">{error}</div>}
        {success && <div className="mb-4 bg-green-100 text-green-600 p-3 rounded-lg text-sm">{success}</div>}

        <div className="bg-white rounded-xl shadow-md p-8">
          {/* Header Card Area */}
          <div className="flex items-center gap-6 mb-8 border-b pb-6">
            <div className="w-24 h-24 rounded-full bg-[#005BAC] text-white flex items-center justify-center text-4xl font-bold uppercase shadow-inner">
              {displayName.charAt(0)}
            </div>

            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-800 capitalize">{displayName}</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="bg-blue-50 text-blue-700 px-3 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider">
                  {user?.role}
                </span>
                <span className={`flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full font-medium ${
                  user?.is_active ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                }`}>
                  {user?.is_active ? <FaCheckCircle /> : <FaTimesCircle />}
                  {user?.is_active ? "Active Account" : "Inactive Account"}
                </span>
              </div>
            </div>
          </div>

          {/* Account Information Details Grid */}
          <h3 className="text-lg font-bold text-gray-700 mb-4">Account Information Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-xl border mb-8">
            <div className="flex items-start gap-3">
              <FaIdCard className="text-gray-400 mt-1.5 text-lg" />
              <div>
                <label className="text-xs text-gray-400 block uppercase tracking-wider font-semibold">User Unique ID</label>
                <p className="font-mono text-sm text-gray-800 mt-0.5">{user?.user_id || "-"}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <FaEnvelope className="text-gray-400 mt-1.5 text-lg" />
              <div>
                <label className="text-xs text-gray-400 block uppercase tracking-wider font-semibold">Email Identifier</label>
                <p className="text-sm text-gray-800 mt-0.5">{user?.email_id || "-"}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <FaPhone className="text-gray-400 mt-1.5 text-lg" />
              <div>
                <label className="text-xs text-gray-400 block uppercase tracking-wider font-semibold">Contact Number</label>
                <p className="text-sm text-gray-800 mt-0.5">{user?.contact_number || "-"}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <FaBirthdayCake className="text-gray-400 mt-1.5 text-lg" />
              <div>
                <label className="text-xs text-gray-400 block uppercase tracking-wider font-semibold">Date of Birth</label>
                <p className="text-sm text-gray-800 mt-0.5">{formatDateToDDMMYYYY(user?.dob)}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <FaUserTag className="text-gray-400 mt-1.5 text-lg" />
              <div>
                <label className="text-xs text-gray-400 block uppercase tracking-wider font-semibold">System Permission Role</label>
                <p className="text-sm text-gray-800 mt-0.5 font-medium">{user?.role || "-"}</p>
              </div>
            </div>
          </div>

          {/* Core Feature Access Triggers */}
          {/* MODIFIED: Implemented relative wrappers and group tooltips onto actions block */}
          <div className="flex gap-4 border-t pt-6">
            
            {/* Edit Profile Action Item */}
            <div className="relative group">
              <button 
                onClick={handleOpenEdit}
                className="flex items-center gap-2 bg-[#005BAC] text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition cursor-pointer font-medium text-sm shadow-sm"
              >
                <FaUserEdit /> Edit Profile
              </button>
              {/* Tooltip Display Box */}
              <div className="absolute top-[-45px] left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs rounded py-1.5 px-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-md whitespace-nowrap z-10">
                Modify your personal information details.
                <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-800 rotate-45"></div>
              </div>
            </div>

            {/* Change Password Action Item */}
            <div className="relative group">
              <button 
                onClick={() => { setValidationError(""); setShowPasswordModal(true); }}
                className="flex items-center gap-2 border border-gray-300 text-gray-700 px-5 py-2.5 rounded-lg hover:bg-gray-50 transition cursor-pointer font-medium text-sm shadow-sm"
              >
                <FaKey /> Change Password
              </button>
              {/* Tooltip Display Box */}
              <div className="absolute top-[-45px] left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs rounded py-1.5 px-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-md whitespace-nowrap z-10">
                Update your account security credentials.
                <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-800 rotate-45"></div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Edit Profile Modal Context */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-xl w-full max-w-xl shadow-xl">
            <h2 className="text-xl font-bold mb-4 border-b pb-2">Edit Profile - {user?.user_id}</h2>
            
            {validationError && (
              <div className="bg-red-50 text-red-600 p-2.5 rounded-lg text-xs mb-3 font-medium border border-red-100">
                {validationError}
              </div>
            )}
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">First Name</label>
                  <input
                    type="text"
                    value={editForm.first_name}
                    onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })}
                    className="w-full border p-2 text-sm rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Last Name</label>
                  <input
                    type="text"
                    value={editForm.last_name}
                    onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })}
                    className="w-full border p-2 text-sm rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Contact Number</label>
                <input
                  type="text"
                  value={editForm.contact_number}
                  onChange={(e) => setEditForm({ ...editForm, contact_number: e.target.value })}
                  className="w-full border p-2 text-sm rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Date Of Birth</label>
                <input
                  type="date"
                  value={editForm.dob}
                  onChange={(e) => setEditForm({ ...editForm, dob: e.target.value })}
                  className="w-full border p-2 text-sm rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Email ID</label>
                <input
                  type="email"
                  value={editForm.email_id}
                  onChange={(e) => setEditForm({ ...editForm, email_id: e.target.value })}
                  className="w-full border p-2 text-sm rounded-lg"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="border px-4 py-2 text-sm rounded-lg cursor-pointer hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveProfile}
                className="bg-[#005BAC] text-white px-5 py-2 text-sm rounded-lg cursor-pointer hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Password Modal Context */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-xl">
            <h2 className="text-xl font-bold mb-4 border-b pb-2">Change Password</h2>
            
            {validationError && (
              <div className="bg-red-50 text-red-600 p-2.5 rounded-lg text-xs mb-3 font-medium border border-red-100">
                {validationError}
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">New System Password</label>
                <input
                  type="password"
                  placeholder="Minimum 8 characters"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  className="w-full border p-2 text-sm rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  placeholder="Re-type your password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  className="w-full border p-2 text-sm rounded-lg"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
              <button
                type="button"
                onClick={() => {
                  setShowPasswordModal(false);
                  setPasswordForm({ newPassword: "", confirmPassword: "" });
                }}
                className="border px-4 py-2 text-sm rounded-lg cursor-pointer hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handlePasswordChange}
                className="bg-[#005BAC] text-white px-5 py-2 text-sm rounded-lg cursor-pointer hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}