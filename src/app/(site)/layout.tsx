import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ScrollEffects } from "@/components/layout/scroll-effects";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main id="main" className="relative min-h-screen">
        {children}
      </main>
      <Footer />
      <ScrollEffects />
    </>
  );
}
