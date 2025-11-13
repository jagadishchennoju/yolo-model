import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";

const Dropzone = ({ onDrop }) => {
  const handleDrop = useCallback(
    (acceptedFiles) => {
      if (acceptedFiles && acceptedFiles.length > 0) {
        onDrop(acceptedFiles[0]);
      }
    },
    [onDrop]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleDrop,
    accept: { "image/*": [] },
  });

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition 
        ${isDragActive ? "bg-blue-100 border-blue-400" : "bg-white border-gray-300"}`}
    >
      <input {...getInputProps()} />
      {isDragActive ? (
        <p className="text-blue-600 font-semibold">Drop the image here ...</p>
      ) : (
        <p className="text-gray-600">
          Drag & drop an image here, or <span className="text-blue-600 font-semibold">click to upload</span>
        </p>
      )}
    </div>
  );
};

export default Dropzone;
