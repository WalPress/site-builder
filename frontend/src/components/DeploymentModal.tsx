import React, { useState } from 'react';
import Modal from './Modal';
import DeploymentStep1 from './editor/deployStep1';
import DeploymentStep2 from './editor/deployStep2';
import DeploymentStep3 from './editor/deployStep3';

interface DeploymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  // Add any other props needed, e.g., initial data or final deploy handler
  onFinalDeploy: (epoch: string) => void; 
  siteName: string;
}

const DeploymentModal: React.FC<DeploymentModalProps> = ({ isOpen, onClose, onFinalDeploy, siteName }) => {
  const [step, setStep] = useState(1);
  const [epochValue, setEpochValue] = useState('');

  const handleContinue = () => {
    setStep(2);
  };

  const handleDeployConfirm = () => {
    console.log('Deploy confirmed with epoch:', epochValue);
    onFinalDeploy(epochValue); // Call the actual deploy logic passed from parent
    setStep(3); // Move to success step
    // Don't close modal here anymore
  };

  const handleClose = () => {
    setStep(1); // Reset to step 1 on close
    setEpochValue(''); // Clear epoch value
    onClose();
  };

  // We don't need the default modal close button for multi-step
  // So we render the Modal but handle close via our step buttons
  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
        {/* Remove default modal padding/styling if needed, steps have their own */}
        {step === 1 && (
          <DeploymentStep1 
            siteName={siteName}
            epochValue={epochValue} 
            onEpochChange={setEpochValue} 
            onContinue={handleContinue} 
            onCancel={handleClose} 
          />
        )}
        {step === 2 && (
          <DeploymentStep2 
            onDeploy={handleDeployConfirm} 
            onCancel={handleClose} 
          />
        )}
        {step === 3 && (
          <DeploymentStep3 
            onClose={handleClose} 
          />
        )}
    </Modal>
  );
};

export default DeploymentModal; 