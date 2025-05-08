

import React, { useRef } from 'react';
import { Editor } from '@tinymce/tinymce-react';

interface TinyEditorProps {
  value: string;
  onChange: (data: string) => void;
  onImageUpload: (file: File) => Promise<string>;
}

const TinyEditor: React.FC<TinyEditorProps> = ({ value, onChange }) => {
  const editorRef = useRef<Editor | unknown>(null);
  return (
    <div className="w-[75vw] max-w-full">        
      <Editor
        tinymceScriptSrc='/tinymce/tinymce.min.js'
        onInit={(_evt, editor) => editorRef.current = editor}
        // initialValue={value}
        value={value}
        init={{
          height: "75vh",
          menubar: true,
          plugins: [
            'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
            'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
            'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
          ],
          toolbar: 'undo redo | blocks | ' +
            'bold italic forecolor | alignleft aligncenter ' +
            'alignright alignjustify | bullist numlist outdent indent | ' +
            'removeformat | help',
          content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }'
        }}
        onEditorChange={(content) => {
            onChange(content);
        }}
        licenseKey='gpl'
        // onImageUpload={async (blobInfo, success, failure) => {
        //     const file = new File([blobInfo.blob()], blobInfo.filename(), { type: blobInfo.mimetype() });
        //     try {
        //         const url = await onImageUpload(file);
        //         success(url);
        //     } catch (err) { 
        //         failure('Could not upload image: ' + err);
        //     }
        // }}
      />
    </div>
  );
};

export default TinyEditor; 