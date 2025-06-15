import { useRef, useState, useCallback, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface CaseStudyTextEditorProps {
  label: string;
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
  height?: number;
  className?: string;
}

export default function CaseStudyTextEditor({
  value,
  onChange,
  placeholder = "Enter content...",
  height = 120,
  label,
  className
}: CaseStudyTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const lastValueRef = useRef(value);
  const changeTimeoutRef = useRef<NodeJS.Timeout>();
  const isUpdatingRef = useRef(false);
  
  // Handle content changes without cursor jumping
  const handleContentChange = useCallback(() => {
    if (!editorRef.current || isUpdatingRef.current) return;
    
    const currentContent = editorRef.current.innerText || '';
    
    if (currentContent !== lastValueRef.current) {
      lastValueRef.current = currentContent;
      
      // Debounce the onChange call
      if (changeTimeoutRef.current) {
        clearTimeout(changeTimeoutRef.current);
      }
      
      changeTimeoutRef.current = setTimeout(() => {
        onChange(currentContent);
      }, 150);
    }
  }, [onChange]);

  // Initialize content only once
  useEffect(() => {
    if (!editorRef.current || isInitialized) return;
    
    if (value && value !== editorRef.current.innerText) {
      isUpdatingRef.current = true;
      editorRef.current.innerText = value;
      lastValueRef.current = value;
      isUpdatingRef.current = false;
    }
    
    setIsInitialized(true);
  }, [value, isInitialized]);

  // Handle external value changes (only when different from internal)
  useEffect(() => {
    if (!editorRef.current || !isInitialized || isUpdatingRef.current) return;
    
    const currentContent = editorRef.current.innerText || '';
    if (value !== currentContent && value !== lastValueRef.current) {
      isUpdatingRef.current = true;
      editorRef.current.innerText = value;
      lastValueRef.current = value;
      isUpdatingRef.current = false;
    }
  }, [value, isInitialized]);

  // Handle key events
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    // Allow normal typing behavior
    if (e.key === 'Enter') {
      // Let the browser handle Enter naturally
      setTimeout(handleContentChange, 0);
      return;
    }
    
    // Handle formatting shortcuts
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'b':
          e.preventDefault();
          document.execCommand('bold', false);
          setTimeout(handleContentChange, 0);
          break;
        case 'i':
          e.preventDefault();
          document.execCommand('italic', false);
          setTimeout(handleContentChange, 0);
          break;
        case 'u':
          e.preventDefault();
          document.execCommand('underline', false);
          setTimeout(handleContentChange, 0);
          break;
      }
    }
    
    // Handle content change for regular keys
    if (e.key.length === 1 || e.key === 'Backspace' || e.key === 'Delete') {
      setTimeout(handleContentChange, 0);
    }
  }, [handleContentChange]);

  // Handle paste events
  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    
    // Insert plain text at cursor
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      range.deleteContents();
      const textNode = document.createTextNode(text);
      range.insertNode(textNode);
      range.setStartAfter(textNode);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
    }
    
    setTimeout(handleContentChange, 0);
  }, [handleContentChange]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (changeTimeoutRef.current) {
        clearTimeout(changeTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}
      
      {/* Formatting Toolbar */}
      <div className="flex items-center gap-1 p-2 bg-gray-50 dark:bg-gray-800 border border-input rounded-t-md">
        <button
          type="button"
          className="px-2 py-1 text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
          onMouseDown={(e) => {
            e.preventDefault();
            document.execCommand('bold', false);
            setTimeout(handleContentChange, 0);
          }}
        >
          <strong>B</strong>
        </button>
        <button
          type="button"
          className="px-2 py-1 text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700 rounded italic"
          onMouseDown={(e) => {
            e.preventDefault();
            document.execCommand('italic', false);
            setTimeout(handleContentChange, 0);
          }}
        >
          I
        </button>
        <button
          type="button"
          className="px-2 py-1 text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700 rounded underline"
          onMouseDown={(e) => {
            e.preventDefault();
            document.execCommand('underline', false);
            setTimeout(handleContentChange, 0);
          }}
        >
          U
        </button>
        <div className="h-4 w-px bg-gray-300 dark:bg-gray-600 mx-1" />
        <span className="text-xs text-gray-500 dark:text-gray-400">
          Ctrl+B Bold, Ctrl+I Italic, Ctrl+U Underline
        </span>
      </div>

      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        className={cn(
          "w-full px-3 py-3 text-sm bg-background border border-input rounded-b-md border-t-0",
          "focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent",
          "min-h-[80px] max-h-[400px] overflow-y-auto",
          "prose prose-sm max-w-none dark:prose-invert",
          "leading-relaxed",
          className
        )}
        style={{ minHeight: height }}
        data-placeholder={placeholder}
        onInput={handleContentChange}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        onBlur={handleContentChange}
      />
    </div>
  );
}