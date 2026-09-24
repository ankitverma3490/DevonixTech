import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { Client } from '../models/Client.js';
import { Project } from '../models/Project.js';
import { Task } from '../models/Task.js';
import { Payroll } from '../models/Payroll.js';
import { PayrollMilestone } from '../models/PayrollMilestone.js';
import { ClientPayment } from '../models/ClientPayment.js';
import { Expense } from '../models/Expense.js';

export const seedDatabase = async (force: boolean = false): Promise<void> => {
  try {
    const existingUsers = await User.countDocuments();
    if (existingUsers > 0 && !force) {
      console.log('🌱 Database already contains data. Skipping initial seeding.');
      return;
    }

    console.log('🌱 Seeding database with realistic Agency demo data...');

    // Clear existing collections
    await Promise.all([
      User.deleteMany({}),
      Client.deleteMany({}),
      Project.deleteMany({}),
      Task.deleteMany({}),
      Payroll.deleteMany({}),
      PayrollMilestone.deleteMany({}),
      ClientPayment.deleteMany({}),
      Expense.deleteMany({}),
    ]);

    const defaultPassword = 'Agency@1234';

    // 1. Create Users (Admin, PMs, Team Members)
    const users = await User.create([
      {
        name: 'Alexander Ross',
        email: 'admin@agency.com',
        password: defaultPassword,
        role: 'admin',
        phone: '+1 (555) 019-2834',
        whatsapp: '+15550192834',
        skills: ['Agency Management', 'System Architecture', 'Product Strategy'],
        joiningDate: new Date('2024-01-01'),
        status: 'active',
        notes: 'Founder & Managing Director',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      },
      {
        name: 'Sarah Jenkins',
        email: 'sarah.pm@agency.com',
        password: defaultPassword,
        role: 'project_manager',
        phone: '+1 (555) 234-5678',
        whatsapp: '+15552345678',
        skills: ['Agile / Scrum', 'Client Relations', 'Risk Management', 'Jira'],
        joiningDate: new Date('2024-03-15'),
        status: 'active',
        notes: 'Senior Technical Project Manager',
        avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      },
      {
        name: 'Alex Rivera',
        email: 'alex.pm@agency.com',
        password: defaultPassword,
        role: 'project_manager',
        phone: '+1 (555) 345-6789',
        whatsapp: '+15553456789',
        skills: ['Scrum Master', 'Sprint Planning', 'Delivery Management'],
        joiningDate: new Date('2024-05-01'),
        status: 'active',
        notes: 'Technical Delivery Lead',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      },
      {
        name: 'David Chen',
        email: 'david.dev@agency.com',
        password: defaultPassword,
        role: 'team_member',
        phone: '+1 (555) 456-7890',
        whatsapp: '+15554567890',
        skills: ['React', 'TypeScript', 'Node.js', 'Next.js', 'GraphQL'],
        joiningDate: new Date('2024-02-10'),
        status: 'active',
        notes: 'Senior Full Stack Specialist',
        avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      },
      {
        name: 'Elena Rostova',
        email: 'elena.ui@agency.com',
        password: defaultPassword,
        role: 'team_member',
        phone: '+1 (555) 567-8901',
        whatsapp: '+15555678901',
        skills: ['UI/UX Design', 'Figma', 'Design Systems', 'Prototyping', 'Tailwind'],
        joiningDate: new Date('2024-02-15'),
        status: 'active',
        notes: 'Lead Product Designer',
        avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
      },
      {
        name: 'Marcus Brody',
        email: 'marcus.back@agency.com',
        password: defaultPassword,
        role: 'team_member',
        phone: '+1 (555) 678-9012',
        whatsapp: '+15556789012',
        skills: ['Node.js', 'Go', 'PostgreSQL', 'Docker', 'AWS', 'Kubernetes'],
        joiningDate: new Date('2024-04-01'),
        status: 'active',
        notes: 'Lead Backend & Cloud Architect',
        avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
      },
      {
        name: 'Priya Sharma',
        email: 'priya.qa@agency.com',
        password: defaultPassword,
        role: 'team_member',
        phone: '+1 (555) 789-0123',
        whatsapp: '+15557890123',
        skills: ['Cypress', 'Playwright', 'API Testing', 'Performance Testing', 'Jest'],
        joiningDate: new Date('2024-06-01'),
        status: 'active',
        notes: 'Senior QA & Automation Lead',
        avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      },
      {
        name: 'Liam Vance',
        email: 'liam.mobile@agency.com',
        password: defaultPassword,
        role: 'team_member',
        phone: '+1 (555) 890-1234',
        whatsapp: '+15558901234',
        skills: ['React Native', 'Expo', 'Swift', 'Kotlin', 'Mobile CI/CD'],
        joiningDate: new Date('2024-07-15'),
        status: 'active',
        notes: 'Mobile App Lead',
        avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
      },
    ]);

    const [admin, pmSarah, pmAlex, devDavid, designerElena, backMarcus, qaPriya, mobileLiam] = users;

    // 2. Create Clients
    const clients = await Client.create([
      {
        name: 'Jonathan Reynolds',
        companyName: 'Acme Fintech Corp',
        email: 'reynolds@acmefintech.io',
        phone: '+1 (415) 890-3421',
        whatsapp: '+14158903421',
        country: 'United States',
        address: '500 Howard Street, Suite 400, San Francisco, CA 94105',
        website: 'https://acmefintech.io',
        notes: 'High-growth fintech startup looking to scale digital banking services.',
        status: 'active',
      },
      {
        name: 'Dr. Charlotte Hughes',
        companyName: 'Nova Health Tech',
        email: 'charlotte@novahealth.co.uk',
        phone: '+44 20 7946 0912',
        whatsapp: '+442079460912',
        country: 'United Kingdom',
        address: '142 Holborn Bars, London EC1N 2NQ',
        website: 'https://novahealth.co.uk',
        notes: 'Telemedicine provider expanding virtual clinic services across Europe.',
        status: 'active',
      },
      {
        name: 'Hans Becker',
        companyName: 'Apex Logistics Global',
        email: 'becker@apexlogistics.de',
        phone: '+49 30 1234567',
        whatsapp: '+49301234567',
        country: 'Germany',
        address: 'Potsdamer Platz 1, 10785 Berlin',
        website: 'https://apexlogistics.de',
        notes: 'Supply chain & logistics operator managing European fleet operations.',
        status: 'active',
      },
      {
        name: 'Camille Laurent',
        companyName: 'Luxe Brands Studio',
        email: 'claurent@luxebrands.fr',
        phone: '+33 1 42 68 55 00',
        whatsapp: '+33142685500',
        country: 'France',
        address: '28 Rue du Faubourg Saint-Honoré, 75008 Paris',
        website: 'https://luxebrands.fr',
        notes: 'Luxury fashion e-commerce marketplace.',
        status: 'active',
      },
      {
        name: 'Wei Zhang',
        companyName: 'QuantEdge Analytics',
        email: 'wzhang@quantedge.sg',
        phone: '+65 6789 0123',
        country: 'Singapore',
        address: '1 Marina Boulevard, #28-00, Singapore 018989',
        website: 'https://quantedge.sg',
        notes: 'Quantitative financial intelligence & crypto portfolio analytics platform.',
        status: 'active',
      },
    ]);

    const [clientAcme, clientNova, clientApex, clientLuxe, clientQuant] = clients;

    // 3. Create Projects (Mix of USD and INR)
    const projects = await Project.create([
      {
        name: 'Fintech Mobile Wallet & Web Portal',
        projectId: 'PRJ-101',
        client: clientAcme._id,
        description: 'Next-generation peer-to-peer crypto & fiat multi-currency digital wallet with real-time settlement and compliance dashboard.',
        projectType: 'Fintech Platform',
        startDate: new Date('2025-01-10'),
        expectedEndDate: new Date('2025-05-30'),
        status: 'active',
        priority: 'urgent',
        currency: 'USD',
        projectValue: 24000, // $24,000 USD
        estimatedExchangeRate: 88,
        estimatedInrValue: 2112000, // ₹21,12,000 INR
        projectManager: pmSarah._id,
        technologies: ['React Native', 'Node.js', 'TypeScript', 'PostgreSQL', 'Stripe API', 'Tailwind'],
        notes: 'Key US client project billed in USD.',
      },
      {
        name: 'Telehealth Patient Portal & Video Consult',
        projectId: 'PRJ-102',
        client: clientNova._id,
        description: 'HIPAA/GDPR compliant telemedicine platform enabling video consultations, electronic prescriptions, and encrypted health records.',
        projectType: 'Healthcare SaaS',
        startDate: new Date('2025-02-01'),
        expectedEndDate: new Date('2025-06-15'),
        status: 'active',
        priority: 'high',
        currency: 'USD',
        projectValue: 18500, // $18,500 USD
        estimatedExchangeRate: 88.5,
        estimatedInrValue: 1637250, // ₹16,37,250 INR
        projectManager: pmAlex._id,
        technologies: ['Next.js', 'WebRTC', 'Node.js', 'MongoDB', 'AWS S3', 'Twilio'],
        notes: 'UK healthcare provider billed in USD with dedicated HIPAA compliance.',
      },
      {
        name: 'Smart Warehouse Logistics Dashboard',
        projectId: 'PRJ-103',
        client: clientApex._id,
        description: 'Real-time telemetry, automated dispatch dispatching, and inventory route optimization for European freight shipping.',
        projectType: 'Enterprise Dashboard',
        startDate: new Date('2024-11-15'),
        expectedEndDate: new Date('2025-04-30'),
        status: 'active',
        priority: 'medium',
        currency: 'INR',
        projectValue: 2500000, // ₹25,00,000 INR
        estimatedExchangeRate: 1,
        estimatedInrValue: 2500000,
        projectManager: pmSarah._id,
        technologies: ['React', 'TypeScript', 'Go', 'Docker', 'Redis', 'Kafka'],
        notes: 'Domestic enterprise logistics contract billed in INR.',
      },
      {
        name: 'Headless Luxury E-Commerce Platform',
        projectId: 'PRJ-104',
        client: clientLuxe._id,
        description: 'Bespoke high-performance luxury storefront with Shopify Plus backend, Algolia search, and 3D product visualizer.',
        projectType: 'E-Commerce Storefront',
        startDate: new Date('2024-10-01'),
        expectedEndDate: new Date('2025-01-20'),
        actualEndDate: new Date('2025-01-18'),
        status: 'completed',
        priority: 'medium',
        currency: 'INR',
        projectValue: 1000000, // ₹10,00,000 INR
        estimatedExchangeRate: 1,
        estimatedInrValue: 1000000,
        projectManager: pmAlex._id,
        technologies: ['Next.js', 'Shopify Plus API', 'Three.js', 'Tailwind CSS', 'Vercel'],
        notes: 'Successfully delivered under budget with exceptional client satisfaction.',
      },
      {
        name: 'AI Market Intelligence Dashboard',
        projectId: 'PRJ-105',
        client: clientQuant._id,
        description: 'Predictive market sentiment analyzer utilizing LLMs to synthesize news feeds and macro economic filings.',
        projectType: 'AI SaaS',
        startDate: new Date('2025-04-01'),
        expectedEndDate: new Date('2025-08-30'),
        status: 'planning',
        priority: 'low',
        currency: 'USD',
        projectValue: 15000, // $15,000 USD
        estimatedExchangeRate: 88,
        estimatedInrValue: 1320000,
        projectManager: pmSarah._id,
        technologies: ['Python', 'FastAPI', 'React', 'OpenAI API', 'Pinecone'],
        notes: 'Discovery sprint concluding next week; kickoff scheduled for April.',
      },
    ]);

    const [prj101, prj102, prj103, prj104, prj105] = projects;

    // 4. Create Project Payrolls (Always in INR)
    // PRJ-101 (Fintech $24k USD / ~₹21.12L INR) -> Total Team Payroll: ₹9,10,000
    const payrollPRJ101Dev = await Payroll.create({
      project: prj101._id,
      teamMember: devDavid._id,
      role: 'Lead Frontend Developer',
      currency: 'INR',
      agreedAmount: 350000,
      paymentType: 'fixed',
      totalPaid: 175000,
      pendingAmount: 175000,
      status: 'partially_paid',
    });

    const payrollPRJ101Mobile = await Payroll.create({
      project: prj101._id,
      teamMember: mobileLiam._id,
      role: 'React Native Mobile Developer',
      currency: 'INR',
      agreedAmount: 280000,
      paymentType: 'fixed',
      totalPaid: 140000,
      pendingAmount: 140000,
      status: 'partially_paid',
    });

    const payrollPRJ101Design = await Payroll.create({
      project: prj101._id,
      teamMember: designerElena._id,
      role: 'UI/UX & Fintech Designer',
      currency: 'INR',
      agreedAmount: 160000,
      paymentType: 'fixed',
      totalPaid: 160000,
      pendingAmount: 0,
      status: 'paid',
    });

    const payrollPRJ101QA = await Payroll.create({
      project: prj101._id,
      teamMember: qaPriya._id,
      role: 'QA & Security Tester',
      currency: 'INR',
      agreedAmount: 120000,
      paymentType: 'fixed',
      totalPaid: 0,
      pendingAmount: 120000,
      status: 'pending',
    });

    // PRJ-102 (Telehealth $18.5k USD / ~₹16.37L INR) -> Total Team Payroll: ₹7,30,000
    const payrollPRJ102Back = await Payroll.create({
      project: prj102._id,
      teamMember: backMarcus._id,
      role: 'Backend & WebRTC Engineer',
      currency: 'INR',
      agreedAmount: 320000,
      paymentType: 'fixed',
      totalPaid: 160000,
      pendingAmount: 160000,
      status: 'partially_paid',
    });

    const payrollPRJ102Dev = await Payroll.create({
      project: prj102._id,
      teamMember: devDavid._id,
      role: 'Full Stack Web Developer',
      currency: 'INR',
      agreedAmount: 260000,
      paymentType: 'fixed',
      totalPaid: 130000,
      pendingAmount: 130000,
      status: 'partially_paid',
    });

    const payrollPRJ102Design = await Payroll.create({
      project: prj102._id,
      teamMember: designerElena._id,
      role: 'Healthcare UX Designer',
      currency: 'INR',
      agreedAmount: 150000,
      paymentType: 'fixed',
      totalPaid: 150000,
      pendingAmount: 0,
      status: 'paid',
    });

    // PRJ-103 (Warehouse ₹25,00,000 INR) -> Total Team Payroll: ₹11,70,000
    const payrollPRJ103Back = await Payroll.create({
      project: prj103._id,
      teamMember: backMarcus._id,
      role: 'Lead Cloud & Distributed Systems',
      currency: 'INR',
      agreedAmount: 500000,
      paymentType: 'fixed',
      totalPaid: 250000,
      pendingAmount: 250000,
      status: 'partially_paid',
    });

    const payrollPRJ103Dev = await Payroll.create({
      project: prj103._id,
      teamMember: devDavid._id,
      role: 'Frontend Dashboard Specialist',
      currency: 'INR',
      agreedAmount: 420000,
      paymentType: 'fixed',
      totalPaid: 210000,
      pendingAmount: 210000,
      status: 'partially_paid',
    });

    const payrollPRJ103QA = await Payroll.create({
      project: prj103._id,
      teamMember: qaPriya._id,
      role: 'Automation & Load Testing',
      currency: 'INR',
      agreedAmount: 250000,
      paymentType: 'fixed',
      totalPaid: 125000,
      pendingAmount: 125000,
      status: 'partially_paid',
    });

    // PRJ-104 (Completed, ₹10,00,000 INR) -> Total Team Payroll: ₹4,60,000 (Fully Paid)
    const payrollPRJ104Dev = await Payroll.create({
      project: prj104._id,
      teamMember: devDavid._id,
      role: 'Next.js & Shopify Engineer',
      currency: 'INR',
      agreedAmount: 280000,
      paymentType: 'fixed',
      totalPaid: 280000,
      pendingAmount: 0,
      status: 'paid',
    });

    const payrollPRJ104Design = await Payroll.create({
      project: prj104._id,
      teamMember: designerElena._id,
      role: '3D & Brand Experience Designer',
      currency: 'INR',
      agreedAmount: 180000,
      paymentType: 'fixed',
      totalPaid: 180000,
      pendingAmount: 0,
      status: 'paid',
    });

    // 5. Create Payroll Milestones (Always in INR)
    await PayrollMilestone.create([
      // PRJ-101 Milestones (INR)
      {
        payroll: payrollPRJ101Dev._id,
        project: prj101._id,
        teamMember: devDavid._id,
        title: 'M1: Wallet Architecture & Auth Setup',
        currency: 'INR',
        amount: 175000,
        dueDate: new Date('2025-02-15'),
        paidDate: new Date('2025-02-14'),
        status: 'paid',
        paymentMethod: 'bank_transfer',
        transactionId: 'TXN-PAY-90812',
        notes: 'Delivered early with excellent code quality.',
      },
      {
        payroll: payrollPRJ101Dev._id,
        project: prj101._id,
        teamMember: devDavid._id,
        title: 'M2: Crypto & Multi-Currency Settlement Integration',
        currency: 'INR',
        amount: 175000,
        dueDate: new Date('2025-04-10'),
        status: 'pending',
        notes: 'Triggered upon API integration completion.',
      },
      {
        payroll: payrollPRJ101Mobile._id,
        project: prj101._id,
        teamMember: mobileLiam._id,
        title: 'M1: Core Mobile Screens & Biometrics',
        currency: 'INR',
        amount: 140000,
        dueDate: new Date('2025-02-28'),
        paidDate: new Date('2025-02-27'),
        status: 'paid',
        paymentMethod: 'bank_transfer',
        transactionId: 'TXN-PAY-88219',
        notes: 'Biometric passkey authentication approved.',
      },
      {
        payroll: payrollPRJ101Mobile._id,
        project: prj101._id,
        teamMember: mobileLiam._id,
        title: 'M2: App Store & Play Store Production Build',
        currency: 'INR',
        amount: 140000,
        dueDate: new Date('2025-05-15'),
        status: 'pending',
      },
      {
        payroll: payrollPRJ101Design._id,
        project: prj101._id,
        teamMember: designerElena._id,
        title: 'M1: Design System & Complete Figma Handoff',
        currency: 'INR',
        amount: 160000,
        dueDate: new Date('2025-02-05'),
        paidDate: new Date('2025-02-04'),
        status: 'paid',
        paymentMethod: 'bank_transfer',
        transactionId: 'TXN-PAY-77123',
        notes: 'Full design tokens and component library finalized.',
      },
      {
        payroll: payrollPRJ101QA._id,
        project: prj101._id,
        teamMember: qaPriya._id,
        title: 'M1: Security Vulnerability & End-to-End Suite',
        currency: 'INR',
        amount: 120000,
        dueDate: new Date('2025-05-20'),
        status: 'pending',
      },

      // PRJ-102 Milestones (INR)
      {
        payroll: payrollPRJ102Back._id,
        project: prj102._id,
        teamMember: backMarcus._id,
        title: 'M1: WebRTC Signaling Server & Telehealth DB',
        currency: 'INR',
        amount: 160000,
        dueDate: new Date('2025-03-01'),
        paidDate: new Date('2025-03-01'),
        status: 'paid',
        paymentMethod: 'bank_transfer',
        transactionId: 'TXN-PAY-66512',
      },
      {
        payroll: payrollPRJ102Back._id,
        project: prj102._id,
        teamMember: backMarcus._id,
        title: 'M2: HIPAA Compliance Encryption & Video Recording',
        currency: 'INR',
        amount: 160000,
        dueDate: new Date('2025-05-01'),
        status: 'pending',
      },
      {
        payroll: payrollPRJ102Dev._id,
        project: prj102._id,
        teamMember: devDavid._id,
        title: 'M1: Patient Dashboard & Doctor Scheduling',
        currency: 'INR',
        amount: 130000,
        dueDate: new Date('2025-03-10'),
        paidDate: new Date('2025-03-09'),
        status: 'paid',
        paymentMethod: 'bank_transfer',
        transactionId: 'TXN-PAY-54112',
      },
      {
        payroll: payrollPRJ102Dev._id,
        project: prj102._id,
        teamMember: devDavid._id,
        title: 'M2: Prescriptions & EHR Integration',
        currency: 'INR',
        amount: 130000,
        dueDate: new Date('2025-05-25'),
        status: 'pending',
      },
      {
        payroll: payrollPRJ102Design._id,
        project: prj102._id,
        teamMember: designerElena._id,
        title: 'M1: Clinical & Patient Experience Prototype',
        currency: 'INR',
        amount: 150000,
        dueDate: new Date('2025-02-20'),
        paidDate: new Date('2025-02-18'),
        status: 'paid',
        paymentMethod: 'bank_transfer',
        transactionId: 'TXN-PAY-44129',
      },

      // PRJ-103 Milestones (INR)
      {
        payroll: payrollPRJ103Back._id,
        project: prj103._id,
        teamMember: backMarcus._id,
        title: 'M1: GPS Telemetry & Event Ingestion Pipeline',
        currency: 'INR',
        amount: 250000,
        dueDate: new Date('2025-01-15'),
        paidDate: new Date('2025-01-14'),
        status: 'paid',
        paymentMethod: 'bank_transfer',
        transactionId: 'TXN-PAY-33100',
      },
      {
        payroll: payrollPRJ103Back._id,
        project: prj103._id,
        teamMember: backMarcus._id,
        title: 'M2: Automated Route Optimization Engine',
        currency: 'INR',
        amount: 250000,
        dueDate: new Date('2025-04-15'),
        status: 'pending',
      },
      {
        payroll: payrollPRJ103Dev._id,
        project: prj103._id,
        teamMember: devDavid._id,
        title: 'M1: Real-time Dispatch Map & Telemetry UI',
        currency: 'INR',
        amount: 210000,
        dueDate: new Date('2025-01-20'),
        paidDate: new Date('2025-01-19'),
        status: 'paid',
        paymentMethod: 'bank_transfer',
        transactionId: 'TXN-PAY-22981',
      },
      {
        payroll: payrollPRJ103Dev._id,
        project: prj103._id,
        teamMember: devDavid._id,
        title: 'M2: Freight Billing & Analytics Dashboard',
        currency: 'INR',
        amount: 210000,
        dueDate: new Date('2025-04-20'),
        status: 'pending',
      },
      {
        payroll: payrollPRJ103QA._id,
        project: prj103._id,
        teamMember: qaPriya._id,
        title: 'M1: High Concurrency Load Testing',
        currency: 'INR',
        amount: 125000,
        dueDate: new Date('2025-01-30'),
        paidDate: new Date('2025-01-29'),
        status: 'paid',
        paymentMethod: 'bank_transfer',
        transactionId: 'TXN-PAY-11092',
      },
      {
        payroll: payrollPRJ103QA._id,
        project: prj103._id,
        teamMember: qaPriya._id,
        title: 'M2: Automated Edge-Case Failover Tests',
        currency: 'INR',
        amount: 125000,
        dueDate: new Date('2025-04-25'),
        status: 'pending',
      },

      // PRJ-104 Milestones (Fully Settled in INR)
      {
        payroll: payrollPRJ104Dev._id,
        project: prj104._id,
        teamMember: devDavid._id,
        title: 'Full Platform Build & Launch Settlement',
        currency: 'INR',
        amount: 280000,
        dueDate: new Date('2025-01-18'),
        paidDate: new Date('2025-01-18'),
        status: 'paid',
        paymentMethod: 'bank_transfer',
        transactionId: 'TXN-PAY-10021',
      },
      {
        payroll: payrollPRJ104Design._id,
        project: prj104._id,
        teamMember: designerElena._id,
        title: 'Luxury 3D Interaction Design Settlement',
        currency: 'INR',
        amount: 180000,
        dueDate: new Date('2025-01-18'),
        paidDate: new Date('2025-01-18'),
        status: 'paid',
        paymentMethod: 'bank_transfer',
        transactionId: 'TXN-PAY-10022',
      },
    ]);

    // 6. Create Tasks
    await Task.create([
      // PRJ-101 Tasks
      {
        project: prj101._id,
        title: 'Setup Webhook Listeners for Stripe Crypto On-Ramp',
        description: 'Implement idempotent handling for customer crypto top-up events.',
        assignedTo: devDavid._id,
        priority: 'urgent',
        status: 'in_progress',
        dueDate: new Date('2025-04-05'),
      },
      {
        project: prj101._id,
        title: 'Implement FaceID / TouchID biometric login on React Native',
        description: 'Integrate native keychain storage for biometric authentication keys.',
        assignedTo: mobileLiam._id,
        priority: 'high',
        status: 'completed',
        dueDate: new Date('2025-02-25'),
      },
      {
        project: prj101._id,
        title: 'Multi-Currency exchange rate live graph UI',
        description: 'Build lightweight interactive canvas chart with 1s refresh interval.',
        assignedTo: devDavid._id,
        priority: 'medium',
        status: 'review',
        dueDate: new Date('2025-04-08'),
      },
      {
        project: prj101._id,
        title: 'Security audit on JWT refresh token revocation',
        description: 'Verify blacklisting mechanism on Redis cluster under concurrent requests.',
        assignedTo: qaPriya._id,
        priority: 'urgent',
        status: 'todo',
        dueDate: new Date('2025-05-10'),
      },
      {
        project: prj101._id,
        title: 'Finalize Dark Theme Palette & High Contrast Tokens',
        description: 'Ensure AAA accessibility compliance across all mobile and web screens.',
        assignedTo: designerElena._id,
        priority: 'medium',
        status: 'completed',
        dueDate: new Date('2025-02-01'),
      },

      // PRJ-102 Tasks
      {
        project: prj102._id,
        title: 'Implement Turn/Stun server fallback for restricted hospital networks',
        description: 'Configure Coturn on AWS with automatic certificate renewal.',
        assignedTo: backMarcus._id,
        priority: 'urgent',
        status: 'in_progress',
        dueDate: new Date('2025-04-12'),
      },
      {
        project: prj102._id,
        title: 'Doctor calendar booking slot selector component',
        description: 'Support multi-timezone conversion and recurring weekly availability.',
        assignedTo: devDavid._id,
        priority: 'high',
        status: 'completed',
        dueDate: new Date('2025-03-05'),
      },
      {
        project: prj102._id,
        title: 'Encrypted PDF Prescription generation & digital signature',
        description: 'Generate digitally signed prescription documents with QR verification.',
        assignedTo: devDavid._id,
        priority: 'medium',
        status: 'todo',
        dueDate: new Date('2025-05-18'),
      },
      {
        project: prj102._id,
        title: 'Conduct simulated HIPAA breach penetrations',
        description: 'Run automated OWASP Top 10 and patient data leakage tests.',
        assignedTo: qaPriya._id,
        priority: 'urgent',
        status: 'todo',
        dueDate: new Date('2025-05-30'),
      },

      // PRJ-103 Tasks
      {
        project: prj103._id,
        title: 'Optimize MapBox WebGL rendering for 10,000 live fleet markers',
        description: 'Use custom WebGL point clustering for ultra-smooth 60fps pan/zoom.',
        assignedTo: devDavid._id,
        priority: 'high',
        status: 'in_progress',
        dueDate: new Date('2025-04-15'),
      },
      {
        project: prj103._id,
        title: 'Implement Kafka event streamer for truck telemetry payloads',
        description: 'Process 50k telemetry pings/sec with sub-50ms latency.',
        assignedTo: backMarcus._id,
        priority: 'urgent',
        status: 'completed',
        dueDate: new Date('2025-01-10'),
      },
      {
        project: prj103._id,
        title: 'Automated fuel cost & route mileage estimation microservice',
        description: 'Integrate European toll API and dynamic diesel price indices.',
        assignedTo: backMarcus._id,
        priority: 'medium',
        status: 'review',
        dueDate: new Date('2025-04-18'),
      },

      // PRJ-104 Tasks (Completed Project)
      {
        project: prj104._id,
        title: 'Integrate 3D GLTF product model viewer with Three.js',
        description: 'Support photorealistic material rendering with mobile touch rotation.',
        assignedTo: devDavid._id,
        priority: 'high',
        status: 'completed',
        dueDate: new Date('2025-01-10'),
      },
      {
        project: prj104._id,
        title: 'Shopify Plus headless checkout optimization',
        description: 'Achieve sub-1.2s checkout loading speed on 4G cellular connections.',
        assignedTo: devDavid._id,
        priority: 'urgent',
        status: 'completed',
        dueDate: new Date('2025-01-15'),
      },
    ]);

    // 7. Create Client Payments (Multi-Currency with Stored Exchange Rates)
    await ClientPayment.create([
      // PRJ-101 (USD $24,000 Project)
      {
        project: prj101._id,
        client: clientAcme._id,
        currency: 'USD',
        amount: 10000, // $10,000 USD
        exchangeRate: 88,
        inrAmount: 880000, // ₹8,80,000 INR
        paymentDate: new Date('2025-01-12'),
        dueDate: new Date('2025-01-15'),
        paymentMethod: 'wire',
        transactionId: 'ACME-INV-001-PAID',
        status: 'paid',
        notes: 'Initial 40% project kickoff retainer at ₹88/USD.',
      },
      {
        project: prj101._id,
        client: clientAcme._id,
        currency: 'USD',
        amount: 8000, // $8,000 USD
        exchangeRate: 88.5,
        inrAmount: 708000, // ₹7,08,000 INR
        paymentDate: new Date('2025-03-01'),
        dueDate: new Date('2025-03-01'),
        paymentMethod: 'wire',
        transactionId: 'ACME-INV-002-PAID',
        status: 'paid',
        notes: 'Midway milestone delivery payment at ₹88.50/USD.',
      },
      {
        project: prj101._id,
        client: clientAcme._id,
        currency: 'USD',
        amount: 6000, // $6,000 USD
        exchangeRate: 88,
        inrAmount: 528000,
        dueDate: new Date('2025-05-30'),
        paymentMethod: 'wire',
        status: 'pending',
        notes: 'Final acceptance & deployment tranche.',
      },

      // PRJ-102 (USD $18,500 Project)
      {
        project: prj102._id,
        client: clientNova._id,
        currency: 'USD',
        amount: 9000, // $9,000 USD
        exchangeRate: 88.5,
        inrAmount: 796500, // ₹7,96,500 INR
        paymentDate: new Date('2025-02-05'),
        dueDate: new Date('2025-02-05'),
        paymentMethod: 'stripe',
        transactionId: 'NOVA-INV-101-PAID',
        status: 'paid',
        notes: 'Retainer deposit for healthcare SaaS build at ₹88.50/USD.',
      },
      {
        project: prj102._id,
        client: clientNova._id,
        currency: 'USD',
        amount: 9500, // $9,500 USD
        exchangeRate: 88.5,
        inrAmount: 840750,
        dueDate: new Date('2025-06-15'),
        paymentMethod: 'stripe',
        status: 'pending',
        notes: 'Final milestone invoice.',
      },

      // PRJ-103 (INR ₹25,00,000 Project)
      {
        project: prj103._id,
        client: clientApex._id,
        currency: 'INR',
        amount: 1250000, // ₹12,50,000 INR
        exchangeRate: 1,
        inrAmount: 1250000,
        paymentDate: new Date('2024-11-20'),
        dueDate: new Date('2024-11-25'),
        paymentMethod: 'bank_transfer',
        transactionId: 'APEX-INV-990-PAID',
        status: 'paid',
        notes: '50% upfront project commitment in INR.',
      },
      {
        project: prj103._id,
        client: clientApex._id,
        currency: 'INR',
        amount: 625000, // ₹6,25,000 INR
        exchangeRate: 1,
        inrAmount: 625000,
        paymentDate: new Date('2025-02-15'),
        dueDate: new Date('2025-02-20'),
        paymentMethod: 'bank_transfer',
        transactionId: 'APEX-INV-991-PAID',
        status: 'paid',
        notes: 'Beta release delivery payment in INR.',
      },
      {
        project: prj103._id,
        client: clientApex._id,
        currency: 'INR',
        amount: 625000, // ₹6,25,000 INR
        exchangeRate: 1,
        inrAmount: 625000,
        dueDate: new Date('2025-04-30'),
        paymentMethod: 'bank_transfer',
        status: 'pending',
        notes: 'Final production sign-off balance in INR.',
      },

      // PRJ-104 (INR ₹10,00,000 - 100% Paid)
      {
        project: prj104._id,
        client: clientLuxe._id,
        currency: 'INR',
        amount: 500000, // ₹5,00,000 INR
        exchangeRate: 1,
        inrAmount: 500000,
        paymentDate: new Date('2024-10-05'),
        dueDate: new Date('2024-10-10'),
        paymentMethod: 'bank_transfer',
        transactionId: 'LUXE-INV-01-PAID',
        status: 'paid',
      },
      {
        project: prj104._id,
        client: clientLuxe._id,
        currency: 'INR',
        amount: 500000, // ₹5,00,000 INR
        exchangeRate: 1,
        inrAmount: 500000,
        paymentDate: new Date('2025-01-20'),
        dueDate: new Date('2025-01-20'),
        paymentMethod: 'bank_transfer',
        transactionId: 'LUXE-INV-02-PAID',
        status: 'paid',
        notes: 'Final storefront launch sign-off.',
      },
    ]);

    // 8. Create Expenses (Always in INR)
    await Expense.create([
      // PRJ-101 Expenses (INR)
      {
        project: prj101._id,
        name: 'AWS Cloud Infrastructure (EKS + RDS)',
        category: 'hosting',
        currency: 'INR',
        amount: 38000,
        date: new Date('2025-02-01'),
        paymentMethod: 'credit_card',
        description: 'Dedicated staging and load test cluster on AWS.',
      },
      {
        project: prj101._id,
        name: 'Stripe Identity & KYC Verification Sandbox',
        category: 'api',
        currency: 'INR',
        amount: 26000,
        date: new Date('2025-02-15'),
        paymentMethod: 'credit_card',
        description: 'Identity verification & AML compliance test tier.',
      },
      {
        project: prj101._id,
        name: 'Apple Developer Enterprise & Google Play Accounts',
        category: 'software',
        currency: 'INR',
        amount: 25000,
        date: new Date('2025-01-15'),
        paymentMethod: 'credit_card',
        description: 'Store publishing credentials for client app builds.',
      },

      // PRJ-102 Expenses (INR)
      {
        project: prj102._id,
        name: 'Twilio Video & WebRTC Network Traffic',
        category: 'api',
        currency: 'INR',
        amount: 24000,
        date: new Date('2025-03-01'),
        paymentMethod: 'credit_card',
        description: 'Encrypted HD video consultation bandwidth.',
      },
      {
        project: prj102._id,
        name: 'HIPAA Compliant Cloud S3 Storage',
        category: 'hosting',
        currency: 'INR',
        amount: 15000,
        date: new Date('2025-03-10'),
        paymentMethod: 'credit_card',
        description: 'KMS customer-managed encrypted document store.',
      },

      // PRJ-103 Expenses (INR)
      {
        project: prj103._id,
        name: 'MapBox Enterprise Tile & Directions API',
        category: 'api',
        currency: 'INR',
        amount: 55000,
        date: new Date('2025-01-25'),
        paymentMethod: 'credit_card',
        description: 'High-volume routing vector tiles for European fleet tracking.',
      },
      {
        project: prj103._id,
        name: 'Confluent Cloud Kafka Cluster',
        category: 'hosting',
        currency: 'INR',
        amount: 42000,
        date: new Date('2025-02-10'),
        paymentMethod: 'credit_card',
        description: 'Managed multi-AZ Kafka streaming topic broker.',
      },

      // PRJ-104 Expenses (INR)
      {
        project: prj104._id,
        name: 'Vercel Enterprise & Algolia Search Index',
        category: 'hosting',
        currency: 'INR',
        amount: 28000,
        date: new Date('2024-11-15'),
        paymentMethod: 'credit_card',
        description: 'Edge CDN distribution and instant product catalog search.',
      },

      // General Agency Expenses (INR)
      {
        name: 'Figma Enterprise Design System Seat Licenses',
        category: 'software',
        currency: 'INR',
        amount: 30000,
        date: new Date('2025-01-01'),
        paymentMethod: 'credit_card',
        description: 'Agency-wide UI/UX collaboration licenses in INR.',
      },
      {
        name: 'GitHub Enterprise & CI/CD Compute Hours',
        category: 'software',
        currency: 'INR',
        amount: 20000,
        date: new Date('2025-01-05'),
        paymentMethod: 'credit_card',
        description: 'Repository hosting and automated deployment runners in INR.',
      },
    ]);

    console.log('✅ Agency demo data seeded successfully!');
    console.log('----------------------------------------------------');
    console.log('🔑 Demo User Accounts:');
    console.log('  👑 Admin:           admin@agency.com     / Agency@1234');
    console.log('  💼 Project Manager: sarah.pm@agency.com  / Agency@1234');
    console.log('  💼 Project Manager: alex.pm@agency.com   / Agency@1234');
    console.log('  💻 Team Member:     david.dev@agency.com / Agency@1234');
    console.log('  🎨 Team Member:     elena.ui@agency.com  / Agency@1234');
    console.log('----------------------------------------------------');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  }
};
