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
  const s = 0.01
  const w = device.width * s
  const h = device.height * s
  const d = (device.caseDepth || 8) * s
  const r = device.borderRadius * s
  return { w, h, d: Math.max(d, 0.06), r: Math.min(r, Math.min(w, h) * 0.4) }
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
  const lipH = 0.06
  const props = getMaterialProps(caseMaterial, false)
  const shellOpacity = caseMaterial === "matte" ? 0.06 : caseMaterial === "clear" ? 0.08 : 0.1

  return (
    <group position={[0, 0, -d / 2 - lipH / 2]}>
      <RoundedBox
        args={[w + 0.07, h + 0.07, lipH + 0.01]}
        radius={Math.min(r + 0.03, (w + 0.07) * 0.4)}
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
      <RoundedBox
        args={[w + 0.06, h + 0.06, lipH]}
        radius={Math.min(r + 0.02, (w + 0.06) * 0.4)}
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

/* ── Camera cutout (simple dark hole) ────────────────── */

function CameraCutout({ device }: { device: DeviceTemplate }) {
  const { w, h, d } = useMemo(() => toWorld(device), [device])
  const cc = device.cameraCutout
  if (!cc || device.cameraStyle === "individual") return null

  const s = 0.01
  const ccW = cc.width * s
  const ccH = cc.height * s
  const ccCenterX = (cc.x + cc.width / 2) * s - w / 2
  const ccCenterY = -(cc.y + cc.height / 2) * s + h / 2

  return (
    <group position={[ccCenterX, ccCenterY, d / 2 + 0.001]}>
      <mesh>
        <planeGeometry args={[ccW, ccH]} />
        <meshStandardMaterial transparent opacity={0} />
      </mesh>
      <mesh>
        <ringGeometry args={[Math.max(0.001, Math.min(ccW, ccH) * 0.42), Math.max(0.002, Math.min(ccW, ccH) * 0.5), 64]} />
        <meshBasicMaterial color="#8c8c96" transparent opacity={0.45} />
      </mesh>
      <mesh>
        <planeGeometry args={[ccW, ccH]} />
        <meshBasicMaterial color="#8c8c96" transparent opacity={0.18} />
      </mesh>
    </group>
  )
}

/* ── Scene setup ─────────────────────────────────────── */

function SceneSetup() {
  const { camera } = useThree()
  useEffect(() => {
    camera.position.set(0, 0, 14)
    camera.lookAt(0, 0, 0)
  }, [camera])
  return null
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
    const { w, h } = toWorld(device)
    const base = Math.max(w, h)
    const camZ = Math.min(28, Math.max(10, base * (compact ? 1.25 : 1.1)))
    const minDist = Math.max(6, camZ * 0.55)
    const maxDist = Math.max(minDist + 6, camZ * 1.6)

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
          shadows
          dpr={[1, 2]}
          gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }}
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
          </group>

          <ContactShadows
            position={[0, -toWorld(device).h / 2 - 0.5, 0]}
            opacity={0.3}
            scale={20}
            blur={2.5}
            far={10}
          />

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
