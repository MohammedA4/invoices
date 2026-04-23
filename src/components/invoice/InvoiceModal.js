import React, { useState } from 'react';
import { Modal } from "react-bootstrap";
import CreateInvoiceForm from './forms/CreateInvoiceForm';
import EditInvoiceForm from './forms/EditInvoiceForm';

const PRICE_PER_HOUR = 0;

function InvoiceModal({ invoices, setInvoices, selectedInvoice, setSelectedInvoice, showModal, setShowModal, fetchInvoices, walletAddress }) {

  const buildNewInvoice = () => {
    const now = new Date();
    const date = now.toISOString().split('T')[0];
    const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const period = prevMonth.toISOString().substring(0, 7);
    const lastNumber = invoices.length > 0 ? Math.max(...invoices.map(i => i.number || 0)) : 0;
    return {
      number: lastNumber + 1,
      date,
      fromDate: '',
      toDate: '',
      vacations: 0,
      workdays: 0,
      pricePerHour: 0,
      total: 0,
      vat: 0,
      ttp: 0,
      status: 'Pending',
      walletAddress: '',
      txHash: '',
      invoiceEntries: [{ id: 1, serviceName: '', quantity: 0, cost: 0 }]
    };
  };

  const [newInvoice, setNewInvoice] = useState(buildNewInvoice);

  const onShowModal = () => {
    if (!selectedInvoice) setNewInvoice(buildNewInvoice());
  };

  const handleCloseModal = () => {
    setSelectedInvoice(null);
    setShowModal(false);
  };

  return (
    <Modal show={showModal} onShow={onShowModal} onHide={handleCloseModal}
      backdrop='static' keyboard={false} size='lg'>
      <Modal.Dialog>
        <Modal.Header closeButton style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
          <Modal.Title style={{ fontWeight: 700, fontSize: '1rem', color: '#1E293B' }}>
            {selectedInvoice ? `Edit Invoice #${selectedInvoice.number}` : `New Invoice #${newInvoice.number}`}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ background: '#F8FAFC', padding: '1.5rem' }}>
          {selectedInvoice
            ? <EditInvoiceForm handleCloseModal={handleCloseModal} fetchInvoices={fetchInvoices}
                selectedInvoice={selectedInvoice} setSelectedInvoice={setSelectedInvoice}
                price={PRICE_PER_HOUR} walletAddress={walletAddress} />
            : <CreateInvoiceForm handleCloseModal={handleCloseModal} fetchInvoices={fetchInvoices}
                newInvoice={newInvoice} setNewInvoice={setNewInvoice}
                price={PRICE_PER_HOUR} />
          }
        </Modal.Body>
      </Modal.Dialog>
    </Modal>
  );
}

export default InvoiceModal;
