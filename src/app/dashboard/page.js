'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedLayout from '@/components/ProtectedLayout';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const router = useRouter();
  const [contracts, setContracts] = useState([]);
  const [statusData, setStatusData] = useState([]);
  const [expiryData, setExpiryData] = useState([]);
  const [clientData, setClientData] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    draft: 0,
    expired: 0,
    pending: 0,
    totalValue: 0,
  });

  useEffect(() => {
    // Load contracts from localStorage
    const stored = localStorage.getItem('contracts');
    if (stored) {
      const parsedContracts = JSON.parse(stored);
      setContracts(parsedContracts);
      
      // Calculate stats
      const active = parsedContracts.filter(c => c.status === 'active').length;
      const draft = parsedContracts.filter(c => c.status === 'draft').length;
      const expired = parsedContracts.filter(c => c.status === 'expired').length;
      const pending = parsedContracts.filter(c => c.status === 'pending').length;
      const totalValue = parsedContracts.reduce((sum, c) => sum + (parseFloat(c.value) || 0), 0);

      setStats({
        total: parsedContracts.length,
        active,
        draft,
        expired,
        pending,
        totalValue,
      });

      // Status Overview Data (for donut chart)
      const statusWithClients = {
        'Active': parsedContracts.filter(c => c.status === 'active').map(c => c.clientName),
        'Draft': parsedContracts.filter(c => c.status === 'draft').map(c => c.clientName),
        'Expired': parsedContracts.filter(c => c.status === 'expired').map(c => c.clientName),
        'Pending': parsedContracts.filter(c => c.status === 'pending').map(c => c.clientName),
      };

      setStatusData([
        { name: 'Active', value: active, color: '#10b981', clients: statusWithClients['Active'] },
        { name: 'Draft', value: draft, color: '#6b7280', clients: statusWithClients['Draft'] },
        { name: 'Expired', value: expired, color: '#ef4444', clients: statusWithClients['Expired'] },
        { name: 'Pending', value: pending, color: '#f59e0b', clients: statusWithClients['Pending'] },
      ]);

      // Expiry Forecast (contracts expiring in next 12 months)
      const today = new Date();
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const expiryByMonth = {};
      const clientsByMonth = {};
      
      for (let i = 0; i < 12; i++) {
        const month = new Date(today.getFullYear(), today.getMonth() + i, 1);
        const monthKey = `${monthNames[month.getMonth()]} ${month.getFullYear()}`;
        expiryByMonth[monthKey] = 0;
        clientsByMonth[monthKey] = [];
      }

      parsedContracts.forEach(contract => {
        if (contract.endDate) {
          const endDate = new Date(contract.endDate);
          const monthKey = `${monthNames[endDate.getMonth()]} ${endDate.getFullYear()}`;
          if (expiryByMonth.hasOwnProperty(monthKey)) {
            expiryByMonth[monthKey]++;
            clientsByMonth[monthKey].push(contract.clientName);
          }
        }
      });

      setExpiryData(Object.keys(expiryByMonth).map(month => ({
        month,
        expirations: expiryByMonth[month],
        clients: clientsByMonth[month],
      })));

      // Client Contracts Count
      const contractsByClient = {};
      parsedContracts.forEach(contract => {
        const client = contract.clientName || 'Unknown';
        contractsByClient[client] = (contractsByClient[client] || 0) + 1;
      });

      const sortedClients = Object.entries(contractsByClient)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([client, count]) => ({
          client,
          contracts: count,
        }));

      setClientData(sortedClients);
    }
  }, []);

  const COLORS = ['#10b981', '#6b7280', '#ef4444', '#f59e0b'];

  const CustomStatusTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const uniqueClients = [...new Set(data.clients || [])];
      return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 max-w-xs">
          <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
            {data.name}: {data.value} {data.value === 1 ? 'contract' : 'contracts'}
          </p>
          {uniqueClients.length > 0 && (
            <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Clients:</p>
              <div className="max-h-32 overflow-y-auto">
                {uniqueClients.map((client, idx) => (
                  <p key={idx} className="text-xs text-gray-700 dark:text-gray-300 py-0.5">
                    • {client}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  const CustomExpiryTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const uniqueClients = [...new Set(data.clients || [])];
      return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 max-w-xs">
          <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
            {data.month}: {data.expirations} {data.expirations === 1 ? 'expiration' : 'expirations'}
          </p>
          {uniqueClients.length > 0 && (
            <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Clients:</p>
              <div className="max-h-32 overflow-y-auto">
                {uniqueClients.map((client, idx) => (
                  <p key={idx} className="text-xs text-gray-700 dark:text-gray-300 py-0.5">
                    • {client}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  const CustomClientTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {payload[0].payload.client}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            {payload[0].value} {payload[0].value === 1 ? 'contract' : 'contracts'}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <ProtectedLayout>
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Dashboard
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Overview of your contract management activities
        </p>
        
        {/* Stats Cards */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Contracts</h3>
            <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
          </div>
          
          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Contracts</h3>
            <p className="mt-2 text-3xl font-bold text-green-600 dark:text-green-500">{stats.active}</p>
          </div>
          
          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Expired Contracts</h3>
            <p className="mt-2 text-3xl font-bold text-red-600 dark:text-red-500">{stats.expired}</p>
          </div>

          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Value</h3>
            <p className="mt-2 text-3xl font-bold text-blue-600 dark:text-blue-500">
              ${stats.totalValue.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Charts Row */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Status Overview - Donut Chart */}
          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Status Overview</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomStatusTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Expiry Forecast - Bar Chart */}
          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Expiry Forecast (Next 12 Months)</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={expiryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="month" 
                  stroke="#9ca3af" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  fontSize={11}
                />
                <YAxis stroke="#9ca3af" />
                <Tooltip content={<CustomExpiryTooltip />} />
                <Bar dataKey="expirations" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Clients Table */}
        <div className="mt-6 bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Clients</h2>
            {/* <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Click on a client to view their contracts</p> */}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Client Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Total Contracts
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Active Contracts
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {clientData.map((client, index) => {
                  const activeCount = contracts.filter(c => c.clientName === client.client && c.status === 'active').length;
                  return (
                    <tr 
                      key={index}
                      onClick={() => router.push(`/contracts?vendor=${encodeURIComponent(client.client)}`)}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {client.client}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {client.contracts}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-green-600 dark:text-green-400">
                          {activeCount}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/contracts?vendor=${encodeURIComponent(client.client)}`);
                          }}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
                        >
                          View Contracts →
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {clientData.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">No clients found. Create some contracts to get started.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedLayout>
  );
}
