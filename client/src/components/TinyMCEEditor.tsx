import { useRef, useEffect, useState } from 'react';
import { Editor } from '@tinymce/tinymce-react';

interface TinyMCEEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
  height?: number;
  label?: string;
}

export default function TinyMCEEditor({
  value,
  onChange,
  placeholder = "Enter content...",
  height = 300,
  label
}: TinyMCEEditorProps) {
  const editorRef = useRef<any>(null);
  const [isEditorReady, setIsEditorReady] = useState(false);

  const handleEditorChange = (content: string, editor: any) => {
    onChange(content);
  };

  const handleInit = (evt: any, editor: any) => {
    editorRef.current = editor;
    setIsEditorReady(true);
    
    // Set initial content if provided
    if (value && value !== editor.getContent()) {
      editor.setContent(value);
    }
  };

  // Update editor content when value prop changes
  useEffect(() => {
    if (isEditorReady && editorRef.current && value !== editorRef.current.getContent()) {
      editorRef.current.setContent(value || '');
    }
  }, [value, isEditorReady]);

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
        <Editor
          apiKey="no-api-key"
          onInit={handleInit}
          initialValue={value || ''}
          onEditorChange={handleEditorChange}
          init={{
            height: height,
            menubar: false,
            statusbar: true,
            placeholder: placeholder,
            plugins: [
              'advlist', 'autolink', 'lists', 'link', 'charmap',
              'searchreplace', 'visualblocks', 'code', 'fullscreen',
              'insertdatetime', 'table', 'wordcount', 'help'
            ],
            toolbar: 'undo redo | formatselect | ' +
              'bold italic underline | alignleft aligncenter alignright alignjustify | ' +
              'bullist numlist outdent indent | link | removeformat | help',
            content_style: `
              body { 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; 
                font-size: 14px;
                line-height: 1.6;
                color: #374151;
                margin: 8px;
                padding: 8px;
              }
              p { margin: 0 0 1em 0; }
              h1, h2, h3, h4, h5, h6 { 
                margin: 0 0 0.8em 0; 
                color: #1f2937;
                font-weight: 600;
              }
              ul, ol { margin: 0 0 1em 1.5em; }
              li { margin: 0 0 0.5em 0; }
              a { color: #2563eb; text-decoration: underline; }
              blockquote {
                border-left: 4px solid #e5e7eb;
                margin: 0 0 1em 0;
                padding: 0.5em 0 0.5em 1em;
                background: #f9fafb;
              }
            `,
            skin: 'oxide',
            content_css: 'default',
            branding: false,
            promotion: false,
            elementpath: false,
            resize: false,
            browser_spellcheck: true,
            contextmenu: false,
            paste_as_text: false,
            paste_retain_style_properties: "color font-size font-weight",
            formats: {
              bold: { inline: 'strong' },
              italic: { inline: 'em' },
              underline: { inline: 'u' },
              strikethrough: { inline: 's' }
            },
            style_formats: [
              {
                title: 'Headings',
                items: [
                  { title: 'Heading 1', format: 'h1' },
                  { title: 'Heading 2', format: 'h2' },
                  { title: 'Heading 3', format: 'h3' }
                ]
              },
              {
                title: 'Blocks',
                items: [
                  { title: 'Paragraph', format: 'p' },
                  { title: 'Blockquote', format: 'blockquote' }
                ]
              }
            ],
            setup: (editor: any) => {
              editor.on('init', () => {
                // Ensure editor is focusable and editable
                editor.getBody().setAttribute('contenteditable', 'true');
                editor.getBody().style.cursor = 'text';
              });
            }
          }}
        />
      </div>
    </div>
  );
}