import { useCallback, useRef, useEffect } from "react";
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
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const cursorPositionRef = useRef<number>(0);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    const newValue = e.target.value;
    cursorPositionRef.current = e.target.selectionStart || 0;
    onChange(newValue);
  }, [onChange]);

  // Restore cursor position after value changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (multiline && textAreaRef.current) {
        textAreaRef.current.setSelectionRange(cursorPositionRef.current, cursorPositionRef.current);
        textAreaRef.current.focus();
      } else if (!multiline && inputRef.current) {
        inputRef.current.setSelectionRange(cursorPositionRef.current, cursorPositionRef.current);
        inputRef.current.focus();
      }
    }, 0);

    return () => clearTimeout(timer);
  }, [value, multiline]);

  if (multiline) {
    return (
      <div className="space-y-2">
        {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
        <Textarea
          ref={textAreaRef}
          value={value}
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
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className={`focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${className}`}
      />
    </div>
  );
}