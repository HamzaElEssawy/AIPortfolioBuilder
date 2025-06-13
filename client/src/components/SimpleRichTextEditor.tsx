import { useRef } from 'react';
import { Editor } from '@tinymce/tinymce-react';

interface SimpleRichTextEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
  height?: number;
  mode?: 'rich' | 'minimal' | 'plain';
}

export default function SimpleRichTextEditor({ 
  value, 
  onChange, 
  placeholder = "Enter content...", 
  height = 300,
  mode = 'rich'
}: SimpleRichTextEditorProps) {
  const editorRef = useRef<any>(null);

  const handleEditorChange = (content: string) => {
    onChange(content);
  };

  const getToolbarConfig = () => {
    if (mode === 'plain') return false;
    if (mode === 'minimal') return 'bold italic | bullist numlist | link';
    return 'undo redo | formatselect | bold italic underline strikethrough | forecolor backcolor | alignleft aligncenter alignright alignjustify | bullist numlist | outdent indent | link | removeformat | help';
  };

  const getPluginsConfig = () => {
    if (mode === 'plain') return '';
    if (mode === 'minimal') return 'lists link';
    return 'advlist autolink lists link charmap preview anchor searchreplace visualblocks code fullscreen insertdatetime media table help wordcount';
  };

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
      <Editor
        apiKey="no-api-key"
        onInit={(evt, editor) => {
          editorRef.current = editor;
        }}
        value={value}
        onEditorChange={handleEditorChange}
        init={{
          height,
          menubar: false,
          branding: false,
          statusbar: false,
          placeholder,
          plugins: getPluginsConfig(),
          toolbar: getToolbarConfig(),
          content_style: `
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
              font-size: 14px; 
              line-height: 1.6;
              color: #374151;
              margin: 16px;
            }
            p { margin: 0 0 1em 0; }
            h1, h2, h3, h4, h5, h6 { margin: 1.5em 0 0.5em 0; font-weight: 600; }
            ul, ol { margin: 0 0 1em 1.5em; }
            li { margin: 0 0 0.5em 0; }
          `,
          block_formats: 'Paragraph=p; Heading 1=h1; Heading 2=h2; Heading 3=h3',
          browser_spellcheck: true,
          paste_data_images: false,
          convert_urls: false,
          relative_urls: false,
        }}
      />
    </div>
  );
}