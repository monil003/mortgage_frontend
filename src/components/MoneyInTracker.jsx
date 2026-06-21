import React, { useState } from 'react';

export default function MoneyInTracker({
  borrowers,
  loans,
  transactions,
  onAddBorrower,
  onEditBorrower,
  onDeleteBorrower,
  onAddLoan,
  onEditLoan,
  onDeleteLoan,
}) {
  const [showBorrowerModal, setShowBorrowerModal] = useState(false);
  const [showLoanModal, setShowLoanModal] = useState(false);
  const [isEditingBorrower, setIsEditingBorrower] = useState(false);
  const [isEditingLoan, setIsEditingLoan] = useState(false);

  // Form states
  const [borrowerId, setBorrowerId] = useState('');
  const [borrowerName, setBorrowerName] = useState('');
  const [borrowerContact, setBorrowerContact] = useState('');

  const [loanId, setLoanId] = useState('');
  const [loanBorrower, setLoanBorrower] = useState('');
  const [loanAmount, setLoanAmount] = useState('');
  const [loanRate, setLoanRate] = useState('');
  const [loanDueDay, setLoanDueDay] = useState('10');
  const [loanStartDate, setLoanStartDate] = useState('');

  // Helpers
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(val);
  };

  const getLoanStatusAndNextDate = (loan) => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth(); // 0-indexed
    
    // Construct due date for this month
    const thisMonthDueDate = new Date(currentYear, currentMonth, loan.paymentDueDay);
    
    // Check if there is an income transaction for this loan in the current calendar month
    const hasTxThisMonth = transactions.some(t => {
      const tDate = new Date(t.date);
      return (
        t.associatedAccountType === 'loan' &&
        t.associatedAccountId &&
        t.associatedAccountId._id === loan._id &&
        t.type === 'income' &&
        tDate.getFullYear() === currentYear &&
        tDate.getMonth() === currentMonth
      );
    });

    let nextPaymentDate;
    let status;

    if (hasTxThisMonth) {
      // Already paid this month, next payment is next month
      nextPaymentDate = new Date(currentYear, currentMonth + 1, loan.paymentDueDay);
      status = 'Current';
    } else {
      // Not paid yet this month. Is the due date past?
      if (today > thisMonthDueDate) {
        nextPaymentDate = thisMonthDueDate;
        status = 'Overdue';
      } else {
        nextPaymentDate = thisMonthDueDate;
        status = 'Current';
      }
    }

    return {
      status,
      nextDate: nextPaymentDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }),
      nextAmount: (loan.loanAmount * loan.interestRate) / 12
    };
  };

  // Handlers
  const handleOpenBorrowerAdd = () => {
    setIsEditingBorrower(false);
    setBorrowerName('');
    setBorrowerContact('');
    setShowBorrowerModal(true);
  };

  const handleOpenBorrowerEdit = (b) => {
    setIsEditingBorrower(true);
    setBorrowerId(b._id);
    setBorrowerName(b.name);
    setBorrowerContact(b.contactInfo);
    setShowBorrowerModal(true);
  };

  const handleBorrowerSubmit = (e) => {
    e.preventDefault();
    const data = { name: borrowerName, contactInfo: borrowerContact };
    if (isEditingBorrower) {
      onEditBorrower(borrowerId, data);
    } else {
      onAddBorrower(data);
    }
    setShowBorrowerModal(false);
  };

  const handleOpenLoanAdd = () => {
    setIsEditingLoan(false);
    setLoanBorrower(borrowers[0]?._id || '');
    setLoanAmount('');
    setLoanRate('');
    setLoanDueDay('10');
    setLoanStartDate(new Date().toISOString().substring(0, 10));
    setShowLoanModal(true);
  };

  const handleOpenLoanEdit = (l) => {
    setIsEditingLoan(true);
    setLoanId(l._id);
    setLoanBorrower(l.borrower?._id || l.borrower || '');
    setLoanAmount(l.loanAmount);
    setLoanRate(l.interestRate * 100); // UI displays percentage
    setLoanDueDay(l.paymentDueDay);
    setLoanStartDate(new Date(l.startDate).toISOString().substring(0, 10));
    setShowLoanModal(true);
  };

  const handleLoanSubmit = (e) => {
    e.preventDefault();
    const data = {
      borrower: loanBorrower,
      loanAmount: parseFloat(loanAmount),
      interestRate: parseFloat(loanRate) / 100, // DB saves decimal
      paymentDueDay: parseInt(loanDueDay, 10),
      startDate: loanStartDate
    };
    if (isEditingLoan) {
      onEditLoan(loanId, data);
    } else {
      onAddLoan(data);
    }
    setShowLoanModal(false);
  };

  return (
    <div className="tracker-grid fade-in">
      
      {/* 1. Borrowers Manager */}
      <div className="section-card">
        <div className="tab-header-row">
          <h2 className="section-title">
            <span>👥</span> Borrowers (Clients)
          </h2>
          <button className="btn btn-primary btn-sm" onClick={handleOpenBorrowerAdd}>
            + Add Borrower
          </button>
        </div>

        {borrowers.length === 0 ? (
          <div className="empty-state">No borrowers registered. Add a borrower first.</div>
        ) : (
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Borrower Name</th>
                  <th>Contact Information</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {borrowers.map((b) => (
                  <tr key={b._id}>
                    <td style={{ fontWeight: '600' }}>{b.name}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{b.contactInfo || 'N/A'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="btn btn-sm" onClick={() => handleOpenBorrowerEdit(b)}>Edit</button>
                        <button className="btn btn-danger btn-sm" onClick={() => onDeleteBorrower(b._id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 2. Active Loans (Assets) */}
      <div className="section-card">
        <div className="tab-header-row">
          <h2 className="section-title">
            <span>💰</span> Active Loans (Money In Portfolio)
          </h2>
          <button 
            className="btn btn-primary btn-sm" 
            onClick={handleOpenLoanAdd}
            disabled={borrowers.length === 0}
            title={borrowers.length === 0 ? 'Create a borrower first' : ''}
          >
            + Add Loan Account
          </button>
        </div>

        {loans.length === 0 ? (
          <div className="empty-state">No active loan accounts found. Add a loan account to track incoming interest.</div>
        ) : (
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Borrower</th>
                  <th>Loan Principal</th>
                  <th>Interest Rate</th>
                  <th>Next Pay Amount</th>
                  <th>Next Pay Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loans.map((l) => {
                  const borrowerName = l.borrower ? l.borrower.name : 'Deleted Borrower';
                  const { status, nextDate, nextAmount } = getLoanStatusAndNextDate(l);
                  return (
                    <tr key={l._id}>
                      <td style={{ fontWeight: '600' }}>{borrowerName}</td>
                      <td>{formatCurrency(l.loanAmount)}</td>
                      <td style={{ color: 'var(--color-primary)', fontWeight: '600' }}>
                        {(l.interestRate * 100).toFixed(2)}%
                      </td>
                      <td style={{ color: 'var(--color-success)', fontWeight: '600' }}>
                        {formatCurrency(nextAmount)}
                      </td>
                      <td style={{ fontSize: '0.85rem' }}>{nextDate}</td>
                      <td>
                        <span className={`badge ${status === 'Current' ? 'badge-success' : 'badge-danger'}`}>
                          {status}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button className="btn btn-sm" onClick={() => handleOpenLoanEdit(l)}>Edit</button>
                          <button className="btn btn-danger btn-sm" onClick={() => onDeleteLoan(l._id)}>Delete</button>
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

      {/* Borrower Modal */}
      {showBorrowerModal && (
        <div className="modal-overlay">
          <form className="modal-content" onSubmit={handleBorrowerSubmit}>
            <button type="button" className="modal-close" onClick={() => setShowBorrowerModal(false)}>×</button>
            <h3 className="modal-title">{isEditingBorrower ? 'Edit Borrower' : 'Add New Borrower'}</h3>
            
            <div className="form-group">
              <label className="form-label">Name / Company</label>
              <input 
                type="text" 
                className="form-control" 
                value={borrowerName} 
                onChange={(e) => setBorrowerName(e.target.value)} 
                required 
                placeholder="e.g. Apex Dev Group LLC"
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Contact Details</label>
              <input 
                type="text" 
                className="form-control" 
                value={borrowerContact} 
                onChange={(e) => setBorrowerContact(e.target.value)} 
                placeholder="Email, phone or billing address"
              />
            </div>

            <div className="form-actions">
              <button type="button" className="btn" onClick={() => setShowBorrowerModal(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary">{isEditingBorrower ? 'Save Changes' : 'Create Borrower'}</button>
            </div>
          </form>
        </div>
      )}

      {/* Loan Account Modal */}
      {showLoanModal && (
        <div className="modal-overlay">
          <form className="modal-content" onSubmit={handleLoanSubmit}>
            <button type="button" className="modal-close" onClick={() => setShowLoanModal(false)}>×</button>
            <h3 className="modal-title">{isEditingLoan ? 'Edit Loan Account' : 'Add Loan Account'}</h3>

            <div className="form-group">
              <label className="form-label">Select Borrower</label>
              <select 
                className="form-control" 
                value={loanBorrower} 
                onChange={(e) => setLoanBorrower(e.target.value)}
                required
              >
                {borrowers.map(b => (
                  <option key={b._id} value={b._id}>{b.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Loan Amount (USD)</label>
              <input 
                type="number" 
                className="form-control" 
                value={loanAmount} 
                onChange={(e) => setLoanAmount(e.target.value)} 
                required
                min="0"
                step="0.01"
                placeholder="e.g. 250000"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Interest Rate (%)</label>
              <input 
                type="number" 
                className="form-control" 
                value={loanRate} 
                onChange={(e) => setLoanRate(e.target.value)} 
                required
                min="0"
                step="0.01"
                placeholder="e.g. 7.5"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Payment Due Day (1 - 28)</label>
              <input 
                type="number" 
                className="form-control" 
                value={loanDueDay} 
                onChange={(e) => setLoanDueDay(e.target.value)} 
                required
                min="1"
                max="28"
                placeholder="e.g. 15"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Contract Start Date</label>
              <input 
                type="date" 
                className="form-control" 
                value={loanStartDate} 
                onChange={(e) => setLoanStartDate(e.target.value)} 
                required
              />
            </div>

            <div className="form-actions">
              <button type="button" className="btn" onClick={() => setShowLoanModal(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary">{isEditingLoan ? 'Save Changes' : 'Create Loan'}</button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
