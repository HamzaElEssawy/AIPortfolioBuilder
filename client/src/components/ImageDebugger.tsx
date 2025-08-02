import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";

export default function ImageDebugger() {
  const [results, setResults] = useState<any[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const addResult = (test: string, status: 'success' | 'error', data: any) => {
    setResults(prev => [...prev, {
      test,
      status,
      data,
      timestamp: new Date().toISOString()
    }]);
  };

  const runTests = async () => {
    setIsRunning(true);
    setResults([]);

    // Test 1: Basic GET request
    try {
      console.log('Testing GET /api/admin/portfolio-images');
      const images = await apiRequest("/api/admin/portfolio-images", "GET");
      addResult('GET Images', 'success', images);
    } catch (error: any) {
      console.error('GET Images failed:', error);
      addResult('GET Images', 'error', error.message);
    }

    // Test 2: Create image test
    try {
      console.log('Testing POST /api/admin/portfolio-images');
      const testImage = {
        section: "hero",
        imageUrl: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzAwNzNlNiIvPjx0ZXh0IHg9IjUwIiB5PSI1NSIgZm9udC1zaXplPSIxNiIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiPlRlc3Q8L3RleHQ+PC9zdmc+",
        altText: "Test image",
        caption: "Test caption",
        orderIndex: 999,
        isActive: true
      };
      const created = await apiRequest("/api/admin/portfolio-images", "POST", testImage);
      addResult('CREATE Image', 'success', created);

      // Test 3: Update the created image
      if (created && created.id) {
        try {
          console.log('Testing PUT /api/admin/portfolio-images/' + created.id);
          const updateData = {
            ...testImage,
            altText: "Updated test image"
          };
          const updated = await apiRequest(`/api/admin/portfolio-images/${created.id}`, "PUT", updateData);
          addResult('UPDATE Image', 'success', updated);
        } catch (error: any) {
          console.error('UPDATE Image failed:', error);
          addResult('UPDATE Image', 'error', error.message);
        }

        // Test 4: Delete the test image
        try {
          console.log('Testing DELETE /api/admin/portfolio-images/' + created.id);
          await apiRequest(`/api/admin/portfolio-images/${created.id}`, "DELETE");
          addResult('DELETE Image', 'success', 'Image deleted');
        } catch (error: any) {
          console.error('DELETE Image failed:', error);
          addResult('DELETE Image', 'error', error.message);
        }
      }
    } catch (error: any) {
      console.error('CREATE Image failed:', error);
      addResult('CREATE Image', 'error', error.message);
    }

    // Test 5: Network connectivity
    try {
      console.log('Testing basic fetch connectivity');
      const response = await fetch('/api/admin/status', {
        credentials: 'include'
      });
      const status = await response.json();
      addResult('Network Test', 'success', status);
    } catch (error: any) {
      console.error('Network test failed:', error);
      addResult('Network Test', 'error', error.message);
    }

    setIsRunning(false);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Image API Debugger</CardTitle>
        <Button 
          onClick={runTests} 
          disabled={isRunning}
          className="w-fit"
        >
          {isRunning ? "Running Tests..." : "Run Diagnostic Tests"}
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {results.map((result, index) => (
            <div key={index} className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant={result.status === 'success' ? 'default' : 'destructive'}>
                  {result.test}
                </Badge>
                <span className="text-sm text-gray-500">
                  {new Date(result.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <pre className="text-sm bg-gray-50 p-2 rounded overflow-auto max-h-32">
                {typeof result.data === 'string' 
                  ? result.data 
                  : JSON.stringify(result.data, null, 2)
                }
              </pre>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}