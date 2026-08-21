import { useState, useEffect } from 'react';
import api from '../../api/api';

export default function Fees() {
  const [fees, setFees] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    loadFees();
  }, []);

  const loadFees = async () => {
    try {
      const res = await api.get('/fees');
      setFees(res.data);
    } catch (err) {
      setError('Failed to load fee records.');
    }
  };

  const totalAmount = fees.reduce((sum, f) => sum + f.amount, 0);
  const paidAmount = fees.filter(f => f.status === 'paid').reduce((sum, f) => sum + f.amount, 0);
  const dueAmount = totalAmount - paidAmount;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-IN', {
      year: 'numeric', month: 'short', day: 'numeric',
    });
  };

  return (
    <div>
      <div className="page-header">
        <h1>Fees</h1>
        <p>Your fee structure and payment status</p>
      </div>

      {fees.length > 0 && (
        <div className="fee-summary">
          <div className="fee-summary-item">
            <div className="label">Total Fees</div>
            <div className="amount total">{formatCurrency(totalAmount)}</div>
          </div>
          <div className="fee-summary-item">
            <div className="label">Paid</div>
            <div className="amount paid">{formatCurrency(paidAmount)}</div>
          </div>
          <div className="fee-summary-item">
            <div className="label">Due</div>
            <div className="amount due">{formatCurrency(dueAmount)}</div>
          </div>
        </div>
      )}

      {error && <div className="alert alert-error">{error}</div>}

      {fees.length === 0 ? (
        <div className="empty-state"><p>No fee records found.</p></div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Fee Type</th>
                  <th>Amount</th>
                  <th>Due Date</th>
                  <th>Paid Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {fees.map(fee => (
                  <tr key={fee.id}>
                    <td style={{ fontWeight: 500 }}>{fee.fee_type}</td>
                    <td style={{ fontWeight: 600 }}>{formatCurrency(fee.amount)}</td>
                    <td>{formatDate(fee.due_date)}</td>
                    <td>{formatDate(fee.paid_date)}</td>
                    <td>
                      <span className={`badge badge-${fee.status}`}>
                        {fee.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
