require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const { OpenAI } = require('openai');
const db = require('./db');
const { startListener } = require('./listener');
const { signToken, authenticateJWT } = require('./auth');

const app = express();
app.use(cors());
app.use(express.json());

// Return JSON for malformed API payloads instead of Express's default HTML error page.
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ error: 'Invalid JSON payload.' });
  }

  return next(err);
});

const PORT = process.env.PORT || 3001;

// Global authoritative USD to PHP exchange rate (real-life fallback)
let usdPhpRate = 58.30;

async function updateExchangeRate() {
  try {
    const res = await fetch('https://open.er-api.com/v6/latest/USD');
    const data = await res.json();
    if (data && data.rates && data.rates.PHP) {
      usdPhpRate = Number(data.rates.PHP);
      console.log(`📡 [Exchange Rate Service] Real-time rate loaded: ₱${usdPhpRate.toFixed(4)} PHP per $1.00 USD`);
    }
  } catch (err) {
    console.error('⚠️ [Exchange Rate Service] Failed to fetch real-time exchange rates. Using fallback:', err.message);
  }
}

// Initial fetch on server start
updateExchangeRate();
// Refresh every hour
setInterval(updateExchangeRate, 60 * 60 * 1000);

// Instantiate OpenAI Client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || ''
});

// GET EXCHANGE RATES - Fetch authoritative USD to PHP exchange rate
app.get('/api/rates', async (req, res) => {
  res.json({
    base: 'USD',
    rates: {
      PHP: usdPhpRate
    },
    timestamp: Date.now()
  });
});

// =============================================
// AUTH ENDPOINTS
// =============================================

// SIGNUP - Register a new user
app.post('/api/auth/signup', async (req, res) => {
  const { email, password, username, walletAddress } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters.' });
  }

  try {
    // Check if user already exists
    const existing = await db.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    if (existing.rowCount > 0) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    // Hash the password with bcrypt (12 salt rounds for strong security)
    const passwordHash = await bcrypt.hash(password, 12);

    // Insert the new user
    const insertQuery = `
      INSERT INTO users (username, email, password_hash, wallet_address)
      VALUES ($1, $2, $3, $4)
      RETURNING id, username, email, wallet_address, balance, portfolio_value, created_at
    `;
    const { rows } = await db.query(insertQuery, [
      username || null,
      email.toLowerCase(),
      passwordHash,
      walletAddress || null
    ]);

    const user = rows[0];
    const token = signToken(user);

    console.log(`✅ New user registered: ${user.email}`);

    // Seed default invoices and premium balances ONLY for the admin account
    if (user.email.toLowerCase() === 'admin@fehuvia.com') {
      await db.query(
        'UPDATE users SET balance = 1289401.07, portfolio_value = 2847392.00 WHERE id = $1',
        [user.id]
      );
      user.balance = 1289401.07;
      user.portfolio_value = 2847392.00;

      const defaultSuppliers = [
        { name: 'Morph Logistics Corp', amount: 2500.00, due: '2026-06-02', status: 'safe', reason: 'AI Recommendation: Safe to pay. Cash reserves are projected to remain robust (>45 days runway) even post-settlement.' },
        { name: 'Cyber Security Audit Group', amount: 4500.00, due: '2026-06-08', status: 'delay', reason: 'AI Recommendation: Postpone payment. Upcoming payroll on Jun 5 introduces liquidity risk; delay past Jun 10 to balance inflow.' },
        { name: 'Aera Office Properties', amount: 3500.00, due: '2026-05-30', status: 'safe', reason: 'AI Recommendation: Safe to pay. Critical supply chain vendor. Maintaining good standing prevents logistics delays.' },
        { name: 'Elite Office Materials', amount: 1200.00, due: '2026-06-15', status: 'review', reason: 'AI Recommendation: Review manually. Payment amount matches a duplicate billing range. Validate audit log prior to signing.' }
      ];

      for (let index = 0; index < defaultSuppliers.length; index++) {
        const item = defaultSuppliers[index];
        const supRes = await db.query('SELECT id FROM suppliers WHERE name = $1', [item.name]);
        if (supRes.rowCount > 0) {
          const supplierId = supRes.rows[0].id;
          const invoiceId = `INV-${user.id.substring(0, 4).toUpperCase()}-${String(index + 1).padStart(3, '0')}`;
          await db.query(
            `INSERT INTO invoices (id, user_id, supplier_id, amount, issue_date, due_date, status, ai_status, ai_reason)
             VALUES ($1, $2, $3, $4, CURRENT_DATE - 5, $5, 'pending', $6, $7)`,
            [invoiceId, user.id, supplierId, item.amount, item.due, item.status, item.reason]
          );
        }
      }
    }

    res.status(201).json({
      message: 'Account created successfully.',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        walletAddress: user.wallet_address,
        balance: parseFloat(user.balance),
        portfolioValue: parseFloat(user.portfolio_value),
        createdAt: user.created_at
      }
    });
  } catch (error) {
    console.error('Signup error:', error.message);
    res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
});

// Seeding dummy merchant accounts for presentation & peer-to-peer testing
async function seedMerchantAccounts() {
  const merchants = [
    {
      username: 'Morph Logistics',
      email: 'morph@fehuvia.com',
      wallet: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
      balance: 1500000.00,
      portfolio: 3200000.00
    },
    {
      username: 'Cyber Audit',
      email: 'cyber@fehuvia.com',
      wallet: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
      balance: 2400000.00,
      portfolio: 4800000.00
    },
    {
      username: 'Elite Office',
      email: 'elite@fehuvia.com',
      wallet: '0x90F79bf6EB2c4f870365E785982E1f101E93b906',
      balance: 950000.00,
      portfolio: 2100000.00
    }
  ];

  const passwordHash = await bcrypt.hash('FehuviaDemo2026!', 12);

  for (const m of merchants) {
    try {
      const existing = await db.query('SELECT id FROM users WHERE email = $1', [m.email]);
      if (existing.rowCount === 0) {
        await db.query(
          `INSERT INTO users (username, email, password_hash, wallet_address, balance, portfolio_value, bank_linked, bank_name)
           VALUES ($1, $2, $3, $4, $5, $6, TRUE, 'BDO')`,
          [m.username, m.email, passwordHash, m.wallet, m.balance, m.portfolio]
        );
        console.log(`👤 [Database Seeding] Seeded dummy merchant: ${m.username} (${m.email})`);
      } else {
        await db.query(
          `UPDATE users 
           SET username = $1, wallet_address = $2, balance = $3, portfolio_value = $4, bank_linked = TRUE, bank_name = 'BDO'
           WHERE email = $5`,
          [m.username, m.wallet, m.balance, m.portfolio, m.email]
        );
        console.log(`🔄 [Database Seeding] Reset dummy merchant to pristine state: ${m.username} (${m.email})`);
      }
    } catch (err) {
      console.error(`⚠️ [Database Seeding] Failed to seed merchant ${m.username}:`, err.message);
    }
  }
}

// Pristine database self-refresh helper for presentation Demo accounts
async function seedDemoUser(userId) {
  // Seed the dummy merchant accounts so they exist and are ready for P2P transactions!
  await seedMerchantAccounts();

  // Clear any existing invoices and recommendations for this user to make it fresh on every login!
  await db.query('DELETE FROM invoices WHERE user_id = $1', [userId]);
  await db.query('DELETE FROM ai_recommendations WHERE invoice_id IN (SELECT id FROM invoices WHERE user_id = $1)', [userId]);

  // Ensure balance and demo status is updated
  await db.query(
    `UPDATE users 
     SET 
       balance = 12500000.00, 
       portfolio_value = 15000000.00, 
       bank_linked = TRUE, 
       bank_name = 'GCash',
       wallet_address = '0xdemo7970C51812dc3A010C7d01b50e0d17dc79d0',
       automation_level = 'semi',
       risk_profile = 'balanced',
       linked_banks = '[{"id":"gcash","name":"GCash Corporate Wallet","short":"GCash","balance":12500000.00,"type":"wallet","isLinked":true},{"id":"bdo","name":"Banco de Oro (BDO)","short":"BDO","balance":4500000.00,"type":"bank","isLinked":false},{"id":"ubp","name":"UnionBank of the Philippines","short":"UnionBank","balance":3200000.00,"type":"bank","isLinked":false},{"id":"bpi","name":"Bank of the Philippine Islands (BPI)","short":"BPI","balance":5800000.00,"type":"bank","isLinked":false},{"id":"maya","name":"Maya Business Account","short":"Maya","balance":1200000.00,"type":"wallet","isLinked":false}]'::jsonb
     WHERE id = $1`,
    [userId]
  );

  const defaultSuppliers = [
    { name: 'Morph Logistics', amount: 4500.00, due: '2026-06-02', status: 'safe', reason: 'AI Recommendation: Safe to pay. Cash reserves are projected to remain robust (>45 days runway) even post-settlement.', dest: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8' },
    { name: 'Cyber Audit', amount: 15000.00, due: '2026-06-08', status: 'delay', reason: 'AI Recommendation: Postpone payment. Upcoming payroll on Jun 5 introduces liquidity risk; delay past Jun 10 to balance inflow.', dest: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC' },
    { name: 'Aera Office Properties', amount: 3500.00, due: '2026-05-30', status: 'safe', reason: 'AI Recommendation: Safe to pay. Critical supply chain vendor. Maintaining good standing prevents logistics delays.', dest: 'BDO (1092-2901-4820)' },
    { name: 'Elite Office', amount: 72000.00, due: '2026-06-15', status: 'review', reason: 'AI Recommendation: Review manually. Large invoice exceeds standard SME daily operating threshold. Verify authorization logs before settlement.', dest: '0x90F79bf6EB2c4f870365E785982E1f101E93b906' },
    { name: 'Vertex Analytics Co', amount: 25000.00, due: '2026-06-20', status: 'safe', reason: 'AI Recommendation: Safe to pay. High ROI reporting asset. Clearing preserves database maintenance service agreements.', dest: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC' },
    { name: 'Apex Telecom Inc', amount: 8200.00, due: '2026-06-22', status: 'safe', reason: 'AI Recommendation: Safe to pay. Corporate connectivity vendor. Essential utility maintenance ensures continuous online presence.', dest: 'GCash (0918-290-1289)' },
    { name: 'Brankas Tech Ltd', amount: 12000.00, due: '2026-06-10', status: 'delay', reason: 'AI Recommendation: Postpone payment. Cash balance projection dips below 30 days around due date. Delaying past payroll optimizes liquidity.', dest: '0x90F79bf6EB2c4f870365E785982E1f101E93b906' },
    { name: 'Cyber Audit', amount: 9500.00, due: '2026-06-18', status: 'safe', reason: 'AI Recommendation: Safe to pay. Compliance verification fee. Pre-approved corporate expense to ensure secure banking linkages.', dest: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC' },
    { name: 'Elite Office', amount: 1800.00, due: '2026-06-28', status: 'safe', reason: 'AI Recommendation: Safe to pay. Low amount will not materially affect general corporate liquidity or cash runway.', dest: '0x90F79bf6EB2c4f870365E785982E1f101E93b906' },
    { name: 'Morph Logistics', amount: 5400.00, due: '2026-06-12', status: 'delay', reason: 'AI Recommendation: Postpone payment. Upcoming B2B supplier bulk purchases introduce short-term capital constraints. Delay 5 days recommended.', dest: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8' }
  ];


  for (let index = 0; index < defaultSuppliers.length; index++) {
    const item = defaultSuppliers[index];
    let supplierId;
    
    const supRes = await db.query('SELECT id FROM suppliers WHERE name = $1', [item.name]);
    if (supRes.rowCount > 0) {
      supplierId = supRes.rows[0].id;
      // Force update wallet_address column to match our new demo configurations dynamically
      await db.query('UPDATE suppliers SET wallet_address = $1 WHERE id = $2', [item.dest, supplierId]);
    } else {
      const insertSup = await db.query('INSERT INTO suppliers (name, wallet_address) VALUES ($1, $2) RETURNING id', [item.name, item.dest]);
      supplierId = insertSup.rows[0].id;
    }

    const invoiceId = `INV-DEMO-${String(index + 1).padStart(3, '0')}`;
    const invoiceStatus = (item.name === 'Aera Office Properties') ? 'settled' : 'pending';
    const txHash = (invoiceStatus === 'settled') ? '0xmockdemo605a9ee6284739200fdc55ef21e' : null;

    await db.query(
      `INSERT INTO invoices (id, user_id, supplier_id, amount, issue_date, due_date, status, tx_hash, ai_status, ai_reason)
       VALUES ($1, $2, $3, $4, CURRENT_DATE - 5, $5, $6, $7, $8, $9)`,
      [invoiceId, userId, supplierId, item.amount, item.due, invoiceStatus, txHash, item.status, item.reason]
    );
  }
}

// LOGIN - Authenticate and issue JWT
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  // Intercept special presentation Demo account logins
  if (email && email.toLowerCase() === 'demo@fehuvia.com') {
    try {
      const checkDemo = await db.query('SELECT id, password_hash FROM users WHERE email = $1', ['demo@fehuvia.com']);
      let demoUser;
      
      if (checkDemo.rowCount === 0) {
        const passwordHash = await bcrypt.hash('FehuviaDemo2026!', 12);
        const insertQuery = `
          INSERT INTO users (username, email, password_hash, wallet_address, balance, portfolio_value, bank_linked, bank_name)
          VALUES ('Demo Account', 'demo@fehuvia.com', $1, '0xdemo7970C51812dc3A010C7d01b50e0d17dc79d0', 12500000.00, 15000000.00, TRUE, 'GCash')
          RETURNING id, username, email, wallet_address, balance, portfolio_value, created_at
        `;
        const { rows } = await db.query(insertQuery, [passwordHash]);
        demoUser = rows[0];
      } else {
        const userRes = await db.query(
          'SELECT id, username, email, wallet_address, balance, portfolio_value FROM users WHERE email = $1',
          ['demo@fehuvia.com']
        );
        demoUser = userRes.rows[0];
      }

      // Re-seed all invoices and reset dynamic balances back to standard pristine presentation state!
      await seedDemoUser(demoUser.id);
      
      const token = signToken(demoUser);
      console.log(`🎬 Presentation Demo session initialized for user: ${demoUser.email}`);
      
      return res.json({
        message: 'Demo Session Active.',
        token,
        user: {
          id: demoUser.id,
          username: demoUser.username,
          email: demoUser.email,
          walletAddress: demoUser.wallet_address,
          balance: 12500000.00,
          portfolioValue: 15000000.00,
          createdAt: demoUser.created_at
        }
      });
    } catch (err) {
      console.error('Demo account registration/login error:', err);
      return res.status(500).json({ error: 'Failed to initialize presentation session.' });
    }
  }

  try {
    const { rows, rowCount } = await db.query(
      'SELECT id, username, email, password_hash, wallet_address, balance, portfolio_value FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (rowCount === 0) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = signToken(user);

    console.log(`✅ User logged in: ${user.email}`);

    res.json({
      message: 'Login successful.',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        walletAddress: user.wallet_address,
        balance: parseFloat(user.balance),
        portfolioValue: parseFloat(user.portfolio_value)
      }
    });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
});

// ME - Validate session and return user profile
app.get('/api/auth/me', authenticateJWT, async (req, res) => {
  try {
    const { rows, rowCount } = await db.query(
      'SELECT id, username, email, wallet_address, balance, portfolio_value, automation_level, conversion_preference, risk_profile, bank_linked, bank_name, linked_banks AS "linkedBanks", created_at FROM users WHERE id = $1',
      [req.user.id]
    );

    if (rowCount === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    let u = rows[0];

    if (u.email && u.email.toLowerCase() === 'demo@fehuvia.com') {
      const invCheck = await db.query('SELECT COUNT(*) FROM invoices WHERE user_id = $1', [u.id]);
      if (parseInt(invCheck.rows[0].count) === 0) {
        await seedDemoUser(u.id);
        // Re-query to get updated seeded balances and linked banks
        const reQuery = await db.query(
          'SELECT id, username, email, wallet_address, balance, portfolio_value, automation_level, conversion_preference, risk_profile, bank_linked, bank_name, linked_banks AS "linkedBanks", created_at FROM users WHERE id = $1',
          [req.user.id]
        );
        u = reQuery.rows[0];
      }
    }

    res.json({
      user: {
        id: u.id,
        username: u.username,
        email: u.email,
        walletAddress: u.wallet_address,
        balance: parseFloat(u.balance),
        portfolioValue: parseFloat(u.portfolio_value),
        automationLevel: u.automation_level,
        conversionPreference: u.conversion_preference,
        riskProfile: u.risk_profile,
        bankLinked: u.bank_linked,
        bankName: u.bank_name,
        linkedBanks: u.linkedBanks || [],
        createdAt: u.created_at
      }
    });
  } catch (error) {
    console.error('Session validation error:', error.message);
    res.status(500).json({ error: 'Failed to validate session.' });
  }
});

// ONBOARDING - Save onboarding preferences
app.post('/api/auth/onboarding', authenticateJWT, async (req, res) => {
  const { automationLevel, riskProfile, walletAddress } = req.body;

  try {
    const updateQuery = `
      UPDATE users 
      SET 
        automation_level = $1, 
        risk_profile = $2, 
        wallet_address = COALESCE($3, wallet_address)
      WHERE id = $4
      RETURNING id, email, wallet_address, balance, portfolio_value, automation_level, risk_profile
    `;
    const { rows, rowCount } = await db.query(updateQuery, [
      automationLevel || 'semi',
      riskProfile || 'balanced',
      walletAddress || null,
      req.user.id
    ]);

    if (rowCount === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    console.log(`✅ Onboarding complete for user ID: ${req.user.id}`);
    res.json({
      message: 'Onboarding settings registered successfully.',
      user: rows[0]
    });
  } catch (error) {
    console.error('Onboarding preference update error:', error.message);
    res.status(500).json({ error: 'Failed to save onboarding settings.' });
  }
});

// RESET DEMO STATE - Resets all demo user data back to standard pristine presentation state on demand
app.post('/api/auth/reset-demo', authenticateJWT, async (req, res) => {
  if (req.user.email !== 'demo@fehuvia.com' && req.user.email !== 'admin@fehuvia.com') {
    return res.status(403).json({ error: 'Only demo presentation accounts are authorized to reset database state.' });
  }

  try {
    await seedDemoUser(req.user.id);
    console.log(`🔄 On-demand database reset executed for presentation demo user: ${req.user.email}`);
    res.json({ message: 'Demo state successfully reset to pristine presentation settings.' });
  } catch (err) {
    console.error('Error resetting demo state:', err.message);
    res.status(500).json({ error: 'Failed to reset presentation database state.' });
  }
});

// LINK BANK - Link a traditional bank account via Brankas Open Finance API
app.post('/api/auth/link-bank', authenticateJWT, async (req, res) => {
  const { bankName, bankId, balance, linkedAccounts } = req.body;

  if (!bankName && !bankId) {
    return res.status(400).json({ error: 'Bank name or bank ID is required.' });
  }

  try {
    const userRes = await db.query('SELECT linked_banks FROM users WHERE id = $1', [req.user.id]);
    if (userRes.rowCount === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    let linkedBanks = userRes.rows[0].linked_banks || [];

    // Fallback: Seed standard banks if completely empty
    if (linkedBanks.length === 0) {
      linkedBanks = [
        { id: 'gcash', name: 'GCash Corporate Wallet', short: 'GCash', balance: 12500000.00, type: 'wallet', isLinked: true },
        { id: 'bdo', name: 'Banco de Oro (BDO)', short: 'BDO', balance: 4500000.00, type: 'bank', isLinked: false },
        { id: 'ubp', name: 'UnionBank of the Philippines', short: 'UnionBank', balance: 3200000.00, type: 'bank', isLinked: false },
        { id: 'bpi', name: 'Bank of the Philippine Islands (BPI)', short: 'BPI', balance: 5800000.00, type: 'bank', isLinked: false },
        { id: 'maya', name: 'Maya Business Account', short: 'Maya', balance: 1200000.00, type: 'wallet', isLinked: false }
      ];
    }

    // If a full linkedAccounts array is sent, prioritize it
    if (linkedAccounts && Array.isArray(linkedAccounts) && linkedAccounts.length > 0) {
      linkedBanks = linkedAccounts;
    } else {
      // Find the specific bank and mark as linked, updating its balance
      const targetId = bankId || (bankName ? bankName.toLowerCase() : '');
      linkedBanks = linkedBanks.map(bank => {
        if (bank.id === targetId || bank.short.toLowerCase() === targetId.toLowerCase()) {
          return { 
            ...bank, 
            isLinked: true,
            balance: balance !== undefined ? parseFloat(balance) : bank.balance
          };
        }
        return bank;
      });
    }

    // Recalculate total balance
    const totalBalance = linkedBanks
      .filter(bank => bank.isLinked)
      .reduce((sum, bank) => sum + parseFloat(bank.balance || 0), 0);

    const primaryBank = linkedBanks.find(bank => bank.isLinked);
    const primaryBankName = primaryBank ? primaryBank.short : (bankName || 'GCash');

    const updateQuery = `
      UPDATE users 
      SET 
        bank_linked = TRUE, 
        bank_name = $1, 
        balance = $2,
        linked_banks = $3
      WHERE id = $4
      RETURNING id, email, wallet_address, balance, portfolio_value, bank_linked, bank_name, linked_banks AS "linkedBanks"
    `;
    const { rows } = await db.query(updateQuery, [
      primaryBankName,
      totalBalance,
      JSON.stringify(linkedBanks),
      req.user.id
    ]);

    console.log(`🏦 Bank account linked successfully: ${primaryBankName} for user: ${req.user.id}`);
    res.json({
      message: 'Bank account linked successfully via Brankas Open Finance API.',
      user: {
        id: rows[0].id,
        email: rows[0].email,
        walletAddress: rows[0].wallet_address,
        balance: parseFloat(rows[0].balance),
        portfolioValue: parseFloat(rows[0].portfolio_value),
        bankLinked: rows[0].bank_linked,
        bankName: rows[0].bank_name,
        linkedBanks: rows[0].linkedBanks || []
      }
    });
  } catch (error) {
    console.error('Bank link error:', error.message);
    res.status(500).json({ error: 'Failed to link bank account.' });
  }
});

// DISCONNECT BANK - Disconnect a traditional bank account (entire link reset)
app.post('/api/auth/disconnect-bank', authenticateJWT, async (req, res) => {
  try {
    const userRes = await db.query('SELECT linked_banks FROM users WHERE id = $1', [req.user.id]);
    if (userRes.rowCount === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // Set all bank links to false
    let linkedBanks = userRes.rows[0].linked_banks || [];
    linkedBanks = linkedBanks.map(bank => ({ ...bank, isLinked: false }));

    const updateQuery = `
      UPDATE users 
      SET 
        bank_linked = FALSE, 
        bank_name = NULL, 
        balance = 0.00,
        linked_banks = $1
      WHERE id = $2
      RETURNING id, email, wallet_address, balance, portfolio_value, bank_linked, bank_name, linked_banks AS "linkedBanks"
    `;
    const { rows } = await db.query(updateQuery, [
      JSON.stringify(linkedBanks),
      req.user.id
    ]);

    console.log(`🔌 Bank account disconnected for user: ${req.user.id}`);
    res.json({
      message: 'Bank account disconnected successfully.',
      user: {
        id: rows[0].id,
        email: rows[0].email,
        walletAddress: rows[0].wallet_address,
        balance: parseFloat(rows[0].balance),
        portfolioValue: parseFloat(rows[0].portfolio_value),
        bankLinked: rows[0].bank_linked,
        bankName: rows[0].bank_name,
        linkedBanks: rows[0].linkedBanks || []
      }
    });
  } catch (error) {
    console.error('Bank disconnect error:', error.message);
    res.status(500).json({ error: 'Failed to disconnect bank account.' });
  }
});

// UNLINK BANK - Unlink a specific bank account by ID
app.post('/api/auth/unlink-bank', authenticateJWT, async (req, res) => {
  const { bankId } = req.body;

  if (!bankId) {
    return res.status(400).json({ error: 'Bank ID is required.' });
  }

  try {
    const userRes = await db.query('SELECT linked_banks FROM users WHERE id = $1', [req.user.id]);
    if (userRes.rowCount === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    let linkedBanks = userRes.rows[0].linked_banks || [];
    
    // Find and update the bank to isLinked: false
    linkedBanks = linkedBanks.map(bank => {
      if (bank.id === bankId) {
        return { ...bank, isLinked: false };
      }
      return bank;
    });

    // Recalculate total balance of active linked banks
    const totalBalance = linkedBanks
      .filter(bank => bank.isLinked)
      .reduce((sum, bank) => sum + parseFloat(bank.balance || 0), 0);

    const hasLinked = linkedBanks.some(bank => bank.isLinked);
    const primaryBank = linkedBanks.find(bank => bank.isLinked);
    const primaryBankName = primaryBank ? primaryBank.short : '';

    const updateQuery = `
      UPDATE users 
      SET 
        bank_linked = $1, 
        bank_name = $2, 
        balance = $3,
        linked_banks = $4
      WHERE id = $5
      RETURNING id, email, wallet_address, balance, portfolio_value, bank_linked, bank_name, linked_banks AS "linkedBanks"
    `;

    const { rows } = await db.query(updateQuery, [
      hasLinked,
      primaryBankName,
      totalBalance,
      JSON.stringify(linkedBanks),
      req.user.id
    ]);

    console.log(`🔌 Bank account ${bankId} unlinked for user: ${req.user.id}`);
    res.json({
      message: 'Bank account unlinked successfully.',
      user: {
        id: rows[0].id,
        email: rows[0].email,
        walletAddress: rows[0].wallet_address,
        balance: parseFloat(rows[0].balance),
        portfolioValue: parseFloat(rows[0].portfolio_value),
        bankLinked: rows[0].bank_linked,
        bankName: rows[0].bank_name,
        linkedBanks: rows[0].linkedBanks || []
      }
    });
  } catch (error) {
    console.error('Bank unlink error:', error.message);
    res.status(500).json({ error: 'Failed to unlink bank account.' });
  }
});

// UPDATE WALLET ADDRESS - Update only the Web3 settlement key
app.post('/api/auth/wallet', authenticateJWT, async (req, res) => {
  const { walletAddress } = req.body;

  if (!walletAddress) {
    return res.status(400).json({ error: 'Wallet address is required.' });
  }

  try {
    const updateQuery = `
      UPDATE users 
      SET wallet_address = $1
      WHERE id = $2
      RETURNING id, email, wallet_address, balance, portfolio_value
    `;
    const { rows, rowCount } = await db.query(updateQuery, [
      walletAddress.toLowerCase(),
      req.user.id
    ]);

    if (rowCount === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    console.log(`🔑 Wallet address linked successfully: ${walletAddress} for user: ${req.user.id}`);
    res.json({
      message: 'Wallet address linked successfully.',
      user: {
        id: rows[0].id,
        email: rows[0].email,
        walletAddress: rows[0].wallet_address,
        balance: parseFloat(rows[0].balance),
        portfolioValue: parseFloat(rows[0].portfolio_value)
      }
    });
  } catch (error) {
    console.error('Wallet update error:', error.message);
    res.status(500).json({ error: 'Failed to update wallet address.' });
  }
});

// =============================================
// PUBLIC ENDPOINTS
// =============================================

// 1. HEALTHCHECK ENDPOINT
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'Fehuvia Backend API' });
});

// 2. FETCH ALL INVOICES WITH SUPPLIER INFO (Protected)
app.get('/api/invoices', authenticateJWT, async (req, res) => {
  try {
    const queryText = `
      SELECT 
        i.id,
        i.amount,
        i.issue_date AS "issueDate",
        i.due_date AS "dueDate",
        i.status,
        i.tx_hash AS "txHash",
        i.ai_status AS "aiStatus",
        i.ai_reason AS "aiReason",
        s.name AS "supplier",
        s.wallet_address AS "supplierWallet",
        CASE WHEN u.id IS NOT NULL THEN TRUE ELSE FALSE END AS "hasFehuviaAccount"
      FROM invoices i
      JOIN suppliers s ON i.supplier_id = s.id
      LEFT JOIN users u ON LOWER(u.username) = LOWER(s.name) OR LOWER(u.wallet_address) = LOWER(s.wallet_address)
      WHERE i.user_id = $1
      ORDER BY i.due_date ASC
    `;
    const { rows } = await db.query(queryText, [req.user.id]);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching invoices:', error);
    res.status(500).json({ error: 'Failed to retrieve invoices from database.' });
  }
});

// Check if a business/merchant has an existing Fehuvia account in real-time
app.get('/api/suppliers/check', authenticateJWT, async (req, res) => {
  const { name } = req.query;
  if (!name) {
    return res.status(400).json({ error: 'Supplier name is required.' });
  }

  try {
    // Check if there is a registered user with this business name (username) or matching wallet
    const userRes = await db.query(
      `SELECT username, wallet_address FROM users WHERE LOWER(username) = $1 OR LOWER(wallet_address) = $1`,
      [name.trim().toLowerCase()]
    );

    if (userRes.rowCount > 0) {
      return res.json({
        exists: true,
        businessName: userRes.rows[0].username,
        walletAddress: userRes.rows[0].wallet_address
      });
    }

    res.json({ exists: false });
  } catch (error) {
    console.error('Error verifying supplier account:', error);
    res.status(500).json({ error: 'Failed to verify supplier account.' });
  }
});

// 3. AI CASHFLOW FORECASTING & CO-PILOT ENGINE (RAG + GPT-4o) (Protected)
app.get('/api/cashflow/prediction', authenticateJWT, async (req, res) => {
  try {
    // 3.1 Fetch current invoices state from Supabase
    const queryText = `
      SELECT 
        i.id, i.amount, i.due_date, i.status, s.name AS supplier_name
      FROM invoices i
      JOIN suppliers s ON i.supplier_id = s.id
      WHERE i.user_id = $1
    `;
    const { rows: invoices } = await db.query(queryText, [req.user.id]);

    // 3.2 Establish business treasury context (starting cash runway metrics)
    const userQuery = await db.query('SELECT balance FROM users WHERE id = $1', [req.user.id]);
    const STARTING_CASH_BALANCE = userQuery.rowCount > 0 && userQuery.rows[0].balance !== null
      ? parseFloat(userQuery.rows[0].balance)
      : 1289401.07; // Default premium B2B sandbox balance
      
    const MONTHLY_INFLOW_PROJECTED = 22000.00; // Projected monthly receivables

    // 3.3 Construct RAG System Prompt
    const systemPrompt = `
You are Fehuvia's AI automated CFO and treasury co-pilot for an SME.
Your goal is to analyze the business's B2B invoices and calculate a 30-day cash flow forecast and payment optimization strategy.

Here is the current business status:
- Starting Cash Balance: $${STARTING_CASH_BALANCE}
- Projected Monthly Receivables Inflow: $${MONTHLY_INFLOW_PROJECTED}

Here is the list of invoices in our ledger:
${JSON.stringify(invoices, null, 2)}

Instructions:
1. Calculate the predicted cash runway (in days) based on the starting balance, monthly inflows, and pending invoices.
2. Formulate the cash flow trend ("stable", "positive", or "risk").
3. Write a concise, executive CFO analysis summary (max 3 sentences) in a premium, financial intelligence tone.
4. Classify each PENDING invoice into one of three actions:
   - "safe": Safe to pay immediately. Cash runway remains healthy (>30 days).
   - "delay": Delay payment. High risk of upcoming cash crunch. Recommend paying after inflow/due date.
   - "review": Manually review due to unusual amount or audit flags.
5. Provide a specific, highly intelligent financial reason for each invoice classification.

You must respond STRICLY in the following JSON format:
{
  "predicted_runway": 45,
  "cash_flow_trend": "stable",
  "analysis_summary": "Executive summary here...",
  "recommendations": [
    {
      "invoiceId": "INV-2026-001",
      "status": "safe",
      "reason": "Specific CFO explanation here..."
    }
  ]
}
`;

    if (!process.env.OPENAI_API_KEY) {
      console.warn("⚠️ Warning: OPENAI_API_KEY is not defined. Returning mock AI forecast payload.");
      return res.json({
        predicted_runway: 42,
        cash_flow_trend: "stable",
        analysis_summary: "AI Co-pilot offline. Mock cashflow dashboard loaded successfully using seeded database models.",
        recommendations: invoices.map(inv => ({
          invoiceId: inv.id,
          status: inv.id === 'INV-2026-002' ? 'delay' : inv.id === 'INV-2026-004' ? 'review' : 'safe',
          reason: "Stable offline prediction generated from pre-seeded database analytics."
        }))
      });
    }

    // 3.4 Request structured ChatCompletion from OpenAI (GPT-4o-mini)
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: "Generate the 30-day CFO cashflow forecast and invoice optimization tags." }
      ],
      response_format: { type: 'json_object' }
    });

    const aiResponse = JSON.parse(completion.choices[0].message.content);

    // 3.5 Synchronization: Update the AI statuses back into the Supabase database
    // This caches the AI predictions so they are persistent and ready on-demand.
    for (const rec of aiResponse.recommendations) {
      const updateQuery = `
        UPDATE invoices
        SET ai_status = $1, ai_reason = $2
        WHERE id = $3 AND status = 'pending'
      `;
      await db.query(updateQuery, [rec.status, rec.reason, rec.invoiceId]);
    }

    // 3.6 Persist recommendations into ai_recommendations history table
    for (const rec of aiResponse.recommendations) {
      await db.query(
        `INSERT INTO ai_recommendations (invoice_id, status, reason, predicted_runway, cash_flow_trend)
         VALUES ($1, $2, $3, $4, $5)`,
        [rec.invoiceId, rec.status, rec.reason, aiResponse.predicted_runway || null, aiResponse.cash_flow_trend || null]
      );
    }

    res.json(aiResponse);
  } catch (error) {
    console.error('Error generating cashflow prediction:', error.message);
    res.status(500).json({ error: 'Failed to generate cashflow prediction from OpenAI.' });
  }
});

// 3.7. AI SCAN / OCR INVOICE ENDPOINT (Protected)
// Simulates server-side regular-expression-based character parsing Heuristics
app.post('/api/invoices/scan', authenticateJWT, async (req, res) => {
  const { filename } = req.body;
  const lowerName = (filename || 'invoice.pdf').toLowerCase();
  
  let supplier = 'Tech Solutions Inc';
  let amount = 12500;
  
  if (lowerName.includes('logistics') || lowerName.includes('morph') || lowerName.includes('shipping')) {
    supplier = 'Morph Logistics';
    amount = 4500;
  } else if (lowerName.includes('cyber') || lowerName.includes('security') || lowerName.includes('audit')) {
    supplier = 'Cyber Audit';
    amount = 15000;
  } else if (lowerName.includes('elite') || lowerName.includes('materials') || lowerName.includes('office')) {
    supplier = 'Elite Office';
    amount = 72000;
  } else {
    const suppliers = ['Apex Telecom Inc', 'Brankas Tech Ltd', 'Vertex Analytics Co', 'Cyber Audit', 'Morph Logistics'];
    supplier = suppliers[Math.floor(Math.random() * suppliers.length)];
    amount = Math.floor(Math.random() * 85000) + 1500;
  }

  // Calculate random rolling date 10 to 30 days out
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + Math.floor(Math.random() * 20) + 10);
  const dueDate = futureDate.toISOString().substring(0, 10);

  res.json({
    success: true,
    supplier,
    amount: amount.toFixed(2),
    dueDate,
    scanLogs: [
      'Heuristics: Successfully decrypted document streams',
      `Parser: Found vendor match "${supplier}" in local B2B suppliers registry`,
      `OCR Extraction: Parsed total sum of $${amount.toLocaleString()} USDC`
    ]
  });
});

// 3.8. CREATE/UPLOAD INVOICE ENDPOINT (Protected)
app.post('/api/invoices', authenticateJWT, async (req, res) => {
  const { supplier, amount, dueDate, aiStatus } = req.body;

  if (!supplier || !amount || !dueDate) {
    return res.status(400).json({ error: 'Supplier, amount, and due date are required.' });
  }

  try {
    // 1. Resolve supplier (find or create)
    let supplierId;
    let supplierWallet;
    const supCheck = await db.query('SELECT id, wallet_address FROM suppliers WHERE LOWER(name) = $1', [supplier.trim().toLowerCase()]);
    
    if (supCheck.rowCount > 0) {
      supplierId = supCheck.rows[0].id;
      supplierWallet = supCheck.rows[0].wallet_address;
    } else {
      const mockWallet = '0x' + Array.from({length: 40}, () => Math.floor(Math.random()*16).toString(16)).join('');
      const insertSup = await db.query(
        'INSERT INTO suppliers (name, wallet_address) VALUES ($1, $2) RETURNING id, wallet_address',
        [supplier.trim(), mockWallet]
      );
      supplierId = insertSup.rows[0].id;
      supplierWallet = insertSup.rows[0].wallet_address;
    }

    // 2. Generate a new invoice ID
    const countCheck = await db.query('SELECT COUNT(*) FROM invoices');
    const nextNum = parseInt(countCheck.rows[0].count) + 1;
    const invoiceId = `INV-2026-${String(nextNum).padStart(3, '0')}`;

    // 3. Set up dynamic AI status & reasoning based on amount threshold rules
    const parsedAmount = parseFloat(amount);
    let activeAiStatus = aiStatus;
    
    if (!activeAiStatus) {
      if (parsedAmount > 50000) {
        activeAiStatus = 'review';
      } else if (parsedAmount > 10000) {
        activeAiStatus = 'delay';
      } else {
        activeAiStatus = 'safe';
      }
    }

    const aiReason = activeAiStatus === 'safe'
      ? 'AI Recommendation: Safe to pay. Corporate cash runway is projected to remain highly robust (>45 days runway) post-settlement.'
      : activeAiStatus === 'delay'
      ? 'AI Recommendation: Postpone payment. Upcoming operational and payroll expenses present minor liquidity constraint. Delay by 5 days is advised.'
      : 'AI Recommendation: Review manually. Large transaction exceeds standard SME daily operating threshold. Verify authorization logs before settlement.';

    // 4. Insert invoice
    const issueDate = new Date().toISOString().substring(0, 10);
    const insertInv = await db.query(
      `INSERT INTO invoices (id, user_id, supplier_id, amount, issue_date, due_date, status, ai_status, ai_reason)
       VALUES ($1, $2, $3, $4, $5, $6, 'pending', $7, $8)
       RETURNING *`,
      [invoiceId, req.user.id, supplierId, parseFloat(amount), issueDate, dueDate, activeAiStatus, aiReason]
    );

    const newInv = insertInv.rows[0];

    console.log(`✅ Invoice ${invoiceId} uploaded successfully for supplier: ${supplier}`);

    res.status(201).json({
      id: newInv.id,
      amount: parseFloat(newInv.amount),
      issueDate: newInv.issue_date,
      dueDate: newInv.due_date,
      status: newInv.status,
      txHash: newInv.tx_hash,
      aiStatus: newInv.ai_status,
      aiReason: newInv.ai_reason,
      supplier: supplier.trim(),
      supplierWallet
    });
  } catch (error) {
    console.error('Error creating invoice:', error.message);
    res.status(500).json({ error: 'Failed to create invoice.' });
  }
});

// 3.9 SCHEDULE ENDPOINT (Protected)
app.post('/api/invoices/:id/schedule', authenticateJWT, async (req, res) => {
  const { id } = req.params;
  const { scheduledDate } = req.body;

  if (!scheduledDate) {
    return res.status(400).json({ error: 'Scheduled date is required.' });
  }

  try {
    const updateQuery = `
      UPDATE invoices
      SET status = 'scheduled', due_date = $1
      WHERE id = $2
      RETURNING *
    `;
    const { rows, rowCount } = await db.query(updateQuery, [scheduledDate, id]);

    if (rowCount === 0) {
      return res.status(404).json({ error: `Invoice with ID ${id} not found.` });
    }

    console.log(`📅 Invoice ${id} successfully scheduled for ${scheduledDate}`);

    res.json({
      message: 'Invoice successfully scheduled.',
      invoice: rows[0]
    });
  } catch (error) {
    console.error('Error in scheduling:', error.message);
    res.status(500).json({ error: 'Failed to schedule invoice.' });
  }
});

// 4. SETTLE ENDPOINT (Protected)
app.post('/api/invoices/:id/settle', authenticateJWT, async (req, res) => {
  const { id } = req.params;
  const { txHash: bodyTxHash } = req.body;
  const txHash = bodyTxHash || `0xmock${Buffer.from(id).toString('hex').padEnd(60, '0')}`;

  try {
    const updateQuery = `
      UPDATE invoices
      SET status = 'settled', tx_hash = $1
      WHERE id = $2
      RETURNING *
    `;
    const { rows, rowCount } = await db.query(updateQuery, [txHash, id]);

    if (rowCount === 0) {
      return res.status(404).json({ error: `Invoice with ID ${id} not found.` });
    }

    const settledInvoice = rows[0];
    const amountToDeductUSD = parseFloat(settledInvoice.amount);
    const amountToDeductPHP = amountToDeductUSD * usdPhpRate; // Real-life dynamic conversion rate

    // Deduct Peso operating balance from traditional bank link if active
    const userRes = await db.query('SELECT bank_linked, balance, linked_banks FROM users WHERE id = $1', [req.user.id]);
    if (userRes.rowCount > 0 && userRes.rows[0].bank_linked) {
      let linkedBanks = userRes.rows[0].linked_banks || [];
      
      // Find the first connected bank with enough reserves
      let targetBank = linkedBanks.find(bank => bank.isLinked && parseFloat(bank.balance) >= amountToDeductPHP);
      
      // If none found with enough reserves, fallback to the first linked bank
      if (!targetBank) {
        targetBank = linkedBanks.find(bank => bank.isLinked);
      }

      if (targetBank) {
        linkedBanks = linkedBanks.map(bank => {
          if (bank.id === targetBank.id) {
            return { ...bank, balance: Math.max(0.00, parseFloat(bank.balance) - amountToDeductPHP) };
          }
          return bank;
        });

        // Recalculate total balance
        const totalBalance = linkedBanks
          .filter(bank => bank.isLinked)
          .reduce((sum, bank) => sum + parseFloat(bank.balance || 0), 0);

        await db.query(
          'UPDATE users SET balance = $1, linked_banks = $2 WHERE id = $3',
          [totalBalance, JSON.stringify(linkedBanks), req.user.id]
        );
        console.log(`💸 Persistent Peso Balance deducted from ${targetBank.short}: -₱${amountToDeductPHP} (Converted from $${amountToDeductUSD} USDC)`);
      }
    }

    // Peer-to-Peer balance transfer: if the supplier is a registered Fehuvia user (merchant), credit their account!
    try {
      const supRes = await db.query('SELECT name, wallet_address FROM suppliers WHERE id = $1', [settledInvoice.supplier_id]);
      if (supRes.rowCount > 0) {
        const supplierName = supRes.rows[0].name;
        const supplierWallet = supRes.rows[0].wallet_address;
        
        // Find if there is a registered user with matching username (business name) or wallet address
        const recipientUser = await db.query(
          'SELECT id, username, email FROM users WHERE LOWER(username) = $1 OR LOWER(wallet_address) = $2',
          [supplierName.trim().toLowerCase(), supplierWallet.trim().toLowerCase()]
        );
        
        if (recipientUser.rowCount > 0) {
          const recipient = recipientUser.rows[0];
          await db.query(
            `UPDATE users 
             SET balance = balance + $1, portfolio_value = portfolio_value + $1
             WHERE id = $2`,
            [amountToDeductPHP, recipient.id]
          );
          console.log(`🎁 [Peer-to-Peer Settlement] Credited merchant account "${recipient.username}" (${recipient.email}) with +₱${amountToDeductPHP} (Converted from $${amountToDeductUSD} USDC)`);
        }
      }
    } catch (supErr) {
      console.error('⚠️ [Peer-to-Peer Settlement] Failed to credit supplier merchant account:', supErr.message);
    }

    res.json({
      message: 'Invoice successfully settled on-chain and registered in treasury ledger.',
      invoice: settledInvoice
    });
  } catch (error) {
    console.error('Error in settlement:', error.message);
    res.status(500).json({ error: 'Failed to process invoice settlement.' });
  }
});

// 4.5 TREASURY CONVERSION BRIDGE ENDPOINT (Protected)
app.post('/api/bridge/convert', authenticateJWT, async (req, res) => {
  const { direction, amountUSD, selectedBankId } = req.body;

  if (!direction || !amountUSD || parseFloat(amountUSD) <= 0) {
    return res.status(400).json({ error: 'Direction and valid positive amount are required.' });
  }

  const amountPHP = parseFloat(amountUSD) * usdPhpRate;

  try {
    // Fetch active user traditional cash balance and linked banks
    const userRes = await db.query('SELECT balance, portfolio_value, username, linked_banks FROM users WHERE id = $1', [req.user.id]);
    if (userRes.rowCount === 0) {
      return res.status(404).json({ error: 'User profile not found.' });
    }

    const username = userRes.rows[0].username;
    let linkedBanks = userRes.rows[0].linked_banks || [];

    // Fallback: If empty, seed default banks
    if (linkedBanks.length === 0) {
      linkedBanks = [
        { id: 'gcash', name: 'GCash Corporate Wallet', short: 'GCash', balance: 12500000.00, type: 'wallet', isLinked: true },
        { id: 'bdo', name: 'Banco de Oro (BDO)', short: 'BDO', balance: 4500000.00, type: 'bank', isLinked: false },
        { id: 'ubp', name: 'UnionBank of the Philippines', short: 'UnionBank', balance: 3200000.00, type: 'bank', isLinked: false },
        { id: 'bpi', name: 'Bank of the Philippine Islands (BPI)', short: 'BPI', balance: 5800000.00, type: 'bank', isLinked: false },
        { id: 'maya', name: 'Maya Business Account', short: 'Maya', balance: 1200000.00, type: 'wallet', isLinked: false }
      ];
    }

    // Determine target bank OID
    const targetBankId = selectedBankId || 'gcash';
    const targetBank = linkedBanks.find(bank => bank.id === targetBankId);

    if (!targetBank) {
      return res.status(404).json({ error: `Bank connection for ID '${targetBankId}' not found.` });
    }

    if (direction === 'fiat_to_token') {
      if (!targetBank.isLinked) {
        return res.status(400).json({ error: `${targetBank.short} is not linked. Please connect it first.` });
      }
      if (parseFloat(targetBank.balance) < amountPHP) {
        return res.status(400).json({ error: `Insufficient traditional operating balance in ${targetBank.short}.` });
      }
      // Deduct from target bank
      linkedBanks = linkedBanks.map(bank => {
        if (bank.id === targetBankId) {
          return { ...bank, balance: Math.max(0.00, parseFloat(bank.balance) - amountPHP) };
        }
        return bank;
      });
    } else if (direction === 'token_to_fiat') {
      if (!targetBank.isLinked) {
        return res.status(400).json({ error: `${targetBank.short} is not linked. Please connect it first.` });
      }
      // Credit to target bank
      linkedBanks = linkedBanks.map(bank => {
        if (bank.id === targetBankId) {
          return { ...bank, balance: parseFloat(bank.balance) + amountPHP };
        }
        return bank;
      });
    } else {
      return res.status(400).json({ error: 'Invalid conversion direction.' });
    }

    // Recalculate total balance as sum of all LINKED banks
    const totalBalance = linkedBanks
      .filter(bank => bank.isLinked)
      .reduce((sum, bank) => sum + parseFloat(bank.balance || 0), 0);

    // Persist updated cash balance and linked banks array
    const updateRes = await db.query(
      'UPDATE users SET balance = $1, linked_banks = $2 WHERE id = $3 RETURNING balance, portfolio_value, linked_banks AS "linkedBanks"',
      [totalBalance, JSON.stringify(linkedBanks), req.user.id]
    );

    console.log(`🔄 [Treasury Conversion Bridge] ${username} successfully converted $${amountUSD} USDC (${direction === 'fiat_to_token' ? 'PHP -> USDC' : 'USDC -> PHP'}). New total cash balance: ₱${totalBalance} (Debited/Credited specific bank: ${targetBankId})`);

    res.json({
      message: 'Conversion completed successfully and registered in physical treasury ledger.',
      balance: parseFloat(updateRes.rows[0].balance),
      portfolioValue: parseFloat(updateRes.rows[0].portfolio_value),
      linkedBanks: updateRes.rows[0].linkedBanks || [],
      amountPHP,
      amountUSD: parseFloat(amountUSD)
    });
  } catch (error) {
    console.error('Error executing manual conversion:', error.message);
    res.status(500).json({ error: 'Failed to execute treasury bridge conversion.' });
  }
});

// =============================================
// PAYMENTS & RECOMMENDATIONS ENDPOINTS
// =============================================

// 5. FETCH SETTLED PAYMENTS LOG (Protected)
// Returns all settled invoices with supplier details for the Payments ledger view.
app.get('/api/payments', authenticateJWT, async (req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT
        i.id AS "invoiceId",
        i.amount,
        i.status,
        i.tx_hash AS "txHash",
        i.due_date AS "dueDate",
        i.created_at AS "settledAt",
        s.name AS "supplier",
        s.wallet_address AS "destination"
      FROM invoices i
      JOIN suppliers s ON i.supplier_id = s.id
      WHERE i.status = 'settled' AND i.user_id = $1
      ORDER BY i.created_at DESC
    `, [req.user.id]);

    // Format for frontend consumption
    const payments = rows.map(r => ({
      timestamp: new Date(r.settledAt).toISOString().replace('T', ' ').substring(0, 19),
      invoiceId: r.invoiceId,
      supplier: r.supplier,
      destination: r.destination,
      amount: parseFloat(r.amount),
      fee: '< 0.0001 ETH',
      txHash: r.txHash || '0x0'
    }));

    res.json(payments);
  } catch (error) {
    console.error('Error fetching payments:', error.message);
    res.status(500).json({ error: 'Failed to fetch settled payments.' });
  }
});

// 6. FETCH AI RECOMMENDATION HISTORY (Protected)
// Returns all AI recommendations with invoice and supplier details.
app.get('/api/recommendations', authenticateJWT, async (req, res) => {
  try {
    const sortField = req.query.sort || 'date';
    
    let orderClause = 'ar.created_at DESC';
    if (sortField === 'status') orderClause = 'ar.status ASC, ar.created_at DESC';
    else if (sortField === 'amount') orderClause = 'i.amount DESC, ar.created_at DESC';

    const { rows } = await db.query(`
      SELECT
        ar.id,
        ar.invoice_id AS "invoiceId",
        ar.status,
        ar.reason,
        ar.predicted_runway AS "predictedRunway",
        ar.cash_flow_trend AS "cashFlowTrend",
        ar.created_at AS "createdAt",
        i.amount,
        s.name AS "supplier"
      FROM ai_recommendations ar
      JOIN invoices i ON ar.invoice_id = i.id
      JOIN suppliers s ON i.supplier_id = s.id
      WHERE i.user_id = $1
      ORDER BY ${orderClause}
    `, [req.user.id]);

    res.json(rows.map(r => ({
      ...r,
      amount: parseFloat(r.amount)
    })));
  } catch (error) {
    console.error('Error fetching recommendations:', error.message);
    res.status(500).json({ error: 'Failed to fetch AI recommendation history.' });
  }
});

// 5. START SERVER & LAUNCH DAEMON
app.listen(PORT, async () => {
  console.log(`\n=========================================`);
  console.log(`🚀 Fehuvia Backend API running on port ${PORT}`);
  console.log(`=========================================\n`);
  
  try {
    // Database schema migration: add linked_banks JSONB column to users table if not exists
    await db.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS linked_banks JSONB DEFAULT '[]'::jsonb
    `);
    console.log("💾 [Database Schema] Verified 'linked_banks' column in users table.");
  } catch (err) {
    console.warn("⚠️ [Database Schema] Could not verify or add linked_banks column:", err.message);
  }

  try {
    await seedMerchantAccounts();
  } catch (err) {
    console.error('⚠️ [Database Seeding] Failed to run startup merchant account seeding:', err.message);
  }

  // Launch Morph Blockchain event listener daemon process
  startListener();
});
