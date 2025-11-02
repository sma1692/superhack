// components/modals/TroubleshootingModal.jsx
import React from 'react';
import { FileText } from 'lucide-react';
import LLMModal from './LLMModal';
import { getTroubleshootingStepsAPI } from '../../services/api';
import { useState } from 'react';
import { useEffect } from 'react';

const TroubleshootingModal = ({ isOpen, onClose, ticketId }) => {
  const [id , setId] = useState(null)
  useEffect(()=>{
    if(id==null) return
    localStorage.setItem('troubleshooting_id' , id)
  },[id])
  return (
    <LLMModal
      isOpen={isOpen}
      onClose={onClose}
      title="Troubleshooting Steps"
      description="AI-generated preliminary diagnostic steps for this ticket"
      icon={FileText}
      gradient="from-blue-500 to-blue-600"
      fetchFunction={async () => {
      const doc = await  getTroubleshootingStepsAPI(ticketId)
      setId(doc.data.id)
      return doc
      }}
    />
  );
};

export default TroubleshootingModal;