# How to add a movable item to a 3D room

Movable items are listed per room in `src/data/rooms.js`, under `movableItems`:

```js
movableItems: [
  { id: 'bed',   label: 'Bed',       region: { min: [0.0, -1.3], max: [1.62, 0.35] } },
  { id: 'trash', label: 'Trash Bin', meshName: 'trashcontainer' }
],
```

| Field | Meaning |
|-------|---------|
| `id` | Unique name inside that room (letters, numbers, dashes) |
| `label` | Shown in the on-screen hint ("Drag the glowing bed to move it") |
| `meshName` **or** `region` | How to find the piece in the model (see below) |

Items stop at walls, at furniture and at each other. "Reset Furniture" puts them all back.
`enablePhysics: true` must be set on the room (it already is for rooms 1, 2, 4, 5 and 6).

## Easiest way: pick it in the viewer

1. Open the room page with `?debug=true` added to the address, then start the 3D tour.
2. Hold **Alt** and click a piece of furniture (the click looks through ceilings and walls to the first real piece).
3. The **Add a movable item** panel (bottom left) shows one or two ready-made lines. Press **Copy** and paste it into `movableItems` in `rooms.js`.
4. Change `id` and `label`, save, refresh. The piece now glows blue and can be dragged.

Which line to use:

- **By mesh name** is shown when the model gives the piece its own descriptive name (like `fridge` in room 2).
  If a mesh is part of a bigger named object (a fridge door, table legs), the panel gives you the whole object.
  Names are exactly as the browser loads them: dots are removed and spaces become underscores (`cabinet.002` is `cabinet002`).
- **By area** works on every model. The numbers are a rectangle on the floor plan (`[x, z]` corners in the viewer's units).
  Use it when furniture is merged into one big mesh, as in rooms 1, 4, 5 and 6. The piece is cut out automatically.

## Tips

- Choose things that **stand on the floor** with free space around them (chairs, stools, tables, beds, bins).
  Wall units and pieces welded into a corner barely move.
- If the panel warns the piece is **very large** or **not standing on the floor**, you clicked a wall, a ceiling or a hanging item. Click lower, or write the `region` around the furniture by hand.
- Two items that start touching are ignored by each other, so nothing gets stuck.
- If the browser console says `Movable item "..." not found`, nothing matched. Use the picker again.
- Room 3 has `model3D: null`, so it has no 3D room to add items to.
