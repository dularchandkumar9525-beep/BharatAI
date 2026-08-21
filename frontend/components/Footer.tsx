import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="w-full bg-white border-t border-gray-100 py-8 mt-12">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <div className="flex justify-center gap-6 text-xs text-gray-500 font-medium mb-4">
          <Link href="/privacy" className="hover:text-blue-600 underline">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-blue-600 underline">Terms of Service</Link>
          <Link href="/disclaimer" className="hover:text-blue-600 underline">Disclaimer</Link>
        </div>
        <p className="text-[10px] text-gray-400">
          © 2026 BharatAI. All rights reserved. 
          <br />
          Disclaimer: This is not an official government website.
        </p>
      </div>
    </footer>
  );
}
