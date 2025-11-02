"use client";

import { useState, useCallback } from "react";
import LoadingSpinner from "./LoadingSpinner";

export default function ImageUpload() {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [processing, setProcessing] = useState(false);
  const [extractedTexts, setExtractedTexts] = useState<{ imageNumber: number; text: string }[]>([]);
  const [summary, setSummary] = useState<string>("");
  const [actionSteps, setActionSteps] = useState<string[]>([]);
  const [keyInsights, setKeyInsights] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [userInstructions, setUserInstructions] = useState<string>("");
  const [showExtractedTextModal, setShowExtractedTextModal] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

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

    const droppedFiles = Array.from(e.dataTransfer.files).filter(file =>
      file.type.startsWith("image/")
    );
    if (droppedFiles.length > 0) {
      handleFiles(droppedFiles);
    }
  }, []);

  const handleFiles = (selectedFiles: File[]) => {
    setFiles(prevFiles => [...prevFiles, ...selectedFiles]);

    selectedFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      handleFiles(Array.from(selectedFiles));
    }
  };

  const removeImage = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const extractText = async () => {
    if (files.length === 0) return;

    console.log(`🚀 Extracting text from ${files.length} image(s)...`);
    setProcessing(true);
    setExtractedTexts([]);
    setSummary("");
    setActionSteps([]);
    setKeyInsights([]);

    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append("images", file);
      });

      console.log(`📤 Sending ${files.length} image(s) to API for text extraction...`);
      const response = await fetch("/api/extract-text", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to extract text from images");
      }

      const data = await response.json();
      console.log("✅ Text extracted successfully:", data);
      console.log("📝 Extracted texts:", data.extractedTexts);

      setExtractedTexts(data.extractedTexts || []);
      setActiveTab(0);
    } catch (error) {
      console.error("Error extracting text:", error);
      alert("Failed to extract text. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  const analyzeWithAI = async () => {
    if (extractedTexts.length === 0) return;

    if (!userInstructions.trim()) {
      alert("Please provide instructions for how you want the text analyzed.");
      return;
    }

    console.log("🤖 Analyzing text with AI...");
    setProcessing(true);

    try {
      console.log("📋 User instructions:", userInstructions);
      const response = await fetch("/api/analyze-text", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          extractedTexts,
          userInstructions: userInstructions.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to analyze text");
      }

      const data = await response.json();
      console.log("✅ Analysis complete:", data);
      console.log("📊 Summary:", data.summary);
      console.log("⚡ Action Steps:", data.actionSteps);
      console.log("💡 Key Insights:", data.keyInsights);

      setSummary(data.summary);
      setActionSteps(data.actionSteps || []);
      setKeyInsights(data.keyInsights || []);
    } catch (error) {
      console.error("Error analyzing text:", error);
      alert("Failed to analyze text. Please try again.");
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
        {previews.length === 0 ? (
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
              Drag and drop images here, or click to select multiple
            </p>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileInput}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="mt-4 inline-flex cursor-pointer rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Choose Files
            </label>
          </div>
        ) : null}

        {/* Image Previews */}
        {previews.length > 0 && (
          <div className="space-y-4">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {files.length} image{files.length !== 1 ? 's' : ''} selected
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {previews.map((preview, index) => (
                <div key={index} className="relative group">
                  <img
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <button
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Remove image"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>

            {/* Add more images button */}
            <div className="text-center">
              <label
                htmlFor="file-upload"
                className="inline-flex cursor-pointer rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Add More Images
              </label>
            </div>

            <div className="flex gap-2 justify-center">
              <button
                onClick={extractText}
                disabled={processing}
                className="rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                Extract Text
              </button>
              <button
                onClick={() => {
                  setFiles([]);
                  setPreviews([]);
                  setExtractedTexts([]);
                  setSummary("");
                  setActionSteps([]);
                  setKeyInsights([]);
                  setUserInstructions("");
                }}
                className="rounded-md bg-gray-600 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-700"
              >
                Clear All
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Step 2: After text extraction, allow user to review and analyze */}
      {extractedTexts.length > 0 && !summary && (
        <div className="rounded-lg border border-gray-300 dark:border-gray-700 p-6 bg-green-50 dark:bg-green-950">
          <h2 className="text-xl font-semibold mb-4">Text Extracted Successfully!</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Review the extracted text and make any edits if needed, then request AI analysis.
          </p>

          <div className="space-y-4">
            {/* View/Edit Extracted Text Button */}
            <div className="text-center">
              <button
                onClick={() => setShowExtractedTextModal(true)}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                View & Edit Extracted Text ({extractedTexts.length} image{extractedTexts.length !== 1 ? 's' : ''})
              </button>
            </div>

            {/* User Instructions */}
            <div className="max-w-2xl mx-auto">
              <label htmlFor="instructions" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Instructions <span className="text-red-600">*</span>
              </label>
              <textarea
                id="instructions"
                value={userInstructions}
                onChange={(e) => setUserInstructions(e.target.value)}
                placeholder="E.g., 'Create action items from these meeting notes' or 'Summarize key technical concepts' or 'Extract to-do list with priorities'"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={3}
                required
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Required: Tell the AI what you want it to do with the extracted text
              </p>
            </div>

            {/* Analyze Button */}
            <div className="text-center">
              <button
                onClick={analyzeWithAI}
                disabled={processing}
                className="rounded-md bg-purple-600 px-6 py-3 text-sm font-semibold text-white hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                🤖 Analyze with AI
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {summary && (
        <div className="space-y-4">
          {extractedTexts.length > 0 && (
            <div className="text-center">
              <button
                onClick={() => setShowExtractedTextModal(true)}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                View & Edit Extracted Text ({extractedTexts.length} image{extractedTexts.length !== 1 ? 's' : ''})
              </button>
            </div>
          )}

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
        </div>
      )}

      {/* Modal for Extracted Text */}
      {showExtractedTextModal && extractedTexts.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowExtractedTextModal(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-semibold">View & Edit Extracted Text</h2>
              <button
                onClick={() => setShowExtractedTextModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Tabs */}
            {extractedTexts.length > 1 && (
              <div className="flex border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
                {extractedTexts.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveTab(index)}
                    className={`px-4 py-3 text-sm font-medium whitespace-nowrap ${
                      activeTab === index
                        ? "border-b-2 border-blue-600 text-blue-600 dark:text-blue-400"
                        : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                    }`}
                  >
                    Image {item.imageNumber}
                  </button>
                ))}
              </div>
            )}

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <textarea
                value={extractedTexts[activeTab]?.text || ""}
                onChange={(e) => {
                  const newTexts = [...extractedTexts];
                  newTexts[activeTab] = {
                    ...newTexts[activeTab],
                    text: e.target.value
                  };
                  setExtractedTexts(newTexts);
                }}
                className="w-full h-full min-h-[400px] px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="No text extracted"
              />
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-2 p-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(extractedTexts[activeTab]?.text || "");
                  alert("Copied to clipboard!");
                }}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Copy Text
              </button>
              <button
                onClick={() => setShowExtractedTextModal(false)}
                className="rounded-md bg-gray-600 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </>
  );
}
