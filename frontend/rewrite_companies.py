import re

content = """'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, Plus, Search, Shield, AlertTriangle, CheckCircle, XCircle, Trash2, Edit, Activity, Globe } from 'lucide-react';
import DomainDetails from '@/components/DomainDetails';

interface Company {
  id: number;
  name: string;
  domain: string;
  industry: string | null;
  description: string | null;
  monitoring_enabled: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string | null;
  last_analyzed: string | null;
}

interface CompanyWithDetails extends Company {
  latest_risk_assessment: {
    id: number;
    risk_level: string;
    security_score: number;
    active_incidents: number;
    created_at: string;
  } | null;
  active_threats_count: number;
  total_threats_count: number;
}

export default function CompaniesPage() {
  const router = useRouter();
  const [companies, setCompanies] = useState<CompanyWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    domain: '',
    industry: '',
    description: '',
    monitoring_enabled: true
  });

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/companies/');
      const data = await response.json();
      setCompanies(data);
      if (data.length > 0 && !selectedCompanyId) {
        setSelectedCompanyId(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching companies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8000/api/companies/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        await fetchCompanies();
        setShowAddModal(false);
        setFormData({ name: '', domain: '', industry: '', description: '', monitoring_enabled: true });
      }
    } catch (error) {
      console.error('Error adding company:', error);
    }
  };

  const handleDeleteCompany = async (companyId: number) => {
    if (!confirm('Are you sure you want to delete this company?')) return;
    
    try {
      const response = await fetch(`http://localhost:8000/api/companies/${companyId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        if (selectedCompanyId === companyId) {
          setSelectedCompanyId(null);
        }
        await fetchCompanies();
      }
    } catch (error) {
      console.error('Error deleting company:', error);
    }
  };

  const selectedCompany = companies.find(c => c.id === selectedCompanyId);

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <Building2 className="w-8 h-8 text-blue-400" />
              <h1 className="text-3xl font-bold">Company Monitoring</h1>
            </div>

            {companies.length > 0 && (
              <div className="flex items-center gap-2">
                <select
                  value={selectedCompanyId || ''}
                  onChange={(e) => setSelectedCompanyId(Number(e.target.value))}
                  className="bg-gray-900 border border-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
                >
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.domain})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
          <div className="flex items-center gap-4">
            {selectedCompany && (
                <button
                  onClick={() => handleDeleteCompany(selectedCompany.id)}
                  className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 px-4 py-2 rounded-lg transition"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Selected
                </button>
            )}
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition"
            >
              <Plus className="w-5 h-5" />
              Add Company
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-400">Loading companies...</div>
        ) : companies.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            No companies added yet. Add your first company to start monitoring.
          </div>
        ) : selectedCompany ? (
          <div className="mt-8">
             <DomainDetails key={selectedCompany.updated_at || Date.now()} domain={selectedCompany.domain} companyId={selectedCompany.id} />
          </div>
        ) : null}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-lg max-w-md w-full p-6 border border-gray-800">
            <h2 className="text-xl font-bold mb-4">Add Company</h2>
            <form onSubmit={handleAddCompany} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Company Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
                  placeholder="e.g. Acme Corp"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Domain</label>
                <input
                  type="text"
                  required
                  value={formData.domain}
                  onChange={(e) => setFormData({...formData, domain: e.target.value})}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
                  placeholder="e.g. acme.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Industry</label>
                <input
                  type="text"
                  value={formData.industry}
                  onChange={(e) => setFormData({...formData, industry: e.target.value})}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
                  placeholder="e.g. Technology"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500 min-h-[100px]"
                  placeholder="Brief description..."
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="monitoring"
                  checked={formData.monitoring_enabled}
                  onChange={(e) => setFormData({...formData, monitoring_enabled: e.target.checked})}
                  className="rounded border-gray-700 bg-gray-800 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="monitoring" className="text-sm text-gray-400">
                  Enable active monitoring
                </label>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-gray-400 hover:text-white transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition"
                >
                  Add Company
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
"""

with open("src/app/companies/page.tsx", "w") as f:
    f.write(content)
print("companies/page.tsx overwritten successfully")
