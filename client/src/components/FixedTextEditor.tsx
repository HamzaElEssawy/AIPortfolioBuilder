import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Bold, Italic, List, Link } from "lucide-react";

interface FixedTextEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
  height?: number;
  label?: string;
}

export default function FixedTextEditor({
  value,
  onChange,
  placeholder = "Enter content...",
  height = 200,
  label
}: FixedTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const lastContentRef = useRef<string>('');

  // Save and restore cursor position
  const saveCursorPosition = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || !editorRef.current) return null;
    
    const range = selection.getRangeAt(0);
    const preCaretRange = range.cloneRange();
    preCaretRange.selectNodeContents(editorRef.current);
    preCaretRange.setEnd(range.endContainer, range.endOffset);
    
    return preCaretRange.toString().length;
  }, []);

  const restoreCursorPosition = useCallback((position: number) => {
    if (!editorRef.current) return;
    
    const selection = window.getSelection();
    if (!selection) return;
    
    const createRange = (node: Node, chars: { count: number }): Range | null => {
      if (chars.count === 0) {
        const range = document.createRange();
        range.setStart(node, 0);
        range.collapse(true);
        return range;
      }
      
      if (node.nodeType === Node.TEXT_NODE) {
        const textLength = node.textContent?.length || 0;
        if (chars.count <= textLength) {
          const range = document.createRange();
          range.setStart(node, chars.count);
          range.collapse(true);
          return range;
        }
        chars.count -= textLength;
      } else {
        for (let i = 0; i < node.childNodes.length; i++) {
          const range = createRange(node.childNodes[i], chars);
          if (range) return range;
        }
      }
      return null;
    };
    
    const range = createRange(editorRef.current, { count: position });
    if (range) {
      selection.removeAllRanges();
      selection.addRange(range);
    }
  }, []);

  // Initialize content without affecting cursor
  useEffect(() => {
    if (editorRef.current && value !== lastContentRef.current) {
      const cursorPosition = saveCursorPosition();
      
      // Only update if content actually changed
      if (editorRef.current.innerHTML !== value) {
        editorRef.current.innerHTML = value || '';
        lastContentRef.current = value;
        
        // Restore cursor if we had one
        if (cursorPosition !== null && isFocused) {
          setTimeout(() => restoreCursorPosition(cursorPosition), 0);
        }
      }
    }
  }, [value, isFocused, saveCursorPosition, restoreCursorPosition]);

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      const content = editorRef.current.innerHTML;
      if (content !== lastContentRef.current) {
        lastContentRef.current = content;
        onChange(content);
      }
    }
  }, [onChange]);

  const execCommand = useCallback((command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleInput();
  }, [handleInput]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Handle common shortcuts
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'b':
          e.preventDefault();
          execCommand('bold');
          break;
        case 'i':
          e.preventDefault();
          execCommand('italic');
          break;
        case 'u':
          e.preventDefault();
          execCommand('underline');
          break;
      }
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
    handleInput(); // Ensure final content is saved
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      
      {/* Formatting Toolbar */}
      <div className="flex gap-1 p-2 border border-gray-200 rounded-t-md bg-gray-50">
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => execCommand('bold')}
          className="h-8 w-8 p-0"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => execCommand('italic')}
          className="h-8 w-8 p-0"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => execCommand('insertUnorderedList')}
          className="h-8 w-8 p-0"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => {
            const url = prompt('Enter URL:');
            if (url) execCommand('createLink', url);
          }}
          className="h-8 w-8 p-0"
        >
          <Link className="h-4 w-4" />
        </Button>
      </div>

      {/* Editor Content */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className={`
          w-full p-3 border border-gray-300 rounded-b-md resize-none
          focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          ${isFocused ? 'ring-2 ring-blue-500 border-blue-500' : ''}
        `}
        style={{ 
          height: `${height}px`, 
          minHeight: '100px',
          overflowY: 'auto'
        }}
        data-placeholder={placeholder}
        suppressContentEditableWarning={true}
      />
      
      <style dangerouslySetInnerHTML={{
        __html: `
          [contenteditable]:empty::before {
            content: attr(data-placeholder);
            color: #9ca3af;
            pointer-events: none;
          }
        `
      }} />
    </div>
  );
}