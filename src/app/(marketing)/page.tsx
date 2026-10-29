import { Faq } from "@/components/marketing/faq";
import { Hero } from "@/components/marketing/hero";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { Pricing } from "@/components/marketing/pricing";
import { SiteHeader } from "@/components/marketing/site-header";
import { FinalCta, SiteFooter } from "@/components/marketing/site-footer";
import { Trust } from "@/components/marketing/trust";
import { ValuesRule } from "@/components/marketing/values-rule";

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main id="main">
        <Hero />
        <ValuesRule />
        <HowItWorks />
        <Trust />
        <Pricing />
        <Faq />
        <FinalCta />
      </main>
      <SiteFooter />
    </>
  );
}
