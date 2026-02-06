"use client"

import { useRef, useMemo, useEffect, useState } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import {
  OrbitControls,
  Environment,
  ContactShadows,
  RoundedBox,
} from "@react-three/drei"
import * as THREE from "three"
import type { DeviceTemplate } from "../types"

/* ── helpers ─────────────────────────────────────────── */

/** Convert device px dimensions to 3D world units (1 unit ≈ 1 cm) */
function toWorld(device: DeviceTemplate) {
  // Scale factor: device.width px → real mm → world cm
  // e.g. iPhone 16 Pro Max: 310px maps to 77.6mm = 7.76cm
  const pxPerMm = device.width / (device.width * 0.25) // approximate
  const wCm = device.width * 0.025 // rough scale px → cm
  const hCm = device.height * 0.025
  const dCm = (device.caseDepth || 8) * 0.025
  const rCm = device.borderRadius * 0.025
  return { w: wCm, h: hCm, d: Math.max(dCm, 0.12), r: Math.min(rCm, Math.min(wCm, hCm) * 0.4) }
}

/* ── CaseBody: the main 3D phone case mesh ───────────── */

function CaseBody({
  device,
  textureUrl,
}: {
  device: DeviceTemplate
  textureUrl: string | null
}) {
  const meshRef = useRef<THREE.Mesh>(null)
  const { w, h, d, r } = useMemo(() => toWorld(device), [device])

  // Load design texture
  const texture = useMemo(() => {
    if (!textureUrl) return null
    const tex = new THREE.TextureLoader().load(textureUrl)
    tex.colorSpace = THREE.SRGBColorSpace
    tex.flipY = false
    return tex
  }, [textureUrl])

  // Create materials for each face of the rounded box
  // Order: +X, -X, +Y, -Y, +Z (front/back of case), -Z
  const materials = useMemo(() => {
    const caseSide = new THREE.MeshPhysicalMaterial({
      color: "#c0c0c0",
      roughness: 0.35,
      metalness: 0.05,
      clearcoat: 0.3,
      clearcoatRoughness: 0.4,
    })

    const caseBack = new THREE.MeshPhysicalMaterial({
      color: "#ffffff",
      roughness: 0.3,
      metalness: 0.0,
      clearcoat: 0.5,
      clearcoatRoughness: 0.2,
      map: texture,
    })

    const caseInner = new THREE.MeshPhysicalMaterial({
      color: "#e8e8e8",
      roughness: 0.6,
      metalness: 0.0,
    })

    // [+X right, -X left, +Y top, -Y bottom, +Z back(design), -Z front(inner)]
    return [caseSide, caseSide, caseSide, caseSide, caseBack, caseInner]
  }, [texture])

  // Subtle idle rotation
  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.15
    }
  })

  return (
    <RoundedBox
      ref={meshRef}
      args={[w, h, d]}
      radius={r}
      smoothness={8}
      material={materials}
      castShadow
      receiveShadow
    >
    </RoundedBox>
  )
}

/* ── Camera cutout (dark cylinder on the back) ───────── */

function CameraCutout({
  device,
}: {
  device: DeviceTemplate
}) {
  const { w, h, d } = useMemo(() => toWorld(device), [device])
  const cc = device.cameraCutout
  if (!cc) return null

  // Convert camera cutout px positions to world coords
  // Camera position is relative to top-left of device in px
  const ccW = cc.width * 0.025
  const ccH = cc.height * 0.025
  const ccR = cc.radius * 0.025
  // Center of cutout in device coords → offset from center
  const ccCenterX = (cc.x + cc.width / 2) * 0.025 - w / 2
  const ccCenterY = -(cc.y + cc.height / 2) * 0.025 + h / 2

  return (
    <group position={[ccCenterX, ccCenterY, d / 2 + 0.001]}>
      {/* Camera island background */}
      <mesh>
        <planeGeometry args={[ccW + 0.1, ccH + 0.1]} />
        <meshPhysicalMaterial
          color="#1a1a20"
          roughness={0.15}
          metalness={0.3}
          clearcoat={0.8}
          clearcoatRoughness={0.1}
        />
      </mesh>

      {/* Individual camera lenses */}
      {device.cameraLenses?.map((lens, i) => {
        const lx = lens.cx * 0.025 - w / 2 - ccCenterX
        const ly = -(lens.cy * 0.025 - h / 2) - ccCenterY
        const lr = lens.r * 0.025
        return (
          <group key={i} position={[lx, ly, 0.01]}>
            {/* Chrome ring */}
            <mesh>
              <ringGeometry args={[lr, lr + 0.06, 32]} />
              <meshStandardMaterial
                color="#888888"
                roughness={0.2}
                metalness={0.8}
              />
            </mesh>
            {/* Lens glass */}
            <mesh>
              <circleGeometry args={[lr, 32]} />
              <meshPhysicalMaterial
                color="#0a0a14"
                roughness={0.05}
                metalness={0.4}
                clearcoat={1.0}
                clearcoatRoughness={0.05}
                reflectivity={1}
              />
            </mesh>
            {/* Lens inner ring */}
            <mesh position={[0, 0, 0.005]}>
              <ringGeometry args={[lr * 0.3, lr * 0.55, 32]} />
              <meshStandardMaterial
                color="#15152a"
                roughness={0.3}
                metalness={0.2}
                transparent
                opacity={0.7}
              />
            </mesh>
            {/* Reflection highlight */}
            <mesh position={[-lr * 0.2, lr * 0.2, 0.008]}>
              <circleGeometry args={[lr * 0.2, 16]} />
              <meshBasicMaterial
                color="#ffffff"
                transparent
                opacity={0.15}
              />
            </mesh>
          </group>
        )
      })}

      {/* Flash (Apple devices) */}
      {device.brand === "Apple" && (
        <mesh position={[
          (cc.x + 16) * 0.025 - w / 2 - ccCenterX,
          -((cc.y + cc.height - 16) * 0.025 - h / 2) - ccCenterY,
          0.01,
        ]}>
          <circleGeometry args={[0.12, 16]} />
          <meshStandardMaterial
            color="#ffe8cc"
            roughness={0.4}
            metalness={0.1}
            emissive="#ffe0a0"
            emissiveIntensity={0.1}
          />
        </mesh>
      )}
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

/* ── Main exported component ─────────────────────────── */

type CaseViewer3DProps = {
  device: DeviceTemplate
  textureUrl: string | null
  className?: string
  style?: React.CSSProperties
  autoRotate?: boolean
}

export default function CaseViewer3D({
  device,
  textureUrl,
  className = "",
  style,
  autoRotate = true,
}: CaseViewer3DProps) {
  const [ready, setReady] = useState(false)

  return (
    <div className={`relative ${className}`} style={{ minHeight: 400, ...style }}>
      {/* Loading indicator */}
      {!ready && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="flex flex-col items-center gap-2">
            <div className="h-8 w-8 border-2 border-grey-30 border-t-brand rounded-full animate-spin" />
            <span className="text-[12px] text-grey-40">Loading 3D model...</span>
          </div>
        </div>
      )}

      <Canvas
        shadows
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }}
        onCreated={() => setReady(true)}
        style={{ opacity: ready ? 1 : 0, transition: "opacity 0.3s ease" }}
      >
        <SceneSetup />

        {/* Lighting */}
        <ambientLight intensity={0.5} />
        <directionalLight
          position={[5, 8, 5]}
          intensity={1.2}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <directionalLight position={[-3, 4, -3]} intensity={0.4} />
        <spotLight
          position={[0, 10, 0]}
          intensity={0.6}
          angle={0.5}
          penumbra={0.5}
        />

        {/* Phone case model */}
        <group>
          <CaseBody device={device} textureUrl={textureUrl} />
          <CameraCutout device={device} />
        </group>

        {/* Ground shadow */}
        <ContactShadows
          position={[0, -toWorld(device).h / 2 - 0.5, 0]}
          opacity={0.35}
          scale={20}
          blur={2}
          far={10}
        />

        {/* Environment for reflections */}
        <Environment preset="studio" />

        {/* Orbit controls */}
        <OrbitControls
          enablePan={false}
          enableZoom={true}
          minDistance={8}
          maxDistance={22}
          autoRotate={autoRotate}
          autoRotateSpeed={1.5}
          minPolarAngle={Math.PI * 0.2}
          maxPolarAngle={Math.PI * 0.8}
        />
      </Canvas>
    </div>
  )
}
