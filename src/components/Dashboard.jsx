import React from 'react';

export default function Dashboard({ summary }) {
  const {
    totalPortfolioValue = 0,
    totalDebtValue = 0,
    projectedIncome = 0,
    projectedOutcome = 0,
    projectedMargin = 0,
    actualIncome = 0,
    actualOutcome = 0,
    actualMargin = 0,
  } = summary;

  // Calculate Cash Flow Runway / Coverage
  // Expected incoming interest vs upcoming outgoing interest
  const coveragePercent = projectedOutcome > 0 
    ? Math.min(Math.round((projectedIncome / projectedOutcome) * 100), 300) 
    : projectedIncome > 0 ? 100 : 0;

  const isHealthy = projectedIncome >= projectedOutcome;

  // Format currency
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(val);
  };

  return (
    <div className="dashboard-view fade-in">
      <div className="dashboard-grid">
        
        {/* Total Portfolio Value (Active Loans) */}
        <div className="stat-card" style={{ '--card-accent': 'var(--color-success)' }}>
          <div className="stat-label">Total Portfolio Value</div>
          <div className="stat-value">{formatCurrency(totalPortfolioValue)}</div>
          <div className="stat-sub">
            Total active loans currently out on interest
          </div>
        </div>

        {/* Total Debt Value (Active Borrowings) */}
        <div className="stat-card" style={{ '--card-accent': 'var(--color-danger)' }}>
          <div className="stat-label">Total Debt Value</div>
          <div className="stat-value">{formatCurrency(totalDebtValue)}</div>
          <div className="stat-sub">
            Total liabilities borrowed from lenders
          </div>
        </div>

        {/* Net Margin (Actual Cash Flow Profit) */}
        <div className="stat-card" style={{ '--card-accent': 'var(--color-primary)' }}>
          <div className="stat-label">Actual Profit (Net Margin)</div>
          <div className="stat-value" style={{ color: actualMargin >= 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>
            {actualMargin >= 0 ? '+' : ''}{formatCurrency(actualMargin)}
          </div>
          <div className="stat-sub">
            Based on logged receipts: <span className="trend-up">{formatCurrency(actualIncome)}</span> in / <span className="trend-down">{formatCurrency(actualOutcome)}</span> out
          </div>
        </div>

        {/* Runway Card */}
        <div className="stat-card runway-card" style={{ '--card-accent': isHealthy ? 'var(--color-success)' : 'var(--color-warning)' }}>
          <div className="runway-body">
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="stat-label">Projected Cash Flow Runway</div>
                <span className={`runway-badge ${isHealthy ? 'healthy' : 'critical'}`}>
                  {isHealthy ? 'Healthy Coverage' : 'Deficit Risk'}
                </span>
              </div>
              <div className="stat-value" style={{ fontSize: '1.75rem', marginTop: '0.25rem' }}>
                {projectedOutcome > 0 
                  ? `${Math.round((projectedIncome / projectedOutcome) * 100)}% Coverage`
                  : projectedIncome > 0 ? 'Infinite Coverage' : 'No Active Schedules'
                }
              </div>
            </div>

            <div className="runway-bar-container">
              <div 
                className="runway-bar" 
                style={{ 
                  width: `${Math.max(5, Math.min(coveragePercent, 100))}%`,
                  background: isHealthy 
                    ? 'linear-gradient(90deg, #6366f1 0%, #10b981 100%)' 
                    : 'linear-gradient(90deg, #f43f5e 0%, #f59e0b 100%)'
                }}
              />
            </div>

            <div className="runway-text-row">
              <span>Expected In: <strong>{formatCurrency(projectedIncome)}</strong></span>
              <span>Expected Out: <strong>{formatCurrency(projectedOutcome)}</strong></span>
              <span>Net Monthly Surplus: <strong style={{ color: projectedMargin >= 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>
                {projectedMargin >= 0 ? '+' : ''}{formatCurrency(projectedMargin)}
              </strong></span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
