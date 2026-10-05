const projectModules = [
  {
    title: "Patient Web App (Frontend)",
    description:
      "Public site for patients to discover doctors, hospitals, and clinics, book appointments, and manage profiles.",
    points: [
      "Browse doctors by specialty and availability",
      "Browse hospitals and clinics with complete details",
      "Book, view, and manage appointments",
      "Read health blogs from verified providers",
    ],
  },
  {
    title: "Admin Console (Admin)",
    description:
      "Operations dashboard for managing hospitals, clinics, doctors, rooms, and content.",
    points: [
      "Approve and manage doctors, hospitals, and clinics",
      "Manage room categories and availability",
      "Publish and moderate blogs",
      "Track analytics and revenue",
    ],
  },
  {
    title: "API Server (Backend)",
    description:
      "Node/Express API that powers data, security, and business logic.",
    points: [
      "JWT-based authentication for roles",
      "Appointment completion and bed allocation flows",
      "Cloudinary image uploads via Multer",
      "MongoDB models for users, doctors, hospitals, clinics, and blogs",
    ],
  },
];

const roleCards = [
  {
    title: "Patient",
    summary:
      "Search providers, book appointments, and manage health records.",
  },
  {
    title: "Doctor",
    summary: "Manage availability, appointments, and publish blogs.",
  },
  {
    title: "Hospital/Clinic",
    summary:
      "Maintain profiles, manage rooms and beds, and track analytics.",
  },
  {
    title: "Admin",
    summary: "Oversees all entities, approvals, and reporting.",
  },
];

const keyFlows = [
  {
    title: "Discovery to Booking",
    details:
      "Patients search doctors, hospitals, and clinics, check availability, and confirm appointments.",
  },
  {
    title: "Appointment Lifecycle",
    details:
      "Upcoming, completed, and cancelled states are tracked with role-specific views.",
  },
  {
    title: "Content and Awareness",
    details:
      "Verified providers create blogs that are published for patients.",
  },
  {
    title: "Capacity Management",
    details:
      "Hospitals and clinics manage rooms and beds, with allocation handled in the backend.",
  },
];

const techStack = [
  "React + Vite + Tailwind CSS",
  "Node.js + Express API",
  "MongoDB + Mongoose models",
  "JWT auth with role-based middleware",
  "Cloudinary media storage",
];

const adminLink = process.env.NEXT_PUBLIC_ADMIN_PAGE_LINK;
const demoAdminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
const demoAdminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;
const demoUserEmail = process.env.NEXT_PUBLIC_USER_EMAIL;
const demoUserPassword = process.env.NEXT_PUBLIC_USER_PASSWORD;

const DemoContent = () => {
  return (
    <div className="pb-16">
      <section className="bg-gradient-to-br from-teal-50 via-white to-cyan-50 rounded-3xl p-8 md:p-12">
        <p className="text-sm uppercase tracking-wide text-teal-600 font-medium">
          Project Demo
        </p>
        <h1 className="text-3xl md:text-4xl font-semibold text-text-primary mt-2">
          Healhub: Hospital & Clinic Management Platform
        </h1>
        <p className="text-text-secondary mt-4 max-w-3xl leading-relaxed">
          This demo page walks through the full scope of Healhub, covering the
          patient-facing website, the admin console, and the backend services
          that manage hospitals, clinics, and healthcare services securely,
          scalably, and reliably.
        </p>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-semibold text-text-primary">
          Platform Overview
        </h2>
        <div className="grid gap-6 md:grid-cols-3 mt-6">
          {projectModules.map((module) => (
            <div
              key={module.title}
              className="border border-border rounded-2xl p-6 bg-background-card shadow-sm"
            >
              <h3 className="text-lg font-semibold text-text-primary">
                {module.title}
              </h3>
              <p className="text-sm text-text-secondary mt-2">
                {module.description}
              </p>
              <ul className="mt-4 text-sm text-text-primary space-y-2 list-disc list-inside">
                {module.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h2 className="text-2xl font-semibold text-text-primary">User Roles</h2>
          <p className="text-sm text-text-secondary">
            Each role gets a tailored experience and permissions.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-4 mt-6">
          {roleCards.map((role) => (
            <div
              key={role.title}
              className="rounded-xl border border-border p-5 bg-background-muted"
            >
              <h3 className="text-base font-semibold text-text-primary">
                {role.title}
              </h3>
              <p className="text-sm text-text-secondary mt-2">{role.summary}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-semibold text-text-primary">Key Flows</h2>
        <div className="grid gap-6 md:grid-cols-2 mt-6">
          {keyFlows.map((flow) => (
            <div
              key={flow.title}
              className="border border-border rounded-2xl p-6 bg-background-card"
            >
              <h3 className="text-lg font-semibold text-text-primary">
                {flow.title}
              </h3>
              <p className="text-sm text-text-secondary mt-2 leading-relaxed">
                {flow.details}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-semibold text-text-primary">Tech Stack</h2>
        <div className="mt-4 bg-background-card border border-border rounded-2xl p-6">
          <ul className="grid gap-3 md:grid-cols-2 text-sm text-text-primary list-disc list-inside">
            {techStack.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-semibold text-text-primary">Demo Access</h2>
        <div className="grid gap-6 md:grid-cols-2 mt-6">
          <div className="border border-border rounded-2xl p-6 bg-background-card shadow-sm">
            <h3 className="text-lg font-semibold text-text-primary">
              Patient App Login
            </h3>
            <p className="text-sm text-text-secondary mt-2">
              Use these credentials on the patient web app login page.
            </p>
            <div className="mt-4 text-sm text-text-primary space-y-1">
              <p>
                <span className="font-medium text-text-primary">Email:</span>{" "}
                <span className="font-mono">{demoUserEmail}</span>
              </p>
              <p>
                <span className="font-medium text-text-primary">Password:</span>{" "}
                <span className="font-mono">{demoUserPassword}</span>
              </p>
            </div>
          </div>

          <div className="border border-border rounded-2xl p-6 bg-background-card shadow-sm">
            <h3 className="text-lg font-semibold text-text-primary">
              Admin Console Login
            </h3>
            <p className="text-sm text-text-secondary mt-2">
              Open the admin console and sign in with the demo admin account.
            </p>
            <div className="mt-4 text-sm text-text-primary space-y-1">
              <p>
                <span className="font-medium text-text-primary">Email:</span>{" "}
                <span className="font-mono">{demoAdminEmail}</span>
              </p>
              <p>
                <span className="font-medium text-text-primary">Password:</span>{" "}
                <span className="font-mono">{demoAdminPassword}</span>
              </p>
            </div>
            <div className="mt-4">
              {adminLink ? (
                <a
                  href={adminLink}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center rounded-full bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 transition-colors"
                >
                  Open Admin Console
                </a>
              ) : (
                <span className="text-sm text-text-secondary">
                  Admin console link not configured.
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-semibold text-text-primary">
          Getting Around the Demo
        </h2>
        <div className="mt-4 bg-teal-50 border border-teal-100 rounded-2xl p-6">
          <ol className="list-decimal list-inside text-sm text-teal-900 space-y-2">
            <li>
              Start on the Home page to explore specialties and featured
              content.
            </li>
            <li>
              Visit Doctors, Hospitals, or Clinics to browse and open detailed
              profiles.
            </li>
            <li>Use Blog to read posts created by providers.</li>
            <li>
              Log in to view profile and appointments or try admin features.
            </li>
          </ol>
        </div>
      </section>
    </div>
  );
};

export default DemoContent;
