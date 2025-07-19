import { useRef, useEffect } from 'react';
import { Editor } from '@tinymce/tinymce-react';

interface TinyMCEEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
  height?: number;
  mode?: 'rich' | 'minimal' | 'plain';
}

export default function TinyMCEEditor({ 
  value, 
  onChange, 
  placeholder = "Enter content...", 
  height = 300,
  mode = 'rich'
}: TinyMCEEditorProps) {
  const editorRef = useRef<any>(null);

  const handleEditorChange = (content: string) => {
    if (mode === 'plain') {
      const textOnly = content.replace(/<[^>]*>/g, '');
      onChange(textOnly);
    } else {
      onChange(content);
    }
  };

  const editorInit = {
    height,
    menubar: false,
    branding: false,
    statusbar: false,
    placeholder,
    skin: 'oxide',
    content_css: 'default',
    
    plugins: mode === 'rich' 
      ? 'advlist autolink lists link image charmap preview anchor searchreplace visualblocks code fullscreen insertdatetime media table code help wordcount'
      : mode === 'minimal' 
        ? 'lists link autolink'
        : '',
    
    toolbar: mode === 'rich' 
      ? 'undo redo | blocks | bold italic forecolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat | help'
      : mode === 'minimal'
        ? 'bold italic | bullist numlist | link'
        : false,

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

    setup: (editor: any) => {
      editor.on('init', () => {
        if (value) {
          editor.setContent(value);
        }
      });
    },

    // Basic configuration
    block_formats: 'Paragraph=p; Heading 1=h1; Heading 2=h2; Heading 3=h3',
    
    // Prevent cursor jumping
    browser_spellcheck: true,
    
    // Clean paste
    paste_as_text: mode === 'plain',
    paste_data_images: false,
    
    // Performance
    convert_urls: false,
    relative_urls: false,
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
        init={editorInit}
      />
    </div>
  );
}