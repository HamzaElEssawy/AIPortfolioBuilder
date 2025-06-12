import { useRef, useEffect } from 'react';
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

  const handleEditorChange = (content: string) => {
    onChange(content);
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <div className="border rounded-lg overflow-hidden">
        <Editor
          apiKey="no-api-key"
          onInit={(evt, editor) => (editorRef.current = editor)}
          value={value}
          onEditorChange={handleEditorChange}
          init={{
            height: height,
            menubar: false,
            placeholder: placeholder,
            plugins: [
              'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
              'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
              'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
            ],
            toolbar: 'undo redo | blocks | ' +
              'bold italic forecolor | alignleft aligncenter ' +
              'alignright alignjustify | bullist numlist outdent indent | ' +
              'removeformat | help',
            content_style: `
              body { 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; 
                font-size: 14px;
                line-height: 1.6;
                color: #374151;
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
            statusbar: false,
            resize: false,
            elementpath: false,
            browser_spellcheck: true,
            contextmenu: false,
            paste_as_text: true,
            paste_retain_style_properties: "color font-size",
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
                  { title: 'Heading 3', format: 'h3' },
                  { title: 'Heading 4', format: 'h4' }
                ]
              },
              {
                title: 'Blocks',
                items: [
                  { title: 'Paragraph', format: 'p' },
                  { title: 'Blockquote', format: 'blockquote' },
                  { title: 'Code', format: 'code' }
                ]
              }
            ]
          }}
        />
      </div>
    </div>
  );
}