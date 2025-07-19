import React, { useRef, useEffect, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface RobustTextEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
  height?: number;
  label?: string;
  className?: string;
  disabled?: boolean;
}

export default function RobustTextEditor({
  value,
  onChange,
  placeholder = "Start typing...",
  height = 120,
  label,
  className,
  disabled = false
}: RobustTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const lastValueRef = useRef<string>('');
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Clean text content by removing HTML and normalizing line breaks
  const cleanContent = useCallback((htmlContent: string): string => {
    if (!htmlContent) return '';
    
    // Create a temporary div to parse HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    
    // Convert HTML structure to plain text with line breaks
    const processNode = (node: Node): string => {
      if (node.nodeType === Node.TEXT_NODE) {
        return node.textContent || '';
      }
      
      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as Element;
        let result = '';
        
        // Handle block elements with line breaks
        const isBlockElement = ['DIV', 'P', 'BR'].includes(element.tagName);
        
        if (element.tagName === 'BR') {
          return '\n';
        }
        
        // Process child nodes
        Array.from(node.childNodes).forEach((child, index) => {
          result += processNode(child);
        });
        
        // Add line break after block elements (except the last one)
        if (isBlockElement && element.tagName !== 'BR') {
          result += '\n';
        }
        
        return result;
      }
      
      return '';
    };
    
    let cleanText = processNode(tempDiv);
    
    // Clean up excessive line breaks and whitespace
    cleanText = cleanText
      .replace(/\n\s*\n\s*\n/g, '\n\n') // Max two consecutive line breaks
      .replace(/^\n+/, '') // Remove leading line breaks
      .replace(/\n+$/, ''); // Remove trailing line breaks
    
    return cleanText;
  }, []);

  // Convert plain text to HTML for display
  const textToHtml = useCallback((text: string): string => {
    if (!text) return '';
    
    return text
      .split('\n')
      .map(line => line || '<br>') // Empty lines become <br>
      .join('<div></div>')
      .replace(/<div><\/div>/g, '<br>'); // Convert empty divs to br tags
  }, []);

  // Handle content changes
  const handleContentChange = useCallback(() => {
    if (!editorRef.current || disabled) return;
    
    const htmlContent = editorRef.current.innerHTML;
    const cleanText = cleanContent(htmlContent);
    
    if (cleanText !== lastValueRef.current) {
      lastValueRef.current = cleanText;
      
      // Debounce onChange calls
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      
      saveTimeoutRef.current = setTimeout(() => {
        onChange(cleanText);
      }, 300);
    }
  }, [cleanContent, onChange, disabled]);

  // Initialize editor content
  useEffect(() => {
    if (!editorRef.current || !isInitialized) return;
    
    const displayContent = textToHtml(value);
    
    if (editorRef.current.innerHTML !== displayContent) {
      const selection = window.getSelection();
      const range = selection?.rangeCount ? selection.getRangeAt(0) : null;
      let cursorOffset = 0;
      
      // Save cursor position
      if (range && editorRef.current.contains(range.startContainer)) {
        cursorOffset = range.startOffset;
      }
      
      editorRef.current.innerHTML = displayContent;
      lastValueRef.current = value;
      
      // Restore cursor position
      if (cursorOffset > 0) {
        try {
          const textNode = editorRef.current.firstChild;
          if (textNode && textNode.nodeType === Node.TEXT_NODE) {
            const newRange = document.createRange();
            newRange.setStart(textNode, Math.min(cursorOffset, textNode.textContent?.length || 0));
            newRange.collapse(true);
            selection?.removeAllRanges();
            selection?.addRange(newRange);
          }
        } catch (error) {
          // Ignore cursor restoration errors
        }
      }
    }
  }, [value, textToHtml, isInitialized]);

  // Handle keyboard events
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (disabled) {
      e.preventDefault();
      return;
    }

    // Handle Enter key
    if (e.key === 'Enter') {
      e.preventDefault();
      
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        
        // Insert line break
        const br = document.createElement('br');
        range.deleteContents();
        range.insertNode(br);
        
        // Move cursor after line break
        range.setStartAfter(br);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
        
        handleContentChange();
      }
    }
    
    // Handle common formatting shortcuts
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
  }, [disabled, handleContentChange]);

  // Handle paste events
  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    if (disabled) {
      e.preventDefault();
      return;
    }

    e.preventDefault();
    
    const clipboardData = e.clipboardData;
    const pastedText = clipboardData.getData('text/plain');
    
    if (pastedText) {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.deleteContents();
        
        // Insert cleaned text
        const textNode = document.createTextNode(pastedText);
        range.insertNode(textNode);
        
        // Move cursor to end of inserted text
        range.setStartAfter(textNode);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
        
        handleContentChange();
      }
    }
  }, [disabled, handleContentChange]);

  // Initialize editor on mount
  useEffect(() => {
    if (editorRef.current && !isInitialized) {
      setIsInitialized(true);
    }
  }, [isInitialized]);

  // Cleanup timeouts
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
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
        contentEditable={!disabled}
        className={cn(
          "w-full px-3 py-2 border border-gray-300 rounded-md",
          "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
          "dark:bg-gray-800 dark:border-gray-600 dark:text-white",
          "overflow-y-auto resize-none",
          disabled && "bg-gray-100 dark:bg-gray-700 cursor-not-allowed opacity-60",
          className
        )}
        style={{ minHeight: `${height}px` }}
        data-placeholder={placeholder}
        onInput={handleContentChange}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        suppressContentEditableWarning={true}
      />
      <style dangerouslySetInnerHTML={{
        __html: `
          div[contenteditable="true"]:empty:before {
            content: attr(data-placeholder);
            color: #9ca3af;
            pointer-events: none;
          }
        `
      }} />
    </div>
  );
}