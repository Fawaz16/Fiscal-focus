import { useState, useEffect } from 'react';
import { FiDownload, FiPrinter, FiCalendar, FiFilter, FiFileText, FiPieChart, FiBarChart, FiTrendingUp, FiDollarSign } from 'react-icons/fi';
import { format, subMonths, startOfYear, parseISO, subDays } from 'date-fns';
import Papa from 'papaparse';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useCurrency } from '../../context/CurrencyContext';

const Reports = () => {
  const { currency, formatAmount } = useCurrency();
  const [dateRange, setDateRange] = useState({
    startDate: format(startOfYear(new Date()), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd'),
  });
  const [reportType, setReportType] = useState('monthly');
  const [generating, setGenerating] = useState(false);
  const [exportFormat, setExportFormat] = useState('PDF');
  const [reportData, setReportData] = useState(null);
  const [includeOptions, setIncludeOptions] = useState({
    income: true,
    expenses: true,
    categories: true,
    budgets: true,
    charts: false,
    transactions: true,
    savings: true,
    forecast: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Auto-generate report when reportType changes (except custom)
  useEffect(() => {
    if (reportType !== 'custom' && reportType !== '') {
      const timer = setTimeout(() => {
        handleGenerateReport();
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [reportType, includeOptions]);

  // Fetch data from backend using your API service
  const fetchReportData = async () => {
    setIsLoading(true);
    setGenerating(true);
    setError(null);
    
    try {
      const [dashboardRes, transactionsRes, categoriesRes, budgetRes] = await Promise.allSettled([
        api.get('/user/dashboard'),
        api.get('/transactions', {
          params: {
            startDate: dateRange.startDate,
            endDate: dateRange.endDate,
            limit: 1000
          }
        }),
        api.get('/categories'),
        api.get('/budgets/overview')
      ]);

      const dashboardData = dashboardRes.status === 'fulfilled' ? dashboardRes.value.data : null;
      const transactionsData = transactionsRes.status === 'fulfilled' ? transactionsRes.value.data : null;
      const categoriesData = categoriesRes.status === 'fulfilled' ? categoriesRes.value.data : null;
      const budgetData = budgetRes.status === 'fulfilled' ? budgetRes.value.data : null;

      const processedData = processReportData(
        dashboardData,
        transactionsData,
        categoriesData,
        budgetData
      );
      setReportData(processedData);
      
      toast.success('Report generated successfully!');
      
    } catch (error) {
      console.error('Error fetching report data:', error);
      setError('Failed to generate report. Using sample data.');
      toast.error('Failed to generate report. Using sample data.');
      setReportData(generateMockReportData());
    } finally {
      setIsLoading(false);
      setGenerating(false);
    }
  };

  const processReportData = (dashboard, transactions, categories, budget) => {
    const income = transactions?.data?.transactions?.filter(t => t.type === 'income') || [];
    const expenses = transactions?.data?.transactions?.filter(t => t.type === 'expense') || [];
    
    const categoryBreakdown = calculateCategoryBreakdown(expenses, categories?.data?.categories);
    const monthlyTrend = calculateMonthlyTrend(transactions?.data?.transactions || []);
    const budgetAnalysis = analyzeBudgetPerformance(budget?.data, expenses);
    const savingsProgress = dashboard?.data?.overview?.savingsProgress;

    return {
      summary: {
        totalIncome: income.reduce((sum, t) => sum + (t.amount || 0), 0),
        totalExpenses: expenses.reduce((sum, t) => sum + (t.amount || 0), 0),
        netBalance: dashboard?.data?.overview?.currentBalance || 0,
        transactionCount: transactions?.data?.transactions?.length || 0,
        period: `${dateRange.startDate} to ${dateRange.endDate}`,
      },
      categoryBreakdown,
      monthlyTrend,
      budgetAnalysis,
      savingsProgress,
      transactions: transactions?.data?.transactions || [],
      topCategories: categoryBreakdown.slice(0, 5),
      dateRange: {
        start: dateRange.startDate,
        end: dateRange.endDate
      }
    };
  };

  const calculateCategoryBreakdown = (expenses, categories) => {
    const breakdown = {};
    
    expenses.forEach(expense => {
      const categoryName = expense.Category?.name || 'Uncategorized';
      if (!breakdown[categoryName]) {
        breakdown[categoryName] = {
          amount: 0,
          color: expense.Category?.color || '#999999',
          count: 0
        };
      }
      breakdown[categoryName].amount += expense.amount || 0;
      breakdown[categoryName].count += 1;
    });

    const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    
    return Object.entries(breakdown).map(([name, data]) => ({
      name,
      ...data,
      percentage: totalExpenses > 0 ? (data.amount / totalExpenses) * 100 : 0
    })).sort((a, b) => b.amount - a.amount);
  };

  const calculateMonthlyTrend = (transactions) => {
    const monthlyData = {};
    
    transactions.forEach(transaction => {
      try {
        const date = parseISO(transaction.date);
        const monthKey = format(date, 'yyyy-MM');
        
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = {
            income: 0,
            expenses: 0,
            transactions: 0
          };
        }
        
        if (transaction.type === 'income') {
          monthlyData[monthKey].income += transaction.amount || 0;
        } else {
          monthlyData[monthKey].expenses += transaction.amount || 0;
        }
        monthlyData[monthKey].transactions += 1;
      } catch (error) {
        console.warn('Error processing transaction date:', error);
      }
    });

    return Object.entries(monthlyData).map(([month, data]) => ({
      month,
      ...data,
      net: data.income - data.expenses
    })).sort((a, b) => a.month.localeCompare(b.month));
  };

  const analyzeBudgetPerformance = (budget, expenses) => {
    if (!budget?.budget) return null;

    const totalBudget = budget.budget.total_budget || 0;
    const totalSpent = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    const daysInPeriod = Math.max(1, (new Date(dateRange.endDate) - new Date(dateRange.startDate)) / (1000 * 60 * 60 * 24));
    const utilization = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

    return {
      totalBudget,
      totalSpent,
      remaining: totalBudget - totalSpent,
      utilization,
      isOverBudget: totalSpent > totalBudget,
      dailyAverage: totalSpent / daysInPeriod
    };
  };

  const generateMockReportData = () => {
    const mockTransactions = Array.from({ length: 30 }, (_, i) => ({
      id: `mock-${i}`,
      amount: Math.random() * 100 + 10,
      type: Math.random() > 0.3 ? 'expense' : 'income',
      description: `Transaction ${i + 1}`,
      date: format(subDays(new Date(), i), 'yyyy-MM-dd'),
      Category: {
        name: ['Food & Dining', 'Transportation', 'Entertainment', 'Shopping'][Math.floor(Math.random() * 4)],
        color: ['#EF4444', '#3B82F6', '#8B5CF6', '#10B981'][Math.floor(Math.random() * 4)]
      }
    }));

    return processReportData(
      { data: { overview: { currentBalance: 1500, savingsProgress: { target: 500, current: 300, progress: 60, remaining: 200, is_on_track: true } } } },
      { data: { transactions: mockTransactions } },
      { data: { categories: { categories: [] } } },
      { data: { budget: { total_budget: 2000 } } }
    );
  };

  const handleGenerateReport = async () => {
    await fetchReportData();
  };

  const handleExport = () => {
    if (!reportData) {
      toast.error('Please generate a report first');
      return;
    }

    try {
      switch (exportFormat) {
        case 'PDF':
          exportToPDF();
          break;
        case 'Excel':
          exportToExcel();
          break;
        case 'CSV':
          exportToCSV();
          break;
      }
      toast.success(`Report exported as ${exportFormat}`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error(`Failed to export as ${exportFormat}`);
    }
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    
    doc.setFontSize(20);
    doc.text('Financial Report', pageWidth / 2, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.text(`Period: ${reportData.dateRange.start} to ${reportData.dateRange.end}`, pageWidth / 2, 30, { align: 'center' });
    doc.text(`Generated: ${format(new Date(), 'MMM d, yyyy h:mm a')}`, pageWidth / 2, 37, { align: 'center' });
    
    doc.autoTable({
      startY: 45,
      head: [['Metric', 'Amount']],
      body: [
        ['Total Income', formatAmount(reportData.summary.totalIncome)],
        ['Total Expenses', formatAmount(reportData.summary.totalExpenses)],
        ['Net Balance', formatAmount(reportData.summary.netBalance)],
        ['Transaction Count', reportData.summary.transactionCount.toString()],
      ],
    });

    let finalY = doc.lastAutoTable.finalY + 10;

    if (includeOptions.categories && reportData.categoryBreakdown.length > 0) {
      doc.setFontSize(16);
      doc.text('Category Breakdown', 14, finalY);
      finalY += 8;
      
      const categoryData = reportData.categoryBreakdown.map(cat => [
        cat.name,
        formatAmount(cat.amount),
        `${cat.percentage.toFixed(1)}%`,
        cat.count.toString()
      ]);
      
      doc.autoTable({
        startY: finalY,
        head: [['Category', 'Amount', 'Percentage', 'Transactions']],
        body: categoryData,
      });
      finalY = doc.lastAutoTable.finalY + 10;
    }

    if (includeOptions.budgets && reportData.budgetAnalysis) {
      doc.setFontSize(16);
      doc.text('Budget Analysis', 14, finalY);
      finalY += 8;
      
      doc.autoTable({
        startY: finalY,
        head: [['Metric', 'Value']],
        body: [
          ['Total Budget', formatAmount(reportData.budgetAnalysis.totalBudget)],
          ['Total Spent', formatAmount(reportData.budgetAnalysis.totalSpent)],
          ['Remaining', formatAmount(reportData.budgetAnalysis.remaining)],
          ['Utilization', `${reportData.budgetAnalysis.utilization.toFixed(1)}%`],
          ['Daily Average', formatAmount(reportData.budgetAnalysis.dailyAverage)],
        ],
      });
    }

    doc.save(`financial-report-${format(new Date(), 'yyyy-MM-dd-HHmm')}.pdf`);
  };

  const exportToExcel = () => {
    const workbook = XLSX.utils.book_new();
    
    const summaryData = [
      ['Financial Report Summary'],
      [`Period: ${reportData.dateRange.start} to ${reportData.dateRange.end}`],
      [`Generated: ${format(new Date(), 'MMM d, yyyy h:mm a')}`],
      [''],
      ['Metric', 'Value'],
      ['Total Income', reportData.summary.totalIncome],
      ['Total Expenses', reportData.summary.totalExpenses],
      ['Net Balance', reportData.summary.netBalance],
      ['Transaction Count', reportData.summary.transactionCount],
    ];
    
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

    if (includeOptions.transactions && reportData.transactions.length > 0) {
      const transactionsData = reportData.transactions.map(t => ({
        'Date': format(parseISO(t.date), 'yyyy-MM-dd'),
        'Type': t.type.charAt(0).toUpperCase() + t.type.slice(1),
        'Amount': t.amount,
        'Description': t.description || '',
        'Category': t.Category?.name || 'Uncategorized'
      }));
      
      const transactionsSheet = XLSX.utils.json_to_sheet(transactionsData);
      XLSX.utils.book_append_sheet(workbook, transactionsSheet, 'Transactions');
    }

    if (includeOptions.categories && reportData.categoryBreakdown.length > 0) {
      const categoriesData = reportData.categoryBreakdown.map(c => ({
        'Category': c.name,
        'Amount': c.amount,
        'Percentage': c.percentage,
        'Transaction Count': c.count
      }));
      
      const categoriesSheet = XLSX.utils.json_to_sheet(categoriesData);
      XLSX.utils.book_append_sheet(workbook, categoriesSheet, 'Categories');
    }

    XLSX.writeFile(workbook, `financial-report-${format(new Date(), 'yyyy-MM-dd-HHmm')}.xlsx`);
  };

  const exportToCSV = () => {
    const summaryCSV = Papa.unparse({
      fields: ['Metric', 'Value'],
      data: [
        ['Report Period', `${reportData.dateRange.start} to ${reportData.dateRange.end}`],
        ['Generated', format(new Date(), 'MMM d, yyyy h:mm a')],
        ['Total Income', reportData.summary.totalIncome],
        ['Total Expenses', reportData.summary.totalExpenses],
        ['Net Balance', reportData.summary.netBalance],
        ['Transaction Count', reportData.summary.transactionCount],
      ]
    });

    const blob = new Blob([summaryCSV], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `financial-report-summary-${format(new Date(), 'yyyy-MM-dd-HHmm')}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    if (!reportData) {
      toast.error('No report to print');
      return;
    }
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Please allow pop-ups to print');
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Financial Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
            .print-header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
            .print-header h1 { color: #1F2937; margin-bottom: 10px; font-size: 24px; }
            .print-header .date { color: #6B7280; font-size: 14px; }
            .section { margin-bottom: 30px; page-break-inside: avoid; }
            .section h2 { color: #374151; border-bottom: 1px solid #E5E7EB; padding-bottom: 8px; font-size: 18px; }
            table { width: 100%; border-collapse: collapse; margin: 15px 0; }
            th { background-color: #F9FAFB; text-align: left; padding: 10px; border: 1px solid #E5E7EB; font-weight: bold; }
            td { padding: 10px; border: 1px solid #E5E7EB; }
            .summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin: 20px 0; }
            .summary-card { padding: 15px; border-radius: 8px; border: 1px solid #E5E7EB; }
            .income { border-left: 4px solid #10B981; }
            .expense { border-left: 4px solid #EF4444; }
            .balance { border-left: 4px solid #3B82F6; }
            .transactions { border-left: 4px solid #8B5CF6; }
            .category-item { margin-bottom: 15px; }
            .category-bar { height: 8px; border-radius: 4px; margin: 8px 0; }
            .category-details { display: flex; justify-content: space-between; }
            @media print {
              .no-print { display: none; }
              body { margin: 0.5in; }
            }
          </style>
        </head>
        <body>
          <div class="print-header">
            <h1>Financial Report</h1>
            <div class="date">${reportData.dateRange.start} to ${reportData.dateRange.end}</div>
            <div class="date">Generated: ${format(new Date(), 'MMM d, yyyy h:mm a')}</div>
          </div>
          
          <!-- Summary Section -->
          <div class="section">
            <h2>Financial Summary</h2>
            <div class="summary-grid">
              <div class="summary-card income">
                <div style="font-size: 14px; color: #047857;">Total Income</div>
                <div style="font-size: 24px; font-weight: bold; margin-top: 8px;">${formatAmount(reportData.summary.totalIncome)}</div>
              </div>
              <div class="summary-card expense">
                <div style="font-size: 14px; color: #B91C1C;">Total Expenses</div>
                <div style="font-size: 24px; font-weight: bold; margin-top: 8px;">${formatAmount(reportData.summary.totalExpenses)}</div>
              </div>
              <div class="summary-card balance">
                <div style="font-size: 14px; color: #1E40AF;">Net Balance</div>
                <div style="font-size: 24px; font-weight: bold; margin-top: 8px;">${formatAmount(reportData.summary.netBalance)}</div>
              </div>
              <div class="summary-card transactions">
                <div style="font-size: 14px; color: #6D28D9;">Transactions</div>
                <div style="font-size: 24px; font-weight: bold; margin-top: 8px;">${reportData.summary.transactionCount}</div>
              </div>
            </div>
          </div>

          ${includeOptions.categories && reportData.categoryBreakdown.length > 0 ? `
            <div class="section">
              <h2>Category Breakdown</h2>
              ${reportData.categoryBreakdown.map(cat => `
                <div class="category-item">
                  <div class="category-details">
                    <span style="font-weight: 500;">${cat.name}</span>
                    <span>${formatAmount(cat.amount)} (${cat.percentage.toFixed(1)}%)</span>
                  </div>
                  <div style="display: flex; align-items: center;">
                    <div class="category-bar" style="width: ${Math.min(cat.percentage * 2, 100)}%; background-color: ${cat.color};"></div>
                    <span style="font-size: 12px; color: #6B7280; margin-left: 10px;">${cat.count} transactions</span>
                  </div>
                </div>
              `).join('')}
            </div>
          ` : ''}

          ${includeOptions.budgets && reportData.budgetAnalysis ? `
            <div class="section">
              <h2>Budget Analysis</h2>
              <table>
                <tr><th>Metric</th><th>Value</th></tr>
                <tr><td>Total Budget</td><td>${formatAmount(reportData.budgetAnalysis.totalBudget)}</td></tr>
                <tr><td>Total Spent</td><td>${formatAmount(reportData.budgetAnalysis.totalSpent)}</td></tr>
                <tr><td>Remaining</td><td style="color: ${reportData.budgetAnalysis.remaining >= 0 ? '#10B981' : '#EF4444'}">${formatAmount(reportData.budgetAnalysis.remaining)}</td></tr>
                <tr><td>Utilization</td><td>${reportData.budgetAnalysis.utilization.toFixed(1)}%</td></tr>
                <tr><td>Daily Average</td><td>${formatAmount(reportData.budgetAnalysis.dailyAverage)}</td></tr>
                <tr><td>Status</td><td style="color: ${reportData.budgetAnalysis.isOverBudget ? '#EF4444' : '#10B981'}">${reportData.budgetAnalysis.isOverBudget ? 'Over Budget' : 'Within Budget'}</td></tr>
              </table>
            </div>
          ` : ''}

          ${includeOptions.transactions && reportData.transactions.length > 0 ? `
            <div class="section">
              <h2>Recent Transactions</h2>
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Category</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  ${reportData.transactions.slice(0, 10).map(t => `
                    <tr>
                      <td>${format(parseISO(t.date), 'MMM d, yyyy')}</td>
                      <td>${t.description || ''}</td>
                      <td>
                        <div style="display: flex; align-items: center;">
                          <div style="width: 12px; height: 12px; border-radius: 50%; background-color: ${t.Category?.color || '#999'}; margin-right: 8px;"></div>
                          ${t.Category?.name || 'Uncategorized'}
                        </div>
                      </td>
                      <td style="color: ${t.type === 'income' ? '#10B981' : '#EF4444'}">
                        ${t.type === 'income' ? '+' : '-'}${formatAmount(t.amount)}
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
              ${reportData.transactions.length > 10 ? `<p style="text-align: center; color: #6B7280; margin-top: 10px;">Showing 10 of ${reportData.transactions.length} transactions</p>` : ''}
            </div>
          ` : ''}

          ${includeOptions.savings && reportData.savingsProgress ? `
            <div class="section">
              <h2>Savings Progress</h2>
              <div style="background-color: #E5E7EB; border-radius: 9999px; height: 16px; overflow: hidden;">
                <div style="background-color: #10B981; height: 100%; width: ${Math.min(reportData.savingsProgress.progress, 100)}%;"></div>
              </div>
              <div style="display: flex; justify-content: space-between; margin-top: 10px;">
                <div><span style="color: #6B7280;">Current:</span> <span style="font-weight: 500;">${formatAmount(reportData.savingsProgress.current)}</span></div>
                <div><span style="color: #6B7280;">Target:</span> <span style="font-weight: 500;">${formatAmount(reportData.savingsProgress.target)}</span></div>
                <div><span style="color: #6B7280;">Remaining:</span> <span style="font-weight: 500;">${formatAmount(reportData.savingsProgress.remaining)}</span></div>
              </div>
              <p style="text-align: center; margin-top: 10px; color: ${reportData.savingsProgress.isOnTrack ? '#10B981' : '#F59E0B'};">
                ${reportData.savingsProgress.isOnTrack ? '🎯 On track to reach goal' : '⚠️ Needs adjustment'}
              </p>
            </div>
          ` : ''}
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.onafterprint = () => printWindow.close();
  };

  const quickRanges = [
    { label: 'Last Month', start: subMonths(new Date(), 1), end: new Date() },
    { label: 'Last 3 Months', start: subMonths(new Date(), 3), end: new Date() },
    { label: 'Year to Date', start: startOfYear(new Date()), end: new Date() },
    { label: 'Last 7 Days', start: subDays(new Date(), 7), end: new Date() },
  ];

  const handleQuickRange = (start, end) => {
    setDateRange({
      startDate: format(start, 'yyyy-MM-dd'),
      endDate: format(end, 'yyyy-MM-dd'),
    });
    setTimeout(() => handleGenerateReport(), 300);
  };

  const toggleIncludeOption = (option) => {
    setIncludeOptions(prev => ({
      ...prev,
      [option]: !prev[option]
    }));
  };

  const reportTemplates = [
    {
      id: 1,
      title: 'Monthly Financial Report',
      description: 'Detailed income, expenses, and savings analysis',
      type: 'monthly',
      icon: FiFileText,
      includes: ['income', 'expenses', 'categories', 'transactions', 'savings']
    },
    {
      id: 2,
      title: 'Category Spending Analysis',
      description: 'Breakdown of spending by category',
      type: 'category',
      icon: FiPieChart,
      includes: ['categories', 'transactions']
    },
    {
      id: 3,
      title: 'Budget Performance Report',
      description: 'Budget vs actual spending comparison',
      type: 'budget',
      icon: FiBarChart,
      includes: ['budgets', 'expenses', 'categories']
    },
    {
      id: 4,
      title: 'Income & Expense Statement',
      description: 'Comprehensive income and expense report',
      type: 'income',
      icon: FiTrendingUp,
      includes: ['income', 'expenses', 'transactions']
    },
    {
      id: 5,
      title: 'Savings Progress Report',
      description: 'Savings target tracking and analysis',
      type: 'savings',
      icon: FiDollarSign,
      includes: ['savings', 'income', 'expenses']
    },
    {
      id: 6,
      title: 'Custom Report',
      description: 'Build your own report with selected sections',
      type: 'custom',
      icon: FiFilter,
      includes: Object.keys(includeOptions)
    },
  ];

  const handleTemplateClick = (template) => {
    setReportType(template.type);
    
    if (template.type === 'custom') {
      document.getElementById('report-generator')?.scrollIntoView({ behavior: 'smooth' });
      toast.info('Customize your report settings below');
    } else {
      const newIncludes = {};
      Object.keys(includeOptions).forEach(key => {
        newIncludes[key] = template.includes.includes(key);
      });
      setIncludeOptions(newIncludes);
      
      setTimeout(() => {
        if (reportData) {
          document.getElementById('report-preview')?.scrollIntoView({ behavior: 'smooth' });
        }
      }, 500);
    }
  };

  if (isLoading && !reportData) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Financial Reports</h1>
          <p className="text-gray-600 mt-1">Generate and download financial reports</p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          {reportData && (
            <>
              <button 
                onClick={handlePrint}
                className="btn-secondary inline-flex items-center"
              >
                <FiPrinter className="mr-2 h-4 w-4" />
                Print
              </button>
              <button 
                onClick={handleExport}
                className="btn-primary inline-flex items-center"
              >
                <FiDownload className="mr-2 h-4 w-4" />
                Export {exportFormat}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Report Templates */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reportTemplates.map((template) => {
          const Icon = template.icon;
          const isSelected = reportType === template.type;
          
          return (
            <div 
              key={template.id} 
              className={`card hover:shadow-lg transition-shadow cursor-pointer ${isSelected ? 'ring-2 ring-primary-500 ring-offset-2' : ''}`}
              onClick={() => handleTemplateClick(template)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div className={`h-10 w-10 rounded-lg ${isSelected ? 'bg-primary-500' : 'bg-primary-100'} flex items-center justify-center mr-4`}>
                    <Icon className={`h-5 w-5 ${isSelected ? 'text-white' : 'text-primary-600'}`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{template.title}</h3>
                    <p className="text-sm text-gray-500">{template.description}</p>
                  </div>
                </div>
                <span className={`badge ${isSelected ? 'badge-primary' : 'badge-info'} capitalize`}>
                  {template.type}
                </span>
              </div>
              
              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                {isSelected && (
                  <span className="inline-flex items-center text-primary-600 font-medium">
                    <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Selected
                  </span>
                )}
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTemplateClick(template);
                  }}
                  className={`flex-1 btn ${isSelected ? 'btn-primary' : 'btn-outline-primary'} inline-flex items-center justify-center`}
                >
                  {template.type === 'custom' ? 'Customize' : 'Generate'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Report Generator */}
      <div id="report-generator" className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          {reportType === 'custom' ? 'Customize Your Report' : `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report Settings`}
        </h3>

        {/* Report Type */}
        <div className="mb-6">
          <label className="label mb-3">Report Type</label>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {reportTemplates.map((template) => {
              const Icon = template.icon;
              return (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => handleTemplateClick(template)}
                  className={`py-3 rounded-lg border-2 flex flex-col items-center justify-center transition-all duration-200 ${
                    reportType === template.type
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-300 text-gray-700 hover:border-primary-300 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="h-5 w-5 mb-1" />
                  <span className="text-sm font-medium">
                    {template.type.charAt(0).toUpperCase() + template.type.slice(1)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Date Range */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div>
            <label className="label">
              <div className="flex items-center">
                <FiCalendar className="h-4 w-4 mr-2 text-gray-400" />
                Start Date
              </div>
            </label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
              className="input-field"
              max={dateRange.endDate}
            />
          </div>

          <div>
            <label className="label">
              <div className="flex items-center">
                <FiCalendar className="h-4 w-4 mr-2 text-gray-400" />
                End Date
              </div>
            </label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
              className="input-field"
              min={dateRange.startDate}
              max={format(new Date(), 'yyyy-MM-dd')}
            />
          </div>

          <div>
            <label className="label">Quick Range</label>
            <div className="space-y-2">
              {quickRanges.map((range, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleQuickRange(range.start, range.end)}
                  className="w-full btn-secondary text-sm py-2"
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Report Options - Only show for custom report */}
        {reportType === 'custom' && (
          <div className="mb-6">
            <label className="label mb-3">Include in Report</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(includeOptions).map(([key, value]) => {
                const labels = {
                  income: 'Income Details',
                  expenses: 'Expense Details',
                  categories: 'Category Breakdown',
                  budgets: 'Budget Comparison',
                  charts: 'Charts & Graphs',
                  transactions: 'Transaction List',
                  savings: 'Savings Analysis',
                  forecast: 'Future Forecast',
                };
                
                return (
                  <div key={key} className="flex items-center">
                    <input
                      type="checkbox"
                      id={key}
                      checked={value}
                      onChange={() => toggleIncludeOption(key)}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded cursor-pointer"
                    />
                    <label htmlFor={key} className="ml-2 text-sm text-gray-700 cursor-pointer">
                      {labels[key]}
                    </label>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Format Options */}
        <div className="mb-8">
          <label className="label mb-3">Export Format</label>
          <div className="flex space-x-4">
            {['PDF', 'Excel', 'CSV'].map((format) => (
              <div key={format} className="flex items-center">
                <input
                  type="radio"
                  id={format}
                  name="format"
                  checked={exportFormat === format}
                  onChange={() => setExportFormat(format)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                />
                <label htmlFor={format} className="ml-2 text-sm text-gray-700 cursor-pointer">
                  {format}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Generate Button */}
        <div className="flex justify-end space-x-3">
          <button
            onClick={() => {
              setReportData(null);
              setError(null);
              toast.success('Report cleared');
            }}
            disabled={!reportData}
            className="btn-secondary inline-flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Clear Report
          </button>
          <button
            onClick={handleGenerateReport}
            disabled={generating}
            className="btn-primary inline-flex items-center"
          >
            <FiFilter className="mr-2 h-4 w-4" />
            {generating ? 'Generating Report...' : 'Generate Report'}
          </button>
        </div>
      </div>

      {/* Generated Report Preview */}
      {reportData && (
        <div id="report-preview" className="card">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Generated Report</h3>
            <div className="text-sm text-gray-500">
              {reportData.dateRange.start} to {reportData.dateRange.end}
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg">
              <div className="text-sm text-green-700 font-medium">Total Income</div>
              <div className="text-2xl font-bold text-gray-900 mt-1">
                {formatAmount(reportData.summary.totalIncome)}
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-lg">
              <div className="text-sm text-red-700 font-medium">Total Expenses</div>
              <div className="text-2xl font-bold text-gray-900 mt-1">
                {formatAmount(reportData.summary.totalExpenses)}
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
              <div className="text-sm text-blue-700 font-medium">Net Balance</div>
              <div className="text-2xl font-bold text-gray-900 mt-1">
                {formatAmount(reportData.summary.netBalance)}
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg">
              <div className="text-sm text-purple-700 font-medium">Transactions</div>
              <div className="text-2xl font-bold text-gray-900 mt-1">
                {reportData.summary.transactionCount}
              </div>
            </div>
          </div>

          {/* Category Breakdown */}
          {includeOptions.categories && reportData.categoryBreakdown.length > 0 && (
            <div className="mb-8">
              <h4 className="text-md font-semibold text-gray-900 mb-4">Category Breakdown</h4>
              <div className="space-y-3">
                {reportData.categoryBreakdown.map((category, index) => (
                  <div key={index} className="flex items-center">
                    <div 
                      className="h-3 rounded-full mr-4" 
                      style={{ 
                        width: `${Math.min(category.percentage * 2, 100)}%`,
                        backgroundColor: category.color 
                      }}
                    />
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-700">{category.name}</span>
                        <span className="text-sm text-gray-900">{formatAmount(category.amount)}</span>
                      </div>
                      <div className="text-xs text-gray-500">
                        {category.percentage.toFixed(1)}% • {category.count} transactions
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Budget Analysis */}
          {includeOptions.budgets && reportData.budgetAnalysis && (
            <div className="mb-8">
              <h4 className="text-md font-semibold text-gray-900 mb-4">Budget Analysis</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Budget</span>
                    <span className="text-sm font-medium text-gray-900">
                      {formatAmount(reportData.budgetAnalysis.totalBudget)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Spent</span>
                    <span className="text-sm font-medium text-gray-900">
                      {formatAmount(reportData.budgetAnalysis.totalSpent)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Remaining</span>
                    <span className={`text-sm font-medium ${
                      reportData.budgetAnalysis.remaining >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatAmount(reportData.budgetAnalysis.remaining)}
                    </span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Budget Utilization</span>
                    <span className={`text-sm font-medium ${
                      reportData.budgetAnalysis.utilization > 100 ? 'text-red-600' : 
                      reportData.budgetAnalysis.utilization > 80 ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                      {reportData.budgetAnalysis.utilization.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Daily Average</span>
                    <span className="text-sm font-medium text-gray-900">
                      {formatAmount(reportData.budgetAnalysis.dailyAverage)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Status</span>
                    <span className={`text-sm font-medium ${
                      reportData.budgetAnalysis.isOverBudget ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {reportData.budgetAnalysis.isOverBudget ? 'Over Budget' : 'Within Budget'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Recent Transactions Preview */}
          {includeOptions.transactions && reportData.transactions.length > 0 && (
            <div className="mb-8">
              <h4 className="text-md font-semibold text-gray-900 mb-4">Recent Transactions</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {reportData.transactions.slice(0, 10).map((transaction, index) => (
                      <tr key={index}>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          {format(parseISO(transaction.date), 'MMM d, yyyy')}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {transaction.description || ''}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="inline-flex items-center">
                            <div 
                              className="h-3 w-3 rounded-full mr-2" 
                              style={{ backgroundColor: transaction.Category?.color || '#999' }}
                            />
                            <span className="text-sm text-gray-700">
                              {transaction.Category?.name || 'Uncategorized'}
                            </span>
                          </span>
                        </td>
                        <td className={`px-4 py-3 whitespace-nowrap text-sm font-medium ${
                          transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.type === 'income' ? '+' : '-'}{formatAmount(transaction.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {reportData.transactions.length > 10 && (
                <div className="text-center mt-4 text-sm text-gray-500">
                  Showing 10 of {reportData.transactions.length} transactions
                </div>
              )}
            </div>
          )}

          {/* Savings Progress */}
          {includeOptions.savings && reportData.savingsProgress && (
            <div className="mb-8">
              <h4 className="text-md font-semibold text-gray-900 mb-4">Savings Progress</h4>
              <div className="bg-gray-100 rounded-full h-4 overflow-hidden">
                <div 
                  className="bg-green-500 h-full transition-all duration-500"
                  style={{ width: `${Math.min(reportData.savingsProgress.progress, 100)}%` }}
                />
              </div>
              <div className="flex justify-between mt-2 text-sm">
                <div>
                  <span className="text-gray-600">Current:</span>
                  <span className="font-medium text-gray-900 ml-2">
                    {formatAmount(reportData.savingsProgress.current)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Target:</span>
                  <span className="font-medium text-gray-900 ml-2">
                    {formatAmount(reportData.savingsProgress.target)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Remaining:</span>
                  <span className="font-medium text-gray-900 ml-2">
                    {formatAmount(reportData.savingsProgress.remaining)}
                  </span>
                </div>
              </div>
              <div className="text-center mt-2 text-sm text-gray-500">
                {reportData.savingsProgress.is_on_track ? '🎯 On track to reach goal' : '⚠️ Needs adjustment'}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Reports;