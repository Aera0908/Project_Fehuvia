# Fehuvia Open Finance Workstation

Fehuvia is a Web3 financial co-pilot and SME payment portal designed to give small businesses in Southeast Asia and the Philippines the premium treasury tools typically reserved for large enterprises. By combining AI-driven predictive cashflow forecasting with near-instant stablecoin settlements on the Morph Layer 2 network, Fehuvia transforms reactive accounting into proactive, borderless treasury and wealth management.

This repository contains the complete codebase for the Fehuvia Workstation, including the frontend React application, the Node.js/Express backend API, blockchain event listener daemon, and Solidity smart contracts.

---

## Table of Contents

1. System Overview
2. Key Features
3. Technology Stack
4. Project Architecture and Directory Structure
5. Smart Contract Specifications
6. Database Schema and Seeding
7. Local Setup and Installation
8. Environment Configurations
9. API Reference
10. Production Deployment Blueprint

---

## 1. System Overview

SMEs in emerging markets frequently struggle with cashflow volatility exacerbated by high corporate banking fees, reactive budgeting tools, and 3-day bank settlement delays. Fehuvia addresses these pain points by offering:

* Cash Runway Analytics: Dynamic 30-day forecasting that analyzes incoming and outgoing transactions to calculate day-by-day cash runways.
* AI Invoice Auditing: Automation that uses Large Language Models to evaluate invoices and recommend whether to pay immediately, delay payment, or review manually based on projected cash buffers.
* Instant Settlements: Web3 invoice payments utilizing standard ERC-20 stablecoins on the Morph Layer 2 testnet, enabling sub-cent gas fees and instant block finality.
* Automated Gas Dispensing: An intelligent backend faucet that automatically drips gas to connected wallets if they fall below operational thresholds.
* Relational Synchronization: Active background daemons that monitor blockchain logs and synchronize decentralized payment states with traditional PostgreSQL tables.

---

## 2. Key Features

### AI Cashflow Co-Pilot and Runway Analytics
The workstation queries transaction histories, pending payables (invoices), and client receivables to construct a rich context layer. This data is passed into OpenAI GPT models via Retrieval-Augmented Generation (RAG) to generate strategic CFO insights, forecast runway metrics, and categorize invoices.

### Instant Web3 B2B Settlements
Operators can authorize and execute invoice payments directly from their browser wallets (MetaMask, Rabby, etc.). The system routes funds securely through EVM contracts from the buyer to the supplier's on-chain address.

### Fiat-to-Token Bridge
Fehuvia provides a simulated bridge interface to swap traditional GCash peso balances into Mock USDC (mUSDC) and vice-versa, allowing users to move fluidly between traditional cash accounts and Web3 settlement rails.

### Background Gas Dispenser (Faucet)
To ensure frictionless onboarding for non-crypto-native operators, the backend monitors connected wallet balances. If a connected address has less than 0.005 ETH, the backend Vault automatically signs and broadcasts a transaction transferring 0.002 ETH to the user for gas.

### OCR Invoice Scanner
Operators can scan PDF/image invoices to extract characters, vendors, and totals. The system automatically processes details to populate invoice creation records.

---

## 3. Technology Stack

### Frontend
* React (Vite-based Single Page Application)
* Tailwind CSS for styling
* Lucide React for iconography
* Recharts for cashflow telemetry graphs
* Ethers.js (v6) for Web3 wallet providers and contract interaction

### Backend API
* Node.js and Express
* Ethers.js (v5) for blockchain interaction and event logs daemon
* OpenAI Node SDK for GPT prompt routing
* pg (node-postgres) driver for PostgreSQL communication
* Bcryptjs and JSON Web Tokens (JWT) for secure authentication

### Database
* PostgreSQL (relational structure for users, invoices, logs, and relationships)

### Smart Contracts
* Solidity (0.8.24)
* Hardhat toolchain for development, testing, and deployment
* OpenZeppelin Contracts (ERC20 standard interface)
* Deployed on Morph Layer 2 Testnet (Chain ID: 2910)

---

## 4. Project Architecture and Directory Structure

The repository is organized into three principal sub-applications:

```
project-fehux/
|-- backend/               # Node.js/Express API Server & Event Daemon
|   |-- auth.js            # JWT Validation & Encryption middleware
|   |-- db.js              # Postgres client pool configuration
|   |-- index.js           # REST Endpoints & Database seeding
|   |-- listener.js        # Blockchain Event Daemon
|   |-- migrate.js         # Automated schema migration helper
|   |-- schema.sql         # SQL table generation instructions
|-- contracts/             # Solidity Smart Contracts Suite
|   |-- contracts/         # Contract source code
|   |   |-- B2BSettlement.sol # Invoice settlement contract logic
|   |   |-- MockUSDC.sol      # ERC-20 Stablecoin simulator
|   |-- scripts/           # Deployment & Verification utility scripts
|   |-- hardhat.config.js  # Network configurations
|-- frontend/              # Vite React Single Page Application (UI)
|   |-- src/               # Component layouts, CSS, and views
|   |   |-- components/    # Layout, Sidebar, Footer, and Modals
|   |   |-- index.css      # Core styles & Tailwind directives
|   |-- vercel.json        # Redirect configurations for Vercel
|-- plans/                 # Technical documentation and system designs
|-- render.yaml            # Render Blueprint deployment definition
|-- run-workstation.bat    # Windows Controller Batch Script
```

### End-to-End Operational Flow
1. Operator requests predictions from the React Dashboard.
2. Express backend queries the PostgreSQL database for invoice history and company profiles.
3. Express backend feeds transaction context to OpenAI GPT-4o-mini using dynamic prompts.
4. AI generates a JSON payload classifying pending invoices as Safe, Delay, or Review.
5. React dashboard displays the telemetry forecasts and action tags.
6. Operator initiates settlement on a Safe invoice via MetaMask.
7. Wallet signs the transaction and calls the B2BSettlement smart contract on Morph L2.
8. Smart contract pulls Mock USDC from the buyer and sends it to the supplier, emitting a PaymentSettled event.
9. Backend event listener daemon intercepts the log from the RPC node.
10. Backend marks the invoice as settled in PostgreSQL and updates the client dashboard.

---

## 5. Smart Contract Specifications

Solidity contracts are compiled and verified on the Morph Layer 2 Testnet.

### Deployed Contract Addresses

* MockUSDC Contract: 0xD8FCA101505D9F698485B22dCC79dF2Ec7a24660
* B2BSettlement Contract: 0xFc2Cc77640Ba5dEccD22BA0045a698b504871d95

### MockUSDC.sol
Implements a standard ERC-20 stablecoin configured with 6 decimals (matching real-world USDC). It exposes a public minting function for testing:
```solidity
function mint(address to, uint256 amount) external;
```
This enables sandbox accounts to request stablecoins directly via the workstation bridge interface.

### B2BSettlement.sol
Coordinates atomic invoice settlements by transferring USDC from the buyer to the supplier's address:
```solidity
function settleInvoice(
    string calldata invoiceId,
    address supplier,
    uint256 amount
) external;
```
To prevent double-spend or duplicate invoice payments, the contract records settled invoice IDs in a private mapping. Upon execution, it emits a PaymentSettled event parsed by the backend listener daemon.

---

## 6. Database Schema and Seeding

The backend server maintains state records using five relational PostgreSQL tables:

1. users: Handles logins, profile properties, aggregate wallet states, and linked bank lists.
2. suppliers: Records vendor business directories, corresponding email targets, and linked wallet addresses.
3. invoices: Manages billing lists, tracking unique ID codes, amounts, issue dates, due dates, transaction hashes, and cached AI flags.
4. ai_recommendations: Captures historical audits generated by the co-pilot engine for analytics.
5. transactions: Tracks financial logs for traditional bank bridge mints and Web3 invoice settlements.

### Automated Demo Account Seeding
If a user registers or logs in with the reserved email: demo@fehuvia.com, the backend automatically performs a clean setup process:
* Resets the database state for the account (clears old records).
* Seeds 11 structured invoices matching registered suppliers (e.g. Morph Logistics, Cyber Audit, Apex Telecom).
* Restores the GCash Operating Balance to 12.5M PHP and portfolio value to 15.0M PHP.
* Populates mock transaction logs to display comprehensive telemetry graphs on initial login.

The backend also seeds default peer merchant profiles (e.g., morph@fehuvia.com, cyber@fehuvia.com) with pre-configured wallet addresses to enable peer-to-peer invoice payment routing.

---

## 7. Local Setup and Installation

### Prerequisites
* Node.js v18.0.0 or higher
* PostgreSQL Database
* A MetaMask browser wallet extension configured for the Morph L2 Testnet

### Windows Automatic Startup
For developers on Windows, you can start the entire local suite (Hardhat node, Express backend, and Vite frontend) in separate command shells using the batch script:
```bash
.\run-workstation.bat
```

### Manual Individual Component Setup

#### 1. Setup Local Blockchain Node (Contracts)
```bash
cd contracts
npm install
# Compile Solidity contracts
npx hardhat compile
# Run local Hardhat node
npx hardhat node
```

#### 2. Run API Server (Backend)
```bash
cd backend
npm install
# Execute table schema migrations
node migrate.js
# Start backend server
node index.js
```

#### 3. Run Web Workstation (Frontend)
```bash
cd frontend
npm install
# Start local development server
npm run dev
```
The workstation will be available at http://localhost:5173.

---

## 8. Environment Configurations

Create the appropriate configuration files in their respective folders.

### Backend Configurations (backend/.env)
```env
PORT=3001
DATABASE_URL=postgresql://user:password@localhost:5432/fehuvia
JWT_SECRET=your_jwt_secret_key_here
OPENAI_API_KEY=sk-proj-xxxx...
MORPH_TESTNET_RPC=https://rpc-hoodi.morph.network
USDC_CONTRACT_ADDRESS=0xD8FCA101505D9F698485B22dCC79dF2Ec7a24660
SETTLEMENT_CONTRACT_ADDRESS=0xFc2Cc77640Ba5dEccD22BA0045a698b504871d95
PRIVATE_KEY=your_gas_dispenser_vault_private_key
FRONTEND_URL=http://localhost:5173
```

### Frontend Configurations (frontend/.env)
```env
VITE_API_BASE=http://localhost:3001
VITE_USDC_CONTRACT_ADDRESS=0xD8FCA101505D9F698485B22dCC79dF2Ec7a24660
VITE_SETTLEMENT_CONTRACT_ADDRESS=0xFc2Cc77640Ba5dEccD22BA0045a698b504871d95
```

### Contract Configurations (contracts/.env)
```env
PRIVATE_KEY=your_deployer_wallet_private_key
MORPH_TESTNET_RPC=https://rpc-hoodi.morph.network
```

---

## 9. API Reference

All requests must include a Bearer JWT Token in the Authorization header except Auth routes.

### Authentication Endpoints

* POST /api/auth/signup: Register a new account. Enforces a password policy requiring a minimum of 8 characters, 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character.
* POST /api/auth/login: Login to a user account. Using demo@fehuvia.com logs into the presentation account, resetting its seed data.
* GET /api/auth/me: Retrieve active profile properties.
* POST /api/auth/onboarding: Save onboarding preferences (risk profile, automation level, Web3 address).
* POST /api/auth/wallet: Update the user's active Web3 wallet address.
* POST /api/auth/link-bank: Connect traditional banks (GCash, BDO, BPI) via mock Open Finance.
* POST /api/auth/disconnect-bank: Remove bank integrations and reset operating cash balance.
* POST /api/auth/reset-demo: Manual database seed refresh endpoint for demo accounts.

### Invoice Endpoints

* GET /api/invoices: Retrieve the active list of user-generated invoices.
* POST /api/invoices: Save a new invoice to the database.
* POST /api/invoices/scan: Scan a PDF/image file to extract supplier and payment amounts via heuristics.
* POST /api/invoices/:id/schedule: Change invoice status to "scheduled" and adjust the payment date.
* POST /api/invoices/:id/settle: Update status to "settled" and record the transaction hash.
* GET /api/payments: Fetch historic list of settled invoices.

### Treasury and Blockchain Endpoints

* GET /api/cashflow/prediction: Generate a 30-day runway forecast, strategic copilot insights, and recommendations using RAG.
* POST /api/bridge/convert: Mint or burn Mock USDC to move capital between traditional GCash fiat balances and Web3 stablecoins.
* POST /api/faucet/drip: Request a gas dispense transaction (0.002 ETH) for an active user wallet.
* GET /api/transactions: Query unified transaction history logs.

---

## 10. Production Deployment Blueprint

This project is configured for rapid multi-service deployment.

### Backend API on Render
1. Create a Web Service on Render pointing to your backend root folder (backend).
2. Configure the deployment settings:
   * Build Command: npm install
   * Start Command: node index.js
3. Link a PostgreSQL instance (either Render PostgreSQL or Supabase).
4. Populate Environment Variables matching backend/.env. Render automatically injects generated JWT_SECRET and DATABASE_URL if configured via blueprint.
5. Refer to render.yaml for automated infrastructure setup.

### Frontend Web App on Vercel
1. Create a project on Vercel pointing to the frontend repository folder (frontend).
2. Populate Environment Variables (VITE_API_BASE, VITE_USDC_CONTRACT_ADDRESS, VITE_SETTLEMENT_CONTRACT_ADDRESS).
3. Vercel automatically reads vercel.json to resolve router redirects back to index.html.
