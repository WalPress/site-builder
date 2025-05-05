import React from 'react';
import TinyEditor from './TinyEditor';


interface BuilderFormProps {
  value: string;
  onChange: (data: string) => void;
  onImageUpload: (file: File) => Promise<string>;
}

const BuilderForm: React.FC<BuilderFormProps> = ({ value, onChange, onImageUpload }) => {
  return (
    <div className="relative flex flex-row justify-between items-center mb-4 w-[70vw] h-full">
      <TinyEditor value={value} onChange={onChange} onImageUpload={onImageUpload} />
    </div>
  );
};

export default BuilderForm; 