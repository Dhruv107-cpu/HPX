"use client";

import { useState, useEffect } from "react";
import AppLayout from "@/components/layout/AppLayout";
import {
  getFiles,
  downloadFile
} from "@/services/fileService";
import { formatISTDate, formatISTDateTime } from "@/utils/dateTime";
import { FaDownload } from "react-icons/fa";

const regionToStateMap: Record<string, string[]> = {
  All: [],
  REGION: [],
  STATE: [],
  DGR:[],
};

export default function FilesPage() {
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState("All");
  const [selectedState, setSelectedState] = useState("All");
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    try {
      const data = await getFiles();
      setFiles(data);
    } catch (error) {
      console.error("Failed to load files", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegionChange = (region: string) => {
    setSelectedRegion(region);
    setSelectedState("All");
  };

  const filteredFiles = files.filter((file) => {
    const matchesType =
      selectedRegion === "All" || file.file_type === selectedRegion;
    return matchesType;
  });

 const handleDownloadFile = async (file: any) => {

  try {

    await downloadFile(
    file.id,
    file.file_name
);

  } catch (error) {

    console.error(error);

    alert("Failed to download file.");

  }

};

  if (loading) {
    return (
      <AppLayout>
        <div className="p-8 text-black font-medium">Loading Files...</div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-[96%] mx-auto p-2 text-black">
        
        {/* Page Top Header Section */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Uploaded Repository Files</h1>
            <p className="text-gray-500 mt-1">
              Geographic telemetry distribution: Region-wise and State-wise trade logs matrix.
            </p>
          </div>
        </div>

        {/* Filters Panel Component Box */}
        <div className="bg-white rounded-xl shadow-md p-5 mb-6 border border-gray-100 flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <span>🔍</span> Filter Views:
          </div>

          {/* Region Selector Filter */}
          <div className="flex flex-col min-w-[160px]">
            <label className="text-[11px] font-bold text-gray-500 uppercase mb-1 tracking-wider">Region Zone</label>
            <select
              value={selectedRegion}
              onChange={(e) => handleRegionChange(e.target.value)}
              className="border border-gray-300 p-2 text-xs rounded-lg focus:outline-none focus:border-[#005BAC] cursor-pointer bg-slate-50 font-medium transition-all hover:border-gray-400"
            >
              <option value="All">All Files</option>
              <option value="REGION">Region Files</option>
              <option value="STATE">State Files</option>
              <option value="DGR">DGR files</option>
            </select>
          </div>

          {/* State Selector Filter */}
          <div className="flex flex-col min-w-[160px]">
            <label className="text-[11px] font-bold text-gray-500 uppercase mb-1 tracking-wider">Territorial State</label>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              disabled={selectedRegion === "All"}
              className="border border-gray-300 p-2 text-xs rounded-lg focus:outline-none focus:border-[#005BAC] cursor-pointer bg-slate-50 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:not-disabled:border-gray-400"
            >
              <option value="All">All States</option>
              {selectedRegion !== "All" &&
                regionToStateMap[selectedRegion]?.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
            </select>
          </div>

          {/* Clear Filter Control Button Component */}
          {(selectedRegion !== "All" || selectedState !== "All") && (
            <button
              onClick={() => {
                setSelectedRegion("All");
                setSelectedState("All");
              }}
              className="px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 font-semibold rounded-lg transition-all cursor-pointer self-end"
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* Dynamic Files Metrics Overview Row Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm transition-all hover:shadow-md">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Files Evaluated</p>
            <h3 className="text-2xl font-bold mt-1 text-[#005BAC]">{filteredFiles.length}</h3>
          </div>
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm transition-all hover:shadow-md">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Filter Region Context</p>
            <h3 className="text-2xl font-bold mt-1 text-slate-800">{selectedRegion === "All" ? "All Files" : selectedRegion}</h3>
          </div>
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm transition-all hover:shadow-md">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Sub-State Selection</p>
            <h3 className="text-2xl font-bold mt-1 text-slate-800">{selectedState === "All" ? "All Locations" : selectedState}</h3>
          </div>
        </div>

        {/* Main Records Presentation Data Table */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-gray-100 text-gray-600 font-semibold text-xs uppercase tracking-wider">
                  <th className="p-4">Date</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">File Name</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Active</th>
                  <th className="p-4">Created By</th>
                  <th className="p-4">Created On</th>
                  <th className="p-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {filteredFiles.length > 0 ? (
                  filteredFiles.map((file) => (
                    <tr key={file.id} className="hover:bg-slate-50/80 transition duration-150 cursor-pointer">
                      
                      {/* 1. DATE COLUMN */}
                      <td className="p-4 whitespace-nowrap font-medium text-slate-600">
                        {formatISTDate(file.created_at, "N/A")}
                      </td>

                      {/* 2. TYPE COLUMN */}
                      <td className="p-4">
                        <span className="px-2.5 py-1 text-xs rounded-md font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors">
                          {file.file_type}
                        </span>
                      </td>

                      {/* 3. FILE NAME COLUMN */}
                      <td className="p-4 font-medium text-slate-900 max-w-[220px] truncate">
                        <span className="mr-1.5">📄</span>
                        {file.file_name}
                      </td>

                      {/* 4. STATUS COLUMN */}
                      <td className="p-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                          {file.status}
                        </span>
                      </td>

                      {/* 5. ACTIVE COLUMN */}
                      <td className="p-4 font-medium">
                        {file.is_active ? "Yes" : "No"}
                      </td>

                      {/* 6. CREATED BY COLUMN */}
                      <td className="p-4 text-slate-600 font-medium">
                        {file.uploaded_by_username}
                      </td>

                      {/* 7. CREATED ON COLUMN */}
                      <td className="p-4 whitespace-nowrap text-slate-600 font-medium">
                        {formatISTDateTime(file.created_on, "N/A")}
                      </td>

                      {/* 8. ACTIONS COLUMN */}
                      <td className="p-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedFile(file);
                              setShowDetails(true);
                            }}
                            className="px-3 py-1.5 rounded-md bg-slate-100 hover:bg-slate-200 text-xs font-semibold cursor-pointer transition-colors"
                          >
                            View
                          </button>
                          
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownloadFile(file);
                            }}
                            title="Download File Assets"
                            className="p-1.5 rounded-md bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-[#005BAC] border border-transparent hover:border-blue-200 cursor-pointer transition-all flex items-center justify-center text-xs"
                          >
                            <FaDownload size={12} />
                          </button>
                        </div>
                      </td>

                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="p-12 text-center text-gray-400 font-medium">
                      📭 No uploaded file found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Details View Overlays Modal Popup */}
      {showDetails && selectedFile && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 backdrop-blur-xs">
          <div className="bg-white text-black rounded-xl shadow-xl w-[750px] max-w-[95%] p-6 transform transition-all">
            <div className="flex justify-between items-center mb-5 border-b border-gray-100 pb-3">
              <h2 className="text-xl font-bold text-slate-900">File Details Repository Log</h2>
              <button
                onClick={() => setShowDetails(false)}
                className="text-gray-400 hover:text-black text-lg font-bold cursor-pointer transition-colors p-1"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-5 text-sm text-black">
              <div>
                <strong className="text-gray-500 block uppercase text-[10px] tracking-wider mb-0.5">File Name</strong>
                <p className="text-black font-semibold break-all">{selectedFile.file_name}</p>
              </div>
              <div>
                <strong className="text-gray-500 block uppercase text-[10px] tracking-wider mb-0.5">File Type</strong>
                <p className="text-black font-medium">{selectedFile.file_type}</p>
              </div>
              <div>
                <strong className="text-gray-500 block uppercase text-[10px] tracking-wider mb-0.5">Status</strong>
                <p className="text-black font-medium">{selectedFile.status}</p>
              </div>
              <div>
                <strong className="text-gray-500 block uppercase text-[10px] tracking-wider mb-0.5">Active</strong>
                <p className="text-black font-medium">{selectedFile.is_active ? "Yes" : "No"}</p>
              </div>
              <div>
                <strong className="text-gray-500 block uppercase text-[10px] tracking-wider mb-0.5">Created At</strong>
                <p className="text-black font-medium">
                  {formatISTDate(selectedFile.created_at, "N/A")}
                </p>
              </div>
              <div>
                <strong className="text-gray-500 block uppercase text-[10px] tracking-wider mb-0.5">Created On</strong>
                <p className="text-black font-medium">{formatISTDateTime(selectedFile.created_on, "N/A")}</p>
              </div>
              <div>
                <strong className="text-gray-500 block uppercase text-[10px] tracking-wider mb-0.5">Created By</strong>
                <p className="text-black font-medium">{selectedFile.uploaded_by_username}</p>
              </div>
              <div>
                <strong className="text-gray-500 block uppercase text-[10px] tracking-wider mb-0.5">Email</strong>
                <p className="text-black font-medium break-all">{selectedFile.uploaded_by_email}</p>
              </div>
              <div>
                <strong className="text-gray-500 block uppercase text-[10px] tracking-wider mb-0.5">Updated On</strong>
                <p className="text-black font-medium">{formatISTDateTime(selectedFile.updated_on, "N/A")}</p>
              </div>
              <div>
                <strong className="text-gray-500 block uppercase text-[10px] tracking-wider mb-0.5">Updated By</strong>
                <p className="text-black font-medium">{selectedFile.updated_by_username || "N/A"}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
