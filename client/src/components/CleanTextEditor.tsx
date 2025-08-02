import { useRef, useEffect, useState } from 'react';
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
  const [editorKey, setEditorKey] = useState(0);
  const [isEditorReady, setIsEditorReady] = useState(false);

  const handleEditorChange = (content: string, editor: any) => {
    // Prevent cursor jumping by only updating when content actually changes
    if (content !== value && isEditorReady) {
      const cleanContent = sanitizeContent(content, mode);
      onChange(cleanContent);
    }
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
      paste_data_images: true,
      paste_as_text: mode === 'plain',
      browser_spellcheck: true,
      content_style: `
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
          font-size: 14px; 
          line-height: 1.6;
          color: #374151;
          margin: 8px;
          background: white;
        }
        p { margin: 0 0 1em 0; }
        strong, b { font-weight: 600; }
        ul, ol { margin: 0 0 1em 1.5em; }
        li { margin: 0 0 0.5em 0; }
        h1, h2, h3, h4, h5, h6 { margin: 1em 0 0.5em 0; font-weight: 600; }
      `,
      setup: (editor: any) => {
        editor.on('init', () => {
          setIsEditorReady(true);
        });
        
        editor.on('input change', (e: any) => {
          const content = editor.getContent();
          handleEditorChange(content, editor);
        });
        
        // Prevent cursor jumping on external updates
        editor.on('SetContent', (e: any) => {
          if (e.initial) return;
          
          // Store cursor position
          const bookmark = editor.selection.getBookmark(2, true);
          setTimeout(() => {
            if (bookmark && editor.selection) {
              try {
                editor.selection.moveToBookmark(bookmark);
              } catch (err) {
                // Ignore bookmark restoration errors
              }
            }
          }, 0);
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

    // Rich text mode with advanced features
    return {
      ...baseConfig,
      toolbar: 'bold italic underline | bullist numlist outdent indent | link | undo redo | removeformat | code',
      plugins: [
        'lists', 'link', 'autoresize', 'code', 'paste', 'searchreplace',
        'autolink', 'directionality', 'wordcount'
      ],
      valid_elements: 'p,br,strong,em,b,i,u,ul,ol,li,a[href|target],code',
      forced_root_block: 'p',
      paste_retain_style_properties: 'font-weight font-style text-decoration',
      link_target_list: [
        { title: 'Same window', value: '' },
        { title: 'New window', value: '_blank' }
      ],
      link_context_toolbar: true,
      smart_paste: true,
      paste_remove_styles_if_webkit: false,
      paste_preprocess: (plugin: any, args: any) => {
        // Clean pasted content but preserve basic formatting
        args.content = args.content.replace(/style="[^"]*"/g, '');
      }
    };
  };

  // Prevent unnecessary re-renders that cause cursor jumping
  useEffect(() => {
    if (editorRef.current && isEditorReady) {
      const currentContent = editorRef.current.getContent();
      if (currentContent !== value) {
        // Store cursor position before setting content
        const bookmark = editorRef.current.selection.getBookmark(2, true);
        editorRef.current.setContent(value);
        
        // Restore cursor position after a brief delay
        setTimeout(() => {
          if (bookmark && editorRef.current?.selection) {
            try {
              editorRef.current.selection.moveToBookmark(bookmark);
            } catch (err) {
              // Fallback: place cursor at end
              editorRef.current.selection.select(editorRef.current.getBody(), true);
              editorRef.current.selection.collapseToEnd();
            }
          }
        }, 10);
      }
    }
  }, [value, isEditorReady]);

  return (
    <div className="border border-gray-200 rounded-md overflow-hidden">
      <Editor
        key={editorKey}
        apiKey="no-api-key"
        onInit={(evt, editor) => {
          editorRef.current = editor;
          setIsEditorReady(true);
        }}
        value={value}
        init={getEditorConfig()}
        onEditorChange={() => {}} // Handle changes in setup instead
      />
    </div>
  );
}