import { Suspense, useEffect, useState, useRef } from 'react'
import { Canvas, useThree, useFrame } from '@react-three/fiber'
import { OrbitControls, PointerLockControls, useGLTF } from '@react-three/drei'
import * as THREE from 'three'

// Walk mode controls component
function WalkControls({ moveSpeed, enabled, onCoordinateUpdate }) {
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

    // Apply velocity to camera position
    camera.position.add(velocity.current)
  })

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

// Simple Draggable Furniture Component - no physics, just direct manipulation
function DraggableFurniture({ mesh, onReset }) {
  const [isDragging, setIsDragging] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const dragPlane = useRef(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0))
  const dragOffset = useRef(new THREE.Vector3())
  const { camera, gl } = useThree()

  // Store original position for reset
  const originalPosition = useRef(null)
  const originalRotation = useRef(null)

  useEffect(() => {
    if (!mesh) return
    
    // Store original transforms once
    if (!originalPosition.current) {
      originalPosition.current = mesh.position.clone()
      originalRotation.current = mesh.rotation.clone()
    }
    
    console.log(`🎯 "${mesh.name}" is now draggable at:`, mesh.position)
  }, [mesh])

  // Reset handler
  useEffect(() => {
    if (onReset && onReset.current !== undefined && mesh) {
      onReset.current = () => {
        mesh.position.copy(originalPosition.current)
        mesh.rotation.copy(originalRotation.current)
        console.log('♻️ Furniture reset')
      }
    }
  }, [onReset, mesh])

  // Apply glow effect and outline - only to direct children of this mesh
  useEffect(() => {
    if (!mesh) return
    
    // Apply effect to the mesh itself if it's a mesh
    const applyEffect = (child) => {
      if (child.isMesh && child.material) {
        if (isDragging) {
          // Orange when dragging
          child.material.emissive = new THREE.Color(0xff6600)
          child.material.emissiveIntensity = 0.5
        } else if (isHovered) {
          // Green when hovering
          child.material.emissive = new THREE.Color(0x00ff00)
          child.material.emissiveIntensity = 0.3
        } else {
          // Subtle blue pulse when idle (shows it's interactive)
          const pulse = Math.sin(Date.now() * 0.003) * 0.5 + 0.5
          child.material.emissive = new THREE.Color(0x0088ff)
          child.material.emissiveIntensity = 0.1 + pulse * 0.1
        }
        child.material.needsUpdate = true
      }
    }
    
    if (mesh.isMesh) {
      applyEffect(mesh)
    }
    
    // Apply to immediate children only
    mesh.children.forEach(child => {
      if (child.isMesh) {
        applyEffect(child)
      }
    })
    
    // Animate the pulse effect
    const interval = setInterval(() => {
      if (!isHovered && !isDragging) {
        if (mesh.isMesh) {
          applyEffect(mesh)
        }
        mesh.children.forEach(child => {
          if (child.isMesh) {
            applyEffect(child)
          }
        })
      }
    }, 50)
    
    return () => clearInterval(interval)
  }, [mesh, isHovered, isDragging])

  // Pointer events using canvas events (more reliable)
  useEffect(() => {
    if (!mesh) return

    const handlePointerDown = (event) => {
      // Check if we clicked on this mesh
      const raycaster = new THREE.Raycaster()
      const pointer = new THREE.Vector2(
        (event.clientX / window.innerWidth) * 2 - 1,
        -(event.clientY / window.innerHeight) * 2 + 1
      )
      raycaster.setFromCamera(pointer, camera)
      
      // Only check this specific mesh, not its children
      const intersects = raycaster.intersectObject(mesh, false) // false = don't check children
      if (intersects.length > 0) {
        event.stopPropagation()
        setIsDragging(true)
        console.log('🖱️ Grabbed fridge!')
        
        // Calculate offset
        const intersection = new THREE.Vector3()
        raycaster.ray.intersectPlane(dragPlane.current, intersection)
        dragOffset.current.set(
          mesh.position.x - intersection.x,
          0,
          mesh.position.z - intersection.z
        )
      }
    }

    const handlePointerMove = (event) => {
      if (!isDragging) {
        // Check hover
        const raycaster = new THREE.Raycaster()
        const pointer = new THREE.Vector2(
          (event.clientX / window.innerWidth) * 2 - 1,
          -(event.clientY / window.innerHeight) * 2 + 1
        )
        raycaster.setFromCamera(pointer, camera)
        
        // Only check this specific mesh
        const intersects = raycaster.intersectObject(mesh, false) // false = don't check children
        const nowHovered = intersects.length > 0
        
        if (nowHovered !== isHovered) {
          setIsHovered(nowHovered)
          document.body.style.cursor = nowHovered ? 'grab' : 'default'
          if (nowHovered) console.log('👆 Hovering over fridge')
        }
        return
      }

      // Dragging - move the mesh
      const raycaster = new THREE.Raycaster()
      const pointer = new THREE.Vector2(
        (event.clientX / window.innerWidth) * 2 - 1,
        -(event.clientY / window.innerHeight) * 2 + 1
      )
      raycaster.setFromCamera(pointer, camera)
      
      const intersection = new THREE.Vector3()
      if (raycaster.ray.intersectPlane(dragPlane.current, intersection)) {
        mesh.position.x = intersection.x + dragOffset.current.x
        mesh.position.z = intersection.z + dragOffset.current.z
        // Keep Y unchanged
      }
    }

    const handlePointerUp = () => {
      if (isDragging) {
        setIsDragging(false)
        console.log('✋ Released fridge')
      }
    }

    gl.domElement.addEventListener('pointerdown', handlePointerDown)
    gl.domElement.addEventListener('pointermove', handlePointerMove)
    gl.domElement.addEventListener('pointerup', handlePointerUp)

    return () => {
      gl.domElement.removeEventListener('pointerdown', handlePointerDown)
      gl.domElement.removeEventListener('pointermove', handlePointerMove)
      gl.domElement.removeEventListener('pointerup', handlePointerUp)
      document.body.style.cursor = 'default'
    }
  }, [mesh, isDragging, isHovered, camera, gl])

  // Don't render anything - just add interactivity to existing mesh
  return null
}

// Room model component
function RoomModel({ modelPath, isBooked, onModelInfo, scaleOverride, fixMaterials = false, onFurnitureFound, enablePhysics = false }) {
  const { scene } = useGLTF(modelPath)

  useEffect(() => {
    if (scene) {
      console.log('✅ Model loaded:', modelPath)

      const box = new THREE.Box3().setFromObject(scene)
      const size = box.getSize(new THREE.Vector3())
      const center = box.getCenter(new THREE.Vector3())

      console.log('📏 Original model size:', {
        width: size.x.toFixed(2),
        height: size.y.toFixed(2),
        depth: size.z.toFixed(2)
      })

      // Apply scale (either override or auto-normalize to target size of 8 units)
      let scaleFactor
      if (scaleOverride) {
        scaleFactor = scaleOverride
      } else {
        const maxDimension = Math.max(size.x, size.y, size.z)
        const targetSize = 8
        scaleFactor = targetSize / maxDimension
      }
      
      console.log('🔧 Scale factor:', scaleFactor.toFixed(3))
      scene.scale.set(scaleFactor, scaleFactor, scaleFactor)

      // Center the model at origin (after scaling)
      const scaledCenter = center.multiplyScalar(scaleFactor)
      scene.position.set(-scaledCenter.x, -scaledCenter.y, -scaledCenter.z)

      // UPDATE THE SCENE'S MATRIX
      scene.updateMatrixWorld(true)

      let meshCount = 0
      let textureCount = 0
      let materialCount = 0
      let furnitureFound = false

      // Log all meshes for debugging
      if (enablePhysics) {
        console.log('=== 🪑 SCANNING FOR DRAGGABLE FURNITURE ===')
        console.log(`Model: ${modelPath}`)
      }

      // Traverse and apply shadows + booking tint
      scene.traverse((child) => {
        if (child.isMesh) {
          meshCount++
          
          // Log mesh names for debugging
          if (enablePhysics) {
            console.log(`Mesh ${meshCount}: "${child.name || 'unnamed'}"`)
          }
          
          // Try to find draggable furniture
          if (enablePhysics && !furnitureFound && onFurnitureFound) {
            const name = (child.name || '').toLowerCase()
            
            // Room-specific draggable items:
            // Room 1: "Chambre01_Meuble_Lit" (bed furniture)
            // Room 2: "fridge"
            if (name.includes('fridge') || name.includes('chambre01_meuble_lit')) {
              console.log(`✅ Found draggable item: "${child.name}"`)
              
              // Store reference - keep it visible, just add interactivity
              onFurnitureFound({
                mesh: child,
                name: child.name
              })
              
              furnitureFound = true
            }
          }
          
          child.castShadow = true
          child.receiveShadow = true

          if (child.material) {
            materialCount++
            
            // Fix broken materials if requested (for models like appartement.glb)
            if (fixMaterials) {
              const oldMaterial = child.material
              
              let color = '#888888'
              if (oldMaterial && oldMaterial.color) {
                color = `#${oldMaterial.color.getHexString()}`
              }

              const newMaterial = new THREE.MeshStandardMaterial({
                color: color,
                roughness: 0.7,
                metalness: 0.3,
                side: THREE.DoubleSide,
              })

              // Try to preserve texture if it exists
              if (oldMaterial && oldMaterial.map && oldMaterial.map.image) {
                try {
                  newMaterial.map = oldMaterial.map.clone()
                  newMaterial.map.needsUpdate = true
                  textureCount++
                } catch (e) {
                  console.log('⚠ Texture could not be preserved:', e.message)
                }
              }

              // Apply booking status tint
              if (isBooked) {
                newMaterial.emissive = new THREE.Color(0x440000)
                newMaterial.emissiveIntensity = 0.3
              } else {
                newMaterial.emissive = new THREE.Color(0x004400)
                newMaterial.emissiveIntensity = 0.3
              }

              child.material = newMaterial
              
              if (oldMaterial && oldMaterial.dispose) {
                oldMaterial.dispose()
              }
            } else {
              // Just count textures and apply tint for working materials
              if (child.material.map) {
                textureCount++
              }

              // Apply booking status tint
              if (isBooked) {
                child.material.emissive = new THREE.Color(0x440000)
                child.material.emissiveIntensity = 0.1
              } else {
                child.material.emissive = new THREE.Color(0x004400)
                child.material.emissiveIntensity = 0.1
              }
              
              child.material.needsUpdate = true
            }
          }
        }
      })

      // Calculate bounding sphere for camera positioning
      const scaledSize = size.multiplyScalar(scaleFactor)
      const sphere = new THREE.Sphere()
      box.getBoundingSphere(sphere)
      const scaledRadius = sphere.radius * scaleFactor

      console.log('📐 After scaling:', {
        size: `${scaledSize.x.toFixed(1)} x ${scaledSize.y.toFixed(1)} x ${scaledSize.z.toFixed(1)}`,
        radius: scaledRadius.toFixed(2)
      })

      onModelInfo({
        loaded: true,
        meshes: meshCount,
        textures: textureCount,
        materials: materialCount,
        scaleFactor: scaleFactor,
        radius: scaledRadius
      })

      console.log(`✅ Loaded ${meshCount} meshes, ${materialCount} materials, ${textureCount} textures`)
      
      if (enablePhysics && !furnitureFound) {
        console.log('💡 No draggable furniture set yet. Review the mesh list above to choose which items to make interactive.')
      }
    }
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
function RoomViewer({ modelPath, waypoints = {}, isBooked = false, scaleOverride, initialCameraDistance, fixMaterials = false, enablePhysics = false }) {
  const [modelInfo, setModelInfo] = useState({})
  const [targetWaypoint, setTargetWaypoint] = useState(null)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [isWalkMode, setIsWalkMode] = useState(false)
  const [currentCoordinates, setCurrentCoordinates] = useState({ position: [0, 0, 0], target: [0, 0, 0] })
  const [showCopyFeedback, setShowCopyFeedback] = useState(false)
  const [draggableFurniture, setDraggableFurniture] = useState([])
  const [isDragging, setIsDragging] = useState(false)
  const controlsRef = useRef(null)
  const pointerLockRef = useRef(null)
  const coordinateUpdateTimeout = useRef(null)
  const resetFurnitureRef = useRef(null)

  const moveSpeed = modelInfo.radius ? modelInfo.radius * 0.01 : 0.008 // Even slower, careful walking speed
  const isDebugMode = new URLSearchParams(window.location.search).get('debug') === 'true'
  const hasWaypoints = Object.keys(waypoints).length > 0

  const handleResetFurniture = () => {
    if (resetFurnitureRef.current) {
      resetFurnitureRef.current()
      console.log('♻️ Furniture reset to original position')
    }
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
      <div className="absolute top-4 left-4 z-10">
        <div className={`px-4 py-2 rounded-full font-semibold text-sm shadow-lg ${
          isBooked 
            ? 'bg-red-500 text-white' 
            : 'bg-green-500 text-white'
        }`}>
          {isBooked ? '🔒 Booked' : '✓ Available'}
        </div>
      </div>

      {/* Room Navigation Buttons - Only in Orbit Mode and if waypoints exist */}
      {!isWalkMode && hasWaypoints && (
        <div className="absolute top-20 left-4 z-10 space-y-2">
          <div className="bg-black/80 text-white px-3 py-2 rounded-lg text-xs font-semibold mb-2">
            🏠 Quick Tour
          </div>
          {Object.keys(waypoints).map((roomName) => (
            <button
              key={roomName}
              onClick={() => handleWaypointClick(roomName)}
              disabled={isTransitioning}
              className={`block w-full px-3 py-2 rounded-lg text-xs font-medium shadow-lg transition-colors ${
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

      {/* Walk Mode Toggle Button */}
      <div className="absolute bottom-20 left-4 z-10 flex gap-2">
        <button
          onClick={toggleWalkMode}
          className={`px-4 py-2 rounded-lg font-semibold text-sm shadow-lg transition-colors ${
            isWalkMode
              ? 'bg-purple-500 hover:bg-purple-600 text-white'
              : 'bg-gray-700 hover:bg-gray-800 text-white'
          }`}
        >
          {isWalkMode ? '🔄 Orbit Mode' : '🚶 Walk Mode'}
        </button>
        
        {/* Reset Furniture Button - Only show if physics enabled */}
        {enablePhysics && draggableFurniture && (
          <button
            onClick={handleResetFurniture}
            className="px-4 py-2 rounded-lg font-semibold text-sm shadow-lg transition-colors bg-orange-500 hover:bg-orange-600 text-white flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Reset Furniture
          </button>
        )}
      </div>

      {/* Walk Mode Instructions */}
      {isWalkMode && (
        <div className="absolute top-20 left-4 z-10 bg-purple-600/90 text-white px-4 py-3 rounded-lg text-xs shadow-lg">
          <div className="font-semibold mb-1">🚶 Walk Mode Active</div>
          <div>• WASD or Arrow Keys to move</div>
          <div>• E/Space to go up</div>
          <div>• Q/Shift to go down</div>
          <div>• Click to lock mouse</div>
          <div>• <span className="font-bold text-yellow-300">ESC to unlock (for screenshots/scrolling)</span></div>
        </div>
      )}

      {/* Pointer Lock Status Indicator */}
      {isWalkMode && !document.pointerLockElement && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 bg-purple-900/95 text-white px-6 py-4 rounded-lg text-center shadow-2xl border-2 border-purple-400">
          <div className="text-lg font-bold mb-2">👆 Click to Start Walking</div>
          <div className="text-sm">Mouse pointer is not locked</div>
          <div className="text-xs mt-2 text-purple-200">Press ESC anytime to unlock and take screenshots</div>
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
            enablePhysics={enablePhysics}
            onFurnitureFound={setDraggableFurniture}
          />

          {/* Draggable Furniture - simple drag, no physics */}
          {draggableFurniture && (
            <DraggableFurniture
              mesh={draggableFurniture.mesh}
              onReset={resetFurnitureRef}
            />
          )}

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
              />
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

      {/* Instructions */}
      <div className="absolute bottom-4 left-4 right-4 bg-black/70 text-white px-4 py-2 rounded-lg text-sm">
        <p className="flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {isWalkMode 
            ? 'Walk Mode: Use WASD to move • Mouse to look • Click to lock pointer • ESC to unlock'
            : 'Orbit Mode: Drag to rotate • Scroll to zoom • Right-drag to pan' + (hasWaypoints ? ' • Click room buttons for quick tour' : '')
          }
          {isDebugMode && <span className="ml-2 text-yellow-300">• Debug coordinates enabled</span>}
        </p>
      </div>
    </div>
  )
}

export default RoomViewer
