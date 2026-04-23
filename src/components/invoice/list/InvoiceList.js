import InvoiceListItem from "./InvoiceListItem";
import { PlusLg, FileEarmarkText } from "react-bootstrap-icons";

function InvoiceList({ invoices, openModalForEdit, openModalForCreate }) {
  if (invoices.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon"><FileEarmarkText /></div>
        <h5>No invoices yet</h5>
        <p style={{ fontSize: '0.9rem', marginBottom: '1.25rem' }}>
          Create your first invoice to get started.
        </p>
        <button className="btn btn-create" onClick={openModalForCreate}>
          <PlusLg className="me-1" /> Create Invoice
        </button>
      </div>
    );
  }

  return (
    <table className="invoice-table">
      <thead>
        <tr>
          <th style={{ paddingLeft: '1.5rem' }}>#</th>
          <th>Invoice Date</th>
          <th>Period</th>
          <th>Days Worked</th>
          <th>Total to Pay</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {invoices.map(invoice => (
          <InvoiceListItem key={invoice.id} invoice={invoice}
            openModalForEdit={openModalForEdit} />
        ))}
      </tbody>
    </table>
  );
}

export default InvoiceList;
