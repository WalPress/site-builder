import React, { useState } from 'react';
import RenewStep1 from './RenewStep1';
import RenewStep2 from './RenewStep2';
import RenewStep3 from './RenewStep3';
import useNsNames from '../../../hooks/useNsNames';
import Modal from '../../Modal';

interface RenewModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedNs: any;
}

const RenewModal: React.FC<RenewModalProps> = ({
  isOpen,
  onClose,
  selectedNs,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [domainToRegister, setDomainToRegister] = useState('');
  const [durationToRegister, setDurationToRegister] = useState<number>(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [registrationTxId, setRegistrationTxId] = useState<string | undefined>(undefined);
  const { renewNs } = useNsNames();
  
  console.log("selectedNs", selectedNs);

  const handleStep1Renew = (duration: number) => {
    console.log("Step 1 Renew:", duration);
    setDurationToRegister(duration);
    setCurrentStep(2);
  };

  const handleStep2Confirm = async () => {
    console.log("Step 2 Confirm - Renewing:", selectedNs.objectId, durationToRegister);
    setIsProcessing(true);
    try {
      // For now, simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      const response = await renewNs(selectedNs.objectId, durationToRegister);
      setRegistrationTxId(response.digest);
      setCurrentStep(3);
    } catch (error) {
      console.error("Registration failed:", error);
      // TODO: Handle error, maybe show a message on Step 2 or go back to Step 1
      alert("Registration failed. Please try again."); // Basic error handling
    } finally {
      setIsProcessing(false);
    }
  };

  // const handlePreviousStep = () => {
  //   if (currentStep > 1) {
  //     setCurrentStep(currentStep - 1);
  //   }
  // };

  const handleFinish = () => {
    onClose();
    setTimeout(() => {
      setCurrentStep(1);
      setDomainToRegister('');
      setDurationToRegister(0);
      setRegistrationTxId(undefined);
    }, 300); // Reset state after modal close animation
  };

  const handleCancel = () => {
    onClose();
    setTimeout(() => {
      setCurrentStep(1);
      setDomainToRegister('');
      setDurationToRegister(0);
    }, 300);
  };

  if (!isOpen) {
    return null;
  }

  let stepContent;
  switch (currentStep) {
    case 1:
      stepContent = (
        <RenewStep1 
          onRenew={handleStep1Renew} 
          onCancel={handleCancel}
        />
      );
      break;
    case 2:
      stepContent = (
        <RenewStep2 
          onConfirm={handleStep2Confirm} 
          // onBack={handlePreviousStep} 
          onCancel={handleCancel}
          isProcessing={isProcessing}
          domainName={domainToRegister}
          durationYears={durationToRegister} // Pass actual duration label if needed
          // Pass actual cost and fee data
        />
      );
      break;
    case 3:
      stepContent = (
        <RenewStep3 
          onFinish={handleFinish} 
          domainName={domainToRegister}
          transactionId={registrationTxId}
        />
      );
      break;
    default:
      stepContent = <div>Error: Unknown step.</div>;
  }

  return (
    
    <Modal isOpen={isOpen} onClose={onClose}>
      {stepContent}
    </Modal>
  );
};

export default RenewModal; 