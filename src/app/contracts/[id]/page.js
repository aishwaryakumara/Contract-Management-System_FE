'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import ProtectedLayout from '@/components/ProtectedLayout';
import { useAuth } from '@/contexts/AuthContext';
import { contractsAPI, documentsAPI, lookupsAPI } from '@/lib/api';
import ActivityHistorySidebar from '@/components/ActivityHistorySidebar';
import ContractProgressBar from '@/components/ContractProgressBar';
import RenewContractModal from '@/components/RenewContractModal';
import toast from 'react-hot-toast';

export default function ContractDetails() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const [contract, setContract] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [showRenewModal, setShowRenewModal] = useState(false);
  const [activityHistory, setActivityHistory] = useState([]);
  const [copiedInstanceId, setCopiedInstanceId] = useState(false);
  const [copiedContractId, setCopiedContractId] = useState(false);
  
  // Lookup data
  const [contractTypes, setContractTypes] = useState([]);
  const [contractStatuses, setContractStatuses] = useState([]);
  
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

  // Fetch activity history from backend
  const fetchHistory = async () => {
    try {
      const response = await contractsAPI.getHistory(params.id);
      if (response.success && response.data.success) {
        setActivityHistory(response.data.data || []);
      } else {
        setActivityHistory([]);
      }
    } catch (error) {
      console.error('Error loading activity history:', error);
      setActivityHistory([]);
    }
  };

  // Fetch lookup data (contract types and statuses)
  useEffect(() => {
    async function loadLookups() {
      try {
        // Fetch contract types
        const typesResponse = await lookupsAPI.getContractTypes();
        if (typesResponse.success && typesResponse.data.success) {
          setContractTypes(typesResponse.data.data || []);
        }
        
        // Fetch contract statuses
        const statusesResponse = await lookupsAPI.getContractStatuses();
        if (statusesResponse.success && statusesResponse.data.success) {
          setContractStatuses(statusesResponse.data.data || []);
        }
      } catch (error) {
        console.error('Error loading lookup data:', error);
      }
    }
    
    loadLookups();
  }, []);

  useEffect(() => {
    async function loadContractDetails() {
      setIsLoading(true);
      try {
        const response = await contractsAPI.getById(params.id);
        
        if (response.success && response.data.success) {
          const contractData = response.data.data.contract;
          const documentsData = response.data.data.documents || [];
          
          setContract(contractData);
          setDocuments(documentsData);
          
          setFormData({
            contractName: contractData.contractName || '',
            clientName: contractData.clientName || '',
            contractType: contractData.contractType || '',
            startDate: contractData.startDate || '',
            endDate: contractData.endDate || '',
            value: contractData.value || '',
            status: contractData.status || '',
            description: contractData.description || '',
          });
          
          // Load activity history from backend
          await fetchHistory();
        } else {
          toast.error('Contract not found', { icon: '❌' });
          router.push('/contracts');
        }
      } catch (error) {
        console.error('Error loading contract:', error);
        toast.error('Failed to load contract details', { icon: '⚠️' });
        
        // Fallback to localStorage
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
      } finally {
        setIsLoading(false);
      }
    }

    loadContractDetails();
  }, [params.id, router]);

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

  const handleSave = async () => {
    // Check if status is changing to 'active' from 'draft' or 'pending'
    if (formData.status === 'active' && ['draft', 'pending'].includes(contract.status)) {
      const confirmed = window.confirm(
        'Confirm changing status to active - This action cannot be reverted.\n\nOnce active, the contract fields will be locked and can only be expired or renewed.'
      );
      
      if (!confirmed) {
        return; // User cancelled, don't proceed
      }
    }
    
    const loadingToast = toast.loading('Saving changes...', { icon: '⏳' });
    
    try {
      // Prepare update data
      const updateData = {
        contractName: formData.contractName,
        clientName: formData.clientName,
        contractType: formData.contractType,
        startDate: formData.startDate,
        endDate: formData.endDate || null,
        value: formData.value || null,
        status: formData.status,
        description: formData.description || '',
      };

      const response = await contractsAPI.update(params.id, updateData);
      
      if (response.success && response.data.success) {
        // Track changes for activity log
        const oldContract = contract;
        const changes = [];
        Object.keys(formData).forEach(key => {
          if (oldContract[key] !== formData[key]) {
            changes.push({
              field: key,
              oldValue: oldContract[key],
              newValue: formData[key]
            });
          }
        });

        // Update local state
        const updatedContract = {
          ...contract,
          ...formData,
          lastModified: response.data.data.lastModified || new Date().toISOString()
        };
        
        setContract(updatedContract);
        setIsEditing(false);

        // Update localStorage cache
        const contracts = JSON.parse(localStorage.getItem('contracts') || '[]');
        const index = contracts.findIndex(c => c.id === params.id);
        if (index !== -1) {
          contracts[index] = updatedContract;
          localStorage.setItem('contracts', JSON.stringify(contracts));
        }

        // Refresh activity history (backend automatically logged the change)
        await fetchHistory();

        toast.dismiss(loadingToast);
        toast.success('Contract saved successfully!', {
          icon: '✅',
        });
      } else {
        throw new Error(response.data?.error || 'Failed to save contract');
      }
    } catch (error) {
      console.error('Error saving contract:', error);
      toast.dismiss(loadingToast);
      toast.error(error.message || 'Failed to save changes', {
        icon: '❌',
      });
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    const loadingToast = toast.loading('Uploading document...', { icon: '⏳' });

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await contractsAPI.uploadDocument(params.id, formData);

      if (response.success && response.data.success) {
        const newDoc = response.data.data;
        
        setDocuments([...documents, newDoc]);

        // Refresh activity history (backend automatically logged the upload)
        await fetchHistory();

        toast.dismiss(loadingToast);
        toast.success(`Document "${file.name}" uploaded successfully!`, {
          icon: '📄',
        });
      } else {
        throw new Error(response.data?.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Error uploading document:', error);
      toast.dismiss(loadingToast);
      toast.error(error.message || 'Failed to upload document', {
        icon: '❌',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownloadDocument = async (doc) => {
    const loadingToast = toast.loading(`Downloading ${doc.fileName}...`, { icon: '📥' });
    
    try {
      const result = await documentsAPI.download(doc.id, doc.fileName);
      
      if (result.success) {
        toast.dismiss(loadingToast);
        toast.success(`Downloaded ${doc.fileName}!`, {
          icon: '✅',
        });
      } else {
        throw new Error(result.error || 'Download failed');
      }
    } catch (error) {
      console.error('Error downloading document:', error);
      toast.dismiss(loadingToast);
      toast.error('Failed to download document', { icon: '❌' });
    }
  };

  const handleDeleteDocument = async (docId) => {
    const doc = documents.find(d => d.id === docId);
    
    if (!confirm(`Delete "${doc?.fileName || 'this document'}"?`)) return;
    
    const loadingToast = toast.loading('Deleting document...', { icon: '⏳' });

    try {
      const response = await documentsAPI.delete(docId);

      if (response.success && response.data.success) {
        // Remove from local state
        setDocuments(documents.filter(d => d.id !== docId));

        // Refresh activity history (backend automatically logged the deletion)
        await fetchHistory();

        toast.dismiss(loadingToast);
        toast.success(`Document "${doc?.fileName}" deleted successfully!`, {
          icon: '🗑️',
        });
      } else {
        throw new Error(response.data?.error || 'Failed to delete document');
      }
    } catch (error) {
      console.error('Error deleting document:', error);
      toast.dismiss(loadingToast);
      toast.error(error.message || 'Failed to delete document', {
        icon: '❌',
      });
    }
  };

  const handleRenew = async (renewFormData) => {
    const loadingToast = toast.loading('Creating renewal...', { icon: '⏳' });

    try {
      const response = await contractsAPI.renew(params.id, renewFormData);

      if (response.success && response.data.success) {
        const { new_contract_id, new_version, old_version } = response.data.data;

        toast.dismiss(loadingToast);
        toast.success(`Contract renewed successfully! Created ${new_version}`, {
          icon: '✅',
          duration: 4000,
        });

        // Redirect to new contract version
        setTimeout(() => {
          router.push(`/contracts/${new_contract_id}`);
        }, 500);
      } else {
        throw new Error(response.data?.error || 'Failed to renew contract');
      }
    } catch (error) {
      console.error('Error renewing contract:', error);
      toast.dismiss(loadingToast);
      toast.error(error.message || 'Failed to renew contract', {
        icon: '❌',
      });
      throw error;
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
      active: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      expired: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
      renewed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
    };
    return colors[status] || colors.draft;
  };

  if (isLoading) {
    return (
      <ProtectedLayout>
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-3">
            <svg className="animate-spin h-8 w-8 text-blue-600 dark:text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <div className="text-gray-600 dark:text-gray-400">Loading contract...</div>
          </div>
        </div>
      </ProtectedLayout>
    );
  }

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
              <div className="mt-1 flex items-center gap-3 flex-wrap">
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
                <span className="text-gray-400">|</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 dark:bg-indigo-900/20 text-indigo-800 dark:text-indigo-400">
                  Version {contract.version || 1}
                </span>
              </div>
              
              {/* Renewal Info */}
              {(contract.renewed_to || contract.renewed_from) && (
                <div className="mt-2 flex items-center gap-3 text-sm">
                  {contract.renewed_from && (
                    <button
                      onClick={() => router.push(`/contracts/${contract.renewed_from}`)}
                      className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                      </svg>
                      Previous Version (V{contract.version - 1})
                    </button>
                  )}
                  {contract.renewed_to && (
                    <button
                      onClick={() => router.push(`/contracts/${contract.renewed_to}`)}
                      className="flex items-center gap-1 text-green-600 dark:text-green-400 hover:underline"
                    >
                      Renewed to Version {contract.version + 1}
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </button>
                  )}
                </div>
              )}
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
            
            {/* Renew Button - Only show for active contracts that haven't been renewed (not expired) */}
            {contract.status === 'active' && !contract.renewed_to && (
              <button
                onClick={() => setShowRenewModal(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Renew Contract
              </button>
            )}
            
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
            <>
              {['active', 'renewed', 'expired'].includes(contract.status) && (
                <div className="mb-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div className="text-sm text-yellow-800 dark:text-yellow-200">
                      <p className="font-semibold mb-1">Locked Contract - View Only</p>
                      <p>Active, Renewed, and Expired contracts are locked and cannot be edited.</p>
                    </div>
                  </div>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Contract Name</label>
                  <input
                    type="text"
                    name="contractName"
                    value={formData.contractName}
                    onChange={handleInputChange}
                    disabled={['active', 'renewed', 'expired'].includes(contract.status)}
                    className={`w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 ${['active', 'renewed', 'expired'].includes(contract.status) ? 'opacity-60 cursor-not-allowed' : ''}`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Client Name</label>
                  <input
                    type="text"
                    name="clientName"
                    value={formData.clientName}
                    onChange={handleInputChange}
                    disabled={['active', 'renewed', 'expired'].includes(contract.status)}
                    className={`w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 ${['active', 'renewed', 'expired'].includes(contract.status) ? 'opacity-60 cursor-not-allowed' : ''}`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Contract Type</label>
                  <select
                    name="contractType"
                    value={formData.contractType}
                    onChange={handleInputChange}
                    disabled={['active', 'renewed', 'expired'].includes(contract.status)}
                    className={`w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 ${['active', 'renewed', 'expired'].includes(contract.status) ? 'opacity-60 cursor-not-allowed' : ''}`}
                  >
                    {contractTypes.map((type) => (
                      <option key={type.id} value={type.name}>
                        {type.description || type.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Start Date</label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    disabled={['active', 'renewed', 'expired'].includes(contract.status)}
                    className={`w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 ${['active', 'renewed', 'expired'].includes(contract.status) ? 'opacity-60 cursor-not-allowed' : ''}`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">End Date</label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    disabled={['active', 'renewed', 'expired'].includes(contract.status)}
                    className={`w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 ${['active', 'renewed', 'expired'].includes(contract.status) ? 'opacity-60 cursor-not-allowed' : ''}`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Contract Value ($)</label>
                  <input
                    type="number"
                    name="value"
                    value={formData.value}
                    onChange={handleInputChange}
                    disabled={['active', 'renewed', 'expired'].includes(contract.status)}
                    className={`w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 ${['active', 'renewed', 'expired'].includes(contract.status) ? 'opacity-60 cursor-not-allowed' : ''}`}
                  />
                </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  disabled={['renewed', 'expired'].includes(contract.status)}
                  className={`w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 ${['renewed', 'expired'].includes(contract.status) ? 'opacity-60 cursor-not-allowed' : ''}`}
                >
                  {contractStatuses.map((status) => {
                    // For locked contracts (active, renewed, expired), limit status options
                    if (['active', 'renewed', 'expired'].includes(contract.status) && !['active', 'renewed', 'expired'].includes(status.name)) {
                      return null;
                    }
                    return (
                      <option key={status.id} value={status.name}>
                        {status.description || status.name}
                      </option>
                    );
                  })}
                </select>
                {contract.status === 'renewed' && (
                  <p className="mt-1 text-xs text-blue-600 dark:text-blue-400">
                    🔒 This is an archived version and cannot be modified.
                  </p>
                )}
                {contract.status === 'expired' && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                    🔒 Expired contracts are locked. Create new contract.
                  </p>
                )}
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Comments</label>
                <textarea
                  name="description"
                  rows={4}
                  value={formData.description}
                  onChange={handleInputChange}
                  disabled={['renewed', 'expired'].includes(contract.status)}
                  className={`w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 ${['renewed', 'expired'].includes(contract.status) ? 'opacity-60 cursor-not-allowed' : ''}`}
                />
              </div>
            </div>
            </>
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

              {/* Comments - Full Width if exists */}
              {contract.description && (
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Comments</p>
                  <p className="text-base text-gray-900 dark:text-white">{contract.description}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Documents Section */}
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Documents ({documents.length})
            </h2>
            <div>
              <input
                type="file"
                id="doc-upload"
                className="hidden"
                onChange={handleFileUpload}
                disabled={isUploading}
                accept=".pdf,.doc,.docx"
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
                    Upload Supporting Document
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
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {/* Main Contract Document */}
              {documents.length > 0 && (
                <div className="p-6">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                    </svg>
                    Main Contract Document
                  </h3>
                  <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0">
                          <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {documents[0].fileName}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {(documents[0].fileSize / 1024).toFixed(2)} KB • Uploaded {new Date(documents[0].uploadedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="px-3 py-1.5 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded transition-colors">
                          View
                        </button>
                        <button 
                          onClick={() => handleDownloadDocument(documents[0])}
                          className="px-3 py-1.5 text-sm text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/20 rounded transition-colors"
                        >
                          Download
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Supporting Documents */}
              {documents.length > 1 && (
                <div className="p-6">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Supporting Documents ({documents.length - 1})
                  </h3>
                  <div className="space-y-2">
                    {documents.slice(1).map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors">
                        <div className="flex items-center gap-3 flex-1">
                          <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                          </svg>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {doc.fileName}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {(doc.fileSize / 1024).toFixed(2)} KB • {new Date(doc.uploadedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button className="px-3 py-1.5 text-xs text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded transition-colors">
                            View
                          </button>
                          <button 
                            onClick={() => handleDownloadDocument(doc)}
                            className="px-3 py-1.5 text-xs text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/20 rounded transition-colors"
                          >
                            Download
                          </button>
                          <button
                            onClick={() => handleDeleteDocument(doc.id)}
                            className="px-3 py-1.5 text-xs text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/20 rounded transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Activity History Sidebar */}
        <ActivityHistorySidebar 
          isOpen={showHistory}
          onClose={() => setShowHistory(false)}
          activityHistory={activityHistory}
        />

        {/* Renewal Modal */}
        <RenewContractModal
          contract={contract}
          isOpen={showRenewModal}
          onClose={() => setShowRenewModal(false)}
          onRenewSuccess={handleRenew}
        />
      </div>
    </ProtectedLayout>
  );
}
