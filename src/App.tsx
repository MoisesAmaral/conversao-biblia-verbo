import { CTA } from "./components/CTA";
import { Comparison } from "./components/Comparison";
import { FAQ } from "./components/FAQ";
import { Features } from "./components/Features";
import { Footer } from "./components/Footer";
import { Hero } from "./components/Hero";
import { Navbar } from "./components/Navbar";
import { Personalization } from "./components/Personalization";
import { Pricing } from "./components/Pricing";
import { Showcase } from "./components/Showcase";
import { UseCases } from "./components/UseCases";
import { Workflow } from "./components/Workflow";

export default function App() {
  return (
    <div className="min-h-screen bg-light-bg text-light-text-primary">
      <Navbar />
      <main>
        <Hero />
        <Features />
        <Workflow />
        <Personalization />
        <Showcase />
        <UseCases />
        <Comparison />
        <Pricing />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
