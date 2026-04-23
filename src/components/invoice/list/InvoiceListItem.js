import React from 'react';
import { CheckCircleFill, ClockFill, XCircleFill } from 'react-bootstrap-icons';

const STATUS_CONFIG = {
  Pending:   { className: 'status-pending',   icon: <ClockFill size={10} />,        label: 'Pending' },
  Paid:      { className: 'status-paid',      icon: <CheckCircleFill size={10} />,  label: 'Paid' },
  Cancelled: { className: 'status-cancelled', icon: <XCircleFill size={10} />,      label: 'Cancelled' },
};

function InvoiceListItem({ invoice, openModalForEdit }) {
  const status = STATUS_CONFIG[invoice.status] || STATUS_CONFIG['Pending'];
  const period = invoice.fromDate && invoice.toDate
    ? `${invoice.fromDate} → ${invoice.toDate}`
    : invoice.period || '—';

  return (
    <tr onClick={() => openModalForEdit(invoice)}>
      <td style={{ paddingLeft: '1.5rem' }}>
        <span className="invoice-number">#{invoice.number}</span>
      </td>
      <td>{invoice.date}</td>
      <td style={{ fontSize: '0.82rem', color: '#64748B' }}>{period}</td>
      <td>{invoice.workdays} days</td>
      <td><span className="invoice-amount">${Number(invoice.ttp).toFixed(2)}</span></td>
      <td>
        <span className={`status-badge ${status.className}`}>
          {status.icon} {status.label}
        </span>
      </td>
    </tr>
  );
}

export default InvoiceListItem;
