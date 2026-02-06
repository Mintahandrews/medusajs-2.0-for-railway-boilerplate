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
        ...(isDesignFace ? {} : { envMapIntensity: 1.2 }),
      }
    case "matte":
      return {
        roughness: isDesignFace ? 0.55 : 0.7,
        metalness: 0.0,
        clearcoat: 0.0,
        clearcoatRoughness: 0.8,
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
      }
    case "soft-touch":
      return {
        roughness: isDesignFace ? 0.45 : 0.85,
        metalness: 0.0,
        clearcoat: 0.15,
        clearcoatRoughness: 0.6,
      }
  }
}

/* ── helpers ─────────────────────────────────────────── */

function toWorld(device: DeviceTemplate) {
  const wCm = device.width * 0.025
  const hCm = device.height * 0.025
  const dCm = (device.caseDepth || 8) * 0.025
  const rCm = device.borderRadius * 0.025
  return { w: wCm, h: hCm, d: Math.max(dCm, 0.12), r: Math.min(rCm, Math.min(wCm, hCm) * 0.4) }
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
    return tex
  }, [textureUrl])

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

    return [caseSide, caseSide, caseSide, caseSide, caseBack, caseInner]
  }, [texture, caseMaterial, caseColor])

  return (
    <RoundedBox
      ref={meshRef}
      args={[w, h, d]}
      radius={r}
      smoothness={8}
      material={materials}
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

  return (
    <group position={[0, 0, -d / 2 - lipH / 2]}>
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
  if (!cc) return null

  const ccW = cc.width * 0.025
  const ccH = cc.height * 0.025
  const ccR = Math.min(cc.radius * 0.025, Math.min(ccW, ccH) * 0.5)
  const ccCenterX = (cc.x + cc.width / 2) * 0.025 - w / 2
  const ccCenterY = -(cc.y + cc.height / 2) * 0.025 + h / 2

  return (
    <mesh position={[ccCenterX, ccCenterY, d / 2 + 0.001]}>
      <planeGeometry args={[ccW, ccH]} />
      <meshStandardMaterial color="#1a1a1e" roughness={0.5} metalness={0.1} />
    </mesh>
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
    const camZ = compact ? 16 : 14

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
          onCreated={() => setReady(true)}
          style={{ opacity: ready ? 1 : 0, transition: "opacity 0.3s ease" }}
        >
          <ScreenshotHelper onGlReady={handleGlReady} />

          <ambientLight intensity={0.6} />
          <directionalLight position={[5, 8, 5]} intensity={1.0} castShadow />
          <directionalLight position={[-4, 3, -4]} intensity={0.3} />
          <spotLight position={[0, 12, 4]} intensity={0.5} angle={0.4} penumbra={0.6} />

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
            minDistance={8}
            maxDistance={22}
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
