const API_BASE = window.location.protocol === 'https:'
  ? 'https://mortgage-backend-h7oc.onrender.com/api'
  : '/api';


const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error! Status: ${response.status}`);
  }
  return response.json();
};

export const api = {
  // Borrowers
  getBorrowers: () => fetch(`${API_BASE}/borrowers`).then(handleResponse),
  createBorrower: (data) => fetch(`${API_BASE}/borrowers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then(handleResponse),
  updateBorrower: (id, data) => fetch(`${API_BASE}/borrowers/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then(handleResponse),
  deleteBorrower: (id) => fetch(`${API_BASE}/borrowers/${id}`, {
    method: 'DELETE',
  }).then(handleResponse),

  // Lenders
  getLenders: () => fetch(`${API_BASE}/lenders`).then(handleResponse),
  createLender: (data) => fetch(`${API_BASE}/lenders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then(handleResponse),
  updateLender: (id, data) => fetch(`${API_BASE}/lenders/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then(handleResponse),
  deleteLender: (id) => fetch(`${API_BASE}/lenders/${id}`, {
    method: 'DELETE',
  }).then(handleResponse),

  // Loans (Money In Contracts)
  getLoans: () => fetch(`${API_BASE}/loans`).then(handleResponse),
  createLoan: (data) => fetch(`${API_BASE}/loans`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then(handleResponse),
  updateLoan: (id, data) => fetch(`${API_BASE}/loans/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then(handleResponse),
  deleteLoan: (id) => fetch(`${API_BASE}/loans/${id}`, {
    method: 'DELETE',
  }).then(handleResponse),

  // Borrowings (Money Out Contracts)
  getBorrowings: () => fetch(`${API_BASE}/borrowings`).then(handleResponse),
  createBorrowing: (data) => fetch(`${API_BASE}/borrowings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then(handleResponse),
  updateBorrowing: (id, data) => fetch(`${API_BASE}/borrowings/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then(handleResponse),
  deleteBorrowing: (id) => fetch(`${API_BASE}/borrowings/${id}`, {
    method: 'DELETE',
  }).then(handleResponse),

  // Transactions (Ledger)
  getTransactions: () => fetch(`${API_BASE}/transactions`).then(handleResponse),
  createTransaction: (data) => fetch(`${API_BASE}/transactions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then(handleResponse),
  deleteTransaction: (id) => fetch(`${API_BASE}/transactions/${id}`, {
    method: 'DELETE',
  }).then(handleResponse),

  // Monthly Projections
  getProjections: (month) => fetch(`${API_BASE}/projections?month=${month}`).then(handleResponse),

  // Market Trends (Historical Canadian Mortgage Data)
  getMarketTrends: () => fetch(`${API_BASE}/market-trends`).then(handleResponse),
};
