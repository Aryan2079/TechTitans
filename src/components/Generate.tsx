/* @ts-nocheck */
import React, { useState } from "react";
import axios from "axios";

const GenerateImageAndWebsite: React.FC = () => {
  const [imagePrompt, setImagePrompt] = useState<string>("");
  const [websitePrompt, setWebsitePrompt] = useState<string>("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [htmlCode, setHtmlCode] = useState<string | null>(null);
  const [cssCode, setCssCode] = useState<string | null>(null);
  const [loadingImage, setLoadingImage] = useState<boolean>(false);
  const [loadingWebsite, setLoadingWebsite] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Handle image generation
  const handleGenerateImage = async () => {
    if (!imagePrompt.trim()) {
      setError("Please enter a prompt for image generation");
      return;
    }

    setLoadingImage(true);
    setError(null);
    setImageUrl(null);

    try {
      const response = await axios.post(
        "http://localhost:3001/api/generate-image",
        { prompt: imagePrompt },
        { headers: { "Content-Type": "application/json" } }
      );

      if (response.data.imageUrl) {
        setImageUrl(response.data.imageUrl);
      } else {
        setError("Failed to generate image");
      }
    } catch (err: any) {
      setError(err.response?.data?.details || "Failed to generate image");
    } finally {
      setLoadingImage(false);
    }
  };

  // Handle website code generation
  const handleGenerateWebsiteCode = async () => {
    if (!websitePrompt.trim()) {
      setError("Please enter a prompt for website code generation");
      return;
    }

    setLoadingWebsite(true);
    setError(null);
    setHtmlCode(null);
    setCssCode(null);

    try {
      const response = await axios.post(
        "http://localhost:3001/api/generate-website-code",
        { prompt: websitePrompt },
        { headers: { "Content-Type": "application/json" } }
      );

      if (response.data.html && response.data.css) {
        setHtmlCode(response.data.html);
        setCssCode(response.data.css);
      } else {
        setError("Failed to generate website code");
      }
    } catch (err: any) {
      setError(
        err.response?.data?.details || "Failed to generate website code"
      );
    } finally {
      setLoadingWebsite(false);
    }
  };

  // Preview generated website
  const handlePreview = () => {
    if (htmlCode && cssCode) {
      const combinedCode = `
        <style>${cssCode}</style>
        ${htmlCode}
      `;
      const previewWindow = window.open("", "_blank");
      if (previewWindow) {
        previewWindow.document.write(combinedCode);
        previewWindow.document.close();
      }
    }
  };

  return (
    <div className="generate-container p-4 max-w-4xl mx-auto">
      {/* Image Generation Section */}
      <div className="mb-8 p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4">
          Generate an Idea for Your Business (Image)
        </h1>

        <div className="mb-4">
          <input
            type="text"
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter a prompt to generate a poster or banner for your business"
            value={imagePrompt}
            onChange={(e) => setImagePrompt(e.target.value)}
            disabled={loadingImage}
          />
        </div>

        <button
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors disabled:bg-gray-300"
          onClick={handleGenerateImage}
          disabled={loadingImage || !imagePrompt.trim()}
        >
          {loadingImage ? "Generating..." : "Generate Image"}
        </button>

        {loadingImage && <p className="mt-4">Loading...</p>}
        {error && <p className="mt-4 text-red-500">{error}</p>}
        {imageUrl && !loadingImage && (
          <div className="mt-4">
            <h2 className="text-xl font-semibold mb-2">Generated Image:</h2>
            <img
              src={imageUrl}
              alt="Generated"
              className="max-w-full h-auto rounded-lg shadow-lg"
            />
          </div>
        )}
      </div>

      {/* Website Code Generation Section */}
      <div className="p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4">
          Generate HTML and CSS for Your Business Website
        </h1>

        <div className="mb-4">
          <input
            type="text"
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter a prompt to generate HTML and CSS"
            value={websitePrompt}
            onChange={(e) => setWebsitePrompt(e.target.value)}
            disabled={loadingWebsite}
          />
        </div>

        <button
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors disabled:bg-gray-300 mr-4"
          onClick={handleGenerateWebsiteCode}
          disabled={loadingWebsite || !websitePrompt.trim()}
        >
          {loadingWebsite ? "Generating..." : "Generate Website Code"}
        </button>

        {htmlCode && cssCode && (
          <button
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg transition-colors"
            onClick={handlePreview}
          >
            Preview Website
          </button>
        )}

        {loadingWebsite && <p className="mt-4">Loading...</p>}
        {error && <p className="mt-4 text-red-500">{error}</p>}

        {htmlCode && !loadingWebsite && (
          <div className="mt-4">
            <h2 className="text-xl font-semibold mb-2">Generated HTML:</h2>
            <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto">
              <code>{htmlCode}</code>
            </pre>

            <h2 className="text-xl font-semibold mt-4 mb-2">Generated CSS:</h2>
            <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto">
              <code>{cssCode}</code>
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default GenerateImageAndWebsite;
