import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Layout } from './Layout';
import { DashboardHome } from './DashboardHome';
import { AddTransaction } from './AddTransaction';
import { ReceiptUpload } from './ReceiptUpload';
import { AIInsights } from './AIInsights';
import { Charts } from './Charts';
import { History } from './History';
import { Profile } from './Profile';
import { CheckCircle } from 'lucide-react';

interface Transaction {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  description: string;
  transaction_date: string;
  created_at: string;
}

interface Summary {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
}

export const DashboardContainer = () => {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [profile, setProfile] = useState<{ full_name: string; business_name: string | null } | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<Summary>({ totalIncome: 0, totalExpenses: 0, balance: 0 });
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [demoDataLoaded, setDemoDataLoaded] = useState(false);

  useEffect(() => {
    if (user) {
      loadProfile();
      loadTransactions();
      checkDemoData();
    }
  }, [user]);

  useEffect(() => {
    if (currentPage === 'add-transaction') {
      setShowAddModal(true);
      setCurrentPage('dashboard');
    } else if (currentPage === 'upload-receipt') {
      setShowReceiptModal(true);
      setCurrentPage('dashboard');
    }
  }, [currentPage]);

  const loadProfile = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('full_name, business_name')
      .eq('id', user!.id)
      .maybeSingle();

    if (data) setProfile(data);
  };

  const loadTransactions = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user!.id)
      .order('transaction_date', { ascending: false });

    if (data && !error) {
      setTransactions(data);
      calculateSummary(data);
    }
    setLoading(false);
  };

  const calculateSummary = (txns: Transaction[]) => {
    const income = txns.filter((t) => t.type === 'income').reduce((sum, t) => sum + Number(t.amount), 0);
    const expenses = txns.filter((t) => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0);
    setSummary({
      totalIncome: income,
      totalExpenses: expenses,
      balance: income - expenses,
    });
  };

  const checkDemoData = async () => {
    const { data } = await supabase
      .from('transactions')
      .select('id')
      .eq('user_id', user!.id)
      .limit(1)
      .maybeSingle();

    setDemoDataLoaded(!!data);
  };

  const loadDemoData = async () => {
    const demoTransactions = [
      {
        user_id: user!.id,
        amount: 25000,
        type: 'income',
        category: 'Sales',
        description: 'Product sales - Week 1',
        transaction_date: '2025-10-15',
      },
      {
        user_id: user!.id,
        amount: 18500,
        type: 'income',
        category: 'Services',
        description: 'Consulting services rendered',
        transaction_date: '2025-10-18',
      },
      {
        user_id: user!.id,
        amount: 3200,
        type: 'expense',
        category: 'Supplies',
        description: 'Office supplies purchase',
        transaction_date: '2025-10-10',
      },
      {
        user_id: user!.id,
        amount: 4500,
        type: 'expense',
        category: 'Utilities',
        description: 'Electricity and water bills',
        transaction_date: '2025-10-12',
      },
      {
        user_id: user!.id,
        amount: 15000,
        type: 'expense',
        category: 'Rent',
        description: 'Office rent - October',
        transaction_date: '2025-10-01',
      },
    ];

    const { error } = await supabase.from('transactions').insert(demoTransactions as any);

    if (!error) {
      await loadTransactions();
      setDemoDataLoaded(true);
      showSuccess('Demo data loaded successfully! Explore the insights.');
    }
  };

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleTransactionAdded = () => {
    loadTransactions();
    setShowAddModal(false);
    showSuccess('Transaction added successfully!');
  };

  const handleReceiptProcessed = () => {
    setShowReceiptModal(false);
    setShowAddModal(true);
    showSuccess('AI extracted data from receipt. Review and save transaction.');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return (
          <DashboardHome
            transactions={transactions}
            summary={summary}
            loading={loading}
            demoDataLoaded={demoDataLoaded}
            onLoadDemoData={loadDemoData}
            onAddTransaction={() => setShowAddModal(true)}
          />
        );
      case 'insights':
        return (
          <div className="space-y-6">
            <AIInsights transactions={transactions} summary={summary} />
            <Charts transactions={transactions} />
          </div>
        );
      case 'history':
        return <History transactions={transactions} onUpdate={loadTransactions} />;
      case 'profile':
        return <Profile />;
      default:
        return <div>Page not found</div>;
    }
  };

  return (
    <>
      <Layout currentPage={currentPage} onNavigate={setCurrentPage} profile={profile}>
        {renderPage()}
      </Layout>

      {showAddModal && (
        <AddTransaction
          onClose={() => setShowAddModal(false)}
          onSuccess={handleTransactionAdded}
        />
      )}

      {showReceiptModal && (
        <ReceiptUpload
          onClose={() => setShowReceiptModal(false)}
          onProcessed={handleReceiptProcessed}
        />
      )}

      {successMessage && (
        <div className="fixed top-20 right-4 z-50 animate-slide-in">
          <div className="bg-emerald-600 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 max-w-md">
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <p className="font-medium">{successMessage}</p>
          </div>
        </div>
      )}
    </>
  );
};
