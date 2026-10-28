import type { IconType } from "@/components/icon";

interface AmenityItem {
  icon: IconType;
  name: string;
  desc: string;
}

export const amenityCategories: {
  indoor: AmenityItem[];
  outdoor: AmenityItem[];
  kitchen: AmenityItem[];
  beach: AmenityItem[];
} = {
  indoor: [
    {
      icon: "tv" as IconType,
      name: '75" TV',
      desc: 'Living Room With 75" TV. Satellite or cable.',
    },
    {
      icon: "sun" as IconType,
      name: "Air Conditioning and Heat",
      desc: "Air Conditioning. Heat.",
    },
    {
      icon: "wifi" as IconType,
      name: "Internet",
      desc: "Internet.",
    },
    {
      icon: "check" as IconType,
      name: "Washer & Dryer",
      desc: "1 of 2 First Floor Bathrooms - Laundry.",
    },
    {
      icon: "check" as IconType,
      name: "No Smoking/Pets",
      desc: "Children Welcome.",
    },
  ],
  outdoor: [
    {
      icon: "pool" as IconType,
      name: "Dipping pool",
      desc: "Perfect for cooling off after beach days",
    },
    {
      icon: "view" as IconType,
      name: "Rooftop Deck",
      desc: "Rooftop Deck.",
    },
    {
      icon: "sun" as IconType,
      name: "Second Floor Main Deck",
      desc: "Amazing sunsets from the decks and pool.",
    },
    {
      icon: "flame" as IconType,
      name: "Large Gas Grill",
      desc: "Large Gas Grill.",
    },
    {
      icon: "coffee" as IconType,
      name: "Low Country Boil Pot and Gas Burner",
      desc: "Low Country Boil Pot and Gas Burner.",
    },
    {
      icon: "car" as IconType,
      name: "Garage parking",
      desc: "Garage parking, a rare offering in the area.",
    },
  ],
  kitchen: [
    {
      icon: "kitchen" as IconType,
      name: "Fully Equipped Kitchen",
      desc: "Fully Equipped Kitchen.",
    },
    {
      icon: "coffee" as IconType,
      name: "Breakfast Nook",
      desc: "Breakfast Nook.",
    },
    {
      icon: "check" as IconType,
      name: "Half Bath Off Dining Room",
      desc: "Half Bath Off Dining Room.",
    },
  ],
  beach: [
    {
      icon: "car" as IconType,
      name: "Large Beach Carts",
      desc: "For hauling chairs and the cooler to the beach.",
    },
    {
      icon: "sun" as IconType,
      name: "Chairs and Umbrellas",
      desc: "Included for days at the beach.",
    },
    {
      icon: "wave" as IconType,
      name: "Floats",
      desc: "Floats are included with the beach gear.",
    },
    {
      icon: "pool" as IconType,
      name: "Cooler",
      desc: "A cooler is included with the beach gear.",
    },
    {
      icon: "pin" as IconType,
      name: "South Beach, Tybee",
      desc: "Walking distance to the commercial district.",
    },
    {
      icon: "check" as IconType,
      name: "Children Welcome",
      desc: "Children Welcome.",
    },
    {
      icon: "view" as IconType,
      name: "Shops, Restaurants, and Nightclubs",
      desc: "Within walking distance in Tybee's commercial district.",
    },
  ],
};

export const amenityColumns = [
  { label: "Indoor", items: amenityCategories.indoor },
  { label: "Outdoor", items: amenityCategories.outdoor },
  { label: "Kitchen", items: amenityCategories.kitchen },
  { label: "Beach", items: amenityCategories.beach },
];

export const amenityRowCount = Math.max(
  ...amenityColumns.map((column) => column.items.length),
);

export const faqs = [
  {
    q: "How do I book directly and avoid platform fees?",
    a: "Use the contact form on this page, or call or text Willie at (912) 398-4113 or Shelly at (912) 398-6901. We are on VRBO, and booking directly avoids the fees those sites charge. Put your requested dates in the message and we will respond within 24 hours with availability.",
  },
  {
    q: "Are pets allowed?",
    a: "No smoking and no pets. Children are welcome.",
  },
  {
    q: "Where is the house?",
    a: "Casa Oceano Rio is in the exclusive South Beach area of Tybee, at 1811a Butler Ave, Tybee Island, Ga 31328. It is within walking distance of Tybee's commercial district, with shops, restaurants, and nightclubs.",
  },
  {
    q: "What beach gear is included?",
    a: "Chairs, floats, umbrellas, a cooler, and large beach carts.",
  },
  {
    q: "Is there parking?",
    a: "Yes. Garage parking is available, which is uncommon on Tybee.",
  },
];
