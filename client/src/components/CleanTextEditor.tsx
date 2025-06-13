import { useRef, useEffect } from 'react';
import { Editor } from '@tinymce/tinymce-react';

interface CleanTextEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
  height?: number;
  mode?: 'rich' | 'minimal' | 'plain';
}

export default function CleanTextEditor({ 
  value, 
  onChange, 
  placeholder = "Enter content...", 
  height = 300,
  mode = 'rich'
}: CleanTextEditorProps) {
  const editorRef = useRef<any>(null);

  const handleEditorChange = (content: string) => {
    // Clean the content to remove unwanted HTML/CSS
    const cleanContent = sanitizeContent(content, mode);
    onChange(cleanContent);
  };

  const sanitizeContent = (content: string, editorMode: string): string => {
    if (editorMode === 'plain') {
      // For plain text fields, strip all HTML
      return content.replace(/<[^>]*>/g, '').trim();
    }

    if (editorMode === 'minimal') {
      // For minimal rich text, allow only basic formatting
      const allowedTags = ['<p>', '</p>', '<br>', '<strong>', '</strong>', '<em>', '</em>', '<b>', '</b>', '<i>', '</i>'];
      let cleaned = content;
      
      // Remove all HTML tags except allowed ones
      cleaned = cleaned.replace(/<(?!\/?(?:p|br|strong|em|b|i)\b)[^>]*>/gi, '');
      
      // Remove style attributes and data attributes
      cleaned = cleaned.replace(/\s*(style|class|data-[^=]*|id)="[^"]*"/gi, '');
      
      return cleaned.trim();
    }

    // For rich text mode, allow more formatting but clean unwanted attributes
    let cleaned = content;
    
    // Remove React component metadata
    cleaned = cleaned.replace(/<div[^>]*data-replit-metadata[^>]*>.*?<\/div>/g, '');
    cleaned = cleaned.replace(/data-replit-metadata="[^"]*"/g, '');
    cleaned = cleaned.replace(/data-component-name="[^"]*"/g, '');
    
    // Remove Tailwind CSS classes and inline styles with CSS variables
    cleaned = cleaned.replace(/class="[^"]*"/g, '');
    cleaned = cleaned.replace(/style="[^"]*--tw-[^"]*"/g, '');
    
    // Remove empty paragraphs and divs
    cleaned = cleaned.replace(/<p>\s*<\/p>/g, '');
    cleaned = cleaned.replace(/<div>\s*<\/div>/g, '');
    
    return cleaned.trim();
  };

  const getEditorConfig = () => {
    const baseConfig = {
      height,
      menubar: false,
      branding: false,
      statusbar: false,
      resize: false,
      content_style: `
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
          font-size: 14px; 
          line-height: 1.6;
          color: #374151;
          margin: 8px;
        }
        p { margin: 0 0 1em 0; }
        strong, b { font-weight: 600; }
      `,
      setup: (editor: any) => {
        editor.on('change', () => {
          const content = editor.getContent();
          handleEditorChange(content);
        });
      }
    };

    if (mode === 'plain') {
      return {
        ...baseConfig,
        toolbar: false,
        plugins: [],
        forced_root_block: '',
        force_br_newlines: true,
        force_p_newlines: false,
      };
    }

    if (mode === 'minimal') {
      return {
        ...baseConfig,
        toolbar: 'bold italic | undo redo',
        plugins: ['autoresize'],
        valid_elements: 'p,br,strong,em,b,i',
        forced_root_block: 'p',
      };
    }

    // Rich text mode
    return {
      ...baseConfig,
      toolbar: 'bold italic underline | bullist numlist | undo redo | removeformat',
      plugins: ['lists', 'autoresize'],
      valid_elements: 'p,br,strong,em,b,i,u,ul,ol,li',
      forced_root_block: 'p',
    };
  };

  return (
    <div className="border border-gray-200 rounded-md overflow-hidden">
      <Editor
        apiKey="no-api-key"
        onInit={(evt, editor) => editorRef.current = editor}
        initialValue={value}
        init={getEditorConfig()}
      />
    </div>
  );
}