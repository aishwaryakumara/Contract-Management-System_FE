'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import ProtectedLayout from '@/components/ProtectedLayout';
import { useAuth } from '@/contexts/AuthContext';
import ActivityHistorySidebar from '@/components/ActivityHistorySidebar';
import ContractProgressBar from '@/components/ContractProgressBar';
import toast from 'react-hot-toast';

export default function ContractDetails() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const [contract, setContract] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [activityHistory, setActivityHistory] = useState([]);
  const [copiedInstanceId, setCopiedInstanceId] = useState(false);
  const [copiedContractId, setCopiedContractId] = useState(false);
  
  const [formData, setFormData] = useState({
    contractName: '',
    clientName: '',
    contractType: '',
    startDate: '',
    endDate: '',
    value: '',
    status: '',
    description: '',
  });

  // Activity logging function
  const logActivity = (type, details) => {
    const activity = {
      id: Date.now().toString(),
      type,
      details,
      user: user?.name || 'Unknown User',
      timestamp: new Date().toISOString(),
    };

    const history = JSON.parse(localStorage.getItem(`contractHistory_${params.id}`) || '[]');
    history.unshift(activity);
    localStorage.setItem(`contractHistory_${params.id}`, JSON.stringify(history));
    setActivityHistory(history);
  };

  useEffect(() => {
    // Load contract
    const contracts = JSON.parse(localStorage.getItem('contracts') || '[]');
    const found = contracts.find(c => c.id === params.id);
    if (found) {
      setContract(found);
      setFormData({
        contractName: found.contractName || '',
        clientName: found.clientName,
        contractType: found.contractType,
        startDate: found.startDate,
        endDate: found.endDate || '',
        value: found.value || '',
        status: found.status,
        description: found.description || '',
      });
    }

    // Load documents for this contract
    const allDocs = JSON.parse(localStorage.getItem('contractDocuments') || '[]');
    const contractDocs = allDocs.filter(doc => doc.contractId === params.id);
    setDocuments(contractDocs);

    // Load activity history
    const history = JSON.parse(localStorage.getItem(`contractHistory_${params.id}`) || '[]');
    setActivityHistory(history);
  }, [params.id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCopyInstanceId = () => {
    navigator.clipboard.writeText(contract.id);
    setCopiedInstanceId(true);
    setTimeout(() => setCopiedInstanceId(false), 2000);
    toast.success('Contract Instance ID copied!', {
      icon: '📋',
      duration: 2000,
    });
  };

  const handleCopyContractId = () => {
    const contractId = contract.contractId || `CTR-${contract.id.substring(0, 8).toUpperCase()}`;
    navigator.clipboard.writeText(contractId);
    setCopiedContractId(true);
    setTimeout(() => setCopiedContractId(false), 2000);
    toast.success('Contract ID copied!', {
      icon: '📋',
      duration: 2000,
    });
  };

  const handleSave = () => {
    const contracts = JSON.parse(localStorage.getItem('contracts') || '[]');
    const index = contracts.findIndex(c => c.id === params.id);
    if (index !== -1) {
      const oldContract = contracts[index];
      const changes = [];

      // Track what changed
      Object.keys(formData).forEach(key => {
        if (oldContract[key] !== formData[key]) {
          changes.push({
            field: key,
            oldValue: oldContract[key],
            newValue: formData[key]
          });
        }
      });

      contracts[index] = { 
        ...contracts[index], 
        ...formData,
        lastModified: new Date().toISOString()
      };
      localStorage.setItem('contracts', JSON.stringify(contracts));
      setContract(contracts[index]);
      setIsEditing(false);

      // Log activity
      if (changes.length > 0) {
        logActivity('modified', {
          message: `Contract modified`,
          changes
        });
      }

      // Show success toast
      toast.success('Contract saved successfully!', {
        icon: '✅',
      });
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    await new Promise(resolve => setTimeout(resolve, 500));

    const newDoc = {
      id: Date.now().toString(),
      contractId: params.id,
      fileName: file.name,
      fileSize: file.size,
      uploadedAt: new Date().toISOString(),
    };

    const allDocs = JSON.parse(localStorage.getItem('contractDocuments') || '[]');
    allDocs.push(newDoc);
    localStorage.setItem('contractDocuments', JSON.stringify(allDocs));
    setDocuments([...documents, newDoc]);
    setIsUploading(false);

    // Log activity
    logActivity('document_uploaded', {
      message: `Document "${file.name}" uploaded`,
      fileName: file.name,
      fileSize: file.size
    });

    // Show success toast
    toast.success(`Document "${file.name}" uploaded successfully!`, {
      icon: '📄',
    });
  };

  const handleDeleteDocument = (docId) => {
    if (!confirm('Delete this document?')) return;
    
    const doc = documents.find(d => d.id === docId);
    const allDocs = JSON.parse(localStorage.getItem('contractDocuments') || '[]');
    const filtered = allDocs.filter(doc => doc.id !== docId);
    localStorage.setItem('contractDocuments', JSON.stringify(filtered));
    setDocuments(documents.filter(doc => doc.id !== docId));

    // Log activity
    if (doc) {
      logActivity('document_deleted', {
        message: `Document "${doc.fileName}" deleted`,
        fileName: doc.fileName
      });

      // Show success toast
      toast.success(`Document "${doc.fileName}" deleted successfully!`, {
        icon: '🗑️',
      });
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
      active: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      expired: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
    };
    return colors[status] || colors.draft;
  };

  if (!contract) {
    return (
      <ProtectedLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500 dark:text-gray-400">Contract not found</p>
        </div>
      </ProtectedLayout>
    );
  }

  return (
    <ProtectedLayout>
      <div className="space-y-6">
        {/* Progress Bar */}
        <ContractProgressBar status={contract.status} />

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/contracts')}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {contract.clientName}
              </h1>
              <div className="mt-1 flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Instance: {contract.id.substring(0, 12)}...
                  </p>
                  <button
                    onClick={handleCopyInstanceId}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                    title="Copy Contract Instance ID"
                  >
                    {copiedInstanceId ? (
                      <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    )}
                  </button>
                </div>
                <span className="text-gray-400">|</span>
                <div className="flex items-center gap-1">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    ID: {contract.contractId || `CTR-${contract.id.substring(0, 8).toUpperCase()}`}
                  </p>
                  <button
                    onClick={handleCopyContractId}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                    title="Copy Contract ID"
                  >
                    {copiedContractId ? (
                      <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowHistory(true)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              View History
            </button>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit
              </button>
            ) : (
              <>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({
                      contractName: contract.contractName || '',
                      clientName: contract.clientName,
                      contractType: contract.contractType,
                      startDate: contract.startDate,
                      endDate: contract.endDate || '',
                      value: contract.value || '',
                      status: contract.status,
                      description: contract.description || '',
                    });
                  }}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Save Changes
                </button>
              </>
            )}
          </div>
        </div>

        {/* Contract Details Card */}
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Contract Details</h2>
          
          {isEditing ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Contract Name</label>
                <input
                  type="text"
                  name="contractName"
                  value={formData.contractName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Client Name</label>
                <input
                  type="text"
                  name="clientName"
                  value={formData.clientName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Contract Type</label>
                <select
                  name="contractType"
                  value={formData.contractType}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="service">Service Agreement</option>
                  <option value="nda">NDA</option>
                  <option value="employment">Employment Contract</option>
                  <option value="vendor">Vendor Agreement</option>
                  <option value="lease">Lease Agreement</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Start Date</label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">End Date</label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Contract Value ($)</label>
                <input
                  type="number"
                  name="value"
                  value={formData.value}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="draft">Draft</option>
                  <option value="pending">Pending Review</option>
                  <option value="active">Active</option>
                  <option value="expired">Expired</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
                <textarea
                  name="description"
                  rows={4}
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Contract IDs - Full Width Banner */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Contract Instance ID */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <p className="text-sm text-blue-600 dark:text-blue-400 mb-1">Contract Instance ID</p>
                  <div className="flex items-center gap-2">
                    <p className="text-base font-mono font-medium text-blue-900 dark:text-blue-300">{contract.id}</p>
                    <button
                      onClick={handleCopyInstanceId}
                      className="p-1.5 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded transition-colors"
                      title="Copy Contract Instance ID"
                    >
                      {copiedInstanceId ? (
                        <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Contract ID */}
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <p className="text-sm text-green-600 dark:text-green-400 mb-1">Contract ID</p>
                  <div className="flex items-center gap-2">
                    <p className="text-base font-mono font-medium text-green-900 dark:text-green-300">
                      {contract.contractId || `CTR-${contract.id.substring(0, 8).toUpperCase()}`}
                    </p>
                    <button
                      onClick={handleCopyContractId}
                      className="p-1.5 hover:bg-green-100 dark:hover:bg-green-900/40 rounded transition-colors"
                      title="Copy Contract ID"
                    >
                      {copiedContractId ? (
                        <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Main Contract Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Contract Name</p>
                  <p className="text-base font-medium text-gray-900 dark:text-white">{contract.contractName || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Client Name</p>
                  <p className="text-base font-medium text-gray-900 dark:text-white">{contract.clientName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Contract Type</p>
                  <p className="text-base font-medium text-gray-900 dark:text-white">{contract.contractType}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Start Date</p>
                  <p className="text-base font-medium text-gray-900 dark:text-white">
                    {new Date(contract.startDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">End Date</p>
                  <p className="text-base font-medium text-gray-900 dark:text-white">
                    {contract.endDate ? new Date(contract.endDate).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Contract Value</p>
                  <p className="text-base font-medium text-green-600 dark:text-green-400">
                    {contract.value ? `$${parseFloat(contract.value).toLocaleString()}` : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Status</p>
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(contract.status)}`}>
                    {contract.status}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Created By</p>
                  <p className="text-base font-medium text-gray-900 dark:text-white">{contract.createdBy || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Created On</p>
                  <p className="text-base font-medium text-gray-900 dark:text-white">
                    {new Date(contract.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Last Modified</p>
                  <p className="text-base font-medium text-gray-900 dark:text-white">
                    {contract.lastModified ? new Date(contract.lastModified).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>

              {/* Description - Full Width if exists */}
              {contract.description && (
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Description</p>
                  <p className="text-base text-gray-900 dark:text-white">{contract.description}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Associated Documents */}
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Associated Documents ({documents.length})
            </h2>
            <div>
              <input
                type="file"
                id="doc-upload"
                className="hidden"
                onChange={handleFileUpload}
                disabled={isUploading}
              />
              <label
                htmlFor="doc-upload"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer inline-flex items-center gap-2"
              >
                {isUploading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Uploading...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Upload Document
                  </>
                )}
              </label>
            </div>
          </div>

          {documents.length === 0 ? (
            <div className="p-12 text-center">
              <svg className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <p className="text-gray-500 dark:text-gray-400">No documents uploaded yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      File Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Size
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Uploaded
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {documents.map((doc) => (
                    <tr key={doc.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                          </svg>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {doc.fileName}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {(doc.fileSize / 1024).toFixed(2)} KB
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {new Date(doc.uploadedAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center gap-3">
                          <button className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">
                            View
                          </button>
                          <button className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300">
                            Download
                          </button>
                          <button
                            onClick={() => handleDeleteDocument(doc.id)}
                            className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Activity History Sidebar */}
        <ActivityHistorySidebar 
          isOpen={showHistory}
          onClose={() => setShowHistory(false)}
          activityHistory={activityHistory}
        />
      </div>
    </ProtectedLayout>
  );
}
