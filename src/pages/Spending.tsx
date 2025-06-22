
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { PlusCircle, IndianRupee } from 'lucide-react';
import DashboardHeader from '@/components/DashboardHeader';
import SpendingForm from '@/components/SpendingForm';
import SpendingAnalytics from '@/components/SpendingAnalytics';

const Spending = () => {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleFormSuccess = () => {
    setShowForm(false);
    setRefreshKey(prev => prev + 1);
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-3">
              <IndianRupee className="w-8 h-8 text-green-600" />
              <span>Spending Tracker</span>
            </h1>
            <p className="text-gray-600 mt-2">Track your daily expenses and analyze spending patterns.</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors space-x-2"
          >
            <PlusCircle className="w-5 h-5" />
            <span>Add Expense</span>
          </button>
        </div>

        {/* Spending Form Modal */}
        {showForm && (
          <SpendingForm 
            onClose={() => setShowForm(false)} 
            onSuccess={handleFormSuccess}
          />
        )}

        {/* Analytics Dashboard */}
        <SpendingAnalytics key={refreshKey} />
      </div>
    </div>
  );
};

export default Spending;
