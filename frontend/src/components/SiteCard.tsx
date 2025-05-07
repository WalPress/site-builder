import React, { useState } from 'react';
import { FiTrash2, FiCircle } from 'react-icons/fi'; // Example icons
import Button from './Button';
import { EditIcon, Loader } from 'lucide-react';
import { Link } from 'react-router-dom';
import ConfirmDeleteModal from './editor/ConfirmDeleteModal';

type SiteStatus = 'Unlinked' | 'Draft' | 'Live';

interface SiteCardProps {
  id: string;
  title: string;
  status: SiteStatus;
  imageUrl: string;
  lastEdited: string;
  description: string;
  blobId?: string;
  actionText: string;
  onActionClick?: () => void;
  onDeleteClick?: () => void;
  isDeleting?: boolean;
}

const StatusBadge: React.FC<{ status: SiteStatus }> = ({ status }) => {
  let colorClasses = '';
  switch (status) {
    case 'Unlinked': colorClasses = 'text-orange-500 bg-orange-100 dark:bg-orange-900 dark:text-orange-300'; break;
    case 'Draft': colorClasses = 'text-pink-500 bg-pink-100 dark:bg-pink-900 dark:text-pink-300'; break;
    case 'Live': colorClasses = 'text-green-500 bg-green-100 dark:bg-green-900 dark:text-green-300'; break;
  }

  return (
    <span className={`absolute top-3 left-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClasses}`}>
      <FiCircle className="-ml-0.5 mr-1.5 h-2 w-2 fill-current" />
      {status}
    </span>
  );
};

const SiteCard: React.FC<SiteCardProps> = ({
  id,
  title,
  status,
  imageUrl,
  lastEdited,
  description,
  blobId,
  actionText,
  onActionClick,
  onDeleteClick,
  isDeleting
}) => {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handleDeleteClick = () => {
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (onDeleteClick) {
      onDeleteClick();
    }
    setIsDeleteModalOpen(false);
  };

  return (
    <>
      <div className="bg-card text-card-foreground rounded-lg shadow-sm overflow-hidden border border-border">
        <div className="relative h-40 bg-gray-200 dark:bg-gray-700"> {/* Image container */}
          <img src={imageUrl} alt={`${title} cover`} className="w-full h-full object-cover" />
          <StatusBadge status={status} />
          {blobId && (
            <span className="absolute top-3 right-3 text-xs text-muted-foreground opacity-75">
              Blob ID: {blobId}
            </span>
          )}
        </div>

        <div className="p-4">
          <div className="flex justify-between items-center mb-1">
            <h3 className="text-lg font-semibold text-foreground truncate">{title}</h3>
            <Link to={`/app/sites/${id}/edit`} className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center ml-2 shrink-0">
              <EditIcon className="w-4 h-4 mr-1" />
              Edit site
            </Link>
          </div>
          <p className="text-xs text-muted-foreground flex items-center mb-2">
            <FiCircle className="w-2 h-2 mr-1.5 fill-current opacity-50" /> Last edited {lastEdited}
          </p>
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2"> {/* Limit description lines */}
            {description}
          </p>

          <div className="flex w-full justify-between items-center border-t border-border pt-3">
            <Button 
              onClick={onActionClick}
              variant="outline"
            >
              {actionText}
            </Button>
            <Button 
              onClick={handleDeleteClick}
              variant="danger"
              className='!rounded-[100%]'
              aria-label="Delete site"
            >
              {isDeleting ? <Loader /> : <FiTrash2 className="w-4 h-4 text-red-500" />}
            </Button>
          </div>
        </div>
      </div>
      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        siteName={title}
        isDeleting={isDeleting}
      />
    </>
  );
};

export default SiteCard; 