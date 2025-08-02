import React, { useState } from 'react';
import { AccessibilityErrorTranslator, ErrorCollection, createAccessibilityError, type AccessibilityError } from '@/components/AccessibilityErrorTranslator';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

const sampleErrors: AccessibilityError[] = [
  createAccessibilityError(
    "Invalid email format in registration form",
    "high",
    "validation",
    {
      technicalDetails: "ValidationError: Email field does not match pattern /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/",
      suggestedAction: "Please enter a valid email address (e.g., user@example.com)"
    }
  ),
  createAccessibilityError(
    "Failed to connect to authentication server",
    "critical",
    "network",
    {
      technicalDetails: "NetworkError: ECONNREFUSED 192.168.1.100:8080\nStack trace: at TCPConnectWrap.afterConnect",
      suggestedAction: "Check your internet connection or try again later"
    }
  ),
  createAccessibilityError(
    "Session expired - please log in again",
    "medium",
    "permission",
    {
      technicalDetails: "AuthError: JWT token expired at 2025-07-24T15:30:00Z",
      suggestedAction: "Please log in again to continue"
    }
  ),
  createAccessibilityError(
    "Request timeout while saving data",
    "medium",
    "timeout",
    {
      technicalDetails: "TimeoutError: Request exceeded 30000ms limit\nEndpoint: /api/portfolio/save",
      suggestedAction: "Try saving again or check your connection speed"
    }
  ),
  createAccessibilityError(
    "Database connection pool exhausted",
    "critical",
    "system",
    {
      technicalDetails: "PoolError: All 10 connections in use\nActive connections: 10/10",
      suggestedAction: "Please wait a moment and try again"
    }
  ),
  createAccessibilityError(
    "Suspicious login attempt detected",
    "high",
    "security",
    {
      technicalDetails: "SecurityAlert: Login from new location (IP: 203.0.113.42, Location: Unknown)",
      suggestedAction: "If this was you, verify your identity via email"
    }
  ),
  createAccessibilityError(
    "Profile updated successfully",
    "success",
    "system",
    {
      suggestedAction: "Your changes have been saved"
    }
  ),
  createAccessibilityError(
    "New feature available: Dark mode",
    "info",
    "system",
    {
      suggestedAction: "Check settings to enable dark mode"
    }
  ),
  createAccessibilityError(
    "Slow network detected",
    "low",
    "network",
    {
      technicalDetails: "PerformanceWarning: Network latency > 500ms",
      suggestedAction: "Some features may load slowly"
    }
  )
];

export default function ErrorTranslatorDemo() {
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);
  const [compactMode, setCompactMode] = useState(false);
  const [groupBySeverity, setGroupBySeverity] = useState(true);
  const [selectedErrors, setSelectedErrors] = useState<AccessibilityError[]>(sampleErrors);

  const addRandomError = () => {
    const severities = ['critical', 'high', 'medium', 'low', 'info', 'success'] as const;
    const categories = ['validation', 'network', 'permission', 'timeout', 'system', 'security'] as const;
    
    const messages = [
      "Upload failed due to file size limit",
      "Password does not meet security requirements",
      "API rate limit exceeded",
      "Cache invalidation successful",
      "Background sync completed",
      "Unsupported file format detected"
    ];

    const randomError = createAccessibilityError(
      messages[Math.floor(Math.random() * messages.length)],
      severities[Math.floor(Math.random() * severities.length)],
      categories[Math.floor(Math.random() * categories.length)],
      {
        technicalDetails: `RandomError: Generated at ${new Date().toISOString()}`,
        suggestedAction: "This is a randomly generated error for demonstration"
      }
    );

    setSelectedErrors([randomError, ...selectedErrors]);
  };

  const clearErrors = () => {
    setSelectedErrors([]);
  };

  const resetToSample = () => {
    setSelectedErrors(sampleErrors);
  };

  const severityCounts = selectedErrors.reduce((acc, error) => {
    acc[error.severity] = (acc[error.severity] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Accessibility Error Translator</h1>
          <p className="text-muted-foreground">
            A color-coded and icon-based error communication system for enhanced user understanding
          </p>
        </div>

        {/* Controls */}
        <Card>
          <CardHeader>
            <CardTitle>Demo Controls</CardTitle>
            <CardDescription>
              Customize the display and test different error scenarios
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="technical-details"
                  checked={showTechnicalDetails}
                  onCheckedChange={setShowTechnicalDetails}
                />
                <Label htmlFor="technical-details">Show Technical Details</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="compact-mode"
                  checked={compactMode}
                  onCheckedChange={setCompactMode}
                />
                <Label htmlFor="compact-mode">Compact Mode</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="group-severity"
                  checked={groupBySeverity}
                  onCheckedChange={setGroupBySeverity}
                />
                <Label htmlFor="group-severity">Group by Severity</Label>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button onClick={addRandomError} variant="outline">
                Add Random Error
              </Button>
              <Button onClick={resetToSample} variant="outline">
                Reset to Sample
              </Button>
              <Button onClick={clearErrors} variant="destructive">
                Clear All
              </Button>
            </div>

            {/* Error Statistics */}
            <div className="flex flex-wrap gap-2">
              <span className="text-sm font-medium">Error Count:</span>
              {Object.entries(severityCounts).map(([severity, count]) => (
                <Badge key={severity} variant="outline">
                  {severity}: {count}
                </Badge>
              ))}
              <Badge variant="secondary">Total: {selectedErrors.length}</Badge>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="collection" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="collection">Error Collection</TabsTrigger>
            <TabsTrigger value="individual">Individual Errors</TabsTrigger>
            <TabsTrigger value="guidelines">Usage Guidelines</TabsTrigger>
          </TabsList>

          <TabsContent value="collection" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Error Collection Display</CardTitle>
                <CardDescription>
                  Shows how multiple errors are displayed together with grouping and sorting
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedErrors.length > 0 ? (
                  <ErrorCollection
                    errors={selectedErrors}
                    showTechnicalDetails={showTechnicalDetails}
                    groupBySeverity={groupBySeverity}
                    maxDisplay={20}
                  />
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No errors to display. Add some errors using the controls above.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="individual" className="space-y-4">
            <div className="grid gap-4">
              {sampleErrors.map((error, index) => (
                <Card key={`${error.id}-${index}`}>
                  <CardHeader>
                    <CardTitle className="text-base">
                      {error.severity.charAt(0).toUpperCase() + error.severity.slice(1)} - {error.category}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <AccessibilityErrorTranslator
                      error={error}
                      compact={compactMode}
                      showTechnicalDetails={showTechnicalDetails}
                    />
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="guidelines" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Usage Guidelines</CardTitle>
                <CardDescription>
                  Best practices for implementing the Accessibility Error Translator
                </CardDescription>
              </CardHeader>
              <CardContent className="prose dark:prose-invert max-w-none">
                <h3>Color System</h3>
                <ul>
                  <li><strong>Critical (Red):</strong> System failures, security breaches, data loss</li>
                  <li><strong>High (Orange):</strong> Important validations, authentication failures</li>
                  <li><strong>Medium (Yellow):</strong> Session timeouts, permission issues</li>
                  <li><strong>Low (Blue):</strong> Performance warnings, minor validations</li>
                  <li><strong>Info (Gray):</strong> General information, feature announcements</li>
                  <li><strong>Success (Green):</strong> Successful operations, confirmations</li>
                </ul>

                <h3>Category Icons</h3>
                <ul>
                  <li><strong>Validation:</strong> Data input and format errors</li>
                  <li><strong>Network:</strong> Connection and server issues</li>
                  <li><strong>Permission:</strong> Access control and authentication</li>
                  <li><strong>Timeout:</strong> Request and operation timeouts</li>
                  <li><strong>System:</strong> Internal system errors</li>
                  <li><strong>Security:</strong> Security-related alerts</li>
                </ul>

                <h3>Accessibility Features</h3>
                <ul>
                  <li>ARIA labels and roles for screen readers</li>
                  <li>High contrast colors for visual accessibility</li>
                  <li>Multiple visual indicators (color, icons, text)</li>
                  <li>Semantic HTML structure</li>
                  <li>Keyboard navigation support</li>
                </ul>

                <h3>Implementation Example</h3>
                <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded text-sm overflow-x-auto">
{`import { createAccessibilityError, AccessibilityErrorTranslator } from '@/components/AccessibilityErrorTranslator';

// Create an error
const error = createAccessibilityError(
  "Please enter a valid email address",
  "high",
  "validation",
  {
    suggestedAction: "Check the format (user@domain.com)",
    technicalDetails: "ValidationError: Invalid email format"
  }
);

// Display the error
<AccessibilityErrorTranslator 
  error={error}
  showTechnicalDetails={true}
/>`}
                </pre>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}