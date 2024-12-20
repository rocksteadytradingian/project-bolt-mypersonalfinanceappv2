import React from 'react';
import { ReportType } from '../../types/reports';

interface ReportFiltersProps {
  reportType: ReportType;
  dateRange: {
    startDate: string;
    endDate: string;
  };
  onReportTypeChange: (type: ReportType) => void;
  onDateRangeChange: (range: { startDate: string; endDate: string }) => void;
}

export function ReportFilters({
  reportType,
  dateRange,
  onReportTypeChange,
  onDateRangeChange,
}: ReportFiltersProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Report Type</label>
        <select
          value={reportType}
          onChange={(e) => onReportTypeChange(e.target.value as ReportType)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="fund-sources">Fund Sources</option>
          <option value="credit-cards">Credit Cards</option>
          <option value="debts">Debts</option>
          <option value="budget">Budget</option>
          <option value="recurring">Recurring Transactions</option>
          <option value="transactions">Transactions</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Start Date</label>
          <input
            type="date"
            value={dateRange.startDate}
            onChange={(e) => onDateRangeChange({ ...dateRange, startDate: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">End Date</label>
          <input
            type="date"
            value={dateRange.endDate}
            onChange={(e) => onDateRangeChange({ ...dateRange, endDate: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  );
}