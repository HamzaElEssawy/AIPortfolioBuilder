import { useRef, useEffect, useState, useCallback } from 'react';
import { Editor } from '@tinymce/tinymce-react';

interface AdvancedRichTextEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
  height?: number;
  mode?: 'rich' | 'minimal' | 'plain';
}

export default function AdvancedRichTextEditor({ 
  value, 
  onChange, 
  placeholder = "Enter content...", 
  height = 300,
  mode = 'rich'
}: AdvancedRichTextEditorProps) {
  const editorRef = useRef<any>(null);
  const [isReady, setIsReady] = useState(false);
  const [editorKey, setEditorKey] = useState(0);
  const lastValueRef = useRef(value);
  const isInternalChangeRef = useRef(false);

  // Force editor remount when mode changes
  useEffect(() => {
    setEditorKey(prev => prev + 1);
    setIsReady(false);
  }, [mode]);

  const handleContentChange = useCallback((content: string, editor: any) => {
    if (isInternalChangeRef.current || !isReady) return;

    // Clean content based on mode
    let cleanContent = content;
    
    if (mode === 'plain') {
      cleanContent = content.replace(/<[^>]*>/g, '').trim();
    } else if (mode === 'minimal') {
      // Allow only basic formatting
      cleanContent = content.replace(/<(?!\/?(?:p|br|strong|em|b|i)\b)[^>]*>/gi, '');
      cleanContent = cleanContent.replace(/\s*(style|class|data-[^=]*|id)="[^"]*"/gi, '');
    } else {
      // Rich mode - clean unwanted attributes
      cleanContent = content.replace(/data-mce-[^=]*="[^"]*"/g, '');
      cleanContent = content.replace(/\s*style="[^"]*"/g, '');
      cleanContent = content.replace(/<span[^>]*>([^<]*)<\/span>/g, '$1');
    }

    if (cleanContent !== lastValueRef.current) {
      lastValueRef.current = cleanContent;
      onChange(cleanContent);
    }
  }, [mode, onChange, isReady]);

  const getEditorConfig = () => {
    const baseConfig = {
      height,
      menubar: false,
      branding: false,
      statusbar: false,
      placeholder,
      promotion: false,
      skin: 'oxide',
      content_css: 'default',
      
      // Prevent cursor jumping
      setup: (editor: any) => {
        editor.on('init', () => {
          setIsReady(true);
          if (value) {
            isInternalChangeRef.current = true;
            editor.setContent(value);
            lastValueRef.current = value;
            setTimeout(() => {
              isInternalChangeRef.current = false;
            }, 100);
          }
        });

        // Handle content changes with proper debouncing
        let changeTimeout: NodeJS.Timeout;
        editor.on('input keyup paste', () => {
          if (isInternalChangeRef.current) return;
          
          clearTimeout(changeTimeout);
          changeTimeout = setTimeout(() => {
            const content = editor.getContent();
            handleContentChange(content, editor);
          }, 250);
        });

        // Fix cursor jumping on space
        editor.on('keydown', (e: any) => {
          if (e.key === ' ' && !isInternalChangeRef.current) {
            const bookmark = editor.selection.getBookmark(2, true);
            setTimeout(() => {
              try {
                if (bookmark && editor.selection) {
                  editor.selection.moveToBookmark(bookmark);
                }
              } catch (err) {
                // Bookmark restoration failed, ignore
              }
            }, 10);
          }
        });
      },

      content_style: `
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
          font-size: 14px; 
          line-height: 1.6;
          color: #374151;
          margin: 12px;
          background: white;
        }
        p { margin: 0 0 1em 0; }
        strong, b { font-weight: 600; }
        em, i { font-style: italic; }
        ul, ol { margin: 0 0 1em 1.5em; }
        li { margin: 0 0 0.5em 0; }
        h1, h2, h3, h4, h5, h6 { margin: 1.5em 0 0.5em 0; font-weight: 600; }
        a { color: #3b82f6; text-decoration: underline; }
        table { border-collapse: collapse; width: 100%; margin: 1em 0; }
        table td, table th { border: 1px solid #e5e7eb; padding: 8px 12px; }
        table th { background: #f9fafb; font-weight: 600; }
        code { background: #f3f4f6; padding: 2px 6px; border-radius: 4px; font-family: monospace; }
        pre { background: #f8f9fa; padding: 12px; border-radius: 6px; overflow-x: auto; }
      `
    };

    if (mode === 'plain') {
      return {
        ...baseConfig,
        toolbar: false,
        plugins: 'autoresize',
        forced_root_block: '',
        force_br_newlines: true,
        force_p_newlines: false,
      };
    }

    if (mode === 'minimal') {
      return {
        ...baseConfig,
        toolbar: 'bold italic | undo redo | removeformat',
        plugins: 'autoresize',
        valid_elements: 'p,br,strong,em,b,i',
        forced_root_block: 'p',
      };
    }

    // Rich mode with full features
    return {
      ...baseConfig,
      toolbar: 'undo redo | formatselect | bold italic underline strikethrough | forecolor backcolor | alignleft aligncenter alignright alignjustify | outdent indent | bullist numlist | blockquote | link unlink | image table | code | searchreplace | visualblocks | fullscreen | help',
      
      plugins: 'advlist autolink lists link image charmap preview searchreplace visualblocks code fullscreen media table help wordcount autoresize paste',
      
      // Basic formatting options
      block_formats: 'Paragraph=p; Heading 1=h1; Heading 2=h2; Heading 3=h3; Preformatted=pre',
      
      // Paste settings
      paste_data_images: true,
      paste_as_text: false,
      
      // Performance
      convert_urls: false,
      relative_urls: false,
    };
  };

  // Update content when value changes externally
  useEffect(() => {
    if (editorRef.current && isReady && value !== lastValueRef.current && !isInternalChangeRef.current) {
      isInternalChangeRef.current = true;
      
      const editor = editorRef.current;
      const selection = editor.selection;
      const range = selection ? selection.getRng() : null;
      
      editor.setContent(value);
      lastValueRef.current = value;
      
      if (range && selection) {
        setTimeout(() => {
          try {
            selection.setRng(range);
          } catch (err) {
            selection.select(editor.getBody(), true);
            selection.collapseToEnd();
          }
          isInternalChangeRef.current = false;
        }, 50);
      } else {
        setTimeout(() => {
          isInternalChangeRef.current = false;
        }, 50);
      }
    }
  }, [value, isReady]);

  return (
    <div className="w-full border border-gray-200 rounded-lg overflow-hidden shadow-sm bg-white">
      <Editor
        key={editorKey}
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