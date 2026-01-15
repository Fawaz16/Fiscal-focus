import { useState } from 'react';
import { FiDownload, FiPrinter, FiCalendar, FiFilter, FiFileText, FiPieChart } from 'react-icons/fi';
import { format, subMonths, startOfYear, endOfYear } from 'date-fns';

const Reports = () => {
  const [dateRange, setDateRange] = useState({
    startDate: format(startOfYear(new Date()), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd'),
  });
  const [reportType, setReportType] = useState('monthly');
  const [generating, setGenerating] = useState(false);

  const reportTemplates = [
    {
      id: 1,
      title: 'Monthly Financial Report',
      description: 'Detailed income, expenses, and savings analysis',
      type: 'monthly',
      icon: FiFileText,
      lastGenerated: '2024-01-15',
    },
    {
      id: 2,
      title: 'Category Spending Analysis',
      description: 'Breakdown of spending by category',
      type: 'category',
      icon: FiPieChart,
      lastGenerated: '2024-01-14',
    },
    {
      id: 3,
      title: 'Budget Performance Report',
      description: 'Budget vs actual spending comparison',
      type: 'budget',
      icon: FiPieChart,
      lastGenerated: '2024-01-10',
    },
    {
      id: 4,
      title: 'Year-to-Date Summary',
      description: 'Annual financial overview',
      type: 'yearly',
      icon: FiCalendar,
      lastGenerated: '2024-01-01',
    },
  ];

  const quickRanges = [
    { label: 'Last Month', start: subMonths(new Date(), 1), end: new Date() },
    { label: 'Last 3 Months', start: subMonths(new Date(), 3), end: new Date() },
    { label: 'Year to Date', start: startOfYear(new Date()), end: new Date() },
  ];

  const handleQuickRange = (start, end) => {
    setDateRange({
      startDate: format(start, 'yyyy-MM-dd'),
      endDate: format(end, 'yyyy-MM-dd'),
    });
  };

  const handleGenerateReport = () => {
    setGenerating(true);
    // Simulate report generation
    setTimeout(() => {
      setGenerating(false);
      alert('Report generated successfully!');
    }, 2000);
  };

  const handleDownload = (type) => {
    alert(`Downloading ${type} report...`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Financial Reports</h1>
          <p className="text-gray-600 mt-1">Generate and download financial reports</p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button className="btn-secondary inline-flex items-center">
            <FiPrinter className="mr-2 h-4 w-4" />
            Print
          </button>
        </div>
      </div>

      {/* Report Templates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reportTemplates.map((template) => {
          const Icon = template.icon;
          return (
            <div key={template.id} className="card hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-lg bg-primary-100 flex items-center justify-center mr-4">
                    <Icon className="h-5 w-5 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{template.title}</h3>
                    <p className="text-sm text-gray-500">{template.description}</p>
                  </div>
                </div>
                <span className="badge badge-info capitalize">{template.type}</span>
              </div>
              
              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <span>Last generated: {template.lastGenerated}</span>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => handleDownload(template.type)}
                  className="flex-1 btn-secondary inline-flex items-center justify-center"
                >
                  <FiDownload className="mr-2 h-4 w-4" />
                  Download
                </button>
                <button
                  onClick={() => setReportType(template.type)}
                  className="flex-1 btn-primary inline-flex items-center justify-center"
                >
                  Generate
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Report Generator */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Generate Custom Report</h3>

        {/* Report Type */}
        <div className="mb-6">
          <label className="label mb-3">Report Type</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {['monthly', 'category', 'budget', 'custom'].map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setReportType(type)}
                className={`py-3 rounded-lg border ${
                  reportType === type
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
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

        {/* Report Options */}
        {reportType === 'custom' && (
          <div className="mb-6">
            <label className="label mb-3">Include in Report</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { id: 'income', label: 'Income Details' },
                { id: 'expenses', label: 'Expense Details' },
                { id: 'categories', label: 'Category Breakdown' },
                { id: 'budgets', label: 'Budget Comparison' },
                { id: 'charts', label: 'Charts & Graphs' },
                { id: 'transactions', label: 'Transaction List' },
                { id: 'savings', label: 'Savings Analysis' },
                { id: 'forecast', label: 'Future Forecast' },
              ].map((option) => (
                <div key={option.id} className="flex items-center">
                  <input
                    type="checkbox"
                    id={option.id}
                    defaultChecked
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor={option.id} className="ml-2 text-sm text-gray-700">
                    {option.label}
                  </label>
                </div>
              ))}
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
                  defaultChecked={format === 'PDF'}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                />
                <label htmlFor={format} className="ml-2 text-sm text-gray-700">
                  {format}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Generate Button */}
        <div className="flex justify-end">
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

      {/* Recent Reports */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recently Generated Reports</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Report Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date Range
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Generated
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Size
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {[
                {
                  name: 'January 2024 Financial Report',
                  range: 'Jan 1 - Jan 31, 2024',
                  generated: '2024-02-01',
                  size: '2.4 MB',
                  format: 'PDF',
                },
                {
                  name: 'Q4 2023 Spending Analysis',
                  range: 'Oct 1 - Dec 31, 2023',
                  generated: '2024-01-15',
                  size: '1.8 MB',
                  format: 'Excel',
                },
                {
                  name: 'Annual Summary 2023',
                  range: 'Jan 1 - Dec 31, 2023',
                  generated: '2024-01-05',
                  size: '3.2 MB',
                  format: 'PDF',
                },
              ].map((report, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{report.name}</div>
                    <div className="text-sm text-gray-500">{report.format} Format</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {report.range}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {report.generated}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {report.size}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleDownload(report.format)}
                      className="text-primary-600 hover:text-primary-900 mr-4"
                    >
                      <FiDownload className="h-4 w-4 inline mr-1" />
                      Download
                    </button>
                    <button className="text-gray-600 hover:text-gray-900">
                      <FiPrinter className="h-4 w-4 inline mr-1" />
                      Print
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;