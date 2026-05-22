import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';

const connectionString = process.env.DATABASE_URL!;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding database...');

  // Clean up existing data in reverse dependency order
  await prisma.task.deleteMany();
  await prisma.projectMember.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();

  // Create users
  const passwordHash = await bcrypt.hash('Demo@123', 10);

  const admin = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@demo.com',
      passwordHash,
      role: 'ADMIN',
    },
  });

  const member1 = await prisma.user.create({
    data: {
      name: 'John Member',
      email: 'member@demo.com',
      passwordHash,
      role: 'MEMBER',
    },
  });

  const member2 = await prisma.user.create({
    data: {
      name: 'Jane Member',
      email: 'member2@demo.com',
      passwordHash,
      role: 'MEMBER',
    },
  });

  console.log('✅ Users created');

  // Create Project 1: Website Redesign (all 3 members)
  const project1 = await prisma.project.create({
    data: {
      name: 'Website Redesign',
      description: 'Complete redesign of the company website with modern UI/UX',
      createdById: admin.id,
      members: {
        create: [
          { userId: admin.id },
          { userId: member1.id },
          { userId: member2.id },
        ],
      },
    },
  });

  // Create Project 2: Mobile App Launch (admin + member1)
  const project2 = await prisma.project.create({
    data: {
      name: 'Mobile App Launch',
      description: 'Launch the new mobile application for iOS and Android',
      createdById: admin.id,
      members: {
        create: [
          { userId: admin.id },
          { userId: member1.id },
        ],
      },
    },
  });

  console.log('✅ Projects created');

  // Create tasks for Project 1 (5 tasks)
  const now = new Date();

  await prisma.task.createMany({
    data: [
      {
        title: 'Design homepage mockup',
        description: 'Create wireframes and high-fidelity mockups for the new homepage',
        status: 'DONE',
        priority: 'HIGH',
        dueDate: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), // 7 days ago (past, but DONE)
        projectId: project1.id,
        assignedToId: member1.id,
        createdById: admin.id,
      },
      {
        title: 'Implement responsive navigation',
        description: 'Build a mobile-first responsive navigation component',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        dueDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days ago (OVERDUE)
        projectId: project1.id,
        assignedToId: member1.id,
        createdById: admin.id,
      },
      {
        title: 'Set up CI/CD pipeline',
        description: 'Configure GitHub Actions for automated testing and deployment',
        status: 'TODO',
        priority: 'MEDIUM',
        dueDate: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        projectId: project1.id,
        assignedToId: member2.id,
        createdById: admin.id,
      },
      {
        title: 'Write unit tests for components',
        description: 'Achieve 80% code coverage on all React components',
        status: 'TODO',
        priority: 'LOW',
        dueDate: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000), // 1 day ago (OVERDUE)
        projectId: project1.id,
        assignedToId: member2.id,
        createdById: admin.id,
      },
      {
        title: 'Optimize images and assets',
        description: 'Compress all images and implement lazy loading',
        status: 'IN_PROGRESS',
        priority: 'MEDIUM',
        dueDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        projectId: project1.id,
        assignedToId: member1.id,
        createdById: admin.id,
      },
    ],
  });

  // Create tasks for Project 2 (4 tasks)
  await prisma.task.createMany({
    data: [
      {
        title: 'Set up React Native project',
        description: 'Initialize the React Native project with TypeScript template',
        status: 'DONE',
        priority: 'HIGH',
        dueDate: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000), // 10 days ago (past, but DONE)
        projectId: project2.id,
        assignedToId: member1.id,
        createdById: admin.id,
      },
      {
        title: 'Implement authentication flow',
        description: 'Build login, signup, and forgot password screens',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        dueDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        projectId: project2.id,
        assignedToId: member1.id,
        createdById: admin.id,
      },
      {
        title: 'Design app icon and splash screen',
        description: 'Create app icon in all required sizes and animated splash screen',
        status: 'TODO',
        priority: 'MEDIUM',
        dueDate: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
        projectId: project2.id,
        assignedToId: admin.id,
        createdById: admin.id,
      },
      {
        title: 'Submit to App Store and Play Store',
        description: 'Prepare store listings, screenshots, and submit for review',
        status: 'TODO',
        priority: 'LOW',
        dueDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        projectId: project2.id,
        assignedToId: member1.id,
        createdById: admin.id,
      },
    ],
  });

  console.log('✅ Tasks created');
  console.log('🎉 Seeding complete!');
  console.log('');
  console.log('Demo accounts:');
  console.log('  Admin: admin@demo.com / Demo@123');
  console.log('  Member: member@demo.com / Demo@123');
  console.log('  Member: member2@demo.com / Demo@123');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
