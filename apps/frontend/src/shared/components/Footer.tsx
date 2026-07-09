export function Footer() {
  return (
    <footer className="bg-[#3D4732] text-white/80 border-t border-[#3D4732]/20">
      <div className="container mx-auto max-w-6xl py-6 px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
        <p>© {new Date().getFullYear()} ThriveBook Telehealth. All rights reserved.</p>
        <div className="flex gap-4">
          <span className="hover:text-white hover:underline transition-colors cursor-pointer">Privacy Policy</span>
          <span className="hover:text-white hover:underline transition-colors cursor-pointer">Terms of Service</span>
        </div>
      </div>
    </footer>
  );
}
