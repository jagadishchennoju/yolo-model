import React, { useState } from "react";
import axios from "axios";
import Dropzone from "./components/Dropzone";

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [predictedImg, setPredictedImg] = useState(null);
  const [modelType, setModelType] = useState("soil");
  const [loading, setLoading] = useState(false);

  const handleFile = (file) => {
    setSelectedFile(file);
    setPredictedImg(null);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handlePredict = async () => {
    if (!selectedFile) return alert("Please upload an image first!");
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await axios.post(
        `http://127.0.0.1:8000/predict/${modelType}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (response.data.status === "success") {
        setPredictedImg(
          `data:image/jpeg;base64,${response.data.output_image_base64}`
        );
      } else {
        alert("Prediction failed: " + response.data.message);
      }
    } catch (error) {
      console.error(error);
      alert("Error connecting to backend!");
    }
    setLoading(false);
  };

  const handleDownload = () => {
    if (!predictedImg) return;
    const link = document.createElement("a");
    link.href = predictedImg;
    link.download = `${modelType}_prediction.jpg`;
    link.click();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-50 to-white p-4">
      <div className="max-w-3xl w-full bg-white shadow-lg rounded-3xl p-8 space-y-6">
        <h1 className="text-3xl md:text-4xl font-bold text-center text-green-700">
          🌍 Soil & Vegetation Detection
        </h1>

        <Dropzone onDrop={handleFile} />

        {previewUrl && (
          <div className="text-center">
            <h3 className="text-gray-700 font-medium mb-2">Original Image:</h3>
            <img
              src={previewUrl}
              alt="Preview"
              className="max-h-64 mx-auto rounded-xl shadow-md"
            />
          </div>
        )}

        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          <select
            className="border rounded-lg px-4 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            value={modelType}
            onChange={(e) => setModelType(e.target.value)}
          >
            <option value="soil">Soil Detection</option>
            <option value="vegetation">Vegetation Detection</option>
          </select>

          <button
            onClick={handlePredict}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold transition disabled:opacity-50"
          >
            {loading ? "Predicting..." : "Predict"}
          </button>
        </div>

        {predictedImg && (
          <div className="text-center space-y-3">
            <h3 className="text-gray-700 font-medium">Predicted Output:</h3>
            <img
              src={predictedImg}
              alt="Prediction"
              className="max-h-64 mx-auto rounded-xl shadow-md"
            />
            <button
              onClick={handleDownload}
              className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded-lg font-medium"
            >
              Download Result
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
