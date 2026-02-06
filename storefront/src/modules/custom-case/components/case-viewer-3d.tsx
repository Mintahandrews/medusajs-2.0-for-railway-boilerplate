"use client"

import {
  useRef,
  useMemo,
  useEffect,
  useState,
  forwardRef,
  useImperativeHandle,
  useCallback,
} from "react"
import { Canvas, useThree } from "@react-three/fiber"
import {
  OrbitControls,
  Edges,
  Environment,
  ContactShadows,
  RoundedBox,
} from "@react-three/drei"
import * as THREE from "three"
import type { DeviceTemplate } from "../types"
import type { CaseMaterial, EnvironmentPreset, CaseViewer3DHandle } from "../case-viewer-types"

function getMaterialProps(mat: CaseMaterial, isDesignFace: boolean) {
  switch (mat) {
    case "glossy":
      return {
        roughness: isDesignFace ? 0.12 : 0.1,
        metalness: 0.0,
        clearcoat: 1.0,
        clearcoatRoughness: 0.02,
        ior: 1.5,
        specularIntensity: 0.8,
        envMapIntensity: 1.2,
      }
    case "matte":
      return {
        roughness: isDesignFace ? 0.5 : 0.65,
        metalness: 0.0,
        clearcoat: 0.0,
        ior: 1.45,
        sheen: 0.3,
        sheenRoughness: 0.5,
        envMapIntensity: 1.0,
      }
    case "clear":
      return {
        roughness: 0.05,
        metalness: 0.0,
        clearcoat: 1.0,
        clearcoatRoughness: 0.02,
        // Only use alpha transparency for the design face (to support transparent PNGs)
        // For the clear shell itself, use transmission (refraction) which requires transparent=false for best results
        transparent: isDesignFace,
        opacity: 1.0,
        transmission: isDesignFace ? 0 : 0.98,
        ior: 1.54, // Polycarbonate
        thickness: 2.0,
        attenuationDistance: 0.8,
        attenuationColor: "#ffffff",
        specularIntensity: 0.9,
        envMapIntensity: 1.5,
      }
    case "soft-touch":
      return {
        roughness: 0.7,
        metalness: 0.0,
        clearcoat: 0.0,
        ior: 1.45,
        sheen: 1.0, // Velvet-like sheen for silicone
        sheenRoughness: 0.9,
        sheenColor: "#ffffff",
        envMapIntensity: 0.8,
      }
  }
}

/* ── helpers ─────────────────────────────────────────── */

function toWorld(device: DeviceTemplate) {
  const PX_SCALE = 0.01 // canvas px → world  (4 px/mm × 0.01 = 0.04 per mm)
  const MM_SCALE = 0.04  // mm → world (same effective scale)
  const w = device.width * PX_SCALE
  const h = device.height * PX_SCALE
  // Use physical depth + 1.5 mm case shell for sleek, realistic thickness
  const physDepthMm = device.physicalSize?.depth ?? 8
  const caseShellMm = 1.5
  const d = (physDepthMm + caseShellMm) * MM_SCALE
  const r = device.borderRadius * PX_SCALE
  return { w, h, d, r: Math.min(r, Math.min(w, h) * 0.4), PX_SCALE, MM_SCALE }
}

function useCaseGeometry(device: DeviceTemplate) {
  return useMemo(() => {
    const { w, h, d, r, PX_SCALE } = toWorld(device)
    
    // 1. Create the main case shape with rounded corners
    const shape = new THREE.Shape()
    const x = -w / 2, y = -h / 2
    shape.moveTo(x, y + r)
    shape.lineTo(x, y + h - r)
    shape.quadraticCurveTo(x, y + h, x + r, y + h)
    shape.lineTo(x + w - r, y + h)
    shape.quadraticCurveTo(x + w, y + h, x + w, y + h - r)
    shape.lineTo(x + w, y + r)
    shape.quadraticCurveTo(x + w, y, x + w - r, y)
    shape.lineTo(x + r, y)
    shape.quadraticCurveTo(x, y, x, y + r)

    // 2. Create the camera cutout hole
    if (device.cameraCutout && device.cameraStyle !== "individual") {
      const cc = device.cameraCutout
      const hole = new THREE.Path()
      // Convert canvas coords (top-left 0,0) to world coords (center 0,0, Y-up)
      // Canvas Y is down, World Y is up.
      const ccW = cc.width * PX_SCALE
      const ccH = cc.height * PX_SCALE
      const ccX = (cc.x + cc.width / 2) * PX_SCALE - w / 2
      const ccY = -(cc.y + cc.height / 2) * PX_SCALE + h / 2
      const ccR = cc.radius * PX_SCALE

      const hx = ccX - ccW / 2
      const hy = ccY - ccH / 2
      
      // Counter-clockwise hole
      hole.moveTo(hx, hy + ccR)
      hole.quadraticCurveTo(hx, hy, hx + ccR, hy)
      hole.lineTo(hx + ccW - ccR, hy)
      hole.quadraticCurveTo(hx + ccW, hy, hx + ccW, hy + ccR)
      hole.lineTo(hx + ccW, hy + ccH - ccR)
      hole.quadraticCurveTo(hx + ccW, hy + ccH, hx + ccW - ccR, hy + ccH)
      hole.lineTo(hx + ccR, hy + ccH)
      hole.quadraticCurveTo(hx, hy + ccH, hx, hy + ccH - ccR)
      hole.lineTo(hx, hy + ccR)
      
      shape.holes.push(hole)
    } else if (device.cameraStyle === "individual" && device.cameraLenses) {
      // Create individual circular holes for each lens
      device.cameraLenses.forEach((lens) => {
        const hole = new THREE.Path()
        const lx = lens.cx * PX_SCALE - w / 2
        const ly = -(lens.cy * PX_SCALE) + h / 2
        const lr = lens.r * PX_SCALE
        hole.absarc(lx, ly, lr, 0, Math.PI * 2, true) // true = counter-clockwise
        shape.holes.push(hole)
      })
    }

    // 3. Extrude
    const extrudeSettings = {
      depth: d,
      bevelEnabled: true,
      bevelSegments: 4,
      bevelSize: r * 0.1, // Subtle bevel based on corner radius
      bevelThickness: r * 0.1,
      curveSegments: 24,
    }
    const geo = new THREE.ExtrudeGeometry(shape, extrudeSettings)

    // 4. Center geometry (Extrude creates it starting at Z=0)
    geo.center()

    // 5. Fix Materials & UVs
    // Default Groups: 0: Sides, 1: Caps (Top/Bottom)
    // We want: 0: Sides, 1: Front(Inner), 2: Back(Design)
    
    const posAttribute = geo.attributes.position
    const uvAttribute = geo.attributes.uv
    const count = posAttribute.count
    
    // Reset groups to apply our own
    geo.clearGroups()
    
    // We'll iterate faces (sets of 3 vertices) to identify orientation
    // But modifying existing groups is tricky. 
    // Easier strategy: The geometry comes with groups [Start, Count, MatIndex].
    // We can assume the default order if we check.
    // However, robust way is to re-assign material indices based on Normal Z.
    
    // Compute vertex normals first
    geo.computeVertexNormals()
    const normAttribute = geo.attributes.normal

    // We can't change materialIndex per face in BufferGeometry easily without splitting vertices or groups.
    // Fortunately ExtrudeGeometry organizes vertices fairly well.
    // Let's iterate and build groups manually? No, too complex.
    
    // Simpler hack: We know ExtrudeGeometry outputs [Side faces, Cap faces].
    // The Cap faces are the last chunk.
    // Let's just traverse and patch. 
    // Actually, simply checking normal Z is enough to differentiate Front/Back caps.
    
    // We will separate the "Caps" group into "Front" and "Back"
    // But BufferGeometry groups define ranges. We need the faces to be contiguous.
    // ExtrudeGeometry usually puts all Bottom faces then all Top faces (or mixed).
    // Let's just use the bounding box to map UVs for the Back face.
    
    // UV Mapping for Design Face (Back, Z > 0 typically or Z < 0? geo.center() puts it around 0)
    // In our view, Back of phone is facing camera? 
    // Scene setup: camera at +Z. Phone back is at +Z. Phone screen is at -Z.
    // So we want faces with Normal.Z > 0.5 to have Design UVs.
    
    for (let i = 0; i < count; i++) {
      const nz = normAttribute.getZ(i)
      const x = posAttribute.getX(i)
      const y = posAttribute.getY(i)
      
      if (nz > 0.5) {
        // Back Face (Design)
        // Map world XY to 0..1 UV based on width/height
        // w, h are full dimensions.
        // u = (x + w/2) / w
        // v = (y + h/2) / h
        uvAttribute.setXY(i, (x + w / 2) / w, (y + h / 2) / h)
      } else if (nz < -0.5) {
        // Front Face (Screen side)
        // Standard UVs or planar
      } else {
        // Sides - keep default wrapping or adjust if needed
      }
    }
    uvAttribute.needsUpdate = true

    // To assign separate materials, we need to sort/split groups. 
    // For now, let's just use a multi-material approach where we check Normal in shader? No.
    // Let's assume the standard group 1 contains all caps.
    // We will assume faces with Normal Z > 0 are Design, Z < 0 are Inner.
    // Since we can't easily split the draw call without reordering vertices, 
    // we will stick to 2 materials: [Side, Back/Inner]. 
    // BUT we need 3.
    // Okay, simple fallback: Render the mesh TWICE? No.
    
    // REAL SOLUTION: Filter the geometry into 3 separate geometries? Expensive.
    // ACCEPTABLE COMPROMISE: Use texture transparency to mask the hole. 
    // WAIT, we have physical hole now. 
    // We just need the "Back" material to apply to Z+ faces and "Inner" to Z- faces.
    // We can set the materialIndex for the faces.
    // ExtrudeGeometry usually adds 2 groups: 0 (sides), 1 (caps).
    // We can iterate the index buffer (if present) or just vertex count for non-indexed.
    // ExtrudeGeometry is non-indexed by default? No, usually indexed.
    
    return geo
  }, [device])
}

/* ── CaseBody ────────────────────────────────────────── */

/**
 * Split ExtrudeGeometry into 3 material groups based on face normals:
 *   Group 0 = Sides (normals mostly in XY plane)
 *   Group 1 = Back face / Design (normal Z > 0.5)
 *   Group 2 = Front face / Inner (normal Z < -0.5)
 */
function splitGeometryGroups(geo: THREE.ExtrudeGeometry) {
  geo.computeVertexNormals()
  const index = geo.index
  if (!index) return // non-indexed, skip

  const normals = geo.attributes.normal
  const faceCount = index.count / 3

  // Classify each triangle
  const sides: number[] = []
  const backs: number[] = []
  const fronts: number[] = []

  for (let f = 0; f < faceCount; f++) {
    const i0 = index.getX(f * 3)
    const i1 = index.getX(f * 3 + 1)
    const i2 = index.getX(f * 3 + 2)
    const avgNz = (normals.getZ(i0) + normals.getZ(i1) + normals.getZ(i2)) / 3

    if (avgNz > 0.4) {
      backs.push(i0, i1, i2)
    } else if (avgNz < -0.4) {
      fronts.push(i0, i1, i2)
    } else {
      sides.push(i0, i1, i2)
    }
  }

  // Rebuild index buffer: sides first, then backs, then fronts
  const newIndices = new Uint32Array(sides.length + backs.length + fronts.length)
  newIndices.set(sides, 0)
  newIndices.set(backs, sides.length)
  newIndices.set(fronts, sides.length + backs.length)
  geo.setIndex(new THREE.BufferAttribute(newIndices, 1))

  // Set groups
  geo.clearGroups()
  geo.addGroup(0, sides.length, 0) // sides
  geo.addGroup(sides.length, backs.length, 1) // back (design)
  geo.addGroup(sides.length + backs.length, fronts.length, 2) // front (inner)
}

function CaseBody({
  device,
  textureUrl,
  caseMaterial,
  caseColor,
}: {
  device: DeviceTemplate
  textureUrl: string | null
  caseMaterial: CaseMaterial
  caseColor: string
}) {
  const baseGeometry = useCaseGeometry(device)
  const meshRef = useRef<THREE.Mesh>(null)

  // Split geometry into 3 material groups
  const geometry = useMemo(() => {
    const geo = baseGeometry.clone()
    splitGeometryGroups(geo)
    return geo
  }, [baseGeometry])

  useEffect(() => {
    return () => { geometry.dispose() }
  }, [geometry])

  // Load texture with proper live-update support
  const texture = useMemo(() => {
    if (!textureUrl) return null
    const tex = new THREE.TextureLoader().load(textureUrl)
    tex.colorSpace = THREE.SRGBColorSpace
    tex.flipY = false
    tex.wrapS = THREE.ClampToEdgeWrapping
    tex.wrapT = THREE.ClampToEdgeWrapping
    tex.minFilter = THREE.LinearMipmapLinearFilter
    tex.magFilter = THREE.LinearFilter
    tex.generateMipmaps = true
    tex.anisotropy = 8
    return tex
  }, [textureUrl])

  useEffect(() => {
    return () => { texture?.dispose() }
  }, [texture])

  // 3 materials: [sides, back/design, front/inner]
  const materials = useMemo(() => {
    const sideProps = getMaterialProps(caseMaterial, false)
    const backProps = getMaterialProps(caseMaterial, true)

    const caseSide = new THREE.MeshPhysicalMaterial({
      color: caseColor,
      ...sideProps,
    } as THREE.MeshPhysicalMaterialParameters)

    const caseBack = new THREE.MeshPhysicalMaterial({
      color: "#ffffff",
      map: texture,
      ...backProps,
      transparent: caseMaterial === "clear",
      alphaTest: 0.1,
    } as THREE.MeshPhysicalMaterialParameters)

    const caseInner = new THREE.MeshPhysicalMaterial({
      color: caseMaterial === "clear" ? "#1a1a1a" : "#111111",
      roughness: 0.8,
      metalness: 0.0,
      ...(caseMaterial === "clear" ? { transparent: true, opacity: 0.4 } : {}),
    } as THREE.MeshPhysicalMaterialParameters)

    return [caseSide, caseBack, caseInner]
  }, [texture, caseMaterial, caseColor])

  useEffect(() => {
    return () => { materials.forEach((m) => m.dispose()) }
  }, [materials])

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      material={materials}
      castShadow
      receiveShadow
    />
  )
}

/* ── CameraBump (Physical Lip) ────────────────────────── */

function CameraBump({ device, caseColor, caseMaterial }: { device: DeviceTemplate, caseColor: string, caseMaterial: CaseMaterial }) {
  const { w, h, d, PX_SCALE } = useMemo(() => toWorld(device), [device])
  
  const geo = useMemo(() => {
    // 1. Module Style (One big bump)
    if (device.cameraCutout && device.cameraStyle !== "individual") {
      const cc = device.cameraCutout
      const ccW = cc.width * PX_SCALE
      const ccH = cc.height * PX_SCALE
      const ccR = cc.radius * PX_SCALE
      const lipThick = 0.04 // ~1mm lip thickness
      const lipHeight = 0.04 // ~1mm bump height

      // Shape is the outline
      const shape = new THREE.Shape()
      // Outer shape
      shape.moveTo(0, ccR)
      shape.lineTo(0, ccH - ccR)
      shape.quadraticCurveTo(0, ccH, ccR, ccH)
      shape.lineTo(ccW - ccR, ccH)
      shape.quadraticCurveTo(ccW, ccH, ccW, ccH - ccR)
      shape.lineTo(ccW, ccR)
      shape.quadraticCurveTo(ccW, 0, ccW - ccR, 0)
      shape.lineTo(ccR, 0)
      shape.quadraticCurveTo(0, 0, 0, ccR)

      // Inner hole (creating the ring)
      const hole = new THREE.Path()
      const inset = lipThick
      const hW = ccW - inset * 2
      const hH = ccH - inset * 2
      const hR = Math.max(0.01, ccR - inset)
      
      hole.moveTo(inset, inset + hR)
      hole.quadraticCurveTo(inset, inset, inset + hR, inset)
      hole.lineTo(inset + hW - hR, inset)
      hole.quadraticCurveTo(inset + hW, inset, inset + hW, inset + hR)
      hole.lineTo(inset + hW, inset + hH - hR)
      hole.quadraticCurveTo(inset + hW, inset + hH, inset + hW - hR, inset + hH)
      hole.lineTo(inset + hR, inset + hH)
      hole.quadraticCurveTo(inset, inset + hH, inset, inset + hH - hR)
      hole.lineTo(inset, inset + hR)
      
      shape.holes.push(hole)
      
      const extrudeSettings = {
        depth: lipHeight,
        bevelEnabled: true,
        bevelSegments: 3,
        bevelSize: 0.01,
        bevelThickness: 0.01,
        curveSegments: 24,
      }
      
      const g = new THREE.ExtrudeGeometry(shape, extrudeSettings)
      g.center()
      return { type: "module", geometry: g }
    } 
    
    // 2. Individual Style (Multiple rings)
    else if (device.cameraStyle === "individual" && device.cameraLenses) {
      // Create a single ring geometry to instance
      // Assuming all lenses have roughly similar radii, or use the first one. 
      // Samsung lenses vary slightly, but for the bump/lip they are usually uniform.
      const lens = device.cameraLenses[0]
      if (!lens) return null

      const r = lens.r * PX_SCALE
      const lipThick = 0.03
      const lipHeight = 0.03
      
      const shape = new THREE.Shape()
      shape.absarc(0, 0, r + lipThick, 0, Math.PI * 2, false)
      const hole = new THREE.Path()
      hole.absarc(0, 0, r, 0, Math.PI * 2, true)
      shape.holes.push(hole)
      
      const extrudeSettings = {
        depth: lipHeight,
        bevelEnabled: true,
        bevelSegments: 3,
        bevelSize: 0.005,
        bevelThickness: 0.005,
        curveSegments: 32,
      }
      const g = new THREE.ExtrudeGeometry(shape, extrudeSettings)
      // No center() here, we want origin at 0,0
      return { type: "individual", geometry: g }
    }
    
    return null
  }, [device, PX_SCALE])

  if (!geo) return null

  // Material for the bump - slightly darker/matte or same as case
  const bumpMat = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: caseColor,
      roughness: 0.4,
      metalness: 0.1,
    })
  }, [caseColor])

  useEffect(() => {
    return () => { bumpMat.dispose() }
  }, [bumpMat])

  // Render Module Style
  if (geo.type === "module" && device.cameraCutout) {
    const cc = device.cameraCutout
    const ccCenterX = (cc.x + cc.width / 2) * PX_SCALE - w / 2
    const ccCenterY = -(cc.y + cc.height / 2) * PX_SCALE + h / 2
    return (
      <mesh
        geometry={geo.geometry}
        material={bumpMat}
        position={[ccCenterX, ccCenterY, d / 2 + 0.02]} 
        castShadow
        receiveShadow
      />
    )
  }

  // Render Individual Style
  if (geo.type === "individual" && device.cameraLenses) {
    return (
      <group position={[0, 0, d / 2 + 0.02]}>
        {device.cameraLenses.map((lens, i) => {
          const cx = lens.cx * PX_SCALE - w / 2
          const cy = -(lens.cy * PX_SCALE) + h / 2
          return (
            <mesh
              key={i}
              geometry={geo.geometry}
              material={bumpMat}
              position={[cx, cy, 0]}
              castShadow
              receiveShadow
            />
          )
        })}
      </group>
    )
  }

  return null
}

/* ── Phone Screen (visible from front) ─────────────── */

function PhoneScreen({ device }: { device: DeviceTemplate }) {
  const { w, h, d } = useMemo(() => toWorld(device), [device])
  const screenInset = 0.15 // slight inset from edges
  return (
    <mesh position={[0, 0, -d / 2 - 0.001]} rotation={[0, 0, 0]}>
      <planeGeometry args={[w - screenInset, h - screenInset]} />
      <meshPhysicalMaterial
        color="#050505"
        roughness={0.05}
        metalness={0.1}
        clearcoat={1.0}
        clearcoatRoughness={0.02}
        envMapIntensity={1.5}
        reflectivity={1.0}
      />
    </mesh>
  )
}

function PrintableGuide({ device }: { device: DeviceTemplate }) {
  const { w, h, d } = useMemo(() => toWorld(device), [device])
  const inset = device.inset
  const s = 0.01
  const printW = (device.width - inset.left - inset.right) * s
  const printH = (device.height - inset.top - inset.bottom) * s
  const cx = (inset.left + (device.width - inset.left - inset.right) / 2) * s - w / 2
  const cy = -(inset.top + (device.height - inset.top - inset.bottom) / 2) * s + h / 2

  return (
    <mesh position={[cx, cy, d / 2 + 0.002]}>
      <planeGeometry args={[printW, printH]} />
      <meshBasicMaterial transparent opacity={0} />
      <Edges color="#3b82f6" />
    </mesh>
  )
}

/* ── Case lip/edge (raised border around the phone) ─── */

function CaseLip({
  device,
  caseColor,
  caseMaterial,
}: {
  device: DeviceTemplate
  caseColor: string
  caseMaterial: CaseMaterial
}) {
  const { w, h, d, r } = useMemo(() => toWorld(device), [device])
  const lipH = Math.max(0.06, d * 0.15) // proportional lip height (~1.5 mm)
  const edge = 0.08 // lip extends beyond case body
  const props = getMaterialProps(caseMaterial, false)
  const shellOpacity = caseMaterial === "matte" ? 0.06 : caseMaterial === "clear" ? 0.08 : 0.1

  return (
    <group position={[0, 0, -d / 2 - lipH / 2]}>
      {/* Subtle highlight shell */}
      <RoundedBox
        args={[w + edge + 0.01, h + edge + 0.01, lipH + 0.01]}
        radius={Math.min(r + 0.03, (w + edge + 0.01) * 0.4)}
        smoothness={10}
      >
        <meshPhysicalMaterial
          transparent
          opacity={shellOpacity}
          roughness={0.1}
          metalness={0.1}
          clearcoat={1.0}
          clearcoatRoughness={0.0}
          transmission={caseMaterial === "clear" ? 0.6 : 0}
          ior={1.5}
          specularIntensity={1}
          color="#ffffff"
        />
      </RoundedBox>
      {/* Solid lip */}
      <RoundedBox
        args={[w + edge, h + edge, lipH]}
        radius={Math.min(r + 0.02, (w + edge) * 0.4)}
        smoothness={10}
        castShadow
      >
        <meshPhysicalMaterial
          color={caseColor}
          {...(props as any)}
        />
      </RoundedBox>
    </group>
  )
}

/* ── Screenshot helper ───────────────────────────────── */

function ScreenshotHelper({
  onGlReady,
}: {
  onGlReady: (gl: THREE.WebGLRenderer) => void
}) {
  const { gl } = useThree()
  useEffect(() => {
    onGlReady(gl)
  }, [gl, onGlReady])
  return null
}

/* ── Main exported component ─────────────────────────── */

type CaseViewer3DProps = {
  device: DeviceTemplate
  textureUrl: string | null
  caseMaterial?: CaseMaterial
  caseColor?: string
  envPreset?: EnvironmentPreset
  className?: string
  style?: React.CSSProperties
  autoRotate?: boolean
  compact?: boolean
  performanceMode?: boolean
  showGuides?: boolean
}

const CaseViewer3D = forwardRef<CaseViewer3DHandle, CaseViewer3DProps>(
  function CaseViewer3D(
    {
      device,
      textureUrl,
      caseMaterial = "glossy",
      caseColor = "#c0c0c0",
      envPreset = "studio",
      className = "",
      style,
      autoRotate = true,
      compact = false,
      performanceMode = false,
      showGuides = false,
    },
    ref
  ) {
    const [ready, setReady] = useState(false)
    const glRef = useRef<THREE.WebGLRenderer | null>(null)

    const handleGlReady = useCallback((gl: THREE.WebGLRenderer) => {
      glRef.current = gl
    }, [])

    useImperativeHandle(ref, () => ({
      screenshot: () => {
        if (!glRef.current) return null
        return glRef.current.domElement.toDataURL("image/png")
      },
    }))

    const minH = compact ? 260 : 400
    const { w, h, d } = toWorld(device)
    const diag = Math.sqrt(w * w + h * h + d * d)
    const camZ = Math.min(30, Math.max(10, diag * (compact ? 1.15 : 1.05)))
    const minDist = Math.max(6, camZ * 0.5)
    const maxDist = Math.max(minDist + 8, camZ * 1.8)

    return (
      <div className={`relative ${className}`} style={{ minHeight: minH, ...style }}>
        {!ready && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="flex flex-col items-center gap-2">
              <div className="h-8 w-8 border-2 border-grey-30 border-t-brand rounded-full animate-spin" />
              <span className="text-[12px] text-grey-40">Loading 3D...</span>
            </div>
          </div>
        )}

        <Canvas
          shadows={!performanceMode}
          dpr={performanceMode ? 1 : [1, 2]}
          gl={{ antialias: !performanceMode, alpha: true, preserveDrawingBuffer: true }}
          camera={{ position: [0, 0, camZ], fov: 35 }}
          onCreated={({ gl }) => {
            gl.outputColorSpace = THREE.SRGBColorSpace
            gl.toneMapping = THREE.ACESFilmicToneMapping
            gl.toneMappingExposure = 1.05
            gl.setClearColor(0x000000, 0)
            setReady(true)
          }}
          style={{ opacity: ready ? 1 : 0, transition: "opacity 0.3s ease" }}
        >
          <ScreenshotHelper onGlReady={handleGlReady} />

          <ambientLight intensity={0.3} />
          {/* Key Light - Main definition */}
          <directionalLight
            position={[5, 5, 5]}
            intensity={1.5}
            castShadow
            shadow-mapSize={[1024, 1024]}
            shadow-bias={-0.0001}
          />
          {/* Fill Light - Softens shadows */}
          <directionalLight position={[-5, 0, 5]} intensity={0.5} color="#eef" />
          {/* Rim Light - Highlights edges/contours */}
          <directionalLight position={[0, 5, -5]} intensity={1.0} color="#ccf" />
          {/* Top Light - Gloss reflections */}
          <spotLight position={[0, 10, 0]} intensity={0.5} angle={0.5} penumbra={1} />

          <group rotation={[0.05, 0, 0]}>
            <CaseBody
              device={device}
              textureUrl={textureUrl}
              caseMaterial={caseMaterial}
              caseColor={caseColor}
            />
            <CaseLip device={device} caseColor={caseColor} caseMaterial={caseMaterial} />
            <CameraBump device={device} caseColor={caseColor} caseMaterial={caseMaterial} />
            <PhoneScreen device={device} />
            {showGuides && <PrintableGuide device={device} />}
          </group>

          {!performanceMode && (
            <ContactShadows
              position={[0, -h / 2 - 0.5, 0]}
              opacity={0.3}
              scale={20}
              blur={2.5}
              far={10}
            />
          )}

          <Environment preset={envPreset} blur={0.6} />

          <OrbitControls
            enablePan={false}
            enableZoom={!compact}
            minDistance={minDist}
            maxDistance={maxDist}
            autoRotate={autoRotate}
            autoRotateSpeed={1.2}
            minPolarAngle={Math.PI * 0.25}
            maxPolarAngle={Math.PI * 0.75}
          />
        </Canvas>
      </div>
    )
  }
)

export default CaseViewer3D
