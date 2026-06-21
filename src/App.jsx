import React, { useState, useEffect } from 'react';
import { api } from './utils/api';

import Dashboard from './components/Dashboard';
import CalendarTimeline from './components/CalendarTimeline';
import MoneyInTracker from './components/MoneyInTracker';
import MoneyOutTracker from './components/MoneyOutTracker';
import TransactionLedger from './components/TransactionLedger';
import MarketTrends from './components/MarketTrends';

export default function App() {
  const [currentTab, setCurrentTab] = useState('dashboard');
  
  // Format current year and month for default state (e.g. "2026-06")
  const getDefaultMonth = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  };
  const [currentMonth, setCurrentMonth] = useState(getDefaultMonth());

  // Data states
  const [borrowers, setBorrowers] = useState([]);
  const [lenders, setLenders] = useState([]);
  const [loans, setLoans] = useState([]);
  const [borrowings, setBorrowings] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [events, setEvents] = useState([]);
  const [summary, setSummary] = useState({});
  const [marketData, setMarketData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Toast Alert Notification
  const [alert, setAlert] = useState(null);

  const showAlert = (message, type = 'success') => {
    setAlert({ message, type });
    setTimeout(() => {
      setAlert(null);
    }, 4000);
  };

  // Fetch all core metadata (Parties & Accounts)
  const fetchMetadata = async () => {
    try {
      const [borrowersData, lendersData, loansData, borrowingsData, txData] = await Promise.all([
        api.getBorrowers(),
        api.getLenders(),
        api.getLoans(),
        api.getBorrowings(),
        api.getTransactions()
      ]);
      setBorrowers(borrowersData);
      setLenders(lendersData);
      setLoans(loansData);
      setBorrowings(borrowingsData);
      setTransactions(txData);
    } catch (err) {
      console.error(err);
      showAlert(`Failed to fetch core data: ${err.message}`, 'error');
    }
  };

  // Fetch projections for calendar timeline
  const fetchProjections = async () => {
    try {
      const data = await api.getProjections(currentMonth);
      setEvents(data.events);
      setSummary(data.summary);
    } catch (err) {
      console.error(err);
      showAlert(`Failed to fetch monthly schedule: ${err.message}`, 'error');
    }
  };

  // Initial load
  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      await fetchMetadata();
      await fetchProjections();
      try {
        const mData = await api.getMarketTrends();
        setMarketData(mData);
      } catch (err) {
        console.error('Failed to load historical trends:', err);
      }
      setLoading(false);
    };
    loadAll();
  }, []);

  // Update schedule projections when month changes
  useEffect(() => {
    fetchProjections();
  }, [currentMonth]);

  // General wrapper to refresh everything after mutations
  const refreshData = async () => {
    await fetchMetadata();
    await fetchProjections();
  };

  // ==========================================
  // Borrower CRUD handlers
  // ==========================================
  const handleAddBorrower = async (data) => {
    try {
      const newBorrower = await api.createBorrower(data);
      showAlert(`Borrower "${newBorrower.name}" created successfully.`);
      refreshData();
    } catch (err) {
      showAlert(err.message, 'error');
    }
  };

  const handleEditBorrower = async (id, data) => {
    try {
      const updated = await api.updateBorrower(id, data);
      showAlert(`Borrower "${updated.name}" updated successfully.`);
      refreshData();
    } catch (err) {
      showAlert(err.message, 'error');
    }
  };

  const handleDeleteBorrower = async (id) => {
    if (!window.confirm('Are you sure you want to delete this borrower?')) return;
    try {
      await api.deleteBorrower(id);
      showAlert('Borrower deleted successfully.');
      refreshData();
    } catch (err) {
      showAlert(err.message, 'error');
    }
  };

  // ==========================================
  // Lender CRUD handlers
  // ==========================================
  const handleAddLender = async (data) => {
    try {
      const newLender = await api.createLender(data);
      showAlert(`Lender "${newLender.name}" created successfully.`);
      refreshData();
    } catch (err) {
      showAlert(err.message, 'error');
    }
  };

  const handleEditLender = async (id, data) => {
    try {
      const updated = await api.updateLender(id, data);
      showAlert(`Lender "${updated.name}" updated successfully.`);
      refreshData();
    } catch (err) {
      showAlert(err.message, 'error');
    }
  };

  const handleDeleteLender = async (id) => {
    if (!window.confirm('Are you sure you want to delete this lender?')) return;
    try {
      await api.deleteLender(id);
      showAlert('Lender deleted successfully.');
      refreshData();
    } catch (err) {
      showAlert(err.message, 'error');
    }
  };

  // ==========================================
  // Loan CRUD handlers
  // ==========================================
  const handleAddLoan = async (data) => {
    try {
      await api.createLoan(data);
      showAlert('Loan account created successfully.');
      refreshData();
    } catch (err) {
      showAlert(err.message, 'error');
    }
  };

  const handleEditLoan = async (id, data) => {
    try {
      await api.updateLoan(id, data);
      showAlert('Loan account updated successfully.');
      refreshData();
    } catch (err) {
      showAlert(err.message, 'error');
    }
  };

  const handleDeleteLoan = async (id) => {
    if (!window.confirm('Delete this loan? Note: All transaction ledger history linked to this loan will also be deleted.')) return;
    try {
      await api.deleteLoan(id);
      showAlert('Loan account deleted.');
      refreshData();
    } catch (err) {
      showAlert(err.message, 'error');
    }
  };

  // ==========================================
  // Borrowing CRUD handlers
  // ==========================================
  const handleAddBorrowing = async (data) => {
    try {
      await api.createBorrowing(data);
      showAlert('Borrowing account liability recorded.');
      refreshData();
    } catch (err) {
      showAlert(err.message, 'error');
    }
  };

  const handleEditBorrowing = async (id, data) => {
    try {
      await api.updateBorrowing(id, data);
      showAlert('Borrowing account updated.');
      refreshData();
    } catch (err) {
      showAlert(err.message, 'error');
    }
  };

  const handleDeleteBorrowing = async (id) => {
    if (!window.confirm('Delete this borrowing account? Note: All transaction ledger history linked to this account will also be deleted.')) return;
    try {
      await api.deleteBorrowing(id);
      showAlert('Borrowing account deleted.');
      refreshData();
    } catch (err) {
      showAlert(err.message, 'error');
    }
  };

  // ==========================================
  // Transaction CRUD handlers
  // ==========================================
  const handleAddTransaction = async (data) => {
    try {
      await api.createTransaction(data);
      showAlert('Transaction logged to ledger successfully.');
      refreshData();
    } catch (err) {
      showAlert(err.message, 'error');
    }
  };

  const handleDeleteTransaction = async (id) => {
    if (!window.confirm('Delete this transaction?')) return;
    try {
      await api.deleteTransaction(id);
      showAlert('Transaction deleted from ledger.');
      refreshData();
    } catch (err) {
      showAlert(err.message, 'error');
    }
  };

  // Quick payout logging from schedule timeline
  const handleQuickPay = async (event) => {
    try {
      const isIncome = event.type === 'income';
      
      const payload = {
        type: event.type,
        amount: event.expectedAmount,
        associatedAccountType: event.accountType,
        associatedAccountId: event.accountId,
        date: event.expectedDate, // Date matching the due day
        notes: `Recorded payment for ${currentMonth} expected interest (${event.name})`
      };

      await api.createTransaction(payload);
      showAlert(`Successfully recorded ${isIncome ? 'receipt' : 'payout'} of $${event.expectedAmount.toLocaleString()} for ${event.name}.`);
      refreshData();
    } catch (err) {
      showAlert(`Quick pay failed: ${err.message}`, 'error');
    }
  };

  return (
    <div className="app-container">
      {/* Toast Alert Banner */}
      {alert && (
        <div className={`alert-banner ${alert.type}`}>
          <div className="alert-message">
            {alert.type === 'success' ? '✅ ' : '❌ '}
            {alert.message}
          </div>
        </div>
      )}

      {/* Header */}
      <header className="app-header">
        <div className="logo-section">
          <span className="logo-icon">🏦</span>
          <span className="logo-text">Aura Mortgage</span>
        </div>

        <nav className="nav-tabs">
          <button 
            className={`tab-btn ${currentTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setCurrentTab('dashboard')}
          >
            📊 Dashboard
          </button>
          <button 
            className={`tab-btn ${currentTab === 'moneyIn' ? 'active' : ''}`}
            onClick={() => setCurrentTab('moneyIn')}
          >
            📥 Money In
          </button>
          <button 
            className={`tab-btn ${currentTab === 'moneyOut' ? 'active' : ''}`}
            onClick={() => setCurrentTab('moneyOut')}
          >
            📤 Money Out
          </button>
          <button 
            className={`tab-btn ${currentTab === 'ledger' ? 'active' : ''}`}
            onClick={() => setCurrentTab('ledger')}
          >
            📖 Ledger
          </button>
          <button 
            className={`tab-btn ${currentTab === 'marketTrends' ? 'active' : ''}`}
            onClick={() => setCurrentTab('marketTrends')}
          >
            🇨🇦 Market Trends
          </button>
        </nav>

        <div>
          <span className="badge badge-success" style={{ padding: '0.4rem 0.8rem' }}>
            Live Ledger Connected
          </span>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="main-content">
        {loading ? (
          <div className="empty-state">
            <div className="empty-state-icon" style={{ animation: 'spin 1.5s linear infinite' }}>🔄</div>
            <p>Loading cash flow ledger & metadata...</p>
          </div>
        ) : (
          <>
            {currentTab === 'dashboard' && (
              <div className="two-column-layout">
                <div>
                  <Dashboard summary={summary} />
                  <CalendarTimeline 
                    events={events}
                    currentMonth={currentMonth}
                    onMonthChange={setCurrentMonth}
                    onQuickPay={handleQuickPay}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {/* Right side helper info card */}
                  <div className="section-card">
                    <h3 className="section-title" style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>
                      💡 Quick Summary
                    </h3>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                      This dashboard calculates income and liabilities using interest-only cash flows.
                    </p>
                    <div className="summary-values-row">
                      <div className="summary-item">
                        <span className="summary-label">Expected Net</span>
                        <span className="summary-val" style={{ color: 'var(--color-primary)' }}>
                          ${summary.projectedMargin?.toLocaleString()}
                        </span>
                      </div>
                      <div className="summary-item">
                        <span className="summary-label">Actual Collected</span>
                        <span className="summary-val" style={{ color: summary.actualMargin >= 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>
                          ${summary.actualMargin?.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="section-card">
                    <h3 className="section-title" style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>
                      📋 Operations checklist
                    </h3>
                    <ul style={{ paddingLeft: '1.25rem', fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <li>Register Borrowers and Lenders.</li>
                      <li>Add Loan and Debt Agreements.</li>
                      <li>Compare monthly cash outflows (cost of capital) vs interest collections.</li>
                      <li>Mark items paid in the schedule to update the live Profit Margin.</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {currentTab === 'moneyIn' && (
              <MoneyInTracker 
                borrowers={borrowers}
                loans={loans}
                transactions={transactions}
                onAddBorrower={handleAddBorrower}
                onEditBorrower={handleEditBorrower}
                onDeleteBorrower={handleDeleteBorrower}
                onAddLoan={handleAddLoan}
                onEditLoan={handleEditLoan}
                onDeleteLoan={handleDeleteLoan}
              />
            )}

            {currentTab === 'moneyOut' && (
              <MoneyOutTracker 
                lenders={lenders}
                borrowings={borrowings}
                transactions={transactions}
                onAddLender={handleAddLender}
                onEditLender={handleEditLender}
                onDeleteLender={handleDeleteLender}
                onAddBorrowing={handleAddBorrowing}
                onEditBorrowing={handleEditBorrowing}
                onDeleteBorrowing={handleDeleteBorrowing}
              />
            )}

            {currentTab === 'ledger' && (
              <TransactionLedger 
                transactions={transactions}
                loans={loans}
                borrowings={borrowings}
                onAddTransaction={handleAddTransaction}
                onDeleteTransaction={handleDeleteTransaction}
              />
            )}

            {currentTab === 'marketTrends' && (
              <MarketTrends marketData={marketData} />
            )}
          </>
        )}
      </main>
    </div>
  );
}
