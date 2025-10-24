import { TrendingUp, TrendingDown, Wallet, Plus, Upload, Sparkles } from 'lucide-react';

interface Transaction {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  description: string;
  transaction_date: string;
}

interface Summary {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
}

interface DashboardHomeProps {
  transactions: Transaction[];
  summary: Summary;
  loading: boolean;
  demoDataLoaded: boolean;
  onLoadDemoData: () => void;
  onAddTransaction: () => void;
}

export const DashboardHome = ({
  transactions,
  summary,
  loading,
  demoDataLoaded,
  onLoadDemoData,
  onAddTransaction,
}: DashboardHomeProps) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

      {!demoDataLoaded && transactions.length === 0 && (
        <div className="bg-gradient-to-br from-emerald-50 to-blue-50 border-2 border-emerald-200 rounded-2xl p-8 text-center">
          <Sparkles className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-900 mb-2">Try Demo Mode</h3>
          <p className="text-slate-600 mb-6 max-w-md mx-auto">
            Load sample transactions to explore SmartBooks AI features including insights, charts, and analytics.
          </p>
          <button
            onClick={onLoadDemoData}
            className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors shadow-md"
          >
            Load Demo Data
          </button>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-xl font-bold text-slate-900 mb-6">Recent Transactions</h2>

        {loading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-slate-600">Loading transactions...</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-600 mb-4">No transactions yet</p>
            <button
              onClick={onAddTransaction}
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add Your First Transaction
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.slice(0, 5).map((txn) => (
              <div
                key={txn.id}
                className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      txn.type === 'income' ? 'bg-emerald-100' : 'bg-red-100'
                    }`}
                  >
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
                <div className={`text-lg font-bold ${txn.type === 'income' ? 'text-emerald-600' : 'text-red-600'}`}>
                  {txn.type === 'income' ? '+' : '-'}KES{' '}
                  {Number(txn.amount).toLocaleString('en-KE', { minimumFractionDigits: 2 })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
