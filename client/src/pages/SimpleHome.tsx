import React from "react";

export default function SimpleHome() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-4xl mx-auto text-center px-4">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to Hamza's Portfolio
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          AI Product Leader & Technical Innovator
        </p>
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-semibold mb-4">Portfolio Website</h2>
          <p className="text-gray-700 mb-4">
            This is a comprehensive AI-powered portfolio and knowledge management platform.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900">Portfolio</h3>
              <p className="text-blue-700">Showcase of projects and achievements</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-900">AI Assistant</h3>
              <p className="text-green-700">Intelligent career guidance and insights</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-semibold text-purple-900">Knowledge Base</h3>
              <p className="text-purple-700">Document processing and management</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}