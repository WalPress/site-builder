import React, { useEffect, useState } from 'react';
import LinkStep1 from './LinkNSNameStep1';
import LinkNSNameStep2 from './LinkNSNameStep2';
import LinkNSNameStep3 from './LinkNSNameStep3';
import Modal from '../../Modal';
import useSite from '../../../hooks/useSite';

interface LinkNSNameModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedNs: any;
  // Add other props needed by the steps, e.g., siteId, etc.
}

const LinkNSNameModal: React.FC<LinkNSNameModalProps> = ({ isOpen, onClose, selectedNs }) => {
  const [currentStep, setCurrentStep] = useState(1);

  // Placeholder states for step 2 and 3 data - manage these based on actual needs
  const [isProcessing, setIsProcessing] = useState(false);
  const [finalBlobId, setFinalBlobId] = useState<string | undefined>(undefined);
  const [finalObjectId, setFinalObjectId] = useState<string | undefined>(undefined);
  const { sites, fetchSites } = useSite();  
  console.log("selectedNs", selectedNs, isOpen);

  useEffect(() => {
    fetchSites();
  }, []);

  const handleNextStep = () => {
    if (currentStep === 1) {
      // Logic for step 1 continue: e.g., validate selection
      setCurrentStep(2);
    } else if (currentStep === 2) {
      // Logic for step 2 continue: e.g., initiate linking process
      setIsProcessing(true);
      // Simulate API call
      setTimeout(() => {
        setFinalBlobId("bafy...beid_final"); // Example data from linking process
        setFinalObjectId("0xabc...def_final"); // Example data from linking process
        setIsProcessing(false);
        setCurrentStep(3);
      }, 1500);
    }
  };

  // const handlePreviousStep = () => {
  //   if (currentStep > 1) {
  //     setCurrentStep(currentStep - 1);
  //   }
  // };

  const handleFinish = () => {
    onClose(); // Close modal on finish
    // Optionally reset state if modal can be reopened
    setTimeout(() => setCurrentStep(1), 300); // Reset to step 1 after closing animation
  };

  const handleCancel = () => {
    onClose();
    setTimeout(() => setCurrentStep(1), 300);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
        {currentStep === 1 && (
          <LinkStep1 
            onContinue={handleNextStep} 
            onCancel={handleCancel} 
            selectedNs={selectedNs}
            sites={sites}
          />
        )}
        {currentStep === 2 && (
          <LinkNSNameStep2 
            onContinue={handleNextStep} 
            // onBack={handlePreviousStep} 
            onCancel={handleCancel} 
            isProcessing={isProcessing}
            storageCost={0.5}
            transactionFee={0.01}
            // Pass actual storageCost and transactionFee if available
          />
        )}
        {currentStep === 3 && (
          <LinkNSNameStep3 
            onFinish={handleFinish} 
            // onBack={handlePreviousStep} // Can enable if back from success is needed
            blobId={finalBlobId}
            objectId={finalObjectId}
          />
        )}
    </Modal>
  );
};

export default LinkNSNameModal; 