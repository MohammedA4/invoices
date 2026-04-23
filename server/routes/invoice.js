const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const DATA_FILE = path.join(__dirname, '../data/invoices.json');

const readInvoices = () => {
  if (!fs.existsSync(DATA_FILE)) return [];
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
};

const saveInvoices = (invoices) => {
  fs.writeFileSync(DATA_FILE, JSON.stringify(invoices, null, 2));
};

router.get('/all', (req, res) => {
  res.json(readInvoices());
});

router.post('/', (req, res) => {
  const invoices = readInvoices();
  const invoice = { ...req.body, id: Date.now() };
  invoices.push(invoice);
  saveInvoices(invoices);
  res.status(201).json(invoice);
});

router.put('/:id', (req, res) => {
  const invoices = readInvoices();
  const idx = invoices.findIndex(i => i.id === Number(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Invoice not found' });
  invoices[idx] = { ...req.body, id: Number(req.params.id) };
  saveInvoices(invoices);
  res.json(invoices[idx]);
});

router.delete('/:id', (req, res) => {
  const invoices = readInvoices();
  const filtered = invoices.filter(i => i.id !== Number(req.params.id));
  if (filtered.length === invoices.length) return res.status(404).json({ error: 'Invoice not found' });
  saveInvoices(filtered);
  res.status(204).send();
});

module.exports = router;
