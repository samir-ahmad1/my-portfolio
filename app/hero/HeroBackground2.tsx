// "use client";

// import { Canvas, useFrame } from "@react-three/fiber";
// import { useEffect, useRef } from "react";
// import * as THREE from "three";
// import gsap from "gsap";

// interface HeroBackgroundProps {
//   progress?: number;
// }

// const vertexShader = `
//   uniform float uTime;
//   uniform vec2 uMouse;
//   uniform float uProgress;

//   varying vec2 vUv;
//   varying vec3 vWorldPosition;
//   varying float vElevation;
//   varying float vFold;

//   void main() {
//     vUv = uv;

//     vec3 pos = position;

//     float t = uTime * 0.35;

//     // Large flowing waves
//     float wave1 = sin(pos.x * 1.8 + t) * 0.35;

//     float wave2 = sin(
//       pos.x * 2.8 - pos.y * 1.4 + t * 0.8
//     ) * 0.18;

//     // Secondary fabric folds
//     float wave3 = cos(
//       pos.x * 4.5 + pos.y * 2.0 - t
//     ) * 0.10;

//     // Fine silk wrinkles
//     float fineFolds = sin(
//       pos.x * 9.0 + pos.y * 3.0 + t * 1.5
//     ) * 0.035;

//     float microFolds = sin(
//       pos.x * 15.0 - pos.y * 5.0 + t
//     ) * 0.012;

//     // Mouse interaction
//     float mouseDistance = distance(
//       pos.xy,
//       uMouse * 3.0
//     );

//     float mouseInfluence =
//       exp(-mouseDistance * 1.4);

//     float mouseWave =
//       sin(mouseDistance * 9.0 - t * 3.0)
//       * mouseInfluence * 0.18;

//     // Combine fabric movements
//     float elevation =
//       wave1 +
//       wave2 +
//       wave3 +
//       fineFolds +
//       microFolds +
//       mouseWave;

//     // Scroll influence
//     elevation += sin(
//       pos.x * 2.0 + uProgress * 4.0
//     ) * 0.10;

//     pos.z += elevation;

//     vElevation = elevation;
//     vFold = wave3 + fineFolds;

//     vec4 worldPosition =
//       modelMatrix * vec4(pos, 1.0);

//     vWorldPosition = worldPosition.xyz;

//     gl_Position =
//       projectionMatrix *
//       viewMatrix *
//       worldPosition;
//   }
// `;

// const fragmentShader = `
//   uniform float uTime;

//   varying vec2 vUv;
//   varying vec3 vWorldPosition;
//   varying float vElevation;
//   varying float vFold;

//   void main() {

//     // Calculate surface normal
//     vec3 normal = normalize(
//       cross(
//         dFdx(vWorldPosition),
//         dFdy(vWorldPosition)
//       )
//     );

//     vec3 lightDirection = normalize(
//       vec3(-0.7, 0.8, 1.5)
//     );

//     vec3 viewDirection = normalize(
//       cameraPosition - vWorldPosition
//     );

//     vec3 halfDirection = normalize(
//       lightDirection + viewDirection
//     );

//     // Directional lighting
//     float diffuse = max(
//       dot(normal, lightDirection),
//       0.0
//     );

//     // Sharp silk reflections
//     float specular = pow(
//       max(dot(normal, halfDirection), 0.0),
//       65.0
//     );

//     // Soft silk sheen
//     float silkSheen = pow(
//       1.0 - abs(dot(normal, viewDirection)),
//       2.5
//     );

//     float reflection = pow(
//       max(dot(normal, halfDirection), 0.0),
//       18.0
//     );

//     // Premium blue color palette
//     vec3 midnight = vec3(
//       0.005, 0.015, 0.065
//     );

//     vec3 navy = vec3(
//       0.012, 0.055, 0.18
//     );

//     vec3 royalBlue = vec3(
//       0.025, 0.15, 0.48
//     );

//     vec3 cobalt = vec3(
//       0.035, 0.30, 0.85
//     );

//     vec3 cyan = vec3(
//       0.12, 0.55, 0.95
//     );

//     // Animated color variation
//     float variation = sin(
//       vUv.x * 5.0 +
//       vUv.y * 3.0 +
//       uTime * 0.25
//     );

//     float colorFactor = smoothstep(
//       -0.7,
//       0.8,
//       vElevation + variation * 0.2
//     );

//     vec3 fabricColor = mix(
//       midnight,
//       navy,
//       colorFactor
//     );

//     fabricColor = mix(
//       fabricColor,
//       royalBlue,
//       smoothstep(0.0, 0.7, diffuse)
//     );

//     fabricColor = mix(
//       fabricColor,
//       cobalt,
//       smoothstep(0.35, 0.9, vElevation)
//       * 0.35
//     );

//     // Reflective silk highlights
//     fabricColor +=
//       cyan * specular * 0.8;

//     fabricColor +=
//       cobalt * reflection * 0.35;

//     fabricColor +=
//       vec3(0.08, 0.3, 0.8)
//       * silkSheen * 0.18;

//     // Fine fabric fold highlights
//     fabricColor +=
//       vec3(0.04, 0.15, 0.4)
//       * abs(vFold) * 0.35;

//     // Ambient lighting
//     fabricColor += vec3(
//       0.008, 0.018, 0.055
//     );

//     // Soft transparent edges
//     float edgeFade = smoothstep(
//       0.0, 0.12, vUv.y
//     ) * smoothstep(
//       0.0, 0.12, 1.0 - vUv.y
//     );

//     float alpha = 0.82 * edgeFade;

//     gl_FragColor = vec4(
//       fabricColor,
//       alpha
//     );
//   }
// `;

// function SilkFabric({
//   progress = 0,
// }: HeroBackgroundProps) {
//   const materialRef = useRef<THREE.ShaderMaterial>(null);

//   const mouse = useRef({
//     x: 0,
//     y: 0,
//   });

//   const targetMouse = useRef({
//     x: 0,
//     y: 0,
//   });

//   const targetProgress = useRef(progress);

//   // GSAP mouse interaction
//   useEffect(() => {
//     const handleMouseMove = (event: MouseEvent) => {
//       gsap.to(targetMouse.current, {
//         x: (event.clientX / window.innerWidth) * 2 - 1,
//         y: -(event.clientY / window.innerHeight) * 2 + 1,
//         duration: 1,
//         ease: "power3.out",
//         overwrite: "auto",
//       });
//     };

//     const handleMouseLeave = () => {
//       gsap.to(targetMouse.current, {
//         x: 0,
//         y: 0,
//         duration: 1.5,
//         ease: "power3.out",
//         overwrite: "auto",
//       });
//     };

//     window.addEventListener("mousemove", handleMouseMove);
//     window.addEventListener("blur", handleMouseLeave);

//     return () => {
//       window.removeEventListener("mousemove", handleMouseMove);
//       window.removeEventListener("blur", handleMouseLeave);
//     };
//   }, []);

//   // Smooth scroll progress
//   useEffect(() => {
//     gsap.to(targetProgress, {
//       current: progress,
//       duration: 0.8,
//       ease: "power2.out",
//       overwrite: "auto",
//     });
//   }, [progress]);

//   // Continuous animation
//   useFrame((state, delta) => {
//     if (!materialRef.current) return;

//     const uniforms = materialRef.current.uniforms;

//     uniforms.uTime.value = state.clock.elapsedTime;

//     mouse.current.x = THREE.MathUtils.damp(
//       mouse.current.x,
//       targetMouse.current.x,
//       3,
//       delta
//     );

//     mouse.current.y = THREE.MathUtils.damp(
//       mouse.current.y,
//       targetMouse.current.y,
//       3,
//       delta
//     );

//     uniforms.uMouse.value.set(
//       mouse.current.x,
//       mouse.current.y
//     );

//     uniforms.uProgress.value = targetProgress.current;
//   });

//   return (
//     <mesh rotation={[-0.18, 0, 0]}>
//       <planeGeometry args={[10, 6, 180, 120]} />

//       <shaderMaterial
//         ref={materialRef}
//         vertexShader={vertexShader}
//         fragmentShader={fragmentShader}
//         transparent
//         depthWrite={false}
//         side={THREE.DoubleSide}
//         uniforms={{
//           uTime: { value: 0 },
//           uMouse: { value: new THREE.Vector2() },
//           uProgress: { value: progress },
//         }}
//       />
//     </mesh>
//   );
// }

// export default function HeroBackground2({
//   progress = 0,
// }: HeroBackgroundProps) {
//   return (
//     <div className="absolute inset-0 pointer-events-none">
//       <Canvas
//         camera={{
//           position: [0, 0, 5],
//           fov: 45,
//         }}
//         dpr={[1, 1.5]}
//         gl={{
//           alpha: true,
//           antialias: true,
//           powerPreference: "high-performance",
//         }}
//       >
//         <SilkFabric progress={progress} />
//       </Canvas>
//     </div>
//   );
// }