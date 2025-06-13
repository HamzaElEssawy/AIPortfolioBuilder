import { useRef, useState, useEffect } from 'react';
import { Editor } from '@tinymce/tinymce-react';
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
  const [tempValue, setTempValue] = useState('');
  const [editorKey, setEditorKey] = useState(0);

  useEffect(() => {
    setTempValue(value || '');
  }, [value]);

  const handleEditorChange = (content: string) => {
    setTempValue(content);
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
    const content = value || '';
    setTempValue(content);
    setIsEditing(true);
    // Force re-render of editor with new key
    setEditorKey(prev => prev + 1);
  };

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
      <div className="border border-gray-300 rounded-md overflow-hidden">
        <Editor
          key={editorKey}
          apiKey="no-api-key"
          onInit={(evt, editor) => {
            editorRef.current = editor;
          }}
          initialValue={tempValue}
          onEditorChange={handleEditorChange}
          disabled={disabled}
          init={{
            height,
            menubar: false,
            plugins: [
              'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
              'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
              'insertdatetime', 'media', 'table', 'help', 'wordcount', 'emoticons'
            ],
            toolbar: 'undo redo | blocks | ' +
              'bold italic underline strikethrough | alignleft aligncenter ' +
              'alignright alignjustify | bullist numlist outdent indent | ' +
              'removeformat | link image | table | emoticons | help',
            content_style: `
              body { 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; 
                font-size: 14px;
                line-height: 1.6;
                color: #374151;
                margin: 8px;
              }
              p { margin: 0 0 8px 0; }
              ul, ol { margin: 0 0 8px 0; padding-left: 20px; }
              h1, h2, h3, h4, h5, h6 { margin: 0 0 12px 0; color: #1f2937; }
              blockquote { 
                border-left: 4px solid #d1d5db; 
                margin: 0 0 8px 0; 
                padding-left: 12px; 
                color: #6b7280; 
                font-style: italic; 
              }
              table { border-collapse: collapse; width: 100%; }
              th, td { border: 1px solid #d1d5db; padding: 8px; text-align: left; }
              th { background-color: #f9fafb; font-weight: 600; }
            `,
            placeholder,
            branding: false,
            promotion: false,
            resize: true,
            statusbar: true,
            elementpath: false,
            skin: 'oxide',
            theme: 'silver',
            paste_as_text: false,
            paste_word_valid_elements: 'b,strong,i,em,u,s,a,p,br,ul,ol,li,h1,h2,h3,h4,h5,h6,blockquote',
            valid_elements: 'p,br,strong,b,em,i,u,s,strike,a[href|target],ul,ol,li,h1,h2,h3,h4,h5,h6,blockquote,table,thead,tbody,tr,th,td',
            forced_root_block: 'p',
            force_br_newlines: false,
            force_p_newlines: true,
            convert_newlines_to_brs: false,
            entity_encoding: 'raw',
            image_advtab: true,
            image_caption: true,
            image_uploadtab: false,
            link_assume_external_targets: true,
            link_context_toolbar: true,
            table_use_colgroups: true,
            table_responsive_width: true,
            setup: (editor) => {
              editor.on('init', () => {
                setTimeout(() => {
                  editor.focus();
                }, 100);
              });
              
              editor.on('focus', () => {
                if (!editor.getContent() && tempValue) {
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