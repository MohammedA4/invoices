import React, { useState } from 'react';
import axios from 'axios';
import { Button, Form, Row, Col, InputGroup, Accordion, Spinner, Alert } from "react-bootstrap";
import { getProvider, getContract, ttpToWei } from '../../../blockchain/contract';

const API_URL = 'http://localhost:8080/invoice';
const WORKING_DAYS = 22;

function EditInvoiceForm({ handleCloseModal, fetchInvoices, selectedInvoice, setSelectedInvoice, price, walletAddress }) {

  const [txLoading, setTxLoading] = useState(false);
  const [txMsg, setTxMsg] = useState('');

  const updateField = (field, value) => {
    const updated = { ...selectedInvoice };
    const entry = { ...selectedInvoice.invoiceEntries[0] };

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
    <Form className="ps-1">
      <Row>
        <Col sm={9}>
          <Row className="mb-3">
            <Col xs={2}>
              <Form.Label>Number</Form.Label>
              <Form.Control type="number" value={selectedInvoice.number}
                onChange={e => updateField('number', e.target.value)} />
            </Col>
            <Col xs={4}>
              <Form.Label>Date</Form.Label>
              <Form.Control type="date" value={selectedInvoice.date}
                onChange={e => updateField('date', e.target.value)} />
            </Col>
            <Col xs={4}>
              <Form.Label>Status</Form.Label>
              <Form.Select value={selectedInvoice.status || 'Pending'}
                onChange={e => updateField('status', e.target.value)}>
                <option>Pending</option>
                <option>Paid</option>
                <option>Cancelled</option>
              </Form.Select>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col xs={4}>
              <Form.Label>Period</Form.Label>
              <Form.Control type="month" value={selectedInvoice.period}
                onChange={e => updateField('period', e.target.value)} />
            </Col>
            <Col xs={{ span: 3, offset: 2 }}>
              <Form.Label>Vacations/holidays</Form.Label>
              <InputGroup>
                <Form.Control type="number" value={selectedInvoice.vacations}
                  onChange={e => updateField('vacations', e.target.value)} />
                <InputGroup.Text>days</InputGroup.Text>
              </InputGroup>
            </Col>
            <Col xs={3}>
              <Form.Label>Days worked</Form.Label>
              <InputGroup>
                <Form.Control type="number" disabled value={selectedInvoice.workdays} />
                <InputGroup.Text>days</InputGroup.Text>
              </InputGroup>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col>
              <Form.Label>Payer Wallet Address</Form.Label>
              <Form.Control type="text" placeholder="0x..."
                value={selectedInvoice.walletAddress || ''}
                onChange={e => updateField('walletAddress', e.target.value)} />
            </Col>
          </Row>

          <Row>
            <p className="h5 text-primary m-3">Invoice entries</p>
          </Row>
          <Row className="mb-3">
            <Accordion defaultActiveKey="0">
              <Accordion.Item eventKey="0">
                <Accordion.Header>{entry?.serviceName || 'Entry'}</Accordion.Header>
                <Accordion.Body className='ps-2 pe-2'>
                  <Row className="mb-3">
                    <Form.Label>Service name</Form.Label>
                    <Form.Control type="text" placeholder="Describe the service..."
                      value={entry?.serviceName || ''}
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
                        <Form.Control type="number" value={entry?.quantity || 0}
                          onChange={e => updateField('quantity', e.target.value)} />
                        <InputGroup.Text>hrs</InputGroup.Text>
                      </InputGroup>
                    </Col>
                    <Col xs={4}>
                      <Form.Label>Cost</Form.Label>
                      <InputGroup>
                        <Form.Control type="number" disabled value={entry?.cost || 0} />
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
                <Form.Control type="number" disabled value={selectedInvoice.total} />
                <InputGroup.Text>$</InputGroup.Text>
              </InputGroup>
            </Col>
            <Col xs={3}>
              <Form.Label>VAT</Form.Label>
              <InputGroup>
                <Form.Control type="number" value={selectedInvoice.vat}
                  onChange={e => updateField('vat', e.target.value)} />
                <InputGroup.Text>%</InputGroup.Text>
              </InputGroup>
            </Col>
            <Col xs={{ span: 4, offset: 1 }}>
              <Form.Label>Total to pay</Form.Label>
              <InputGroup>
                <Form.Control type="number" disabled value={Number(selectedInvoice.ttp).toFixed(2)} />
                <InputGroup.Text>$</InputGroup.Text>
              </InputGroup>
            </Col>
          </Row>
        </Col>

        <Col className="border-start">
          <div className="d-grid gap-2">
            <Button variant="primary" className="mb-2" onClick={updateInvoice}>Save</Button>
            <Button variant="primary" className="mb-2" disabled>Generate PDF</Button>

            <hr />
            <p className="text-muted mb-1" style={{ fontSize: '0.8rem' }}>Blockchain</p>

            {!selectedInvoice.txHash ? (
              <Button variant="warning" className="mb-2" onClick={registerOnChain} disabled={txLoading}>
                {txLoading ? <Spinner size="sm" className="me-1" /> : null}
                Register on Chain
              </Button>
            ) : selectedInvoice.status !== 'Paid' ? (
              <Button variant="success" className="mb-2" onClick={payOnChain} disabled={txLoading}>
                {txLoading ? <Spinner size="sm" className="me-1" /> : null}
                Pay Invoice (ETH)
              </Button>
            ) : (
              <Button variant="success" className="mb-2" disabled>✓ Paid on Chain</Button>
            )}

            {txMsg && (
              <Alert variant={txMsg.startsWith('Error') ? 'danger' : 'info'} className="p-2 mt-1" style={{ fontSize: '0.75rem' }}>
                {txMsg}
              </Alert>
            )}

            <Button variant="danger" className="mb-2 mt-3" onClick={deleteInvoice}>Delete</Button>
          </div>
        </Col>
      </Row>
    </Form>
  );
}

export default EditInvoiceForm;
