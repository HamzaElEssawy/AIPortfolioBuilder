import { useRef, useEffect } from 'react';
import { Editor } from '@tinymce/tinymce-react';

interface TinyMCEEditorProps {
  value: string;
  onChange: (content: string) => void;
  height?: number;
  placeholder?: string;
  disabled?: boolean;
}

export default function TinyMCEEditor({
  value,
  onChange,
  height = 200,
  placeholder = "Start typing...",
  disabled = false
}: TinyMCEEditorProps) {
  const editorRef = useRef<any>(null);

  const handleEditorChange = (content: string) => {
    onChange(content);
  };

  return (
    <div className="tinymce-wrapper">
      <Editor
        apiKey="no-api-key"
        onInit={(evt, editor) => {
          editorRef.current = editor;
        }}
        value={value}
        onEditorChange={handleEditorChange}
        disabled={disabled}
        init={{
          height,
          menubar: false,
          plugins: [
            'advlist', 'autolink', 'lists', 'link', 'charmap', 
            'searchreplace', 'visualblocks', 'code', 'fullscreen',
            'insertdatetime', 'table', 'help', 'wordcount', 'paste'
          ],
          toolbar: 'undo redo | formatselect | ' +
            'bold italic underline strikethrough | alignleft aligncenter ' +
            'alignright alignjustify | bullist numlist outdent indent | ' +
            'removeformat | fullscreen | help',
          content_style: `
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; 
              font-size: 14px;
              line-height: 1.6;
              color: #374151;
              padding: 12px;
            }
            p { margin: 0 0 8px 0; }
            ul, ol { margin: 0 0 8px 0; padding-left: 24px; }
            h1, h2, h3, h4, h5, h6 { margin: 0 0 12px 0; color: #1f2937; }
          `,
          placeholder,
          branding: false,
          promotion: false,
          resize: true,
          statusbar: true,
          elementpath: false,
          skin: 'oxide',
          theme: 'silver',
          paste_as_text: true,
          paste_word_valid_elements: 'b,strong,i,em,u,s,a,p,br,ul,ol,li',
          valid_elements: 'p,br,strong,b,em,i,u,s,a[href],ul,ol,li,h1,h2,h3,h4,h5,h6',
          forced_root_block: 'p',
          force_br_newlines: false,
          force_p_newlines: true,
          convert_newlines_to_brs: false,
          setup: (editor) => {
            editor.on('init', () => {
              // Ensure editor is properly initialized
              if (value && editor.getContent() !== value) {
                editor.setContent(value);
              }
            });
          }
        }}
      />
    </div>
  );
}