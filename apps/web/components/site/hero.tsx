import { ArrowRight, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { Hero as HeroContent, Profile, SocialLink } from "@/lib/types";
import { SocialLinks } from "./social-links";

export function Hero({
  hero,
  profile,
  socials,
}: {
  hero: HeroContent;
  profile: Profile;
  socials: SocialLink[];
}) {
  return (
    <section
      aria-labelledby="hero-heading"
      className="grid items-center gap-12 pt-12 pb-16 sm:pt-20 lg:grid-cols-[1fr_auto] lg:gap-16 lg:pt-24"
    >
      <div className="order-2 lg:order-1">
        <p className="text-brand font-mono text-xs font-medium tracking-wider uppercase">{hero.eyebrow}</p>
        <h1
          id="hero-heading"
          className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl"
        >
          {hero.heading}
        </h1>
        <p className="text-muted-foreground mt-6 max-w-2xl text-lg leading-relaxed text-pretty">
          {hero.subheading}
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          {hero.ctas.map((cta) => (
            <Button
              key={cta.href}
              asChild
              size="lg"
              variant={cta.variant === "primary" ? "default" : "outline"}
              className="group"
            >
              <Link href={cta.href}>
                {cta.label}
                {cta.variant === "primary" && (
                  <ArrowRight className="transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                )}
              </Link>
            </Button>
          ))}
        </div>

        <div className="text-muted-foreground mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="size-4" aria-hidden="true" />
            {profile.location}
          </span>
          <SocialLinks links={socials} className="-ml-2" />
        </div>
      </div>

      <div className="order-1 lg:order-2">
        <div className="relative mx-auto w-40 sm:w-48 lg:w-72">
          <div aria-hidden="true" className="bg-brand-soft absolute -inset-3 -z-10 rotate-3 rounded-3xl" />
          <Image
            src={profile.avatar.url}
            alt={profile.avatar.alt}
            width={profile.avatar.width}
            height={profile.avatar.height}
            sizes="(min-width: 1024px) 288px, (min-width: 640px) 192px, 160px"
            loading="eager"
            fetchPriority="high"
            className="aspect-[4/5] w-full rounded-2xl border object-cover shadow-sm"
          />
        </div>
      </div>
    </section>
  );
}
