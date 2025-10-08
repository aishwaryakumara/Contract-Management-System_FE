'use client';

export default function ContractProgressBar({ status }) {
  const stages = [
    { key: 'created', label: 'Created' },
    { key: 'draft', label: 'Draft' },
    { key: 'pending', label: 'Pending Review' },
    { key: 'active', label: 'Active' },
    { key: 'expired', label: 'Expired' },
  ];

  const getStageIndex = (status) => {
    const mapping = {
      'draft': 1,
      'pending': 2,
      'active': 3,
      'expired': 4,
    };
    return mapping[status] || 1;
  };

  const getStageIcon = (stageKey, isCompleted) => {
    const iconClass = isCompleted ? "w-6 h-6 text-white" : "w-6 h-6 text-gray-400 dark:text-gray-600";
    
    switch(stageKey) {
      case 'created':
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        );
      case 'draft':
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        );
      case 'pending':
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'active':
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'expired':
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      default:
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const currentStageIndex = getStageIndex(status);

  return (
    <div className="hidden lg:block bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
      <div className="flex items-center justify-between">
        {/* Stages */}
        {stages.map((stage, index) => {
          const isCompleted = index <= currentStageIndex;
          const isCurrent = index === currentStageIndex;
          const isLast = index === stages.length - 1;
          
          return (
            <div key={stage.key} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                {/* Circle */}
                <div className={`
                  w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-all duration-500 relative
                  ${isCompleted 
                    ? 'bg-gradient-to-br from-blue-600 to-cyan-500 shadow-lg' 
                    : 'bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600'}
                  ${isCurrent ? 'ring-4 ring-blue-200 dark:ring-blue-900/50 scale-110' : ''}
                `}>
                  {getStageIcon(stage.key, isCompleted)}
                  
                  {/* Pulse effect for current */}
                  {isCurrent && (
                    <span className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 animate-ping opacity-20" />
                  )}
                </div>
                
                {/* Label */}
                <p className={`
                  text-sm font-semibold text-center transition-all duration-300
                  ${isCompleted 
                    ? 'text-blue-600 dark:text-blue-400' 
                    : 'text-gray-500 dark:text-gray-500'}
                  ${isCurrent ? 'scale-105' : ''}
                `}>
                  {stage.label}
                </p>
                
                {/* Badge for current stage */}
                {isCurrent && (
                  <span className="mt-1.5 px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-medium rounded-full border border-blue-200 dark:border-blue-800">
                    In Progress
                  </span>
                )}
              </div>
              
              {/* Progress Line (between stages, not for last) */}
              {!isLast && (
                <div className="flex-1 h-1 bg-gray-200 dark:bg-gray-700 rounded-full mx-4 -mt-12">
                  <div 
                    className={`h-full bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full transition-all duration-700 ease-in-out ${
                      index < currentStageIndex ? 'w-full' : 'w-0'
                    }`}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
