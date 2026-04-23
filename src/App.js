import React, { useState, useEffect } from 'react';
import axios from 'axios';
import InvoiceList from './components/invoice/list/InvoiceList';
import InvoicePagination from './components/invoice/InvoicePagination';
import InvoiceSideMenu from './components/invoice/InvoiceSideMenu';
import InvoiceModal from './components/invoice/InvoiceModal';
import { Button } from "react-bootstrap";
import { PlusLg, Wallet2, List, FileEarmarkText } from "react-bootstrap-icons";
import './App.css';
import 'bootstrap/dist/css/bootstrap.css';

const API_URL = 'http://localhost:8080/invoice';
const ITEMS_PER_PAGE = 5;

function App() {
  const [invoices, setInvoices] = useState([]);
  const [showMenu, setShowMenu] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [walletAddress, setWalletAddress] = useState('');

  const fetchInvoices = () => {
    axios.get(`${API_URL}/all`)
      .then(res => setInvoices(res.data))
      .catch(err => console.error('Error fetching invoices:', err));
  };

  useEffect(() => { fetchInvoices(); }, []);

  const connectWallet = async () => {
    if (!window.ethereum) return alert('MetaMask is not installed.');
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    setWalletAddress(accounts[0]);
  };

  useEffect(() => {
    if (!window.ethereum) return;
    window.ethereum.on('accountsChanged', (accounts) => {
      setWalletAddress(accounts[0] || '');
    });
  }, []);

  const openModalForEdit = (invoice) => {
    setSelectedInvoice(invoice);
    setShowModal(true);
  };

  const openModalForCreate = () => setShowModal(true);

  const totalPages = Math.max(1, Math.ceil(invoices.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedInvoices = invoices.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE);

  const totalEarned = invoices.reduce((sum, inv) => sum + (Number(inv.ttp) || 0), 0);
  const statusCounts = invoices.reduce((acc, inv) => {
    acc[inv.status] = (acc[inv.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div style={{ minHeight: '100vh', background: '#F1F5F9' }}>

      {/* Navbar */}
      <nav className="app-navbar">
        <div className="app-logo" onClick={() => setShowMenu(true)}>
          <div className="app-logo-icon">
            <FileEarmarkText size={18} />
          </div>
          Invoice Tracker
        </div>
        <div className="d-flex align-items-center gap-2">
          <Button variant="light" size="sm" onClick={() => setShowMenu(true)}
            style={{ border: '1px solid #E2E8F0', borderRadius: '8px', color: '#64748B' }}>
            <List size={18} />
          </Button>
          {walletAddress
            ? <div className="wallet-badge">
                <Wallet2 size={14} />
                {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
              </div>
            : <button className="btn btn-connect" onClick={connectWallet}>
                <Wallet2 size={14} className="me-1" /> Connect Wallet
              </button>
          }
          <button className="btn btn-create" onClick={openModalForCreate}>
            <PlusLg size={16} className="me-1" /> Create Invoice
          </button>
        </div>
      </nav>

      {/* Sidebar */}
      <InvoiceSideMenu showMenu={showMenu} setShowMenu={setShowMenu}
        totalInvoices={invoices.length} totalEarned={totalEarned}
        statusCounts={statusCounts} walletAddress={walletAddress} />

      {/* Main */}
      <div className="main-content">
        <div className="invoice-card">
          <div className="invoice-card-header">
            <h1>Invoices</h1>
            <span style={{ fontSize: '0.85rem', color: '#94A3B8' }}>
              {invoices.length} total
            </span>
          </div>

          <InvoiceList invoices={paginatedInvoices} openModalForEdit={openModalForEdit}
            openModalForCreate={openModalForCreate} />

          <InvoicePagination currentPage={safePage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </div>
      </div>

      <InvoiceModal invoices={invoices} setInvoices={setInvoices}
        selectedInvoice={selectedInvoice} setSelectedInvoice={setSelectedInvoice}
        showModal={showModal} setShowModal={setShowModal}
        fetchInvoices={fetchInvoices} walletAddress={walletAddress} />
    </div>
  );
}

export default App;
