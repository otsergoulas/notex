"use client";

import { useState, useCallback } from "react";
import LoadingSpinner from "./LoadingSpinner";

export default function ImageUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [extractedText, setExtractedText] = useState<string>("");
  const [summary, setSummary] = useState<string>("");
  const [actionSteps, setActionSteps] = useState<string[]>([]);
  const [keyInsights, setKeyInsights] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [customInstructions, setCustomInstructions] = useState<string>("");

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type.startsWith("image/")) {
      handleFile(droppedFile);
    }
  }, []);

  const handleFile = (selectedFile: File) => {
    setFile(selectedFile);

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFile(selectedFile);
    }
  };

  const processImage = async () => {
    if (!file) return;

    console.log("🚀 Starting image processing...");
    setProcessing(true);
    setExtractedText("");
    setSummary("");
    setActionSteps([]);
    setKeyInsights([]);

    try {
      const formData = new FormData();
      formData.append("image", file);
      if (customInstructions.trim()) {
        formData.append("instructions", customInstructions.trim());
      }

      console.log("📤 Sending image to API...");
      console.log("📋 Custom instructions:", customInstructions || "(none)");
      const response = await fetch("/api/process-image", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to process image");
      }

      const data = await response.json();
      console.log("✅ Received response from API:", data);
      console.log("📝 Extracted text:", data.extractedText);
      console.log("📊 Summary:", data.summary);
      console.log("⚡ Action Steps:", data.actionSteps);
      console.log("💡 Key Insights:", data.keyInsights);
      console.log("🏷️ Categories:", data.categories);

      setExtractedText(data.extractedText);
      setSummary(data.summary);
      setActionSteps(data.actionSteps || []);
      setKeyInsights(data.keyInsights || []);
    } catch (error) {
      console.error("Error processing image:", error);
      alert("Failed to process image. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <>
      {processing && <LoadingSpinner />}
      <div className="space-y-6">
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
          isDragging
            ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
            : "border-gray-300 dark:border-gray-700"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {!preview ? (
          <div>
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
              aria-hidden="true"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Drag and drop an image here, or click to select
            </p>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileInput}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="mt-4 inline-flex cursor-pointer rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Choose File
            </label>
          </div>
        ) : (
          <div className="space-y-4">
            <img
              src={preview}
              alt="Preview"
              className="max-h-96 mx-auto rounded-lg"
            />

            {/* Custom Instructions */}
            <div className="max-w-2xl mx-auto">
              <label htmlFor="instructions" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Custom Instructions (Optional)
              </label>
              <textarea
                id="instructions"
                value={customInstructions}
                onChange={(e) => setCustomInstructions(e.target.value)}
                placeholder="E.g., 'Create action items from these meeting notes' or 'Summarize key technical concepts' or 'Extract to-do list with priorities'"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={3}
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Tell the AI what you want it to do with the extracted text
              </p>
            </div>

            <div className="flex gap-2 justify-center">
              <button
                onClick={processImage}
                disabled={processing}
                className="rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                Extract & Analyze
              </button>
              <button
                onClick={() => {
                  setFile(null);
                  setPreview(null);
                  setExtractedText("");
                  setSummary("");
                  setActionSteps([]);
                  setKeyInsights([]);
                  setCustomInstructions("");
                }}
                className="rounded-md bg-gray-600 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-700"
              >
                Clear
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      {extractedText && (
        <div className="space-y-4">
          <div className="rounded-lg border border-gray-300 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold mb-3">Extracted Text</h2>
            <p className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">
              {extractedText}
            </p>
          </div>

          {summary && (
            <div className="rounded-lg border border-gray-300 dark:border-gray-700 p-6 bg-blue-50 dark:bg-blue-950">
              <h2 className="text-xl font-semibold mb-3">AI Analysis</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium mb-2 text-blue-900 dark:text-blue-100">Summary</h3>
                  <p className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                    {summary}
                  </p>
                </div>

                {keyInsights && keyInsights.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium mb-2 text-purple-900 dark:text-purple-100">Key Insights</h3>
                    <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
                      {keyInsights.map((insight, index) => (
                        <li key={index} className="leading-relaxed">{insight}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {actionSteps && actionSteps.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium mb-2 text-green-900 dark:text-green-100">Action Steps</h3>
                    <ol className="list-decimal list-inside space-y-2 text-gray-700 dark:text-gray-300">
                      {actionSteps.map((step, index) => (
                        <li key={index} className="leading-relaxed">{step}</li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
      </div>
    </>
  );
}
