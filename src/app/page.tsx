import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import StorySection from "./components/StorySection";
import PipelineFlow from "./components/PipelineFlow";
import ThreeBranches from "./components/ThreeBranches";
import CompanyBrain from "./components/CompanyBrain";
import AIDemo from "./components/AIDemo";
import FinalCTA from "./components/FinalCTA";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
      <StorySection />
      <PipelineFlow />
      <ThreeBranches />
      <CompanyBrain />
      <AIDemo />
      <FinalCTA />
      <Footer />
    </main>
  );
}
