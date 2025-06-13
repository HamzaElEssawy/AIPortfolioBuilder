import { useState, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Edit3, Save, Bold, Italic, List, AlignLeft } from 'lucide-react';

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
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value || '');

  useEffect(() => {
    setTempValue(value || '');
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTempValue(e.target.value);
  };

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

  const applyFormatting = (format: string) => {
    const textarea = document.querySelector('textarea[data-editor="true"]') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = tempValue.substring(start, end);
    let newText = '';

    switch (format) {
      case 'bold':
        newText = tempValue.substring(0, start) + `**${selectedText}**` + tempValue.substring(end);
        break;
      case 'italic':
        newText = tempValue.substring(0, start) + `*${selectedText}*` + tempValue.substring(end);
        break;
      case 'list':
        const lines = selectedText.split('\n');
        const listItems = lines.map(line => line.trim() ? `• ${line.trim()}` : line).join('\n');
        newText = tempValue.substring(0, start) + listItems + tempValue.substring(end);
        break;
      default:
        return;
    }

    setTempValue(newText);
  };

  if (!isEditing) {
    return (
      <div className="relative group">
        <div 
          className="min-h-[100px] p-3 border border-gray-300 rounded-md cursor-pointer hover:border-gray-400 transition-colors bg-white"
          onClick={handleStartEdit}
        >
          {value ? (
            <div className="whitespace-pre-wrap break-words">
              {value.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    .replace(/\*(.*?)\*/g, '<em>$1</em>')
                    .split('\n').map((line, i) => (
                <div key={i} dangerouslySetInnerHTML={{ __html: line || '<br>' }} />
              ))}
            </div>
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
      <div className="border border-gray-300 rounded-md overflow-hidden">
        <div className="bg-gray-50 border-b border-gray-300 px-3 py-2 flex gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => applyFormatting('bold')}
            className="h-8 w-8 p-0"
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => applyFormatting('italic')}
            className="h-8 w-8 p-0"
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => applyFormatting('list')}
            className="h-8 w-8 p-0"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
        <Textarea
          data-editor="true"
          value={tempValue}
          onChange={handleInputChange}
          placeholder={placeholder}
          disabled={disabled}
          className="border-0 resize-none focus:ring-0 rounded-none"
          style={{ height: `${height}px` }}
          autoFocus
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