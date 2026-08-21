import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="w-full bg-white/80 backdrop-blur-md border-t border-gray-200 py-6 mt-8 z-30 relative">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <div className="flex flex-wrap justify-center gap-4 text-xs text-gray-600 font-semibold mb-3">
          <Link href="/privacy" className="hover:text-blue-600 underline">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-blue-600 underline">Terms of Service</Link>
          <Link href="/disclaimer" className="hover:text-blue-600 underline">Disclaimer</Link>
          <Link href="/transparency" className="hover:text-blue-600 underline">Transparency Policy</Link>
        </div>
        <p className="text-[10px] text-gray-500">
          © 2026 BharatAI • Official Platform for Scheme Discovery
          <br />
          Disclaimer: This is an independent portal for government scheme search.
        </p>
      </div>
    </footer>
  );
}
