import React, { useState } from 'react';
import { Modal } from "react-bootstrap";
import CreateInvoiceForm from './forms/CreateInvoiceForm';
import EditInvoiceForm from './forms/EditInvoiceForm';

const PRICE_PER_HOUR = 23;

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
      period,
      vacations: 0,
      workdays: 22,
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
        <Modal.Header closeButton>
          <Modal.Title>
            Invoice #{selectedInvoice ? selectedInvoice.number : newInvoice.number}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
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
