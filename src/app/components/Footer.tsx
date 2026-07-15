import Logo from "./Logo";

const COLUMNS = [
  { title: "Product", links: ["Features", "Pricing", "Integrations", "Changelog", "Roadmap"] },
  { title: "Company", links: ["About", "Blog", "Careers", "Contact", "Press"] },
  { title: "Resources", links: ["Documentation", "Guides", "API Reference", "Status", "Support"] },
  { title: "Legal", links: ["Privacy Policy", "Terms of Service", "Security", "GDPR"] },
];

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16 lg:py-20">
        <div className="grid lg:grid-cols-12 gap-12">
          {/* Brand */}
          <div className="lg:col-span-4">
            <Logo size="md" variant="inline" />
            <p className="mt-5 text-[14px] leading-relaxed text-gray-500 max-w-xs">
              The operating system for company knowledge. One meeting becomes permanent memory.
            </p>
            <div className="flex items-center gap-4 mt-6">
              <a href="#" className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-blue-100 flex items-center justify-center transition-colors">
                <span className="text-[14px] text-gray-500 hover:text-blue-600 font-semibold">𝕏</span>
              </a>
              <a href="#" className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-blue-100 flex items-center justify-center transition-colors">
                <span className="text-[14px] text-gray-500 hover:text-blue-600 font-semibold">in</span>
              </a>
              <a href="#" className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-blue-100 flex items-center justify-center transition-colors">
                <span className="text-[14px] text-gray-500 hover:text-blue-600 font-semibold">GH</span>
              </a>
            </div>
          </div>

          {/* Links */}
          <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-4 gap-8">
            {COLUMNS.map((col) => (
              <div key={col.title}>
                <h4 className="text-[13px] font-semibold text-gray-900 mb-4">{col.title}</h4>
                <ul className="space-y-3">
                  {col.links.map((link) => (
                    <li key={link}>
                      <a href="#" className="text-[14px] text-gray-500 hover:text-gray-900 transition-colors duration-200">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-16 pt-8 border-t border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="text-[13px] text-gray-400">
            © {new Date().getFullYear()} MeetingOS. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-[13px] text-gray-400">
            <a href="#" className="hover:text-gray-600 transition-colors">Privacy</a>
            <a href="#" className="hover:text-gray-600 transition-colors">Terms</a>
            <a href="#" className="hover:text-gray-600 transition-colors">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
