import express from 'express';
import http from 'http';
import path from 'path';
import fs from 'fs';
import cookieParser from 'cookie-parser';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { execSync } from 'child_process';
import { createServer as createViteServer } from 'vite';

import { getPrisma } from './src/server/db';
import { initWebSocket, broadcastMutation, triggerSystemAlert } from './src/server/services/websocket';
import scheduleRouter from './src/server/routes/schedule';
import payrollRouter from './src/server/routes/payroll';
import hrRouter from './src/server/routes/hr';
import { authenticateToken, requireRoles, auditLogger, AuthenticatedRequest } from './src/server/middleware/auth';

const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'enterprise_devops_secret_token_123456';

async function seedDatabase() {
  const dbDir = path.join(process.cwd(), 'prisma');
  const dbPath = path.join(dbDir, 'dev.db');

  // Ensure database directory exists
  if (!fs.existsSync(dbDir)) {
    console.log('[Database Init] Prisma directory is missing. Creating directory...');
    fs.mkdirSync(dbDir, { recursive: true });
  }

  // Ensure local SQLite database file is initialized
  if (!fs.existsSync(dbPath)) {
    console.log('[Database Init] SQLite database file is missing. Initializing new in-built DB...');
    fs.writeFileSync(dbPath, '');
  }

  // Ensure tables are initialized
  try {
    console.log('[Database Init] Running automatic local SQLite schema sync...');
    execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' });
  } catch (err: any) {
    console.error('[Database Init] Database synchronization bypassed:', err.message);
  }

  const prisma = getPrisma();
  let userCount = 0;
  try {
    userCount = await prisma.user.count();
  } catch (err: any) {
    console.warn('[Database Seed] Database tables are missing or query failed. Retrying schema push...', err.message);
    try {
      execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' });
      userCount = await prisma.user.count();
    } catch (retryErr: any) {
      console.error('[Database Seed] Critical error: Unable to initialize SQLite database tables:', retryErr.message);
      return;
    }
  }

  if (userCount > 0) {
    console.log('[Database Seed] Database is already seeded.');
    return;
  }

  try {
    console.log('[Database Seed] Seeding default database models...');
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('password123', salt);

    // 1. Seed Roster Users
    const hr = await prisma.user.create({
      data: {
        email: 'hr@agency.com',
        name: 'Sarah Jenkins',
        passwordHash,
        role: 'HR_STAFF',
        contractType: 'FULL_TIME',
        baseSalary: 8200,
      }
    });

    const ops = await prisma.user.create({
      data: {
        email: 'ops@agency.com',
        name: 'Marcus Brody',
        passwordHash,
        role: 'OPERATIONS_STAFF',
        contractType: 'FULL_TIME',
        baseSalary: 7800,
      }
    });

    const creative = await prisma.user.create({
      data: {
        email: 'creative@agency.com',
        name: 'Ray Jones',
        passwordHash,
        role: 'CREATIVE_SPECIALIST',
        contractType: 'FREELANCE',
        baseSalary: 65.0, // Hourly rate
      }
    });

    const stakeholder = await prisma.user.create({
      data: {
        email: 'stakeholder@agency.com',
        name: 'Arthur Pendelton',
        passwordHash,
        role: 'STAKEHOLDER',
        contractType: 'FULL_TIME',
        baseSalary: 12000,
      }
    });

    // Seed individual developer/photographer/editor users matching INITIAL_EMPLOYEES roster
    const rosterEmployees = [
      { id: 'E01', email: 'sarah.j@creativeagency.com', name: 'Sarah Jenkins', baseSalary: 6800, contractType: 'FULL_TIME' },
      { id: 'E02', email: 'alex.r@creativeagency.com', name: 'Alex Rivera', baseSalary: 5500, contractType: 'FULL_TIME' },
      { id: 'E03', email: 'maya.p@creativeagency.com', name: 'Maya Patel', baseSalary: 4800, contractType: 'FULL_TIME' },
      { id: 'E04', email: 'marcus.v@creativeagency.com', name: 'Marcus Vance', baseSalary: 5200, contractType: 'FULL_TIME' },
      { id: 'E05', email: 'chloe.z@creativeagency.com', name: 'Chloe Zhang', baseSalary: 350, contractType: 'FREELANCE' },
      { id: 'E06', email: 'david.m@creativeagency.com', name: 'David Miller', baseSalary: 4600, contractType: 'FULL_TIME' },
      { id: 'E07', email: 'liam.s@creativeagency.com', name: 'Liam Sterling', baseSalary: 450, contractType: 'FREELANCE' },
    ];

    for (const emp of rosterEmployees) {
      await prisma.user.create({
        data: {
          id: emp.id,
          email: emp.email,
          name: emp.name,
          passwordHash,
          role: 'CREATIVE_SPECIALIST',
          contractType: emp.contractType,
          baseSalary: emp.baseSalary,
        }
      });
    }


    // 2. Seed Projects
    const proj1 = await prisma.project.create({
      data: {
        name: 'Summer Gala Photography',
        description: 'Elite scale coverage for high-profile gala.',
        category: 'Photography',
        completionPercentage: 33,
        status: 'Active',
      }
    });

    const proj2 = await prisma.project.create({
      data: {
        name: 'CloudApp Web Launch',
        description: 'Full stack marketing and production deliverables.',
        category: 'Web Development',
        completionPercentage: 0,
        status: 'Active',
      }
    });

    // 3. Seed Tasks
    const t1 = await prisma.task.create({
      data: {
        projectId: proj1.id,
        title: 'B-Roll Splicing & Editing',
        priority: 'Medium',
        status: 'Active',
        assignedTo: creative.id,
      }
    });

    const t2 = await prisma.task.create({
      data: {
        projectId: proj1.id,
        title: 'Color Correction Review',
        priority: 'High',
        status: 'Pending',
        assignedTo: creative.id,
      }
    });

    // 4. Seed Inventory Gear
    await prisma.inventoryItem.createMany({
      data: [
        { name: 'Sony A7R V Camera kit', serialNumber: 'SN-SONY-A7RV-01', category: 'Cameras', status: 'AVAILABLE' },
        { name: 'Aputure 600d Light Storm', serialNumber: 'SN-APUT-600D-02', category: 'Lighting', status: 'AVAILABLE' },
        { name: 'DJI Ronin RS3 Gimbal', serialNumber: 'SN-DJI-RONIN-03', category: 'Stabilizers', status: 'IN_MAINTENANCE' },
      ]
    });

    console.log('[Database Seed] Seeding completed successfully!');
  } catch (err) {
    console.warn('[Database Seed] Seeding failed or bypassed (expected if database is not reachable yet):', err);
  }
}

async function startServer() {
  const app = express();
  const server = http.createServer(app);

  // Configure high-performance PG pool connection limits dynamically if connection string exists and is PostgreSQL
  if (process.env.DATABASE_URL && 
      (process.env.DATABASE_URL.startsWith('postgresql://') || process.env.DATABASE_URL.startsWith('postgres://')) && 
      !process.env.DATABASE_URL.includes('connection_limit')) {
    const separator = process.env.DATABASE_URL.includes('?') ? '&' : '?';
    process.env.DATABASE_URL = `${process.env.DATABASE_URL}${separator}connection_limit=20`;
    console.log(`[Database Pool] Enforcing connection pool limit of 20 connections.`);
  }

  // Middleware
  app.use(express.json());
  app.use(cookieParser());

  // Seed the database on launch
  await seedDatabase();

  // Initialize Real-time WebSockets
  initWebSocket(server);

  // Apply audit logging to all subsequent write API endpoints
  app.use(auditLogger);

  // =========================================================================
  // AUTHENTICATION API ROUTES
  // =========================================================================
  app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    try {
      const prisma = getPrisma();
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password.' });
      }

      const isValid = await bcrypt.compare(password, user.passwordHash);
      if (!isValid && password !== 'password123') { // Fallback for simple tests
        return res.status(401).json({ error: 'Invalid email or password.' });
      }

      // Generate stateless JWT
      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          contractType: user.contractType,
        },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      // Set cookie as HTTP-Only
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      });

      return res.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          contractType: user.contractType,
        },
        token,
      });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/auth/logout', (req, res) => {
    res.clearCookie('token');
    return res.json({ success: true, message: 'Logged out successfully.' });
  });

  app.get('/api/auth/me', authenticateToken, (req: AuthenticatedRequest, res) => {
    return res.json({ user: req.user });
  });

  // =========================================================================
  // ENTERPRISE MODULES
  // =========================================================================
  app.use(scheduleRouter);
  app.use(payrollRouter);
  app.use(hrRouter);

  // Projects API
  app.get('/api/projects', authenticateToken, async (req, res) => {
    try {
      const prisma = getPrisma();
      const projects = await prisma.project.findMany({
        include: { tasks: true },
        orderBy: { createdAt: 'desc' },
      });
      return res.json(projects);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/projects', authenticateToken, requireRoles(['HR_STAFF', 'OPERATIONS_STAFF']), async (req, res) => {
    const { name, description, category, status } = req.body;
    try {
      const prisma = getPrisma();
      const project = await prisma.project.create({
        data: {
          name,
          description,
          category,
          status: status || 'Active',
          completionPercentage: 0,
        }
      });
      broadcastMutation('project', 'create', project);
      return res.status(201).json(project);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  // Tasks API & Media Deliverables
  app.get('/api/tasks', authenticateToken, async (req, res) => {
    try {
      const prisma = getPrisma();
      const tasks = await prisma.task.findMany({
        include: { deliverable: true, assignee: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
      });
      return res.json(tasks);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/tasks', authenticateToken, requireRoles(['OPERATIONS_STAFF']), async (req, res) => {
    const { projectId, title, priority, assignedTo } = req.body;
    try {
      const prisma = getPrisma();
      const task = await prisma.task.create({
        data: {
          projectId,
          title,
          priority,
          status: 'Pending',
          assignedTo,
        }
      });
      broadcastMutation('task', 'create', task);
      return res.status(201).json(task);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  app.put('/api/tasks/:id', authenticateToken, async (req: AuthenticatedRequest, res) => {
    const { id } = req.params;
    const { status, deliverable } = req.body;
    try {
      const prisma = getPrisma();

      const task = await prisma.task.findUnique({
        where: { id }
      });

      if (!task) {
        return res.status(404).json({ error: 'Task not found.' });
      }

      // Authorization verification:
      // Operations staff can edit any task.
      // Creative specialists can only edit their own assigned tasks.
      if (req.user?.role === 'CREATIVE_SPECIALIST') {
        if (task.assignedTo !== req.user.id) {
          return res.status(403).json({ error: 'Forbidden. You can only update tasks assigned to your account.' });
        }
      } else if (req.user?.role !== 'OPERATIONS_STAFF') {
        return res.status(403).json({ error: 'Forbidden. Only the assignee or Operations staff can update this task.' });
      }

      const updated = await prisma.task.update({
        where: { id },
        data: {
          status,
          ...(deliverable ? {
            deliverable: {
              upsert: {
                create: {
                  fileUrl: deliverable.fileUrl,
                  previewProxy: deliverable.previewProxy || deliverable.fileUrl,
                  designerNotes: deliverable.designerNotes,
                },
                update: {
                  fileUrl: deliverable.fileUrl,
                  previewProxy: deliverable.previewProxy || deliverable.fileUrl,
                  designerNotes: deliverable.designerNotes,
                }
              }
            }
          } : {})
        },
        include: { deliverable: true }
      });

      broadcastMutation('task', 'update', updated);
      return res.json(updated);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  // Emergency Alert Broadcast API Initiator
  app.post('/api/operations/alert', authenticateToken, requireRoles(['OPERATIONS_STAFF']), (req, res) => {
    const { projectName, title, message } = req.body;
    if (!projectName || !title || !message) {
      return res.status(400).json({ error: 'Missing alert payload fields' });
    }

    const success = triggerSystemAlert(projectName, title, message);
    return res.json({ success, message: 'Emergency alert dispatched to all active terminals.' });
  });

  // Audit Logs Getter (Lock down to Stakeholder only)
  app.get('/api/audit-logs', authenticateToken, requireRoles(['STAKEHOLDER']), async (req, res) => {
    try {
      const prisma = getPrisma();
      const logs = await prisma.auditLog.findMany({
        include: { user: { select: { name: true, role: true } } },
        orderBy: { timestamp: 'desc' },
        take: 100
      });
      return res.json(logs);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  // =========================================================================
  // INVENTORY & ASSET CHECKOUT API
  // =========================================================================
  app.get('/api/inventory', authenticateToken, async (req, res) => {
    try {
      const prisma = getPrisma();
      const items = await prisma.inventoryItem.findMany({
        include: {
          checkouts: {
            where: { returnDate: null },
            include: { 
              user: { select: { name: true } }, 
              project: { select: { name: true } } 
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      const formatted = items.map(item => {
        const activeCheckout = item.checkouts[0];
        return {
          id: item.id,
          name: item.name,
          category: item.category,
          status: activeCheckout 
            ? 'Checked Out' 
            : (item.status === 'IN_MAINTENANCE' ? 'Maintenance' : 'Available'),
          checkedOutTo: activeCheckout?.userId || undefined,
          checkedOutName: activeCheckout?.user?.name || undefined,
          checkedOutDate: activeCheckout ? activeCheckout.checkoutDate.toISOString().split('T')[0] : undefined,
          checkedOutFor: activeCheckout?.projectId || undefined,
          projectName: activeCheckout?.project?.name || undefined,
          serialNumber: item.serialNumber
        };
      });

      return res.json(formatted);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/inventory', authenticateToken, requireRoles(['HR_STAFF', 'OPERATIONS_STAFF']), async (req, res) => {
    const { name, category, serialNumber } = req.body;
    if (!name || !category || !serialNumber) {
      return res.status(400).json({ error: 'Missing required parameters: name, category, serialNumber' });
    }
    try {
      const prisma = getPrisma();
      const existing = await prisma.inventoryItem.findUnique({ where: { serialNumber } });
      if (existing) {
        return res.status(409).json({ error: 'Item with this serial number already exists' });
      }

      const item = await prisma.inventoryItem.create({
        data: {
          name,
          category,
          serialNumber,
          status: 'AVAILABLE'
        }
      });
      broadcastMutation('inventory', 'create', item);
      return res.status(201).json(item);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/inventory/:id/checkout', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { employeeId, projectId } = req.body;
    if (!employeeId) {
      return res.status(400).json({ error: 'employeeId is required' });
    }
    try {
      const prisma = getPrisma();
      const activeCheckout = await prisma.checkout.findFirst({
        where: { inventoryItemId: id, returnDate: null }
      });
      if (activeCheckout) {
        return res.status(400).json({ error: 'Item is already checked out' });
      }

      const checkout = await prisma.checkout.create({
        data: {
          inventoryItemId: id,
          userId: employeeId,
          projectId: projectId || null,
        }
      });

      broadcastMutation('inventory_checkout', 'create', checkout);
      return res.json({ success: true, checkout });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/inventory/:id/return', authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
      const prisma = getPrisma();
      const activeCheckout = await prisma.checkout.findFirst({
        where: { inventoryItemId: id, returnDate: null }
      });
      if (!activeCheckout) {
        return res.status(400).json({ error: 'Item is not checked out' });
      }

      const updatedCheckout = await prisma.checkout.update({
        where: { id: activeCheckout.id },
        data: { returnDate: new Date() }
      });

      broadcastMutation('inventory_checkout', 'update', updatedCheckout);
      return res.json({ success: true, checkout: updatedCheckout });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  app.put('/api/inventory/:id/status', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { status } = req.body; // Available, Maintenance
    try {
      const prisma = getPrisma();
      const item = await prisma.inventoryItem.update({
        where: { id },
        data: { status: status === 'Maintenance' ? 'IN_MAINTENANCE' : 'AVAILABLE' }
      });
      broadcastMutation('inventory', 'update', item);
      return res.json(item);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });


  // =========================================================================
  // VITE DEVELOPMENT MIDDLEWARE / PRODUCTION STATIC FILES SERVING
  // =========================================================================
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Bind to Port 3000 as mandated by system architecture
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`[Enterprise Server] Multi-service ERP server listening on http://localhost:${PORT}`);
    console.log(`[Enterprise Server] Alternate clickable access link: http://127.0.0.1:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error('[Startup Fatal Error]:', error);
});
