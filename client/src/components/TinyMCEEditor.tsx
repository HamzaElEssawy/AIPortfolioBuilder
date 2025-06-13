import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Edit3, Save, Bold, Italic, List, Link, Underline } from 'lucide-react';

interface TinyMCEEditorProps {
  value: string;
  onChange: (content: string) => void;
  height?: number;
  placeholder?: string;
  disabled?: boolean;
}

export default function TinyMCEEditor({
  value,
  onChange,
  height = 200,
  placeholder = "Start typing...",
  disabled = false
}: TinyMCEEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState('');

  useEffect(() => {
    setTempValue(value || '');
  }, [value]);

  const handleSave = () => {
    onChange(tempValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempValue(value || '');
    setIsEditing(false);
  };

  const handleStartEdit = () => {
    setTempValue(value || '');
    setIsEditing(true);
  };

  const applyFormat = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      setTempValue(editorRef.current.innerHTML);
    }
  };

  const handleInput = () => {
    if (editorRef.current) {
      setTempValue(editorRef.current.innerHTML);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'b':
          e.preventDefault();
          applyFormat('bold');
          break;
        case 'i':
          e.preventDefault();
          applyFormat('italic');
          break;
        case 'u':
          e.preventDefault();
          applyFormat('underline');
          break;
      }
    }
  };

  useEffect(() => {
    if (isEditing && editorRef.current) {
      editorRef.current.innerHTML = tempValue;
      editorRef.current.focus();
    }
  }, [isEditing, tempValue]);

  if (!isEditing) {
    return (
      <div className="relative group">
        <div 
          className="min-h-[100px] p-3 border border-gray-300 rounded-md cursor-pointer hover:border-gray-400 transition-colors bg-white"
          onClick={handleStartEdit}
        >
          {value ? (
            <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: value }} />
          ) : (
            <div className="text-gray-400 italic">{placeholder}</div>
          )}
        </div>
        <Button
          size="sm"
          variant="outline"
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={handleStartEdit}
        >
          <Edit3 className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="border border-gray-300 rounded-md overflow-hidden bg-white">
        {/* Toolbar */}
        <div className="bg-gray-50 border-b border-gray-300 px-3 py-2 flex gap-1 flex-wrap">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => applyFormat('bold')}
            className="h-8 w-8 p-0"
            type="button"
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => applyFormat('italic')}
            className="h-8 w-8 p-0"
            type="button"
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => applyFormat('underline')}
            className="h-8 w-8 p-0"
            type="button"
          >
            <Underline className="h-4 w-4" />
          </Button>
          <div className="w-px bg-gray-300 mx-1" />
          <Button
            size="sm"
            variant="ghost"
            onClick={() => applyFormat('insertUnorderedList')}
            className="h-8 w-8 p-0"
            type="button"
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              const url = prompt('Enter URL:');
              if (url) applyFormat('createLink', url);
            }}
            className="h-8 w-8 p-0"
            type="button"
          >
            <Link className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Editor */}
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          className="min-h-[200px] p-3 focus:outline-none prose prose-sm max-w-none"
          style={{ height: `${height}px`, overflowY: 'auto' }}
          suppressContentEditableWarning={true}
          data-placeholder={placeholder}
        />
      </div>
      
      <div className="flex gap-2">
        <Button size="sm" onClick={handleSave} className="flex items-center gap-1">
          <Save className="h-4 w-4" />
          Save
        </Button>
        <Button size="sm" variant="outline" onClick={handleCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}