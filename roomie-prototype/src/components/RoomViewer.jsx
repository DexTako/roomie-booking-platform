import { Suspense, useEffect, useState, useRef, useCallback } from 'react'
import { Canvas, useThree, useFrame } from '@react-three/fiber'
import { OrbitControls, PointerLockControls, useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import {
  extractMovableItem,
  buildItemGrid,
  buildWalkGrid,
  moveItemWithCollision,
  moveWalkerWithCollision,
  walkPositionFree,
  findNearestFree,
  linkItems,
  describePieceAt
} from '../utils/roomPhysics'

// Walk mode controls component
function WalkControls({ moveSpeed, enabled, onCoordinateUpdate, walkGrid, bounds }) {
  const { camera } = useThree()
  const moveState = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
    up: false,
    down: false
  })
  const velocity = useRef(new THREE.Vector3()) // For smooth acceleration
  const lastKeyTime = useRef(0)
  const coordinateUpdateTimeout = useRef(null)

  const updateCoordinatesDebounced = () => {
    if (coordinateUpdateTimeout.current) {
      clearTimeout(coordinateUpdateTimeout.current)
    }
    
    coordinateUpdateTimeout.current = setTimeout(() => {
      const direction = new THREE.Vector3()
      camera.getWorldDirection(direction)
      const lookTarget = camera.position.clone().add(direction.multiplyScalar(5))
      
      if (onCoordinateUpdate) {
        onCoordinateUpdate(camera.position, lookTarget)
      }
    }, 300)
  }

  useEffect(() => {
    if (!enabled) return

    const handleKeyDown = (e) => {
      lastKeyTime.current = Date.now()
      
      switch (e.key.toLowerCase()) {
        case 'w':
        case 'arrowup':
          moveState.current.forward = true
          break
        case 's':
        case 'arrowdown':
          moveState.current.backward = true
          break
        case 'a':
        case 'arrowleft':
          moveState.current.left = true
          break
        case 'd':
        case 'arrowright':
          moveState.current.right = true
          break
        case 'e':
        case ' ':
          moveState.current.up = true
          break
        case 'q':
        case 'shift':
          moveState.current.down = true
          break
      }
    }

    const handleKeyUp = (e) => {
      switch (e.key.toLowerCase()) {
        case 'w':
        case 'arrowup':
          moveState.current.forward = false
          break
        case 's':
        case 'arrowdown':
          moveState.current.backward = false
          break
        case 'a':
        case 'arrowleft':
          moveState.current.left = false
          break
        case 'd':
        case 'arrowright':
          moveState.current.right = false
          break
        case 'e':
        case ' ':
          moveState.current.up = false
          break
        case 'q':
        case 'shift':
          moveState.current.down = false
          break
      }
      
      updateCoordinatesDebounced()
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      if (coordinateUpdateTimeout.current) {
        clearTimeout(coordinateUpdateTimeout.current)
      }
    }
  }, [enabled])

  useFrame((state, delta) => {
    if (!enabled) return

    const acceleration = 0.8 // How quickly to reach max speed
    const damping = 0.85 // How quickly to slow down when key released
    const maxSpeed = moveSpeed * delta * 60

    // Calculate target velocity based on input
    const targetVelocity = new THREE.Vector3()
    const direction = new THREE.Vector3()
    camera.getWorldDirection(direction)
    const forward = direction.clone()
    const right = new THREE.Vector3()
    right.crossVectors(camera.up, forward).normalize()

    let hasInput = false

    if (moveState.current.forward) {
      targetVelocity.addScaledVector(forward, maxSpeed)
      hasInput = true
    }
    if (moveState.current.backward) {
      targetVelocity.addScaledVector(forward, -maxSpeed)
      hasInput = true
    }
    if (moveState.current.left) {
      targetVelocity.addScaledVector(right, maxSpeed)
      hasInput = true
    }
    if (moveState.current.right) {
      targetVelocity.addScaledVector(right, -maxSpeed)
      hasInput = true
    }
    if (moveState.current.up) {
      targetVelocity.y += maxSpeed
      hasInput = true
    }
    if (moveState.current.down) {
      targetVelocity.y -= maxSpeed
      hasInput = true
    }

    // Smooth acceleration/deceleration
    if (hasInput) {
      velocity.current.lerp(targetVelocity, acceleration)
      lastKeyTime.current = Date.now()
    } else {
      velocity.current.multiplyScalar(damping) // Gradual slowdown
    }

    // Apply velocity: horizontal movement is stopped by walls, vertical movement
    // is kept between the floor and the ceiling.
    const v = velocity.current
    if (walkGrid) {
      const r = moveWalkerWithCollision(walkGrid, camera.position.x, camera.position.z, v.x, v.z)
      camera.position.x = r.x
      camera.position.z = r.z
    } else {
      camera.position.x += v.x
      camera.position.z += v.z
    }
    let nextY = camera.position.y + v.y
    if (bounds) {
      const height = bounds.max.y - bounds.min.y
      nextY = Math.min(bounds.max.y - height * 0.05, Math.max(bounds.min.y + height * 0.15, nextY))
    }
    camera.position.y = nextY
  })

  return null
}

// Mobile touch camera control for walk mode
function MobileTouchCamera({ enabled }) {
  const { camera, gl } = useThree()
  const [lastTouch, setLastTouch] = useState(null)
  const euler = useRef(new THREE.Euler(0, 0, 0, 'YXZ'))
  
  useEffect(() => {
    if (!enabled) return
    
    const canvas = gl.domElement
    const sensitivity = 0.002
    
    const handleTouchStart = (e) => {
      if (e.touches.length === 1) {
        setLastTouch({
          x: e.touches[0].clientX,
          y: e.touches[0].clientY
        })
      }
    }
    
    const handleTouchMove = (e) => {
      if (e.touches.length === 1 && lastTouch) {
        const deltaX = e.touches[0].clientX - lastTouch.x
        const deltaY = e.touches[0].clientY - lastTouch.y
        
        euler.current.setFromQuaternion(camera.quaternion)
        euler.current.y -= deltaX * sensitivity
        euler.current.x -= deltaY * sensitivity
        euler.current.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, euler.current.x))
        
        camera.quaternion.setFromEuler(euler.current)
        
        setLastTouch({
          x: e.touches[0].clientX,
          y: e.touches[0].clientY
        })
      }
    }
    
    const handleTouchEnd = () => {
      setLastTouch(null)
    }
    
    canvas.addEventListener('touchstart', handleTouchStart, { passive: true })
    canvas.addEventListener('touchmove', handleTouchMove, { passive: true })
    canvas.addEventListener('touchend', handleTouchEnd, { passive: true })
    
    return () => {
      canvas.removeEventListener('touchstart', handleTouchStart)
      canvas.removeEventListener('touchmove', handleTouchMove)
      canvas.removeEventListener('touchend', handleTouchEnd)
    }
  }, [enabled, camera, gl, lastTouch])
  
  return null
}

// Live coordinate tracker for both modes
function LiveCoordinateTracker({ isWalkMode, controlsRef, onCoordinateUpdate }) {
  const { camera } = useThree()

  useFrame(() => {
    if (isWalkMode) {
      const direction = new THREE.Vector3()
      camera.getWorldDirection(direction)
      const lookTarget = camera.position.clone().add(direction.multiplyScalar(5))
      onCoordinateUpdate(camera.position, lookTarget)
    } else if (controlsRef.current) {
      const target = controlsRef.current.target
      onCoordinateUpdate(camera.position, target)
    }
  })

  return null
}

// Movable furniture: drag an item across the floor. It slides along walls and
// stops at other furniture instead of passing through them.
function MovableItem({ item, onDragChange, registerReset }) {
  const { camera, gl } = useThree()
  const hovered = useRef(false)
  const dragging = useRef(false)
  const plane = useRef(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0))
  const grabOffset = useRef({ x: 0, z: 0 })
  const raycaster = useRef(new THREE.Raycaster())
  const originals = useRef(new Map())

  // Remember each material's own glow so it can be restored afterwards
  useEffect(() => {
    const map = new Map()
    item.group.traverse((o) => {
      if (!o.isMesh) return
      const mats = Array.isArray(o.material) ? o.material : [o.material]
      mats.forEach((m) => {
        if (m && m.emissive) map.set(m, { color: m.emissive.clone(), intensity: m.emissiveIntensity })
      })
    })
    originals.current = map
    return () => {
      map.forEach((orig, m) => {
        m.emissive.copy(orig.color)
        m.emissiveIntensity = orig.intensity
      })
      document.body.style.cursor = 'default'
    }
  }, [item])

  useEffect(() => {
    registerReset?.(item.id, () => item.group.position.set(0, 0, 0))
    return () => registerReset?.(item.id, null)
  }, [item, registerReset])

  // Glow: green on hover, orange while dragging, gentle blue pulse when idle
  useFrame(() => {
    const t = performance.now() * 0.003
    originals.current.forEach((orig, m) => {
      if (dragging.current) {
        m.emissive.setHex(0xff6600); m.emissiveIntensity = 0.5
      } else if (hovered.current) {
        m.emissive.setHex(0x00ff00); m.emissiveIntensity = 0.3
      } else {
        m.emissive.setHex(0x0088ff); m.emissiveIntensity = 0.08 + (Math.sin(t) * 0.5 + 0.5) * 0.08
      }
    })
  })

  useEffect(() => {
    const canvas = gl.domElement
    const ndc = new THREE.Vector2()

    const setRay = (event) => {
      // Use the canvas rectangle (not the window) so picking is correct when the viewer sits inside a page
      const rect = canvas.getBoundingClientRect()
      ndc.set(((event.clientX - rect.left) / rect.width) * 2 - 1, -((event.clientY - rect.top) / rect.height) * 2 + 1)
      raycaster.current.setFromCamera(ndc, camera)
    }

    const hit = () => {
      item.group.updateMatrixWorld(true)
      return raycaster.current.intersectObject(item.group, true)[0] || null
    }

    const onPointerDown = (event) => {
      if (event.button !== 0 || event.altKey) return // Alt+click belongs to the debug item picker
      setRay(event)
      const h = hit()
      if (!h) return
      // Take the event away from the orbit controls
      event.stopImmediatePropagation()
      dragging.current = true
      plane.current.set(new THREE.Vector3(0, 1, 0), -h.point.y)
      const p = new THREE.Vector3()
      raycaster.current.ray.intersectPlane(plane.current, p)
      grabOffset.current = { x: item.group.position.x - p.x, z: item.group.position.z - p.z }
      try { canvas.setPointerCapture(event.pointerId) } catch (e) { /* not supported */ }
      canvas.style.cursor = 'grabbing'
      onDragChange?.(true)
    }

    const onPointerMove = (event) => {
      setRay(event)
      if (!dragging.current) {
        const over = !!hit()
        if (over !== hovered.current) {
          hovered.current = over
          canvas.style.cursor = over ? 'grab' : ''
        }
        return
      }
      const p = new THREE.Vector3()
      if (!raycaster.current.ray.intersectPlane(plane.current, p)) return
      const r = moveItemWithCollision(
        item,
        item.phys,
        item.group.position.x,
        item.group.position.z,
        p.x + grabOffset.current.x,
        p.z + grabOffset.current.z
      )
      item.group.position.x = r.x
      item.group.position.z = r.z
    }

    const endDrag = (event) => {
      if (!dragging.current) return
      dragging.current = false
      try { canvas.releasePointerCapture(event.pointerId) } catch (e) { /* not captured */ }
      canvas.style.cursor = hovered.current ? 'grab' : ''
      onDragChange?.(false)
    }

    // Capture phase so this runs before the orbit controls' own listener
    canvas.addEventListener('pointerdown', onPointerDown, true)
    canvas.addEventListener('pointermove', onPointerMove)
    canvas.addEventListener('pointerup', endDrag)
    canvas.addEventListener('pointercancel', endDrag)
    return () => {
      canvas.removeEventListener('pointerdown', onPointerDown, true)
      canvas.removeEventListener('pointermove', onPointerMove)
      canvas.removeEventListener('pointerup', endDrag)
      canvas.removeEventListener('pointercancel', endDrag)
      canvas.style.cursor = ''
      if (dragging.current) { dragging.current = false; onDragChange?.(false) }
    }
  }, [item, camera, gl, onDragChange])

  return null
}

// Debug helper (?debug=true): Alt+click any object to get a ready-to-paste movableItems entry for it
function ItemPicker({ floorY, onPick }) {
  const { camera, gl, scene } = useThree()
  useEffect(() => {
    const canvas = gl.domElement
    const ray = new THREE.Raycaster()
    const ndc = new THREE.Vector2()
    const onDown = (e) => {
      if (!e.altKey || e.button !== 0) return
      e.stopImmediatePropagation()
      e.preventDefault()
      const rect = canvas.getBoundingClientRect()
      ndc.set(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1)
      ray.setFromCamera(ndc, camera)
      // Look through ceilings, walls and other huge pieces to the first real piece of furniture
      const hits = ray.intersectObjects(scene.children, true).filter(h => h.object.isMesh && h.faceIndex != null)
      let best = null
      let fallback = null
      for (const h of hits.slice(0, 8)) {
        const d = describePieceAt(scene, h, floorY)
        if (!d) continue
        if (!fallback) fallback = d
        if (d.warnings.length === 0) { best = d; break }
      }
      onPick(best || fallback)
    }
    canvas.addEventListener('pointerdown', onDown, true)
    return () => canvas.removeEventListener('pointerdown', onDown, true)
  }, [camera, gl, scene, floorY, onPick])
  return null
}

// Exposes the camera and physics data to the browser console in debug mode (?debug=true)
function DebugBridge({ physics }) {
  const { camera, scene, gl } = useThree()
  useEffect(() => {
    window.__roomie3d = { camera, scene, gl, physics, THREE }
    return () => { delete window.__roomie3d }
  }, [camera, scene, gl, physics])
  return null
}

// Room model component
function RoomModel({ modelPath, isBooked, onModelInfo, scaleOverride, fixMaterials = false, movableItems = [], onPhysicsReady }) {
  const { scene } = useGLTF(modelPath)
  // Kept in refs so changing them never re-runs the (heavy) setup below
  const movableRef = useRef(movableItems)
  const physicsCallbackRef = useRef(onPhysicsReady)
  movableRef.current = movableItems
  physicsCallbackRef.current = onPhysicsReady

  useEffect(() => {
    if (!scene) return
    console.log('✅ Model loaded:', modelPath)

    // Scale and centre the model ONCE. useGLTF caches the scene and this effect
    // runs again (React StrictMode, booking status changes). Measuring an
    // already-scaled scene would scale it back to its original size, so the
    // first measurements are stored and reused.
    if (!scene.userData.roomieNorm) {
      const box = new THREE.Box3().setFromObject(scene)
      const size = box.getSize(new THREE.Vector3())
      const center = box.getCenter(new THREE.Vector3())
      const scaleFactor = scaleOverride || 8 / Math.max(size.x, size.y, size.z)
      scene.scale.set(scaleFactor, scaleFactor, scaleFactor)
      const scaledCenter = center.clone().multiplyScalar(scaleFactor)
      scene.position.set(-scaledCenter.x, -scaledCenter.y, -scaledCenter.z)
      scene.updateMatrixWorld(true)
      const sphere = new THREE.Sphere()
      box.getBoundingSphere(sphere)
      scene.userData.roomieNorm = { scaleFactor, radius: sphere.radius * scaleFactor }
      console.log('🔧 Scale factor:', scaleFactor.toFixed(3))
    }
    const norm = scene.userData.roomieNorm

    let meshCount = 0
    let textureCount = 0
    let materialCount = 0

    // Shadows, material repair and the booking tint, for the scene and the movable items
    const processRoot = (root, countStats) => {
      root.traverse((child) => {
        if (!child.isMesh) return
        if (countStats) meshCount++
        child.castShadow = true
        child.receiveShadow = true
        if (!child.material) return
        if (countStats) materialCount++

        if (fixMaterials) {
          const oldMaterial = child.material
          let color = '#888888'
          if (oldMaterial && oldMaterial.color) color = `#${oldMaterial.color.getHexString()}`

          const newMaterial = new THREE.MeshStandardMaterial({
            color,
            roughness: 0.7,
            metalness: 0.3,
            side: THREE.DoubleSide
          })
          if (oldMaterial && oldMaterial.map && oldMaterial.map.image) {
            try {
              newMaterial.map = oldMaterial.map.clone()
              newMaterial.map.needsUpdate = true
              if (countStats) textureCount++
            } catch (e) {
              console.log('⚠ Texture could not be preserved:', e.message)
            }
          }
          newMaterial.emissive = new THREE.Color(isBooked ? 0x440000 : 0x004400)
          newMaterial.emissiveIntensity = 0.3
          child.material = newMaterial
          if (oldMaterial && oldMaterial.dispose) oldMaterial.dispose()
        } else {
          if (child.material.map && countStats) textureCount++
          child.material.emissive = new THREE.Color(isBooked ? 0x440000 : 0x004400)
          child.material.emissiveIntensity = 0.1
          child.material.needsUpdate = true
        }
      })
    }

    processRoot(scene, true)

    // Physics: built once per loaded scene, after the materials are repaired so
    // the movable items inherit the repaired materials.
    if (!scene.userData.roomiePhysics) {
      scene.updateMatrixWorld(true)
      const bounds = new THREE.Box3().setFromObject(scene)
      const walkGrid = buildWalkGrid(scene, bounds) // includes furniture, so build it before items are cut out
      const items = []
      for (const cfg of movableRef.current) {
        const item = extractMovableItem(scene, cfg, bounds.min.y)
        if (!item) {
          console.warn(`⚠ Movable item "${cfg.id}" not found in ${modelPath}`)
          continue
        }
        items.push(item)
      }
      // Items are collision-tested against the room as it is once every item has been cut out
      for (const item of items) item.phys = buildItemGrid(scene, item, bounds)
      linkItems(items) // items also stop at each other
      scene.userData.roomiePhysics = { bounds, walkGrid, items }
      console.log(`🪑 Movable items ready: ${items.map(i => i.label).join(', ') || 'none'}`)
    }
    for (const item of scene.userData.roomiePhysics.items) processRoot(item.group, false)

    onModelInfo({
      loaded: true,
      meshes: meshCount,
      textures: textureCount,
      materials: materialCount,
      scaleFactor: norm.scaleFactor,
      radius: norm.radius
    })
    physicsCallbackRef.current?.(scene.userData.roomiePhysics)
  }, [scene, isBooked, onModelInfo, modelPath, scaleOverride, fixMaterials])

  if (!scene) return null

  return <primitive object={scene} />
}

// Camera rig with waypoint animation
function CameraRig({ modelInfo, targetWaypoint, onTransitionComplete, initialCameraDistance }) {
  const { camera } = useThree()
  const isAnimating = useRef(false)
  const animationProgress = useRef(0)
  const startPosition = useRef(new THREE.Vector3())
  const startTarget = useRef(new THREE.Vector3())
  const endPosition = useRef(new THREE.Vector3())
  const endTarget = useRef(new THREE.Vector3())

  useEffect(() => {
    if (modelInfo.radius) {
      const distanceMultiplier = initialCameraDistance || 2.5
      const distance = modelInfo.radius * distanceMultiplier
      
      camera.position.set(distance, distance * 0.7, distance)
      camera.lookAt(0, 0, 0)
      camera.updateProjectionMatrix()
      
      console.log('📷 Camera positioned at distance:', distance.toFixed(2))
    }
  }, [camera, modelInfo.radius, initialCameraDistance])

  useEffect(() => {
    if (targetWaypoint) {
      isAnimating.current = true
      animationProgress.current = 0
      
      startPosition.current.copy(camera.position)
      startTarget.current.set(0, 0, 0)
      
      endPosition.current.set(...targetWaypoint.position)
      endTarget.current.set(...targetWaypoint.target)
      
      console.log('🎬 Starting camera transition to waypoint:', targetWaypoint)
    }
  }, [targetWaypoint, camera])

  useFrame((state, delta) => {
    if (isAnimating.current) {
      animationProgress.current += delta * 1.0
      
      if (animationProgress.current >= 1) {
        animationProgress.current = 1
        isAnimating.current = false
        
        camera.position.copy(endPosition.current)
        camera.lookAt(endTarget.current)
        
        if (onTransitionComplete) {
          onTransitionComplete(endTarget.current)
        }
        
        console.log('✅ Camera transition complete')
      } else {
        const t = animationProgress.current
        const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
        
        camera.position.lerpVectors(startPosition.current, endPosition.current, eased)
        
        const currentTarget = new THREE.Vector3().lerpVectors(
          startTarget.current, 
          endTarget.current, 
          eased
        )
        camera.lookAt(currentTarget)
      }
    }
  })

  return null
}

// Loading spinner
function LoadingSpinner() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-blue-50 to-gray-100">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mb-4"></div>
        <p className="text-lg font-semibold text-gray-800">Loading 3D Model...</p>
        <p className="text-sm text-gray-600 mt-2">Please wait...</p>
      </div>
    </div>
  )
}

// Main RoomViewer component
function RoomViewer({ modelPath, waypoints = {}, isBooked = false, scaleOverride, initialCameraDistance, fixMaterials = false, enablePhysics = false, movableItems = [] }) {
  const [modelInfo, setModelInfo] = useState({})
  const [targetWaypoint, setTargetWaypoint] = useState(null)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [isWalkMode, setIsWalkMode] = useState(false)
  const [currentCoordinates, setCurrentCoordinates] = useState({ position: [0, 0, 0], target: [0, 0, 0] })
  const [showCopyFeedback, setShowCopyFeedback] = useState(false)
  const [physics, setPhysics] = useState(null) // movable items + collision grids once the model is ready
  const [pickedPiece, setPickedPiece] = useState(null) // debug: last piece picked with Alt+click
  const [copiedLine, setCopiedLine] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const controlsRef = useRef(null)
  const pointerLockRef = useRef(null)
  const coordinateUpdateTimeout = useRef(null)
  const physicsRef = useRef(null)
  const resetFns = useRef({})

  const moveSpeed = modelInfo.radius ? modelInfo.radius * 0.01 : 0.008 // Even slower, careful walking speed
  const isDebugMode = new URLSearchParams(window.location.search).get('debug') === 'true'
  const hasWaypoints = Object.keys(waypoints).length > 0

  const handlePhysicsReady = useCallback((p) => {
    physicsRef.current = p
    setPhysics(p)
  }, [])

  const registerReset = useCallback((id, fn) => {
    if (fn) resetFns.current[id] = fn
    else delete resetFns.current[id]
  }, [])

  const hasMovableItems = enablePhysics && !!physics && physics.items.length > 0

  const handleResetFurniture = () => {
    Object.values(resetFns.current).forEach(fn => fn())
    console.log('♻️ Furniture reset to original position')
  }

  // Live coordinate update
  const handleLiveCoordinateUpdate = (position, target) => {
    setCurrentCoordinates({
      position: [
        parseFloat(position.x.toFixed(2)),
        parseFloat(position.y.toFixed(2)),
        parseFloat(position.z.toFixed(2))
      ],
      target: [
        parseFloat(target.x.toFixed(2)),
        parseFloat(target.y.toFixed(2)),
        parseFloat(target.z.toFixed(2))
      ]
    })
  }

  // Debounced coordinate update for console logging
  const updateCoordinates = (position, target) => {
    if (coordinateUpdateTimeout.current) {
      clearTimeout(coordinateUpdateTimeout.current)
    }
    
    coordinateUpdateTimeout.current = setTimeout(() => {
      const coords = {
        position: [
          parseFloat(position.x.toFixed(2)),
          parseFloat(position.y.toFixed(2)),
          parseFloat(position.z.toFixed(2))
        ],
        target: [
          parseFloat(target.x.toFixed(2)),
          parseFloat(target.y.toFixed(2)),
          parseFloat(target.z.toFixed(2))
        ]
      }
      setCurrentCoordinates(coords)
      
      console.log('📍 Current Waypoint:')
      console.log(`  position: [${coords.position.join(', ')}],`)
      console.log(`  target: [${coords.target.join(', ')}]`)
    }, 300)
  }

  const handleWaypointClick = (roomName) => {
    if (isWalkMode) return
    
    const waypoint = waypoints[roomName]
    if (waypoint) {
      setTargetWaypoint(waypoint)
      setIsTransitioning(true)
      
      if (controlsRef.current) {
        controlsRef.current.enabled = false
      }
    }
  }

  const handleTransitionComplete = (newTarget) => {
    setIsTransitioning(false)
    
    if (controlsRef.current) {
      controlsRef.current.enabled = true
      controlsRef.current.target.copy(newTarget)
      controlsRef.current.update()
    }
    
    setTargetWaypoint(null)
  }

  const handleControlsEnd = () => {
    if (controlsRef.current && !isTransitioning && !isWalkMode) {
      const camera = controlsRef.current.object
      const target = controlsRef.current.target
      
      updateCoordinates(camera.position, target)
    }
  }

  const toggleWalkMode = () => {
    const newWalkMode = !isWalkMode
    
    // Store current camera position before switching
    if (controlsRef.current && newWalkMode) {
      // Switching TO walk mode - save orbit target
      const currentTarget = controlsRef.current.target.clone()
      console.log('💾 Saving orbit target:', currentTarget)
    }
    
    if (newWalkMode && controlsRef.current && physicsRef.current?.walkGrid) {
      const cam = controlsRef.current.object
      const { walkGrid, bounds } = physicsRef.current
      const insideModel =
        cam.position.x >= bounds.min.x && cam.position.x <= bounds.max.x &&
        cam.position.z >= bounds.min.z && cam.position.z <= bounds.max.z
      if (insideModel) {
        // Already in the apartment: only step out of a wall or piece of furniture
        if (!walkPositionFree(walkGrid, cam.position.x, cam.position.z)) {
          const spot = findNearestFree(walkGrid, cam.position.x, cam.position.z)
          cam.position.x = spot.x
          cam.position.z = spot.z
        }
      } else {
        // The orbit camera is outside the building: start at the first waypoint, or the nearest free spot
        const first = Object.values(waypoints)[0]
        if (first) {
          cam.position.set(...first.position)
          cam.lookAt(new THREE.Vector3(...first.target))
        } else {
          const spot = findNearestFree(walkGrid, 0, 0)
          cam.position.set(spot.x, bounds.min.y + (bounds.max.y - bounds.min.y) * 0.5, spot.z)
        }
      }
    }

    setIsWalkMode(newWalkMode)
    
    // Exit pointer lock when switching to orbit mode
    if (!newWalkMode && document.pointerLockElement) {
      document.exitPointerLock()
      
      // Give OrbitControls a moment to initialize, then update its target
      setTimeout(() => {
        if (controlsRef.current) {
          // Keep the camera where it is, don't reset
          controlsRef.current.update()
        }
      }, 100)
    }
    
    console.log(`🚶 ${newWalkMode ? 'Walk Mode enabled' : 'Orbit Mode enabled'}`)
  }

  // Exit pointer lock when user presses ESC
  useEffect(() => {
    const handlePointerLockChange = () => {
      if (!document.pointerLockElement && isWalkMode) {
        // Pointer lock was released
        console.log('Pointer unlocked - press click to lock again')
      }
    }

    document.addEventListener('pointerlockchange', handlePointerLockChange)
    return () => {
      document.removeEventListener('pointerlockchange', handlePointerLockChange)
    }
  }, [isWalkMode])

  const copyWaypointToClipboard = async () => {
    const waypointJSON = JSON.stringify(currentCoordinates, null, 2)
    
    try {
      await navigator.clipboard.writeText(waypointJSON)
      setShowCopyFeedback(true)
      setTimeout(() => setShowCopyFeedback(false), 2000)
      console.log('✅ Waypoint copied to clipboard:', waypointJSON)
    } catch (err) {
      console.error('Failed to copy waypoint:', err)
      console.log('Copy this waypoint manually:', waypointJSON)
    }
  }

  return (
    <div 
      className="relative w-full h-[500px] md:h-[600px] bg-gradient-to-b from-sky-100 to-gray-200"
      style={{
        // Don't block scroll when just hovering over the viewer
        userSelect: isWalkMode && document.pointerLockElement ? 'none' : 'auto'
      }}
    >
      {/* Status Badge */}
      <div className="absolute top-2 left-2 md:top-4 md:left-4 z-10">
        <div className={`px-2 py-1 md:px-4 md:py-2 rounded-full font-semibold text-xs md:text-sm shadow-lg ${
          isBooked 
            ? 'bg-red-500 text-white' 
            : 'bg-green-500 text-white'
        }`}>
          {isBooked ? '🔒 Booked' : '✓ Available'}
        </div>
      </div>

      {/* Room Navigation Buttons - Compact on Mobile */}
      {!isWalkMode && hasWaypoints && (
        <div className="absolute top-12 md:top-20 left-2 md:left-4 z-10 space-y-1 md:space-y-2 max-w-[120px] md:max-w-none">
          <div className="bg-black/80 text-white px-2 md:px-3 py-1 md:py-2 rounded-lg text-[10px] md:text-xs font-semibold mb-1 md:mb-2">
            🏠 Quick Tour
          </div>
          {Object.keys(waypoints).map((roomName) => (
            <button
              key={roomName}
              onClick={() => handleWaypointClick(roomName)}
              disabled={isTransitioning}
              className={`block w-full px-2 md:px-3 py-1.5 md:py-2 rounded-lg text-[10px] md:text-xs font-medium shadow-lg transition-colors ${
                isTransitioning
                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              {roomName.charAt(0).toUpperCase() + roomName.slice(1).replace(/([A-Z])/g, ' $1')}
            </button>
          ))}
        </div>
      )}

      {/* Walk Mode Toggle & Reset Buttons - Horizontal on Mobile */}
      <div className="absolute bottom-16 md:bottom-20 left-2 md:left-4 right-2 md:right-auto z-10 flex gap-1 md:gap-2">
        <button
          onClick={toggleWalkMode}
          className={`flex-1 md:flex-none px-2 md:px-4 py-1.5 md:py-2 rounded-lg font-semibold text-[10px] md:text-sm shadow-lg transition-colors ${
            isWalkMode
              ? 'bg-purple-500 hover:bg-purple-600 text-white'
              : 'bg-gray-700 hover:bg-gray-800 text-white'
          }`}
        >
          <span className="md:hidden">{isWalkMode ? '🔄 Orbit' : '🚶 Walk'}</span>
          <span className="hidden md:inline">{isWalkMode ? '🔄 Orbit Mode' : '🚶 Walk Mode'}</span>
        </button>
        
        {/* Reset Furniture Button - Icon only on mobile */}
        {hasMovableItems && (
          <button
            onClick={handleResetFurniture}
            className="flex-1 md:flex-none px-2 md:px-4 py-1.5 md:py-2 rounded-lg font-semibold text-[10px] md:text-sm shadow-lg transition-colors bg-orange-500 hover:bg-orange-600 text-white flex items-center justify-center gap-1 md:gap-2"
            title="Reset Furniture"
          >
            <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span className="hidden md:inline">Reset Furniture</span>
          </button>
        )}
      </div>

      {/* Walk Mode Instructions - Simplified on Mobile */}
      {isWalkMode && (
        <div className="absolute top-12 md:top-20 left-2 md:left-4 z-10 bg-purple-600/90 text-white px-2 md:px-4 py-2 md:py-3 rounded-lg text-[9px] md:text-xs shadow-lg max-w-[200px] md:max-w-none">
          <div className="font-semibold mb-1">🚶 Walk Mode</div>
          <div className="hidden md:block">• WASD or Arrow Keys to move</div>
          <div className="hidden md:block">• E/Space to go up</div>
          <div className="hidden md:block">• Q/Shift to go down</div>
          <div className="md:hidden">• Use on-screen controls</div>
          <div className="md:hidden">• Drag screen to look</div>
          <div className="hidden md:block">• Click to lock pointer</div>
          <div className="hidden md:block">• <span className="font-bold text-yellow-300">ESC to unlock</span></div>
          <div className="md:hidden text-yellow-300 font-bold">• Tap Exit Walk</div>
        </div>
      )}

      {/* Mobile Touch Controls for Walk Mode */}
      {isWalkMode && (
        <div className="md:hidden absolute bottom-4 left-4 right-4 z-20 flex items-end justify-between gap-4 pointer-events-auto">
          {/* Virtual D-Pad */}
          <div className="relative w-32 h-32 bg-black/50 backdrop-blur-sm rounded-full border-2 border-white/30 pointer-events-auto">
            {/* Center indicator */}
            <div className="absolute top-1/2 left-1/2 w-6 h-6 bg-white/40 rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
            
            {/* Up */}
            <button
              type="button"
              onTouchStart={(e) => {
                e.preventDefault();
                const event = new KeyboardEvent('keydown', { key: 'w', bubbles: true });
                document.dispatchEvent(event);
              }}
              onTouchEnd={(e) => {
                e.preventDefault();
                const event = new KeyboardEvent('keyup', { key: 'w', bubbles: true });
                document.dispatchEvent(event);
              }}
              onMouseDown={(e) => {
                e.preventDefault();
                const event = new KeyboardEvent('keydown', { key: 'w', bubbles: true });
                document.dispatchEvent(event);
              }}
              onMouseUp={(e) => {
                e.preventDefault();
                const event = new KeyboardEvent('keyup', { key: 'w', bubbles: true });
                document.dispatchEvent(event);
              }}
              className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-12 bg-white/70 hover:bg-white/90 active:bg-white rounded-t-full flex items-center justify-center text-black font-bold text-sm touch-none select-none"
            >
              ↑
            </button>
            
            {/* Down */}
            <button
              type="button"
              onTouchStart={(e) => {
                e.preventDefault();
                const event = new KeyboardEvent('keydown', { key: 's', bubbles: true });
                document.dispatchEvent(event);
              }}
              onTouchEnd={(e) => {
                e.preventDefault();
                const event = new KeyboardEvent('keyup', { key: 's', bubbles: true });
                document.dispatchEvent(event);
              }}
              onMouseDown={(e) => {
                e.preventDefault();
                const event = new KeyboardEvent('keydown', { key: 's', bubbles: true });
                document.dispatchEvent(event);
              }}
              onMouseUp={(e) => {
                e.preventDefault();
                const event = new KeyboardEvent('keyup', { key: 's', bubbles: true });
                document.dispatchEvent(event);
              }}
              className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-12 bg-white/70 hover:bg-white/90 active:bg-white rounded-b-full flex items-center justify-center text-black font-bold text-sm touch-none select-none"
            >
              ↓
            </button>
            
            {/* Left */}
            <button
              type="button"
              onTouchStart={(e) => {
                e.preventDefault();
                const event = new KeyboardEvent('keydown', { key: 'a', bubbles: true });
                document.dispatchEvent(event);
              }}
              onTouchEnd={(e) => {
                e.preventDefault();
                const event = new KeyboardEvent('keyup', { key: 'a', bubbles: true });
                document.dispatchEvent(event);
              }}
              onMouseDown={(e) => {
                e.preventDefault();
                const event = new KeyboardEvent('keydown', { key: 'a', bubbles: true });
                document.dispatchEvent(event);
              }}
              onMouseUp={(e) => {
                e.preventDefault();
                const event = new KeyboardEvent('keyup', { key: 'a', bubbles: true });
                document.dispatchEvent(event);
              }}
              className="absolute left-0 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/70 hover:bg-white/90 active:bg-white rounded-l-full flex items-center justify-center text-black font-bold text-sm touch-none select-none"
            >
              ←
            </button>
            
            {/* Right */}
            <button
              type="button"
              onTouchStart={(e) => {
                e.preventDefault();
                const event = new KeyboardEvent('keydown', { key: 'd', bubbles: true });
                document.dispatchEvent(event);
              }}
              onTouchEnd={(e) => {
                e.preventDefault();
                const event = new KeyboardEvent('keyup', { key: 'd', bubbles: true });
                document.dispatchEvent(event);
              }}
              onMouseDown={(e) => {
                e.preventDefault();
                const event = new KeyboardEvent('keydown', { key: 'd', bubbles: true });
                document.dispatchEvent(event);
              }}
              onMouseUp={(e) => {
                e.preventDefault();
                const event = new KeyboardEvent('keyup', { key: 'd', bubbles: true });
                document.dispatchEvent(event);
              }}
              className="absolute right-0 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/70 hover:bg-white/90 active:bg-white rounded-r-full flex items-center justify-center text-black font-bold text-sm touch-none select-none"
            >
              →
            </button>
          </div>

          {/* Action Buttons (Up/Down) */}
          <div className="flex flex-col gap-2 pointer-events-auto">
            {/* Up button */}
            <button
              type="button"
              onTouchStart={(e) => {
                e.preventDefault();
                const event = new KeyboardEvent('keydown', { key: 'e', bubbles: true });
                document.dispatchEvent(event);
              }}
              onTouchEnd={(e) => {
                e.preventDefault();
                const event = new KeyboardEvent('keyup', { key: 'e', bubbles: true });
                document.dispatchEvent(event);
              }}
              onMouseDown={(e) => {
                e.preventDefault();
                const event = new KeyboardEvent('keydown', { key: 'e', bubbles: true });
                document.dispatchEvent(event);
              }}
              onMouseUp={(e) => {
                e.preventDefault();
                const event = new KeyboardEvent('keyup', { key: 'e', bubbles: true });
                document.dispatchEvent(event);
              }}
              className="w-14 h-14 bg-green-500/80 hover:bg-green-500 active:bg-green-600 rounded-full flex flex-col items-center justify-center text-white font-bold text-xs shadow-lg border-2 border-white/30 touch-none select-none"
            >
              <span className="text-lg">↑</span>
              <span className="text-[8px]">UP</span>
            </button>
            
            {/* Down button */}
            <button
              type="button"
              onTouchStart={(e) => {
                e.preventDefault();
                const event = new KeyboardEvent('keydown', { key: 'q', bubbles: true });
                document.dispatchEvent(event);
              }}
              onTouchEnd={(e) => {
                e.preventDefault();
                const event = new KeyboardEvent('keyup', { key: 'q', bubbles: true });
                document.dispatchEvent(event);
              }}
              onMouseDown={(e) => {
                e.preventDefault();
                const event = new KeyboardEvent('keydown', { key: 'q', bubbles: true });
                document.dispatchEvent(event);
              }}
              onMouseUp={(e) => {
                e.preventDefault();
                const event = new KeyboardEvent('keyup', { key: 'q', bubbles: true });
                document.dispatchEvent(event);
              }}
              className="w-14 h-14 bg-red-500/80 hover:bg-red-500 active:bg-red-600 rounded-full flex flex-col items-center justify-center text-white font-bold text-xs shadow-lg border-2 border-white/30 touch-none select-none"
            >
              <span className="text-lg">↓</span>
              <span className="text-[8px]">DOWN</span>
            </button>
          </div>
        </div>
      )}

      {/* Pointer Lock Status Indicator - Desktop Only */}
      {isWalkMode && !document.pointerLockElement && (
        <div className="hidden md:block absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 bg-purple-900/95 text-white px-6 py-4 rounded-lg text-center shadow-2xl border-2 border-purple-400">
          <div className="text-lg font-bold mb-2">👆 Click to Start Walking</div>
          <div className="text-sm">Mouse pointer is not locked</div>
          <div className="text-xs mt-2 text-purple-200">Press ESC anytime to unlock and take screenshots</div>
        </div>
      )}

      {/* Debug: movable item picker (Alt+click an object) */}
      {isDebugMode && (
        <div className="absolute bottom-20 left-4 z-10 w-80 max-w-[calc(100%-2rem)] bg-black/90 text-white px-4 py-3 rounded-lg text-xs shadow-lg border-2 border-cyan-400">
          <div className="font-semibold text-cyan-300 mb-1">DEBUG: Add a movable item</div>
          {!pickedPiece ? (
            <div className="text-gray-300">Hold <b>Alt</b> and click a piece of furniture. You get a line to paste into <span className="font-mono">movableItems</span> in <span className="font-mono">rooms.js</span>.</div>
          ) : (
            <div className="space-y-2">
              <div className="text-gray-300">
                Mesh <span className="font-mono text-white">{pickedPiece.meshName}</span> · size {pickedPiece.size.join(' × ')} · {pickedPiece.tris} tris
              </div>
              {pickedPiece.warnings.map((w, i) => (
                <div key={i} className="text-yellow-300">⚠ {w}</div>
              ))}
              {[['By area', pickedPiece.byRegion], ['By mesh name', pickedPiece.byName]].filter(([, line]) => line).map(([label, line]) => (
                <div key={label}>
                  <div className="text-cyan-200 mb-0.5">{label}</div>
                  <div className="font-mono text-[10px] bg-white/10 rounded p-1.5 break-all">{line}</div>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard?.writeText(line)
                      setCopiedLine(line)
                    }}
                    className="mt-1 px-2 py-1 rounded bg-cyan-500 hover:bg-cyan-400 text-black font-semibold"
                  >
                    {copiedLine === line ? 'Copied ✓' : 'Copy'}
                  </button>
                </div>
              ))}
              <button type="button" onClick={() => { setPickedPiece(null); setCopiedLine('') }} className="text-gray-400 hover:text-white underline">Clear</button>
            </div>
          )}
        </div>
      )}

      {/* Debug Coordinate Readout */}
      {isDebugMode && (
        <div className="absolute bottom-20 right-4 z-10 bg-black/90 text-white px-4 py-3 rounded-lg text-xs shadow-lg border-2 border-yellow-400">
          <div className="font-semibold text-yellow-300 mb-2 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            DEBUG: Live Coordinates
          </div>
          
          <div className="space-y-1 mb-3 font-mono text-[10px]">
            <div className="text-green-300">
              Position: [{currentCoordinates.position.join(', ')}]
            </div>
            <div className="text-blue-300">
              Target: [{currentCoordinates.target.join(', ')}]
            </div>
          </div>

          <button
            onClick={copyWaypointToClipboard}
            className="w-full px-3 py-2 bg-yellow-500 hover:bg-yellow-600 text-black rounded font-semibold text-xs transition-colors flex items-center justify-center gap-2"
          >
            {showCopyFeedback ? (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Copied!
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy Waypoint JSON
              </>
            )}
          </button>
        </div>
      )}

      {/* Debug Info */}
      {modelInfo.loaded && (
        <div className="absolute top-4 right-4 z-10 bg-black/80 text-white px-3 py-2 rounded-lg text-xs">
          <div>✓ Model Loaded</div>
          <div>Meshes: {modelInfo.meshes}</div>
          <div>Materials: {modelInfo.materials}</div>
          <div>Textures: {modelInfo.textures}</div>
          <div>Scale: {modelInfo.scaleFactor?.toFixed(2)}x</div>
          <div className={isWalkMode ? 'text-purple-300' : 'text-blue-300'}>
            {isWalkMode ? '🚶 Walk Mode' : '🔄 Orbit Mode'}
          </div>
          {isTransitioning && <div className="text-yellow-300 mt-1">🎬 Animating...</div>}
        </div>
      )}

      <Suspense fallback={<LoadingSpinner />}>
        <Canvas
          shadows
          gl={{
            antialias: true,
            pixelRatio: Math.min(window.devicePixelRatio, 2),
            alpha: false
          }}
          onCreated={({ gl }) => {
            gl.setClearColor('#e0f2fe')
            // Prevent canvas from blocking touch/scroll events when not actively using controls
            gl.domElement.style.touchAction = isWalkMode ? 'none' : 'auto'
          }}
          style={{
            touchAction: isWalkMode ? 'none' : 'auto' // Allow scroll/touch when not in walk mode
          }}
        >
          {/* Lighting */}
          <ambientLight intensity={2.5} />
          <directionalLight position={[10, 10, 5]} intensity={2} castShadow />
          <directionalLight position={[-10, 10, -5]} intensity={2} />
          <directionalLight position={[0, -5, 10]} intensity={1.5} />
          <pointLight position={[0, 10, 0]} intensity={2} />
          <hemisphereLight color="#ffffff" groundColor="#cccccc" intensity={1.5} />


          {/* Scene - same regardless of physics setting */}
          <RoomModel 
            modelPath={modelPath} 
            isBooked={isBooked} 
            onModelInfo={setModelInfo}
            scaleOverride={scaleOverride}
            fixMaterials={fixMaterials}
            movableItems={enablePhysics ? movableItems : []}
            onPhysicsReady={handlePhysicsReady}
          />

          {/* Movable furniture: lives in world space next to the model, with wall collision */}
          {hasMovableItems && physics.items.map(item => (
            <primitive key={item.id} object={item.group} />
          ))}
          {hasMovableItems && !isWalkMode && physics.items.map(item => (
            <MovableItem
              key={item.id}
              item={item}
              onDragChange={setIsDragging}
              registerReset={registerReset}
            />
          ))}

          {isDebugMode && <DebugBridge physics={physics} />}
          {isDebugMode && physics && <ItemPicker floorY={physics.bounds.min.y} onPick={setPickedPiece} />}

          {/* Camera */}
          <CameraRig 
            modelInfo={modelInfo} 
            targetWaypoint={targetWaypoint}
            onTransitionComplete={handleTransitionComplete}
            initialCameraDistance={initialCameraDistance}
          />

          {/* Live Coordinate Tracker */}
          {isDebugMode && (
            <LiveCoordinateTracker 
              isWalkMode={isWalkMode}
              controlsRef={controlsRef}
              onCoordinateUpdate={handleLiveCoordinateUpdate}
            />
          )}

          {/* Conditional Controls */}
          {isWalkMode ? (
            <>
              <PointerLockControls ref={pointerLockRef} />
              <WalkControls 
                moveSpeed={moveSpeed} 
                enabled={isWalkMode}
                onCoordinateUpdate={updateCoordinates}
                walkGrid={physics?.walkGrid}
                bounds={physics?.bounds}
              />
              <MobileTouchCamera enabled={isWalkMode} />
            </>
          ) : (
            <OrbitControls
              ref={controlsRef}
              enablePan={true}
              enableZoom={true}
              enableRotate={true}
              minDistance={0.5}
              maxDistance={50}
              minPolarAngle={0.1}
              maxPolarAngle={Math.PI - 0.1}
              enableDamping={true}
              dampingFactor={0.05}
              onEnd={handleControlsEnd}
              enabled={!isDragging}
            />
          )}

          {/* Grid Helper */}
          <gridHelper args={[100, 100, '#666666', '#999999']} position={[0, -0.1, 0]} />
        </Canvas>
      </Suspense>

      {/* Instructions - Hidden on mobile, compact on tablet */}
      <div className="hidden md:block absolute bottom-4 left-4 right-4 bg-black/70 text-white px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm">
        <p className="flex items-center gap-2">
          <svg className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="truncate">
            {isWalkMode 
              ? 'Walk Mode: Use WASD to move • Mouse to look • ESC to unlock'
              : 'Orbit Mode: Drag to rotate • Scroll to zoom • Right-drag to pan' + (hasWaypoints ? ' • Click room buttons for quick tour' : '') + (hasMovableItems ? ` • Drag the glowing ${physics.items.map(i => i.label.toLowerCase()).join(' / ')} to move it` : '')
            }
            {isDebugMode && <span className="ml-2 text-yellow-300">• Debug coordinates enabled</span>}
          </span>
        </p>
      </div>
    </div>
  )
}

export default RoomViewer
