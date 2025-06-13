import { useRef, useEffect, useState, useCallback } from 'react';
import { Editor } from '@tinymce/tinymce-react';

interface ProfessionalTextEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
  height?: number;
  mode?: 'rich' | 'minimal' | 'plain';
}

export default function ProfessionalTextEditor({ 
  value, 
  onChange, 
  placeholder = "Enter content...", 
  height = 300,
  mode = 'rich'
}: ProfessionalTextEditorProps) {
  const editorRef = useRef<any>(null);
  const [isEditorReady, setIsEditorReady] = useState(false);
  const [editorId] = useState(() => `editor-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
  const lastContentRef = useRef(value);
  const isUpdatingRef = useRef(false);

  const sanitizeContent = useCallback((content: string): string => {
    if (mode === 'plain') {
      return content.replace(/<[^>]*>/g, '').trim();
    }

    if (mode === 'minimal') {
      let cleaned = content.replace(/<(?!\/?(?:p|br|strong|em|b|i)\b)[^>]*>/gi, '');
      cleaned = cleaned.replace(/\s*(style|class|data-[^=]*|id)="[^"]*"/gi, '');
      return cleaned.trim();
    }

    // Rich text mode
    let cleaned = content;
    cleaned = cleaned.replace(/data-mce-[^=]*="[^"]*"/g, '');
    cleaned = cleaned.replace(/class="[^"]*"/g, '');
    cleaned = cleaned.replace(/<span[^>]*>([^<]*)<\/span>/g, '$1');
    cleaned = cleaned.replace(/<p>\s*<\/p>/g, '');
    
    return cleaned.trim();
  }, [mode]);

  const handleEditorChange = useCallback((content: string) => {
    if (isUpdatingRef.current || !isEditorReady) return;

    const cleanContent = sanitizeContent(content);
    if (cleanContent !== lastContentRef.current) {
      lastContentRef.current = cleanContent;
      onChange(cleanContent);
    }
  }, [isEditorReady, onChange, sanitizeContent]);

  const getEditorConfig = useCallback(() => {
    const baseConfig = {
      height,
      menubar: false,
      branding: false,
      statusbar: false,
      placeholder,
      promotion: false,
      
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
        code { background: #f3f4f6; padding: 2px 6px; border-radius: 4px; font-family: monospace; }
      `,

      setup: (editor: any) => {
        editor.on('init', () => {
          setIsEditorReady(true);
          if (value) {
            isUpdatingRef.current = true;
            editor.setContent(value);
            lastContentRef.current = value;
            setTimeout(() => {
              isUpdatingRef.current = false;
            }, 100);
          }
        });

        let changeTimeout: NodeJS.Timeout;
        editor.on('input keyup', () => {
          clearTimeout(changeTimeout);
          changeTimeout = setTimeout(() => {
            if (!isUpdatingRef.current) {
              const content = editor.getContent();
              handleEditorChange(content);
            }
          }, 300);
        });

        // Handle space bar specifically to prevent cursor jumping
        editor.on('keydown', (e: any) => {
          if (e.key === ' ' || e.keyCode === 32) {
            // Store cursor position before space
            const bookmark = editor.selection.getBookmark(2, true);
            setTimeout(() => {
              // Restore cursor position after space if content changed
              try {
                if (bookmark && editor.selection) {
                  editor.selection.moveToBookmark(bookmark);
                }
              } catch (err) {
                // Ignore restoration errors
              }
            }, 10);
          }
        });
      }
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
        plugins: ['autoresize'],
        valid_elements: 'p,br,strong,em,b,i',
        forced_root_block: 'p',
      };
    }

    // Rich text mode with comprehensive toolbar
    return {
      ...baseConfig,
      toolbar: [
        'undo redo | formatselect | bold italic underline strikethrough',
        'alignleft aligncenter alignright | outdent indent',
        'bullist numlist | forecolor backcolor | removeformat',
        'link table | code help'
      ].join(' | '),
      
      plugins: [
        'advlist autolink lists link charmap searchreplace visualblocks code table help wordcount autoresize'
      ],
      
      block_formats: 'Paragraph=p; Heading 1=h1; Heading 2=h2; Heading 3=h3; Preformatted=pre',
      
      valid_elements: 'p,br,strong,em,b,i,u,strike,h1,h2,h3,h4,h5,h6,ul,ol,li,a[href|target],table,thead,tbody,tr,td,th,code,pre',
      
      table_toolbar: 'tableprops tabledelete | tableinsertrowbefore tableinsertrowafter tabledeleterow',
      
      link_target_list: [
        { title: 'Same window', value: '' },
        { title: 'New window', value: '_blank' }
      ],
      
      paste_data_images: true,
      paste_as_text: false,
      smart_paste: true,
      paste_remove_styles_if_webkit: true,
    };
  }, [height, placeholder, mode, value, handleEditorChange]);

  // Update editor content when value changes externally
  useEffect(() => {
    if (editorRef.current && isEditorReady && value !== lastContentRef.current && !isUpdatingRef.current) {
      isUpdatingRef.current = true;
      
      // Store cursor position
      const selection = editorRef.current.selection;
      const range = selection ? selection.getRng() : null;
      
      editorRef.current.setContent(value);
      lastContentRef.current = value;
      
      // Restore cursor position
      if (range && selection) {
        setTimeout(() => {
          try {
            selection.setRng(range);
          } catch (err) {
            // Place cursor at end if restoration fails
            selection.select(editorRef.current.getBody(), true);
            selection.collapseToEnd();
          }
          isUpdatingRef.current = false;
        }, 50);
      } else {
        setTimeout(() => {
          isUpdatingRef.current = false;
        }, 50);
      }
    }
  }, [value, isEditorReady]);

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm bg-white">
      <Editor
        id={editorId}
        apiKey="no-api-key"
        onInit={(evt, editor) => {
          editorRef.current = editor;
        }}
        value={value}
        init={getEditorConfig()}
      />
    </div>
  );
}