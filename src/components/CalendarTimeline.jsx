import React from 'react';

export default function CalendarTimeline({ events, currentMonth, onMonthChange, onQuickPay }) {
  // Format currency
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(val);
  };

  // Format date helper
  const formatDateParts = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate();
    // Short month name
    const month = date.toLocaleString('default', { month: 'short' });
    return { day, month };
  };

  return (
    <div className="section-card fade-in">
      <div className="section-header">
        <h2 className="section-title">
          <span>📅</span> Cash Flow Timeline & Schedule
        </h2>
        <div className="month-picker-container">
          <label className="form-label" style={{ marginBottom: 0, marginRight: '0.5rem' }}>Select Month:</label>
          <input 
            type="month" 
            className="month-input" 
            value={currentMonth}
            onChange={(e) => onMonthChange(e.target.value)} 
          />
        </div>
      </div>

      {events.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🏜️</div>
          <p>No active loan or debt contracts scheduled for {currentMonth}.</p>
          <p style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>Create agreements in Money In/Out to populate the timeline.</p>
        </div>
      ) : (
        <div className="timeline-list">
          {events.map((event) => {
            const { day, month } = formatDateParts(event.expectedDate);
            const isIncome = event.type === 'income';
            
            // Timeline visual decoration color
            let indicatorColor = 'var(--text-dark)';
            if (event.status === 'Paid') {
              indicatorColor = 'var(--color-success)';
            } else if (event.status === 'Overdue') {
              indicatorColor = 'var(--color-danger)';
            } else if (event.status === 'Upcoming') {
              indicatorColor = 'var(--color-warning)';
            }

            return (
              <div 
                key={event.id} 
                className="timeline-item" 
                style={{ '--timeline-bar': indicatorColor }}
              >
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div className="timeline-date-box">
                    <span className="timeline-day">{day}</span>
                    <span className="timeline-month">{month}</span>
                  </div>

                  <div className="timeline-info">
                    <div className="timeline-name">{event.name}</div>
                    <div className="timeline-meta">
                      <span className={`timeline-flow-indicator ${isIncome ? 'flow-in' : 'flow-out'}`}>
                        {isIncome ? '📥 Incoming Interest' : '📤 Outgoing Interest'}
                      </span>
                      <span>•</span>
                      <span>Due Day: {new Date(event.expectedDate).getDate()}</span>
                    </div>
                  </div>
                </div>

                <div className="timeline-financials">
                  <div className="timeline-amount" style={{ color: isIncome ? 'var(--color-success)' : 'var(--color-danger)' }}>
                    {isIncome ? '+' : '-'}{formatCurrency(event.expectedAmount)}
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.25rem' }}>
                    <span className={`badge ${
                      event.status === 'Paid' ? 'badge-success' : 
                      event.status === 'Overdue' ? 'badge-danger' : 'badge-warning'
                    }`}>
                      {event.status}
                    </span>

                    {event.status !== 'Paid' && (
                      <button 
                        className={`btn btn-sm ${isIncome ? 'btn-success' : 'btn-danger'}`}
                        onClick={() => onQuickPay(event)}
                      >
                        {isIncome ? 'Mark Received' : 'Mark Paid'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
