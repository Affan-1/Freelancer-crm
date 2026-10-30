import { Link } from "react-router-dom";

const features = [
  {
    icon: "👥",
    title: "Client Management",
    desc: "Apne saare clients ka data, contacts aur history ek hi jagah rakho.",
  },
  {
    icon: "📁",
    title: "Project Tracking",
    desc: "Projects ka status, deadlines aur progress asaani se track karo.",
  },
  {
    icon: "🧾",
    title: "Invoices",
    desc: "Professional invoices banao aur payments ka hisaab saaf rakho.",
  },
  {
    icon: "📅",
    title: "Calendar & Events",
    desc: "Meetings aur deadlines calendar mein dekho, koi kaam miss na ho.",
  },
  {
    icon: "🤝",
    title: "Team Collaboration",
    desc: "Team members ko email se invite karo aur roles assign karo.",
  },
  {
    icon: "📊",
    title: "Dashboard & Insights",
    desc: "Ek nazar mein apna poora business, earnings aur kaam dekho.",
  },
];

const steps = [
  { no: "1", title: "Account banao", desc: "Free mein register karo, sirf 1 minute lagta hai." },
  { no: "2", title: "Clients & projects add karo", desc: "Apna kaam aur clients system mein daalo." },
  { no: "3", title: "Business grow karo", desc: "Invoices bhejo, team ke saath kaam karo aur progress dekho." },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-gray-800 dark:bg-gray-950 dark:text-gray-100">
      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/80 backdrop-blur dark:border-gray-800 dark:bg-gray-950/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link to="/" className="text-2xl font-extrabold text-indigo-600">
            FreeCRM
          </Link>
          <nav className="hidden items-center gap-8 text-sm font-medium md:flex">
            <a href="#features" className="hover:text-indigo-600">Features</a>
            <a href="#how" className="hover:text-indigo-600">How it works</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="rounded-lg px-4 py-2 text-sm font-semibold text-indigo-600 hover:bg-indigo-50 dark:hover:bg-gray-800"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-indigo-700"
            >
              Register
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-indigo-50 via-white to-white dark:from-gray-900 dark:via-gray-950 dark:to-gray-950" />
        <div className="mx-auto max-w-6xl px-4 py-20 text-center md:py-28">
          <span className="inline-block rounded-full bg-indigo-100 px-4 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
            Freelancers ke liye banaya gaya CRM
          </span>
          <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-extrabold leading-tight md:text-6xl">
            Apna freelance business{" "}
            <span className="text-indigo-600">asaani se manage</span> karo
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600 dark:text-gray-400">
            Clients, projects, invoices aur team, sab kuch ek hi jagah. Kam time
            organize karne mein lagao, zyada time kaam aur kamai par.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              to="/register"
              className="w-full rounded-xl bg-indigo-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg hover:bg-indigo-700 sm:w-auto"
            >
              Get Started Free
            </Link>
            <Link
              to="/login"
              className="w-full rounded-xl border border-gray-300 px-8 py-3.5 text-base font-semibold hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800 sm:w-auto"
            >
              Login
            </Link>
          </div>

          {/* Stats */}
          <div className="mx-auto mt-16 grid max-w-3xl grid-cols-3 gap-4">
            {[
              ["6+", "Powerful modules"],
              ["100%", "Free to start"],
              ["24/7", "Access anywhere"],
            ].map(([num, label]) => (
              <div key={label} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <p className="text-2xl font-bold text-indigo-600 md:text-3xl">{num}</p>
                <p className="mt-1 text-xs text-gray-500 md:text-sm">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-6xl px-4 py-20">
        <div className="text-center">
          <h2 className="text-3xl font-bold md:text-4xl">Sab kuch jo aapko chahiye</h2>
          <p className="mt-3 text-gray-600 dark:text-gray-400">
            Ek platform, poora freelance workflow.
          </p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:border-gray-800 dark:bg-gray-900"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 text-2xl dark:bg-indigo-900/40">
                {f.icon}
              </div>
              <h3 className="mt-4 text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="bg-gray-50 py-20 dark:bg-gray-900">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center">
            <h2 className="text-3xl font-bold md:text-4xl">Kaise kaam karta hai</h2>
            <p className="mt-3 text-gray-600 dark:text-gray-400">Sirf 3 asaan steps mein shuru karo.</p>
          </div>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {steps.map((s) => (
              <div key={s.no} className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600 text-xl font-bold text-white">
                  {s.no}
                </div>
                <h3 className="mt-4 text-lg font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <div className="rounded-3xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-14 text-center text-white">
          <h2 className="text-3xl font-bold md:text-4xl">Aaj hi shuru karo</h2>
          <p className="mx-auto mt-3 max-w-xl text-indigo-100">
            Apna account banao aur apne freelance business ko organize karna shuru karo.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              to="/register"
              className="w-full rounded-xl bg-white px-8 py-3 font-semibold text-indigo-600 hover:bg-indigo-50 sm:w-auto"
            >
              Create Free Account
            </Link>
            <Link
              to="/login"
              className="w-full rounded-xl border border-white/60 px-8 py-3 font-semibold text-white hover:bg-white/10 sm:w-auto"
            >
              Login
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 text-center text-sm text-gray-500 dark:border-gray-800">
        © {new Date().getFullYear()} FreeCRM. Sab huqooq mehfooz hain.
      </footer>
    </div>
  );
}