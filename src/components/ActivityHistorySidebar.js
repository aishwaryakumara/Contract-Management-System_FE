'use client';

export default function ActivityHistorySidebar({ isOpen, onClose, activityHistory }) {
  return (
    <div 
      className={`fixed right-0 top-16 h-[calc(100vh-64px)] w-full sm:w-96 bg-white dark:bg-gray-900 shadow-2xl z-40 transform transition-transform duration-300 ease-in-out overflow-y-auto border-l border-gray-200 dark:border-gray-700 ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      {/* Header */}
      <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between z-10">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Activity History</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{activityHistory.length} activities</p>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Timeline */}
      <div className="px-6 py-6">
        {activityHistory.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-gray-500 dark:text-gray-400">No activity history yet</p>
          </div>
        ) : (
          <div className="space-y-6">
            {activityHistory.map((activity, index) => {
              const isLast = index === activityHistory.length - 1;
              
              // Activity icon and color based on type
              const getActivityStyle = (type) => {
                switch(type) {
                  case 'created':
                    return { icon: 'M12 4v16m8-8H4', color: 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400' };
                  case 'modified':
                    return { icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' };
                  case 'document_uploaded':
                    return { icon: 'M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12', color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400' };
                  case 'document_deleted':
                    return { icon: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16', color: 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400' };
                  case 'status_changed':
                    return { icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', color: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400' };
                  default:
                    return { icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z', color: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' };
                }
              };

              const style = getActivityStyle(activity.type);

              return (
                <div key={activity.id} className="relative">
                  {/* Timeline line */}
                  {!isLast && (
                    <div className="absolute left-[19px] top-10 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />
                  )}

                  <div className="flex gap-4">
                    {/* Icon */}
                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${style.color}`}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={style.icon} />
                      </svg>
                    </div>

                    {/* Content */}
                    <div className="flex-1 pb-6">
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                        <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                          {activity.details.message}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                          by {activity.user} • {new Date(activity.timestamp).toLocaleString()}
                        </p>

                        {/* Show changes if modified */}
                        {activity.type === 'modified' && activity.details.changes && (
                          <div className="mt-3 space-y-2 pt-3 border-t border-gray-200 dark:border-gray-600">
                            {activity.details.changes.map((change, idx) => (
                              <div key={idx} className="text-xs">
                                <span className="font-medium text-gray-700 dark:text-gray-300 capitalize">
                                  {change.field.replace(/([A-Z])/g, ' $1').trim()}:
                                </span>
                                <div className="mt-1 flex items-center gap-2">
                                  <span className="text-red-600 dark:text-red-400 line-through">
                                    {change.oldValue || 'empty'}
                                  </span>
                                  <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                  </svg>
                                  <span className="text-green-600 dark:text-green-400">
                                    {change.newValue || 'empty'}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
