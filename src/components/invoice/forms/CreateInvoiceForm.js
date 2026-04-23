import React from 'react';
import axios from 'axios';
import { Form, Row, Col, InputGroup } from "react-bootstrap";

const API_URL = 'http://localhost:8080/invoice';

const countDays = (from, to) => {
  if (!from || !to) return 0;
  const start = new Date(from);
  const end = new Date(to);
  return Math.max(0, Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1);
};

function CreateInvoiceForm({ handleCloseModal, fetchInvoices, newInvoice, setNewInvoice, price }) {

  const updateField = (field, value) => {
    const updated = { ...newInvoice };
    const entry = { ...newInvoice.invoiceEntries[0] };

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
    setNewInvoice(updated);
  };

  const createInvoice = () => {
    axios.post(API_URL, newInvoice)
      .then(() => { fetchInvoices(); handleCloseModal(); })
      .catch(err => console.error('Error creating invoice:', err));
  };

  const entry = newInvoice.invoiceEntries[0];

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
              <Form.Control type="number" value={newInvoice.number}
                onChange={e => updateField('number', e.target.value)} />
            </Col>
            <Col xs={5}>
              <Form.Label className="form-label-custom">Invoice Date</Form.Label>
              <Form.Control type="date" value={newInvoice.date}
                onChange={e => updateField('date', e.target.value)} />
            </Col>
            <Col xs={4}>
              <Form.Label className="form-label-custom">Status</Form.Label>
              <Form.Select value={newInvoice.status} onChange={e => updateField('status', e.target.value)}>
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
              <Form.Control type="date" value={newInvoice.fromDate || ''}
                onChange={e => updateField('fromDate', e.target.value)} />
            </Col>
            <Col xs={5}>
              <Form.Label className="form-label-custom">To Date</Form.Label>
              <Form.Control type="date" value={newInvoice.toDate || ''}
                min={newInvoice.fromDate || ''}
                onChange={e => updateField('toDate', e.target.value)} />
            </Col>
            <Col xs={2}>
              <Form.Label className="form-label-custom">Days</Form.Label>
              <Form.Control type="number" disabled value={newInvoice.workdays} />
            </Col>
          </Row>
          <Row className="g-3 mt-1">
            <Col xs={4}>
              <Form.Label className="form-label-custom">Vacations / Holidays</Form.Label>
              <InputGroup>
                <Form.Control type="number" value={newInvoice.vacations}
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
                value={entry.serviceName}
                onChange={e => updateField('serviceName', e.target.value)} />
            </Col>
            <Col xs={4}>
              <Form.Label className="form-label-custom">Price / hr</Form.Label>
              <InputGroup>
                <Form.Control type="number" value={newInvoice.pricePerHour ?? price}
                  onChange={e => updateField('pricePerHour', e.target.value)} />
                <InputGroup.Text>$</InputGroup.Text>
              </InputGroup>
            </Col>
            <Col xs={4}>
              <Form.Label className="form-label-custom">Hours</Form.Label>
              <InputGroup>
                <Form.Control type="number" value={entry.quantity}
                  onChange={e => updateField('quantity', e.target.value)} />
                <InputGroup.Text>hrs</InputGroup.Text>
              </InputGroup>
            </Col>
            <Col xs={4}>
              <Form.Label className="form-label-custom">Cost</Form.Label>
              <InputGroup>
                <Form.Control type="number" disabled value={entry.cost} />
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
                <Form.Control type="number" disabled value={newInvoice.total} />
                <InputGroup.Text>$</InputGroup.Text>
              </InputGroup>
            </Col>
            <Col xs={3}>
              <Form.Label className="form-label-custom">VAT</Form.Label>
              <InputGroup>
                <Form.Control type="number" value={newInvoice.vat}
                  onChange={e => updateField('vat', e.target.value)} />
                <InputGroup.Text>%</InputGroup.Text>
              </InputGroup>
            </Col>
            <Col xs={5}>
              <Form.Label className="form-label-custom">Total to Pay</Form.Label>
              <InputGroup>
                <Form.Control type="number" disabled
                  value={Number(newInvoice.ttp).toFixed(2)}
                  style={{ fontWeight: 700, color: '#4F46E5 !important' }} />
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
            value={newInvoice.walletAddress}
            onChange={e => updateField('walletAddress', e.target.value)} />
        </div>

      </div>

      {/* Right — actions */}
      <div style={{ width: '140px', flexShrink: 0 }}>
        <div className="action-panel">
          <div className="action-panel-title">Actions</div>
          <button className="btn-action btn-save" onClick={createInvoice}>Save Invoice</button>
          <button className="btn-action" style={{ background: '#F1F5F9', color: '#94A3B8', cursor: 'not-allowed' }} disabled>
            Generate PDF
          </button>
        </div>
      </div>

    </div>
  );
}

export default CreateInvoiceForm;
