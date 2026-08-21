export default function WhatsAppButton() {
  const phoneNumber = "917015948447"; // Yahan apna WhatsApp number daalein (Country code 91 ke saath)
  const message = encodeURIComponent("Namaste! Mujhe Sarkari Yojana ka form bharlane mein help chahiye.");

  return (
    <a
      href={`https://wa.me/${phoneNumber}?text=${message}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 bg-green-500 hover:bg-green-600 text-white font-bold p-4 rounded-full shadow-2xl flex items-center gap-2 z-50 transition-all hover:scale-105"
    >
      <span className="text-xl">💬</span>
      <span className="hidden md:inline text-sm">Form Bharwane Mein Help Lene Ke Liye WhatsApp Karein</span>
    </a>
  );
}
