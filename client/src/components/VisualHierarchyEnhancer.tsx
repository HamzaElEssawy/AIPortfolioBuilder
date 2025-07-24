import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Eye, Type, Palette, Smartphone, Monitor, Tablet } from "lucide-react";

interface TypographySettings {
  h1Size: number;
  h2Size: number;
  h3Size: number;
  bodySize: number;
  lineHeight: number;
  fontWeight: {
    heading: number;
    body: number;
  };
}

interface ColorSettings {
  primary: string;
  secondary: string;
  accent: string;
  text: string;
  background: string;
}

export default function VisualHierarchyEnhancer() {
  const [typography, setTypography] = useState<TypographySettings>({
    h1Size: 48,
    h2Size: 36,
    h3Size: 24,
    bodySize: 16,
    lineHeight: 1.6,
    fontWeight: {
      heading: 700,
      body: 400
    }
  });

  const [colors, setColors] = useState<ColorSettings>({
    primary: "#1a365d",
    secondary: "#14b8a6",
    accent: "#f59e0b",
    text: "#374151",
    background: "#ffffff"
  });

  const [activeDevice, setActiveDevice] = useState<"mobile" | "tablet" | "desktop">("desktop");

  const getDeviceStyles = () => {
    switch (activeDevice) {
      case "mobile":
        return {
          h1: Math.round(typography.h1Size * 0.7),
          h2: Math.round(typography.h2Size * 0.8),
          h3: Math.round(typography.h3Size * 0.85),
          body: Math.round(typography.bodySize * 0.9)
        };
      case "tablet":
        return {
          h1: Math.round(typography.h1Size * 0.85),
          h2: Math.round(typography.h2Size * 0.9),
          h3: Math.round(typography.h3Size * 0.95),
          body: typography.bodySize
        };
      default:
        return {
          h1: typography.h1Size,
          h2: typography.h2Size,
          h3: typography.h3Size,
          body: typography.bodySize
        };
    }
  };

  const deviceStyles = getDeviceStyles();

  const generateCSS = () => {
    return `
/* Enhanced Typography System */
:root {
  --font-size-h1: ${typography.h1Size}px;
  --font-size-h2: ${typography.h2Size}px;
  --font-size-h3: ${typography.h3Size}px;
  --font-size-body: ${typography.bodySize}px;
  --line-height: ${typography.lineHeight};
  --font-weight-heading: ${typography.fontWeight.heading};
  --font-weight-body: ${typography.fontWeight.body};
  
  /* Color System */
  --color-primary: ${colors.primary};
  --color-secondary: ${colors.secondary};
  --color-accent: ${colors.accent};
  --color-text: ${colors.text};
  --color-background: ${colors.background};
}

h1 { 
  font-size: var(--font-size-h1); 
  font-weight: var(--font-weight-heading);
  line-height: 1.2;
  color: var(--color-primary);
}

h2 { 
  font-size: var(--font-size-h2); 
  font-weight: var(--font-weight-heading);
  line-height: 1.3;
  color: var(--color-primary);
}

h3 { 
  font-size: var(--font-size-h3); 
  font-weight: var(--font-weight-heading);
  line-height: 1.4;
  color: var(--color-text);
}

body, p { 
  font-size: var(--font-size-body); 
  font-weight: var(--font-weight-body);
  line-height: var(--line-height);
  color: var(--color-text);
}

/* Mobile Responsive */
@media (max-width: 768px) {
  h1 { font-size: ${deviceStyles.h1}px; }
  h2 { font-size: ${deviceStyles.h2}px; }
  h3 { font-size: ${deviceStyles.h3}px; }
  body, p { font-size: ${deviceStyles.body}px; }
}

/* Tablet Responsive */
@media (max-width: 1024px) and (min-width: 769px) {
  h1 { font-size: ${Math.round(typography.h1Size * 0.85)}px; }
  h2 { font-size: ${Math.round(typography.h2Size * 0.9)}px; }
  h3 { font-size: ${Math.round(typography.h3Size * 0.95)}px; }
}
`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-navy">Visual Hierarchy Enhancer</h3>
          <p className="text-gray-600">Implement strategic typography and responsive design improvements</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={activeDevice === "mobile" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveDevice("mobile")}
          >
            <Smartphone className="h-4 w-4" />
          </Button>
          <Button
            variant={activeDevice === "tablet" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveDevice("tablet")}
          >
            <Tablet className="h-4 w-4" />
          </Button>
          <Button
            variant={activeDevice === "desktop" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveDevice("desktop")}
          >
            <Monitor className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Typography Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Type className="h-5 w-5" />
              Typography System
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">H1 Size (px)</label>
              <div className="flex items-center gap-4">
                <Slider
                  value={[typography.h1Size]}
                  onValueChange={([value]) => setTypography(prev => ({ ...prev, h1Size: value }))}
                  max={72}
                  min={24}
                  step={2}
                  className="flex-1"
                />
                <span className="w-12 text-sm font-mono">{typography.h1Size}px</span>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Mobile: {deviceStyles.h1}px
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">H2 Size (px)</label>
              <div className="flex items-center gap-4">
                <Slider
                  value={[typography.h2Size]}
                  onValueChange={([value]) => setTypography(prev => ({ ...prev, h2Size: value }))}
                  max={48}
                  min={18}
                  step={2}
                  className="flex-1"
                />
                <span className="w-12 text-sm font-mono">{typography.h2Size}px</span>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Mobile: {deviceStyles.h2}px
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">H3 Size (px)</label>
              <div className="flex items-center gap-4">
                <Slider
                  value={[typography.h3Size]}
                  onValueChange={([value]) => setTypography(prev => ({ ...prev, h3Size: value }))}
                  max={32}
                  min={14}
                  step={1}
                  className="flex-1"
                />
                <span className="w-12 text-sm font-mono">{typography.h3Size}px</span>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Mobile: {deviceStyles.h3}px
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Body Size (px)</label>
              <div className="flex items-center gap-4">
                <Slider
                  value={[typography.bodySize]}
                  onValueChange={([value]) => setTypography(prev => ({ ...prev, bodySize: value }))}
                  max={20}
                  min={12}
                  step={1}
                  className="flex-1"
                />
                <span className="w-12 text-sm font-mono">{typography.bodySize}px</span>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Mobile: {deviceStyles.body}px
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Line Height</label>
              <div className="flex items-center gap-4">
                <Slider
                  value={[typography.lineHeight]}
                  onValueChange={([value]) => setTypography(prev => ({ ...prev, lineHeight: value }))}
                  max={2.0}
                  min={1.0}
                  step={0.1}
                  className="flex-1"
                />
                <span className="w-12 text-sm font-mono">{typography.lineHeight}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Color System */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Color System
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Primary Color</label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={colors.primary}
                  onChange={(e) => setColors(prev => ({ ...prev, primary: e.target.value }))}
                  className="w-16 h-10 p-1"
                />
                <Input
                  value={colors.primary}
                  onChange={(e) => setColors(prev => ({ ...prev, primary: e.target.value }))}
                  className="flex-1 font-mono text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Secondary Color</label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={colors.secondary}
                  onChange={(e) => setColors(prev => ({ ...prev, secondary: e.target.value }))}
                  className="w-16 h-10 p-1"
                />
                <Input
                  value={colors.secondary}
                  onChange={(e) => setColors(prev => ({ ...prev, secondary: e.target.value }))}
                  className="flex-1 font-mono text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Accent Color</label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={colors.accent}
                  onChange={(e) => setColors(prev => ({ ...prev, accent: e.target.value }))}
                  className="w-16 h-10 p-1"
                />
                <Input
                  value={colors.accent}
                  onChange={(e) => setColors(prev => ({ ...prev, accent: e.target.value }))}
                  className="flex-1 font-mono text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Text Color</label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={colors.text}
                  onChange={(e) => setColors(prev => ({ ...prev, text: e.target.value }))}
                  className="w-16 h-10 p-1"
                />
                <Input
                  value={colors.text}
                  onChange={(e) => setColors(prev => ({ ...prev, text: e.target.value }))}
                  className="flex-1 font-mono text-sm"
                />
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Design System Standards</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• H1: 48px (Desktop) / 34px (Mobile)</li>
                <li>• H2: 36px (Desktop) / 29px (Mobile)</li>
                <li>• Minimum 4.5:1 contrast ratio</li>
                <li>• 48px minimum touch targets</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Live Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Live Preview - {activeDevice.charAt(0).toUpperCase() + activeDevice.slice(1)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 p-6 border rounded-lg" style={{ 
            backgroundColor: colors.background,
            maxWidth: activeDevice === "mobile" ? "375px" : activeDevice === "tablet" ? "768px" : "100%"
          }}>
            <h1 style={{
              fontSize: `${deviceStyles.h1}px`,
              fontWeight: typography.fontWeight.heading,
              lineHeight: 1.2,
              color: colors.primary,
              margin: 0
            }}>
              AI Product Leader & Multi-time Founder
            </h1>
            
            <h2 style={{
              fontSize: `${deviceStyles.h2}px`,
              fontWeight: typography.fontWeight.heading,
              lineHeight: 1.3,
              color: colors.primary,
              margin: 0
            }}>
              Proven Track Record of AI Innovation
            </h2>
            
            <h3 style={{
              fontSize: `${deviceStyles.h3}px`,
              fontWeight: typography.fontWeight.heading,
              lineHeight: 1.4,
              color: colors.text,
              margin: 0
            }}>
              Enterprise AI Solutions Across MENA & Southeast Asia
            </h3>
            
            <p style={{
              fontSize: `${deviceStyles.body}px`,
              fontWeight: typography.fontWeight.body,
              lineHeight: typography.lineHeight,
              color: colors.text,
              margin: 0
            }}>
              7+ years scaling AI solutions from 0→1, securing $110K+ funding, and leading cross-cultural teams across diverse markets. Expert in compliance frameworks, regulatory navigation, and enterprise AI platform development.
            </p>

            <div className="flex gap-2 mt-4">
              <Badge style={{ backgroundColor: colors.secondary, color: "white" }}>50% Manual Review Reduction</Badge>
              <Badge style={{ backgroundColor: colors.accent, color: "white" }}>$110K+ Funding Secured</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CSS Export */}
      <Card>
        <CardHeader>
          <CardTitle>Generated CSS</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="text-xs bg-gray-100 p-4 rounded-lg overflow-x-auto">
            {generateCSS()}
          </pre>
          <Button className="mt-4" onClick={() => navigator.clipboard.writeText(generateCSS())}>
            Copy CSS to Clipboard
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}