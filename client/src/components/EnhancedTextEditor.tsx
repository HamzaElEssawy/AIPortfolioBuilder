import { useState, useCallback, useRef, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

interface EnhancedTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  multiline?: boolean;
  className?: string;
  label?: string;
}

export default function EnhancedTextEditor({
  value,
  onChange,
  placeholder,
  multiline = false,
  className = "",
  label
}: EnhancedTextEditorProps) {
  const [localValue, setLocalValue] = useState(value);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout>();

  // Update local value when prop value changes
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    
    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    // Set new timer to save after 1.5 seconds of no typing
    debounceTimerRef.current = setTimeout(() => {
      onChange(newValue);
    }, 1500);
  }, [onChange]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  if (multiline) {
    return (
      <div className="space-y-2">
        {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
        <Textarea
          ref={textAreaRef}
          value={localValue}
          onChange={handleChange}
          placeholder={placeholder}
          className={`min-h-[120px] resize-y focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${className}`}
          rows={6}
        />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
      <Input
        ref={inputRef}
        value={localValue}
        onChange={handleChange}
        placeholder={placeholder}
        className={`focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${className}`}
      />
    </div>
  );
}