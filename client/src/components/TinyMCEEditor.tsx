import { useRef, useState, useEffect } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Edit3, Save } from 'lucide-react';

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
  const editorRef = useRef<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value);

  useEffect(() => {
    setTempValue(value);
  }, [value]);

  const handleEditorChange = (content: string) => {
    setTempValue(content);
  };

  const handleSave = () => {
    onChange(tempValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempValue(value);
    setIsEditing(false);
  };

  if (!isEditing) {
    return (
      <div className="relative group">
        <div 
          className="min-h-[100px] p-3 border border-gray-300 rounded-md cursor-pointer hover:border-gray-400 transition-colors"
          onClick={() => setIsEditing(true)}
        >
          {value ? (
            <div dangerouslySetInnerHTML={{ __html: value }} />
          ) : (
            <div className="text-gray-400 italic">{placeholder}</div>
          )}
        </div>
        <Button
          size="sm"
          variant="outline"
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => setIsEditing(true)}
        >
          <Edit3 className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="tinymce-wrapper">
        <Editor
          apiKey="no-api-key"
          onInit={(evt, editor) => {
            editorRef.current = editor;
          }}
          value={tempValue}
          onEditorChange={handleEditorChange}
          disabled={disabled}
          init={{
            height,
            menubar: false,
            plugins: [
              'advlist', 'autolink', 'lists', 'link', 'charmap', 
              'searchreplace', 'visualblocks', 'code', 'fullscreen',
              'insertdatetime', 'table', 'help', 'wordcount', 'paste'
            ],
            toolbar: 'undo redo | formatselect | ' +
              'bold italic underline strikethrough | alignleft aligncenter ' +
              'alignright alignjustify | bullist numlist outdent indent | ' +
              'removeformat | help',
            content_style: `
              body { 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; 
                font-size: 14px;
                line-height: 1.6;
                color: #374151;
                padding: 12px;
              }
              p { margin: 0 0 8px 0; }
              ul, ol { margin: 0 0 8px 0; padding-left: 24px; }
              h1, h2, h3, h4, h5, h6 { margin: 0 0 12px 0; color: #1f2937; }
            `,
            placeholder,
            branding: false,
            promotion: false,
            resize: true,
            statusbar: false,
            elementpath: false,
            skin: 'oxide',
            theme: 'silver',
            paste_as_text: true,
            paste_word_valid_elements: 'b,strong,i,em,u,s,a,p,br,ul,ol,li',
            valid_elements: 'p,br,strong,b,em,i,u,s,a[href],ul,ol,li,h1,h2,h3,h4,h5,h6',
            forced_root_block: 'p',
            force_br_newlines: false,
            force_p_newlines: true,
            convert_newlines_to_brs: false,
            setup: (editor) => {
              editor.on('init', () => {
                if (tempValue && editor.getContent() !== tempValue) {
                  editor.setContent(tempValue);
                }
              });
            }
          }}
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