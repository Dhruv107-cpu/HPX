"use client";

import AppLayout from "@/components/layout/AppLayout";
import { useState } from "react";

export default function UploadPage() {
  const [fileName, setFileName] = useState("");

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto">

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
              className="hidden"
              onChange={(e) =>
                setFileName(
                  e.target.files?.[0]?.name || ""
                )
              }
            />
          </label>

          {fileName && (
            <div className="mt-6 bg-green-50 border border-green-300 rounded-lg p-4">
              Selected File:
              <strong className="ml-2">
                {fileName}
              </strong>
            </div>
          )}

          <button className="mt-6 bg-[#005BAC] text-white px-6 py-3 rounded-lg hover:bg-blue-700">
            Upload Dataset
          </button>

        </div>

      </div>
    </AppLayout>
  );
}