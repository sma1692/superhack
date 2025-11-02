import React, { useState } from 'react';
import { ChevronDown, ChevronUp, ExternalLink, Clock, Hash, CheckCircle2, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TicketCard = ({ ticket }) => {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);
  const { _id, title, description, status, createdAt, duplicate_id } = ticket;

  const truncatedDesc = description.length > 120 
    ? description.substring(0, 120) + '...' 
    : description;

  const handleViewTicket = () => {
    navigate(`/tickets/${ticket._id}`);
  };

  // Status configuration (0 = Open, 1 = Closed)
  const statusConfig = {
    0: {
      label: 'Open',
      color: 'bg-red-100 text-red-700 border-red-200',
      icon: AlertCircle,
      dotColor: 'bg-red-500'
    },
    1: {
      label: 'Closed',
      color: 'bg-green-100 text-green-700 border-green-200',
      icon: CheckCircle2,
      dotColor: 'bg-green-500'
    }
  };

  const currentStatus = statusConfig[status] || statusConfig[0];
  const StatusIcon = currentStatus.icon;

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric' 
    });
  };

  return (
    <div className="group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-blue-200">
      {/* Status Color Bar */}
      <div className={`h-1.5 ${status === 0 ? 'bg-gradient-to-r from-red-500 to-orange-500' : 'bg-gradient-to-r from-green-500 to-emerald-500'}`}></div>
      
      <div className="p-6">
        {/* Header Section */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2 text-gray-500">
            <Hash size={14} />
            <span className="text-xs font-mono font-semibold">
              {_id.slice(-8).toUpperCase()}
            </span>
          </div>
          
          {/* Status Badge */}
          <div className="flex items-center gap-1.5">
            <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${currentStatus.color}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${currentStatus.dotColor} animate-pulse`}></span>
              {currentStatus.label}
            </span>
          </div>
        </div>

        {/* Duplicate Warning */}
        {duplicate_id && (
          <div className="mb-3 px-3 py-2 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-2">
            <AlertCircle size={14} className="text-yellow-600 flex-shrink-0" />
            <span className="text-xs text-yellow-700">Duplicate ticket detected</span>
          </div>
        )}

        {/* Title */}
        <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {title}
        </h3>

        {/* Description */}
        <div className="mb-4">
          <p className="text-gray-600 text-sm leading-relaxed">
            {isExpanded ? description : truncatedDesc}
          </p>
          
          {description.length > 120 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-medium mt-2 transition-colors group/btn"
            >
              {isExpanded ? (
                <>
                  Show less <ChevronUp size={16} className="group-hover/btn:translate-y-[-2px] transition-transform" />
                </>
              ) : (
                <>
                  Show more <ChevronDown size={16} className="group-hover/btn:translate-y-[2px] transition-transform" />
                </>
              )}
            </button>
          )}
        </div>

        {/* Footer with Timestamp */}
        <div className="flex items-center justify-between mb-4 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Clock size={14} />
            <span>{formatDate(createdAt)}</span>
          </div>
          <div className="text-xs text-gray-400">
            {new Date(createdAt).toLocaleTimeString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={handleViewTicket}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg group/btn"
        >
          View Details
          <ExternalLink size={16} className="group-hover/btn:translate-x-1 group-hover/btn:translate-y-[-1px] transition-transform" />
        </button>
      </div>
    </div>
  );
};

export default TicketCard;