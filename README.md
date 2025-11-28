# 📘 HajariX

**HajariX** is a full-stack, role-based attendance management system built for Atria University. Designed for scalability and ease of use, it enables administrators, teachers, and students to manage, track, and visualize attendance data in real time — all from a unified platform.

🌐 **Live Demo**: [https://apps.atriauniversity.in](https://apps.atriauniversity.in)

---

## Features

- 🔐 **Role-Based Dashboards** – Admins, Teachers, and Students each get tailored access and controls.
- 📅 **Real-Time Attendance** – Session-wise tracking with lock/unlock states.
- 📨 **Email Alerts** – Automatic email notifications for absences and exceptions.
- 📤 **CSV Import & Export** – Easily manage student data and generate attendance reports.
- 📝 **Exception Handling** – Students can submit leave requests with file uploads; admins review them.
- 📊 **Insights Dashboard** – Visualize patterns across subjects, batches, and students using charts.
- 🧩 **Flexible Mapping** – Manage subjects, batches, and teacher assignments with many-to-many support.
- 🌐 **Responsive UI** – Mobile-friendly and accessible from any device.

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, ShadCN UI, Lucide Icons
- **Auth**: Clerk
- **Database**: PostgreSQL + Prisma ORM
- **Forms**: React Hook Form + Zod
- **State Management**: React Query
- **Email**: Nodemailer
- **CSV**: PapaParse, json2csv
- **Visualization**: Recharts
- **Animations**: Framer Motion
- **Utilities**: Axios, UUID, Date-fns, clsx, dotenv

---

## ⚙️ Environment Variables

Create a `.env.local` file in the root directory with the following:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/haazrax

# Clerk Authentication
CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key

# Email Configuration
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_password
```

> 🔐 **Never commit `.env.local` to version control.**

---

## 🧪 Getting Started

### Prerequisites

- Node.js v18+
- PostgreSQL
- Yarn or npm

### Installation

```bash
git clone https://github.com/yourusername/hajarix.git
cd hajarix

# Install dependencies
yarn install
# or
npm install

# Initialize DB
npx prisma migrate dev --name init
npx prisma generate

# Run the app
yarn dev
# or
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to view the app locally.

---

## 🧾 Database Schema Highlights

This app uses Prisma to define its PostgreSQL schema.

Key models:

- `User` – Teachers & Admins
- `Student` – Student profiles
- `Batch` – Group of students
- `Subject` – Courses with lifecycle dates
- `Attendance` – Daily/session-level tracking
- `AttendanceException` – Student leave requests
- `AbsenceNotification` – Triggers and emails for low attendance
- Relationship tables: `StudentBatch`, `SubjectBatch`, `SubjectTeacher`

---

## 📊 Data Visualization

The dashboard provides:

- Bar and line charts (by student, batch, subject)
- Heatmaps for attendance frequency
- Summary stats on attendance, alerts, and exceptions

Built using **Recharts** and **Framer Motion** for smooth interactivity.

---

## 📧 Email Notifications

Automated emails are sent for:

- 📩 Absence alerts
- 📂 Batch/subject assignments
- 📄 Exception request approvals or rejections

Configured with **Nodemailer**. Credentials stored securely in `.env.local`.

---

## 📦 CSV Tools

- ✅ Import students from CSV using **PapaParse**
- 📤 Export filtered attendance data using **json2csv**

---

## 📈 Deployment

### Build

```bash
yarn build
# or
npm run build
```

### Start (Production)

```bash
yarn start
# or
npm start
```

Deployed via [Vercel](https://vercel.com/) or your platform of choice.

---

## 🧪 Testing

Testing support coming soon.

---

## 📅 Roadmap

- [ ] Add test coverage (unit + E2E)
- [ ] Enable bulk subject import
- [ ] Add dark mode toggle
- [ ] Role-based permissions editor (Admin UI)

---

## 🙌 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/YourFeature`)
3. Commit your changes (`git commit -m 'Add YourFeature'`)
4. Push to the branch (`git push origin feature/YourFeature`)
5. Open a pull request

---

## 📬 Contact

Questions, ideas, or feedback?

📧 [shreenath@xcelerator.co.in](mailto:shreenath@xcelerator.co.in)

