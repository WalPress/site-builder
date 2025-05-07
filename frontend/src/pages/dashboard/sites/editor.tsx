import React, { useEffect, useState, useRef } from 'react';
import dayjs from 'dayjs';
import { TimerIcon } from 'lucide-react';
import BuilderForm from '../../../components/editor/builderform';
import Button from '../../../components/Button';
import DeploymentModal from '../../../components/DeploymentModal';
import { useParams } from 'react-router-dom';
import useSite from '../../../hooks/useSite';

const EditorPage: React.FC = () => {
  const [isDeployModalOpen, setIsDeployModalOpen] = useState(false);
  const { id } = useParams<{ id: string }>();
  const { getSite, currentSite, updateSite,  handleFileUpload, isUploading, isSaving, isLoading, isDeploying } = useSite();
  const [editorData, setEditorData] = useState('');

  // State for editable title
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editableTitle, setEditableTitle] = useState('');
  const titleInputRef = useRef<HTMLInputElement>(null);

  const handleEditorChange = (data: string) => setEditorData(data);

  useEffect(() => {
    if (id) {
      getSite(id);
    } else {
      console.log('No id found');
    }
  }, [id]);

  useEffect(() => {
    if (currentSite) {
      setEditableTitle(currentSite.name);
      if (!editorData || editorData !== currentSite.content) {
         setEditorData(currentSite.content || '<p>Start building your site here!</p>');
      }
    }
  }, [currentSite]);

  useEffect(() => {
    if (isEditingTitle) {
      titleInputRef.current?.focus();
      titleInputRef.current?.select();
    }
  }, [isEditingTitle]);

  const handleDeployClick = () => {
    setIsDeployModalOpen(true);
  };

  const handleFinalDeploy = (epoch: string) => {
    console.log('Final Deploy Confirmed! Epoch:', epoch, 'Content:', editorData);
    // Add actual deployment logic here, using epoch and editorData
    // setIsDeployModalOpen(false); // Modal closes itself now
  };
  console.log('Current Site:', currentSite);

  const handleSave = async () => {
    console.log('Saving content:', editorData);
    if (currentSite?.id) {
      await updateSite(currentSite.id, editableTitle, editorData);
    } else {
      console.log('No id found');
    }
  };

  const handleTitleUpdate = async () => {
    setIsEditingTitle(false);
    const trimmedTitle = editableTitle.trim();
    if (!trimmedTitle) {
      setEditableTitle(currentSite?.name || ''); 
      return;
    }
    if (currentSite && currentSite.name !== trimmedTitle) {
      console.log('Updating title to:', trimmedTitle);
      await updateSite(currentSite.id, trimmedTitle, editorData); 
    }
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleTitleUpdate();
    } else if (e.key === 'Escape') {
      setEditableTitle(currentSite?.name || '');
      setIsEditingTitle(false);
    }
  };

  const handleCloseModal = () => {
    setIsDeployModalOpen(false);
  }

  return (
    <>
      <div className="flex flex-row justify-between items-center mb-4">
        <div className="flex flex-col gap-2 w-full">
          <p className="inline-flex items-center text-sm text-gray-500">
            <TimerIcon className="w-4 h-4 mr-2" /> Last edited: {dayjs(currentSite?.updatedAt).fromNow()}
          </p>
          {isEditingTitle ? (
             <input
               ref={titleInputRef}
               type="text"
               value={editableTitle}
               onChange={(e) => setEditableTitle(e.target.value)}
               onBlur={handleTitleUpdate}
               onKeyDown={handleTitleKeyDown}
               className="text-2xl font-semibold bg-transparent border-b border-gray-400 focus:outline-none focus:border-blue-500 dark:text-white dark:border-gray-600 dark:focus:border-blue-400 w-full"
             />
          ) : (
            <div onClick={() => setIsEditingTitle(true)} className="cursor-pointer group">
               <h1 className="text-2xl font-semibold text-gray-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                 {editableTitle || 'Untitled Site'}
                 <span className="text-sm ml-2 opacity-0 group-hover:opacity-70 transition-opacity">✏️</span>
               </h1>
            </div>
          )}
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="primary" onClick={handleDeployClick} disabled={isLoading || isUploading}>
            {isDeploying ? 'Deploying...' : 'Deploy'}
          </Button>
          <Button variant="secondary" onClick={handleSave} disabled={isLoading || isSaving || isUploading}>
            {(isSaving) ? 'Saving...' : isUploading ? 'Uploading...' : 'Save'}
          </Button>
        </div>
      </div>
      
      <BuilderForm 
        value={editorData} 
        onChange={handleEditorChange}
        onImageUpload={(file: File) => handleFileUpload(file, currentSite?.id as string)}
      />

      <DeploymentModal 
        isOpen={isDeployModalOpen} 
        onClose={handleCloseModal}
        onFinalDeploy={handleFinalDeploy}
        siteName={currentSite?.name || ''}
      />
    </>
  );
};

export default EditorPage;
