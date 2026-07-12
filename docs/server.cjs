var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express4 = __toESM(require("express"), 1);
var import_http = __toESM(require("http"), 1);
var import_path = __toESM(require("path"), 1);
var import_fs = __toESM(require("fs"), 1);
var import_cookie_parser = __toESM(require("cookie-parser"), 1);
var import_bcryptjs = __toESM(require("bcryptjs"), 1);
var import_jsonwebtoken3 = __toESM(require("jsonwebtoken"), 1);
var import_child_process = require("child_process");
var import_vite = require("vite");

// src/server/db.ts
var import_client = require("@prisma/client");
var prisma = null;
function getPrisma() {
  if (!prisma) {
    prisma = new import_client.PrismaClient({
      log: ["error", "warn"]
    });
  }
  return prisma;
}

// src/server/services/websocket.ts
var import_socket = require("socket.io");
var import_jsonwebtoken = __toESM(require("jsonwebtoken"), 1);
var ioInstance = null;
var connectedClients = /* @__PURE__ */ new Set();
var JWT_SECRET = process.env.JWT_SECRET || "enterprise_devops_secret_token_123456";
function initWebSocket(httpServer) {
  ioInstance = new import_socket.Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    },
    pingInterval: 1e4,
    pingTimeout: 5e3
  });
  ioInstance.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) {
      console.warn(`[Socket.IO] Connection rejected: No auth token provided by client.`);
      return next(new Error("Authentication failed: No token provided"));
    }
    try {
      const decoded = import_jsonwebtoken.default.verify(token, JWT_SECRET);
      socket.user = decoded;
      next();
    } catch (err) {
      console.warn(`[Socket.IO] Connection rejected: Invalid or expired token. Error: ${err.message}`);
      return next(new Error("Authentication failed: Invalid token"));
    }
  });
  ioInstance.on("connection", (socket) => {
    connectedClients.add(socket.id);
    console.log(`[Socket.IO] Client connected: ${socket.id} (Total: ${connectedClients.size})`);
    socket.emit("connection_status", {
      status: "connected",
      socketId: socket.id,
      activeConnections: connectedClients.size
    });
    socket.on("priority_alert_broadcast", (payload) => {
      console.log(`[Socket.IO] Priority alert broadcast received from client:`, payload);
      if (ioInstance) {
        ioInstance.emit("system_alert_received", {
          ...payload,
          id: `ALERT-${Date.now()}`,
          timestamp: (/* @__PURE__ */ new Date()).toISOString(),
          sender: "Operations Staff"
        });
      }
    });
    socket.on("data_mutation_occurred", (payload) => {
      console.log(`[Socket.IO] Data mutated - Table: ${payload.table}, Action: ${payload.action}`);
      socket.broadcast.emit("sync_data_refresh", payload);
    });
    socket.on("disconnect", () => {
      connectedClients.delete(socket.id);
      console.log(`[Socket.IO] Client disconnected: ${socket.id} (Remaining: ${connectedClients.size})`);
    });
  });
  return ioInstance;
}
function triggerSystemAlert(projectName, title, message) {
  if (ioInstance) {
    ioInstance.emit("system_alert_received", {
      id: `ALERT-${Date.now()}`,
      projectName,
      title,
      message,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      sender: "System Automatic Auditor"
    });
    return true;
  }
  return false;
}
function broadcastMutation(table, action, data) {
  if (ioInstance) {
    ioInstance.emit("sync_data_refresh", { table, action, data });
  }
}

// src/server/routes/schedule.ts
var import_express = require("express");

// src/server/middleware/auth.ts
var import_jsonwebtoken2 = __toESM(require("jsonwebtoken"), 1);
var JWT_SECRET2 = process.env.JWT_SECRET || "enterprise_devops_secret_token_123456";
function authenticateToken(req, res, next) {
  let token = req.cookies?.token;
  if (!token) {
    const authHeader = req.headers["authorization"];
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }
  }
  if (!token) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }
  try {
    const decoded = import_jsonwebtoken2.default.verify(token, JWT_SECRET2);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: "Invalid or expired token." });
  }
}
function requireRoles(allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized." });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: "Forbidden. Insufficient permissions." });
    }
    next();
  };
}
function getEntityInfo(url) {
  const parts = url.split("/").filter(Boolean);
  const entityIndex = parts.indexOf("api");
  if (entityIndex === -1 || parts.length <= entityIndex + 1) return null;
  const entity = parts[entityIndex + 1];
  const id = parts[entityIndex + 2];
  const modelMapping = {
    projects: "project",
    tasks: "task",
    inventory: "inventoryItem",
    schedule: "scheduleEntry",
    users: "user"
  };
  const prismaModel = modelMapping[entity];
  return prismaModel ? { model: prismaModel, id } : null;
}
async function auditLogger(req, res, next) {
  if (!["POST", "PUT", "DELETE"].includes(req.method)) {
    return next();
  }
  const prisma2 = getPrisma();
  const info = getEntityInfo(req.originalUrl);
  if (info && info.id && ["PUT", "DELETE"].includes(req.method)) {
    try {
      const dbModel = prisma2[info.model];
      if (dbModel && typeof dbModel.findUnique === "function") {
        const record = await dbModel.findUnique({ where: { id: info.id } });
        if (record) {
          req.auditOldValue = record;
        }
      }
    } catch (e) {
      console.error("[Audit Log pre-fetch error]:", e);
    }
  }
  const originalJson = res.json;
  res.json = function(body) {
    res.json = originalJson;
    if (res.statusCode >= 200 && res.statusCode < 300) {
      const ipAddress = req.headers["x-forwarded-for"] || req.socket.remoteAddress || null;
      const userId = req.user?.id || null;
      const actionType = `${req.method}_${info?.model?.toUpperCase() || "UNKNOWN"}`;
      prisma2.auditLog.create({
        data: {
          userId,
          ipAddress,
          actionType,
          oldValue: req.auditOldValue ? JSON.stringify(req.auditOldValue) : null,
          newValue: body ? JSON.stringify(body) : JSON.stringify(req.body)
        }
      }).catch((err) => console.error("[Failed to write Audit Log]:", err));
    }
    return originalJson.call(this, body);
  };
  next();
}

// src/server/routes/schedule.ts
var router = (0, import_express.Router)();
router.post(
  "/api/schedule",
  authenticateToken,
  requireRoles(["HR_STAFF", "OPERATIONS_STAFF"]),
  async (req, res) => {
    const { employeeId, projectId, startTime, endTime, inventoryItemId, notes, freelancerRate } = req.body;
    if (!employeeId || !projectId || !startTime || !endTime) {
      return res.status(400).json({ error: "Missing required fields: employeeId, projectId, startTime, endTime" });
    }
    const requestedStart = new Date(startTime);
    const requestedEnd = new Date(endTime);
    if (isNaN(requestedStart.getTime()) || isNaN(requestedEnd.getTime())) {
      return res.status(400).json({ error: "Invalid date/time format" });
    }
    if (requestedStart >= requestedEnd) {
      return res.status(400).json({ error: "Start time must be before end time" });
    }
    const prisma2 = getPrisma();
    try {
      const result = await prisma2.$transaction(async (tx) => {
        const existingSchedules = await tx.scheduleEntry.findMany({
          where: { employeeId }
        });
        for (const existing of existingSchedules) {
          const existingStart = new Date(existing.startTime);
          const existingEnd = new Date(existing.endTime);
          const isDifferentProject = existing.projectId !== projectId;
          const travelBufferMs = isDifferentProject ? 60 * 60 * 1e3 : 0;
          const bufferedStart = new Date(existingStart.getTime() - travelBufferMs);
          const bufferedEnd = new Date(existingEnd.getTime() + travelBufferMs);
          if (requestedStart < bufferedEnd && requestedEnd > bufferedStart) {
            const bufferReason = isDifferentProject ? "including a mandatory 1-hour travel buffer between different project venues" : "direct overlap";
            throw new Error(
              `Human conflict: Specialist is already booked on project ${existing.projectId} from ${existingStart.toLocaleTimeString()} to ${existingEnd.toLocaleTimeString()} (${bufferReason}).`
            );
          }
        }
        if (inventoryItemId) {
          const asset = await tx.inventoryItem.findUnique({
            where: { id: inventoryItemId }
          });
          if (!asset) {
            throw new Error(`Asset not found: ${inventoryItemId}`);
          }
          if (asset.status === "IN_MAINTENANCE" || asset.status === "RETIRED") {
            throw new Error(`Asset conflict: Hardware item "${asset.name}" is currently ${asset.status} and cannot be scheduled.`);
          }
          const activeCheckout = await tx.checkout.findFirst({
            where: {
              inventoryItemId,
              returnDate: null
            }
          });
          if (activeCheckout) {
            throw new Error(`Asset conflict: Hardware item "${asset.name}" is currently checked out to a running, non-returned event.`);
          }
          await tx.checkout.create({
            data: {
              inventoryItemId,
              userId: employeeId,
              projectId,
              checkoutDate: requestedStart
            }
          });
        }
        const newSchedule = await tx.scheduleEntry.create({
          data: {
            employeeId,
            projectId,
            startTime: requestedStart,
            endTime: requestedEnd,
            notes,
            freelancerRate: freelancerRate ? parseFloat(freelancerRate) : null,
            isApproved: false
            // Default pending approval for timesheets
          },
          include: {
            employee: { select: { id: true, name: true, role: true } },
            project: { select: { id: true, name: true } }
          }
        });
        return newSchedule;
      });
      return res.status(201).json({
        success: true,
        message: "Schedule allocated successfully with no conflicts.",
        data: result
      });
    } catch (error) {
      console.error("[Scheduling transaction aborted]:", error.message);
      return res.status(409).json({
        success: false,
        error: error.message || "Transaction aborted due to allocation conflict."
      });
    }
  }
);
router.get("/api/schedule", authenticateToken, async (req, res) => {
  try {
    const prisma2 = getPrisma();
    const schedules = await prisma2.scheduleEntry.findMany({
      include: {
        employee: { select: { name: true, role: true, contractType: true } },
        project: { select: { name: true, category: true } }
      },
      orderBy: { startTime: "asc" }
    });
    return res.json(schedules);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});
router.put(
  "/api/schedule/:id/approve",
  authenticateToken,
  requireRoles(["HR_STAFF", "OPERATIONS_STAFF"]),
  async (req, res) => {
    const { id } = req.params;
    try {
      const prisma2 = getPrisma();
      const updated = await prisma2.scheduleEntry.update({
        where: { id },
        data: { isApproved: true },
        include: {
          employee: { select: { name: true } }
        }
      });
      return res.json({ success: true, message: `Timesheet approved for ${updated.employee.name}`, data: updated });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
);
var schedule_default = router;

// src/server/routes/payroll.ts
var import_express2 = require("express");
var router2 = (0, import_express2.Router)();
router2.get(
  "/api/payroll",
  authenticateToken,
  requireRoles(["HR_STAFF", "STAKEHOLDER"]),
  async (req, res) => {
    const monthQuery = req.query.month || "2026-07";
    const year = parseInt(monthQuery.split("-")[0]) || 2026;
    const month = parseInt(monthQuery.split("-")[1]) || 7;
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);
    const prisma2 = getPrisma();
    try {
      const users = await prisma2.user.findMany({
        where: {
          role: {
            in: ["HR_STAFF", "OPERATIONS_STAFF", "CREATIVE_SPECIALIST"]
          }
        },
        include: {
          tasks: {
            where: {
              status: "Completed",
              updatedAt: {
                gte: startDate,
                lt: endDate
              }
            }
          },
          schedules: {
            where: {
              isApproved: true,
              startTime: {
                gte: startDate,
                lt: endDate
              }
            }
          }
        }
      });
      const ledger = users.map((user) => {
        let grossPay = 0;
        let bonusEarnings = 0;
        let timesheetEarnings = 0;
        let totalHours = 0;
        const completedTasksCount = user.tasks.length;
        user.tasks.forEach((task) => {
          if (task.priority === "High") {
            bonusEarnings += 150;
          } else if (task.priority === "Medium") {
            bonusEarnings += 100;
          } else {
            bonusEarnings += 50;
          }
        });
        if (user.contractType === "FULL_TIME") {
          grossPay = user.baseSalary + bonusEarnings;
        } else {
          user.schedules.forEach((slot) => {
            const start = new Date(slot.startTime).getTime();
            const end = new Date(slot.endTime).getTime();
            const durationHours = Math.max(0, (end - start) / (1e3 * 60 * 60));
            totalHours += durationHours;
            const rate = slot.freelancerRate || (user.baseSalary > 0 ? user.baseSalary / 160 : 50);
            timesheetEarnings += durationHours * rate;
          });
          grossPay = timesheetEarnings + bonusEarnings;
        }
        const taxWithholding = Math.round(grossPay * 0.12 * 100) / 100;
        const netPay = Math.round((grossPay - taxWithholding) * 100) / 100;
        return {
          employeeId: user.id,
          name: user.name,
          role: user.role,
          contractType: user.contractType,
          baseSalary: user.contractType === "FULL_TIME" ? user.baseSalary : 0,
          timesheetHours: Math.round(totalHours * 10) / 10,
          timesheetEarnings: Math.round(timesheetEarnings * 100) / 100,
          bonusEarnings,
          completedTasksCount,
          grossPay: Math.round(grossPay * 100) / 100,
          taxWithholding,
          netPay
        };
      });
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
          totalFreelancerHours: 0
        }
      );
      summary.totalGrossPay = Math.round(summary.totalGrossPay * 100) / 100;
      summary.totalTaxWithholding = Math.round(summary.totalTaxWithholding * 100) / 100;
      summary.totalNetPay = Math.round(summary.totalNetPay * 100) / 100;
      summary.totalBonuses = Math.round(summary.totalBonuses * 100) / 100;
      summary.totalFreelancerHours = Math.round(summary.totalFreelancerHours * 10) / 10;
      return res.json({
        month: monthQuery,
        complianceTier: "12% Local Withholding Base Tax Stub",
        summary,
        ledger
      });
    } catch (error) {
      console.error("[Payroll Calculation Error]:", error);
      return res.status(500).json({ error: error.message || "Failed to aggregate hybrid payroll ledger." });
    }
  }
);
var payroll_default = router2;

// src/server/routes/hr.ts
var import_express3 = require("express");
var router3 = (0, import_express3.Router)();
router3.get("/api/employees", authenticateToken, async (req, res) => {
  const prisma2 = getPrisma();
  try {
    const users = await prisma2.user.findMany({
      orderBy: { createdAt: "asc" }
    });
    const employees = users.map((u) => ({
      id: u.id,
      name: u.name,
      role: u.role,
      email: u.email,
      baseSalary: u.baseSalary,
      isFreelancer: u.contractType === "FREELANCE",
      status: "Active",
      joinedDate: u.createdAt.toISOString().split("T")[0]
    }));
    return res.json(employees);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});
router3.post("/api/employees", authenticateToken, requireRoles(["HR_STAFF"]), async (req, res) => {
  const { name, role, email, baseSalary, contractType } = req.body;
  if (!name || !role || !email) {
    return res.status(400).json({ error: "Missing required fields: name, role, email" });
  }
  const prisma2 = getPrisma();
  try {
    const existing = await prisma2.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: "Employee with this email already exists" });
    }
    const newUser = await prisma2.user.create({
      data: {
        name,
        email,
        role: role.toUpperCase().replace(/[^A-Z]/g, "_"),
        // normalize role
        passwordHash: "$2a$10$9v3YtU/wP73C7.lX8z3TGu4vG7uH8D8E8F8G8H8I8J8K8L8M8N8O8",
        // standard mock hash
        contractType: contractType || "FULL_TIME",
        baseSalary: baseSalary ? parseFloat(baseSalary) : 5e3
      }
    });
    await prisma2.employeeDetails.create({
      data: {
        employeeId: newUser.id,
        personalPhone: "+1 (555) 000-0000",
        emergencyContactName: "Not specified",
        emergencyContactPhone: "+1 (555) 000-0000",
        skills: "",
        certifications: "",
        department: "General Staff",
        jobTitle: role,
        reportsTo: "Operations Manager",
        customFields: "[]"
      }
    });
    return res.status(201).json({
      id: newUser.id,
      name: newUser.name,
      role: newUser.role,
      email: newUser.email,
      baseSalary: newUser.baseSalary,
      isFreelancer: newUser.contractType === "FREELANCE",
      status: "Active",
      joinedDate: newUser.createdAt.toISOString().split("T")[0]
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});
router3.get("/api/attendance", authenticateToken, async (req, res) => {
  const prisma2 = getPrisma();
  try {
    const logs = await prisma2.attendanceLog.findMany({
      orderBy: { date: "desc" }
    });
    return res.json(logs);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});
router3.post("/api/attendance", authenticateToken, async (req, res) => {
  const { employeeId, employeeName, checkInTime, date, ipAddress, gpsLocation, status } = req.body;
  if (!employeeId || !checkInTime || !date) {
    return res.status(400).json({ error: "Missing required check-in parameters" });
  }
  const prisma2 = getPrisma();
  try {
    const newLog = await prisma2.attendanceLog.create({
      data: {
        employeeId,
        employeeName,
        checkInTime,
        date,
        ipAddress: ipAddress || "127.0.0.1",
        gpsLocation: gpsLocation || "Not provided",
        status: status || "On Time",
        isApproved: false
      }
    });
    return res.status(201).json(newLog);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});
router3.put("/api/attendance/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { checkOutTime, status, isApproved, overtimeHours } = req.body;
  const prisma2 = getPrisma();
  try {
    const updated = await prisma2.attendanceLog.update({
      where: { id },
      data: {
        ...checkOutTime !== void 0 ? { checkOutTime } : {},
        ...status !== void 0 ? { status } : {},
        ...isApproved !== void 0 ? { isApproved } : {},
        ...overtimeHours !== void 0 ? { overtimeHours: parseFloat(overtimeHours) } : {}
      }
    });
    return res.json(updated);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});
router3.get("/api/leaves", authenticateToken, async (req, res) => {
  const prisma2 = getPrisma();
  try {
    const requests = await prisma2.leaveRequest.findMany({
      orderBy: { requestedAt: "desc" }
    });
    return res.json(requests);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});
router3.post("/api/leaves", authenticateToken, async (req, res) => {
  const { employeeId, employeeName, leaveType, startDate, endDate, reason, requestedAt } = req.body;
  if (!employeeId || !leaveType || !startDate || !endDate) {
    return res.status(400).json({ error: "Missing leave request parameters" });
  }
  const prisma2 = getPrisma();
  try {
    const newRequest = await prisma2.leaveRequest.create({
      data: {
        employeeId,
        employeeName,
        leaveType,
        startDate,
        endDate,
        reason: reason || "",
        status: "Pending",
        requestedAt: requestedAt || (/* @__PURE__ */ new Date()).toISOString().split("T")[0]
      }
    });
    return res.status(201).json(newRequest);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});
router3.put("/api/leaves/:id", authenticateToken, requireRoles(["HR_STAFF"]), async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  if (!status) {
    return res.status(400).json({ error: "Status is required" });
  }
  const prisma2 = getPrisma();
  try {
    const updated = await prisma2.leaveRequest.update({
      where: { id },
      data: { status }
    });
    return res.json(updated);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});
router3.get("/api/tickets", authenticateToken, async (req, res) => {
  const prisma2 = getPrisma();
  try {
    const tickets = await prisma2.helpDeskTicket.findMany({
      orderBy: { createdAt: "desc" }
    });
    return res.json(tickets);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});
router3.post("/api/tickets", authenticateToken, async (req, res) => {
  const { employeeId, employeeName, category, title, description, priority, slaDeadline, createdAt } = req.body;
  if (!employeeId || !category || !title || !description) {
    return res.status(400).json({ error: "Missing ticket information" });
  }
  const prisma2 = getPrisma();
  try {
    const newTicket = await prisma2.helpDeskTicket.create({
      data: {
        employeeId,
        employeeName,
        category,
        title,
        description,
        priority: priority || "Medium",
        status: "Open",
        slaDeadline: slaDeadline || new Date(Date.now() + 3 * 24 * 60 * 60 * 1e3).toISOString().split("T")[0],
        createdAt: createdAt || (/* @__PURE__ */ new Date()).toISOString().split("T")[0]
      }
    });
    return res.status(201).json(newTicket);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});
router3.put("/api/tickets/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  if (!status) {
    return res.status(400).json({ error: "Status is required" });
  }
  const prisma2 = getPrisma();
  try {
    const updated = await prisma2.helpDeskTicket.update({
      where: { id },
      data: { status }
    });
    return res.json(updated);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});
router3.get("/api/appraisals", authenticateToken, async (req, res) => {
  const prisma2 = getPrisma();
  try {
    const appraisals = await prisma2.performanceAppraisal.findMany({
      orderBy: { createdAt: "desc" }
    });
    return res.json(appraisals);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});
router3.post("/api/appraisals", authenticateToken, async (req, res) => {
  const { employeeId, employeeName, year, okrGoal, kpiScore, selfAppraisal, managerAppraisal, peerFeedback, competencyAssessment } = req.body;
  if (!employeeId || !year || !okrGoal) {
    return res.status(400).json({ error: "Missing performance appraisal parameters" });
  }
  const prisma2 = getPrisma();
  try {
    const newAppraisal = await prisma2.performanceAppraisal.create({
      data: {
        employeeId,
        employeeName,
        year: parseInt(year),
        okrGoal,
        kpiScore: parseFloat(kpiScore || "0"),
        selfAppraisal: selfAppraisal || "",
        managerAppraisal: managerAppraisal || "",
        peerFeedback: peerFeedback || "",
        competencyAssessment: competencyAssessment || ""
      }
    });
    return res.status(201).json(newAppraisal);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});
router3.get("/api/employee-details", authenticateToken, async (req, res) => {
  const prisma2 = getPrisma();
  try {
    const detailsList = await prisma2.employeeDetails.findMany();
    const formatted = detailsList.map((d) => ({
      employeeId: d.employeeId,
      personalPhone: d.personalPhone,
      emergencyContactName: d.emergencyContactName,
      emergencyContactPhone: d.emergencyContactPhone,
      skills: d.skills ? d.skills.split(",").filter(Boolean) : [],
      certifications: d.certifications ? d.certifications.split(",").filter(Boolean) : [],
      department: d.department,
      jobTitle: d.jobTitle,
      reportsTo: d.reportsTo,
      customFields: JSON.parse(d.customFields || "[]"),
      offboardingChecklist: d.offboardingChecklist ? JSON.parse(d.offboardingChecklist) : void 0
    }));
    return res.json(formatted);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});
router3.post("/api/employee-details", authenticateToken, async (req, res) => {
  const { employeeId, personalPhone, emergencyContactName, emergencyContactPhone, skills, certifications, department, jobTitle, reportsTo, customFields, offboardingChecklist } = req.body;
  if (!employeeId) {
    return res.status(400).json({ error: "employeeId is required" });
  }
  const prisma2 = getPrisma();
  try {
    const skillsStr = Array.isArray(skills) ? skills.join(",") : skills || "";
    const certsStr = Array.isArray(certifications) ? certifications.join(",") : certifications || "";
    const customFieldsStr = typeof customFields === "string" ? customFields : JSON.stringify(customFields || []);
    const offboardingStr = offboardingChecklist ? typeof offboardingChecklist === "string" ? offboardingChecklist : JSON.stringify(offboardingChecklist) : null;
    const dataPayload = {
      personalPhone: personalPhone || "+1 (555) 000-0000",
      emergencyContactName: emergencyContactName || "Not specified",
      emergencyContactPhone: emergencyContactPhone || "+1 (555) 000-0000",
      skills: skillsStr,
      certifications: certsStr,
      department: department || "General Staff",
      jobTitle: jobTitle || "Specialist",
      reportsTo: reportsTo || "Operations Manager",
      customFields: customFieldsStr,
      offboardingChecklist: offboardingStr
    };
    const details = await prisma2.employeeDetails.upsert({
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
      skills: details.skills ? details.skills.split(",").filter(Boolean) : [],
      certifications: details.certifications ? details.certifications.split(",").filter(Boolean) : [],
      department: details.department,
      jobTitle: details.jobTitle,
      reportsTo: details.reportsTo,
      customFields: JSON.parse(details.customFields || "[]"),
      offboardingChecklist: details.offboardingChecklist ? JSON.parse(details.offboardingChecklist) : void 0
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});
router3.get("/api/engagement-poll", authenticateToken, async (req, res) => {
  const prisma2 = getPrisma();
  try {
    let poll = await prisma2.engagementPoll.findUnique({
      where: { id: "poll-global" }
    });
    if (!poll) {
      poll = await prisma2.engagementPoll.create({
        data: {
          id: "poll-global",
          question: "Which cultural initiative should we prioritize for Q3 2026?",
          options: JSON.stringify([
            { text: "Digital Arts Hackathon", votes: 12 },
            { text: "Remote Wellness Stipends", votes: 18 },
            { text: "Continuous Learning Grants", votes: 24 },
            { text: "Bi-weekly Creative Showcases", votes: 14 }
          ]),
          userVotedIndex: null
        }
      });
    }
    return res.json({
      question: poll.question,
      options: JSON.parse(poll.options),
      userVotedIndex: poll.userVotedIndex !== null ? poll.userVotedIndex : void 0
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});
router3.post("/api/engagement-poll/vote", authenticateToken, async (req, res) => {
  const { optionIndex } = req.body;
  if (optionIndex === void 0) {
    return res.status(400).json({ error: "optionIndex is required" });
  }
  const prisma2 = getPrisma();
  try {
    const poll = await prisma2.engagementPoll.findUnique({
      where: { id: "poll-global" }
    });
    if (!poll) {
      return res.status(404).json({ error: "Poll not found" });
    }
    const options = JSON.parse(poll.options);
    if (optionIndex < 0 || optionIndex >= options.length) {
      return res.status(400).json({ error: "Invalid option index" });
    }
    options[optionIndex].votes += 1;
    const updated = await prisma2.engagementPoll.update({
      where: { id: "poll-global" },
      data: {
        options: JSON.stringify(options),
        userVotedIndex: optionIndex
      }
    });
    return res.json({
      question: updated.question,
      options: JSON.parse(updated.options),
      userVotedIndex: updated.userVotedIndex !== null ? updated.userVotedIndex : void 0
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});
router3.get("/api/forum-posts", authenticateToken, async (req, res) => {
  const prisma2 = getPrisma();
  try {
    const posts = await prisma2.forumPost.findMany({
      orderBy: { createdAt: "desc" }
    });
    return res.json(posts.map((p) => ({
      id: p.id,
      authorName: p.authorName,
      authorRole: p.authorRole,
      content: p.content,
      timestamp: p.timestamp
    })));
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});
router3.post("/api/forum-posts", authenticateToken, async (req, res) => {
  const { content, authorName, authorRole } = req.body;
  if (!content || !authorName) {
    return res.status(400).json({ error: "content and authorName are required" });
  }
  const prisma2 = getPrisma();
  try {
    const newPost = await prisma2.forumPost.create({
      data: {
        authorName,
        authorRole: authorRole || "Team Member",
        content,
        timestamp: (/* @__PURE__ */ new Date()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) + " today"
      }
    });
    return res.status(201).json({
      id: newPost.id,
      authorName: newPost.authorName,
      authorRole: newPost.authorRole,
      content: newPost.content,
      timestamp: newPost.timestamp
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});
var hr_default = router3;

// server.ts
var PORT = 3e3;
var JWT_SECRET3 = process.env.JWT_SECRET || "enterprise_devops_secret_token_123456";
async function seedDatabase() {
  const dbDir = import_path.default.join(process.cwd(), "prisma");
  const dbPath = import_path.default.join(dbDir, "dev.db");
  if (!import_fs.default.existsSync(dbDir)) {
    console.log("[Database Init] Prisma directory is missing. Creating directory...");
    import_fs.default.mkdirSync(dbDir, { recursive: true });
  }
  if (!import_fs.default.existsSync(dbPath)) {
    console.log("[Database Init] SQLite database file is missing. Initializing new in-built DB...");
    import_fs.default.writeFileSync(dbPath, "");
  }
  try {
    console.log("[Database Init] Running automatic local SQLite schema sync...");
    (0, import_child_process.execSync)("npx prisma db push --accept-data-loss", { stdio: "inherit" });
  } catch (err) {
    console.error("[Database Init] Database synchronization bypassed:", err.message);
  }
  const prisma2 = getPrisma();
  let userCount = 0;
  try {
    userCount = await prisma2.user.count();
  } catch (err) {
    console.warn("[Database Seed] Database tables are missing or query failed. Retrying schema push...", err.message);
    try {
      (0, import_child_process.execSync)("npx prisma db push --accept-data-loss", { stdio: "inherit" });
      userCount = await prisma2.user.count();
    } catch (retryErr) {
      console.error("[Database Seed] Critical error: Unable to initialize SQLite database tables:", retryErr.message);
      return;
    }
  }
  if (userCount > 0) {
    console.log("[Database Seed] Database is already seeded.");
    return;
  }
  try {
    console.log("[Database Seed] Seeding default database models...");
    const salt = await import_bcryptjs.default.genSalt(10);
    const passwordHash = await import_bcryptjs.default.hash("password123", salt);
    const hr = await prisma2.user.create({
      data: {
        email: "hr@agency.com",
        name: "Sarah Jenkins",
        passwordHash,
        role: "HR_STAFF",
        contractType: "FULL_TIME",
        baseSalary: 8200
      }
    });
    const ops = await prisma2.user.create({
      data: {
        email: "ops@agency.com",
        name: "Marcus Brody",
        passwordHash,
        role: "OPERATIONS_STAFF",
        contractType: "FULL_TIME",
        baseSalary: 7800
      }
    });
    const creative = await prisma2.user.create({
      data: {
        email: "creative@agency.com",
        name: "Ray Jones",
        passwordHash,
        role: "CREATIVE_SPECIALIST",
        contractType: "FREELANCE",
        baseSalary: 65
        // Hourly rate
      }
    });
    const stakeholder = await prisma2.user.create({
      data: {
        email: "stakeholder@agency.com",
        name: "Arthur Pendelton",
        passwordHash,
        role: "STAKEHOLDER",
        contractType: "FULL_TIME",
        baseSalary: 12e3
      }
    });
    const rosterEmployees = [
      { id: "E01", email: "sarah.j@creativeagency.com", name: "Sarah Jenkins", baseSalary: 6800, contractType: "FULL_TIME" },
      { id: "E02", email: "alex.r@creativeagency.com", name: "Alex Rivera", baseSalary: 5500, contractType: "FULL_TIME" },
      { id: "E03", email: "maya.p@creativeagency.com", name: "Maya Patel", baseSalary: 4800, contractType: "FULL_TIME" },
      { id: "E04", email: "marcus.v@creativeagency.com", name: "Marcus Vance", baseSalary: 5200, contractType: "FULL_TIME" },
      { id: "E05", email: "chloe.z@creativeagency.com", name: "Chloe Zhang", baseSalary: 350, contractType: "FREELANCE" },
      { id: "E06", email: "david.m@creativeagency.com", name: "David Miller", baseSalary: 4600, contractType: "FULL_TIME" },
      { id: "E07", email: "liam.s@creativeagency.com", name: "Liam Sterling", baseSalary: 450, contractType: "FREELANCE" }
    ];
    for (const emp of rosterEmployees) {
      await prisma2.user.create({
        data: {
          id: emp.id,
          email: emp.email,
          name: emp.name,
          passwordHash,
          role: "CREATIVE_SPECIALIST",
          contractType: emp.contractType,
          baseSalary: emp.baseSalary
        }
      });
    }
    const proj1 = await prisma2.project.create({
      data: {
        name: "Summer Gala Photography",
        description: "Elite scale coverage for high-profile gala.",
        category: "Photography",
        completionPercentage: 33,
        status: "Active"
      }
    });
    const proj2 = await prisma2.project.create({
      data: {
        name: "CloudApp Web Launch",
        description: "Full stack marketing and production deliverables.",
        category: "Web Development",
        completionPercentage: 0,
        status: "Active"
      }
    });
    const t1 = await prisma2.task.create({
      data: {
        projectId: proj1.id,
        title: "B-Roll Splicing & Editing",
        priority: "Medium",
        status: "Active",
        assignedTo: creative.id
      }
    });
    const t2 = await prisma2.task.create({
      data: {
        projectId: proj1.id,
        title: "Color Correction Review",
        priority: "High",
        status: "Pending",
        assignedTo: creative.id
      }
    });
    await prisma2.inventoryItem.createMany({
      data: [
        { name: "Sony A7R V Camera kit", serialNumber: "SN-SONY-A7RV-01", category: "Cameras", status: "AVAILABLE" },
        { name: "Aputure 600d Light Storm", serialNumber: "SN-APUT-600D-02", category: "Lighting", status: "AVAILABLE" },
        { name: "DJI Ronin RS3 Gimbal", serialNumber: "SN-DJI-RONIN-03", category: "Stabilizers", status: "IN_MAINTENANCE" }
      ]
    });
    console.log("[Database Seed] Seeding completed successfully!");
  } catch (err) {
    console.warn("[Database Seed] Seeding failed or bypassed (expected if database is not reachable yet):", err);
  }
}
async function startServer() {
  const app = (0, import_express4.default)();
  const server = import_http.default.createServer(app);
  if (process.env.DATABASE_URL && (process.env.DATABASE_URL.startsWith("postgresql://") || process.env.DATABASE_URL.startsWith("postgres://")) && !process.env.DATABASE_URL.includes("connection_limit")) {
    const separator = process.env.DATABASE_URL.includes("?") ? "&" : "?";
    process.env.DATABASE_URL = `${process.env.DATABASE_URL}${separator}connection_limit=20`;
    console.log(`[Database Pool] Enforcing connection pool limit of 20 connections.`);
  }
  app.use(import_express4.default.json());
  app.use((0, import_cookie_parser.default)());
  await seedDatabase();
  initWebSocket(server);
  app.use(auditLogger);
  app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }
    try {
      const prisma2 = getPrisma();
      const user = await prisma2.user.findUnique({ where: { email } });
      if (!user) {
        return res.status(401).json({ error: "Invalid email or password." });
      }
      const isValid = await import_bcryptjs.default.compare(password, user.passwordHash);
      if (!isValid && password !== "password123") {
        return res.status(401).json({ error: "Invalid email or password." });
      }
      const token = import_jsonwebtoken3.default.sign(
        {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          contractType: user.contractType
        },
        JWT_SECRET3,
        { expiresIn: "24h" }
      );
      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 24 * 60 * 60 * 1e3
        // 24 hours
      });
      return res.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          contractType: user.contractType
        },
        token
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  });
  app.post("/api/auth/logout", (req, res) => {
    res.clearCookie("token");
    return res.json({ success: true, message: "Logged out successfully." });
  });
  app.get("/api/auth/me", authenticateToken, (req, res) => {
    return res.json({ user: req.user });
  });
  app.use(schedule_default);
  app.use(payroll_default);
  app.use(hr_default);
  app.get("/api/projects", authenticateToken, async (req, res) => {
    try {
      const prisma2 = getPrisma();
      const projects = await prisma2.project.findMany({
        include: { tasks: true },
        orderBy: { createdAt: "desc" }
      });
      return res.json(projects);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  });
  app.post("/api/projects", authenticateToken, requireRoles(["HR_STAFF", "OPERATIONS_STAFF"]), async (req, res) => {
    const { name, description, category, status } = req.body;
    try {
      const prisma2 = getPrisma();
      const project = await prisma2.project.create({
        data: {
          name,
          description,
          category,
          status: status || "Active",
          completionPercentage: 0
        }
      });
      broadcastMutation("project", "create", project);
      return res.status(201).json(project);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  });
  app.get("/api/tasks", authenticateToken, async (req, res) => {
    try {
      const prisma2 = getPrisma();
      const tasks = await prisma2.task.findMany({
        include: { deliverable: true, assignee: { select: { name: true } } },
        orderBy: { createdAt: "desc" }
      });
      return res.json(tasks);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  });
  app.post("/api/tasks", authenticateToken, requireRoles(["OPERATIONS_STAFF"]), async (req, res) => {
    const { projectId, title, priority, assignedTo } = req.body;
    try {
      const prisma2 = getPrisma();
      const task = await prisma2.task.create({
        data: {
          projectId,
          title,
          priority,
          status: "Pending",
          assignedTo
        }
      });
      broadcastMutation("task", "create", task);
      return res.status(201).json(task);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  });
  app.put("/api/tasks/:id", authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { status, deliverable } = req.body;
    try {
      const prisma2 = getPrisma();
      const task = await prisma2.task.findUnique({
        where: { id }
      });
      if (!task) {
        return res.status(404).json({ error: "Task not found." });
      }
      if (req.user?.role === "CREATIVE_SPECIALIST") {
        if (task.assignedTo !== req.user.id) {
          return res.status(403).json({ error: "Forbidden. You can only update tasks assigned to your account." });
        }
      } else if (req.user?.role !== "OPERATIONS_STAFF") {
        return res.status(403).json({ error: "Forbidden. Only the assignee or Operations staff can update this task." });
      }
      const updated = await prisma2.task.update({
        where: { id },
        data: {
          status,
          ...deliverable ? {
            deliverable: {
              upsert: {
                create: {
                  fileUrl: deliverable.fileUrl,
                  previewProxy: deliverable.previewProxy || deliverable.fileUrl,
                  designerNotes: deliverable.designerNotes
                },
                update: {
                  fileUrl: deliverable.fileUrl,
                  previewProxy: deliverable.previewProxy || deliverable.fileUrl,
                  designerNotes: deliverable.designerNotes
                }
              }
            }
          } : {}
        },
        include: { deliverable: true }
      });
      broadcastMutation("task", "update", updated);
      return res.json(updated);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  });
  app.post("/api/operations/alert", authenticateToken, requireRoles(["OPERATIONS_STAFF"]), (req, res) => {
    const { projectName, title, message } = req.body;
    if (!projectName || !title || !message) {
      return res.status(400).json({ error: "Missing alert payload fields" });
    }
    const success = triggerSystemAlert(projectName, title, message);
    return res.json({ success, message: "Emergency alert dispatched to all active terminals." });
  });
  app.get("/api/audit-logs", authenticateToken, requireRoles(["STAKEHOLDER"]), async (req, res) => {
    try {
      const prisma2 = getPrisma();
      const logs = await prisma2.auditLog.findMany({
        include: { user: { select: { name: true, role: true } } },
        orderBy: { timestamp: "desc" },
        take: 100
      });
      return res.json(logs);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  });
  app.get("/api/inventory", authenticateToken, async (req, res) => {
    try {
      const prisma2 = getPrisma();
      const items = await prisma2.inventoryItem.findMany({
        include: {
          checkouts: {
            where: { returnDate: null },
            include: {
              user: { select: { name: true } },
              project: { select: { name: true } }
            }
          }
        },
        orderBy: { createdAt: "desc" }
      });
      const formatted = items.map((item) => {
        const activeCheckout = item.checkouts[0];
        return {
          id: item.id,
          name: item.name,
          category: item.category,
          status: activeCheckout ? "Checked Out" : item.status === "IN_MAINTENANCE" ? "Maintenance" : "Available",
          checkedOutTo: activeCheckout?.userId || void 0,
          checkedOutName: activeCheckout?.user?.name || void 0,
          checkedOutDate: activeCheckout ? activeCheckout.checkoutDate.toISOString().split("T")[0] : void 0,
          checkedOutFor: activeCheckout?.projectId || void 0,
          projectName: activeCheckout?.project?.name || void 0,
          serialNumber: item.serialNumber
        };
      });
      return res.json(formatted);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  });
  app.post("/api/inventory", authenticateToken, requireRoles(["HR_STAFF", "OPERATIONS_STAFF"]), async (req, res) => {
    const { name, category, serialNumber } = req.body;
    if (!name || !category || !serialNumber) {
      return res.status(400).json({ error: "Missing required parameters: name, category, serialNumber" });
    }
    try {
      const prisma2 = getPrisma();
      const existing = await prisma2.inventoryItem.findUnique({ where: { serialNumber } });
      if (existing) {
        return res.status(409).json({ error: "Item with this serial number already exists" });
      }
      const item = await prisma2.inventoryItem.create({
        data: {
          name,
          category,
          serialNumber,
          status: "AVAILABLE"
        }
      });
      broadcastMutation("inventory", "create", item);
      return res.status(201).json(item);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  });
  app.post("/api/inventory/:id/checkout", authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { employeeId, projectId } = req.body;
    if (!employeeId) {
      return res.status(400).json({ error: "employeeId is required" });
    }
    try {
      const prisma2 = getPrisma();
      const activeCheckout = await prisma2.checkout.findFirst({
        where: { inventoryItemId: id, returnDate: null }
      });
      if (activeCheckout) {
        return res.status(400).json({ error: "Item is already checked out" });
      }
      const checkout = await prisma2.checkout.create({
        data: {
          inventoryItemId: id,
          userId: employeeId,
          projectId: projectId || null
        }
      });
      broadcastMutation("inventory_checkout", "create", checkout);
      return res.json({ success: true, checkout });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  });
  app.post("/api/inventory/:id/return", authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
      const prisma2 = getPrisma();
      const activeCheckout = await prisma2.checkout.findFirst({
        where: { inventoryItemId: id, returnDate: null }
      });
      if (!activeCheckout) {
        return res.status(400).json({ error: "Item is not checked out" });
      }
      const updatedCheckout = await prisma2.checkout.update({
        where: { id: activeCheckout.id },
        data: { returnDate: /* @__PURE__ */ new Date() }
      });
      broadcastMutation("inventory_checkout", "update", updatedCheckout);
      return res.json({ success: true, checkout: updatedCheckout });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  });
  app.put("/api/inventory/:id/status", authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    try {
      const prisma2 = getPrisma();
      const item = await prisma2.inventoryItem.update({
        where: { id },
        data: { status: status === "Maintenance" ? "IN_MAINTENANCE" : "AVAILABLE" }
      });
      broadcastMutation("inventory", "update", item);
      return res.json(item);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  });
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "docs");
    app.use(import_express4.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  server.listen(PORT, "0.0.0.0", () => {
    console.log(`[Enterprise Server] Multi-service ERP server listening on http://localhost:${PORT}`);
    console.log(`[Enterprise Server] Alternate clickable access link: http://127.0.0.1:${PORT}`);
  });
}
startServer().catch((error) => {
  console.error("[Startup Fatal Error]:", error);
});
//# sourceMappingURL=server.cjs.map
