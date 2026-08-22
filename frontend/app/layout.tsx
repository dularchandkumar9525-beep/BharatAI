import "./globals.css";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";

export const metadata = {
  title: "BharatAI - Sarkari Yojana Portal",
  description: "Find government schemes suitable for you.",
  verification: {
    google: "d0k95CvXj2Aly9sIT_g8T2jU-NzvqJMJQVaMri4vgw0",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <WhatsAppButton />
        <Footer />
      </body>
    </html>
  );
}

