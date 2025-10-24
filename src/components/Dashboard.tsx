import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { TrendingUp, TrendingDown, Wallet, Plus, Upload, LogOut, Lightbulb } from 'lucide-react';
import { AddTransaction } from './AddTransaction';
import { ReceiptUpload } from './ReceiptUpload';
import { AIInsights } from './AIInsights';

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

export const Dashboard = () => {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<{ full_name: string; business_name: string | null } | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<Summary>({ totalIncome: 0, totalExpenses: 0, balance: 0 });
  const [loading, setLoading] = useState(true);
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [showReceiptUpload, setShowReceiptUpload] = useState(false);

  useEffect(() => {
    if (user) {
      loadProfile();
      loadTransactions();
    }
  }, [user]);

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
      .order('transaction_date', { ascending: false })
      .limit(50);

    if (data && !error) {
      setTransactions(data);
      calculateSummary(data);
    }
    setLoading(false);
  };

  const calculateSummary = (txns: Transaction[]) => {
    const income = txns.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount), 0);
    const expenses = txns.filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0);
    setSummary({
      totalIncome: income,
      totalExpenses: expenses,
      balance: income - expenses,
    });
  };

  const handleTransactionAdded = () => {
    loadTransactions();
    setShowAddTransaction(false);
  };

  const handleReceiptProcessed = (data: { amount: number; date: string; description: string }) => {
    setShowReceiptUpload(false);
    setShowAddTransaction(true);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">SmartBooks AI</h1>
                {profile && (
                  <p className="text-xs text-slate-600">
                    {profile.business_name || profile.full_name}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={() => signOut()}
              className="flex items-center gap-2 px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm font-medium">Sign Out</span>
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-600">Total Income</span>
              <TrendingUp className="w-5 h-5 text-emerald-600" />
            </div>
            <p className="text-3xl font-bold text-slate-900">
              KES {summary.totalIncome.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-600">Total Expenses</span>
              <TrendingDown className="w-5 h-5 text-red-600" />
            </div>
            <p className="text-3xl font-bold text-slate-900">
              KES {summary.totalExpenses.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-600">Balance</span>
              <Wallet className="w-5 h-5 text-slate-600" />
            </div>
            <p className={`text-3xl font-bold ${summary.balance >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              KES {summary.balance.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        <AIInsights transactions={transactions} summary={summary} />

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900">Quick Actions</h2>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setShowAddTransaction(true)}
              className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors shadow-md"
            >
              <Plus className="w-5 h-5" />
              Add Transaction
            </button>
            <button
              onClick={() => setShowReceiptUpload(true)}
              className="flex items-center gap-2 px-6 py-3 bg-slate-800 text-white rounded-xl font-medium hover:bg-slate-900 transition-colors shadow-md"
            >
              <Upload className="w-5 h-5" />
              Upload Receipt
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Recent Transactions</h2>

          {loading ? (
            <div className="text-center py-12 text-slate-600">Loading transactions...</div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-600 mb-4">No transactions yet</p>
              <button
                onClick={() => setShowAddTransaction(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Add Your First Transaction
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((txn) => (
                <div
                  key={txn.id}
                  className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      txn.type === 'income' ? 'bg-emerald-100' : 'bg-red-100'
                    }`}>
                      {txn.type === 'income' ? (
                        <TrendingUp className="w-6 h-6 text-emerald-600" />
                      ) : (
                        <TrendingDown className="w-6 h-6 text-red-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{txn.category}</p>
                      <p className="text-sm text-slate-600">{txn.description || 'No description'}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        {new Date(txn.transaction_date).toLocaleDateString('en-KE', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                  <div className={`text-lg font-bold ${
                    txn.type === 'income' ? 'text-emerald-600' : 'text-red-600'
                  }`}>
                    {txn.type === 'income' ? '+' : '-'}KES {Number(txn.amount).toLocaleString('en-KE', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {showAddTransaction && (
        <AddTransaction
          onClose={() => setShowAddTransaction(false)}
          onSuccess={handleTransactionAdded}
        />
      )}

      {showReceiptUpload && (
        <ReceiptUpload
          onClose={() => setShowReceiptUpload(false)}
          onProcessed={handleReceiptProcessed}
        />
      )}
    </div>
  );
};
