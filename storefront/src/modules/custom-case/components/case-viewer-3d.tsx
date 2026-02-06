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
        roughness: isDesignFace ? 0.15 : 0.2,
        metalness: 0.02,
        clearcoat: 1.0,
        clearcoatRoughness: 0.05,
        ior: 1.5,
        specularIntensity: 0.7,
        ...(isDesignFace ? {} : { envMapIntensity: 1.2 }),
      }
    case "matte":
      return {
        roughness: isDesignFace ? 0.55 : 0.7,
        metalness: 0.0,
        clearcoat: 0.0,
        clearcoatRoughness: 0.8,
        ior: 1.45,
        specularIntensity: 0.25,
      }
    case "clear":
      return {
        roughness: isDesignFace ? 0.1 : 0.08,
        metalness: 0.0,
        clearcoat: 1.0,
        clearcoatRoughness: 0.03,
        transparent: true,
        opacity: isDesignFace ? 0.92 : 0.4,
        transmission: isDesignFace ? 0 : 0.5,
        ior: 1.52,
        thickness: isDesignFace ? 0 : 0.6,
        specularIntensity: 0.8,
      }
    case "soft-touch":
      return {
        roughness: isDesignFace ? 0.45 : 0.85,
        metalness: 0.0,
        clearcoat: 0.15,
        clearcoatRoughness: 0.6,
        ior: 1.45,
        specularIntensity: 0.35,
      }
  }
}

/* ── helpers ─────────────────────────────────────────── */

function toWorld(device: DeviceTemplate) {
  const PX_SCALE = 0.01 // canvas px → world  (4 px/mm × 0.01 = 0.04 per mm)
  const MM_SCALE = 0.04  // mm → world (same effective scale)
  const w = device.width * PX_SCALE
  const h = device.height * PX_SCALE
  // Use physical depth + ~2 mm case shell for realistic thickness
  const physDepthMm = device.physicalSize?.depth ?? 8
  const caseShellMm = 2
  const d = (physDepthMm + caseShellMm) * MM_SCALE
  const r = device.borderRadius * PX_SCALE
  return { w, h, d, r: Math.min(r, Math.min(w, h) * 0.4) }
}

/* ── CaseBody ────────────────────────────────────────── */

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
  const meshRef = useRef<THREE.Mesh>(null)
  const { w, h, d, r } = useMemo(() => toWorld(device), [device])

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

  const materials = useMemo(() => {
    const sideProps = getMaterialProps(caseMaterial, false)
    const backProps = getMaterialProps(caseMaterial, true)

    const caseSide = new THREE.MeshPhysicalMaterial({
      color: caseColor,
      ...sideProps,
    } as THREE.MeshPhysicalMaterialParameters)

    const caseBack = new THREE.MeshPhysicalMaterial({
      color: caseMaterial === "clear" ? "#ffffff" : "#ffffff",
      map: texture,
      ...backProps,
    } as THREE.MeshPhysicalMaterialParameters)

    const caseInner = new THREE.MeshPhysicalMaterial({
      color: caseMaterial === "clear" ? "#f0f0f0" : "#e0e0e0",
      roughness: 0.7,
      metalness: 0.0,
      ...(caseMaterial === "clear" ? { transparent: true, opacity: 0.3 } : {}),
    } as THREE.MeshPhysicalMaterialParameters)

    return { list: [caseSide, caseSide, caseSide, caseSide, caseBack, caseInner], unique: [caseSide, caseBack, caseInner] }
  }, [texture, caseMaterial, caseColor])

  useEffect(() => {
    return () => { materials.unique.forEach((m) => m.dispose()) }
  }, [materials])

  return (
    <RoundedBox
      ref={meshRef}
      args={[w, h, d]}
      radius={r}
      smoothness={8}
      material={materials.list}
      castShadow
      receiveShadow
    />
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
        smoothness={8}
      >
        <meshPhysicalMaterial
          transparent
          opacity={shellOpacity}
          roughness={0.15}
          metalness={0.0}
          clearcoat={1.0}
          clearcoatRoughness={0.08}
          ior={1.5}
          specularIntensity={0.6}
          color="#ffffff"
        />
      </RoundedBox>
      {/* Solid lip */}
      <RoundedBox
        args={[w + edge, h + edge, lipH]}
        radius={Math.min(r + 0.02, (w + edge) * 0.4)}
        smoothness={6}
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

/* ── Camera cutout (see-through with subtle outline) ──── */

function CameraCutout({ device }: { device: DeviceTemplate }) {
  const { w, h, d } = useMemo(() => toWorld(device), [device])
  const cc = device.cameraCutout
  if (!cc || device.cameraStyle === "individual") return null

  const s = 0.01
  const ccW = cc.width * s
  const ccH = cc.height * s
  const ccCenterX = (cc.x + cc.width / 2) * s - w / 2
  const ccCenterY = -(cc.y + cc.height / 2) * s + h / 2
  const minDim = Math.min(ccW, ccH)

  return (
    <group position={[ccCenterX, ccCenterY, d / 2 + 0.001]}>
      {/* Subtle outline ring — fully see-through center */}
      <mesh>
        <ringGeometry args={[minDim * 0.46, minDim * 0.5, 64]} />
        <meshBasicMaterial color="#a0a0a8" transparent opacity={0.3} depthWrite={false} />
      </mesh>
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

          <ambientLight intensity={0.5} />
          <directionalLight position={[6, 10, 7]} intensity={1.35} castShadow />
          <directionalLight position={[-5, 2, -6]} intensity={0.45} />
          <directionalLight position={[0, 6, -10]} intensity={0.55} />
          <spotLight position={[0, 12, 6]} intensity={0.35} angle={0.35} penumbra={0.75} />

          <group rotation={[0.05, 0, 0]}>
            <CaseBody
              device={device}
              textureUrl={textureUrl}
              caseMaterial={caseMaterial}
              caseColor={caseColor}
            />
            <CaseLip device={device} caseColor={caseColor} caseMaterial={caseMaterial} />
            <CameraCutout device={device} />
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

          <Environment preset={envPreset} />

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
