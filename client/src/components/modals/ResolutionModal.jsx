// components/modals/ResolutionModal.jsx
import React from 'react';
import { CheckCircle } from 'lucide-react';
import LLMModal from './LLMModal';
import { getResolutionAPI } from '../../services/api';

const ResolutionModal = ({ 
  isOpen, 
  onClose, 
  ticketId, 
  fixStepsId = null, 
  troubleshootingId = null 
}) => {
  return (
    <LLMModal
      isOpen={isOpen}
      onClose={onClose}
      title="Ticket Resolution"
      description="AI-generated resolution summary for this ticket"
      icon={CheckCircle}
      gradient="from-green-500 to-green-600"
      fetchFunction={() => {
        const localFixID = fixStepsId || localStorage.getItem('fix_steps_id')
        const localTrouble = troubleshootingId || localStorage.getItem('troubleshooting_id')      
        return getResolutionAPI(ticketId, localFixID, localTrouble)
      }}
    />
  );
};

export default ResolutionModal;