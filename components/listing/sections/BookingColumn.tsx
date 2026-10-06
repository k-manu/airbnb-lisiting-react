import type { Listing } from "@/data/listing";
import Image from "next/image";
import { ReserveButton } from "@/features/listing-actions";
import { FieldChevronIcon, ReportFlagIcon } from "./top/icons";

const fmtDate = (iso: string) => {
  const [y, m, d] = iso.split("-");
  return `${m}/${d}/${y}`;
};

const cell = "block border border-transparent px-3 py-2.5";
const label = "block text-label font-bold tracking-[0.04em] text-ink uppercase";
const value = "mt-0.5 block w-full text-body text-ink";

/**
 * Right-hand column: promo card, booking card, "Report this listing".
 * Sticks below the sticky section bar while the left column scrolls.
 */
export function BookingColumn({
  pricing,
  stay,
}: {
  pricing: Listing["pricing"];
  stay: Listing["stay"];
}) {
  const { currency, total, promo, freeCancellationBefore } = pricing;
  const money = `${currency}${total.toLocaleString("en-IN")}`;

  return (
    <div className="sticky top-(--booking-sticky-top) w-(--booking-column-width) self-start justify-self-end leading-body">
      <section
        aria-label="Offer"
        className="flex items-center gap-3 rounded-offer border border-border-strong bg-white p-4"
      >
        <Image
          src="/assets/images/ui/discount.svg"
          alt=""
          width={32}
          height={32}
          unoptimized
          className="shrink-0"
        />
        <p className="flex-1 text-body leading-compact text-ink">
          {promo.text}
          <br />
          <a href="#" className="font-medium underline">
            {promo.linkText}
          </a>
        </p>
        <button
          type="button"
          className="rounded-button bg-grey-100 px-3.5 py-2 text-body leading-[normal] font-medium text-ink hover:bg-grey-200"
        >
          {promo.cta}
        </button>
      </section>

      <aside
        id="booking"
        aria-label="Booking"
        className="mt-6 rounded-card border border-line-card px-6 pt-card-top pb-6 shadow-booking-card"
      >
        <p className="flex items-baseline gap-1.5 text-body-md text-ink">
          <span className="text-title-sm font-medium underline underline-offset-2">
            {money}
          </span>
          for {stay.nights} nights
        </p>

        {/* Display-only fields, as in the reference: nothing here is editable and there is no form. */}
        <div className="mt-field-gap">
          <div className="overflow-hidden rounded-button border border-field-border">
            <div className="grid grid-cols-2 border-b border-field-border">
              <div className={cell}>
                <span className={label}>Check-in</span>
                <span className={value}>{fmtDate(stay.checkIn)}</span>
              </div>
              <div className={`${cell} border-l-field-border`}>
                <span className={label}>Checkout</span>
                <span className={value}>{fmtDate(stay.checkOut)}</span>
              </div>
            </div>
            <div className="relative block px-3 py-2.5">
              <span className={label}>Guests</span>
              <span className={value}>
                {stay.guests} {stay.guests === 1 ? "guest" : "guests"}
              </span>
              <FieldChevronIcon className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-ink" />
            </div>
          </div>

          <p className="my-4 rounded-button bg-grey-100 p-2 text-center text-note text-ink-muted">
            Free cancellation before{" "}
            <span className="font-medium text-ink">
              {freeCancellationBefore}
            </span>
          </p>

          <ReserveButton className="mt-0.5 h-12 w-full rounded-pill bg-(image:--gradient-reserve) px-6 text-body-lg leading-[normal] font-medium text-white transition-reserve press-reserve hover:bg-(image:--gradient-reserve-hover)">
            Reserve
          </ReserveButton>
        </div>

        <p className="mt-4 text-center text-body text-ink-muted">
          You won&apos;t be charged yet
        </p>
      </aside>

      <p className="mt-report-top flex items-center justify-center gap-2 text-body text-ink-muted">
        <ReportFlagIcon className="size-4" />
        <a href="#" className="underline">
          Report this listing
        </a>
      </p>
    </div>
  );
}
