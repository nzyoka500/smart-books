import { Lightbulb, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';

interface Transaction {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  transaction_date: string;
}

interface Summary {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
}

interface AIInsightsProps {
  transactions: Transaction[];
  summary: Summary;
}

interface Insight {
  type: 'tip' | 'warning' | 'positive';
  title: string;
  message: string;
  icon: typeof Lightbulb;
}

export const AIInsights = ({ transactions, summary }: AIInsightsProps) => {
  const generateInsights = (): Insight[] => {
    const insights: Insight[] = [];

    if (transactions.length === 0) {
      return [
        {
          type: 'tip',
          title: 'Welcome to SmartBooks AI',
          message: 'Start adding transactions to receive personalized financial insights powered by AI.',
          icon: Lightbulb,
        },
      ];
    }

    const recentWeek = transactions.slice(0, Math.min(7, transactions.length));
    const previousWeek = transactions.slice(7, Math.min(14, transactions.length));

    const recentExpenses = recentWeek
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    const previousExpenses = previousWeek
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    if (previousExpenses > 0) {
      const percentChange = ((recentExpenses - previousExpenses) / previousExpenses) * 100;

      if (percentChange > 15) {
        insights.push({
          type: 'warning',
          title: 'Rising Expenses Detected',
          message: `Your expenses increased by ${percentChange.toFixed(0)}% compared to the previous week. Consider reviewing your spending on high-cost categories.`,
          icon: AlertCircle,
        });
      } else if (percentChange < -10) {
        insights.push({
          type: 'positive',
          title: 'Great Expense Management',
          message: `Your expenses decreased by ${Math.abs(percentChange).toFixed(0)}% compared to last week. Keep up the excellent financial discipline!`,
          icon: TrendingDown,
        });
      }
    }

    const categoryTotals = transactions
      .filter((t) => t.type === 'expense')
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + Number(t.amount);
        return acc;
      }, {} as Record<string, number>);

    const topCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0];

    if (topCategory && summary.totalExpenses > 0) {
      const categoryPercentage = (topCategory[1] / summary.totalExpenses) * 100;
      if (categoryPercentage > 40) {
        insights.push({
          type: 'tip',
          title: 'Category Spending Alert',
          message: `${topCategory[0]} represents ${categoryPercentage.toFixed(0)}% of your total expenses (KES ${topCategory[1].toLocaleString('en-KE', { minimumFractionDigits: 2 })}). Consider finding ways to optimize costs in this area.`,
          icon: Lightbulb,
        });
      }
    }

    if (summary.balance > 0 && summary.totalIncome > 0) {
      const savingsRate = (summary.balance / summary.totalIncome) * 100;
      if (savingsRate > 20) {
        insights.push({
          type: 'positive',
          title: 'Strong Savings Rate',
          message: `You're saving ${savingsRate.toFixed(0)}% of your income. This is excellent financial health for an MSME. Consider investing surplus funds for growth.`,
          icon: TrendingUp,
        });
      }
    }

    if (summary.balance < 0) {
      insights.push({
        type: 'warning',
        title: 'Negative Cash Flow',
        message: `Your expenses exceed income by KES ${Math.abs(summary.balance).toLocaleString('en-KE', { minimumFractionDigits: 2 })}. Review your expense categories and consider ways to increase revenue or reduce costs.`,
        icon: AlertCircle,
      });
    }

    const incomeTransactions = transactions.filter((t) => t.type === 'income');
    if (incomeTransactions.length > 0) {
      const avgIncome =
        incomeTransactions.reduce((sum, t) => sum + Number(t.amount), 0) / incomeTransactions.length;

      insights.push({
        type: 'tip',
        title: 'Income Pattern Analysis',
        message: `Your average income per transaction is KES ${avgIncome.toLocaleString('en-KE', { minimumFractionDigits: 2 })}. Focus on increasing transaction frequency or value to boost overall revenue.`,
        icon: Lightbulb,
      });
    }

    return insights.slice(0, 3);
  };

  const insights = generateInsights();

  const getInsightStyles = (type: string) => {
    switch (type) {
      case 'warning':
        return {
          bg: 'bg-amber-50',
          border: 'border-amber-200',
          icon: 'text-amber-600',
          title: 'text-amber-900',
          text: 'text-amber-700',
        };
      case 'positive':
        return {
          bg: 'bg-emerald-50',
          border: 'border-emerald-200',
          icon: 'text-emerald-600',
          title: 'text-emerald-900',
          text: 'text-emerald-700',
        };
      default:
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          icon: 'text-blue-600',
          title: 'text-blue-900',
          text: 'text-blue-700',
        };
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8">
      <div className="flex items-center gap-2 mb-5">
        <Lightbulb className="w-6 h-6 text-emerald-600" />
        <h2 className="text-xl font-bold text-slate-900">AI-Powered Insights</h2>
      </div>

      <div className="space-y-4">
        {insights.map((insight, index) => {
          const styles = getInsightStyles(insight.type);
          const Icon = insight.icon;

          return (
            <div
              key={index}
              className={`${styles.bg} border ${styles.border} rounded-xl p-4 transition-all hover:shadow-md`}
            >
              <div className="flex items-start gap-3">
                <Icon className={`w-5 h-5 ${styles.icon} mt-0.5 flex-shrink-0`} />
                <div className="flex-1 min-w-0">
                  <h3 className={`font-bold ${styles.title} mb-1`}>{insight.title}</h3>
                  <p className={`text-sm ${styles.text} leading-relaxed`}>{insight.message}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-5 pt-5 border-t border-slate-200">
        <p className="text-xs text-slate-500 flex items-center gap-1">
          <Lightbulb className="w-3.5 h-3.5" />
          AI insights are generated based on your transaction patterns and financial behavior
        </p>
      </div>
    </div>
  );
};
