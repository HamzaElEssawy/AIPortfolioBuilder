import { createRoot } from "react-dom/client";
import "./index.css";

console.log("🚀 React bootstrapped!");
console.log("Root element:", document.getElementById("root"));

// Simple test component to verify React is working
function TestApp() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          AI Portfolio System
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          React app is now rendering successfully!
        </p>
        <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg inline-block">
          ✅ Frontend Connected
        </div>
      </div>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<TestApp />);
