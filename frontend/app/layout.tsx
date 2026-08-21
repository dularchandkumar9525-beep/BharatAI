import "./globals.css";
import Footer from "@/components/Footer";

export const metadata = {
  title: "BharatAI - Sarkari Yojana Portal",
  description: "Find government schemes suitable for you.",
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
        <Footer />
      </body>
    </html>
  );
}
