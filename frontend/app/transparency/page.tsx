export default function Transparency() {
  return (
    <div className="p-8 max-w-2xl mx-auto font-sans">
      <h1 className="text-2xl font-bold mb-4 text-[#0B2545]">Transparency Policy</h1>
      <p className="text-sm text-gray-700 leading-relaxed mb-4">
        At BharatAI, we are committed to complete transparency in how we collect, process, and display government scheme information.
      </p>
      <ul className="list-disc pl-5 text-sm text-gray-700 space-y-2">
        <li><strong>Data Usage:</strong> We only use official public government APIs and portal data to recommend relevant schemes.</li>
        <li><strong>User Privacy:</strong> We do not sell or share your personal search data with third parties.</li>
        <li><strong>Authentication:</strong> Google Sign-In is used strictly for secure account management and profile saving.</li>
      </ul>
    </div>
  );
}
