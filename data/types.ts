// Shapes of the listing content. Content itself lives in ./listing.ts.
// Money is stored as plain numbers (major units) + a currency symbol; dates
// as ISO yyyy-mm-dd strings. Anything the reference truncates behind a
// "Show more" that we have not seen in full is flagged on the field.

export interface ListingPhoto {
  id: string;
  src: string;
  alt: string;
  width: number;
  height: number;
  /** Which room the photo belongs to (Photo Tour grouping). */
  roomId?: string;
}

/** A room in the Photo Tour text panel. */
export interface ListingRoom {
  id: string;
  name: string;
  details?: string[];
}

/** Avatar: a photo when we have one, otherwise a letter on a tinted circle. */
export interface Person {
  name: string;
  /** Missing for people whose photo asset hasn't been supplied yet. */
  avatarSrc?: string;
  initial: string;
}

export interface Summary {
  propertyType: string;
  location: string;
  guests: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
}

export interface RatingCategory {
  id:
    | "cleanliness"
    | "accuracy"
    | "check-in"
    | "communication"
    | "location"
    | "value";
  label: string;
  value: number;
}

export interface RatingSummary {
  value: number;
  count: number;
  guestFavourite: boolean;
  /** Short line in the banner under the listing summary. */
  bannerText: string;
  /** Heading + copy in the Reviews section. */
  favouriteHeading: string;
  favouriteText: string;
  /** Number of reviews per star rating (derived: matches 4.95 over 19). */
  distribution: Record<1 | 2 | 3 | 4 | 5, number>;
  categories: RatingCategory[];
}

export interface Host {
  name: string;
  avatarSrc?: string;
  verified: boolean;
  reviewCount: number;
  rating: number;
  yearsHosting: number;
  facts: { icon: "born" | "school"; text: string }[];
  coHosts: Person[];
  responseRate: string;
  responseTime: string;
}

export interface Highlight {
  icon: "outdoor" | "cool" | "self-check-in";
  title: string;
  text: string;
}

export interface SleepingArea {
  id: string;
  name: string;
  detail: string;
  /** Photo shown on the card; must exist under /public. */
  imageSrc: string;
  imageAlt: string;
}

export interface Amenity {
  id: string;
  label: string;
  /** false = shown struck through ("not available"). */
  available: boolean;
}

export interface Review {
  id: string;
  author: Person;
  /** e.g. "2 months on Airbnb". */
  tenure: string;
  /** e.g. "1 week ago" or "May 2026". */
  when: string;
  rating: number;
  text: string;
}

export interface ReviewTag {
  label: string;
  count: number;
  /** Small emoji-style icon shown in the chip (asset, may be pending). */
  iconSrc?: string;
}

export interface NearbyStay {
  id: string;
  title: string;
  price: number;
  rating: number;
  /** Asset path; the file arrives with the downloaded assets bundle. */
  imageSrc?: string;
}

export interface Listing {
  title: string;
  summary: Summary;
  photos: ListingPhoto[];
  rooms: ListingRoom[];
  /** Ids of the five photos shown in the hero grid, in grid order. */
  featuredPhotoIds: string[];
  rating: RatingSummary;
  host: Host;
  highlights: Highlight[];
  description: {
    /** Shows the "Some info has been automatically translated" notice. */
    translated: boolean;
    text: string;
    /** Lines visible before "Show more". */
    collapsedLines: number;
  };
  sleeping: SleepingArea[];
  amenities: {
    /** The ten shown on the page. */
    items: Amenity[];
    /** The number in the "Show all N amenities" button. */
    total: number;
    /** Full list, grouped, as shown in the "What this place offers" modal. */
    groups: { category: string; items: string[] }[];
  };
  stay: {
    checkIn: string;
    checkOut: string;
    nights: number;
    guests: number;
    maxGuests: number;
  };
  calendar: {
    /** First visible month (yyyy-mm); two months are shown side by side. */
    firstMonth: string;
    /** Dates that can't be booked. Only Nov 2026 is known from the capture. */
    unavailable: string[];
  };
  pricing: {
    currency: string;
    /** Total for the selected stay. */
    total: number;
    freeCancellationBefore: string;
    promo: { text: string; linkText: string; cta: string };
  };
  reviews: {
    tags: ReviewTag[];
    items: Review[];
  };
  location: { label: string; note: string };
  neighbourhood: { text: string };
  thingsToKnow: {
    cancellation: { lines: string[] };
    houseRules: string[];
    safety: string[];
  };
  nearby: { items: NearbyStay[]; pages: number };
}
