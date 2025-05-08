import React, { useState } from 'react';
import Modal from './Modal';
import DeploymentStep1 from './editor/deployStep1';
import DeploymentStep2 from './editor/deployStep2';
import DeploymentStep3 from './editor/deployStep3';
import useSite from '../hooks/useSite';
// import { UpdateSiteStorageTest } from '../../wailsjs/go/src/app';

interface DeploymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  siteName: string;
  siteId: string;
}

const DeploymentModal: React.FC<DeploymentModalProps> = ({ isOpen, onClose, siteName, siteId }) => {
  const [step, setStep] = useState(1);
  const [epochValue, setEpochValue] = useState<number>(1);
  const { deploySite, isDeploying, estimateStorageCost } = useSite();
  const [storageCost, setStorageCost] = useState<number>(0);
  const [blobId, setBlobId] = useState<string>("");
  const [objectId, setObjectId] = useState<string>("");
  const transactionFee = 0.001;


  const handleContinue = async () => {
    const cost = await estimateStorageCost(siteId, epochValue);
    console.log('Storage cost:', cost);
    setStorageCost(cost);
    // await UpdateSiteStorageTest(siteId, "0xdba19f8ee497c258cbfe2da42d08ba3743c59f3bf940b9448c7c392a00bb737a", "LkBfAMRqCCjef-r6bgf6wTc3pWCYRmc8PQQeI1bvZoQ")
    setStep(2);
  };

  const handleDeployConfirm = async () => {
    console.log('Deploy confirmed with epoch:', epochValue);
    const response = await deploySite(siteId, epochValue);
    console.log('Deploy-response:===>', response);
    setBlobId(response.blobId);
    setObjectId(response.objectId);
    setStep(3);
  };

  const handleClose = () => {
    setStep(1);
    setEpochValue(0);
    onClose();
  };

  // We don't need the default modal close button for multi-step
  // So we render the Modal but handle close via our step buttons
  return (
    <Modal isOpen={isOpen} onClose={isDeploying ? () => {} : handleClose}>
        {/* Remove default modal padding/styling if needed, steps have their own */}
        {step === 1 && (
          <DeploymentStep1 
            siteName={siteName}
            epochValue={epochValue.toString()} 
            onEpochChange={(value: string) => setEpochValue(Number(value))} 
            onContinue={handleContinue} 
            onCancel={handleClose} 
          />
        )}
        {step === 2 && (
          <DeploymentStep2 
            onDeploy={handleDeployConfirm} 
            isDeploying={isDeploying}
            onCancel={handleClose} 
            storageCost={storageCost}
            transactionFee={transactionFee}
          />
        )}
        {step === 3 && (
          <DeploymentStep3 
            onClose={handleClose} 
            blobId={blobId}
            objectId={objectId}
          />
        )}
    </Modal>
  );
};

export default DeploymentModal; 