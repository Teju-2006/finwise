import React from 'react';
import BudgetBuilder from './BudgetBuilder'; // Reusing the BudgetBuilder for monthly analysis

const MonthlyAnalysis: React.FC = () => {
  return (
    <div className="h-full">
      {/* MonthlyAnalysis title is already handled in BudgetBuilder, just render it */}
      <BudgetBuilder />
    </div>
  );
};

export default MonthlyAnalysis;