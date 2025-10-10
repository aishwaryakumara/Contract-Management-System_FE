'use client';

import { useState, useEffect } from 'react';
import { lookupsAPI } from '@/lib/api';

export default function ContractProgressBar({ status }) {
  const [contractStatuses, setContractStatuses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch statuses from API
  useEffect(() => {
    async function loadStatuses() {
      try {
        const response = await lookupsAPI.getContractStatuses();
        if (response.success && response.data.success) {
          const statuses = response.data.data || [];
          // Filter and order statuses for progress bar (exclude renewed)
          const progressStatuses = statuses.filter(s => s.name !== 'renewed');
          setContractStatuses(progressStatuses);
        }
      } catch (error) {
        console.error('Error loading statuses:', error);
        // Fallback to hardcoded statuses
        setContractStatuses([
          { id: 1, name: 'draft', description: 'Draft' },
          { id: 2, name: 'pending', description: 'Pending Review' },
          { id: 3, name: 'active', description: 'Active' },
          { id: 4, name: 'expired', description: 'Expired' },
        ]);
      } finally {
        setIsLoading(false);
      }
    }
    
    loadStatuses();
  }, []);

  // Special handling for renewed contracts
  if (status === 'renewed') {
    return (
      <div className="hidden lg:block bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl shadow-sm border border-blue-200 dark:border-blue-800 p-8">
        <div className="flex items-center justify-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
          <div>
            <h3 className="text-xl font-bold text-blue-900 dark:text-blue-100">Archived Version</h3>
            <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
              This contract has been renewed and is now archived. Check the renewed version for the active contract.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const getStageIndex = (status) => {
    const index = contractStatuses.findIndex(s => s.name === status);
    return index !== -1 ? index : 0;
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

  // Show loading state
  if (isLoading) {
    return (
      <div className="hidden lg:block bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
        <div className="flex items-center justify-center">
          <div className="animate-pulse flex space-x-4">
            <div className="h-12 w-12 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
            <div className="h-12 w-12 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
            <div className="h-12 w-12 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
            <div className="h-12 w-12 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="hidden lg:block bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
      <div className="flex items-center justify-between">
        {/* Stages */}
        {contractStatuses.map((stage, index) => {
          const isCompleted = index <= currentStageIndex;
          const isCurrent = index === currentStageIndex;
          const isLast = index === contractStatuses.length - 1;
          
          return (
            <div key={stage.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                {/* Circle */}
                <div className={`
                  w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-all duration-500 relative
                  ${isCompleted 
                    ? 'bg-gradient-to-br from-blue-600 to-cyan-500 shadow-lg' 
                    : 'bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600'}
                  ${isCurrent ? 'ring-4 ring-blue-200 dark:ring-blue-900/50 scale-110' : ''}
                `}>
                  {getStageIcon(stage.name, isCompleted)}
                  
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
                  {stage.description || stage.name}
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
