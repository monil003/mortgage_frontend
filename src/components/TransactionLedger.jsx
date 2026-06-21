import React, { useState } from 'react';

export default function TransactionLedger({
  transactions,
  loans,
  borrowings,
  onAddTransaction,
  onDeleteTransaction
}) {
  const [showModal, setShowModal] = useState(false);
  
  // Form states
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().substring(0, 10));
  const [notes, setNotes] = useState('');
  
  // Selected account type and ID
  // Value format: "loan:ID" or "borrowing:ID"
  const [selectedAccountVal, setSelectedAccountVal] = useState('');

  // Helpers
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(val);
  };

  const handleOpenAdd = () => {
    // Default select first available account
    if (loans.length > 0) {
      setSelectedAccountVal(`loan:${loans[0]._id}`);
    } else if (borrowings.length > 0) {
      setSelectedAccountVal(`borrowing:${borrowings[0]._id}`);
    } else {
      setSelectedAccountVal('');
    }
    setAmount('');
    setDate(new Date().toISOString().substring(0, 10));
    setNotes('');
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedAccountVal) return;

    const [accountType, accountId] = selectedAccountVal.split(':');
    const transactionType = accountType === 'loan' ? 'income' : 'outcome';

    onAddTransaction({
      type: transactionType,
      amount: parseFloat(amount),
      associatedAccountType: accountType,
      associatedAccountId: accountId,
      date,
      notes
    });

    setShowModal(false);
  };

  return (
    <div className="section-card fade-in">
      <div className="tab-header-row">
        <h2 className="section-title">
          <span>📖</span> Cash Flow Ledger (Transactions)
        </h2>
        <button 
          className="btn btn-primary btn-sm" 
          onClick={handleOpenAdd}
          disabled={loans.length === 0 && borrowings.length === 0}
          title={loans.length === 0 && borrowings.length === 0 ? 'Create a Loan or Borrowing first' : ''}
        >
          + Log Transaction
        </button>
      </div>

      {transactions.length === 0 ? (
        <div className="empty-state">No transactions recorded yet. Log a transaction manually or from the schedule timeline.</div>
      ) : (
        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Party / Detail</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Notes</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => {
                const isIncome = tx.type === 'income';
                const formattedDate = new Date(tx.date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                });
                
                return (
                  <tr key={tx._id}>
                    <td>{formattedDate}</td>
                    <td style={{ fontWeight: '600' }}>{tx.detailName || 'Unknown'}</td>
                    <td>
                      <span className={`badge ${isIncome ? 'badge-success' : 'badge-danger'}`}>
                        {isIncome ? 'Income' : 'Outcome'}
                      </span>
                    </td>
                    <td style={{ 
                      fontWeight: '700', 
                      color: isIncome ? 'var(--color-success)' : 'var(--color-danger)' 
                    }}>
                      {isIncome ? '+' : '-'}{formatCurrency(tx.amount)}
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{tx.notes || '-'}</td>
                    <td>
                      <button 
                        className="btn btn-danger btn-sm"
                        onClick={() => onDeleteTransaction(tx._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Manual Entry Modal */}
      {showModal && (
        <div className="modal-overlay">
          <form className="modal-content" onSubmit={handleSubmit}>
            <button type="button" className="modal-close" onClick={() => setShowModal(false)}>×</button>
            <h3 className="modal-title">Log Cash Flow Payment</h3>

            <div className="form-group">
              <label className="form-label">Associate Account</label>
              <select
                className="form-control"
                value={selectedAccountVal}
                onChange={(e) => setSelectedAccountVal(e.target.value)}
                required
              >
                {loans.length > 0 && (
                  <optgroup label="Loan Accounts (Income)">
                    {loans.map(l => (
                      <option key={l._id} value={`loan:${l._id}`}>
                        {l.borrower ? l.borrower.name : 'Borrower'} - Principal: {formatCurrency(l.loanAmount)}
                      </option>
                    ))}
                  </optgroup>
                )}
                {borrowings.length > 0 && (
                  <optgroup label="Borrowing Accounts (Outcome)">
                    {borrowings.map(b => (
                      <option key={b._id} value={`borrowing:${b._id}`}>
                        {b.lender ? b.lender.name : 'Lender'} - Principal: {formatCurrency(b.principalAmount)}
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Payment Amount (USD)</label>
              <input 
                type="number" 
                className="form-control" 
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                min="0"
                step="0.01"
                placeholder="0.00"
              />
              <span className="timeline-meta" style={{ marginTop: '0.25rem' }}>
                Note: Loans will be logged as Income, Borrowings as Outcomes.
              </span>
            </div>

            <div className="form-group">
              <label className="form-label">Payment Date</label>
              <input 
                type="date" 
                className="form-control" 
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Notes (Optional)</label>
              <input 
                type="text" 
                className="form-control" 
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. May interest payment"
              />
            </div>

            <div className="form-actions">
              <button type="button" className="btn" onClick={() => setShowModal(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary">Log Payment</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
