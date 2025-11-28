// import dotenv from 'dotenv';
// dotenv.config(); 

// import { users } from '@clerk/clerk-sdk-node';
// import { PrismaClient } from '@prisma/client';

// const prisma = new PrismaClient();

// async function deleteOrphanClerkUsers() {
//   try {
//     let offset = 0;
//     const limit = 100;
//     let totalDeleted = 0;

//     while (true) {
//       const clerkUsers = await users.getUserList({ limit, offset });
//       if (clerkUsers.length === 0) break;

//       const userClerkIds = await prisma.user.findMany({ select: { clerkId: true } });
//       const studentClerkIds = await prisma.student.findMany({ select: { clerkId: true } });

//       const dbClerkIds = new Set([
//         ...userClerkIds.map(u => u.clerkId),
//         ...studentClerkIds.map(s => s.clerkId),
//       ].filter(Boolean));

//       for (const user of clerkUsers) {
//         if (!dbClerkIds.has(user.id)) {
//           console.log(`Deleting orphan Clerk user: ${user.id}`);
//           await users.deleteUser(user.id);
//           totalDeleted++;
//         }
//       }

//       offset += limit;
//     }

//     console.log(`✅ Deleted ${totalDeleted} orphan Clerk users.`);
//   } catch (err) {
//     console.error('❌ Error deleting orphan users:', err);
//   } finally {
//     await prisma.$disconnect();
//   }
// }

// deleteOrphanClerkUsers();
