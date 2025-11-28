import nodemailer from "nodemailer";
import path from "path";
import {
  createBaseEmailTemplate,
  createParagraph,
  createBoldParagraph,
  createInfoBox,
} from "./email-templates";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER!,
    pass: process.env.EMAIL_PASS!,
  },
  tls: { rejectUnauthorized: false },
});

// Inline logo attachment to prevent broken images in emails
const logoAttachment = {
  filename: "atria-logo.png",
  path: path.join(process.cwd(), "public", "AU Logo_For_Light Background.png"),
  cid: "atria-logo", // Content-ID referenced in email template
};

export interface AbsenceMailPayload {
  studentEmail: string;
  parentEmail?: string;
  studentName: string;
  subjectName: string;
  date: string;
  time: string;
}

export const sendAbsenceNotification = async (opts: AbsenceMailPayload): Promise<boolean> => {
  try {
    await transporter.verify();

    const recipients: string[] = [];
    if (opts.studentEmail) recipients.push(opts.studentEmail);
    if (opts.parentEmail) recipients.push(opts.parentEmail);

    if (recipients.length === 0) {
      throw new Error("No recipient email address provided");
    }

    const { studentName, subjectName, date, time } = opts;

    const content = `
      ${createBoldParagraph(`Dear ${studentName},`)}
      ${createParagraph('This is to notify you that you were marked absent for the following class:')}
      ${createInfoBox({
        items: [
          { label: 'Subject :', value: subjectName },
          { label: 'Date :', value: date },
          { label: 'Time :', value: time },
        ],
      })}
      ${createParagraph('If you believe this record is incorrect, kindly contact your teacher or the administration office.')}
    `;

    const html = createBaseEmailTemplate({
      title: 'Attendance Update',
      content,
      preheader: `You were marked absent for ${subjectName}`,
    });

    const info = await transporter.sendMail({
      from: `"AU Tech" <${process.env.EMAIL_USER}>`,
      to: recipients.join(","),
      subject: "Absence Notification",
      html,
      attachments: [logoAttachment], // Embed logo to prevent broken images
    });

    console.log("Absence notification email sent:", info.messageId);
    return true;
  } catch (err: any) {
    console.error("Error sending absence notification email:", err);
    return false;
  }
};



export const sendStudentRegistrationConfirmation = async (
  email: string,
  name: string,
  password: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    await transporter.verify();

    const content = `
      ${createBoldParagraph(`Dear ${name},`)}
      ${createParagraph('Your student account has been successfully created.')}
      ${createParagraph('You can log in for the first time using the credentials below:')}
      ${createInfoBox({
        items: [
          { label: 'Email:', value: email },
          { label: 'Password:', value: password },
        ],
      })}
      ${createParagraph('Please update your password after your initial login for security purposes.')}
    `;

    const html = createBaseEmailTemplate({
      title: 'Welcome Aboard',
      content,
      preheader: 'Your student account has been created',
    });

    const mailOptions = {
      from: `"AU Tech" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Welcome to Atria University's Attendance Portal",
      html,
      attachments: [logoAttachment], // Embed logo to prevent broken images
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Registration confirmation email sent:", info.messageId);
    return { success: true };
  } catch (error: any) {
    console.error("Error sending student registration email:", error);
    return { success: false, error: error.message };
  }
};
