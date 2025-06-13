import { useRef, useEffect, useState, useCallback } from 'react';
import { Editor } from '@tinymce/tinymce-react';

interface AdvancedTextEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
  height?: number;
  mode?: 'rich' | 'minimal' | 'plain';
}

export default function AdvancedTextEditor({ 
  value, 
  onChange, 
  placeholder = "Enter content...", 
  height = 300,
  mode = 'rich'
}: AdvancedTextEditorProps) {
  const editorRef = useRef<any>(null);
  const [isEditorReady, setIsEditorReady] = useState(false);
  const lastValueRef = useRef(value);

  const sanitizeContent = useCallback((content: string, editorMode: string): string => {
    if (editorMode === 'plain') {
      return content.replace(/<[^>]*>/g, '').trim();
    }

    if (editorMode === 'minimal') {
      const allowedTags = ['p', 'br', 'strong', 'em', 'b', 'i'];
      let cleaned = content;
      
      // Remove all HTML tags except allowed ones
      cleaned = cleaned.replace(/<(?!\/?(?:p|br|strong|em|b|i)\b)[^>]*>/gi, '');
      cleaned = cleaned.replace(/\s*(style|class|data-[^=]*|id)="[^"]*"/gi, '');
      
      return cleaned.trim();
    }

    // Rich text mode - clean unwanted attributes but keep formatting
    let cleaned = content;
    
    // Remove React component metadata and unwanted attributes
    cleaned = cleaned.replace(/<div[^>]*data-replit-metadata[^>]*>.*?<\/div>/g, '');
    cleaned = cleaned.replace(/data-replit-metadata="[^"]*"/g, '');
    cleaned = cleaned.replace(/data-component-name="[^"]*"/g, '');
    cleaned = cleaned.replace(/class="[^"]*"/g, '');
    cleaned = cleaned.replace(/style="[^"]*--tw-[^"]*"/g, '');
    cleaned = cleaned.replace(/<p>\s*<\/p>/g, '');
    cleaned = cleaned.replace(/<div>\s*<\/div>/g, '');
    
    return cleaned.trim();
  }, []);

  const handleEditorChange = useCallback((content: string) => {
    if (isEditorReady && content !== lastValueRef.current) {
      const cleanContent = sanitizeContent(content, mode);
      lastValueRef.current = cleanContent;
      onChange(cleanContent);
    }
  }, [isEditorReady, mode, onChange, sanitizeContent]);

  const getEditorConfig = useCallback(() => {
    const baseConfig = {
      height,
      menubar: false,
      branding: false,
      statusbar: false,
      resize: false,
      paste_data_images: true,
      paste_as_text: mode === 'plain',
      browser_spellcheck: true,
      placeholder,
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
        a { color: #3b82f6; text-decoration: underline; }
        code { background: #f3f4f6; padding: 2px 4px; border-radius: 3px; font-family: monospace; }
      `,
      setup: (editor: any) => {
        editor.on('init', () => {
          setIsEditorReady(true);
        });
        
        editor.on('input change', () => {
          const content = editor.getContent();
          handleEditorChange(content);
        });
      }
    };

    if (mode === 'plain') {
      return {
        ...baseConfig,
        toolbar: false,
        plugins: ['autoresize'],
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
      valid_elements: 'p,br,strong,em,b,i,u,ul,ol,li,a[href|target],code,h1,h2,h3,h4,h5,h6',
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
  }, [height, mode, placeholder, handleEditorChange]);

  // Update editor content only when necessary to prevent cursor jumping
  useEffect(() => {
    if (editorRef.current && isEditorReady && value !== lastValueRef.current) {
      const currentContent = editorRef.current.getContent();
      if (currentContent !== value) {
        // Store cursor position before updating
        const selection = editorRef.current.selection;
        const bookmark = selection ? selection.getBookmark(2, true) : null;
        
        lastValueRef.current = value;
        editorRef.current.setContent(value);
        
        // Restore cursor position after content update
        if (bookmark && selection) {
          setTimeout(() => {
            try {
              selection.moveToBookmark(bookmark);
            } catch (err) {
              // If bookmark restoration fails, place cursor at end
              selection.select(editorRef.current.getBody(), true);
              selection.collapseToEnd();
            }
          }, 10);
        }
      }
    }
  }, [value, isEditorReady]);

  return (
    <div className="border border-gray-200 rounded-md overflow-hidden">
      <Editor
        apiKey="no-api-key"
        onInit={(evt, editor) => {
          editorRef.current = editor;
        }}
        initialValue={value}
        init={getEditorConfig()}
      />
    </div>
  );
}