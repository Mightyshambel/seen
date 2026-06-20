import { Link, useLocation, useNavigate } from "react-router-dom";
import { Heart } from "lucide-react";
import { openConsentPreferences } from "@/components/common/ConsentBanner";
import { cn } from "@/lib/utils";
import { scrollToSection } from "@/lib/scroll-to-section";

const NAV_SECTIONS = [
  { label: "About Us", id: "about" },
  { label: "Mission & Vision", id: "mission" },
  { label: "Partner with us", id: "partner" },
  { label: "Contact Us", id: "contact" },
] as const;

function NavSectionLink({
  id,
  label,
  hero,
}: {
  id: string;
  label: string;
  hero?: boolean;
}) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (location.pathname === "/") {
      scrollToSection(id);
      return;
    }
    navigate({ pathname: "/", hash: id });
  };

  return (
    <a
      href={`/#${id}`}
      onClick={handleClick}
      className={cn(
        "transition-colors duration-300",
        hero ? "text-white/78 hover:text-white" : "nav-link",
      )}
    >
      {label}
    </a>
  );
}

export function SiteHeader({
  transparent = false,
  hero = false,
}: {
  transparent?: boolean;
  hero?: boolean;
}) {
  return (
    <header
      className={cn(
        "sticky top-0 z-30 w-full backdrop-blur-xl transition-all duration-300",
        hero
          ? "border-b border-white/10 bg-white/8"
          : transparent
            ? "border-b border-transparent bg-background/55"
            : "border-b border-border/50 bg-background/85 shadow-[0_1px_0_oklch(1_0_0_/_0.4)_inset]",
      )}
    >
      <div className="mx-auto flex h-[4.5rem] max-w-6xl items-center justify-between px-6">
        <Link to="/" className="group flex items-center gap-2.5">
          <span className="logo-mark grid h-9 w-9 place-items-center transition-transform duration-300 group-hover:scale-105">
            <Heart className="h-4 w-4 text-sage" strokeWidth={1.6} />
          </span>
          <span
            className={cn(
              "font-serif text-[1.35rem] tracking-tight",
              hero ? "text-white" : "text-foreground",
            )}
          >
            Seen
          </span>
        </Link>
        <nav className="hidden items-center gap-8 text-sm md:flex">
          {NAV_SECTIONS.map(({ label, id }) => (
            <NavSectionLink key={id} id={id} label={label} hero={hero} />
          ))}
        </nav>
        <Link
          to="/login"
          className={cn("px-5 py-2.5 text-xs", hero ? "btn-hero-primary" : "btn-primary")}
        >
          Login
        </Link>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border/50 bg-background/90">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="logo-mark grid h-9 w-9 place-items-center">
              <Heart className="h-4 w-4 text-sage" strokeWidth={1.6} />
            </span>
            <span className="font-serif text-xl">Seen</span>
          </div>
          <p className="mt-4 max-w-xs text-xs leading-relaxed text-muted-foreground">
            Seen is peer support, not a substitute for professional mental healthcare. If
            you&apos;re in crisis, please reach out to a licensed provider.
          </p>
        </div>
        <FooterCol
          title="About"
          links={[
            ["About Us", "/#about"],
            ["Mission & Vision", "/#mission"],
            ["Partner with us", "/#partner"],
            ["Contact Us", "/#contact"],
            ["FAQ", "/#faq"],
          ]}
        />
        <FooterCol
          title="Care"
          links={[
            ["Crisis resources", "/support"],
            ["Trust & safety", "/settings/privacy"],
          ]}
        />
        <FooterCol title="Account" links={[["Sign up", "/signup"]]} />
      </div>
      <div className="border-t border-border/50 px-6 py-6">
        <nav className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-6 gap-y-2 text-center text-xs text-muted-foreground">
          <Link to="/privacy" className="link-muted">
            Privacy Policy
          </Link>
          <Link to="/terms" className="link-muted">
            Terms & Agreement
          </Link>
          <Link to="/cookies" className="link-muted">
            Cookies
          </Link>
          <button type="button" onClick={openConsentPreferences} className="link-muted">
            Manage cookie preferences
          </button>
        </nav>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleSectionClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    if (location.pathname === "/") {
      scrollToSection(id);
      return;
    }
    navigate({ pathname: "/", hash: id });
  };

  return (
    <div>
      <p className="eyebrow text-muted-foreground">{title}</p>
      <ul className="mt-4 space-y-3 text-sm">
        {links.map(([label, href]) => (
          <li key={label}>
            {href.startsWith("/#") ? (
              <a
                href={href}
                onClick={(e) => handleSectionClick(e, href.slice(2))}
                className="link-muted"
              >
                {label}
              </a>
            ) : href.startsWith("/") ? (
              <Link to={href} className="link-muted">
                {label}
              </Link>
            ) : (
              <a href={href} className="link-muted">
                {label}
              </a>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
