// pages/TicketDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Hash, 
  CheckCircle2, 
  AlertCircle,
  FileText,
  MessageSquare,
  CheckCircle
} from 'lucide-react';
import { getTicketByIdAPI } from '../services/api';
import {
  TroubleshootingModal,
  FixStepsModal,
  ClientCommunicationModal,
  ResolutionModal
} from '../components/modals';

const TicketDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeModal, setActiveModal] = useState(null);

  // Store IDs for related data
  const [troubleshootingId, setTroubleshootingId] = useState(null);
  const [fixStepsId, setFixStepsId] = useState(null);

  useEffect(() => {
    const fetchTicketDetails = async () => {
      setIsLoading(true);
      try {
        const response = await getTicketByIdAPI(id);
        setTicket(response.data);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching ticket:', error);
        setIsLoading(false);
      }
    };

    fetchTicketDetails();
  }, [id]);

  const statusConfig = {
    0: {
      label: 'Open',
      color: 'bg-red-100 text-red-700 border-red-200',
      dotColor: 'bg-red-500',
      icon: AlertCircle
    },
    1: {
      label: 'Closed',
      color: 'bg-green-100 text-green-700 border-green-200',
      dotColor: 'bg-green-500',
      icon: CheckCircle2
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const actionCards = [
    {
      id: 'troubleshooting',
      title: 'Troubleshooting',
      description: 'Get preliminary diagnostic steps',
      icon: FileText,
      color: 'from-blue-500 to-blue-600',
      hoverColor: 'hover:from-blue-600 hover:to-blue-700'
    },
    {
      id: 'fixsteps',
      title: 'Fix Steps',
      description: 'Get advanced resolution steps',
      icon: CheckCircle2,
      color: 'from-emerald-500 to-emerald-600',
      hoverColor: 'hover:from-emerald-600 hover:to-emerald-700'
    },
    {
      id: 'communication',
      title: 'Client Communication',
      description: 'Generate customer response script',
      icon: MessageSquare,
      color: 'from-indigo-500 to-indigo-600',
      hoverColor: 'hover:from-indigo-600 hover:to-indigo-700'
    },
    {
      id: 'resolution',
      title: 'Resolution',
      description: 'Generate resolution summary',
      icon: CheckCircle,
      color: 'from-green-500 to-green-600',
      hoverColor: 'hover:from-green-600 hover:to-green-700'
    }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading ticket details...</p>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto text-red-500" size={48} />
          <h2 className="mt-4 text-xl font-semibold text-gray-900">Ticket not found</h2>
          <button
            onClick={() => navigate('/tickets')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Tickets
          </button>
        </div>
      </div>
    );
  }

  const currentStatus = statusConfig[ticket.status];
  const StatusIcon = currentStatus.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-3"
          >
            <ArrowLeft size={20} />
            <span className="font-medium">Back to Tickets</span>
          </button>
          
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-gray-900">{ticket.title}</h1>
                <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border ${currentStatus.color}`}>
                  <span className={`w-2 h-2 rounded-full ${currentStatus.dotColor} animate-pulse`}></span>
                  {currentStatus.label}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Hash size={14} />
                <span className="font-mono">{ticket._id.slice(-8).toUpperCase()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Part - Ticket Details */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Description</h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {ticket.description}
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Ticket Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <Calendar className="text-blue-600 flex-shrink-0 mt-1" size={20} />
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Created At</p>
                    <p className="text-sm text-gray-900 font-semibold mt-1">
                      {formatDate(ticket.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <Clock className="text-green-600 flex-shrink-0 mt-1" size={20} />
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Last Updated</p>
                    <p className="text-sm text-gray-900 font-semibold mt-1">
                      {formatDate(ticket.updatedAt)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <StatusIcon className="text-purple-600 flex-shrink-0 mt-1" size={20} />
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Status</p>
                    <p className="text-sm text-gray-900 font-semibold mt-1">
                      {currentStatus.label}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <Hash className="text-orange-600 flex-shrink-0 mt-1" size={20} />
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Ticket ID</p>
                    <p className="text-sm text-gray-900 font-semibold mt-1 font-mono">
                      {ticket._id.slice(-12).toUpperCase()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Part - Action Cards */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
              
              {actionCards.map((card) => {
                const Icon = card.icon;
                return (
                  <button
                    key={card.id}
                    onClick={() => setActiveModal(card.id)}
                    className={`w-full bg-gradient-to-r ${card.color} ${card.hoverColor} text-white rounded-xl p-4 shadow-md hover:shadow-lg transition-all duration-200 group`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="bg-white/20 p-2 rounded-lg group-hover:bg-white/30 transition-colors">
                        <Icon size={20} />
                      </div>
                      <div className="text-left flex-1">
                        <h3 className="font-semibold text-sm mb-1">{card.title}</h3>
                        <p className="text-xs text-white/80">{card.description}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <TroubleshootingModal
        isOpen={activeModal === 'troubleshooting'}
        onClose={() => setActiveModal(null)}
        ticketId={ticket._id}
      />

      <FixStepsModal
        isOpen={activeModal === 'fixsteps'}
        onClose={() => setActiveModal(null)}
        ticketId={ticket._id}
      />

      <ClientCommunicationModal
        isOpen={activeModal === 'communication'}
        onClose={() => setActiveModal(null)}
        ticketId={ticket._id}
        fixStepsId={fixStepsId}
        troubleshootingId={troubleshootingId}
      />

      <ResolutionModal
        isOpen={activeModal === 'resolution'}
        onClose={() => setActiveModal(null)}
        ticketId={ticket._id}
        fixStepsId={fixStepsId}
        troubleshootingId={troubleshootingId}
      />
    </div>
  );
};

export default TicketDetail;