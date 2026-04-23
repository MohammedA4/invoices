import React from 'react';
import axios from 'axios';
import { Button, Form, Row, Col, InputGroup, Accordion } from "react-bootstrap";

const API_URL = 'http://localhost:8080/invoice';
const WORKING_DAYS = 22;

function CreateInvoiceForm({ handleCloseModal, fetchInvoices, newInvoice, setNewInvoice, price }) {

  const updateField = (field, value) => {
    const updated = { ...newInvoice };
    const entry = { ...newInvoice.invoiceEntries[0] };

    if (field === 'vacations') {
      updated.vacations = Number(value);
      updated.workdays = Math.max(0, WORKING_DAYS - Number(value));
    } else if (field === 'quantity') {
      entry.quantity = Number(value);
      entry.cost = Number(value) * price;
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
    <Form className="ps-1">
      <Row>
        <Col sm={9}>
          <Row className="mb-3">
            <Col xs={2}>
              <Form.Label>Number</Form.Label>
              <Form.Control type="number" value={newInvoice.number}
                onChange={e => updateField('number', e.target.value)} />
            </Col>
            <Col xs={4}>
              <Form.Label>Date</Form.Label>
              <Form.Control type="date" value={newInvoice.date}
                onChange={e => updateField('date', e.target.value)} />
            </Col>
            <Col xs={4}>
              <Form.Label>Status</Form.Label>
              <Form.Select value={newInvoice.status} onChange={e => updateField('status', e.target.value)}>
                <option>Pending</option>
                <option>Paid</option>
                <option>Cancelled</option>
              </Form.Select>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col xs={4}>
              <Form.Label>Period</Form.Label>
              <Form.Control type="month" value={newInvoice.period}
                onChange={e => updateField('period', e.target.value)} />
            </Col>
            <Col xs={{ span: 3, offset: 2 }}>
              <Form.Label>Vacations/holidays</Form.Label>
              <InputGroup>
                <Form.Control type="number" value={newInvoice.vacations}
                  onChange={e => updateField('vacations', e.target.value)} />
                <InputGroup.Text>days</InputGroup.Text>
              </InputGroup>
            </Col>
            <Col xs={3}>
              <Form.Label>Days worked</Form.Label>
              <InputGroup>
                <Form.Control type="number" disabled value={newInvoice.workdays} />
                <InputGroup.Text>days</InputGroup.Text>
              </InputGroup>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col>
              <Form.Label>Payer Wallet Address</Form.Label>
              <Form.Control type="text" placeholder="0x..."
                value={newInvoice.walletAddress}
                onChange={e => updateField('walletAddress', e.target.value)} />
            </Col>
          </Row>

          <Row>
            <p className="h5 text-primary m-3">Invoice entries</p>
          </Row>
          <Row className="mb-3">
            <Accordion defaultActiveKey="0">
              <Accordion.Item eventKey="0">
                <Accordion.Header>{entry.serviceName || 'New entry'}</Accordion.Header>
                <Accordion.Body className='ps-2 pe-2'>
                  <Row className="mb-3">
                    <Form.Label>Service name</Form.Label>
                    <Form.Control type="text" placeholder="Describe the service..."
                      value={entry.serviceName}
                      onChange={e => updateField('serviceName', e.target.value)} />
                  </Row>
                  <Row>
                    <Col xs={4}>
                      <Form.Label>Price / hr</Form.Label>
                      <InputGroup>
                        <Form.Control type="number" value={price} disabled />
                        <InputGroup.Text>$</InputGroup.Text>
                      </InputGroup>
                    </Col>
                    <Col xs={4}>
                      <Form.Label>Quantity</Form.Label>
                      <InputGroup>
                        <Form.Control type="number" value={entry.quantity}
                          onChange={e => updateField('quantity', e.target.value)} />
                        <InputGroup.Text>hrs</InputGroup.Text>
                      </InputGroup>
                    </Col>
                    <Col xs={4}>
                      <Form.Label>Cost</Form.Label>
                      <InputGroup>
                        <Form.Control type="number" disabled value={entry.cost} />
                        <InputGroup.Text>$</InputGroup.Text>
                      </InputGroup>
                    </Col>
                  </Row>
                </Accordion.Body>
              </Accordion.Item>
            </Accordion>
          </Row>

          <Row className="mb-5">
            <Col xs={4}>
              <Form.Label>Total</Form.Label>
              <InputGroup>
                <Form.Control type="number" disabled value={newInvoice.total} />
                <InputGroup.Text>$</InputGroup.Text>
              </InputGroup>
            </Col>
            <Col xs={3}>
              <Form.Label>VAT</Form.Label>
              <InputGroup>
                <Form.Control type="number" value={newInvoice.vat}
                  onChange={e => updateField('vat', e.target.value)} />
                <InputGroup.Text>%</InputGroup.Text>
              </InputGroup>
            </Col>
            <Col xs={{ span: 4, offset: 1 }}>
              <Form.Label>Total to pay</Form.Label>
              <InputGroup>
                <Form.Control type="number" disabled value={Number(newInvoice.ttp).toFixed(2)} />
                <InputGroup.Text>$</InputGroup.Text>
              </InputGroup>
            </Col>
          </Row>
        </Col>

        <Col className="border-start">
          <div className="d-grid gap-2">
            <Button variant="primary" className="mb-2" onClick={createInvoice}>Save</Button>
            <Button variant="primary" className="mb-2" disabled>Generate PDF</Button>
          </div>
        </Col>
      </Row>
    </Form>
  );
}

export default CreateInvoiceForm;
