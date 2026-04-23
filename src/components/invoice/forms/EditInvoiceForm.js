import React, { useState } from 'react';
import axios from 'axios';
import { Form, Row, Col, InputGroup, Spinner, Alert } from "react-bootstrap";
import { getProvider, getContract, ttpToWei } from '../../../blockchain/contract';

const API_URL = 'http://localhost:8080/invoice';

const countDays = (from, to) => {
  if (!from || !to) return 0;
  const start = new Date(from);
  const end = new Date(to);
  return Math.max(0, Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1);
};

function EditInvoiceForm({ handleCloseModal, fetchInvoices, selectedInvoice, setSelectedInvoice, price, walletAddress }) {

  const [txLoading, setTxLoading] = useState(false);
  const [txMsg, setTxMsg] = useState('');

  const updateField = (field, value) => {
    const updated = { ...selectedInvoice };
    const entry = { ...selectedInvoice.invoiceEntries[0] };

    if (field === 'fromDate' || field === 'toDate') {
      updated[field] = value;
      const days = countDays(
        field === 'fromDate' ? value : updated.fromDate,
        field === 'toDate' ? value : updated.toDate
      );
      updated.workdays = Math.max(0, days - (updated.vacations || 0));
    } else if (field === 'vacations') {
      updated.vacations = Number(value);
      const days = countDays(updated.fromDate, updated.toDate);
      updated.workdays = Math.max(0, days - Number(value));
    } else if (field === 'pricePerHour') {
      updated.pricePerHour = Number(value);
      entry.cost = entry.quantity * Number(value);
      updated.invoiceEntries = [entry];
      updated.total = entry.cost;
      updated.ttp = entry.cost * (1 + updated.vat / 100);
    } else if (field === 'quantity') {
      entry.quantity = Number(value);
      entry.cost = Number(value) * (updated.pricePerHour ?? price);
      updated.invoiceEntries = [entry];
      updated.total = entry.cost;
      updated.ttp = entry.cost * (1 + updated.vat / 100);
    } else if (field === 'serviceName') {
      entry.serviceName = value;
      updated.invoiceEntries = [entry];
    } else if (field === 'vat') {
      updated.vat = Number(value);
      updated.ttp = updated.total * (1 + Number(value) / 100);
    } else {
      updated[field] = value;
    }
    setSelectedInvoice(updated);
  };

  const updateInvoice = () => {
    axios.put(`${API_URL}/${selectedInvoice.id}`, selectedInvoice)
      .then(() => { fetchInvoices(); handleCloseModal(); })
      .catch(err => console.error('Error updating invoice:', err));
  };

  const deleteInvoice = () => {
    axios.delete(`${API_URL}/${selectedInvoice.id}`)
      .then(() => { fetchInvoices(); handleCloseModal(); })
      .catch(err => console.error('Error deleting invoice:', err));
  };

  const ensureSepolia = async () => {
    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    if (chainId !== '0xaa36a7') {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0xaa36a7' }]
      });
    }
  };

  const registerOnChain = async () => {
    if (!walletAddress) return setTxMsg('Connect your wallet first.');
    if (!selectedInvoice.ttp || selectedInvoice.ttp <= 0) return setTxMsg('Invoice total must be greater than 0.');
    try {
      setTxLoading(true);
      setTxMsg('Waiting for MetaMask confirmation...');
      await ensureSepolia();
      const signer = await getProvider().getSigner();
      const contract = getContract(signer);
      const amountWei = ttpToWei(selectedInvoice.ttp);
      const tx = await contract.registerInvoice(selectedInvoice.id, amountWei);
      setTxMsg('Transaction sent. Waiting for confirmation...');
      await tx.wait();
      const updated = { ...selectedInvoice, txHash: tx.hash };
      await axios.put(`${API_URL}/${selectedInvoice.id}`, updated);
      setSelectedInvoice(updated);
      fetchInvoices();
      setTxMsg(`Registered on chain. Tx: ${tx.hash.slice(0, 12)}...`);
    } catch (err) {
      console.error(err);
      setTxMsg(`Error: ${err.reason || err.message}`);
    } finally {
      setTxLoading(false);
    }
  };

  const payOnChain = async () => {
    if (!walletAddress) return setTxMsg('Connect your wallet first.');
    try {
      setTxLoading(true);
      setTxMsg('Waiting for MetaMask confirmation...');
      await ensureSepolia();
      const signer = await getProvider().getSigner();
      const contract = getContract(signer);
      const [amountWei] = await contract.getInvoice(selectedInvoice.id);
      const tx = await contract.payInvoice(selectedInvoice.id, { value: amountWei });
      setTxMsg('Payment sent. Waiting for confirmation...');
      await tx.wait();
      const updated = { ...selectedInvoice, status: 'Paid' };
      await axios.put(`${API_URL}/${selectedInvoice.id}`, updated);
      setSelectedInvoice(updated);
      fetchInvoices();
      setTxMsg(`Paid on chain. Tx: ${tx.hash.slice(0, 12)}...`);
    } catch (err) {
      console.error(err);
      setTxMsg(`Error: ${err.reason || err.message}`);
    } finally {
      setTxLoading(false);
    }
  };

  const entry = selectedInvoice.invoiceEntries[0];

  return (
    <div className="d-flex gap-3">

      {/* Left — form fields */}
      <div style={{ flex: 1 }}>

        {/* Invoice Info */}
        <div className="form-section">
          <div className="form-section-title">Invoice Details</div>
          <Row className="g-3">
            <Col xs={3}>
              <Form.Label className="form-label-custom">Number</Form.Label>
              <Form.Control type="number" value={selectedInvoice.number}
                onChange={e => updateField('number', e.target.value)} />
            </Col>
            <Col xs={5}>
              <Form.Label className="form-label-custom">Invoice Date</Form.Label>
              <Form.Control type="date" value={selectedInvoice.date}
                onChange={e => updateField('date', e.target.value)} />
            </Col>
            <Col xs={4}>
              <Form.Label className="form-label-custom">Status</Form.Label>
              <Form.Select value={selectedInvoice.status || 'Pending'}
                onChange={e => updateField('status', e.target.value)}>
                <option>Pending</option>
                <option>Paid</option>
                <option>Cancelled</option>
              </Form.Select>
            </Col>
          </Row>
        </div>

        {/* Work Period */}
        <div className="form-section">
          <div className="form-section-title">Work Period</div>
          <Row className="g-3">
            <Col xs={5}>
              <Form.Label className="form-label-custom">From Date</Form.Label>
              <Form.Control type="date" value={selectedInvoice.fromDate || ''}
                onChange={e => updateField('fromDate', e.target.value)} />
            </Col>
            <Col xs={5}>
              <Form.Label className="form-label-custom">To Date</Form.Label>
              <Form.Control type="date" value={selectedInvoice.toDate || ''}
                min={selectedInvoice.fromDate || ''}
                onChange={e => updateField('toDate', e.target.value)} />
            </Col>
            <Col xs={2}>
              <Form.Label className="form-label-custom">Days</Form.Label>
              <Form.Control type="number" disabled value={selectedInvoice.workdays} />
            </Col>
          </Row>
          <Row className="g-3 mt-1">
            <Col xs={4}>
              <Form.Label className="form-label-custom">Vacations / Holidays</Form.Label>
              <InputGroup>
                <Form.Control type="number" value={selectedInvoice.vacations || 0}
                  onChange={e => updateField('vacations', e.target.value)} />
                <InputGroup.Text>days</InputGroup.Text>
              </InputGroup>
            </Col>
          </Row>
        </div>

        {/* Service Entry */}
        <div className="form-section">
          <div className="form-section-title">Service Entry</div>
          <Row className="g-3">
            <Col xs={12}>
              <Form.Label className="form-label-custom">Service Name</Form.Label>
              <Form.Control type="text" placeholder="Describe the service provided..."
                value={entry?.serviceName || ''}
                onChange={e => updateField('serviceName', e.target.value)} />
            </Col>
            <Col xs={4}>
              <Form.Label className="form-label-custom">Price / hr</Form.Label>
              <InputGroup>
                <Form.Control type="number" value={selectedInvoice.pricePerHour ?? price}
                  onChange={e => updateField('pricePerHour', e.target.value)} />
                <InputGroup.Text>$</InputGroup.Text>
              </InputGroup>
            </Col>
            <Col xs={4}>
              <Form.Label className="form-label-custom">Hours</Form.Label>
              <InputGroup>
                <Form.Control type="number" value={entry?.quantity || 0}
                  onChange={e => updateField('quantity', e.target.value)} />
                <InputGroup.Text>hrs</InputGroup.Text>
              </InputGroup>
            </Col>
            <Col xs={4}>
              <Form.Label className="form-label-custom">Cost</Form.Label>
              <InputGroup>
                <Form.Control type="number" disabled value={entry?.cost || 0} />
                <InputGroup.Text>$</InputGroup.Text>
              </InputGroup>
            </Col>
          </Row>
        </div>

        {/* Totals */}
        <div className="form-section">
          <div className="form-section-title">Totals</div>
          <Row className="g-3">
            <Col xs={4}>
              <Form.Label className="form-label-custom">Subtotal</Form.Label>
              <InputGroup>
                <Form.Control type="number" disabled value={selectedInvoice.total} />
                <InputGroup.Text>$</InputGroup.Text>
              </InputGroup>
            </Col>
            <Col xs={3}>
              <Form.Label className="form-label-custom">VAT</Form.Label>
              <InputGroup>
                <Form.Control type="number" value={selectedInvoice.vat}
                  onChange={e => updateField('vat', e.target.value)} />
                <InputGroup.Text>%</InputGroup.Text>
              </InputGroup>
            </Col>
            <Col xs={5}>
              <Form.Label className="form-label-custom">Total to Pay</Form.Label>
              <InputGroup>
                <Form.Control type="number" disabled
                  value={Number(selectedInvoice.ttp).toFixed(2)}
                  style={{ fontWeight: 700 }} />
                <InputGroup.Text>$</InputGroup.Text>
              </InputGroup>
            </Col>
          </Row>
        </div>

        {/* Wallet */}
        <div className="form-section">
          <div className="form-section-title">Blockchain</div>
          <Form.Label className="form-label-custom">Payer Wallet Address</Form.Label>
          <Form.Control type="text" placeholder="0x..."
            value={selectedInvoice.walletAddress || ''}
            onChange={e => updateField('walletAddress', e.target.value)} />
          {selectedInvoice.txHash && (
            <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#64748B' }}>
              Tx: <span style={{ fontFamily: 'monospace', color: '#4F46E5' }}>{selectedInvoice.txHash.slice(0, 20)}...</span>
            </div>
          )}
        </div>

      </div>

      {/* Right — actions */}
      <div style={{ width: '140px', flexShrink: 0 }}>
        <div className="action-panel">
          <div className="action-panel-title">Actions</div>
          <button className="btn-action btn-save" onClick={updateInvoice}>Save Invoice</button>
          <button className="btn-action" style={{ background: '#F1F5F9', color: '#94A3B8', cursor: 'not-allowed' }} disabled>
            Generate PDF
          </button>
        </div>

        <div className="action-panel" style={{ marginTop: '0.75rem' }}>
          <div className="action-panel-title">Blockchain</div>

          {!selectedInvoice.txHash ? (
            <button className="btn-action btn-chain" onClick={registerOnChain} disabled={txLoading}>
              {txLoading ? <Spinner size="sm" className="me-1" /> : null}
              Register on Chain
            </button>
          ) : selectedInvoice.status !== 'Paid' ? (
            <button className="btn-action btn-pay" onClick={payOnChain} disabled={txLoading}>
              {txLoading ? <Spinner size="sm" className="me-1" /> : null}
              Pay Invoice ETH
            </button>
          ) : (
            <button className="btn-action btn-paid-ok" disabled>✓ Paid on Chain</button>
          )}

          {txMsg && (
            <Alert variant={txMsg.startsWith('Error') ? 'danger' : 'info'}
              className="p-2 mt-2" style={{ fontSize: '0.72rem', marginBottom: 0 }}>
              {txMsg}
            </Alert>
          )}

          <button className="btn-action btn-delete" onClick={deleteInvoice}>Delete</button>
        </div>
      </div>

    </div>
  );
}

export default EditInvoiceForm;
