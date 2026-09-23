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

    // 3. Create Projects
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
        projectValue: 24000,
        projectManager: pmSarah._id,
        technologies: ['React Native', 'Node.js', 'TypeScript', 'PostgreSQL', 'Stripe API', 'Tailwind'],
        notes: 'Key client project with aggressive Q2 launch milestone.',
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
        projectValue: 18500,
        projectManager: pmAlex._id,
        technologies: ['Next.js', 'WebRTC', 'Node.js', 'MongoDB', 'AWS S3', 'Twilio'],
        notes: 'Requires rigorous security audits and zero-latency video streaming.',
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
        projectValue: 32000,
        projectManager: pmSarah._id,
        technologies: ['React', 'TypeScript', 'Go', 'Docker', 'Redis', 'Kafka'],
        notes: 'Long-term enterprise contract with potential phase 2 expansion.',
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
        projectValue: 12000,
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
        projectValue: 15000,
        projectManager: pmSarah._id,
        technologies: ['Python', 'FastAPI', 'React', 'OpenAI API', 'Pinecone'],
        notes: 'Discovery sprint concluding next week; kickoff scheduled for April.',
      },
    ]);

    const [prj101, prj102, prj103, prj104, prj105] = projects;

    // 4. Create Project Payrolls (Fixed Project Payments for Team Members)
    // PRJ-101 (Value: 24,000) -> Total Team Payroll: 11,200
    const payrollPRJ101Dev = await Payroll.create({
      project: prj101._id,
      teamMember: devDavid._id,
      role: 'Lead Frontend Developer',
      agreedAmount: 4200,
      paymentType: 'fixed',
      totalPaid: 2100,
      pendingAmount: 2100,
      status: 'partially_paid',
    });

    const payrollPRJ101Mobile = await Payroll.create({
      project: prj101._id,
      teamMember: mobileLiam._id,
      role: 'React Native Mobile Developer',
      agreedAmount: 3500,
      paymentType: 'fixed',
      totalPaid: 1500,
      pendingAmount: 2000,
      status: 'partially_paid',
    });

    const payrollPRJ101Design = await Payroll.create({
      project: prj101._id,
      teamMember: designerElena._id,
      role: 'UI/UX & Fintech Designer',
      agreedAmount: 2000,
      paymentType: 'fixed',
      totalPaid: 2000,
      pendingAmount: 0,
      status: 'paid',
    });

    const payrollPRJ101QA = await Payroll.create({
      project: prj101._id,
      teamMember: qaPriya._id,
      role: 'QA & Security Tester',
      agreedAmount: 1500,
      paymentType: 'fixed',
      totalPaid: 0,
      pendingAmount: 1500,
      status: 'pending',
    });

    // PRJ-102 (Value: 18,500) -> Total Team Payroll: 8,800
    const payrollPRJ102Back = await Payroll.create({
      project: prj102._id,
      teamMember: backMarcus._id,
      role: 'Backend & WebRTC Engineer',
      agreedAmount: 3800,
      paymentType: 'fixed',
      totalPaid: 1900,
      pendingAmount: 1900,
      status: 'partially_paid',
    });

    const payrollPRJ102Dev = await Payroll.create({
      project: prj102._id,
      teamMember: devDavid._id,
      role: 'Full Stack Web Developer',
      agreedAmount: 3200,
      paymentType: 'fixed',
      totalPaid: 1600,
      pendingAmount: 1600,
      status: 'partially_paid',
    });

    const payrollPRJ102Design = await Payroll.create({
      project: prj102._id,
      teamMember: designerElena._id,
      role: 'Healthcare UX Designer',
      agreedAmount: 1800,
      paymentType: 'fixed',
      totalPaid: 1800,
      pendingAmount: 0,
      status: 'paid',
    });

    // PRJ-103 (Value: 32,000) -> Total Team Payroll: 15,500
    const payrollPRJ103Back = await Payroll.create({
      project: prj103._id,
      teamMember: backMarcus._id,
      role: 'Lead Cloud & Distributed Systems',
      agreedAmount: 6500,
      paymentType: 'fixed',
      totalPaid: 3250,
      pendingAmount: 3250,
      status: 'partially_paid',
    });

    const payrollPRJ103Dev = await Payroll.create({
      project: prj103._id,
      teamMember: devDavid._id,
      role: 'Frontend Dashboard Specialist',
      agreedAmount: 5500,
      paymentType: 'fixed',
      totalPaid: 2750,
      pendingAmount: 2750,
      status: 'partially_paid',
    });

    const payrollPRJ103QA = await Payroll.create({
      project: prj103._id,
      teamMember: qaPriya._id,
      role: 'Automation & Load Testing',
      agreedAmount: 3500,
      paymentType: 'fixed',
      totalPaid: 1750,
      pendingAmount: 1750,
      status: 'partially_paid',
    });

    // PRJ-104 (Completed, Value: 12,000) -> Total Team Payroll: 5,400 (Fully Paid)
    const payrollPRJ104Dev = await Payroll.create({
      project: prj104._id,
      teamMember: devDavid._id,
      role: 'Next.js & Shopify Engineer',
      agreedAmount: 3200,
      paymentType: 'fixed',
      totalPaid: 3200,
      pendingAmount: 0,
      status: 'paid',
    });

    const payrollPRJ104Design = await Payroll.create({
      project: prj104._id,
      teamMember: designerElena._id,
      role: '3D & Brand Experience Designer',
      agreedAmount: 2200,
      paymentType: 'fixed',
      totalPaid: 2200,
      pendingAmount: 0,
      status: 'paid',
    });

    // 5. Create Payroll Milestones
    await PayrollMilestone.create([
      // PRJ-101 Milestones
      {
        payroll: payrollPRJ101Dev._id,
        project: prj101._id,
        teamMember: devDavid._id,
        title: 'M1: Wallet Architecture & Auth Setup',
        amount: 2100,
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
        amount: 2100,
        dueDate: new Date('2025-04-10'),
        status: 'pending',
        notes: 'Triggered upon API integration completion.',
      },
      {
        payroll: payrollPRJ101Mobile._id,
        project: prj101._id,
        teamMember: mobileLiam._id,
        title: 'M1: Core Mobile Screens & Biometrics',
        amount: 1500,
        dueDate: new Date('2025-02-28'),
        paidDate: new Date('2025-02-27'),
        status: 'paid',
        paymentMethod: 'wise',
        transactionId: 'TXN-PAY-88219',
        notes: 'Biometric passkey authentication approved.',
      },
      {
        payroll: payrollPRJ101Mobile._id,
        project: prj101._id,
        teamMember: mobileLiam._id,
        title: 'M2: App Store & Play Store Production Build',
        amount: 2000,
        dueDate: new Date('2025-05-15'),
        status: 'pending',
      },
      {
        payroll: payrollPRJ101Design._id,
        project: prj101._id,
        teamMember: designerElena._id,
        title: 'M1: Design System & Complete Figma Handoff',
        amount: 2000,
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
        amount: 1500,
        dueDate: new Date('2025-05-20'),
        status: 'pending',
      },

      // PRJ-102 Milestones
      {
        payroll: payrollPRJ102Back._id,
        project: prj102._id,
        teamMember: backMarcus._id,
        title: 'M1: WebRTC Signaling Server & Telehealth DB',
        amount: 1900,
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
        amount: 1900,
        dueDate: new Date('2025-05-01'),
        status: 'pending',
      },
      {
        payroll: payrollPRJ102Dev._id,
        project: prj102._id,
        teamMember: devDavid._id,
        title: 'M1: Patient Dashboard & Doctor Scheduling',
        amount: 1600,
        dueDate: new Date('2025-03-10'),
        paidDate: new Date('2025-03-09'),
        status: 'paid',
        paymentMethod: 'stripe',
        transactionId: 'TXN-PAY-54112',
      },
      {
        payroll: payrollPRJ102Dev._id,
        project: prj102._id,
        teamMember: devDavid._id,
        title: 'M2: Prescriptions & EHR Integration',
        amount: 1600,
        dueDate: new Date('2025-05-25'),
        status: 'pending',
      },
      {
        payroll: payrollPRJ102Design._id,
        project: prj102._id,
        teamMember: designerElena._id,
        title: 'M1: Clinical & Patient Experience Prototype',
        amount: 1800,
        dueDate: new Date('2025-02-20'),
        paidDate: new Date('2025-02-18'),
        status: 'paid',
        paymentMethod: 'bank_transfer',
        transactionId: 'TXN-PAY-44129',
      },

      // PRJ-103 Milestones
      {
        payroll: payrollPRJ103Back._id,
        project: prj103._id,
        teamMember: backMarcus._id,
        title: 'M1: GPS Telemetry & Event Ingestion Pipeline',
        amount: 3250,
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
        amount: 3250,
        dueDate: new Date('2025-04-15'),
        status: 'pending',
      },
      {
        payroll: payrollPRJ103Dev._id,
        project: prj103._id,
        teamMember: devDavid._id,
        title: 'M1: Real-time Dispatch Map & Telemetry UI',
        amount: 2750,
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
        amount: 2750,
        dueDate: new Date('2025-04-20'),
        status: 'pending',
      },
      {
        payroll: payrollPRJ103QA._id,
        project: prj103._id,
        teamMember: qaPriya._id,
        title: 'M1: High Concurrency Load Testing',
        amount: 1750,
        dueDate: new Date('2025-01-30'),
        paidDate: new Date('2025-01-29'),
        status: 'paid',
        paymentMethod: 'wise',
        transactionId: 'TXN-PAY-11092',
      },
      {
        payroll: payrollPRJ103QA._id,
        project: prj103._id,
        teamMember: qaPriya._id,
        title: 'M2: Automated Edge-Case Failover Tests',
        amount: 1750,
        dueDate: new Date('2025-04-25'),
        status: 'pending',
      },

      // PRJ-104 Milestones (Fully Settled)
      {
        payroll: payrollPRJ104Dev._id,
        project: prj104._id,
        teamMember: devDavid._id,
        title: 'Full Platform Build & Launch Settlement',
        amount: 3200,
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
        amount: 2200,
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

    // 7. Create Client Payments (Invoices & Inflows)
    await ClientPayment.create([
      // PRJ-101 (Value: 24,000)
      {
        project: prj101._id,
        client: clientAcme._id,
        amount: 10000,
        paymentDate: new Date('2025-01-12'),
        dueDate: new Date('2025-01-15'),
        paymentMethod: 'wire',
        transactionId: 'ACME-INV-001-PAID',
        status: 'paid',
        notes: 'Initial 40% project kickoff retainer.',
      },
      {
        project: prj101._id,
        client: clientAcme._id,
        amount: 8000,
        paymentDate: new Date('2025-03-01'),
        dueDate: new Date('2025-03-01'),
        paymentMethod: 'wire',
        transactionId: 'ACME-INV-002-PAID',
        status: 'paid',
        notes: 'Midway milestone delivery payment.',
      },
      {
        project: prj101._id,
        client: clientAcme._id,
        amount: 6000,
        dueDate: new Date('2025-05-30'),
        paymentMethod: 'wire',
        status: 'pending',
        notes: 'Final acceptance & deployment tranche.',
      },

      // PRJ-102 (Value: 18,500)
      {
        project: prj102._id,
        client: clientNova._id,
        amount: 9000,
        paymentDate: new Date('2025-02-05'),
        dueDate: new Date('2025-02-05'),
        paymentMethod: 'stripe',
        transactionId: 'NOVA-INV-101-PAID',
        status: 'paid',
        notes: 'Retainer deposit for healthcare SaaS build.',
      },
      {
        project: prj102._id,
        client: clientNova._id,
        amount: 9500,
        dueDate: new Date('2025-06-15'),
        paymentMethod: 'stripe',
        status: 'pending',
        notes: 'Final milestone invoice.',
      },

      // PRJ-103 (Value: 32,000)
      {
        project: prj103._id,
        client: clientApex._id,
        amount: 16000,
        paymentDate: new Date('2024-11-20'),
        dueDate: new Date('2024-11-25'),
        paymentMethod: 'bank_transfer',
        transactionId: 'APEX-INV-990-PAID',
        status: 'paid',
        notes: '50% upfront project commitment.',
      },
      {
        project: prj103._id,
        client: clientApex._id,
        amount: 8000,
        paymentDate: new Date('2025-02-15'),
        dueDate: new Date('2025-02-20'),
        paymentMethod: 'bank_transfer',
        transactionId: 'APEX-INV-991-PAID',
        status: 'paid',
        notes: 'Beta release delivery payment.',
      },
      {
        project: prj103._id,
        client: clientApex._id,
        amount: 8000,
        dueDate: new Date('2025-04-30'),
        paymentMethod: 'bank_transfer',
        status: 'pending',
        notes: 'Final production sign-off balance.',
      },

      // PRJ-104 (Value: 12,000 - 100% Paid)
      {
        project: prj104._id,
        client: clientLuxe._id,
        amount: 6000,
        paymentDate: new Date('2024-10-05'),
        dueDate: new Date('2024-10-10'),
        paymentMethod: 'stripe',
        transactionId: 'LUXE-INV-01-PAID',
        status: 'paid',
      },
      {
        project: prj104._id,
        client: clientLuxe._id,
        amount: 6000,
        paymentDate: new Date('2025-01-20'),
        dueDate: new Date('2025-01-20'),
        paymentMethod: 'stripe',
        transactionId: 'LUXE-INV-02-PAID',
        status: 'paid',
        notes: 'Final storefront launch sign-off.',
      },
    ]);

    // 8. Create Expenses
    await Expense.create([
      // PRJ-101 Expenses
      {
        project: prj101._id,
        name: 'AWS Cloud Infrastructure (EKS + RDS)',
        category: 'hosting',
        amount: 450,
        date: new Date('2025-02-01'),
        paymentMethod: 'credit_card',
        description: 'Dedicated staging and load test cluster on AWS us-east-1.',
      },
      {
        project: prj101._id,
        name: 'Stripe Identity & KYC Verification Sandbox',
        category: 'api',
        amount: 320,
        date: new Date('2025-02-15'),
        paymentMethod: 'credit_card',
        description: 'Identity verification & AML compliance test tier.',
      },
      {
        project: prj101._id,
        name: 'Apple Developer Enterprise & Google Play Accounts',
        category: 'software',
        amount: 299,
        date: new Date('2025-01-15'),
        paymentMethod: 'credit_card',
        description: 'Store publishing credentials for client app builds.',
      },

      // PRJ-102 Expenses
      {
        project: prj102._id,
        name: 'Twilio Video & WebRTC Network Traffic',
        category: 'api',
        amount: 280,
        date: new Date('2025-03-01'),
        paymentMethod: 'credit_card',
        description: 'Encrypted HD video consultation bandwidth.',
      },
      {
        project: prj102._id,
        name: 'HIPAA Compliant Cloud S3 Storage',
        category: 'hosting',
        amount: 180,
        date: new Date('2025-03-10'),
        paymentMethod: 'credit_card',
        description: 'KMS customer-managed encrypted document store.',
      },

      // PRJ-103 Expenses
      {
        project: prj103._id,
        name: 'MapBox Enterprise Tile & Directions API',
        category: 'api',
        amount: 650,
        date: new Date('2025-01-25'),
        paymentMethod: 'credit_card',
        description: 'High-volume routing vector tiles for European fleet tracking.',
      },
      {
        project: prj103._id,
        name: 'Confluent Cloud Kafka Cluster',
        category: 'hosting',
        amount: 520,
        date: new Date('2025-02-10'),
        paymentMethod: 'credit_card',
        description: 'Managed multi-AZ Kafka streaming topic broker.',
      },

      // PRJ-104 Expenses
      {
        project: prj104._id,
        name: 'Vercel Enterprise & Algolia Search Index',
        category: 'hosting',
        amount: 350,
        date: new Date('2024-11-15'),
        paymentMethod: 'credit_card',
        description: 'Edge CDN distribution and instant product catalog search.',
      },

      // General Agency Expenses
      {
        name: 'Figma Enterprise Design System Seat Licenses',
        category: 'software',
        amount: 360,
        date: new Date('2025-01-01'),
        paymentMethod: 'credit_card',
        description: 'Agency-wide UI/UX collaboration licenses.',
      },
      {
        name: 'GitHub Enterprise & CI/CD Compute Hours',
        category: 'software',
        amount: 240,
        date: new Date('2025-01-05'),
        paymentMethod: 'credit_card',
        description: 'Repository hosting and automated deployment runners.',
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
