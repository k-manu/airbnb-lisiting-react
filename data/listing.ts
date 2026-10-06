import type { Listing, NearbyStay, Person, Review } from "./types";
import {
  featuredPhotoIds,
  galleryPhotos,
  galleryRooms,
} from "./gallery.generated";

export type * from "./types";

// Content taken from the reference page's rendered content (text and asset paths).
// Gallery photos/rooms come from ./gallery.generated (see scripts/generate-gallery-data.py).

const person = (name: string, avatarSrc?: string): Person => ({
  name,
  avatarSrc,
  initial: name.charAt(0).toUpperCase(),
});

const review = (
  id: string,
  author: Person,
  tenure: string,
  when: string,
  text: string,
): Review => ({ id, author, tenure, when, rating: 5, text });

// The reference has six photos for its eight nearby stays: the last two repeat the second and fourth.
const NEARBY_PHOTO = [1, 2, 3, 4, 5, 6, 2, 4];

const nearby = (
  n: number,
  title: string,
  price: number,
  rating: number,
): NearbyStay => ({
  id: `nearby-${n}`,
  title,
  price,
  rating,
  imageSrc: `/assets/images/similar/s${NEARBY_PHOTO[n - 1]}.jpeg`,
});

export const listing: Listing = {
  title: "Romantic Jacuzzi 1BHK Candolim | Mirashya UG10",

  summary: {
    propertyType: "Entire serviced apartment",
    location: "Candolim, India",
    guests: 3,
    bedrooms: 1,
    beds: 1,
    bathrooms: 1,
  },

  photos: galleryPhotos,
  rooms: galleryRooms,
  featuredPhotoIds,

  rating: {
    value: 4.95,
    count: 19,
    guestFavourite: true,
    bannerText: "One of the most loved homes on Airbnb, according to guests",
    favouriteHeading: "Guest favourite",
    favouriteText:
      "This home is a guest favourite based on ratings, reviews and reliability",
    // 18 x 5-star + 1 x 4-star = 94 / 19 = 4.947 -> 4.95 (matches the bars).
    distribution: { 5: 18, 4: 1, 3: 0, 2: 0, 1: 0 },
    categories: [
      { id: "cleanliness", label: "Cleanliness", value: 5.0 },
      { id: "accuracy", label: "Accuracy", value: 5.0 },
      { id: "check-in", label: "Check-in", value: 5.0 },
      { id: "communication", label: "Communication", value: 5.0 },
      { id: "location", label: "Location", value: 4.8 },
      { id: "value", label: "Value", value: 4.8 },
    ],
  },

  host: {
    name: "Mirashya Homes",
    avatarSrc: "/assets/images/avatars/host.jpeg",
    verified: true,
    reviewCount: 1463,
    rating: 4.68,
    yearsHosting: 2,
    facts: [
      { icon: "born", text: "Born in the 80s" },
      { icon: "school", text: "Where I went to school: NICMAR GOA" },
    ],
    // Photo files arrive with the assets bundle; Shruti and Amisha have none
    // (the reference shows their initials).
    coHosts: [
      person("Sharath", "/assets/images/avatars/co1.jpg"),
      person("Aman Dev Pahwa", "/assets/images/avatars/co2.jpg"),
      person("Maria Karen Priyanka", "/assets/images/avatars/co3.jpg"),
      person("Simran", "/assets/images/avatars/rev5.jpeg"),
      person("Pallavi", "/assets/images/avatars/rev1.jpeg"),
      person("Sanyukta", "/assets/images/avatars/rev2.jpeg"),
      person("Shruti"),
      person("Amisha"),
    ],
    responseRate: "100%",
    responseTime: "within an hour",
  },

  highlights: [
    {
      icon: "outdoor",
      title: "Outdoor entertainment",
      text: "The pool and alfresco dining are great for summer trips.",
    },
    {
      icon: "cool",
      title: "Designed for staying cool",
      text: "Beat the heat with the A/C and ceiling fan.",
    },
    {
      icon: "self-check-in",
      title: "Self check-in",
      text: "You can check in with the building staff.",
    },
  ],

  description: {
    translated: true,
    text: "🌴 Plan Your Relaxing Holiday at Amor De Goa by Mirashya Homes! ✨ Stay in this cozy 1BHK in the heart of Candolim, featuring a private jacuzzi 🛁 for the perfect unwind. Enjoy high-speed WiFi 💻, Smart TV 📺, pet-friendly comfort 🐾, and stylish interiors. Just minutes from Candolim Beach 🏖️, popular cafés, restaurants, and nightlife 🍹, it’s ideal for couples seeking romance, relaxation, and a touch of luxury in North Goa. ❤️🌴",
    collapsedLines: 4,
  },

  sleeping: [
    {
      id: "bedroom",
      name: "Bedroom",
      detail: "1 double bed",
      imageSrc: "/assets/images/67c61c6f-6260-4809-9510-0360e58a345d.jpeg",
      imageAlt: "Bedroom with a double bed and mirror",
    },
    {
      id: "living-room",
      name: "Living room",
      detail: "1 sofa",
      imageSrc: "/assets/images/a9831aeb-f441-44f5-a38f-4cf54e3f0fcf.jpeg",
      imageAlt: "Living room with an orange sofa and dining table",
    },
  ],

  amenities: {
    total: 50,
    groups: [
      {
        category: "Bathroom",
        items: [
          "Hairdryer",
          "Cleaning products",
          "Shampoo",
          "Hot water",
          "Shower gel",
        ],
      },
      {
        category: "Bedroom and laundry",
        items: [
          "Washing machine",
          "Hangers",
          "Bed linen",
          "Room-darkening blinds",
          "Iron",
          "Clothes storage",
          "Cot",
        ],
      },
      { category: "Entertainment", items: ["TV"] },
      { category: "Family", items: ["Cot"] },
      {
        category: "Heating and cooling",
        items: ["Air conditioning", "Ceiling fan"],
      },
      {
        category: "Home safety",
        items: [
          "Exterior security cameras on property",
          "Carbon monoxide alarm",
          "Smoke alarm",
        ],
      },
      {
        category: "Internet and office",
        items: ["Wifi", "Dedicated workspace"],
      },
      {
        category: "Kitchen and dining",
        items: [
          "Kitchen",
          "Fridge",
          "Freezer",
          "Microwave",
          "Cooking basics",
          "Crockery and cutlery",
          "Kettle",
          "Coffee",
          "Wine glasses",
          "Toaster",
          "Blender",
          "Cooker",
        ],
      },
      { category: "Location features", items: ["Private entrance"] },
      {
        category: "Outdoor",
        items: ["Patio or balcony", "Outdoor dining area"],
      },
      {
        category: "Parking and facilities",
        items: ["Free parking on premises", "Pool", "Hot tub", "Gym"],
      },
      {
        category: "Services",
        items: [
          "Pets allowed",
          "Cleaning available during stay",
          "Long-term stays allowed",
          "Self check-in",
        ],
      },
    ],

    // Only the ten the page shows; the other 40 are behind "Show all 50".
    items: [
      { id: "kitchen", label: "Kitchen", available: true },
      { id: "wifi", label: "Wifi", available: true },
      { id: "workspace", label: "Dedicated workspace", available: true },
      { id: "parking", label: "Free parking on premises", available: true },
      { id: "pool", label: "Pool", available: true },
      { id: "hot-tub", label: "Hot tub", available: true },
      { id: "pets", label: "Pets allowed", available: true },
      {
        id: "security-cameras",
        label: "Exterior security cameras on property",
        available: true,
      },
      { id: "co-alarm", label: "Carbon monoxide alarm", available: false },
      { id: "smoke-alarm", label: "Smoke alarm", available: false },
    ],
  },

  stay: {
    checkIn: "2026-10-18",
    checkOut: "2026-10-23",
    nights: 5,
    guests: 2,
    maxGuests: 3,
  },

  calendar: {
    firstMonth: "2026-10",
    // From the November grid (18-24 and 29-30 are struck through).
    // October is fully open. December onwards NOT CAPTURED.
    unavailable: [
      "2026-11-18",
      "2026-11-19",
      "2026-11-20",
      "2026-11-21",
      "2026-11-22",
      "2026-11-23",
      "2026-11-24",
      "2026-11-29",
      "2026-11-30",
    ],
  },

  pricing: {
    currency: "₹",
    total: 28499,
    freeCancellationBefore: "17 October",
    promo: {
      text: "Get 10% off your next stay.",
      linkText: "Terms apply",
      cta: "Claim",
    },
  },

  reviews: {
    tags: [
      {
        label: "Comfort",
        count: 6,
        iconSrc: "/assets/images/chips/comfort.png",
      },
      {
        label: "Accuracy",
        count: 5,
        iconSrc: "/assets/images/chips/accuracy.png",
      },
      {
        label: "Hot tub",
        count: 5,
        iconSrc: "/assets/images/chips/hot-tub.png",
      },
      {
        label: "Condition",
        count: 4,
        iconSrc: "/assets/images/chips/condition.png",
      },
      {
        label: "Hospitality",
        count: 8,
        iconSrc: "/assets/images/chips/hospitality.png",
      },
      {
        label: "Cleanliness",
        count: 4,
        iconSrc: "/assets/images/chips/cleanliness.png",
      },
      {
        label: "Amenities",
        count: 2,
        iconSrc: "/assets/images/chips/amenities.png",
      },
      { label: "Decor", count: 2, iconSrc: "/assets/images/chips/decor.png" },
      {
        label: "Indoor spaces",
        count: 2,
        iconSrc: "/assets/images/chips/indoor-spaces.png",
      },
      {
        label: "Location",
        count: 2,
        iconSrc: "/assets/images/chips/location.png",
      },
    ],
    items: [
      review(
        "amit",
        person("Amit"),
        "2 months on Airbnb",
        "1 week ago",
        "Very helpful and responsive team. Safe and peaceful stay. loved everything about the property.",
      ),
      review(
        "aheesh",
        person("Aheesh", "/assets/images/avatars/rev1.jpeg"),
        "3 years on Airbnb",
        "2 weeks ago",
        "We had a wonderful stay. The apartment was clean, comfortable, and exactly as shown in the photos. The host was very responsive and helpful throughout our stay. We would definitely recommend this place and would love to stay here again.",
      ),
      review(
        "samiksha",
        person("Samiksha", "/assets/images/avatars/rev2.jpeg"),
        "8 months on Airbnb",
        "May 2026",
        "the host nitish was really great help",
      ),
      review(
        "vedant",
        person("Vedant"),
        "4 years on Airbnb",
        "May 2026",
        "We had an amazing stay at this property in Goa! The entire home was spotless and exceptionally well-maintained, making us feel comfortable from the moment we arrived. The cleanliness standards were truly impressive, with every corner of the house looking fresh and pristine.\nThe highlight of our stay was definitely the jacuzzi. It was clean, well-kept, and the perfect place to relax after a day of exploring Goa. It added a luxurious touch to our vacation and made our experience even more memorable.\nThe property was exactly as described, well-equipped, and offered a peaceful atmosphere. We would highly recommend this place to anyone looking for a comfortable, clean, and relaxing stay in Goa. Looking forward to visiting again!",
      ),
      review(
        "vaibhav",
        person("Vaibhav S", "/assets/images/avatars/rev3.jpeg"),
        "3 years on Airbnb",
        "May 2026",
        "Great great experience living out there , can't expect more , will always look for it in the future and will recommend my friends too.",
      ),
      review(
        "mohd",
        person("Mohd", "/assets/images/avatars/rev4.jpeg"),
        "5 years on Airbnb",
        "May 2026",
        "Great place. Exactly as described in the listing.",
      ),
    ],
  },

  location: {
    label: "Candolim, Goa, India",
    note: "Exact location will be provided after booking.",
  },

  neighbourhood: {
    text: "Located in the heart of Candolim, Amor de Goa offers a peaceful stay with easy access to beaches, cafés, and popular attractions.",
  },

  thingsToKnow: {
    cancellation: {
      lines: [
        "Free cancellation before 17 October. Cancel before check-in on 18 October for a partial refund.",
        "Review this host’s full policy for details.",
      ],
    },
    houseRules: [
      "Check-in after 2:00 pm",
      "Checkout before 11:00 am",
      "3 guests maximum",
    ],
    safety: [
      "Carbon monoxide alarm not reported",
      "Smoke alarm not reported",
      "Exterior security cameras on property",
    ],
  },

  nearby: {
    pages: 2, // pager reads "1 / 2"
    items: [
      nearby(1, "Beautiful Studio with a view to die for", 23600, 4.91),
      nearby(2, "NAQAB - 1bhk with private pool", 42218, 4.95),
      nearby(
        3,
        "Greentique Luxury Flat with plunge pool, Calangute",
        44506,
        4.94,
      ),
      nearby(4, "The Tropical Studio | 5 mins to Beach", 22824, 4.96),
      nearby(
        5,
        "Luxury Casa Bella 1BHK with plunge pool, Calangute",
        39942,
        4.95,
      ),
      nearby(
        6,
        "Kanso by Earthen Window | Jacuzzi | Terrace | Pool",
        45648,
        5.0,
      ),
      nearby(7, "Luxury Apt | Private Pool | 6 Mins from Beach", 48786, 4.93),
      nearby(
        8,
        "Serendipity Cottage - Calm Stay in Calangute-Baga.",
        22824,
        4.92,
      ),
    ],
  },
};
