import Hero from '@/components/Hero';
import Features from '@/components/Features';
import SocialProof from '@/components/SocialProof';
import Benefits from '@/components/Benefits';

/**
 * Home page component
 */
export default function Home() {
  return (
    <>
      <Hero />
      <Features />
      <Benefits />
      <SocialProof />
    </>
  );
}