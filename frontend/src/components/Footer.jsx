import { FaGithub, FaLinkedinIn, FaTwitter } from "react-icons/fa";

const footerColumns = [
  { title: "Product", links: ["Features", "Pricing", "Updates"] },
  { title: "Company", links: ["About", "Careers", "Contact"] },
  { title: "Resources", links: ["Docs", "Help Center", "GitHub"] },
  { title: "Legal", links: ["Privacy", "Terms"] },
];

const Footer = () => (
  <footer className="border-t border-white/20 bg-white/55 dark:border-white/10 dark:bg-slate-950/60">
    <div className="page-shell py-12">
      <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-5">
        <div className="xl:col-span-2">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-fuchsia-500 font-black text-white">
              T
            </div>
            <div>
              <p className="font-display text-xl font-bold">TaskFlow Pro</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Modern project management tool</p>
            </div>
          </div>
          <p className="mt-5 max-w-md text-sm leading-7 text-slate-600 dark:text-slate-300">
            Built for fast product teams who want clarity, calm collaboration, and delivery confidence from kickoff to launch.
          </p>
        </div>

        {footerColumns.map((column) => (
          <div key={column.title}>
            <h3 className="font-display text-lg font-bold">{column.title}</h3>
            <div className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-300">
              {column.links.map((link) => (
                <a key={link} href="#home" className="block transition hover:text-slate-950 dark:hover:text-white">
                  {link}
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 flex flex-col gap-4 border-t border-slate-200/70 pt-6 text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400 sm:flex-row sm:items-center sm:justify-between">
        <p>© 2026 TaskFlow Pro</p>
        <div className="flex items-center gap-3">
          {[FaLinkedinIn, FaGithub, FaTwitter].map((Icon, index) => (
            <a key={index} href="#home" className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 transition hover:-translate-y-0.5 dark:bg-slate-900 dark:text-slate-100">
              <Icon />
            </a>
          ))}
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
