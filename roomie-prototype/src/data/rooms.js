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

  waypoints: {
    livingRoom:{
      position: [19.25,1.23,-15.37],
      target: [16.13,-0.18,-11.72]
    },
    kitchen:{
      position: [18.97,1.47,-13.37],
      target: [22.55,-0.07,-16.51]
    },
    bedroom1:{
      position: [21.26,0.64,-19.41],
      target: [23.67,-0.91,-23.52]
    },
    bedroom2:{
      position: [17.85,0.73,-19.4],
      target: [14.64,-0.56,-23.01]
    },
    bedroom3:{
      position: [16.89,0.81,-17.85],
      target: [13.43,-0.83,-14.64]
    },
    bathroom1:{
      position: [20.82,1.02,-20.76],
      target: [16.27,-0.76,-21.82]
    },
    bathroom2:{
      position: [20.32,1.12,-18.08],
      target: [24.2,-1.5,-16.35]
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

  waypoints: {
    kitchen: {
      position: [-6.6,0.91,2.46],
      target: [-9.32,0.94,-1.73]
      },
    livingRoom: {
      position: [-2.45,1.1,1.33],
      target: [0,0,0]
      },
   bedroom1: {
      position: [4.07,1.03,5],
      target: [9.04,1.08,4.5]
      },
    bedroom2: {
      position: [7.4,1.08,-0.52],
      target: [2.48,0.37,0.04]
      },
    bathroom: {
      position: [1.13,1.34,2.34],
      target: [2.48,1.2,-2.47]
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

  waypoints: {
   bedroom1:{
      position: [9.4,0.87,-7.81],
      target: [14.01,0.16,-9.61]
    },
    bathroom: {
      position: [12.06,1.33,-2.66],
      target: [16.38,-0.74,-4.09]
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
