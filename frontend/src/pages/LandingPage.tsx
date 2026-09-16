import { Cta69 } from "@/components/ui/cta69";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";

export default function LandingPage() {
  return (
    <main className="relative flex min-h-svh flex-col bg-background">
      <SiteHeader />
      <Cta69
        className="flex min-h-[calc(100svh-4rem)] flex-1 items-center"
        badge={{ label: "CreditIQ" }}
        heading="Know your credit risk before you apply."
        buttons={[
          { label: "Check your score", href: "/borrower?new=1", variant: "primary" },
          { label: "Review portfolio", href: "/login", variant: "inverse" },
        ]}
        labels={{
          marqueePhrase: "Credit insight",
          note: "Borrower score is a FICO-style estimate from your answers. Lender view is a separate default-risk model — not the same number.",
          footnote: "Hackathon demo · No real credit data stored · Slash commands: /faq /why /improve",
        }}
      />
      <SiteFooter />
    </main>
  );
}
