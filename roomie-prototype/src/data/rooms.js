// Central data store for all rooms/apartments
// To add a new room: just add a new object to this array!

export const rooms = [
  {
    id: 1,
    name: "Modern Downtown Apartment",
    description: "Beautiful modern apartment in the heart of the city. Features include a spacious living room, fully equipped kitchen, comfortable bedroom, and stunning city views.",
    pricePerNight: 89,
    capacity: 2,
    theme: "modern",
    location: "Downtown",
    amenities: [
      "Free WiFi",
      "Full Kitchen",
      "Air Conditioning",
      "City Views",
      "Free Parking",
      "Workspace"
    ],
    galleryImages: [
      "/images/room1/room1_bedroom1.png",
      "/images/room1/room1_bedroom2.png",
      "/images/room1/room1_livingroom.png",
      "/images/room1/room1_kitchen.png",
      "/images/room1/room1_bathroom.png",
      "/images/room1/room1_washroom.png",
    ],
    model3D: "/models/appartement.glb",
    has3D: true,
    fixMaterials: true, // This model has broken materials that need fixing
    enablePhysics: true, // Enable draggable furniture system
    // Movable furniture: cut out of the model by floor-plan region (viewer space)
    movableItems: [
      { id: 'bed', label: 'Bed', region: { min: [0.0, -1.3], max: [1.62, 0.35] } }
    ],
    waypoints: {
      // TODO: Capture these coordinates using ?debug=true
       bedroom1: {
        position: [2.26, 0.04, -1.57],
       target: [-1.66, -1.19, 1.28]
       },
      bedroom2: {
       position: [ 2.59, 0.12, -3.83],
      target: [-1.13, -0.78, -0.61]
     },
     bathroom: {
       position: [-1.19, 0.42, 0.12],
      target: [-5.28, -2.08, 1.53]
     },
     washroom: {
       position: [-1.8, 0.46, -0.13],
      target: [-4.39, -1.55, -3.91]
     },
     kitchen: {
       position: [-0.74, 0.19, 2.65],
      target: [4.07, 0, 1.3]
     },
     livingroom: {
       position: [-0.05, -0.13, 1.29],
      target: [-4.26, 0.71, 3.83]
     }
    }
  },
  {
    id: 2,
    name: "Cozy Studio Loft",
    description: "Charming studio loft perfect for solo travelers or couples. Exposed brick walls, high ceilings, and modern amenities create a unique living space.",
    pricePerNight: 65,
    capacity: 2,
    theme: "rustic",
    location: "Arts District",
    amenities: [
      "Free WiFi",
      "Kitchenette",
      "Heating",
      "Workspace",
      "Smart TV",
      "Weekly Cleaning"
    ],
    galleryImages: [
      "/images/room2/room2_livingroom.png",
      "/images/room2/room2_bathroom.png",
      "/images/room2/room2_bedroom.png"
    ],
    model3D: "/models/Room2/source/DoriHome.glb",
    has3D: true,
    fixMaterials: false, // This model has working embedded materials
    enablePhysics: true, // Enable draggable furniture with physics
    movableItems: [
      { id: 'fridge', label: 'Refrigerator', meshName: 'fridge' }
    ],
    waypoints: {
      // Old waypoints from DoriHomeViewer - may need adjustment with new scaling
      kitchen: {
        position: [-0.03, -0.01, -2.62],
        target: [-4.04, -0.31, -5.59]
      },
      livingRoom: {
        position: [-2.80, -0.18, 1.06],
        target: [0, 0, 0]
      },
      bedroom: {
        position: [2.87, 0.19, 2.18],
        target: [-0.54, -2.93, 4.08]
      },
      laundryroom: {
        position: [0.63, -0.17, -2.72],
        target: [ 5.37, -0.31, -4.33]
      },
      bathroom: {
        position: [0.86, 0.41, -1.97],
        target: [ 4.5, -1.49, 0.88]
      }
    }
  },
  {
    id: 3,
    name: "Luxury Penthouse Suite",
    description: "Exclusive penthouse with panoramic city views. Features a private terrace, premium appliances, and designer furnishings throughout.",
    pricePerNight: 199,
    capacity: 4,
    theme: "luxury",
    location: "Financial District",
    amenities: [
      "Free WiFi",
      "Full Kitchen",
      "Air Conditioning",
      "Private Terrace",
      "Gym Access",
      "Concierge Service",
      "Premium Linens",
      "Wine Fridge"
    ],
    galleryImages: [
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80",
      "https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=800&q=80"
    ],
    model3D: null,
    has3D: false,
    waypoints: {}
  },
  {
  id: 4,
  name: "Minimalistic Apartment",
  description: "Testing",
  pricePerNight: 150,
  capacity: 5,
  theme: "modern",
  location: "City Center",
  amenities: [
    "Free WiFi",
    "Full Kitchen",
    "Air Conditioning",
    "Room Bathrooms"
  ],
  galleryImages: [
    "/images/room4/room4-1.jpg",
    "/images/room4/room4-2.jpg",
    "/images/room4/room4-3.jpg"
  ],

  model3D: "/models/room4/source/apartment.glb",

  has3D: true,
  fixMaterials: false,
  enablePhysics: true,
  movableItems: [
    { id: 'pouf', label: 'Pouf', region: { min: [-0.75, 1.9], max: [-0.15, 2.5] } }
  ],

  waypoints: {
    livingRoom: {
      position: [-0.31, 0.07, 1.11],
      target: [-2.63, -0.98, 3.83]
    },
    kitchen: {
      position: [-0.52, 0.25, 2.6],
      target: [2.15, -0.9, 0.26]
    },
    bedroom1: {
      position: [1.19, -0.37, -1.9],
      target: [2.98, -1.53, -4.96]
    },
    bedroom2: {
      position: [-1.35, -0.31, -1.89],
      target: [-3.74, -1.27, -4.58]
    },
    bedroom3: {
      position: [-2.07, -0.25, -0.74],
      target: [-4.64, -1.47, 1.65]
    },
    bathroom1: {
      position: [0.86, -0.09, -2.91],
      target: [-2.53, -1.42, -3.7]
    },
    bathroom2: {
      position: [0.49, -0.01, -0.91],
      target: [3.38, -1.97, 0.38]
    }
  }
  
},
{
  id: 5,
  name: "Scandinavian Apartment",
  description: "Testing",
  pricePerNight: 70,
  capacity: 3,
  theme: "modern",
  location: "Province",
  amenities: [
    "Free WiFi",
    "Full Kitchen",
    "Air Conditioning",
    "Bathroom",
    "Livingroom Television"
  ],
  galleryImages: [
    "/images/room5/room5-1.png",
    "/images/room5/room5-2.png"
  ],

  model3D: "/models/room5/source/twokinds_modern_trio_apartment.glb",

  has3D: true,
  fixMaterials: false,
  enablePhysics: true,
    movableItems: [
      { id: 'coffee-table', label: 'Coffee Table', region: { min: [-1.5, -0.55], max: [-0.8, 0.3] } }
    ],

  waypoints: {
    kitchen: {
      position: [-2.62, -0.18, 0.32],
      target: [-3.76, -0.17, -1.44]
    },
    livingRoom: {
      position: [-0.89, -0.1, -0.16],
      target: [0.14, -0.56, -0.71]
    },
    bedroom1: {
      position: [1.84, -0.13, 1.38],
      target: [3.92, -0.11, 1.17]
    },
    bedroom2: {
      position: [3.23, -0.11, -0.93],
      target: [1.18, -0.41, -0.7]
    },
    bathroom: {
      position: [0.61, -0.0, 0.27],
      target: [1.18, -0.06, -1.75]
    }
  }
},
{
  id: 6,
  name: "Luxury Apartment",
  description: "Testing",
  pricePerNight: 200,
  capacity: 2,
  theme: "luxury",
  location: "Financial District",
  amenities: [
    "Free WiFi",
    "Air Conditioning",
    "Bathroom",
    "Livingroom Television"
  ],
  galleryImages: [
    "/images/room6/room6-1.jpg",
    "/images/room6/room6-2.jpg"
  ],

  model3D: "/models/room6/source/custom_brown_axminster_carpet_hotel_room (1).glb",

  has3D: true,
  fixMaterials: false,
  enablePhysics: true,
    movableItems: [
      { id: 'bed', label: 'Bed', region: { min: [0.85, -2.0], max: [2.65, -0.3] } }
    ],

  waypoints: {
    bedroom1: {
      position: [-1.49, -0.22, -0.53],
      target: [1.72, -0.71, -1.78]
    },
    bathroom: {
      position: [0.37, 0.1, 3.06],
      target: [3.37, -1.34, 2.06]
    }
  }
}
]

// Helper function to get a room by ID
export const getRoomById = (id) => {
  return rooms.find(room => room.id === parseInt(id))
}

// Helper function to get available rooms (for filtering later)
export const getAvailableRooms = () => {
  return rooms.filter(room => room.isActive !== false)
}
