import fs from "fs";
import path from "path";
import csv from "csv-parser";
import { prisma } from "@/lib/prisma"; 

const CSV_PATH = "G:/Limitless with shreenath/HajariX/public/AU24 Batch parent email.csv";

async function updateParentEmails() {
  const updates: { usn: string; parentEmail: string }[] = [];

  return new Promise<void>((resolve, reject) => {
    fs.createReadStream(CSV_PATH)
      .pipe(csv())
      .on("data", (row) => {
        const usn = row["usnNumber"]?.trim();
        const parentEmail = row["parentEmail"]?.trim();

        if (usn?.startsWith("AU24") && parentEmail) {
          updates.push({ usn, parentEmail });
        }
      })
      .on("end", async () => {
        console.log(`Found ${updates.length} students to update...`);

        for (const { usn, parentEmail } of updates) {
          try {
            const result = await prisma.student.updateMany({
              where: { usnNumber: usn },
              data: { parentEmail },
            });
            console.log(`✔ Updated ${usn}: ${result.count} record(s)`);
          } catch (error) {
            console.error(`❌ Error updating ${usn}:`, error);
          }
        }

        await prisma.$disconnect();
        console.log("✅ All updates complete.");
        resolve();
      })
      .on("error", (err) => {
        console.error("❌ CSV parsing error:", err);
        reject(err);
      });
  });
}

updateParentEmails().catch((err) => {
  console.error("❌ Script failed:", err);
});
