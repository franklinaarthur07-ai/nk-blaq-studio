const gallery = [
  {
    id: 1,
    title: "Golden Hour",
    category: "Portrait",
    image: "portrait",
    location: "Accra, Ghana",
    year: 2024
  },
  {
    id: 2,
    title: "The Vow",
    category: "Wedding",
    image: "wedding",
    location: "Kumasi, Ghana",
    year: 2024
  },
  {
    id: 3,
    title: "Midnight Muse",
    category: "Fashion",
    image: "fashion",
    location: "Studio, Accra",
    year: 2023
  },
  {
    id: 4,
    title: "Sunkissed",
    category: "Portrait",
    image: "portrait",
    location: "Cape Coast",
    year: 2024
  },
  {
    id: 5,
    title: "Rings & Roses",
    category: "Wedding",
    image: "wedding",
    location: "Takoradi",
    year: 2023
  },
  {
    id: 6,
    title: "Editorial No. 6",
    category: "Fashion",
    image: "fashion",
    location: "Studio, Accra",
    year: 2024
  },
  {
    id: 7,
    title: "Family Light",
    category: "Family",
    image: "family",
    location: "Tema",
    year: 2024
  },
  {
    id: 8,
    title: "The Proposal",
    category: "Event",
    image: "event",
    location: "Labadi Beach",
    year: 2023
  }
];

const services = [
  {
    id: "portrait",
    name: "Portrait Session",
    tagline: "Timeless portraits, one on one",
    duration: "1.5 hours",
    price: 350,
    icon: "fa-user",
    features: [
      "1 photographer",
      "30+ edited photos",
      "Online gallery",
      "Print release"
    ]
  },
  {
    id: "wedding",
    name: "Wedding Day",
    tagline: "Full-day coverage of your big day",
    duration: "8 hours",
    price: 1800,
    icon: "fa-heart",
    features: [
      "Lead + assistant",
      "500+ edited photos",
      "Engagement mini-session",
      "Wedding album"
    ]
  },
  {
    id: "fashion",
    name: "Editorial / Fashion",
    tagline: "Bold, styled, magazine-ready",
    duration: "3 hours",
    price: 750,
    icon: "fa-camera-retro",
    features: [
      "Creative direction",
      "Studio or location",
      "100+ edited photos",
      "Retouching"
    ]
  },
  {
    id: "event",
    name: "Events & Celebrations",
    tagline: "Parties, proposals, milestones",
    duration: "4 hours",
    price: 900,
    icon: "fa-champagne-glasses",
    features: [
      "Event coverage",
      "Candid + posed",
      "200+ edited photos",
      "Same-week preview"
    ]
  }
];

module.exports = { gallery, services };