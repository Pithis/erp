import { Router, Response } from 'express';
import { getPrisma } from '../db';
import { authenticateToken, requireRoles, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// Endpoint to allocate a schedule and dynamically verify conflicts
// Accessible to HR Staff and Operations Staff
router.post(
  '/api/schedule',
  authenticateToken,
  requireRoles(['HR_STAFF', 'OPERATIONS_STAFF']),
  async (req: AuthenticatedRequest, res: Response) => {
    const { employeeId, projectId, startTime, endTime, inventoryItemId, notes, freelancerRate } = req.body;

    if (!employeeId || !projectId || !startTime || !endTime) {
      return res.status(400).json({ error: 'Missing required fields: employeeId, projectId, startTime, endTime' });
    }

    const requestedStart = new Date(startTime);
    const requestedEnd = new Date(endTime);

    if (isNaN(requestedStart.getTime()) || isNaN(requestedEnd.getTime())) {
      return res.status(400).json({ error: 'Invalid date/time format' });
    }

    if (requestedStart >= requestedEnd) {
      return res.status(400).json({ error: 'Start time must be before end time' });
    }

    const prisma = getPrisma();

    try {
      // Execute the entire allocation inside a database transaction to prevent race conditions
      const result = await prisma.$transaction(async (tx) => {
        // 1. HUMAN AVAILABILITY & BUFFER CHECK
        // Fetch all existing schedules for the employee that might overlap
        const existingSchedules = await tx.scheduleEntry.findMany({
          where: { employeeId },
        });

        for (const existing of existingSchedules) {
          const existingStart = new Date(existing.startTime);
          const existingEnd = new Date(existing.endTime);

          // Determine buffer based on project venue (1 hour if different project, 0 if same)
          const isDifferentProject = existing.projectId !== projectId;
          const travelBufferMs = isDifferentProject ? 60 * 60 * 1000 : 0; // 1 hour in ms

          // Buffer-adjusted existing range
          const bufferedStart = new Date(existingStart.getTime() - travelBufferMs);
          const bufferedEnd = new Date(existingEnd.getTime() + travelBufferMs);

          // Overlap condition: (StartA < EndB) && (EndA > StartB)
          if (requestedStart < bufferedEnd && requestedEnd > bufferedStart) {
            const bufferReason = isDifferentProject 
              ? 'including a mandatory 1-hour travel buffer between different project venues' 
              : 'direct overlap';
            throw new Error(
              `Human conflict: Specialist is already booked on project ${existing.projectId} from ${existingStart.toLocaleTimeString()} to ${existingEnd.toLocaleTimeString()} (${bufferReason}).`
            );
          }
        }

        // 2. ASSET STATUS & DOUBLE-BOOKING CHECKS (if inventory item is provided)
        if (inventoryItemId) {
          const asset = await tx.inventoryItem.findUnique({
            where: { id: inventoryItemId },
          });

          if (!asset) {
            throw new Error(`Asset not found: ${inventoryItemId}`);
          }

          // Safety guard: Reject if flagged as IN_MAINTENANCE or RETIRED
          if (asset.status === 'IN_MAINTENANCE' || asset.status === 'RETIRED') {
            throw new Error(`Asset conflict: Hardware item "${asset.name}" is currently ${asset.status} and cannot be scheduled.`);
          }

          // Double-booking check: Prevent allocating if currently checked out and not returned
          const activeCheckout = await tx.checkout.findFirst({
            where: {
              inventoryItemId,
              returnDate: null,
            },
          });

          if (activeCheckout) {
            throw new Error(`Asset conflict: Hardware item "${asset.name}" is currently checked out to a running, non-returned event.`);
          }

          // Record a checkout of this hardware asset for the scheduled user & project
          await tx.checkout.create({
            data: {
              inventoryItemId,
              userId: employeeId,
              projectId,
              checkoutDate: requestedStart,
            },
          });
        }

        // 3. CREATE SCHEDULE ENTRY
        const newSchedule = await tx.scheduleEntry.create({
          data: {
            employeeId,
            projectId,
            startTime: requestedStart,
            endTime: requestedEnd,
            notes,
            freelancerRate: freelancerRate ? parseFloat(freelancerRate) : null,
            isApproved: false, // Default pending approval for timesheets
          },
          include: {
            employee: { select: { id: true, name: true, role: true } },
            project: { select: { id: true, name: true } },
          },
        });

        return newSchedule;
      });

      return res.status(201).json({
        success: true,
        message: 'Schedule allocated successfully with no conflicts.',
        data: result,
      });

    } catch (error: any) {
      console.error('[Scheduling transaction aborted]:', error.message);
      return res.status(409).json({
        success: false,
        error: error.message || 'Transaction aborted due to allocation conflict.',
      });
    }
  }
);

// Get all schedules
router.get('/api/schedule', authenticateToken, async (req, res) => {
  try {
    const prisma = getPrisma();
    const schedules = await prisma.scheduleEntry.findMany({
      include: {
        employee: { select: { name: true, role: true, contractType: true } },
        project: { select: { name: true, category: true } }
      },
      orderBy: { startTime: 'asc' }
    });
    return res.json(schedules);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// Approve a schedule/timesheet (useful for freelancer billing approval)
router.put(
  '/api/schedule/:id/approve',
  authenticateToken,
  requireRoles(['HR_STAFF', 'OPERATIONS_STAFF']),
  async (req, res) => {
    const { id } = req.params;
    try {
      const prisma = getPrisma();
      const updated = await prisma.scheduleEntry.update({
        where: { id },
        data: { isApproved: true },
        include: {
          employee: { select: { name: true } }
        }
      });
      return res.json({ success: true, message: `Timesheet approved for ${updated.employee.name}`, data: updated });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }
);

export default router;
