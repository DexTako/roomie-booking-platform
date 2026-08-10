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
