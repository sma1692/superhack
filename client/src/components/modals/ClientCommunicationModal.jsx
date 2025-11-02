// components/modals/ClientCommunicationModal.jsx
import React from 'react';
import { MessageSquare } from 'lucide-react';
import LLMModal from './LLMModal';
import { getClientCommunicationAPI } from '../../services/api';

const ClientCommunicationModal = ({ 
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
      title="Client Communication Script"
      description="AI-generated customer response template"
      icon={MessageSquare}
      gradient="from-indigo-500 to-indigo-600"
      fetchFunction={async () => {
        const localFixID = fixStepsId || localStorage.getItem('fix_steps_id')
        const localTrouble = troubleshootingId || localStorage.getItem('troubleshooting_id')
        return getClientCommunicationAPI(ticketId, localFixID, localTrouble)
      }}
    />
  );
};

export default ClientCommunicationModal;