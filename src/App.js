import React, { useState, useEffect } from 'react';
import axios from 'axios';
import InvoiceList from './components/invoice/list/InvoiceList';
import InvoicePagination from './components/invoice/InvoicePagination';
import InvoiceSideMenu from './components/invoice/InvoiceSideMenu';
import InvoiceModal from './components/invoice/InvoiceModal';
import { Container, Button, Badge } from "react-bootstrap";
import { PlusLg, List, Wallet2 } from "react-bootstrap-icons";
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
    if (!window.ethereum) return alert('MetaMask is not installed. Please install it to use blockchain features.');
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    setWalletAddress(accounts[0]);
  };

  // Keep wallet in sync if user switches accounts in MetaMask
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
    <Container fluid className='h-100'>
      <Button variant="light" size="lg" onClick={() => setShowMenu(true)}
        className='p-3 mx-2 border border-1 rounded-circle shadow position-fixed' style={{ zIndex: 10 }}>
        <List size='30' className='text-black-50' />
      </Button>

      <InvoiceSideMenu showMenu={showMenu} setShowMenu={setShowMenu}
        totalInvoices={invoices.length} totalEarned={totalEarned}
        statusCounts={statusCounts} walletAddress={walletAddress} />

      <div className='w-75 mx-auto mt-3 border border-1 rounded-3 shadow' style={{ minHeight: "95vh" }}>
        <header className='p-4 d-flex justify-content-between align-items-center'>
          <h1>Invoices</h1>
          <div className='d-flex gap-2 align-items-center'>
            {walletAddress
              ? <Badge bg="success" className='p-2'>
                  <Wallet2 className='me-1' />
                  {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                </Badge>
              : <Button variant="outline-secondary" onClick={connectWallet} className='ps-3 pe-3'>
                  <Wallet2 className='me-1' /> Connect Wallet
                </Button>
            }
            <Button variant="primary" onClick={openModalForCreate} className='ps-3 pe-4'>
              <PlusLg /> Create
            </Button>
          </div>
        </header>

        <InvoiceList invoices={paginatedInvoices} openModalForEdit={openModalForEdit}
          openModalForCreate={openModalForCreate} />

        <InvoicePagination currentPage={safePage} totalPages={totalPages} onPageChange={setCurrentPage} />
      </div>

      <InvoiceModal invoices={invoices} setInvoices={setInvoices}
        selectedInvoice={selectedInvoice} setSelectedInvoice={setSelectedInvoice}
        showModal={showModal} setShowModal={setShowModal}
        fetchInvoices={fetchInvoices} walletAddress={walletAddress} />
    </Container>
  );
}

export default App;
