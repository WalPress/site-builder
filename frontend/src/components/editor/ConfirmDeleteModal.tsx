import React from 'react';
import { Loader } from '../loader'; // Adjusted path assuming Loader is in components/loader

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  siteName: string;
  isDeleting?: boolean;
}

const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  siteName,
  isDeleting = false,
}) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-300 ease-in-out">
      <div className="bg-card text-card-foreground p-6 rounded-lg shadow-xl w-full max-w-md transform transition-all duration-300 ease-in-out scale-100">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-foreground">Delete Site</h3>
          {/* You could add an X icon here to close the modal as well */}
          {/* <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X size={20} /> 
          </button> */}
        </div>
        <p className="text-sm text-muted-foreground mb-6">
          Are you sure you want to delete the site "<strong>{siteName}</strong>"? <br />
          This action cannot be undone.
        </p>
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium rounded-md border border-input bg-transparent hover:bg-accent hover:text-accent-foreground disabled:opacity-50"
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium rounded-md bg-destructive text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50 flex items-center justify-center min-w-[100px]"
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader className="mr-2 h-4 w-4 text-destructive-foreground" /> 
                Deleting...
              </>
            ) : (
              'Delete Site'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteModal; 