import React, { useState } from 'react';

export default function MoneyOutTracker({
  lenders,
  borrowings,
  transactions,
  onAddLender,
  onEditLender,
  onDeleteLender,
  onAddBorrowing,
  onEditBorrowing,
  onDeleteBorrowing,
}) {
  const [showLenderModal, setShowLenderModal] = useState(false);
  const [showBorrowingModal, setShowBorrowingModal] = useState(false);
  const [isEditingLender, setIsEditingLender] = useState(false);
  const [isEditingBorrowing, setIsEditingBorrowing] = useState(false);

  // Form states
  const [lenderId, setLenderId] = useState('');
  const [lenderName, setLenderName] = useState('');
  const [lenderContact, setLenderContact] = useState('');

  const [borrowingId, setBorrowingId] = useState('');
  const [borrowingLender, setBorrowingLender] = useState('');
  const [borrowingAmount, setBorrowingAmount] = useState('');
  const [borrowingRate, setBorrowingRate] = useState('');
  const [borrowingDueDay, setBorrowingDueDay] = useState('1');
  const [borrowingStartDate, setBorrowingStartDate] = useState('');

  // Helpers
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(val);
  };

  const getBorrowingStatusAndNextDate = (borrowing) => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth(); // 0-indexed
    
    // Construct due date for this month
    const thisMonthDueDate = new Date(currentYear, currentMonth, borrowing.paymentDueDay);
    
    // Check if there is an outcome transaction for this borrowing in the current calendar month
    const hasTxThisMonth = transactions.some(t => {
      const tDate = new Date(t.date);
      return (
        t.associatedAccountType === 'borrowing' &&
        t.associatedAccountId &&
        t.associatedAccountId._id === borrowing._id &&
        t.type === 'outcome' &&
        tDate.getFullYear() === currentYear &&
        tDate.getMonth() === currentMonth
      );
    });

    let nextPaymentDate;
    let status;

    if (hasTxThisMonth) {
      nextPaymentDate = new Date(currentYear, currentMonth + 1, borrowing.paymentDueDay);
      status = 'Paid';
    } else {
      if (today > thisMonthDueDate) {
        nextPaymentDate = thisMonthDueDate;
        status = 'Overdue';
      } else {
        nextPaymentDate = thisMonthDueDate;
        status = 'Pending';
      }
    }

    return {
      status,
      nextDate: nextPaymentDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }),
      nextAmount: (borrowing.principalAmount * borrowing.interestRate) / 12
    };
  };

  // Handlers
  const handleOpenLenderAdd = () => {
    setIsEditingLender(false);
    setLenderName('');
    setLenderContact('');
    setShowLenderModal(true);
  };

  const handleOpenLenderEdit = (l) => {
    setIsEditingLender(true);
    setLenderId(l._id);
    setLenderName(l.name);
    setLenderContact(l.contactInfo);
    setShowLenderModal(true);
  };

  const handleLenderSubmit = (e) => {
    e.preventDefault();
    const data = { name: lenderName, contactInfo: lenderContact };
    if (isEditingLender) {
      onEditLender(lenderId, data);
    } else {
      onAddLender(data);
    }
    setShowLenderModal(false);
  };

  const handleOpenBorrowingAdd = () => {
    setIsEditingBorrowing(false);
    setBorrowingLender(lenders[0]?._id || '');
    setBorrowingAmount('');
    setBorrowingRate('');
    setBorrowingDueDay('1');
    setBorrowingStartDate(new Date().toISOString().substring(0, 10));
    setShowBorrowingModal(true);
  };

  const handleOpenBorrowingEdit = (b) => {
    setIsEditingBorrowing(true);
    setBorrowingId(b._id);
    setBorrowingLender(b.lender?._id || b.lender || '');
    setBorrowingAmount(b.principalAmount);
    setBorrowingRate(b.interestRate * 100);
    setBorrowingDueDay(b.paymentDueDay);
    setBorrowingStartDate(new Date(b.startDate).toISOString().substring(0, 10));
    setShowBorrowingModal(true);
  };

  const handleBorrowingSubmit = (e) => {
    e.preventDefault();
    const data = {
      lender: borrowingLender,
      principalAmount: parseFloat(borrowingAmount),
      interestRate: parseFloat(borrowingRate) / 100,
      paymentDueDay: parseInt(borrowingDueDay, 10),
      startDate: borrowingStartDate
    };
    if (isEditingBorrowing) {
      onEditBorrowing(borrowingId, data);
    } else {
      onAddBorrowing(data);
    }
    setShowBorrowingModal(false);
  };

  return (
    <div className="tracker-grid fade-in">
      
      {/* 1. Lenders Manager */}
      <div className="section-card">
        <div className="tab-header-row">
          <h2 className="section-title">
            <span>🏦</span> Lenders (Creditors)
          </h2>
          <button className="btn btn-primary btn-sm" onClick={handleOpenLenderAdd}>
            + Add Lender
          </button>
        </div>

        {lenders.length === 0 ? (
          <div className="empty-state">No lenders registered. Add a lender first.</div>
        ) : (
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Lender Name</th>
                  <th>Contact Information</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {lenders.map((l) => (
                  <tr key={l._id}>
                    <td style={{ fontWeight: '600' }}>{l.name}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{l.contactInfo || 'N/A'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="btn btn-sm" onClick={() => handleOpenLenderEdit(l)}>Edit</button>
                        <button className="btn btn-danger btn-sm" onClick={() => onDeleteLender(l._id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 2. Active Borrowings (Liabilities) */}
      <div className="section-card">
        <div className="tab-header-row">
          <h2 className="section-title">
            <span>📉</span> Active Borrowing Accounts (Money Out Debt)
          </h2>
          <button 
            className="btn btn-primary btn-sm" 
            onClick={handleOpenBorrowingAdd}
            disabled={lenders.length === 0}
            title={lenders.length === 0 ? 'Create a lender first' : ''}
          >
            + Add Borrowing
          </button>
        </div>

        {borrowings.length === 0 ? (
          <div className="empty-state">No active debt liabilities found. Add a borrowing account to track cost of capital payouts.</div>
        ) : (
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Lender Name</th>
                  <th>Borrowed Amount</th>
                  <th>Cost of Capital</th>
                  <th>Next Payout</th>
                  <th>Next Payout Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {borrowings.map((b) => {
                  const lenderName = b.lender ? b.lender.name : 'Deleted Lender';
                  const { status, nextDate, nextAmount } = getBorrowingStatusAndNextDate(b);
                  return (
                    <tr key={b._id}>
                      <td style={{ fontWeight: '600' }}>{lenderName}</td>
                      <td>{formatCurrency(b.principalAmount)}</td>
                      <td style={{ color: 'var(--color-danger)', fontWeight: '600' }}>
                        {(b.interestRate * 100).toFixed(2)}%
                      </td>
                      <td style={{ color: 'var(--color-danger)', fontWeight: '600' }}>
                        {formatCurrency(nextAmount)}
                      </td>
                      <td style={{ fontSize: '0.85rem' }}>{nextDate}</td>
                      <td>
                        <span className={`badge ${status === 'Paid' ? 'badge-success' : status === 'Overdue' ? 'badge-danger' : 'badge-warning'}`}>
                          {status}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button className="btn btn-sm" onClick={() => handleOpenBorrowingEdit(b)}>Edit</button>
                          <button className="btn btn-danger btn-sm" onClick={() => onDeleteBorrowing(b._id)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Lender Modal */}
      {showLenderModal && (
        <div className="modal-overlay">
          <form className="modal-content" onSubmit={handleLenderSubmit}>
            <button type="button" className="modal-close" onClick={() => setShowLenderModal(false)}>×</button>
            <h3 className="modal-title">{isEditingLender ? 'Edit Lender' : 'Add New Lender'}</h3>
            
            <div className="form-group">
              <label className="form-label">Lender / Institution Name</label>
              <input 
                type="text" 
                className="form-control" 
                value={lenderName} 
                onChange={(e) => setLenderName(e.target.value)} 
                required 
                placeholder="e.g. Apex Horizon Ventures"
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Contact Details</label>
              <input 
                type="text" 
                className="form-control" 
                value={lenderContact} 
                onChange={(e) => setLenderContact(e.target.value)} 
                placeholder="Email, Commercial banker contacts"
              />
            </div>

            <div className="form-actions">
              <button type="button" className="btn" onClick={() => setShowLenderModal(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary">{isEditingLender ? 'Save Changes' : 'Create Lender'}</button>
            </div>
          </form>
        </div>
      )}

      {/* Borrowing Modal */}
      {showBorrowingModal && (
        <div className="modal-overlay">
          <form className="modal-content" onSubmit={handleBorrowingSubmit}>
            <button type="button" className="modal-close" onClick={() => setShowBorrowingModal(false)}>×</button>
            <h3 className="modal-title">{isEditingBorrowing ? 'Edit Debt Account' : 'Add Debt Account'}</h3>

            <div className="form-group">
              <label className="form-label">Select Lender</label>
              <select 
                className="form-control" 
                value={borrowingLender} 
                onChange={(e) => setBorrowingLender(e.target.value)}
                required
              >
                {lenders.map(l => (
                  <option key={l._id} value={l._id}>{l.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Borrowed Principal (USD)</label>
              <input 
                type="number" 
                className="form-control" 
                value={borrowingAmount} 
                onChange={(e) => setBorrowingAmount(e.target.value)} 
                required
                min="0"
                step="0.01"
                placeholder="e.g. 500000"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Interest Cost (Cost of Capital %)</label>
              <input 
                type="number" 
                className="form-control" 
                value={borrowingRate} 
                onChange={(e) => setBorrowingRate(e.target.value)} 
                required
                min="0"
                step="0.01"
                placeholder="e.g. 5.0"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Payment Due Day (1 - 28)</label>
              <input 
                type="number" 
                className="form-control" 
                value={borrowingDueDay} 
                onChange={(e) => setBorrowingDueDay(e.target.value)} 
                required
                min="1"
                max="28"
                placeholder="e.g. 1"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Debt Start Date</label>
              <input 
                type="date" 
                className="form-control" 
                value={borrowingStartDate} 
                onChange={(e) => setBorrowingStartDate(e.target.value)} 
                required
              />
            </div>

            <div className="form-actions">
              <button type="button" className="btn" onClick={() => setShowBorrowingModal(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary">{isEditingBorrowing ? 'Save Changes' : 'Create Borrowing'}</button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
