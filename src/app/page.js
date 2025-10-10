import ProtectedLayout from '@/components/ProtectedLayout';

export default function Home() {
  return (
    <ProtectedLayout>
      <div className="max-w-7xl mx-auto">
        <div className="border-b border-gray-200 dark:border-gray-700 pb-6 mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Contract Management System
          </h1>
          <p className="text-base text-gray-600 dark:text-gray-400">
            Centralized contract and document tracking with lifecycle management
          </p>
        </div>
        
        <div className="space-y-6">
          {/* How to Use */}
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              How to Use
            </h2>
            <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
              <div className="flex gap-2">
                <span className="font-semibold text-gray-900 dark:text-white min-w-[140px]">Create Contract:</span>
                <span>Upload document → System extracts data → Review & submit</span>
              </div>
              <div className="flex gap-2">
                <span className="font-semibold text-gray-900 dark:text-white min-w-[140px]">View Contracts:</span>
                <span>Navigate to Contracts page → Filter by status, type, or client</span>
              </div>
              <div className="flex gap-2">
                <span className="font-semibold text-gray-900 dark:text-white min-w-[140px]">Edit Contract:</span>
                <span>Draft/Pending contracts only. Active contracts are view-only (status can change to expired)</span>
              </div>
              <div className="flex gap-2">
                <span className="font-semibold text-gray-900 dark:text-white min-w-[140px]">Renew Contract:</span>
                <span>Open active contract → Click "Renew" → Creates new version (V2, V3, etc.)</span>
              </div>
              <div className="flex gap-2">
                <span className="font-semibold text-gray-900 dark:text-white min-w-[140px]">Search:</span>
                <span>Use search bar to find contracts by name, client, or content</span>
              </div>
            </div>
          </div>

          {/* Status Transition Rules */}
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Status Transition Rules
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-2 px-4 font-semibold text-gray-900 dark:text-white">From</th>
                    <th className="text-left py-2 px-4 font-semibold text-gray-900 dark:text-white">To</th>
                    <th className="text-center py-2 px-4 font-semibold text-gray-900 dark:text-white">Allowed?</th>
                    <th className="text-left py-2 px-4 font-semibold text-gray-900 dark:text-white">Action</th>
                  </tr>
                </thead>
                <tbody className="text-gray-700 dark:text-gray-300">
                  <tr className="border-b border-gray-100 dark:border-gray-800">
                    <td className="py-2 px-4">Draft</td>
                    <td className="py-2 px-4">Pending</td>
                    <td className="text-center py-2 px-4">
                      <span className="inline-flex items-center text-green-600 dark:text-green-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </span>
                    </td>
                    <td className="py-2 px-4">Submit for review</td>
                  </tr>
                  <tr className="border-b border-gray-100 dark:border-gray-800">
                    <td className="py-2 px-4">Draft</td>
                    <td className="py-2 px-4">Active</td>
                    <td className="text-center py-2 px-4">
                      <span className="inline-flex items-center text-green-600 dark:text-green-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </span>
                    </td>
                    <td className="py-2 px-4">Approve directly</td>
                  </tr>
                  <tr className="border-b border-gray-100 dark:border-gray-800">
                    <td className="py-2 px-4">Pending</td>
                    <td className="py-2 px-4">Active</td>
                    <td className="text-center py-2 px-4">
                      <span className="inline-flex items-center text-green-600 dark:text-green-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </span>
                    </td>
                    <td className="py-2 px-4">Approve contract</td>
                  </tr>
                  <tr className="border-b border-gray-100 dark:border-gray-800">
                    <td className="py-2 px-4">Pending</td>
                    <td className="py-2 px-4">Draft</td>
                    <td className="text-center py-2 px-4">
                      <span className="inline-flex items-center text-green-600 dark:text-green-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </span>
                    </td>
                    <td className="py-2 px-4">Send back for corrections</td>
                  </tr>
                  <tr className="border-b border-gray-100 dark:border-gray-800">
                    <td className="py-2 px-4">Active</td>
                    <td className="py-2 px-4">Draft/Pending</td>
                    <td className="text-center py-2 px-4">
                      <span className="inline-flex items-center text-red-600 dark:text-red-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </span>
                    </td>
                    <td className="py-2 px-4">Cannot reverse (fields locked)</td>
                  </tr>
                  <tr className="border-b border-gray-100 dark:border-gray-800">
                    <td className="py-2 px-4">Active</td>
                    <td className="py-2 px-4">Expired</td>
                    <td className="text-center py-2 px-4">
                      <span className="inline-flex items-center text-green-600 dark:text-green-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </span>
                    </td>
                    <td className="py-2 px-4">When end date passes</td>
                  </tr>
                  <tr className="border-b border-gray-100 dark:border-gray-800">
                    <td className="py-2 px-4">Active</td>
                    <td className="py-2 px-4">Renewed</td>
                    <td className="text-center py-2 px-4">
                      <span className="inline-flex items-center text-green-600 dark:text-green-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </span>
                    </td>
                    <td className="py-2 px-4">When user renews</td>
                  </tr>
                  <tr className="border-b border-gray-100 dark:border-gray-800">
                    <td className="py-2 px-4">Renew</td>
                    <td className="py-2 px-4">Any</td>
                    <td className="text-center py-2 px-4">
                    <span className="inline-flex items-center text-red-600 dark:text-red-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </span>
                    </td>
                    <td className="py-2 px-4">Make changes in new drafted version</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-4">Expired</td>
                    <td className="py-2 px-4">Any</td>
                    <td className="text-center py-2 px-4">
                      <span className="inline-flex items-center text-red-600 dark:text-red-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </span>
                    </td>
                    <td className="py-2 px-4">Locked status</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Contract IDs */}
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              Contract Identifiers
            </h2>
            <div className="space-y-4 text-sm">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">contract_id</h3>
                <p className="text-blue-700 dark:text-blue-300 mb-2">
                  Base identifier shared across all versions of the same contract.
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400 font-mono">
                  Example: abc123
                </p>
              </div>

              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">contract_instance_id</h3>
                <p className="text-green-700 dark:text-green-300 mb-2">
                  Unique identifier for each version of a contract. Changes with every renewal.
                </p>
                <div className="text-xs text-green-600 dark:text-green-400 font-mono space-y-1">
                  <p>V1: CTR_abc123_V1</p>
                  <p>V2: CTR_abc123_V2 (after renewal)</p>
                  <p>V3: CTR_abc123_V3 (after second renewal)</p>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Renewal Behavior</h3>
                <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                  <li>• Creates a new version with updated dates/terms</li>
                  <li>• Previous version is marked as "renewed" and archived</li>
                  <li>• New version starts in "draft" status</li>
                  <li>• Can only renew from "active" contracts</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedLayout>
  );
}