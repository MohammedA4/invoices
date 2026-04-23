import React from 'react';
import { Badge } from 'react-bootstrap';

const STATUS_VARIANT = { Pending: 'warning', Paid: 'success', Cancelled: 'danger' };

function InvoiceListItem({ invoice, openModalForEdit }) {
  return (
    <tr style={{ cursor: 'pointer' }} onClick={() => openModalForEdit(invoice)}>
      <td className='ps-5'>{invoice.number}</td>
      <td>{invoice.date}</td>
      <td>{invoice.period}</td>
      <td>{invoice.workdays}</td>
      <td>{Number(invoice.ttp).toFixed(2)} $</td>
      <td>
        <Badge bg={STATUS_VARIANT[invoice.status] || 'secondary'}>
          {invoice.status || 'Pending'}
        </Badge>
      </td>
    </tr>
  );
}

export default InvoiceListItem;
