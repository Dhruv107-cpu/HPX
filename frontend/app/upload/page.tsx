"use client";

import AppLayout from "@/components/layout/AppLayout";
import { useState, useRef } from "react";

import API from "@/services/api"; // Adjust the path if your api.ts is elsewhere

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  // Clear file selection cleanly
  const handleClearFile = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Prevents triggering the file picker click event bubble
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Reset HTML input element state cache
    }
  };
const handleUpload = async () => {
  if (!file) {
    alert("Please select a file first.");
    return;
  }

  setUploading(true);

  try {
    const formData = new FormData();
    formData.append("files", file);

    const response = await API.post(
      "/analytics/upload",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    alert(response.data.message || "File uploaded successfully!");

    setFile(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  } catch (error: any) {
    console.error(error);

    alert(
      error?.response?.data?.detail ||
      "Upload failed."
    );
  } finally {
    setUploading(false);
  }
};

  return (
    <AppLayout>
      {/* MODIFIED: Width layout modified to max-w-[96%] with tight internal padding (p-2) to make side margins less and equal to upper margins */}
      <div className="max-w-[96%] mx-auto max-h-[calc(100vh-120px)] overflow-y-auto p-2">

        <h1 className="text-3xl font-bold mb-2">
          Upload Dataset
        </h1>

        <p className="text-gray-500 mb-8">
          Upload trade datasets for analysis
        </p>

        <div className="bg-white rounded-xl shadow-md p-8">

          <label
            htmlFor="fileUpload"
            className="border-2 border-dashed border-blue-400 rounded-xl p-12 flex flex-col items-center justify-center cursor-pointer hover:bg-blue-50 transition"
          >
            <div className="text-6xl mb-4">
              📁
            </div>

            <h2 className="text-xl font-semibold">
              Drag & Drop Dataset
            </h2>

            <p className="text-gray-500 mt-2">
              or click to browse
            </p>

            <p className="text-sm text-gray-400 mt-3">
              Supported Formats: CSV, XLSX
            </p>

            <input
              id="fileUpload"
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept=".csv, .xlsx, .xls"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </label>

          {/* Flex container with close icon button element to deselect files */}
          {file && (
            <div className="mt-6 bg-green-50 border border-green-300 rounded-lg p-4 flex items-center justify-between animate-fadeIn">
              <div className="text-sm text-gray-700">
                Selected File:
                <strong className="ml-2 text-green-800 break-all">
                  {file.name}
                </strong>
              </div>
              <button
                type="button"
                onClick={handleClearFile}
                className="ml-4 p-1 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition font-bold text-xl leading-none cursor-pointer"
                title="Deselect file"
              >
                &times;
              </button>
            </div>
          )}

          <button 
            onClick={handleUpload}
            disabled={!file || uploading}
            
            className={`mt-6 text-white px-6 py-3 rounded-lg font-medium transition shadow-sm ${
              file 
                ? "bg-[#005BAC] hover:bg-blue-700 cursor-pointer" 
                : "bg-gray-300 cursor-not-allowed"
            }`}
          >
            Upload Dataset
          </button>

        </div>

      </div>
    </AppLayout>
  );
}