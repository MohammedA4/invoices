# InvoiceDApp

A Hybrid Invoice Decentralised Application (DApp) built with React, Express.js, and Ethereum smart contracts. Invoices are managed through a web interface and can be registered and paid on the Ethereum Sepolia testnet via MetaMask.

---

## Features

- Create, edit, and delete invoices with a clean form UI
- Work period tracking with automatic day calculation (including weekends)
- Vacation/holiday deduction from total days
- VAT calculation and total-to-pay summary
- Invoice status management: Pending, Paid, Cancelled
- Paginated invoice list with status badges
- Statistics sidebar (total earned, status breakdown)
- MetaMask wallet connection
- **Register invoice on Ethereum Sepolia blockchain**
- **Pay invoice in ETH via smart contract**
- Auto network switch to Sepolia when using blockchain features
- Data persisted via a local Express REST API (JSON file storage)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, React-Bootstrap, Bootstrap 5 |
| Icons | react-bootstrap-icons |
| HTTP Client | Axios |
| Backend API | Express.js (Node.js), CORS |
| Storage | JSON file (`server/data/invoices.json`) |
| Blockchain | Solidity ^0.8.20, Hardhat, ethers.js v6 |
| Wallet | MetaMask (injected provider) |
| Network | Ethereum Sepolia Testnet |

---

## Project Structure

```
invoices/
├── public/
│   └── index.html              # App shell, Inter font
├── src/
│   ├── App.js                  # Root component, navbar, wallet connect
│   ├── App.css                 # Custom design system
│   ├── index.css               # Global styles, modal overrides
│   ├── blockchain/
│   │   ├── contract.js         # ethers.js provider/contract helpers
│   │   └── InvoicePaymentABI.json
│   └── components/invoice/
│       ├── InvoiceModal.js     # Create / Edit modal wrapper
│       ├── InvoiceSideMenu.js  # Stats offcanvas sidebar
│       ├── InvoicePagination.js
│       ├── forms/
│       │   ├── CreateInvoiceForm.js
│       │   └── EditInvoiceForm.js  # Includes blockchain actions
│       └── list/
│           ├── InvoiceList.js
│           └── InvoiceListItem.js
├── server/
│   ├── index.js                # Express server (port 8080)
│   ├── routes/invoice.js       # REST API: GET /all, POST, PUT, DELETE
│   └── data/invoices.json      # Persistent data store
├── blockchain/
│   ├── contracts/
│   │   └── InvoicePayment.sol  # Solidity smart contract
│   ├── scripts/
│   │   └── deploy.js           # Hardhat deploy script
│   ├── hardhat.config.js
│   └── package.json
├── .env                        # REACT_APP_CONTRACT_ADDRESS
└── package.json
```

---

## Prerequisites

- [Node.js](https://nodejs.org/) v16 or later
- [MetaMask](https://metamask.io/) browser extension
- Sepolia testnet ETH (get from [Alchemy Faucet](https://sepoliafaucet.com/))

---

## Setup & Installation

### 1. Clone and install dependencies

```bash
git clone <repo-url>
cd invoices
npm install
```

### 2. Configure environment variables

Create a `.env` file in the project root:

```
REACT_APP_CONTRACT_ADDRESS=0xe02C3Cd4428383936cd30800a1Dda5bE2f4b27CC
```

> The contract is already deployed on Sepolia at the address above. You do not need to redeploy unless you want to run your own instance.

### 3. Run the app (frontend + backend together)

```bash
npm run dev
```

This starts:
- React frontend at `http://localhost:3000`
- Express API at `http://localhost:8080`

Or run them separately:

```bash
npm start        # React frontend only
npm run server   # Express backend only
```

---

## Smart Contract

**Contract:** `InvoicePayment.sol`  
**Network:** Ethereum Sepolia Testnet  
**Address:** `0xe02C3Cd4428383936cd30800a1Dda5bE2f4b27CC`

### Functions

| Function | Description |
|---|---|
| `registerInvoice(invoiceId, amount)` | Register an invoice on-chain with an ETH amount |
| `payInvoice(invoiceId)` | Pay a registered invoice (exact ETH amount required) |
| `getInvoice(invoiceId)` | Read invoice details: amount, recipient, paid status |

### Events

| Event | Emitted when |
|---|---|
| `InvoiceRegistered(invoiceId, recipient, amount)` | Invoice is registered |
| `InvoicePaid(invoiceId, payer, amount)` | Invoice is paid |

---

## Blockchain Workflow

1. **Connect Wallet** — click "Connect Wallet" in the navbar (MetaMask required)
2. **Create an invoice** — fill in all fields including a total-to-pay greater than 0
3. **Register on Chain** — opens MetaMask to confirm a transaction that registers the invoice on Sepolia
4. **Pay Invoice ETH** — sends the exact ETH amount to the contract; status updates to Paid automatically

> The app will prompt MetaMask to switch to Sepolia automatically if you are on a different network.

---

## REST API

Base URL: `http://localhost:8080/invoice`

| Method | Endpoint | Description |
|---|---|---|
| GET | `/all` | Fetch all invoices |
| POST | `/` | Create a new invoice |
| PUT | `/:id` | Update an invoice by ID |
| DELETE | `/:id` | Delete an invoice by ID |

---

## Redeploying the Smart Contract (optional)

If you want to deploy your own contract instance:

```bash
cd blockchain
npm install
```

Create `blockchain/.env`:

```
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/<YOUR_KEY>
PRIVATE_KEY=<YOUR_WALLET_PRIVATE_KEY>
```

```bash
npx hardhat compile
npx hardhat run scripts/deploy.js --network sepolia
```

Copy the printed address into the root `.env` as `REACT_APP_CONTRACT_ADDRESS`.

---

## npm Scripts

| Script | Description |
|---|---|
| `npm start` | Run React frontend only |
| `npm run server` | Run Express backend only |
| `npm run dev` | Run both concurrently |
| `npm run build` | Production build |
| `npm test` | Run tests |
