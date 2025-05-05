import React, { PropsWithChildren } from 'react';
// import './Modal.css'; // Removed CSS import

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const Modal: React.FC<PropsWithChildren<ModalProps>> = ({
  isOpen,
  onClose,
  children,
}) => {
  if (!isOpen) {
    return null;
  }

  // Stop propagation prevents clicks inside the modal content from closing it
  const handleContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white p-8 rounded-lg shadow-xl relative min-w-[300px] max-w-[80%] max-h-[80%] overflow-y-auto"
        onClick={handleContentClick}
      >
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-2xl leading-none bg-transparent border-none cursor-pointer"
          onClick={onClose}
        >
          &times;
        </button>
        {children}
      </div>
    </div>
  );
};

export default Modal; 