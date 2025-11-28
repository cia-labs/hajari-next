import 'dotenv/config';
import { MongoClient, ObjectId } from 'mongodb';
import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();
const mongo = new MongoClient(process.env.MONGO_URI!);

type IdMap = Map<string /* old _id */, string /* new uuid */>;

async function main() {
  await mongo.connect();
  const db = mongo.db();                     


  const userMap: IdMap = new Map();
  const users = await db.collection('users').find().toArray();

  for (const u of users) {
    const newId = randomUUID();
    userMap.set(u._id.toString(), newId);

    await prisma.user.create({
      data: {
        id: newId,
        name: u.name,
        email: u.email,
        password: u.password ?? null,
        employeeId: u.employeeId ?? null,
        clerkId: u.clerkId,
        role: u.role,
        createdAt: u.createdAt,
        updatedAt: u.updatedAt,
      },
    });
  }
  console.log(`Inserted ${users.length} users`);

  const batchMap: IdMap = new Map();
  const batches = await db.collection('batches').find().toArray();

  for (const b of batches) {
    const newId = randomUUID();
    batchMap.set(b._id.toString(), newId);

    await prisma.batch.create({
      data: {
        id: newId,
        name: b.name,
        isDisabled: b.isDisabled ?? false,
        createdAt: b.createdAt,
        updatedAt: b.updatedAt,
      },
    });
  }
  console.log(`Inserted ${batches.length} batches`);


  const subjectMap: IdMap = new Map();
  const subjects = await db.collection('subjects').find().toArray();

  for (const s of subjects) {
    const newId = randomUUID();
    subjectMap.set(s._id.toString(), newId);

    await prisma.subject.create({
      data: {
        id: newId,
        name: s.name,
        createdAt: s.createdAt,
        updatedAt: s.updatedAt,
      },
    });


    for (const batchOid of s.batch ?? []) {
      const batchId = batchMap.get(batchOid.toString());
      if (batchId) {
        await prisma.subjectBatch.upsert({
          where: {
            subjectId_batchId: {
              subjectId: newId,
              batchId,
            },
          },
          update: {},
          create: { subjectId: newId, batchId },
        });
      }
    }
  }
  console.log(`Inserted ${subjects.length} subjects + subjectBatch links`);


  const studentMap: IdMap = new Map();
  const students = await db.collection('students').find().toArray();

  for (const s of students) {
    const newId = randomUUID();
    studentMap.set(s._id.toString(), newId);

    await prisma.student.create({
      data: {
        id: newId,
        name: s.name,
        usnNumber: s.usnNumber,
        email: s.email,
        password: s.password ?? null,
        clerkId: s.clerkId ?? null,
        active: s.active ?? true,
        role: s.role ?? 'student',
        createdAt: s.createdAt,
        updatedAt: s.updatedAt,
      },
    });


    for (const batchOid of s.batch ?? []) {
      const batchId = batchMap.get(batchOid.toString());
      if (batchId) {
        await prisma.studentBatch.upsert({
          where: {
            studentId_batchId: { studentId: newId, batchId },
          },
          update: {},
          create: { studentId: newId, batchId },
        });
      }
    }
  }
  console.log(`Inserted ${students.length} students + studentBatch links`);


  const attendances = await db.collection('attendances').find().toArray();

  for (const a of attendances) {
    await prisma.attendance.create({
      data: {
        date: a.date,
        time: a.time,
        attendanceStatus: a.attendanceStatus,
        createdAt: a.createdAt,
        updatedAt: a.updatedAt,
        teacherId:   a.teacher   ? userMap.get(a.teacher.toString())   : null,
        studentId:   a.student   ? studentMap.get(a.student.toString()) : null,
        subjectId:   a.subject   ? subjectMap.get(a.subject.toString()) : null,
        batchId:     a.batch     ? batchMap.get(a.batch.toString())     : null,
      },
    });
  }
  console.log(`Inserted ${attendances.length} attendances`);


  const notes = await db.collection('absencenotifications').find().toArray();

  for (const n of notes) {
    const studentId = studentMap.get(n.student.toString());
    if (!studentId) continue;

    await prisma.absenceNotification.create({
      data: {
        consecutiveDays:   n.consecutiveDays ?? 0,
        lastAbsenceDate:   n.lastAbsenceDate ?? null,
        notificationLevel: n.notificationLevel ?? 0,
        notified:          n.notified ?? false,
        studentId,
        createdAt: n.createdAt,
        updatedAt: n.updatedAt,
      },
    });
  }
  console.log(`Inserted ${notes.length} absence notifications`);

  console.log('✅  Data migration complete!');
}

main()
  .catch((e) => {
    console.error('❌  Migration failed', e);
  })
  .finally(async () => {
    await mongo.close();
    await prisma.$disconnect();
  });
