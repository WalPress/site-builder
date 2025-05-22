import React, { useState } from 'react';
import RegisterStep1 from './RegisterStep1';
import RegisterStep2 from './RegisterStep2';
import RegisterStep3 from './RegisterStep3';
import useNsNames from '../../../hooks/useNsNames';
import Modal from '../../Modal';

interface RegisterNSModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const RegisterNSModal: React.FC<RegisterNSModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [domainToRegister, setDomainToRegister] = useState('');
  const [durationToRegister, setDurationToRegister] = useState<number>(1);
  const [isAvailable, setIsAvailable] = useState(false);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [registrationTxId, setRegistrationTxId] = useState<string | undefined>(undefined);
  const { registerNs, searchNs, getSettingsValues } = useNsNames();

  const { gasBudget, pricePerYear } = getSettingsValues();

  const handleStep1Register = (domain: string, duration: number) => {
    console.log("Step 1 Register:", domain, duration);
    setDomainToRegister(domain);
    setDurationToRegister(duration);
    setCurrentStep(2);
  };

  const handleStep2Confirm = async () => {
    console.log("Step 2 Confirm - Registering:", domainToRegister, durationToRegister);
    setIsProcessing(true);
    try {
      // For now, simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      const response = await registerNs(domainToRegister, durationToRegister);
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

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinish = () => {
    onClose();
    setTimeout(() => {
      setCurrentStep(1);
      setDomainToRegister('');
      setDurationToRegister(0);
      setRegistrationTxId(undefined);
      setIsAvailable(false);
      setIsCheckingAvailability(false);
    }, 300); // Reset state after modal close animation
  };

  const handleCancel = () => {
    onClose();
    setTimeout(() => {
      setCurrentStep(1);
      setDomainToRegister('');
      setDurationToRegister(0);
      setIsAvailable(false);
      setIsCheckingAvailability(false);
    }, 300);
  };

  const handleSearchNs = async (domain: string) => {
    setIsCheckingAvailability(true);
    const foundNs = await searchNs(domain);
    setIsAvailable(!foundNs);
    setIsCheckingAvailability(false);
  }

  if (!isOpen) {
    return null;
  }

  let stepContent;
  switch (currentStep) {
    case 1:
      stepContent = (
        <RegisterStep1 
          onRegister={handleStep1Register} 
          onCancel={handleCancel} 
          searchNs={handleSearchNs}
          isAvailable={isAvailable}
          isCheckingAvailability={isCheckingAvailability}
          // Pass availability check props if implemented
        />
      );
      break;
    case 2:
      stepContent = (
        <RegisterStep2 
          onConfirm={handleStep2Confirm} 
          onBack={handlePreviousStep} 
          onCancel={handleCancel}
          isProcessing={isProcessing}
          domainName={domainToRegister}
          durationYears={durationToRegister} // Pass actual duration label if needed
          estimatedCost={pricePerYear * durationToRegister}
          transactionFee={gasBudget}
          // Pass actual cost and fee data
        />
      );
      break;
    case 3:
      stepContent = (
        <RegisterStep3 
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

export default RegisterNSModal; 