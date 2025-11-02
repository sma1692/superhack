// components/modals/FixStepsModal.jsx
import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import LLMModal from './LLMModal';
import { getFixStepsAPI } from '../../services/api';
import { useState } from 'react';
import { useEffect } from 'react';

const FixStepsModal = ({ isOpen, onClose, ticketId }) => {
  const [id , setId] = useState(null)
  useEffect(()=>{
    if(id==null) return
    localStorage.setItem('fix_steps_id', id)
  },[id])
  return (
    <LLMModal
      isOpen={isOpen}
      onClose={onClose}
      title="Fix Steps"
      description="AI-generated advanced resolution steps for this ticket"
      icon={CheckCircle2}
      gradient="from-emerald-500 to-emerald-600"
      fetchFunction={async () => {
        let doc = await getFixStepsAPI(ticketId)
        setId(doc.data.id)
        return doc
      }}
    />
  );
};

export default FixStepsModal;