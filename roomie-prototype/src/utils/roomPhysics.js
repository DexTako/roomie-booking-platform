import * as THREE from 'three'

// ---------------------------------------------------------------------------
// Room physics helpers for the 3D viewer.
//
// Everything here works in the viewer's WORLD space (the model is scaled to
// ~8 units and centred on the origin by RoomViewer).
//
//  1. Movable items: some models keep all their furniture merged in one big
//     mesh, so a single piece (e.g. one bed) is cut out of the mesh by finding
//     its connected pieces inside a region of the floor plan.
//  2. Collision: a top-down "blocked" grid is rasterised from the walls and
//     furniture. Items and the walking camera are tested against it so they
//     can no longer pass through walls.
// ---------------------------------------------------------------------------

export const GRID_CELL = 0.04

// ============================= GRID =========================================

export function createGrid(minX, maxX, minZ, maxZ, cell = GRID_CELL) {
  const nx = Math.ceil((maxX - minX) / cell) + 1
  const nz = Math.ceil((maxZ - minZ) / cell) + 1
  return { minX, minZ, maxX, maxZ, cell, nx, nz, data: new Uint8Array(nx * nz), sat: null }
}

function markCell(g, x, z) {
  const i = Math.floor((x - g.minX) / g.cell)
  const k = Math.floor((z - g.minZ) / g.cell)
  if (i >= 0 && i < g.nx && k >= 0 && k < g.nz) g.data[k * g.nx + i] = 1
}

function markSegment(g, x0, z0, x1, z1) {
  const len = Math.hypot(x1 - x0, z1 - z0)
  const steps = Math.max(1, Math.ceil(len / (g.cell * 0.5)))
  for (let s = 0; s <= steps; s++) {
    const t = s / steps
    markCell(g, x0 + (x1 - x0) * t, z0 + (z1 - z0) * t)
  }
}

// Mark every cell touched by a triangle projected onto the floor plan.
// Edges are always marked, so vertical walls (which project to a line) count.
export function rasterizeTriangle(g, ax, az, bx, bz, cx, cz) {
  markSegment(g, ax, az, bx, bz)
  markSegment(g, bx, bz, cx, cz)
  markSegment(g, cx, cz, ax, az)

  const minX = Math.min(ax, bx, cx), maxX = Math.max(ax, bx, cx)
  const minZ = Math.min(az, bz, cz), maxZ = Math.max(az, bz, cz)
  const i0 = Math.max(0, Math.floor((minX - g.minX) / g.cell))
  const i1 = Math.min(g.nx - 1, Math.floor((maxX - g.minX) / g.cell))
  const k0 = Math.max(0, Math.floor((minZ - g.minZ) / g.cell))
  const k1 = Math.min(g.nz - 1, Math.floor((maxZ - g.minZ) / g.cell))
  if (i1 - i0 < 1 && k1 - k0 < 1) return

  const denom = (bz - cz) * (ax - cx) + (cx - bx) * (az - cz)
  if (Math.abs(denom) < 1e-12) return // degenerate in plan view (a wall): edges already marked
  for (let k = k0; k <= k1; k++) {
    const pz = g.minZ + (k + 0.5) * g.cell
    for (let i = i0; i <= i1; i++) {
      const px = g.minX + (i + 0.5) * g.cell
      const w1 = ((bz - cz) * (px - cx) + (cx - bx) * (pz - cz)) / denom
      const w2 = ((cz - az) * (px - cx) + (ax - cx) * (pz - cz)) / denom
      const w3 = 1 - w1 - w2
      if (w1 >= 0 && w2 >= 0 && w3 >= 0) g.data[k * g.nx + i] = 1
    }
  }
}

// Rasterise every triangle (of the given meshes) that overlaps the height band [yLo, yHi]
export function rasterizeMeshes(g, meshes, yLo, yHi) {
  const v = new THREE.Vector3()
  const box = new THREE.Box3()
  for (const mesh of meshes) {
    if (!mesh.isMesh || !mesh.geometry || mesh.visible === false) continue
    const posAttr = mesh.geometry.attributes.position
    if (!posAttr) continue

    mesh.updateWorldMatrix(true, false)
    box.setFromObject(mesh)
    if (box.max.y < yLo || box.min.y > yHi) continue
    if (box.max.x < g.minX || box.min.x > g.maxX || box.max.z < g.minZ || box.min.z > g.maxZ) continue

    const n = posAttr.count
    const wp = new Float32Array(n * 3)
    for (let i = 0; i < n; i++) {
      v.fromBufferAttribute(posAttr, i).applyMatrix4(mesh.matrixWorld)
      wp[i * 3] = v.x; wp[i * 3 + 1] = v.y; wp[i * 3 + 2] = v.z
    }
    rasterizeWorldPositions(g, wp, mesh.geometry.index ? mesh.geometry.index.array : null, yLo, yHi)
  }
}

// Clip a triangle to the height band [yLo, yHi] and return the remaining polygon
// (as [x, z] pairs). Sloped or tilted triangles then only block the part of the
// floor plan they really occupy inside the band, instead of their whole outline.
function clipTriangleToBand(ax, ay, az, bx, by, bz, cx, cy, cz, yLo, yHi) {
  let poly = [[ax, ay, az], [bx, by, bz], [cx, cy, cz]]
  const clip = (pts, keep, edgeY) => {
    const out = []
    for (let i = 0; i < pts.length; i++) {
      const p = pts[i], q = pts[(i + 1) % pts.length]
      const pin = keep(p[1]), qin = keep(q[1])
      if (pin) out.push(p)
      if (pin !== qin) {
        const t = (edgeY - p[1]) / (q[1] - p[1])
        out.push([p[0] + (q[0] - p[0]) * t, edgeY, p[2] + (q[2] - p[2]) * t])
      }
    }
    return out
  }
  poly = clip(poly, (y) => y >= yLo, yLo)
  if (poly.length >= 2) poly = clip(poly, (y) => y <= yHi, yHi)
  return poly
}

// Pure version (typed arrays in, grid out) so it can be unit tested
export function rasterizeWorldPositions(g, wp, index, yLo, yHi) {
  const triCount = index ? Math.floor(index.length / 3) : Math.floor(wp.length / 9)
  for (let t = 0; t < triCount; t++) {
    const a = index ? index[t * 3] : t * 3
    const b = index ? index[t * 3 + 1] : t * 3 + 1
    const c = index ? index[t * 3 + 2] : t * 3 + 2
    const ya = wp[a * 3 + 1], yb = wp[b * 3 + 1], yc = wp[c * 3 + 1]
    const lo = Math.min(ya, yb, yc), hi = Math.max(ya, yb, yc)
    if (hi < yLo || lo > yHi) continue

    if (lo >= yLo && hi <= yHi) {
      rasterizeTriangle(g, wp[a * 3], wp[a * 3 + 2], wp[b * 3], wp[b * 3 + 2], wp[c * 3], wp[c * 3 + 2])
      continue
    }
    const poly = clipTriangleToBand(
      wp[a * 3], ya, wp[a * 3 + 2],
      wp[b * 3], yb, wp[b * 3 + 2],
      wp[c * 3], yc, wp[c * 3 + 2],
      yLo, yHi
    )
    if (poly.length < 3) {
      // Degenerate sliver (e.g. a vertical wall cut by the band): mark its outline
      for (let i = 0; i < poly.length; i++) {
        const p = poly[i], q = poly[(i + 1) % poly.length]
        markSegment(g, p[0], p[2], q[0], q[2])
      }
      continue
    }
    for (let i = 1; i < poly.length - 1; i++) {
      rasterizeTriangle(g, poly[0][0], poly[0][2], poly[i][0], poly[i][2], poly[i + 1][0], poly[i + 1][2])
    }
  }
}

// Summed-area table so "is anything blocked inside this rectangle?" is O(1)
export function finalizeGrid(g) {
  const w = g.nx + 1
  const sat = new Int32Array(w * (g.nz + 1))
  for (let k = 0; k < g.nz; k++) {
    let row = 0
    for (let i = 0; i < g.nx; i++) {
      row += g.data[k * g.nx + i]
      sat[(k + 1) * w + (i + 1)] = sat[k * w + (i + 1)] + row
    }
  }
  g.sat = sat
  return g
}

// True if any wall/furniture lies inside the rectangle (or it leaves the grid)
export function rectBlocked(g, minX, maxX, minZ, maxZ) {
  let i0 = Math.floor((minX - g.minX) / g.cell)
  let i1 = Math.floor((maxX - g.minX) / g.cell)
  let k0 = Math.floor((minZ - g.minZ) / g.cell)
  let k1 = Math.floor((maxZ - g.minZ) / g.cell)
  if (i0 < 0 || k0 < 0 || i1 >= g.nx || k1 >= g.nz) return true
  const w = g.nx + 1
  const s = g.sat
  const total = s[(k1 + 1) * w + (i1 + 1)] - s[k0 * w + (i1 + 1)] - s[(k1 + 1) * w + i0] + s[k0 * w + i0]
  return total > 0
}

// ======================= CONNECTED PIECES ===================================

// Groups the triangles of a mesh into connected pieces. Vertices that sit at the
// same position are welded first (exported models often duplicate vertices).
export function triangleComponents(wp, index, tol = 1e-4) {
  const n = Math.floor(wp.length / 3)
  const triCount = index ? Math.floor(index.length / 3) : Math.floor(n / 3)
  const keyToId = new Map()
  const weld = new Int32Array(n)
  for (let i = 0; i < n; i++) {
    const key = `${Math.round(wp[i * 3] / tol)},${Math.round(wp[i * 3 + 1] / tol)},${Math.round(wp[i * 3 + 2] / tol)}`
    let id = keyToId.get(key)
    if (id === undefined) { id = keyToId.size; keyToId.set(key, id) }
    weld[i] = id
  }
  const parent = new Int32Array(keyToId.size)
  for (let i = 0; i < parent.length; i++) parent[i] = i
  const find = (x) => {
    while (parent[x] !== x) { parent[x] = parent[parent[x]]; x = parent[x] }
    return x
  }
  const union = (a, b) => {
    const ra = find(a), rb = find(b)
    if (ra !== rb) parent[ra] = rb
  }
  const triVert = (t, k) => (index ? index[t * 3 + k] : t * 3 + k)
  for (let t = 0; t < triCount; t++) {
    const a = weld[triVert(t, 0)], b = weld[triVert(t, 1)], c = weld[triVert(t, 2)]
    union(a, b); union(b, c)
  }
  const rootToComp = new Map()
  const triComp = new Int32Array(triCount)
  for (let t = 0; t < triCount; t++) {
    const r = find(weld[triVert(t, 0)])
    let c = rootToComp.get(r)
    if (c === undefined) { c = rootToComp.size; rootToComp.set(r, c) }
    triComp[t] = c
  }
  return { triComp, count: rootToComp.size, triCount }
}

// Connected pieces of a mesh with their bounding boxes (world space)
export function analyzeMeshPieces(wp, index) {
  const { triComp, count, triCount } = triangleComponents(wp, index)
  const lo = new Float32Array(count * 3).fill(Infinity)
  const hi = new Float32Array(count * 3).fill(-Infinity)
  for (let t = 0; t < triCount; t++) {
    const c = triComp[t]
    for (let k = 0; k < 3; k++) {
      const v = index ? index[t * 3 + k] : t * 3 + k
      for (let d = 0; d < 3; d++) {
        const val = wp[v * 3 + d]
        if (val < lo[c * 3 + d]) lo[c * 3 + d] = val
        if (val > hi[c * 3 + d]) hi[c * 3 + d] = val
      }
    }
  }
  return { triComp, count, triCount, lo, hi, chosen: new Uint8Array(count) }
}

// Pass 1: pick the pieces that make up the item described by `region`
// (centre inside the region, not sticking out far, furniture-sized and standing
// on the floor). Returns the combined bounding box of what was picked.
export function pickPiecesInRegion(meshInfos, region, floorY, opts = {}) {
  const margin = opts.margin ?? 0.2
  const maxAbove = opts.maxAbove ?? 1.1
  const minAbove = opts.minAbove ?? -0.05
  const [rx0, rz0] = region.min
  const [rx1, rz1] = region.max
  const box = new THREE.Box3()
  let any = false
  for (const info of meshInfos) {
    const { lo, hi, count, chosen } = info
    for (let c = 0; c < count; c++) {
      const cx = (lo[c * 3] + hi[c * 3]) / 2
      const cz = (lo[c * 3 + 2] + hi[c * 3 + 2]) / 2
      if (cx < rx0 || cx > rx1 || cz < rz0 || cz > rz1) continue
      if (lo[c * 3] < rx0 - margin || hi[c * 3] > rx1 + margin) continue
      if (lo[c * 3 + 2] < rz0 - margin || hi[c * 3 + 2] > rz1 + margin) continue
      if (hi[c * 3 + 1] - floorY > maxAbove || lo[c * 3 + 1] - floorY < minAbove) continue
      chosen[c] = 1
      box.expandByPoint(new THREE.Vector3(lo[c * 3], lo[c * 3 + 1], lo[c * 3 + 2]))
      box.expandByPoint(new THREE.Vector3(hi[c * 3], hi[c * 3 + 1], hi[c * 3 + 2]))
      any = true
    }
  }
  return any ? box : null
}

// Pass 2: pillows, lamps and cushions are separate pieces sitting on or next to
// the item. Claim every small piece whose centre lies inside the item's box.
export function claimPiecesInsideBox(meshInfos, box, floorY) {
  const size = box.getSize(new THREE.Vector3())
  let added = 0
  for (const info of meshInfos) {
    const { lo, hi, count, chosen } = info
    for (let c = 0; c < count; c++) {
      if (chosen[c]) continue
      const cx = (lo[c * 3] + hi[c * 3]) / 2
      const cy = (lo[c * 3 + 1] + hi[c * 3 + 1]) / 2
      const cz = (lo[c * 3 + 2] + hi[c * 3 + 2]) / 2
      if (cx < box.min.x || cx > box.max.x || cz < box.min.z || cz > box.max.z) continue
      if (cy < floorY + 0.02 || cy > box.max.y + 0.05) continue
      if (hi[c * 3] - lo[c * 3] > size.x + 0.05) continue
      if (hi[c * 3 + 1] - lo[c * 3 + 1] > size.y + 0.05) continue
      if (hi[c * 3 + 2] - lo[c * 3 + 2] > size.z + 0.05) continue
      chosen[c] = 1
      added++
    }
  }
  return added
}

// ======================== MOVABLE ITEMS =====================================

function worldPositions(mesh) {
  const pos = mesh.geometry.attributes.position
  const v = new THREE.Vector3()
  const wp = new Float32Array(pos.count * 3)
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i).applyMatrix4(mesh.matrixWorld)
    wp[i * 3] = v.x; wp[i * 3 + 1] = v.y; wp[i * 3 + 2] = v.z
  }
  return wp
}

function cloneMaterials(mesh) {
  mesh.material = Array.isArray(mesh.material)
    ? mesh.material.map(m => m.clone())
    : mesh.material.clone()
}

// Build a new mesh from the selected triangles of `mesh` and remove them from it
function splitMesh(mesh, triComp, chosen, triCount) {
  const geo = mesh.geometry
  const index = geo.index ? geo.index.array : null
  const vertOf = (t, k) => (index ? index[t * 3 + k] : t * 3 + k)

  const selected = []
  const remaining = []
  for (let t = 0; t < triCount; t++) (chosen[triComp[t]] ? selected : remaining).push(t)

  const newGeo = new THREE.BufferGeometry()
  for (const name of Object.keys(geo.attributes)) {
    const src = geo.attributes[name]
    const size = src.itemSize
    const arr = new src.array.constructor(selected.length * 3 * size)
    let o = 0
    for (const t of selected) {
      for (let k = 0; k < 3; k++) {
        const v = vertOf(t, k)
        for (let d = 0; d < size; d++) arr[o++] = src.array[v * size + d]
      }
    }
    newGeo.setAttribute(name, new THREE.BufferAttribute(arr, size, src.normalized))
  }

  const part = new THREE.Mesh(newGeo, mesh.material)
  part.name = `${mesh.name || 'mesh'}_part`
  part.castShadow = true
  part.receiveShadow = true
  part.matrixAutoUpdate = false
  part.matrix.copy(mesh.matrixWorld)

  // The original mesh keeps only the triangles that were not taken.
  // Clone first: geometry can be shared with other meshes in the file.
  const keepGeo = geo.clone()
  const keep = new Uint32Array(remaining.length * 3)
  let o = 0
  for (const t of remaining) for (let k = 0; k < 3; k++) keep[o++] = vertOf(t, k)
  keepGeo.setIndex(new THREE.BufferAttribute(keep, 1))
  keepGeo.clearGroups()
  mesh.geometry = keepGeo

  return part
}

// Cut one movable item out of the scene. `cfg` is one entry of a room's
// movableItems list: either { meshName } or { region: { min:[x,z], max:[x,z] } }.
// Returns { group, id, label, baseBox } where `group` sits at the world origin
// (move it with group.position) or null if nothing matched.
export function extractMovableItem(scene, cfg, floorY) {
  scene.updateMatrixWorld(true)
  const group = new THREE.Group()
  group.name = `movable_${cfg.id}`
  const parts = []

  if (cfg.meshName) {
    const needle = cfg.meshName.toLowerCase()
    let found = null
    scene.traverse((o) => {
      if (!found && o.isMesh && (o.name || '').toLowerCase().includes(needle)) found = o
    })
    if (found) parts.push({ mesh: found })
  } else if (cfg.region) {
    const margin = cfg.margin ?? 0.2
    const box = new THREE.Box3()
    const infos = []
    scene.traverse((o) => {
      if (!o.isMesh || !o.geometry || !o.geometry.attributes.position) return
      if (Array.isArray(o.material)) return
      box.setFromObject(o)
      if (
        box.max.x < cfg.region.min[0] - margin || box.min.x > cfg.region.max[0] + margin ||
        box.max.z < cfg.region.min[1] - margin || box.min.z > cfg.region.max[1] + margin
      ) return
      const wp = worldPositions(o)
      const index = o.geometry.index ? o.geometry.index.array : null
      infos.push({ mesh: o, ...analyzeMeshPieces(wp, index) })
    })

    let itemBox = pickPiecesInRegion(infos, cfg.region, floorY, cfg)
    if (itemBox) {
      // two passes so pieces that touch the first claimed ones are included too
      for (let pass = 0; pass < 2; pass++) {
        if (claimPiecesInsideBox(infos, itemBox, floorY) === 0) break
        itemBox = new THREE.Box3()
        for (const info of infos) {
          for (let c = 0; c < info.count; c++) {
            if (!info.chosen[c]) continue
            itemBox.expandByPoint(new THREE.Vector3(info.lo[c * 3], info.lo[c * 3 + 1], info.lo[c * 3 + 2]))
            itemBox.expandByPoint(new THREE.Vector3(info.hi[c * 3], info.hi[c * 3 + 1], info.hi[c * 3 + 2]))
          }
        }
      }
    }
    for (const info of infos) {
      let n = 0
      for (let c = 0; c < info.count; c++) n += info.chosen[c]
      if (n === 0) continue
      if (n === info.count) parts.push({ mesh: info.mesh })
      else parts.push({ mesh: info.mesh, sel: { triComp: info.triComp, chosen: info.chosen, triCount: info.triCount } })
    }
  }

  if (parts.length === 0) return null

  for (const { mesh, sel } of parts) {
    if (sel) {
      const part = splitMesh(mesh, sel.triComp, sel.chosen, sel.triCount)
      cloneMaterials(part)
      group.add(part)
    } else {
      cloneMaterials(mesh)
      group.attach(mesh) // keeps its world placement
    }
  }

  group.updateMatrixWorld(true)
  const baseBox = new THREE.Box3().setFromObject(group)
  return { id: cfg.id, label: cfg.label || cfg.id, group, baseBox }
}

// ======================= COLLISION QUERIES ==================================

// Everything outside the model's footprint counts as solid (some models have
// open edges), so nothing can be pushed out of the apartment.
function blockOutside(g, bounds) {
  for (let k = 0; k < g.nz; k++) {
    const z = g.minZ + (k + 0.5) * g.cell
    for (let i = 0; i < g.nx; i++) {
      const x = g.minX + (i + 0.5) * g.cell
      if (x < bounds.min.x || x > bounds.max.x || z < bounds.min.z || z > bounds.max.z) g.data[k * g.nx + i] = 1
    }
  }
}

// Static obstacles (walls, other furniture) as a grid for one movable item
export function buildItemGrid(scene, item, bounds) {
  const g = createGrid(bounds.min.x - 0.1, bounds.max.x + 0.1, bounds.min.z - 0.1, bounds.max.z + 0.1)
  const yLo = item.baseBox.min.y + 0.06
  const yHi = Math.max(item.baseBox.max.y - 0.02, yLo + 0.05)
  const meshes = []
  scene.traverse(o => { if (o.isMesh) meshes.push(o) })
  rasterizeMeshes(g, meshes, yLo, yHi)
  blockOutside(g, bounds)

  // Whatever overlaps the item where it starts belongs to its surroundings
  // (bedside tables, wall panels...). Clear the starting footprint so the item
  // can always leave it; everything outside it still blocks.
  const b = item.baseBox
  const i0 = Math.max(0, Math.floor((b.min.x - g.minX) / g.cell))
  const i1 = Math.min(g.nx - 1, Math.floor((b.max.x - g.minX) / g.cell))
  const k0 = Math.max(0, Math.floor((b.min.z - g.minZ) / g.cell))
  const k1 = Math.min(g.nz - 1, Math.floor((b.max.z - g.minZ) / g.cell))
  for (let k = k0; k <= k1; k++) for (let i = i0; i <= i1; i++) g.data[k * g.nx + i] = 0
  finalizeGrid(g)

  return { grid: g, shrink: 0.02, valid: true }
}

export function itemFits(item, phys, x, z) {
  const b = item.baseBox
  const s = phys.shrink
  return !rectBlocked(phys.grid, b.min.x + x + s, b.max.x + x - s, b.min.z + z + s, b.max.z + z - s)
}

// Move an item from its current offset towards (wantX, wantZ). Advances in small
// steps from where it actually is, slides along walls on whichever axis is still
// free, and stops when it cannot make progress. It can never jump over a wall.
export function moveItemWithCollision(item, phys, fromX, fromZ, wantX, wantZ) {
  if (!phys || !phys.valid) return { x: wantX, z: wantZ }
  const STEP = 0.03
  let x = fromX, z = fromZ
  for (let iter = 0; iter < 800; iter++) {
    const rx = wantX - x, rz = wantZ - z
    const d = Math.hypot(rx, rz)
    if (d < 1e-4) break
    const step = Math.min(d, STEP)
    const nx = x + (rx / d) * step, nz = z + (rz / d) * step
    if (itemFits(item, phys, nx, nz)) { x = nx; z = nz; continue }
    // Blocked: slide along the wall on whichever axis is still free
    const sx = Math.sign(rx) * Math.min(Math.abs(rx), step)
    const sz = Math.sign(rz) * Math.min(Math.abs(rz), step)
    if (Math.abs(rx) > 1e-6 && itemFits(item, phys, x + sx, z)) { x += sx; continue }
    if (Math.abs(rz) > 1e-6 && itemFits(item, phys, x, z + sz)) { z += sz; continue }
    break
  }
  return { x, z }
}

// Walls and tall furniture at body height for the walking camera.
// Models are scaled differently, so the band is a fraction of the room height.
export function buildWalkGrid(scene, bounds) {
  const g = createGrid(bounds.min.x - 0.1, bounds.max.x + 0.1, bounds.min.z - 0.1, bounds.max.z + 0.1)
  const height = bounds.max.y - bounds.min.y
  const meshes = []
  scene.traverse(o => { if (o.isMesh) meshes.push(o) })
  rasterizeMeshes(g, meshes, bounds.min.y + height * 0.42, bounds.min.y + height * 0.72)
  blockOutside(g, bounds)
  finalizeGrid(g)
  g.walkRadius = height * 0.05
  return g
}

export function walkPositionFree(grid, x, z, r = grid.walkRadius ?? 0.1) {
  return !rectBlocked(grid, x - r, x + r, z - r, z + r)
}

// Closest free spot to (x, z): searches outwards in rings (used to put the camera
// somewhere valid when it starts inside a wall or outside the apartment)
export function findNearestFree(grid, x, z, maxRadius = 6) {
  if (walkPositionFree(grid, x, z)) return { x, z }
  const step = grid.cell * 2
  for (let r = step; r <= maxRadius; r += step) {
    const points = Math.max(8, Math.ceil((2 * Math.PI * r) / step))
    for (let i = 0; i < points; i++) {
      const a = (i / points) * Math.PI * 2
      const px = x + Math.cos(a) * r
      const pz = z + Math.sin(a) * r
      if (walkPositionFree(grid, px, pz)) return { x: px, z: pz }
    }
  }
  return { x, z }
}

// Move the camera horizontally by (dx, dz) but never into a wall. Slides along
// walls. A camera that starts inside a wall is first moved to the nearest free spot.
export function moveWalkerWithCollision(grid, x, z, dx, dz) {
  if (!grid) return { x: x + dx, z: z + dz }
  if (!walkPositionFree(grid, x, z)) {
    const spot = findNearestFree(grid, x, z)
    x = spot.x
    z = spot.z
  }
  const dist = Math.hypot(dx, dz)
  const steps = Math.max(1, Math.ceil(dist / 0.03))
  let cx = x, cz = z
  for (let s = 0; s < steps; s++) {
    const sx = dx / steps, sz = dz / steps
    if (walkPositionFree(grid, cx + sx, cz + sz)) { cx += sx; cz += sz; continue }
    if (sx !== 0 && walkPositionFree(grid, cx + sx, cz)) { cx += sx; continue }
    if (sz !== 0 && walkPositionFree(grid, cx, cz + sz)) { cz += sz; continue }
    break
  }
  return { x: cx, z: cz }
}
