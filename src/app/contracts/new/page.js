'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { contractsAPI, lookupsAPI } from '@/lib/api';
import ProtectedLayout from '@/components/ProtectedLayout';
import mammoth from 'mammoth';
import toast from 'react-hot-toast';

export default function CreateContract() {
  const router = useRouter();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [documentHtml, setDocumentHtml] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Lookup data
  const [contractTypes, setContractTypes] = useState([]);
  
  const [formData, setFormData] = useState({
    contractName: '',
    clientName: '',
    contractType: '',
    startDate: '',
    endDate: '',
    value: '',
    status: 'draft',
    description: '',
  });

  // Fetch contract types on mount
  useEffect(() => {
    async function loadContractTypes() {
      try {
        const response = await lookupsAPI.getContractTypes();
        if (response.success && response.data.success) {
          setContractTypes(response.data.data || []);
        }
      } catch (error) {
        console.error('Error loading contract types:', error);
      }
    }
    
    loadContractTypes();
  }, []);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedFile(file);
      setIsProcessing(true);
      
      try {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.convertToHtml({ arrayBuffer });
        setDocumentHtml(result.value);
        toast.success(`Document "${file.name}" loaded successfully!`, {
          icon: '📄',
        });
      } catch (error) {
        console.error('Error reading document:', error);
        toast.error('Error loading document. Please try again.', {
          icon: '❌',
        });
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Show loading toast
    const loadingToast = toast.loading('Creating contract...', {
      icon: '⏳',
    });
    
    try {
      // Prepare FormData for multipart/form-data request
      const contractFormData = new FormData();
      contractFormData.append('contractName', formData.contractName);
      contractFormData.append('clientName', formData.clientName);
      contractFormData.append('contractType', formData.contractType);
      contractFormData.append('startDate', formData.startDate);
      contractFormData.append('endDate', formData.endDate || '');
      contractFormData.append('value', formData.value || '0');
      contractFormData.append('status', formData.status);
      contractFormData.append('description', formData.description || '');
      
      // Add file if uploaded
      if (uploadedFile) {
        contractFormData.append('file', uploadedFile);
      }

      // Create contract via API
      const response = await contractsAPI.create(contractFormData);
      
      if (response.success && response.data.success) {
        const createdContract = response.data.data;
        
        // Update localStorage cache
        const existingContracts = JSON.parse(localStorage.getItem('contracts') || '[]');
        existingContracts.push(createdContract);
        localStorage.setItem('contracts', JSON.stringify(existingContracts));
        
        // Dismiss loading toast and show success
        toast.dismiss(loadingToast);
        toast.success('Contract created successfully!', {
          icon: '✅',
          duration: 4000,
        });
        
        setTimeout(() => {
          router.push('/contracts');
        }, 500);
      } else {
        // Show backend error message
        const errorMsg = response.data?.error || response.data?.message || 'Failed to create contract';
        throw new Error(errorMsg);
      }
    } catch (error) {
      console.error('Error creating contract:', error);
      toast.dismiss(loadingToast);
      
      // Show detailed error message
      const errorMessage = error.message || 'Failed to create contract. Please try again.';
      toast.error(errorMessage, {
        icon: '❌',
        duration: 5000,
      });
      setIsSubmitting(false);
    }
  };

  return (
    <ProtectedLayout>
      <div>
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create New Contract</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Upload a contract document and fill in the details</p>
        </div>

        {!uploadedFile && (
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 text-center">Upload Contract Document</h2>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-16 text-center hover:border-blue-500 dark:hover:border-blue-400 transition-colors">
              <input type="file" id="file-upload" className="hidden" accept=".doc,.docx" onChange={handleFileChange} disabled={isProcessing} />
              <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                {isProcessing ? (
                  <>
                    <svg className="animate-spin h-16 w-16 text-blue-600 mb-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="text-lg font-medium text-gray-900 dark:text-white">Processing...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-20 h-20 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <span className="text-xl font-medium text-gray-900 dark:text-white mb-2">Click to upload</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">DOC, DOCX up to 10MB</span>
                  </>
                )}
              </label>
            </div>
          </div>
        )}

        {uploadedFile && (
          <form onSubmit={handleSubmit}>
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 flex items-center justify-between mb-6">
              <div className="flex items-center">
                <svg className="w-6 h-6 text-blue-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-300">{uploadedFile.name}</p>
                  <p className="text-xs text-blue-600 dark:text-blue-400">{(uploadedFile.size / 1024).toFixed(2)} KB</p>
                </div>
              </div>
              <button type="button" onClick={() => { setUploadedFile(null); setDocumentHtml(''); }} className="text-red-600 hover:text-red-800">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Contract Details</h2>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Contract Name *</label>
                  <input type="text" name="contractName" required value={formData.contractName} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500" placeholder="Enter contract name" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Client Name *</label>
                  <input type="text" name="clientName" required value={formData.clientName} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500" placeholder="Enter client name" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Contract Type *</label>
                  <select name="contractType" required value={formData.contractType} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500">
                    <option value="">Select type</option>
                    {contractTypes.map((type) => (
                      <option key={type.id} value={type.name}>
                        {type.description || type.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Start Date *</label>
                  <input type="date" name="startDate" required value={formData.startDate} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">End Date</label>
                  <input type="date" name="endDate" value={formData.endDate} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Contract Value ($)</label>
                  <input type="number" name="value" value={formData.value} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500" placeholder="0.00" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
                  <div className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 flex items-center gap-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300">
                      Draft
                    </span>
                    <span className="text-sm">All new contracts start as Draft</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
                  <textarea name="description" rows={4} value={formData.description} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500" placeholder="Add notes..." />
                </div>

                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => router.push('/contracts')} className="flex-1 px-6 py-2.5 border border-gray-300 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">Cancel</button>
                  <button type="submit" disabled={isSubmitting} className="flex-1 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 flex items-center justify-center gap-2">
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Creating...
                      </>
                    ) : 'Create Contract'}
                  </button>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Document Preview</h2>
                <div className="prose dark:prose-invert max-w-none h-[600px] overflow-y-auto p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  {documentHtml ? (
                    <div dangerouslySetInnerHTML={{ __html: documentHtml }} />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      <p>Loading document...</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </form>
        )}
      </div>
    </ProtectedLayout>
  );
}
