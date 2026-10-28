export interface SpaceItem {
  floor: string;
  img: string;
  title: string;
  desc: string;
  features: string[];
}

export const spacesData: SpaceItem[] = [
  {
    floor: "Primary suite",
    img: "/gallery/primary-bedroom.jpg",
    title: "Primary Bedroom",
    desc: "Primary bedroom with a walk-in shower.",
    features: [
      "Primary Bedroom",
      "Primary Bath Walk-In Shower",
    ],
  },
  {
    floor: "Living area",
    img: "/gallery/living-room.jpg",
    title: 'Living Room With 75" TV',
    desc: "Living Room - Stairs to 3rd Floor. Satellite or cable. Wood Fireplace.",
    features: [
      '75" TV',
      "Satellite or cable",
      "Stairs to 3rd Floor",
    ],
  },
  {
    floor: "Kitchen",
    img: "/gallery/kitchen.jpg",
    title: "Kitchen",
    desc: "Kitchen, Breakfast Nook, and Dining Room. Half Bath Off Dining Room.",
    features: [
      "Kitchen",
      "Breakfast Nook",
      "Half Bath Off Dining Room",
    ],
  },
  {
    floor: "Second floor",
    img: "/gallery/second-floor-bedroom-1.jpg",
    title: "Second Floor Bedrooms",
    desc: "Two bedrooms on the second floor.",
    features: [
      "Second Floor Bedroom 1",
      "Second Floor Bedroom 2",
      "Full shared bath with tub",
    ],
  },
  {
    floor: "First floor",
    img: "/gallery/first-floor-bedroom-1.jpg",
    title: "First Floor Bedrooms",
    desc: "Two bedrooms, two baths, three showers, and laundry.",
    features: [
      "First Floor Bedroom 1",
      "First Floor Bedroom 2",
      "Washer & Dryer",
    ],
  },
  {
    floor: "Outdoors",
    img: "/gallery/dipping-pool.jpg",
    title: "Dipping Pool",
    desc: "Dipping pool for 12. A place for the kids to unwind after a day at the beach.",
    features: [
      "Dipping pool",
      "Rooftop Deck",
      "Large Gas Grill",
    ],
  },
];
