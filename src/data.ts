/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  Employee, 
  Project, 
  Task, 
  InventoryItem, 
  ScheduleEntry, 
  PayrollRecord, 
  Notification,
  AttendanceLog,
  LeaveRequest,
  HelpDeskTicket,
  PerformanceAppraisal,
  EmployeeDetails,
  EngagementPoll,
  ForumPost
} from './types';

export const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: 'E01',
    name: 'Sarah Jenkins',
    role: 'Web Developer',
    email: 'sarah.j@creativeagency.com',
    baseSalary: 6800,
    isFreelancer: false,
    status: 'Active',
    joinedDate: '2024-03-15'
  },
  {
    id: 'E02',
    name: 'Alex Rivera',
    role: 'Photographer',
    email: 'alex.r@creativeagency.com',
    baseSalary: 5500,
    isFreelancer: false,
    status: 'Active',
    joinedDate: '2023-08-10'
  },
  {
    id: 'E03',
    name: 'Maya Patel',
    role: 'Editor',
    email: 'maya.p@creativeagency.com',
    baseSalary: 4800,
    isFreelancer: false,
    status: 'Active',
    joinedDate: '2024-01-20'
  },
  {
    id: 'E04',
    name: 'Marcus Vance',
    role: 'Digital Marketer',
    email: 'marcus.v@creativeagency.com',
    baseSalary: 5200,
    isFreelancer: false,
    status: 'Active',
    joinedDate: '2023-11-05'
  },
  {
    id: 'E05',
    name: 'Chloe Zhang',
    role: 'Photographer',
    email: 'chloe.z@creativeagency.com',
    baseSalary: 350, // Per shoot rate represented or standard base
    isFreelancer: true,
    status: 'Active',
    joinedDate: '2025-02-12'
  },
  {
    id: 'E06',
    name: 'David Miller',
    role: 'Editor',
    email: 'david.m@creativeagency.com',
    baseSalary: 4600,
    isFreelancer: false,
    status: 'Active',
    joinedDate: '2024-09-01'
  },
  {
    id: 'E07',
    name: 'Liam Sterling',
    role: 'Web Developer',
    email: 'liam.s@creativeagency.com',
    baseSalary: 450, // Freelancer day rate representation
    isFreelancer: true,
    status: 'Onboarding',
    joinedDate: '2026-07-01'
  }
];

export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'P01',
    name: 'Apex Global Summit 2026',
    serviceType: 'Event Management',
    description: 'Full-scale event production, catering logistics, A/V management, and live photography coverage for a 3-day tech conference.',
    status: 'In Progress',
    startDate: '2026-07-10',
    endDate: '2026-07-15',
    clientName: 'Apex Industries',
    budget: 45000,
    completionPercentage: 60
  },
  {
    id: 'P02',
    name: 'EcoStyle Autumn Campaign',
    serviceType: 'Digital Marketing',
    description: 'Multi-channel social media rollout, graphic assets, PPC advertising setup, and influencer coordination for an eco-friendly brand launch.',
    status: 'In Progress',
    startDate: '2026-07-01',
    endDate: '2026-08-15',
    clientName: 'EcoStyle Apparel',
    budget: 18000,
    completionPercentage: 35
  },
  {
    id: 'P03',
    name: 'Bespoke Furniture E-Store',
    serviceType: 'Web Development',
    description: 'Custom Next.js website design, headless Shopify checkout integration, and administrative inventory management dashboard development.',
    status: 'In Progress',
    startDate: '2026-06-15',
    endDate: '2026-07-30',
    clientName: 'Bespoke Living',
    budget: 28000,
    completionPercentage: 75
  },
  {
    id: 'P04',
    name: 'Glow Cosmetics Promo Shoots',
    serviceType: 'Photography',
    description: 'High-end studio product photography and active catalog video assets editing for the Glow Summer product line release.',
    status: 'Review',
    startDate: '2026-07-05',
    endDate: '2026-07-20',
    clientName: 'Glow Cosmetics',
    budget: 12500,
    completionPercentage: 90
  },
  {
    id: 'P05',
    name: 'Vibrant Food Festival',
    serviceType: 'Event Management',
    description: 'Vendor mapping, stage decor sourcing, lighting arrangements, and on-site event crew management.',
    status: 'Completed',
    startDate: '2026-06-01',
    endDate: '2026-06-15',
    clientName: 'City Foods Co.',
    budget: 32000,
    completionPercentage: 100
  }
];

export const INITIAL_TASKS: Task[] = [
  {
    id: 'T01',
    projectId: 'P01',
    projectName: 'Apex Global Summit 2026',
    title: 'Stage Audio/Visual Blueprint Verification',
    description: 'Confirm lighting grid specifications and mic channels layout with the convention center technicians.',
    assignedTo: 'E03',
    assignedName: 'Maya Patel',
    status: 'Completed',
    priority: 'High',
    deadline: '2026-07-11',
    deliverables: {
      notes: 'Blueprint confirmed. Ground plan uploaded to event folder and shared with venue contact.',
      link: 'https://drive.google.com/drive/folders/apex-av-blueprint'
    },
    submissionDate: '2026-07-10'
  },
  {
    id: 'T02',
    projectId: 'P01',
    projectName: 'Apex Global Summit 2026',
    title: 'On-site Live Keynote Coverage',
    description: 'Capture keynotes by the main executive team. Highlight speaker interactions and audience reaction shots.',
    assignedTo: 'E02',
    assignedName: 'Alex Rivera',
    status: 'In Progress',
    priority: 'High',
    deadline: '2026-07-13'
  },
  {
    id: 'T03',
    projectId: 'P02',
    projectName: 'EcoStyle Autumn Campaign',
    title: 'Social Media Ad Campaign Setup',
    description: 'Configure Meta ads manager targeting eco-conscious demographics. Load creatives for initial A/B test.',
    assignedTo: 'E04',
    assignedName: 'Marcus Vance',
    status: 'In Progress',
    priority: 'Medium',
    deadline: '2026-07-16'
  },
  {
    id: 'T04',
    projectId: 'P03',
    projectName: 'Bespoke Furniture E-Store',
    title: 'Implement Shopify Checkout API Hook',
    description: 'Develop custom webhook handlers for Shopify order ingestion and sync with local ERP staging db.',
    assignedTo: 'E01',
    assignedName: 'Sarah Jenkins',
    status: 'Pending Review',
    priority: 'High',
    deadline: '2026-07-14',
    deliverables: {
      notes: 'All webhooks tested in sandbox. Syncing database successfully logs payment triggers.',
      link: 'https://github.com/creativeagency/bespoke-furniture/pull/14',
      fileName: 'webhook-handler-v2.ts'
    },
    submissionDate: '2026-07-11'
  },
  {
    id: 'T05',
    projectId: 'P04',
    projectName: 'Glow Cosmetics Promo Shoots',
    title: 'Post-Production Photo Retouching',
    description: 'Color correction and skin smoothing on 45 high-res studio catalog shots.',
    assignedTo: 'E06',
    assignedName: 'David Miller',
    status: 'Pending Review',
    priority: 'Medium',
    deadline: '2026-07-15',
    deliverables: {
      notes: 'Initial retouched cohort. Ready for operations & client creative review.',
      link: 'https://assets.creativeagency.com/projects/glow-cosmetics/cohort1'
    },
    submissionDate: '2026-07-12'
  },
  {
    id: 'T06',
    projectId: 'P04',
    projectName: 'Glow Cosmetics Promo Shoots',
    title: 'Studio Portrait Photography',
    description: 'Conduct main model shoot in studio B with lighting package. Focus on lipstick & eyeshadow product lines.',
    assignedTo: 'E05',
    assignedName: 'Chloe Zhang',
    status: 'Completed',
    priority: 'High',
    deadline: '2026-07-08',
    deliverables: {
      notes: 'Shoot complete. Uploaded RAW files to storage server.',
      link: 'https://assets.creativeagency.com/raw/glow-cosmetics-portraits'
    },
    submissionDate: '2026-07-08'
  },
  {
    id: 'T07',
    projectId: 'P03',
    projectName: 'Bespoke Furniture E-Store',
    title: 'Responsive UI Product Catalog Page',
    description: 'Refine product bento grid layout and smooth search filtering system for mobile and desktop screens.',
    assignedTo: 'E01',
    assignedName: 'Sarah Jenkins',
    status: 'Completed',
    priority: 'Medium',
    deadline: '2026-07-09',
    deliverables: {
      notes: 'Completed layout with fluid transition animations. Checked on Safari, Chrome, and iOS devices.',
      link: 'https://bespoke-staging.creativeagency.com/shop'
    },
    submissionDate: '2026-07-09'
  }
];

export const INITIAL_INVENTORY: InventoryItem[] = [
  {
    id: 'INV01',
    name: 'Sony FX3 Cinema Camera',
    category: 'Camera',
    status: 'Available',
    serialNumber: 'SN-FX3-8821'
  },
  {
    id: 'INV02',
    name: 'Sony Alpha 7S III',
    category: 'Camera',
    status: 'Checked Out',
    checkedOutTo: 'E02',
    checkedOutName: 'Alex Rivera',
    checkedOutDate: '2026-07-10',
    checkedOutFor: 'P01',
    projectName: 'Apex Global Summit 2026',
    serialNumber: 'SN-A7S-9912'
  },
  {
    id: 'INV03',
    name: 'Aputure LS 600d Pro LED Light Kit',
    category: 'Lighting',
    status: 'Available',
    serialNumber: 'SN-APU-1029'
  },
  {
    id: 'INV04',
    name: 'Sennheiser AVX Wireless Lapel Kit',
    category: 'Audio',
    status: 'Checked Out',
    checkedOutTo: 'E02',
    checkedOutName: 'Alex Rivera',
    checkedOutDate: '2026-07-10',
    checkedOutFor: 'P01',
    projectName: 'Apex Global Summit 2026',
    serialNumber: 'SN-SEN-5541'
  },
  {
    id: 'INV05',
    name: 'DJI Ronin RS3 Pro Gimbal Stabilizer',
    category: 'Other' as any, // category was refined, we map to camera gear category / Workstation
    status: 'Available',
    serialNumber: 'SN-DJI-4001'
  },
  {
    id: 'INV06',
    name: 'GeForce RTX 4090 Editing Workstation',
    category: 'Workstation',
    status: 'Checked Out',
    checkedOutTo: 'E03',
    checkedOutName: 'Maya Patel',
    checkedOutDate: '2026-07-05',
    checkedOutFor: 'P03',
    projectName: 'Bespoke Furniture E-Store',
    serialNumber: 'SN-WS-4090A'
  },
  {
    id: 'INV07',
    name: 'Golden Velvet Stage Backdrop 10x15ft',
    category: 'Decor',
    status: 'Available',
    serialNumber: 'SN-DEC-0021'
  },
  {
    id: 'INV08',
    name: 'Custom Neon Slogan Signboard (Client Promo)',
    category: 'Decor',
    status: 'Maintenance',
    serialNumber: 'SN-DEC-9988'
  }
];

export const INITIAL_SCHEDULES: ScheduleEntry[] = [
  {
    id: 'S01',
    employeeId: 'E02',
    employeeName: 'Alex Rivera',
    projectId: 'P01',
    projectName: 'Apex Global Summit 2026',
    title: 'On-site Live Keynote Photo Coverage',
    date: '2026-07-12',
    type: 'Shoot',
    startTime: '09:00',
    endTime: '17:00'
  },
  {
    id: 'S02',
    employeeId: 'E02',
    employeeName: 'Alex Rivera',
    projectId: 'P01',
    projectName: 'Apex Global Summit 2026',
    title: 'Day 2 Keynotes & Dinner Photography',
    date: '2026-07-13',
    type: 'Shoot',
    startTime: '10:00',
    endTime: '20:00'
  },
  {
    id: 'S03',
    employeeId: 'E01',
    employeeName: 'Sarah Jenkins',
    projectId: 'P03',
    projectName: 'Bespoke Furniture E-Store',
    title: 'Custom API Integrations & Checkouts Sprint',
    date: '2026-07-14',
    type: 'Sprint',
    startTime: '09:30',
    endTime: '16:00'
  },
  {
    id: 'S04',
    employeeId: 'E03',
    employeeName: 'Maya Patel',
    projectId: 'P01',
    projectName: 'Apex Global Summit 2026',
    title: 'Apex Intro Video Final Rendering Review',
    date: '2026-07-12',
    type: 'Editing',
    startTime: '13:00',
    endTime: '16:00'
  },
  {
    id: 'S05',
    employeeId: 'E06',
    employeeName: 'David Miller',
    projectId: 'P04',
    projectName: 'Glow Cosmetics Promo Shoots',
    title: 'Glow Cosmetic Product Retouching Sessions',
    date: '2026-07-15',
    type: 'Editing',
    startTime: '09:00',
    endTime: '15:00'
  }
];

export const INITIAL_PAYROLL: PayrollRecord[] = [
  {
    id: 'PAY01',
    employeeId: 'E01',
    employeeName: 'Sarah Jenkins',
    role: 'Web Developer',
    month: 'July 2026',
    basePay: 6800,
    bonus: 400,
    deduction: 0,
    status: 'Pending',
    completedTasksCount: 1,
    bonusReason: 'On-time delivery of Shopify Product Catalog UI with advanced responsive parameters'
  },
  {
    id: 'PAY02',
    employeeId: 'E02',
    employeeName: 'Alex Rivera',
    role: 'Photographer',
    month: 'July 2026',
    basePay: 5500,
    bonus: 0,
    deduction: 0,
    status: 'Pending',
    completedTasksCount: 0
  },
  {
    id: 'PAY03',
    employeeId: 'E03',
    employeeName: 'Maya Patel',
    role: 'Editor',
    month: 'July 2026',
    basePay: 4800,
    bonus: 250,
    deduction: 0,
    status: 'Pending',
    completedTasksCount: 1,
    bonusReason: 'Outstanding audio-visual blueprint validation under tight constraints'
  },
  {
    id: 'PAY04',
    employeeId: 'E04',
    employeeName: 'Marcus Vance',
    role: 'Digital Marketer',
    month: 'July 2026',
    basePay: 5200,
    bonus: 0,
    deduction: 0,
    status: 'Approved',
    completedTasksCount: 0
  },
  {
    id: 'PAY05',
    employeeId: 'E05',
    employeeName: 'Chloe Zhang',
    role: 'Photographer',
    month: 'July 2026',
    basePay: 1400, // Calculated freelancer pay (e.g. 4 shoots * rate)
    bonus: 150,
    deduction: 0,
    status: 'Approved',
    completedTasksCount: 1,
    bonusReason: 'Flawless execution of Glow Cosmetics model portrait shoot ahead of schedule'
  }
];

export const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: 'N01',
    type: 'PriorityAlert',
    title: 'CRITICAL CHANGE: Shoot Location Shift',
    message: 'The shoot for "Glow Cosmetics Promo Shoots" on July 15th has been relocated from Studio B to Studio A due to cooling failure. Gear checkout requests are reassigned to Studio A.',
    timestamp: '2026-07-12T05:30:00Z',
    projectName: 'Glow Cosmetics Promo Shoots',
    sender: 'Operations Staff',
    isRead: false
  },
  {
    id: 'N02',
    type: 'System',
    title: 'New Freelancer Onboarded',
    message: 'Liam Sterling (Web Developer) has completed the basic onboarding setup. Pending HR schedule allocation.',
    timestamp: '2026-07-11T16:45:00Z',
    sender: 'HR Staff',
    isRead: false
  },
  {
    id: 'N03',
    type: 'PriorityAlert',
    title: 'PROJECT SCOPE SHIFT: Apex Keynotes Expanded',
    message: 'Client has requested an extra photog for the afternoon networking breakouts at "Apex Global Summit 2026". Additional photography gear has been checked out.',
    timestamp: '2026-07-12T07:05:00Z',
    projectName: 'Apex Global Summit 2026',
    sender: 'Operations Staff',
    isRead: false
  }
];

export const INITIAL_ATTENDANCE: AttendanceLog[] = [
  {
    id: 'ATT01',
    employeeId: 'E01',
    employeeName: 'Sarah Jenkins',
    checkInTime: '08:52',
    checkOutTime: '17:30',
    date: '2026-07-11',
    ipAddress: '192.168.1.10',
    gpsLocation: 'Lat: 34.052, Long: -118.243',
    status: 'On Time',
    isApproved: true,
    overtimeHours: 0.5
  },
  {
    id: 'ATT02',
    employeeId: 'E02',
    employeeName: 'Alex Rivera',
    checkInTime: '09:24',
    checkOutTime: '18:00',
    date: '2026-07-11',
    ipAddress: '192.168.1.25',
    gpsLocation: 'Lat: 34.058, Long: -118.241',
    status: 'Late',
    isApproved: true,
    overtimeHours: 0
  },
  {
    id: 'ATT03',
    employeeId: 'E03',
    employeeName: 'Maya Patel',
    checkInTime: '08:45',
    checkOutTime: '17:00',
    date: '2026-07-11',
    ipAddress: '192.168.1.12',
    gpsLocation: 'Lat: 34.051, Long: -118.246',
    status: 'On Time',
    isApproved: true,
    overtimeHours: 0
  },
  {
    id: 'ATT04',
    employeeId: 'E04',
    employeeName: 'Marcus Vance',
    checkInTime: '09:45',
    checkOutTime: undefined,
    date: '2026-07-12',
    ipAddress: '172.56.21.90',
    gpsLocation: 'Lat: 34.062, Long: -118.250',
    status: 'Late',
    isApproved: false,
    overtimeHours: 0
  }
];

export const INITIAL_LEAVES: LeaveRequest[] = [
  {
    id: 'LV01',
    employeeId: 'E01',
    employeeName: 'Sarah Jenkins',
    leaveType: 'Annual Leave',
    startDate: '2026-07-20',
    endDate: '2026-07-24',
    reason: 'Summer family vacation trip',
    status: 'Approved',
    requestedAt: '2026-07-10'
  },
  {
    id: 'LV02',
    employeeId: 'E02',
    employeeName: 'Alex Rivera',
    leaveType: 'Casual Leave',
    startDate: '2026-07-18',
    endDate: '2026-07-18',
    reason: 'Personal driver license renewal test',
    status: 'Pending',
    requestedAt: '2026-07-12'
  },
  {
    id: 'LV03',
    employeeId: 'E03',
    employeeName: 'Maya Patel',
    leaveType: 'Sick Leave',
    startDate: '2026-07-11',
    endDate: '2026-07-11',
    reason: 'Severe migraine, taking rest',
    status: 'Approved',
    requestedAt: '2026-07-11'
  }
];

export const INITIAL_TICKETS: HelpDeskTicket[] = [
  {
    id: 'TKT01',
    employeeId: 'E01',
    employeeName: 'Sarah Jenkins',
    category: 'Equipment',
    title: 'Monitor flickering issue',
    description: 'The second 4K monitor at desk 4 sparkles/flickers when utilizing HDMI 2.1 cable.',
    priority: 'Medium',
    status: 'In Progress',
    slaDeadline: '2026-07-14',
    createdAt: '2026-07-11'
  },
  {
    id: 'TKT02',
    employeeId: 'E03',
    employeeName: 'Maya Patel',
    category: 'Payroll Query',
    title: 'Missing June task bonus allocation',
    description: 'Completed high-priority editing deliverable P01-T04 on June 28, but bonus is not showing in payroll slip.',
    priority: 'High',
    status: 'Open',
    slaDeadline: '2026-07-13',
    createdAt: '2026-07-12'
  }
];

export const INITIAL_APPRAISALS: PerformanceAppraisal[] = [
  {
    id: 'APR01',
    employeeId: 'E01',
    employeeName: 'Sarah Jenkins',
    year: 2026,
    okrGoal: 'Deliver Bespoke furniture site and implement 100% stable payment webhooks.',
    kpiScore: 92,
    selfAppraisal: 'Successfully refactored Shopify API triggers. Feel I hit all performance targets.',
    managerAppraisal: 'Sarah has done a stellar job leading web dev work. Payment integration was exceptionally robust.',
    peerFeedback: 'Always helpful, solves complex layout conflicts quickly.',
    competencyAssessment: 'L3 Lead Developer Standard'
  },
  {
    id: 'APR02',
    employeeId: 'E02',
    employeeName: 'Alex Rivera',
    year: 2026,
    okrGoal: 'Shoot 10 high-profile live events and maintain a zero-gear damage rate.',
    kpiScore: 88,
    selfAppraisal: 'Delivered multiple high quality shoot folders. Maintained camera gear in perfect shape.',
    managerAppraisal: 'Alex has great on-site coverage speed. Needs minor focus refinement during night-shoots.',
    peerFeedback: 'Incredibly quick turn-around. Fun to collaborate with on-site.',
    competencyAssessment: 'L2 Senior Photographer Standard'
  }
];

export const INITIAL_EMPLOYEE_DETAILS: EmployeeDetails[] = [
  {
    employeeId: 'E01',
    personalPhone: '+1 (555) 234-5678',
    emergencyContactName: 'Robert Jenkins',
    emergencyContactPhone: '+1 (555) 234-9900',
    skills: ['TypeScript', 'React', 'Next.js', 'GraphQL', 'TailwindCSS'],
    certifications: ['AWS Certified Developer', 'Vite Specialist Badge'],
    department: 'Web Engineering',
    jobTitle: 'Senior Frontend Engineer',
    reportsTo: 'Operations Manager',
    customFields: [{ name: 'Desk Assignment', value: 'Station 4A' }]
  },
  {
    employeeId: 'E02',
    personalPhone: '+1 (555) 345-6789',
    emergencyContactName: 'Carla Rivera',
    emergencyContactPhone: '+1 (555) 345-9911',
    skills: ['Portrait Photography', 'Event Shoots', 'Studio Lighting', 'Drone Operation'],
    certifications: ['FAA Part 107 Commercial Drone Pilot License', 'Adobe Certified Lightroom Expert'],
    department: 'Photography & Creative',
    jobTitle: 'Lead Photographer',
    reportsTo: 'Operations Manager',
    customFields: [{ name: 'Camera Preference', value: 'Sony Full-frame' }]
  },
  {
    employeeId: 'E03',
    personalPhone: '+1 (555) 456-7890',
    emergencyContactName: 'Amit Patel',
    emergencyContactPhone: '+1 (555) 456-9922',
    skills: ['DaVinci Resolve', 'Premiere Pro', 'Color Grading', 'Sound Mix'],
    certifications: ['Blackmagic Design Certified Trainer', 'Dolby Atmos Audio Certification'],
    department: 'Editing & Post-Production',
    jobTitle: 'Lead Editor',
    reportsTo: 'Operations Manager',
    customFields: [{ name: 'Workstation Preference', value: 'OSX Mac Studio' }]
  }
];

export const INITIAL_POLL: EngagementPoll = {
  question: 'Would you support establishing a permanent 4-day compressed work-week trial (10 hrs/day, Tue-Fri)?',
  options: [
    { text: 'Yes, absolutely - highly supportive!', votes: 24 },
    { text: 'No, prefer standard 5-day week for Client sync', votes: 6 },
    { text: 'Neutral - either works for me', votes: 4 }
  ]
};

export const INITIAL_FORUM_POSTS: ForumPost[] = [
  {
    id: 'F01',
    authorName: 'Sarah Jenkins',
    authorRole: 'Web Developer',
    content: 'Loving the new dual displays at Station 4A! Thanks, Admin, for resolving the HDMI flickering.',
    timestamp: '2026-07-11T09:00:00Z'
  },
  {
    id: 'F02',
    authorName: 'Alex Rivera',
    authorRole: 'Photographer',
    content: 'Reminder to all creative staff: please clean the camera lenses and return any spare Sony batteries to Cabinet B before checking items back into the inventory panel!',
    timestamp: '2026-07-12T07:15:00Z'
  }
];

