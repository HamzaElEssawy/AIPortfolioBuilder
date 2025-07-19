import React, { useRef, useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface UltimateTextEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
  height?: number;
  label?: string;
  className?: string;
}

export default function UltimateTextEditor({
  value,
  onChange,
  placeholder = "Enter content...",
  height = 120,
  label,
  className
}: UltimateTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const lastValueRef = useRef(value);
  const changeTimeoutRef = useRef<NodeJS.Timeout>();
  
  // Clean HTML and convert to plain text with line breaks
  const cleanContent = useCallback((html: string): string => {
    return html
      // Replace div with line breaks first
      .replace(/<div><br><\/div>/g, '\n')
      .replace(/<div>/g, '\n')
      .replace(/<\/div>/g, '')
      // Replace br tags with line breaks
      .replace(/<br\s*\/?>/g, '\n')
      // Clean HTML entities
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      // Remove any remaining HTML tags
      .replace(/<[^>]*>/g, '')
      // Clean up multiple newlines and trim
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }, []);

  // Convert plain text to HTML for display
  const textToHtml = useCallback((text: string): string => {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/\n/g, '<br>');
  }, []);

  // Get cursor position in text content
  const getCursorPosition = useCallback((): number => {
    if (!editorRef.current) return 0;
    
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return 0;
    
    const range = selection.getRangeAt(0);
    const preCaretRange = range.cloneRange();
    preCaretRange.selectNodeContents(editorRef.current);
    preCaretRange.setEnd(range.endContainer, range.endOffset);
    
    // Convert HTML content to text and get length
    const htmlContent = preCaretRange.toString();
    return cleanContent(htmlContent).length;
  }, [cleanContent]);

  // Set cursor position in text content
  const setCursorPosition = useCallback((position: number) => {
    if (!editorRef.current) return;
    
    const selection = window.getSelection();
    if (!selection) return;
    
    // Find the correct position in the DOM
    const walker = document.createTreeWalker(
      editorRef.current,
      NodeFilter.SHOW_TEXT,
      null
    );
    
    let currentPos = 0;
    let targetNode = null;
    let targetOffset = 0;
    
    while (walker.nextNode()) {
      const node = walker.currentNode;
      const textLength = node.textContent?.length || 0;
      
      if (currentPos + textLength >= position) {
        targetNode = node;
        targetOffset = position - currentPos;
        break;
      }
      
      currentPos += textLength;
    }
    
    if (targetNode) {
      const range = document.createRange();
      range.setStart(targetNode, Math.min(targetOffset, targetNode.textContent?.length || 0));
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
    }
  }, []);

  // Handle content changes
  const handleContentChange = useCallback(() => {
    if (!editorRef.current) return;
    
    const cursorPos = getCursorPosition();
    const htmlContent = editorRef.current.innerHTML;
    const cleanText = cleanContent(htmlContent);
    
    if (cleanText !== lastValueRef.current) {
      lastValueRef.current = cleanText;
      
      // Debounce the onChange call
      if (changeTimeoutRef.current) {
        clearTimeout(changeTimeoutRef.current);
      }
      
      changeTimeoutRef.current = setTimeout(() => {
        onChange(cleanText);
      }, 300);
    }
  }, [onChange, getCursorPosition, cleanContent]);

  // Handle key events
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.deleteContents();
        
        const br = document.createElement('br');
        range.insertNode(br);
        
        // Move cursor after the break
        range.setStartAfter(br);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
        
        handleContentChange();
      }
      return;
    }
    
    // Handle formatting shortcuts
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'b':
          e.preventDefault();
          document.execCommand('bold', false);
          break;
        case 'i':
          e.preventDefault();
          document.execCommand('italic', false);
          break;
        case 'u':
          e.preventDefault();
          document.execCommand('underline', false);
          break;
      }
    }
  }, [handleContentChange]);

  // Initialize content
  useEffect(() => {
    if (!editorRef.current || !value) return;
    
    const htmlContent = textToHtml(value);
    if (editorRef.current.innerHTML !== htmlContent) {
      const cursorPos = isFocused ? getCursorPosition() : 0;
      editorRef.current.innerHTML = htmlContent;
      lastValueRef.current = value;
      
      if (isFocused && cursorPos > 0) {
        setTimeout(() => setCursorPosition(cursorPos), 0);
      }
    }
  }, [value, textToHtml, isFocused, getCursorPosition, setCursorPosition]);

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
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        className={cn(
          "w-full px-3 py-2 text-sm bg-background border border-input rounded-md",
          "focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent",
          "min-h-[80px] max-h-[400px] overflow-y-auto",
          "prose prose-sm max-w-none dark:prose-invert",
          className
        )}
        style={{ minHeight: height }}
        placeholder={placeholder}
        onInput={handleContentChange}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsFocused(true)}
        onBlur={() => {
          setIsFocused(false);
          handleContentChange();
        }}
        onPaste={(e) => {
          e.preventDefault();
          const text = e.clipboardData.getData('text/plain');
          const cleanText = cleanContent(text);
          document.execCommand('insertText', false, cleanText);
          handleContentChange();
        }}
        dangerouslySetInnerHTML={{ __html: value ? textToHtml(value) : '' }}
      />
    </div>
  );
}