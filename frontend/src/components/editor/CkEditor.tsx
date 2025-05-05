import React, { useState } from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
// @ts-ignore Needed because CKEditor type definitions might be incomplete or complex
import type { FileLoader } from '@ckeditor/ckeditor5-upload';
// @ts-ignore Needed because CKEditor type definitions might be incomplete or complex
import type { Editor } from '@ckeditor/ckeditor5-core';
// @ts-ignore - Internal type, might not be officially exported
import type { UploadAdapter } from '@ckeditor/ckeditor5-upload/src/filerepository';

const filtteredToolMenu = (toolbar: string[]) => {
  const removedMenuBar = ["imageUpload", "insertImage", "imageInsert"];
  return toolbar.filter((m: any) => !m.startsWith("menuBar:") && !removedMenuBar.includes(m)) as string[]
}

// Custom Upload Adapter
class MyUploadAdapter implements UploadAdapter {
    private loader: FileLoader;
    private onImageUpload: (file: File) => Promise<string>;

    constructor(loader: FileLoader, onImageUpload: (file: File) => Promise<string>) {
        this.loader = loader;
        this.onImageUpload = onImageUpload;
    }

    upload(): Promise<{ default: string }> {
        return this.loader.file.then((file: File) => new Promise((resolve, reject) => {
            // const reader = new FileReader();

            if (file) {
                console.log("File:", file.webkitRelativePath);
                //  reader.readAsDataURL(file);
                this.onImageUpload(file)
                  .then(imageUrl => {
                      resolve({ default: imageUrl });
                  })
                  .catch(error => {
                      console.error("Image upload failed:", error);
                      reject(error instanceof Error ? error.message : String(error));
                  });
            } else {
                reject('File is null or undefined.');
            }

        }));
    }

    abort(): void {
        // Abort logic if needed, for simplicity we can leave it empty
        console.log('Upload aborted');
    }
}

// Function to integrate the custom adapter
function MyCustomUploadAdapterPlugin(editor: Editor) {
	// @ts-ignore - CKEditor's Plugin API can be complex with types, especially for FileRepository
	editor.plugins.get( 'FileRepository' ).createUploadAdapter = (loader: FileLoader) => {
        // Access onImageUpload via editor config or another mechanism if needed
        // For simplicity, assuming it's accessible here. If not, might need context/closure.
        // This assumes `editor.config.get` could access component props, which might not be direct.
        // A better approach might involve passing props through the initial config or using React Context.
        
        // TEMPORARY WORKAROUND: Accessing via a potentially unstable property
        // It's generally better to pass config through editor.config
        // @ts-ignore - Accessing component props indirectly
        const componentProps = editor.config.get('_componentProps') as BuilderFormProps | undefined;
        if (!componentProps?.onImageUpload) {
             console.error("onImageUpload function not provided to CKEditor configuration!");
             // Return a dummy adapter or throw error
             return { upload: () => Promise.reject("Upload handler not configured"), abort: () => {} };
        }
        
		return new MyUploadAdapter(loader, componentProps.onImageUpload);
	};
}

interface BuilderFormProps {
  value: string;
  onChange: (data: string) => void;
  onImageUpload: (file: File) => Promise<string>;
}

const CKBuilderForm: React.FC<BuilderFormProps> = ({ value, onChange, onImageUpload }) => {
  const [toolbar, setToolbar] = useState<string[]>([]);
  return (
    <div className="w-[75vw] prose max-w-none prose-stone dark:prose-invert">
      {/* 
        CKEditor needs specific styling, often handled by its own CSS or plugins.
        The outer div provides width control. Min-height can be tricky as 
        the editor controls its own height based on content and configuration.
        Tailwind prose classes are added for basic typography styling of the *output*,
        but the editor UI itself might need separate theming/styling.
      */}
      <CKEditor
        editor={ClassicEditor as any}
         // @ts-ignore
        data={value}
        onChange={(_, editor) => {
          const data = editor.getData();
          onChange(data);
        }}
        config={{
          // Pass component props to the config for the plugin to access
          // @ts-ignore - Adding custom config property
          _componentProps: { onImageUpload }, 
          toolbar: toolbar.includes('uploadImage') ? toolbar : [...toolbar, 'uploadImage'],
          // @ts-ignore - Suppressing PluginConstructor type issue for custom function plugin
          extraPlugins: [ MyCustomUploadAdapterPlugin ],
        }}
        onReady={(editor) => {
            // You can store the "editor" and use when it is needed.
            console.log("Editor is ready to use!", editor);
            console.log("Toolbar:", filtteredToolMenu(Array.from(editor.ui.componentFactory.names())));
            setToolbar(filtteredToolMenu(Array.from(editor.ui.componentFactory.names())) as string[])
            // editor.ui.addToolbar
            editor.editing.view.change((writer:any) => {
              writer.setStyle(
                  "height",
                  "70vh",
                  editor.editing.view.document.getRoot() as any
              );
            });
        }}
      />
    </div>
  );
};

export default CKBuilderForm; 