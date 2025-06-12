import { useCallback, useRef } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

interface EnhancedTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  multiline?: boolean;
  className?: string;
}

export default function EnhancedTextEditor({
  value,
  onChange,
  placeholder,
  multiline = false,
  className = ""
}: EnhancedTextEditorProps) {
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    const newValue = e.target.value;
    const cursorPosition = e.target.selectionStart;
    
    onChange(newValue);
    
    // Restore cursor position after state update
    setTimeout(() => {
      if (multiline && textAreaRef.current) {
        textAreaRef.current.setSelectionRange(cursorPosition, cursorPosition);
      } else if (!multiline && inputRef.current) {
        inputRef.current.setSelectionRange(cursorPosition, cursorPosition);
      }
    }, 0);
  }, [onChange, multiline]);

  if (multiline) {
    return (
      <Textarea
        ref={textAreaRef}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className={`min-h-[120px] resize-y ${className}`}
        rows={6}
      />
    );
  }

  return (
    <Input
      ref={inputRef}
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      className={className}
    />
  );
}