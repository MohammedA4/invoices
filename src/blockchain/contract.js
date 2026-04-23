import { ethers } from 'ethers';
import ABI from './InvoicePaymentABI.json';

export const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS || '';

export const getProvider = () => new ethers.BrowserProvider(window.ethereum);

export const getContract = (signer) => new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

// Convert invoice TTP (USD) to ETH in wei for testnet demo
// $1 = 0.00001 ETH, so $100 = 0.001 ETH
export const ttpToWei = (ttp) => ethers.parseEther((ttp / 100000).toFixed(8));
