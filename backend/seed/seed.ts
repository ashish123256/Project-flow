import mongoose from 'mongoose';
import * as bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const MONGO_URI =
  process.env.MONGODB_URI || 'mongodb://localhost:27017/project-management';

// ── Schemas (inline to avoid NestJS DI overhead in seed) ──────────────────────
const UserSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true, lowercase: true },
    password: String,
  },
  { timestamps: true },
);

const ProjectSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    status: { type: String, enum: ['active', 'completed'], default: 'active' },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true },
);

const TaskSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    status: {
      type: String,
      enum: ['todo', 'in-progress', 'done'],
      default: 'todo',
    },
    dueDate: Date,
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true },
);

const UserModel = mongoose.model('User', UserSchema);
const ProjectModel = mongoose.model('Project', ProjectSchema);
const TaskModel = mongoose.model('Task', TaskSchema);

// ── Seed Data ─────────────────────────────────────────────────────────────────
async function seed() {
  console.log('Starting seed process...');
  console.log(`Connecting to: ${MONGO_URI}`);

  await mongoose.connect(MONGO_URI);
  console.log('MongoDB connected');

  // Clear existing seed data
  await Promise.all([
    UserModel.deleteMany({ email: 'test@example.com' }),
    ProjectModel.deleteMany({}),
    TaskModel.deleteMany({}),
  ]);

  console.log('Cleared existing seed data');

  // ── Create User ──────────────────────────────────────────────────────────────
  const hashedPassword = await bcrypt.hash('Test@123', 12);
  const user = await UserModel.create({
    name: 'Test User',
    email: 'test@example.com',
    password: hashedPassword,
  });
  console.log(`Created user: ${user.email}`);

  // ── Create Projects ──────────────────────────────────────────────────────────
  const projects = await ProjectModel.insertMany([
    {
      title: 'E-Commerce Platform Redesign',
      description:
        'Complete overhaul of the existing e-commerce platform with modern UI/UX, improved checkout flow, and mobile-first design. Goal is to increase conversion rate by 30%.',
      status: 'active',
      owner: user._id,
    },
    {
      title: 'Internal Analytics Dashboard',
      description:
        'Build a real-time analytics dashboard for the operations team. Includes sales metrics, user activity heatmaps, and automated weekly report generation.',
      status: 'active',
      owner: user._id,
    },
    {
      title: 'Legacy API Migration',
      description:
        'Migrate all legacy REST endpoints to GraphQL. Includes documentation, versioning strategy, and backward compatibility layer.',
      status: 'completed',
      owner: user._id,
    },
  ]);

  const [project1, project2, project3] = projects;
  console.log(`Created 3 projects`);

  // ── Create Tasks for Project 1 ───────────────────────────────────────────────
  const now = new Date();
  const future = (days: number) =>
    new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
  const past = (days: number) =>
    new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

  const tasksData = [
    // Project 1 tasks
    {
      title: 'Conduct UX Research & User Interviews',
      description:
        'Interview at least 15 existing customers to identify pain points in the current checkout flow. Create affinity map and user journey documentation.',
      status: 'done',
      dueDate: past(10),
      project: project1._id,
      owner: user._id,
    },
    {
      title: 'Design New Checkout Flow Wireframes',
      description:
        'Create low-fi wireframes for the 3-step checkout process. Include mobile, tablet, and desktop breakpoints. Get sign-off from product team.',
      status: 'done',
      dueDate: past(5),
      project: project1._id,
      owner: user._id,
    },
    {
      title: 'Implement Product Listing Page',
      description:
        'Build the new product listing page with filtering, sorting, and infinite scroll. Must be performant with 1000+ products.',
      status: 'in-progress',
      dueDate: future(7),
      project: project1._id,
      owner: user._id,
    },
    {
      title: 'Integrate Stripe Payment Gateway',
      description:
        'Replace legacy PayPal integration with Stripe. Implement card payments, UPI, and wallet support. Include webhook handling for payment events.',
      status: 'in-progress',
      dueDate: future(14),
      project: project1._id,
      owner: user._id,
    },
    {
      title: 'Set Up End-to-End Test Suite',
      description:
        'Write Playwright E2E tests covering: browse → add to cart → checkout → confirmation. Must run in CI/CD pipeline.',
      status: 'todo',
      dueDate: future(21),
      project: project1._id,
      owner: user._id,
    },
    {
      title: 'Performance Optimization & Lighthouse Audit',
      description:
        'Achieve Lighthouse score > 90 for all pages. Implement lazy loading, image optimization, and bundle splitting.',
      status: 'todo',
      dueDate: future(28),
      project: project1._id,
      owner: user._id,
    },

    // Project 2 tasks
    {
      title: 'Define Metrics & KPIs with Stakeholders',
      description:
        'Align with ops, finance, and marketing on the top 20 metrics the dashboard needs to display. Document in Confluence.',
      status: 'done',
      dueDate: past(15),
      project: project2._id,
      owner: user._id,
    },
    {
      title: 'Set Up Data Pipeline with Apache Kafka',
      description:
        'Configure Kafka topics for real-time event streaming. Build consumers to aggregate daily active users, revenue, and conversion events.',
      status: 'in-progress',
      dueDate: future(5),
      project: project2._id,
      owner: user._id,
    },
    {
      title: 'Build Dashboard UI with Recharts',
      description:
        'Implement line charts, bar graphs, pie charts, and data tables. Use React Query for real-time data fetching with 30-second auto-refresh.',
      status: 'in-progress',
      dueDate: future(10),
      project: project2._id,
      owner: user._id,
    },
    {
      title: 'Implement Role-Based Access Control',
      description:
        'Admin sees all data. Manager sees their team only. Viewer gets read-only access. Build permission middleware and UI guards.',
      status: 'todo',
      dueDate: future(18),
      project: project2._id,
      owner: user._id,
    },
    {
      title: 'Schedule Automated Weekly Email Reports',
      description:
        'Use node-cron to generate and email PDF reports every Monday 9AM. Include top-level KPIs and week-over-week trend analysis.',
      status: 'todo',
      dueDate: future(25),
      project: project2._id,
      owner: user._id,
    },

    // Project 3 tasks
    {
      title: 'Audit Legacy REST Endpoints',
      description:
        'Document all existing REST endpoints, their request/response formats, and current usage. Create comprehensive API audit report.',
      status: 'done',
      dueDate: past(30),
      project: project3._id,
      owner: user._id,
    },
    {
      title: 'Design GraphQL Schema',
      description:
        'Create GraphQL schema that mirrors REST API. Include query types, mutation types, and subscription types. Get stakeholder review.',
      status: 'done',
      dueDate: past(20),
      project: project3._id,
      owner: user._id,
    },
    {
      title: 'Implement GraphQL Resolvers',
      description:
        'Build resolvers for all queries and mutations. Ensure backward compatibility with existing clients during transition period.',
      status: 'in-progress',
      dueDate: future(10),
      project: project3._id,
      owner: user._id,
    },
    {
      title: 'Write API Documentation',
      description:
        'Create comprehensive GraphQL API docs using GraphQL Playground. Include query examples, error handling, rate limits.',
      status: 'todo',
      dueDate: future(20),
      project: project3._id,
      owner: user._id,
    },
  ];

  try {
    const taskResult = await TaskModel.insertMany(tasksData);
    console.log(`Created ${taskResult.length} tasks`);
  } catch (taskError: any) {
    console.error('Task creation error:', taskError.message);
    console.error('Full error:', taskError);
    if (taskError.errors) {
      Object.entries(taskError.errors).forEach(([field, error]: any) => {
        console.error(`  ${field}:`, error.message);
      });
    }
  }

  // ── Summary ──────────────────────────────────────────────────────────────────
  const [userCount, projectCount, taskCount] = await Promise.all([
    UserModel.countDocuments(),
    ProjectModel.countDocuments(),
    TaskModel.countDocuments(),
  ]);

  console.log('\n Seed complete!');
  console.log('─────────────────────────────────────────');
  console.log(` Users:    ${userCount}`);
  console.log(` Projects: ${projectCount}`);
  console.log(`Tasks:    ${taskCount}`);
  console.log('─────────────────────────────────────────');
  console.log(' Login credentials:');
  console.log('   Email:    test@example.com');
  console.log('   Password: Test@123');
  console.log('─────────────────────────────────────────\n');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error(' Seed failed:', err);
  mongoose.disconnect();
  process.exit(1);
});
