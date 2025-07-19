import { useRef, useEffect, useState, useCallback } from 'react';
import { Editor } from '@tinymce/tinymce-react';

interface EnhancedTinyMCEEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
  height?: number;
  mode?: 'rich' | 'minimal' | 'plain';
}

export default function EnhancedTinyMCEEditor({ 
  value, 
  onChange, 
  placeholder = "Enter content...", 
  height = 300,
  mode = 'rich'
}: EnhancedTinyMCEEditorProps) {
  const editorRef = useRef<any>(null);
  const [isEditorReady, setIsEditorReady] = useState(false);
  const [editorId] = useState(() => `editor-${Math.random().toString(36).substr(2, 9)}`);
  const valueRef = useRef(value);
  const preventLoopRef = useRef(false);

  // Update ref when value changes
  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  const sanitizeContent = useCallback((content: string): string => {
    if (mode === 'plain') {
      return content.replace(/<[^>]*>/g, '').trim();
    }

    if (mode === 'minimal') {
      // Allow only basic formatting for minimal mode
      const allowedTags = /<\/?(?:p|br|strong|em|b|i)\b[^>]*>/gi;
      let cleaned = content.replace(/<(?!\/?(?:p|br|strong|em|b|i)\b)[^>]*>/gi, '');
      cleaned = cleaned.replace(/\s*(style|class|data-[^=]*|id)="[^"]*"/gi, '');
      return cleaned.trim();
    }

    // Rich text mode - clean unwanted attributes but keep formatting
    let cleaned = content;
    
    // Remove unwanted attributes and elements
    cleaned = cleaned.replace(/data-mce-[^=]*="[^"]*"/g, '');
    cleaned = cleaned.replace(/class="[^"]*"/g, '');
    cleaned = cleaned.replace(/style="[^"]*"/g, '');
    cleaned = cleaned.replace(/<span[^>]*>([^<]*)<\/span>/g, '$1');
    cleaned = cleaned.replace(/<div[^>]*>([^<]*)<\/div>/g, '<p>$1</p>');
    cleaned = cleaned.replace(/<p>\s*<\/p>/g, '');
    
    return cleaned.trim();
  }, [mode]);

  const handleEditorChange = useCallback((content: string) => {
    if (preventLoopRef.current || !isEditorReady) {
      return;
    }

    const cleanContent = sanitizeContent(content);
    if (cleanContent !== valueRef.current) {
      preventLoopRef.current = true;
      onChange(cleanContent);
      setTimeout(() => {
        preventLoopRef.current = false;
      }, 50);
    }
  }, [isEditorReady, onChange, sanitizeContent]);

  const getAdvancedEditorConfig = useCallback(() => {
    const baseConfig = {
      height,
      menubar: false,
      branding: false,
      statusbar: false,
      resize: 'both',
      placeholder,
      promotion: false,
      convert_urls: false,
      relative_urls: false,
      remove_script_host: false,
      document_base_url: '/',
      
      // Advanced content handling
      entity_encoding: 'raw',
      keep_styles: false,
      verify_html: false,
      cleanup: true,
      cleanup_on_startup: true,
      trim_span_elements: true,
      remove_trailing_brs: true,
      
      // Paste configuration
      paste_data_images: true,
      paste_as_text: mode === 'plain',
      smart_paste: true,
      paste_remove_styles_if_webkit: true,
      paste_strip_class_attributes: 'all',
      paste_retain_style_properties: mode === 'rich' ? 'font-weight font-style text-decoration' : '',
      
      // Advanced features
      browser_spellcheck: true,
      contextmenu: 'link image table',
      
      content_style: `
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; 
          font-size: 14px; 
          line-height: 1.6;
          color: #374151;
          margin: 12px;
          background: white;
          word-wrap: break-word;
        }
        p { margin: 0 0 1em 0; }
        strong, b { font-weight: 600; }
        em, i { font-style: italic; }
        ul, ol { margin: 0 0 1em 1.5em; padding: 0; }
        li { margin: 0 0 0.5em 0; }
        h1, h2, h3, h4, h5, h6 { 
          margin: 1.5em 0 0.5em 0; 
          font-weight: 600; 
          line-height: 1.2;
        }
        h1 { font-size: 2em; }
        h2 { font-size: 1.5em; }
        h3 { font-size: 1.25em; }
        a { color: #3b82f6; text-decoration: underline; }
        a:hover { color: #1d4ed8; }
        code { 
          background: #f3f4f6; 
          padding: 2px 6px; 
          border-radius: 4px; 
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          font-size: 0.9em;
        }
        pre { 
          background: #f8f9fa; 
          padding: 12px; 
          border-radius: 6px; 
          overflow-x: auto;
          border-left: 4px solid #3b82f6;
        }
        blockquote {
          margin: 1em 0;
          padding: 0 0 0 1em;
          border-left: 4px solid #e5e7eb;
          color: #6b7280;
          font-style: italic;
        }
        table {
          border-collapse: collapse;
          width: 100%;
          margin: 1em 0;
        }
        table td, table th {
          border: 1px solid #e5e7eb;
          padding: 8px 12px;
        }
        table th {
          background: #f9fafb;
          font-weight: 600;
        }
      `,

      setup: (editor: any) => {
        editor.on('init', () => {
          setIsEditorReady(true);
          // Set initial content without triggering change
          if (value && editor.getContent() !== value) {
            preventLoopRef.current = true;
            editor.setContent(value);
            setTimeout(() => {
              preventLoopRef.current = false;
            }, 100);
          }
        });

        // Handle content changes with debouncing
        let changeTimeout: NodeJS.Timeout;
        editor.on('input keyup setcontent', () => {
          clearTimeout(changeTimeout);
          changeTimeout = setTimeout(() => {
            const content = editor.getContent();
            handleEditorChange(content);
          }, 150);
        });

        // Prevent cursor jumping on external content updates
        editor.on('BeforeSetContent', (e: any) => {
          if (preventLoopRef.current) return;
          
          // Store selection before content change
          const bookmark = editor.selection.getBookmark(2, true);
          e.bookmark = bookmark;
        });

        editor.on('SetContent', (e: any) => {
          if (preventLoopRef.current || !e.bookmark) return;
          
          // Restore selection after content change
          setTimeout(() => {
            try {
              if (editor.selection && e.bookmark) {
                editor.selection.moveToBookmark(e.bookmark);
              }
            } catch (err) {
              // Bookmark restoration failed, place cursor at end
              try {
                editor.selection.select(editor.getBody(), true);
                editor.selection.collapseToEnd();
              } catch (err2) {
                // Ignore if selection fails
              }
            }
          }, 10);
        });
      }
    };

    if (mode === 'plain') {
      return {
        ...baseConfig,
        toolbar: false,
        plugins: ['autoresize', 'paste'],
        forced_root_block: '',
        force_br_newlines: true,
        force_p_newlines: false,
      };
    }

    if (mode === 'minimal') {
      return {
        ...baseConfig,
        toolbar: 'bold italic | undo redo | removeformat',
        plugins: ['autoresize', 'paste'],
        valid_elements: 'p,br,strong,em,b,i',
        forced_root_block: 'p',
      };
    }

    // Rich text mode with comprehensive features
    return {
      ...baseConfig,
      toolbar: [
        'undo redo | formatselect | bold italic underline strikethrough',
        'alignleft aligncenter alignright alignjustify | outdent indent',
        'bullist numlist | forecolor backcolor | removeformat',
        'link unlink | image media table | code fullscreen help'
      ].join(' | '),
      
      plugins: [
        'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
        'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
        'insertdatetime', 'media', 'table', 'help', 'wordcount', 'autoresize',
        'paste', 'directionality', 'emoticons', 'template', 'codesample'
      ],
      
      block_formats: 'Paragraph=p; Heading 1=h1; Heading 2=h2; Heading 3=h3; Heading 4=h4; Heading 5=h5; Heading 6=h6; Preformatted=pre',
      
      fontsize_formats: '8pt 10pt 12pt 14pt 16pt 18pt 24pt 36pt 48pt',
      
      font_formats: 'Arial=arial,helvetica,sans-serif; Courier New=courier new,courier,monospace; AkrutiKndPadmini=Akpdmi-n; Times New Roman=times new roman,times,serif',
      
      valid_elements: '*[*]',
      extended_valid_elements: 'script[src|async|defer|type|charset]',
      
      // Table configuration
      table_toolbar: 'tableprops tabledelete | tableinsertrowbefore tableinsertrowafter tabledeleterow | tableinsertcolbefore tableinsertcolafter tabledeletecol',
      table_appearance_options: false,
      table_grid: false,
      
      // Link configuration
      link_context_toolbar: true,
      link_target_list: [
        { title: 'Same window', value: '' },
        { title: 'New window', value: '_blank' }
      ],
      
      // Image configuration
      image_advtab: true,
      image_caption: true,
      image_title: true,
      
      // Code configuration
      codesample_languages: [
        { text: 'HTML/XML', value: 'markup' },
        { text: 'JavaScript', value: 'javascript' },
        { text: 'CSS', value: 'css' },
        { text: 'Python', value: 'python' },
        { text: 'TypeScript', value: 'typescript' },
        { text: 'JSON', value: 'json' }
      ],
      
      // Advanced paste options
      paste_preprocess: (plugin: any, args: any) => {
        // Clean pasted content
        args.content = args.content.replace(/style="[^"]*"/g, '');
        args.content = args.content.replace(/class="[^"]*"/g, '');
      }
    };
  }, [height, placeholder, mode, value, handleEditorChange]);

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
      <Editor
        id={editorId}
        apiKey="no-api-key"
        onInit={(evt, editor) => {
          editorRef.current = editor;
        }}
        value={value}
        init={getAdvancedEditorConfig()}
      />
    </div>
  );
}