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

const PORT = process.env.PORT || 3001;

// Instantiate OpenAI Client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || ''
});

// =============================================
// AUTH ENDPOINTS
// =============================================

// SIGNUP - Register a new user
app.post('/api/auth/signup', async (req, res) => {
  const { email, password, walletAddress } = req.body;

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
      INSERT INTO users (email, password_hash, wallet_address)
      VALUES ($1, $2, $3)
      RETURNING id, email, wallet_address, balance, portfolio_value, created_at
    `;
    const { rows } = await db.query(insertQuery, [
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
        email: user.email,
        walletAddress: user.wallet_address,
        balance: parseFloat(user.balance),
        portfolioValue: parseFloat(user.portfolio_value)
      }
    });
  } catch (error) {
    console.error('Signup error:', error.message);
    res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
});

// LOGIN - Authenticate and issue JWT
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    const { rows, rowCount } = await db.query(
      'SELECT id, email, password_hash, wallet_address, balance, portfolio_value FROM users WHERE email = $1',
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
      'SELECT id, email, wallet_address, balance, portfolio_value, automation_level, conversion_preference, risk_profile, bank_linked, bank_name, created_at FROM users WHERE id = $1',
      [req.user.id]
    );

    if (rowCount === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const u = rows[0];
    res.json({
      user: {
        id: u.id,
        email: u.email,
        walletAddress: u.wallet_address,
        balance: parseFloat(u.balance),
        portfolioValue: parseFloat(u.portfolio_value),
        automationLevel: u.automation_level,
        conversionPreference: u.conversion_preference,
        riskProfile: u.risk_profile,
        bankLinked: u.bank_linked,
        bankName: u.bank_name,
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

// LINK BANK - Link a traditional bank account via Brankas Open Finance API
app.post('/api/auth/link-bank', authenticateJWT, async (req, res) => {
  const { bankName, balance } = req.body;

  if (!bankName || balance === undefined) {
    return res.status(400).json({ error: 'Bank name and balance are required.' });
  }

  try {
    const updateQuery = `
      UPDATE users 
      SET 
        bank_linked = TRUE, 
        bank_name = $1, 
        balance = $2
      WHERE id = $3
      RETURNING id, email, wallet_address, balance, portfolio_value, bank_linked, bank_name
    `;
    const { rows, rowCount } = await db.query(updateQuery, [
      bankName,
      balance,
      req.user.id
    ]);

    if (rowCount === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    console.log(`🏦 Bank account linked successfully: ${bankName} for user: ${req.user.id}`);
    res.json({
      message: 'Bank account linked successfully via Brankas Open Finance API.',
      user: {
        id: rows[0].id,
        email: rows[0].email,
        walletAddress: rows[0].wallet_address,
        balance: parseFloat(rows[0].balance),
        portfolioValue: parseFloat(rows[0].portfolio_value),
        bankLinked: rows[0].bank_linked,
        bankName: rows[0].bank_name
      }
    });
  } catch (error) {
    console.error('Bank link error:', error.message);
    res.status(500).json({ error: 'Failed to link bank account.' });
  }
});

// DISCONNECT BANK - Disconnect a traditional bank account
app.post('/api/auth/disconnect-bank', authenticateJWT, async (req, res) => {
  try {
    const updateQuery = `
      UPDATE users 
      SET 
        bank_linked = FALSE, 
        bank_name = NULL, 
        balance = 0.00
      WHERE id = $1
      RETURNING id, email, wallet_address, balance, portfolio_value, bank_linked, bank_name
    `;
    const { rows, rowCount } = await db.query(updateQuery, [req.user.id]);

    if (rowCount === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

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
        bankName: rows[0].bank_name
      }
    });
  } catch (error) {
    console.error('Bank disconnect error:', error.message);
    res.status(500).json({ error: 'Failed to disconnect bank account.' });
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
        s.wallet_address AS "supplierWallet"
      FROM invoices i
      JOIN suppliers s ON i.supplier_id = s.id
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

    // 3.4 Request structured ChatCompletion from OpenAI (GPT-4o)
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
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

    // 3. Set up AI reason
    const activeAiStatus = aiStatus || 'safe';
    const aiReason = activeAiStatus === 'safe'
      ? 'AI Recommendation: Safe to pay. Cash reserves are projected to remain robust (>45 days runway) even post-settlement.'
      : activeAiStatus === 'delay'
      ? 'AI Recommendation: Postpone payment. Upcoming payroll introduces liquidity risk; delay past next week to balance inflow.'
      : 'AI Recommendation: Review manually. Payment amount matches a duplicate billing range. Validate audit log prior to signing.';

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
    const amountToDeductPHP = amountToDeductUSD * 56; // Standard B2B conversion rate: ₱56 per $1

    // Deduct Peso operating balance from traditional bank link if active
    await db.query(
      `UPDATE users
       SET balance = CASE WHEN bank_linked = TRUE THEN GREATEST(0.00, balance - $1) ELSE balance END
       WHERE id = $2`,
      [amountToDeductPHP, req.user.id]
    );

    console.log(`💸 Persistent Peso Balance deducted for user id ${req.user.id}: -₱${amountToDeductPHP} (Converted from $${amountToDeductUSD} USDC)`);

    res.json({
      message: 'Invoice successfully settled on-chain and registered in treasury ledger.',
      invoice: settledInvoice
    });
  } catch (error) {
    console.error('Error in settlement:', error.message);
    res.status(500).json({ error: 'Failed to process invoice settlement.' });
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
app.listen(PORT, () => {
  console.log(`\n=========================================`);
  console.log(`🚀 Fehuvia Backend API running on port ${PORT}`);
  console.log(`=========================================\n`);
  
  // Launch Morph Blockchain event listener daemon process
  startListener();
});
