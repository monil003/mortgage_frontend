import React, { useState, useEffect } from 'react';

export default function MarketTrends({ marketData }) {
  const [estimateType, setEstimateType] = useState('Dollars'); // 'Dollars' or 'Units'
  
  // Available years
  const availableYears = marketData.map(d => d.year);
  const minYear = availableYears.length > 0 ? Math.min(...availableYears) : 1954;
  const maxYear = availableYears.length > 0 ? Math.max(...availableYears) : 1999;
  
  const [startYear, setStartYear] = useState(minYear);
  const [endYear, setEndYear] = useState(maxYear);

  // Set default start and end years when data finishes loading
  useEffect(() => {
    if (availableYears.length > 0) {
      setStartYear(Math.min(...availableYears));
      setEndYear(Math.max(...availableYears));
    }
  }, [marketData]);

  if (!marketData || marketData.length === 0) {
    return (
      <div className="section-card fade-in">
        <div className="empty-state">
          <div className="empty-state-icon">🇨🇦</div>
          <p>No Canada Mortgage historical data available.</p>
          <p style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>Make sure 34100100.csv is in the workspace directory.</p>
        </div>
      </div>
    );
  }

  // Filter data by years
  const filteredData = marketData.filter(d => d.year >= startYear && d.year <= endYear);

  // Calculations for Summary
  let totalVolume = 0;
  let totalNHA = 0;
  let totalConventional = 0;
  let totalCMHC = 0;
  let totalPrivate = 0;
  let peakYear = startYear;
  let peakVal = 0;

  filteredData.forEach(d => {
    const yrData = d[estimateType];
    totalVolume += yrData.total;
    totalNHA += yrData.nha;
    totalConventional += yrData.conventional;
    totalCMHC += yrData.cmhc;
    totalPrivate += yrData.private;

    if (yrData.total > peakVal) {
      peakVal = yrData.total;
      peakYear = d.year;
    }
  });

  const avgAnnualVolume = filteredData.length > 0 ? totalVolume / filteredData.length : 0;
  
  const nhaPercent = totalVolume > 0 ? Math.round((totalNHA / totalVolume) * 100) : 0;
  const convPercent = totalVolume > 0 ? Math.round((totalConventional / totalVolume) * 100) : 0;
  const cmhcPercent = totalVolume > 0 ? Math.round((totalCMHC / totalVolume) * 100) : 0;
  const privatePercent = totalVolume > 0 ? Math.round((totalPrivate / totalVolume) * 100) : 0;

  // Format Helpers
  const formatVal = (val) => {
    if (estimateType === 'Dollars') {
      // Dollars represents millions
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0
      }).format(val * 1000000);
    } else {
      return new Intl.NumberFormat('en-US').format(val) + ' Units';
    }
  };

  return (
    <div className="market-trends-view fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Filters and Controls */}
      <div className="section-card">
        <div className="section-header" style={{ flexWrap: 'wrap', gap: '1rem' }}>
          <h2 className="section-title">
            <span>🇨🇦</span> Canada Mortgage Historical Data (1954 - 1999)
          </h2>
          
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
            {/* Estimate Type Toggle */}
            <div className="nav-tabs" style={{ padding: '0.15rem' }}>
              <button 
                className={`tab-btn ${estimateType === 'Dollars' ? 'active' : ''}`}
                onClick={() => setEstimateType('Dollars')}
                style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
              >
                💵 Dollars (Volume)
              </button>
              <button 
                className={`tab-btn ${estimateType === 'Units' ? 'active' : ''}`}
                onClick={() => setEstimateType('Units')}
                style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
              >
                🏠 Dwelling Units
              </button>
            </div>

            {/* Year Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <select 
                className="month-input" 
                value={startYear} 
                onChange={(e) => setStartYear(parseInt(e.target.value, 10))}
              >
                {availableYears.map(y => (
                  <option key={`start-${y}`} value={y} disabled={y > endYear}>{y}</option>
                ))}
              </select>
              <span style={{ color: 'var(--text-muted)' }}>to</span>
              <select 
                className="month-input" 
                value={endYear} 
                onChange={(e) => setEndYear(parseInt(e.target.value, 10))}
              >
                {availableYears.map(y => (
                  <option key={`end-${y}`} value={y} disabled={y < startYear}>{y}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '-0.75rem', marginBottom: '0.5rem' }}>
          Historical macro trends compiled from Canada Mortgage and Housing Corporation (CMHC) records. Use these metrics to compare industry benchmarks with your current corporate lending operations.
        </p>
      </div>

      {/* Summary KPI Panel */}
      <div className="dashboard-grid">
        <div className="stat-card" style={{ '--card-accent': 'var(--color-primary)' }}>
          <div className="stat-label">Total Cumulative Volume</div>
          <div className="stat-value" style={{ fontSize: '1.65rem' }}>{formatVal(totalVolume)}</div>
          <div className="stat-sub">Across selected {filteredData.length} year period</div>
        </div>

        <div className="stat-card" style={{ '--card-accent': 'var(--color-secondary)' }}>
          <div className="stat-label">Average Annual approvals</div>
          <div className="stat-value" style={{ fontSize: '1.65rem' }}>{formatVal(avgAnnualVolume)}</div>
          <div className="stat-sub">Annual normalized average</div>
        </div>

        <div className="stat-card" style={{ '--card-accent': 'var(--color-warning)' }}>
          <div className="stat-label">Peak Activity Year</div>
          <div className="stat-value" style={{ fontSize: '1.65rem' }}>{peakYear}</div>
          <div className="stat-sub">Record high of {formatVal(peakVal)}</div>
        </div>

        {/* Dynamic Breakdown Cards */}
        <div className="stat-card runway-card" style={{ '--card-accent': 'var(--color-success)' }}>
          <div className="runway-body" style={{ gap: '1rem' }}>
            <div>
              <div className="stat-label">Historical Market Composition</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '0.5rem' }}>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>FUNDING TYPES</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginTop: '0.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                      <span>Conventional</span>
                      <strong style={{ color: 'var(--color-primary)' }}>{convPercent}%</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                      <span>National Housing Act</span>
                      <strong style={{ color: 'var(--color-secondary)' }}>{nhaPercent}%</strong>
                    </div>
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>LENDER DISTRIBUTION</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginTop: '0.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                      <span>Approved Private</span>
                      <strong style={{ color: 'var(--color-success)' }}>{privatePercent}%</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                      <span>CMHC (Government)</span>
                      <strong style={{ color: 'var(--color-warning)' }}>{cmhcPercent}%</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Yearly Details Table */}
      <div className="section-card">
        <h3 className="section-title" style={{ marginBottom: '1.25rem' }}>
          📊 Historical Table View
        </h3>
        
        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Year</th>
                <th>Total Approvals</th>
                <th>Conventional</th>
                <th>National Housing Act (NHA)</th>
                <th>Approved Private Lenders</th>
                <th>CMHC Approvals</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((d) => {
                const yrData = d[estimateType];
                return (
                  <tr key={d.year}>
                    <td style={{ fontWeight: '700' }}>{d.year}</td>
                    <td style={{ fontWeight: '600', color: 'var(--text-main)' }}>{formatVal(yrData.total)}</td>
                    <td style={{ color: 'var(--color-primary)' }}>{formatVal(yrData.conventional)}</td>
                    <td style={{ color: 'var(--color-secondary)' }}>{formatVal(yrData.nha)}</td>
                    <td style={{ color: 'var(--color-success)' }}>{formatVal(yrData.private)}</td>
                    <td style={{ color: 'var(--color-warning)' }}>{formatVal(yrData.cmhc)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
