import { Router, Response } from 'express';
import { getPrisma } from '../db';
import { authenticateToken, requireRoles, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// Endpoint to calculate and export monthly payroll ledger
// Accessible to HR Staff and Stakeholders (management review)
router.get(
  '/api/payroll',
  authenticateToken,
  requireRoles(['HR_STAFF', 'STAKEHOLDER']),
  async (req: AuthenticatedRequest, res: Response) => {
    // Expected query param: month (format YYYY-MM, e.g., "2026-07")
    const monthQuery = (req.query.month as string) || '2026-07';
    
    // Parse start and end date of the target calendar month
    const year = parseInt(monthQuery.split('-')[0]) || 2026;
    const month = parseInt(monthQuery.split('-')[1]) || 7;
    
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1); // First day of next month

    const prisma = getPrisma();

    try {
      // 1. Fetch all users
      const users = await prisma.user.findMany({
        where: {
          role: {
            in: ['HR_STAFF', 'OPERATIONS_STAFF', 'CREATIVE_SPECIALIST']
          }
        },
        include: {
          tasks: {
            where: {
              status: 'Completed',
              updatedAt: {
                gte: startDate,
                lt: endDate,
              },
            },
          },
          schedules: {
            where: {
              isApproved: true,
              startTime: {
                gte: startDate,
                lt: endDate,
              },
            },
          },
        },
      });

      // 2. Aggregate payroll ledger entries
      const ledger = users.map((user) => {
        let grossPay = 0;
        let bonusEarnings = 0;
        let timesheetEarnings = 0;
        let totalHours = 0;

        // Task-based Performance Bonus:
        // Full-time and freelance workers both get a performance bonus for verified COMPLETED tasks in the target month.
        // High priority = $150 bonus, Medium = $100, Low = $50
        const completedTasksCount = user.tasks.length;
        user.tasks.forEach((task) => {
          if (task.priority === 'High') {
            bonusEarnings += 150;
          } else if (task.priority === 'Medium') {
            bonusEarnings += 100;
          } else {
            bonusEarnings += 50;
          }
        });

        if (user.contractType === 'FULL_TIME') {
          // Full-Time workers receive their base salary + performance bonuses
          grossPay = user.baseSalary + bonusEarnings;
        } else {
          // Freelancers receive hours worked * freelancer rate + task performance bonuses
          user.schedules.forEach((slot) => {
            const start = new Date(slot.startTime).getTime();
            const end = new Date(slot.endTime).getTime();
            const durationHours = Math.max(0, (end - start) / (1000 * 60 * 60));
            totalHours += durationHours;

            // Use the specific rate on the schedule entry, or fall back to a proportional base salary rate
            const rate = slot.freelancerRate || (user.baseSalary > 0 ? user.baseSalary / 160 : 50.0);
            timesheetEarnings += durationHours * rate;
          });

          grossPay = timesheetEarnings + bonusEarnings;
        }

        // Apply local compliance 12% tax withholding stub
        const taxWithholding = Math.round(grossPay * 0.12 * 100) / 100;
        const netPay = Math.round((grossPay - taxWithholding) * 100) / 100;

        return {
          employeeId: user.id,
          name: user.name,
          role: user.role,
          contractType: user.contractType,
          baseSalary: user.contractType === 'FULL_TIME' ? user.baseSalary : 0,
          timesheetHours: Math.round(totalHours * 10) / 10,
          timesheetEarnings: Math.round(timesheetEarnings * 100) / 100,
          bonusEarnings,
          completedTasksCount,
          grossPay: Math.round(grossPay * 100) / 100,
          taxWithholding,
          netPay,
        };
      });

      // 3. Summarize overall operational financials for Stakeholder / HR review
      const summary = ledger.reduce(
        (acc, curr) => {
          acc.totalGrossPay += curr.grossPay;
          acc.totalTaxWithholding += curr.taxWithholding;
          acc.totalNetPay += curr.netPay;
          acc.totalBonuses += curr.bonusEarnings;
          acc.totalFreelancerHours += curr.timesheetHours;
          return acc;
        },
        {
          totalGrossPay: 0,
          totalTaxWithholding: 0,
          totalNetPay: 0,
          totalBonuses: 0,
          totalFreelancerHours: 0,
        }
      );

      // Round summary totals to 2 decimal places
      summary.totalGrossPay = Math.round(summary.totalGrossPay * 100) / 100;
      summary.totalTaxWithholding = Math.round(summary.totalTaxWithholding * 100) / 100;
      summary.totalNetPay = Math.round(summary.totalNetPay * 100) / 100;
      summary.totalBonuses = Math.round(summary.totalBonuses * 100) / 100;
      summary.totalFreelancerHours = Math.round(summary.totalFreelancerHours * 10) / 10;

      return res.json({
        month: monthQuery,
        complianceTier: '12% Local Withholding Base Tax Stub',
        summary,
        ledger,
      });

    } catch (error: any) {
      console.error('[Payroll Calculation Error]:', error);
      return res.status(500).json({ error: error.message || 'Failed to aggregate hybrid payroll ledger.' });
    }
  }
);

export default router;
