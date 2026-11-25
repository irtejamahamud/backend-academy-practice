import { BlockFooter } from '@/components/landing/block-footer';
import { CurriculumMenu } from '@/components/landing/curriculum-menu';
import { FaqTiles } from '@/components/landing/faq-tiles';
import { Hero } from '@/components/landing/hero';
import { LessonShowcase } from '@/components/landing/lesson-showcase';
import { ModuleJourney } from '@/components/landing/module-journey';
import { PaceCalculator } from '@/components/landing/pace-calculator';
import { PracticeBoard } from '@/components/landing/practice-board';
import { ProjectsGrid } from '@/components/landing/projects-grid';
import { RevealObserver } from '@/components/landing/reveal-observer';
import { SignupOpen } from '@/components/landing/signup-open';
import { getCurrentUser } from '@/lib/auth/session';

export default async function LandingPage() {
  const user = await getCurrentUser();
  return (
    <>
      <RevealObserver />
      <main id="main">
        <Hero signedIn={user !== null} />
        <CurriculumMenu />
        <LessonShowcase />
        <PracticeBoard />
        <ModuleJourney />
        <ProjectsGrid />
        <PaceCalculator />
        <FaqTiles />
        <SignupOpen />
      </main>
      <BlockFooter />
    </>
  );
}
