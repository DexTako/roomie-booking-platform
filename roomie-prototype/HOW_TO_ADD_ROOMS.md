# 🏠 How to Add New Rooms

Quick guide for adding new rooms to the platform.

## Step 1: Prepare Your Assets

### 3D Model (Optional)
- Export as `.glb` format from Blender/3D software
- Place in: `public/models/your-room-name.glb`
- Keep file size under 10MB if possible

### Images (Required)
- Take 5-8 photos of the room
- Recommended size: 1920x1080px
- Place in: `public/images/roomX/` (create new folder)

## Step 2: Add Room Data

Edit `src/data/rooms.js`:

```javascript
{
  id: 4, // Next available ID
  name: "Cozy Beach House",
  description: "Beautiful oceanfront property with stunning sunset views",
  price: 150, // Price per night
  location: "Malibu, California",
  capacity: 4, // Max guests
  bedrooms: 2,
  bathrooms: 2,
  
  // Room images
  images: [
    '/images/room4/livingroom.jpg',
    '/images/room4/bedroom.jpg',
    '/images/room4/kitchen.jpg',
    '/images/room4/bathroom.jpg',
    '/images/room4/exterior.jpg'
  ],
  
  // Amenities
  amenities: [
    'WiFi',
    'Kitchen',
    'Parking',
    'Air Conditioning',
    'Ocean View',
    'Beach Access'
  ],
  
  // 3D Model Configuration
  has3DView: true, // Set to false if no 3D model
  modelPath: '/models/beach-house.glb',
  
  modelConfig: {
    scale: 1.0,           // Adjust if model is too big/small
    position: [0, 0, 0],  // [x, y, z] position
    rotation: [0, 0, 0],  // [x, y, z] rotation in radians
    cameraDistance: 15    // How far camera starts from model
  }
}
```

## Step 3: Test Your Room

1. Save the file
2. Refresh browser
3. Check homepage - new room should appear
4. Click on room to test detail page
5. Test 3D viewer if model added
6. Test booking form

## Common Issues

### Model not loading
- Check file path matches exactly
- Ensure GLB file is in `public/models/`
- Check browser console for errors
- Try adjusting `scale` in modelConfig

### Model too big/small
```javascript
modelConfig: {
  scale: 0.5, // Make smaller
  // or
  scale: 2.0, // Make bigger
}
```

### Model positioned wrong
```javascript
modelConfig: {
  position: [0, -2, 0], // Move down 2 units
}
```

### Model rotated wrong
```javascript
modelConfig: {
  rotation: [0, Math.PI, 0], // Rotate 180° on Y-axis
}
```

## Tips

- Use high-quality images (good lighting, clean composition)
- Be honest about amenities
- Set competitive pricing
- Test 3D viewer on different browsers
- Keep descriptions concise but informative

## Need Help?

Check the main `README.md` or ask in the group chat!
