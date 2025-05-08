import React, { useState, useEffect, useRef } from 'react';
import Modal from '../Modal'; // Assuming Modal is in ../components
import Input from '../Input';
import Button from '../Button';
import useSite from '../../hooks/useSite';
import { useNavigate } from 'react-router-dom';

interface CreateSiteFormProps {
  open: boolean;
  onClose: () => void;
}

const CreateSiteForm: React.FC<CreateSiteFormProps> = ({ open, onClose }) => {
  const { createSite } = useSite();
  const [siteTitle, setSiteTitle] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  // Focus the input when the modal opens
  useEffect(() => {
    if (open) {
      // Timeout helps ensure the element is rendered and focusable
      setTimeout(() => inputRef.current?.focus(), 100);
      setSiteTitle(''); // Reset title on open
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form submission
    if (siteTitle.trim()) {
      const siteId = await createSite(siteTitle.trim());
      if (siteId) {
        navigate(`/app/sites/${siteId}/edit`);
        onClose();
      }
    }
  };

  const handleClose = () => {
    setSiteTitle(''); // Clear title on close
    onClose();
  };

  return (
    <Modal isOpen={open} onClose={handleClose}>
      {/* Override Modal content styles */}
      <div className="w-[548px] text-left flex flex-col items-start bg-white">
        {/* Header */}
        <h2 id="create-site-title" className="text-lg font-semibold text-gray-800 mb-1">
          Set site's title
        </h2>
        <p id="create-site-desc" className="text-sm text-gray-600 mb-4">
          Name your site so you can easily identify it.
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="w-full">
          <div className="mb-4 w-full">
            <Input
              ref={inputRef}
              label="Site's title"
              type="text"
              id="siteTitle"
              value={siteTitle}
              onChange={(e) => setSiteTitle(e.target.value)}
              placeholder="Enter your site's title"
              className="w-full border border-gray-300 rounded px-3 py-2 mt-1 bg-background focus:outline-none focus:ring-1 focus:ring-green-500"
              aria-describedby="create-site-desc"
              required // Make the field required
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-start w-full mt-6 gap-4">
            <Button
              type="submit" // This is the primary action button
              className=""
              variant="primary"
              disabled={!siteTitle.trim()}
            >
              Open site editor
            </Button>
            <Button
              type="button"
              onClick={handleClose}
              className=""
              variant="secondary"
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default CreateSiteForm; 