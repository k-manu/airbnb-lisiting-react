import Image from "next/image";
import Link from "next/link";
import { AirbnbLogo } from "@/components/brand/AirbnbLogo";
import { GlobeIcon, MenuIcon, SearchIcon } from "@/components/icons";

const segment =
  "inline-flex h-12 items-center gap-2 px-4 text-body leading-[normal] font-medium text-ink";
const divider = "h-6 w-px bg-border-strong";
const circleButton =
  "flex size-(--layout-header-circle-size) items-center justify-center rounded-full bg-surface-muted text-ink transition-[background] duration-(--dur-header-fill) hover:bg-grey-300";

export function Header() {
  return (
    <header className="relative z-50 border-b border-line bg-white">
      <a
        href="#listing-title"
        className="absolute top-0 -left-[999px] z-200 rounded-b-button bg-white px-4 py-2.5 text-ink focus:left-0 focus-visible:outline-none!"
      >
        Skip to content
      </a>
      <div className="grid h-(--layout-header-height) grid-cols-[1fr_auto_1fr] items-center px-(--layout-page-gutter)">
        <Link
          href="/"
          aria-label="Airbnb homepage"
          className="inline-flex items-center justify-self-start text-brand"
        >
          <AirbnbLogo aria-hidden className="block h-8 w-auto" />
        </Link>

        <div
          role="search"
          className="inline-flex h-(--layout-header-search-height) items-center justify-self-center rounded-pill border border-border-strong bg-white px-2 shadow-pill transition-shadow duration-(--dur-header-shadow) ease-standard hover:shadow-pill-hover"
        >
          <button type="button" className={segment}>
            {/* The artwork is drawn into a square, -6px into the button's padding. */}
            <Image
              src="/assets/images/ui/searchbar-house.png"
              alt=""
              width={48}
              height={48}
              unoptimized
              priority
              className="-ml-1.5 size-12 object-fill"
            />
            Anywhere
          </button>
          <span aria-hidden className={divider} />
          <button type="button" className={segment}>
            Anytime
          </button>
          <span aria-hidden className={divider} />
          <button
            type="button"
            className={`${segment} font-normal text-ink-muted`}
          >
            Add guests
          </button>
          <button
            type="button"
            aria-label="Search"
            className="ml-2 flex size-(--layout-header-search-btn-size) items-center justify-center rounded-full bg-brand text-white"
          >
            <SearchIcon width={14} height={14} />
          </button>
        </div>

        <nav
          aria-label="Account"
          className="inline-flex items-center gap-2 justify-self-end"
        >
          <a
            href="#"
            className="rounded-pill px-3.5 py-3 text-body font-medium text-ink transition-[background] duration-(--dur-header-fill) hover:bg-grey-100"
          >
            Become a host
          </a>
          <button
            type="button"
            aria-label="Choose a language and currency"
            className={circleButton}
          >
            <GlobeIcon width={16} height={16} />
          </button>
          <button
            type="button"
            aria-label="Main navigation menu"
            className={circleButton}
          >
            <MenuIcon width={16} height={16} />
          </button>
        </nav>
      </div>
    </header>
  );
}
