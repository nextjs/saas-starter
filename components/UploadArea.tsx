"use client";

import React, { useRef, useState, useEffect } from "react";

const UploadArea = () => {
  const dropRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      uploadFiles(files);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      uploadFiles(files);
    }
  };

  const uploadFiles = async (files: FileList) => {
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append("files", files[i]);
    }
    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      if (response.ok) {
        const data = await response.json();
        console.log(data.message);
      } else {
        const data = await response.json();
        console.error(data.error);
      }
    } catch (error) {
      console.error("Error uploading files:", error);
    }
  };

  useEffect(() => {
    if (dropRef.current && fileInputRef.current) {
      dropRef.current.addEventListener("click", () => {
        if (fileInputRef.current) {
          fileInputRef.current.click();
        }
      });
      return () => {
        if (dropRef.current) {
          dropRef.current.removeEventListener("click", () => {
            if (fileInputRef.current) {
              fileInputRef.current.click();
            }
          });
        }
      };
    }
  }, [dropRef.current, fileInputRef.current]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mt-8">
        <h2 className="text-xl font-bold text-black">Bank Statement Upload</h2>
        <div
          ref={dropRef}
          className={`mt-4 border-2 border-dashed ${
            isDragging ? "border-blue-500" : "border-blue-200"
          } bg-blue-100 p-12 flex flex-col items-center justify-center`}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-blue-500 mt-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
          <p className="text-black mt-2">
            Drag and Drop file here or Choose file
          </p>
          <input
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={handleFileInputChange}
            ref={fileInputRef}
          />
        </div>
        <div className="mt-2 flex justify-between text-gray-500 text-sm">
          <p>Supported formats: PDF</p>
          <p>Maximum: 50MB or 200 pages</p>
        </div>
      </div>
    </div>
  );
};

export default UploadArea;
