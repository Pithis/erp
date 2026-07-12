import { Router, Response } from 'express';
import { getPrisma } from '../db';
import { authenticateToken, requireRoles, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// =========================================================================
// 1. CORE HR & EMPLOYEE PROFILES API
// =========================================================================

// Get all employee profiles mapped to typescript Employee type
router.get('/api/employees', authenticateToken, async (req, res) => {
  const prisma = getPrisma();
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'asc' }
    });

    const employees = users.map(u => ({
      id: u.id,
      name: u.name,
      role: u.role as any,
      email: u.email,
      baseSalary: u.baseSalary,
      isFreelancer: u.contractType === 'FREELANCE',
      status: 'Active' as const,
      joinedDate: u.createdAt.toISOString().split('T')[0]
    }));

    return res.json(employees);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Onboard new employee
router.post('/api/employees', authenticateToken, requireRoles(['HR_STAFF']), async (req, res) => {
  const { name, role, email, baseSalary, contractType } = req.body;
  if (!name || !role || !email) {
    return res.status(400).json({ error: 'Missing required fields: name, role, email' });
  }

  const prisma = getPrisma();
  try {
    // Check if user already exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: 'Employee with this email already exists' });
    }

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        role: role.toUpperCase().replace(/[^A-Z]/g, '_'), // normalize role
        passwordHash: '$2a$10$9v3YtU/wP73C7.lX8z3TGu4vG7uH8D8E8F8G8H8I8J8K8L8M8N8O8', // standard mock hash
        contractType: contractType || 'FULL_TIME',
        baseSalary: baseSalary ? parseFloat(baseSalary) : 5000.0
      }
    });

    // Create default EmployeeDetails record for the new employee
    await prisma.employeeDetails.create({
      data: {
        employeeId: newUser.id,
        personalPhone: '+1 (555) 000-0000',
        emergencyContactName: 'Not specified',
        emergencyContactPhone: '+1 (555) 000-0000',
        skills: '',
        certifications: '',
        department: 'General Staff',
        jobTitle: role,
        reportsTo: 'Operations Manager',
        customFields: '[]'
      }
    });

    return res.status(201).json({
      id: newUser.id,
      name: newUser.name,
      role: newUser.role,
      email: newUser.email,
      baseSalary: newUser.baseSalary,
      isFreelancer: newUser.contractType === 'FREELANCE',
      status: 'Active',
      joinedDate: newUser.createdAt.toISOString().split('T')[0]
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// =========================================================================
// 2. ATTENDANCE MANAGEMENT API
// =========================================================================

// Get attendance logs
router.get('/api/attendance', authenticateToken, async (req, res) => {
  const prisma = getPrisma();
  try {
    const logs = await prisma.attendanceLog.findMany({
      orderBy: { date: 'desc' }
    });
    return res.json(logs);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Punch check-in log
router.post('/api/attendance', authenticateToken, async (req, res) => {
  const { employeeId, employeeName, checkInTime, date, ipAddress, gpsLocation, status } = req.body;
  if (!employeeId || !checkInTime || !date) {
    return res.status(400).json({ error: 'Missing required check-in parameters' });
  }

  const prisma = getPrisma();
  try {
    const newLog = await prisma.attendanceLog.create({
      data: {
        employeeId,
        employeeName,
        checkInTime,
        date,
        ipAddress: ipAddress || '127.0.0.1',
        gpsLocation: gpsLocation || 'Not provided',
        status: status || 'On Time',
        isApproved: false
      }
    });
    return res.status(201).json(newLog);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Update attendance log (Check-out or approval/regularization)
router.put('/api/attendance/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { checkOutTime, status, isApproved, overtimeHours } = req.body;

  const prisma = getPrisma();
  try {
    const updated = await prisma.attendanceLog.update({
      where: { id },
      data: {
        ...(checkOutTime !== undefined ? { checkOutTime } : {}),
        ...(status !== undefined ? { status } : {}),
        ...(isApproved !== undefined ? { isApproved } : {}),
        ...(overtimeHours !== undefined ? { overtimeHours: parseFloat(overtimeHours) } : {})
      }
    });
    return res.json(updated);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// =========================================================================
// 3. LEAVE MANAGEMENT API
// =========================================================================

// Get leave requests
router.get('/api/leaves', authenticateToken, async (req, res) => {
  const prisma = getPrisma();
  try {
    const requests = await prisma.leaveRequest.findMany({
      orderBy: { requestedAt: 'desc' }
    });
    return res.json(requests);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Apply for leave
router.post('/api/leaves', authenticateToken, async (req, res) => {
  const { employeeId, employeeName, leaveType, startDate, endDate, reason, requestedAt } = req.body;
  if (!employeeId || !leaveType || !startDate || !endDate) {
    return res.status(400).json({ error: 'Missing leave request parameters' });
  }

  const prisma = getPrisma();
  try {
    const newRequest = await prisma.leaveRequest.create({
      data: {
        employeeId,
        employeeName,
        leaveType,
        startDate,
        endDate,
        reason: reason || '',
        status: 'Pending',
        requestedAt: requestedAt || new Date().toISOString().split('T')[0]
      }
    });
    return res.status(201).json(newRequest);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Update leave request status (Approve/Decline)
router.put('/api/leaves/:id', authenticateToken, requireRoles(['HR_STAFF']), async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // Pending, Approved, Declined

  if (!status) {
    return res.status(400).json({ error: 'Status is required' });
  }

  const prisma = getPrisma();
  try {
    const updated = await prisma.leaveRequest.update({
      where: { id },
      data: { status }
    });
    return res.json(updated);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// =========================================================================
// 4. HR HELP DESK API
// =========================================================================

// Get help desk tickets
router.get('/api/tickets', authenticateToken, async (req, res) => {
  const prisma = getPrisma();
  try {
    const tickets = await prisma.helpDeskTicket.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return res.json(tickets);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// File help desk ticket
router.post('/api/tickets', authenticateToken, async (req, res) => {
  const { employeeId, employeeName, category, title, description, priority, slaDeadline, createdAt } = req.body;
  if (!employeeId || !category || !title || !description) {
    return res.status(400).json({ error: 'Missing ticket information' });
  }

  const prisma = getPrisma();
  try {
    const newTicket = await prisma.helpDeskTicket.create({
      data: {
        employeeId,
        employeeName,
        category,
        title,
        description,
        priority: priority || 'Medium',
        status: 'Open',
        slaDeadline: slaDeadline || new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        createdAt: createdAt || new Date().toISOString().split('T')[0]
      }
    });
    return res.status(201).json(newTicket);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Update ticket status
router.put('/api/tickets/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // Open, In Progress, Resolved

  if (!status) {
    return res.status(400).json({ error: 'Status is required' });
  }

  const prisma = getPrisma();
  try {
    const updated = await prisma.helpDeskTicket.update({
      where: { id },
      data: { status }
    });
    return res.json(updated);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// =========================================================================
// 5. PERFORMANCE MANAGEMENT API
// =========================================================================

// Get performance appraisals
router.get('/api/appraisals', authenticateToken, async (req, res) => {
  const prisma = getPrisma();
  try {
    const appraisals = await prisma.performanceAppraisal.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return res.json(appraisals);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Submit performance appraisal
router.post('/api/appraisals', authenticateToken, async (req, res) => {
  const { employeeId, employeeName, year, okrGoal, kpiScore, selfAppraisal, managerAppraisal, peerFeedback, competencyAssessment } = req.body;
  if (!employeeId || !year || !okrGoal) {
    return res.status(400).json({ error: 'Missing performance appraisal parameters' });
  }

  const prisma = getPrisma();
  try {
    const newAppraisal = await prisma.performanceAppraisal.create({
      data: {
        employeeId,
        employeeName,
        year: parseInt(year),
        okrGoal,
        kpiScore: parseFloat(kpiScore || '0'),
        selfAppraisal: selfAppraisal || '',
        managerAppraisal: managerAppraisal || '',
        peerFeedback: peerFeedback || '',
        competencyAssessment: competencyAssessment || ''
      }
    });
    return res.status(201).json(newAppraisal);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// =========================================================================
// 6. DOSSIER & ADDITIONAL EMPLOYEE DETAILS API
// =========================================================================

// Get all details
router.get('/api/employee-details', authenticateToken, async (req, res) => {
  const prisma = getPrisma();
  try {
    const detailsList = await prisma.employeeDetails.findMany();
    // Parse fields for typescript output matching types.ts EmployeeDetails interface
    const formatted = detailsList.map(d => ({
      employeeId: d.employeeId,
      personalPhone: d.personalPhone,
      emergencyContactName: d.emergencyContactName,
      emergencyContactPhone: d.emergencyContactPhone,
      skills: d.skills ? d.skills.split(',').filter(Boolean) : [],
      certifications: d.certifications ? d.certifications.split(',').filter(Boolean) : [],
      department: d.department,
      jobTitle: d.jobTitle,
      reportsTo: d.reportsTo,
      customFields: JSON.parse(d.customFields || '[]'),
      offboardingChecklist: d.offboardingChecklist ? JSON.parse(d.offboardingChecklist) : undefined
    }));
    return res.json(formatted);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Save or update details
router.post('/api/employee-details', authenticateToken, async (req, res) => {
  const { employeeId, personalPhone, emergencyContactName, emergencyContactPhone, skills, certifications, department, jobTitle, reportsTo, customFields, offboardingChecklist } = req.body;
  if (!employeeId) {
    return res.status(400).json({ error: 'employeeId is required' });
  }

  const prisma = getPrisma();
  try {
    // stringify array and JSON objects
    const skillsStr = Array.isArray(skills) ? skills.join(',') : (skills || '');
    const certsStr = Array.isArray(certifications) ? certifications.join(',') : (certifications || '');
    const customFieldsStr = typeof customFields === 'string' ? customFields : JSON.stringify(customFields || []);
    const offboardingStr = offboardingChecklist ? (typeof offboardingChecklist === 'string' ? offboardingChecklist : JSON.stringify(offboardingChecklist)) : null;

    const dataPayload = {
      personalPhone: personalPhone || '+1 (555) 000-0000',
      emergencyContactName: emergencyContactName || 'Not specified',
      emergencyContactPhone: emergencyContactPhone || '+1 (555) 000-0000',
      skills: skillsStr,
      certifications: certsStr,
      department: department || 'General Staff',
      jobTitle: jobTitle || 'Specialist',
      reportsTo: reportsTo || 'Operations Manager',
      customFields: customFieldsStr,
      offboardingChecklist: offboardingStr
    };

    const details = await prisma.employeeDetails.upsert({
      where: { employeeId },
      update: dataPayload,
      create: {
        employeeId,
        ...dataPayload
      }
    });

    return res.json({
      employeeId: details.employeeId,
      personalPhone: details.personalPhone,
      emergencyContactName: details.emergencyContactName,
      emergencyContactPhone: details.emergencyContactPhone,
      skills: details.skills ? details.skills.split(',').filter(Boolean) : [],
      certifications: details.certifications ? details.certifications.split(',').filter(Boolean) : [],
      department: details.department,
      jobTitle: details.jobTitle,
      reportsTo: details.reportsTo,
      customFields: JSON.parse(details.customFields || '[]'),
      offboardingChecklist: details.offboardingChecklist ? JSON.parse(details.offboardingChecklist) : undefined
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// =========================================================================
// 7. HUB SURVEYS & POLLS API
// =========================================================================

// Get engagement poll
router.get('/api/engagement-poll', authenticateToken, async (req, res) => {
  const prisma = getPrisma();
  try {
    let poll = await prisma.engagementPoll.findUnique({
      where: { id: 'poll-global' }
    });

    if (!poll) {
      // Seed an initial poll
      poll = await prisma.engagementPoll.create({
        data: {
          id: 'poll-global',
          question: 'Which cultural initiative should we prioritize for Q3 2026?',
          options: JSON.stringify([
            { text: 'Digital Arts Hackathon', votes: 12 },
            { text: 'Remote Wellness Stipends', votes: 18 },
            { text: 'Continuous Learning Grants', votes: 24 },
            { text: 'Bi-weekly Creative Showcases', votes: 14 }
          ]),
          userVotedIndex: null
        }
      });
    }

    return res.json({
      question: poll.question,
      options: JSON.parse(poll.options),
      userVotedIndex: poll.userVotedIndex !== null ? poll.userVotedIndex : undefined
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Cast vote in engagement poll
router.post('/api/engagement-poll/vote', authenticateToken, async (req, res) => {
  const { optionIndex } = req.body;
  if (optionIndex === undefined) {
    return res.status(400).json({ error: 'optionIndex is required' });
  }

  const prisma = getPrisma();
  try {
    const poll = await prisma.engagementPoll.findUnique({
      where: { id: 'poll-global' }
    });

    if (!poll) {
      return res.status(404).json({ error: 'Poll not found' });
    }

    const options = JSON.parse(poll.options);
    if (optionIndex < 0 || optionIndex >= options.length) {
      return res.status(400).json({ error: 'Invalid option index' });
    }

    // Increment votes
    options[optionIndex].votes += 1;

    const updated = await prisma.engagementPoll.update({
      where: { id: 'poll-global' },
      data: {
        options: JSON.stringify(options),
        userVotedIndex: optionIndex
      }
    });

    return res.json({
      question: updated.question,
      options: JSON.parse(updated.options),
      userVotedIndex: updated.userVotedIndex !== null ? updated.userVotedIndex : undefined
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// =========================================================================
// 8. HUB DISCUSSION FORUMS API
// =========================================================================

// Get forum posts
router.get('/api/forum-posts', authenticateToken, async (req, res) => {
  const prisma = getPrisma();
  try {
    const posts = await prisma.forumPost.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return res.json(posts.map(p => ({
      id: p.id,
      authorName: p.authorName,
      authorRole: p.authorRole,
      content: p.content,
      timestamp: p.timestamp
    })));
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Add forum post
router.post('/api/forum-posts', authenticateToken, async (req, res) => {
  const { content, authorName, authorRole } = req.body;
  if (!content || !authorName) {
    return res.status(400).json({ error: 'content and authorName are required' });
  }

  const prisma = getPrisma();
  try {
    const newPost = await prisma.forumPost.create({
      data: {
        authorName,
        authorRole: authorRole || 'Team Member',
        content,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' today'
      }
    });
    return res.status(201).json({
      id: newPost.id,
      authorName: newPost.authorName,
      authorRole: newPost.authorRole,
      content: newPost.content,
      timestamp: newPost.timestamp
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
