import React, { useEffect, useState } from 'react';
import LinkStep1 from './LinkNSNameStep1';
import LinkNSNameStep2 from './LinkNSNameStep2';
import LinkNSNameStep3 from './LinkNSNameStep3';
import Modal from '../../Modal';
import useSite from '../../../hooks/useSite';
import useNsNames from '../../../hooks/useNsNames';

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
  const [finalTxId, setFinalTxId] = useState<string | undefined>(undefined);
  const [finalObjectId, setFinalObjectId] = useState<string | undefined>(undefined);
  const [selectedSiteId, setSelectedSiteId] = useState<string | undefined>(undefined);
  const { sites, fetchSites } = useSite();  
  const { LinkNsName } = useNsNames();
  
  useEffect(() => {
    fetchSites();
  }, []);

  const handleNextStep = async () => {
    if (currentStep === 1) {
      // Logic for step 1 continue: e.g., validate selection
      setCurrentStep(2);
    } else if (currentStep === 2) {
      setIsProcessing(true);
      const selectedSite = sites.find((site: any) => site.id === selectedSiteId);
      console.log("selectedSiteId", selectedSiteId, sites, selectedSite);
      const objectId = selectedSite?.objectId?.match(/0x[a-fA-F0-9]{64}/)?.[0];
      console.log(objectId, selectedNs);
      if (!objectId) {
        console.log("No objectId found || invalid object-id selected");
        return;
      }
      const res = await LinkNsName(selectedNs.objectId, objectId); 
      console.log("res", res);
      setFinalTxId(res.digest);
      // Simulate API call
      setTimeout(() => {
        setFinalObjectId(objectId);
        setIsProcessing(false);
        setCurrentStep(3);
      }, 1500);
    }
  };

  const handleSelectSite = (siteId: string) => {
    setSelectedSiteId(siteId);
  }

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
            selectSite={handleSelectSite}
            selectedSiteId={selectedSiteId}
          />
        )}
        {currentStep === 2 && (
          <LinkNSNameStep2 
            onContinue={handleNextStep} 
            onCancel={handleCancel} 
            isProcessing={isProcessing}
            storageCost={0.5}
            transactionFee={0.01}
          />
        )}
        {currentStep === 3 && (
          <LinkNSNameStep3 
            onFinish={handleFinish}
            objectId={finalObjectId}
            txId={finalTxId}
          />
        )}
    </Modal>
  );
};

export default LinkNSNameModal; 