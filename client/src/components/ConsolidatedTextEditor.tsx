import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import { Button } from "@/components/ui/button";
import { Bold, Italic, List, Type, Save } from "lucide-react";

interface ConsolidatedTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  onSave?: () => void;
  placeholder?: string;
  className?: string;
  enableRichText?: boolean;
}

export interface TextEditorRef {
  getContent: () => string;
  setContent: (content: string) => void;
  focus: () => void;
}

const ConsolidatedTextEditor = forwardRef<TextEditorRef, ConsolidatedTextEditorProps>(
  ({ content, onChange, onSave, placeholder = "Enter content...", className = "", enableRichText = true }, ref) => {
    const [internalContent, setInternalContent] = useState(content);
    const [isEditing, setIsEditing] = useState(false);
    const editorRef = useRef<HTMLDivElement>(null);
    const [lastCursorPosition, setLastCursorPosition] = useState(0);

    useImperativeHandle(ref, () => ({
      getContent: () => internalContent,
      setContent: (newContent: string) => {
        setInternalContent(newContent);
        if (editorRef.current) {
          editorRef.current.innerHTML = newContent;
        }
      },
      focus: () => {
        editorRef.current?.focus();
      }
    }));

    useEffect(() => {
      setInternalContent(content);
      if (editorRef.current && !isEditing) {
        editorRef.current.innerHTML = content;
      }
    }, [content, isEditing]);

    const saveCursorPosition = () => {
      if (editorRef.current) {
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          const preCaretRange = range.cloneRange();
          preCaretRange.selectNodeContents(editorRef.current);
          preCaretRange.setEnd(range.endContainer, range.endOffset);
          setLastCursorPosition(preCaretRange.toString().length);
        }
      }
    };

    const restoreCursorPosition = () => {
      if (editorRef.current && lastCursorPosition !== undefined) {
        try {
          const selection = window.getSelection();
          const range = document.createRange();
          
          let currentPos = 0;
          const walker = document.createTreeWalker(
            editorRef.current,
            NodeFilter.SHOW_TEXT,
            null
          );

          let textNode = walker.nextNode();
          while (textNode) {
            const nodeLength = textNode.textContent?.length || 0;
            if (currentPos + nodeLength >= lastCursorPosition) {
              range.setStart(textNode, lastCursorPosition - currentPos);
              range.setEnd(textNode, lastCursorPosition - currentPos);
              break;
            }
            currentPos += nodeLength;
            textNode = walker.nextNode();
          }

          if (selection) {
            selection.removeAllRanges();
            selection.addRange(range);
          }
        } catch (error) {
          // Cursor restoration failed, continue without error
        }
      }
    };

    const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
      setIsEditing(true);
      saveCursorPosition();
      
      const target = e.currentTarget;
      let newContent = target.innerHTML;
      
      // Clean up common HTML issues
      newContent = newContent
        .replace(/<div><br><\/div>/g, '\n')
        .replace(/<div>/g, '\n')
        .replace(/<\/div>/g, '')
        .replace(/<br\s*\/?>/g, '\n')
        .replace(/&nbsp;/g, ' ')
        .trim();

      setInternalContent(newContent);
      onChange(newContent);
      
      setTimeout(() => {
        restoreCursorPosition();
        setIsEditing(false);
      }, 0);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        saveCursorPosition();
        
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          range.deleteContents();
          const textNode = document.createTextNode('\n');
          range.insertNode(textNode);
          range.setStartAfter(textNode);
          range.setEndAfter(textNode);
          selection.removeAllRanges();
          selection.addRange(range);
        }
        
        handleInput(e as any);
      }
    };

    const executeCommand = (command: string, value?: string) => {
      if (editorRef.current) {
        editorRef.current.focus();
        document.execCommand(command, false, value);
        handleInput({ currentTarget: editorRef.current } as any);
      }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
      e.preventDefault();
      const text = e.clipboardData.getData('text/plain');
      const selection = window.getSelection();
      
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.deleteContents();
        const textNode = document.createTextNode(text);
        range.insertNode(textNode);
        range.setStartAfter(textNode);
        range.setEndAfter(textNode);
        selection.removeAllRanges();
        selection.addRange(range);
        handleInput({ currentTarget: editorRef.current } as any);
      }
    };

    return (
      <div className={`border rounded-lg ${className}`}>
        {enableRichText && (
          <div className="flex items-center gap-2 p-2 border-b bg-gray-50">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => executeCommand('bold')}
              className="h-8 w-8 p-0"
            >
              <Bold className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => executeCommand('italic')}
              className="h-8 w-8 p-0"
            >
              <Italic className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => executeCommand('insertUnorderedList')}
              className="h-8 w-8 p-0"
            >
              <List className="h-4 w-4" />
            </Button>
            <div className="flex-1" />
            {onSave && (
              <Button
                size="sm"
                onClick={onSave}
                className="gap-2"
              >
                <Save className="h-4 w-4" />
                Save
              </Button>
            )}
          </div>
        )}
        
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          onFocus={() => setIsEditing(true)}
          onBlur={() => setIsEditing(false)}
          className="p-4 min-h-[120px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
          style={{ whiteSpace: 'pre-wrap' }}
          suppressContentEditableWarning={true}
          dangerouslySetInnerHTML={{ __html: internalContent }}
        />
        
        {!enableRichText && onSave && (
          <div className="p-2 border-t bg-gray-50">
            <Button
              size="sm"
              onClick={onSave}
              className="gap-2 ml-auto flex"
            >
              <Save className="h-4 w-4" />
              Save
            </Button>
          </div>
        )}
      </div>
    );
  }
);

ConsolidatedTextEditor.displayName = "ConsolidatedTextEditor";

export default ConsolidatedTextEditor;