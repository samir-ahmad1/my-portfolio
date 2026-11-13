// "use client";

// import { useEffect, useMemo, useRef, useState } from "react";
// import { Canvas, useFrame } from "@react-three/fiber";
// import * as THREE from "three";
// import gsap from "gsap";
// import { ScrollTrigger } from "gsap/ScrollTrigger";

// gsap.registerPlugin(ScrollTrigger);

// /* -----------------------------------------
//    SCREEN TEXTURE
// ----------------------------------------- */

// function usePortfolioTexture() {
//   const [texture, setTexture] = useState<THREE.CanvasTexture | null>(null);

//   useEffect(() => {
//     const canvas = document.createElement("canvas");

//     canvas.width = 1600;
//     canvas.height = 1000;

//     const ctx = canvas.getContext("2d");

//     if (!ctx) return;

//     // Background
//     const background = ctx.createLinearGradient(0, 0, 1600, 1000);
//     background.addColorStop(0, "#071426");
//     background.addColorStop(1, "#030916");

//     ctx.fillStyle = background;
//     ctx.fillRect(0, 0, 1600, 1000);

//     // Atmospheric blue glow
//     const glow = ctx.createRadialGradient(
//       1250, 450, 10,
//       1250, 450, 700
//     );

//     glow.addColorStop(0, "rgba(0, 112, 255, 0.3)");
//     glow.addColorStop(1, "rgba(0, 112, 255, 0)");

//     ctx.fillStyle = glow;
//     ctx.fillRect(0, 0, 1600, 1000);

//     // Navigation
//     ctx.fillStyle = "#0b1c32";
//     ctx.fillRect(0, 0, 1600, 95);

//     ctx.font = "bold 34px Arial";
//     ctx.fillStyle = "#ffffff";
//     ctx.fillText("SAMIR.", 90, 60);

//     ctx.font = "22px Arial";
//     ctx.fillStyle = "#9eb5d0";

//     ctx.fillText("Home", 850, 58);
//     ctx.fillText("About", 970, 58);
//     ctx.fillText("Projects", 1090, 58);
//     ctx.fillText("Contact", 1245, 58);

//     // Status label
//     ctx.fillStyle = "#0c2946";
//     ctx.beginPath();
//     ctx.roundRect(100, 225, 300, 55, 28);
//     ctx.fill();

//     ctx.fillStyle = "#36baff";
//     ctx.beginPath();
//     ctx.arc(130, 252, 7, 0, Math.PI * 2);
//     ctx.fill();

//     ctx.font = "20px Arial";
//     ctx.fillText("AVAILABLE FOR PROJECTS", 155, 260);

//     // Main heading
//     ctx.font = "bold 105px Arial";
//     ctx.fillStyle = "#ffffff";
//     ctx.fillText("BUILDING", 100, 430);
//     ctx.fillText("DIGITAL", 100, 550);

//     ctx.fillStyle = "#329aff";
//     ctx.fillText("EXPERIENCES.", 100, 670);

//     // Description
//     ctx.font = "27px Arial";
//     ctx.fillStyle = "#a4b7d0";

//     ctx.fillText("Web Developer crafting modern,", 105, 745);
//     ctx.fillText("interactive digital experiences.", 105, 790);

//     // Button
//     ctx.fillStyle = "#1677ed";
//     ctx.beginPath();
//     ctx.roundRect(105, 845, 260, 75, 14);
//     ctx.fill();

//     ctx.font = "bold 23px Arial";
//     ctx.fillStyle = "#ffffff";
//     ctx.fillText("Explore Projects  →", 135, 893);

//     // Right side decorative interface
//     ctx.fillStyle = "rgba(13, 39, 69, 0.8)";
//     ctx.beginPath();
//     ctx.roundRect(950, 245, 500, 530, 28);
//     ctx.fill();

//     ctx.strokeStyle = "rgba(54, 153, 255, 0.35)";
//     ctx.lineWidth = 2;
//     ctx.stroke();

//     // Abstract visual
//     const orb = ctx.createRadialGradient(
//       1200, 480, 20,
//       1200, 480, 210
//     );

//     orb.addColorStop(0, "#64c9ff");
//     orb.addColorStop(0.35, "#1765e8");
//     orb.addColorStop(1, "#071a42");

//     ctx.fillStyle = orb;
//     ctx.beginPath();
//     ctx.arc(1200, 480, 190, 0, Math.PI * 2);
//     ctx.fill();

//     // Decorative lines
//     for (let i = 0; i < 5; i++) {
//       ctx.fillStyle = "rgba(91, 165, 255, 0.5)";
//       ctx.fillRect(1010, 700 + i * 15, 250 - i * 25, 4);
//     }

//     const canvasTexture = new THREE.CanvasTexture(canvas);

//     canvasTexture.colorSpace = THREE.SRGBColorSpace;
//     canvasTexture.anisotropy = 8;

//     setTexture(canvasTexture);

//     return () => {
//       canvasTexture.dispose();
//     };
//   }, []);

//   return texture;
// }

// /* -----------------------------------------
//    MACBOOK SCREEN
// ----------------------------------------- */

// function MacBookScreen() {
//   const texture = usePortfolioTexture();

//   const screenMaterial = useRef<THREE.MeshPhysicalMaterial>(null!);

//   const handleHover = (hovering: boolean) => {
//     if (!screenMaterial.current) return;

//     gsap.to(screenMaterial.current, {
//       emissiveIntensity: hovering ? 0.35 : 0.08,
//       duration: 0.5,
//       ease: "power2.out",
//     });
//   };

//   return (
//     <group>
//       {/* Screen frame */}
//       <mesh position={[0, 1.55, 0]}>
//         <boxGeometry args={[4.98, 3.18, 0.12]} />

//         <meshPhysicalMaterial
//           color="#151a22"
//           metalness={0.9}
//           roughness={0.2}
//           clearcoat={1}
//         />
//       </mesh>

//       {/* Actual display surface */}
//       <mesh
//         position={[0, 1.55, 0.066]}
//         onPointerOver={() => handleHover(true)}
//         onPointerOut={() => handleHover(false)}
//       >
//         <planeGeometry args={[4.76, 2.96]} />

//         <meshPhysicalMaterial
//           ref={screenMaterial}
//           map={texture}
//           color="#ffffff"
//           emissive="#0b3c88"
//           emissiveIntensity={0.08}
//           roughness={0.3}
//           metalness={0.05}
//         />
//       </mesh>

//       {/* Camera */}
//       <mesh position={[0, 3.08, 0.068]}>
//         <circleGeometry args={[0.025, 24]} />
//         <meshBasicMaterial color="#02050a" />
//       </mesh>

//       {/* Small camera reflection */}
//       <mesh position={[0.009, 3.09, 0.07]}>
//         <circleGeometry args={[0.007, 16]} />
//         <meshBasicMaterial color="#2678d8" />
//       </mesh>
//     </group>
//   );
// }

// /* -----------------------------------------
//    MACBOOK KEYBOARD
// ----------------------------------------- */

// function Keyboard() {
//   const keys = useMemo(() => {
//     const result: [number, number][] = [];

//     const columns = 14;
//     const rows = 5;

//     for (let row = 0; row < rows; row++) {
//       for (let col = 0; col < columns; col++) {
//         result.push([
//           -2.12 + col * 0.325,
//           -1.05 + row * 0.27,
//         ]);
//       }
//     }

//     return result;
//   }, []);

//   return (
//     <group>
//       {/* Keyboard surface */}
//       <mesh position={[0, 0.105, -0.43]}>
//         <boxGeometry args={[4.45, 0.025, 1.55]} />

//         <meshStandardMaterial
//           color="#252c36"
//           metalness={0.65}
//           roughness={0.5}
//         />
//       </mesh>

//       {/* Individual keys */}
//       {keys.map(([x, z], i) => (
//         <mesh
//           key={i}
//           position={[x, 0.132, z]}
//         >
//           <boxGeometry args={[0.25, 0.025, 0.19]} />

//           <meshPhysicalMaterial
//             color="#111820"
//             roughness={0.35}
//             metalness={0.35}
//           />
//         </mesh>
//       ))}

//       {/* Space bar */}
//       <mesh position={[0, 0.135, 0.1]}>
//         <boxGeometry args={[1.4, 0.025, 0.18]} />
//         <meshStandardMaterial color="#111820" />
//       </mesh>

//       {/* Trackpad */}
//       <mesh position={[0, 0.115, 0.91]}>
//         <boxGeometry args={[1.35, 0.018, 0.75]} />

//         <meshPhysicalMaterial
//           color="#8b96a5"
//           metalness={0.55}
//           roughness={0.3}
//           clearcoat={0.8}
//         />
//       </mesh>
//     </group>
//   );
// }

// /* -----------------------------------------
//    MACBOOK MODEL
// ----------------------------------------- */

// function MacBook({
//   scrollRef,
// }: {
//   scrollRef: React.RefObject<HTMLElement | null>;
// }) {
//   const laptop = useRef<THREE.Group>(null!);
//   const floatingGroup = useRef<THREE.Group>(null!);
//   const lid = useRef<THREE.Group>(null!);

//   const mouseTarget = useRef(new THREE.Vector2());

//   useEffect(() => {
//     if (!laptop.current || !lid.current || !scrollRef.current) return;

//     const context = gsap.context(() => {
//       const timeline = gsap.timeline({
//         scrollTrigger: {
//           trigger: scrollRef.current,
//           start: "top top",
//           end: "bottom bottom",
//           scrub: 1.2,
//           invalidateOnRefresh: true,
//         },
//       });

//       // Phase 1: Open the MacBook
//       timeline.to(
//         lid.current.rotation,
//         {
//           x: 0.04,
//           duration: 0.45,
//           ease: "power2.inOut",
//         },
//         0
//       );

//       // Phase 2: Rotate toward the viewer
//       timeline.to(
//         laptop.current.rotation,
//         {
//           y: -0.08,
//           x: -0.06,
//           duration: 0.35,
//         },
//         0.25
//       );

//       // Phase 3: Camera-like zoom into the screen
//       timeline.to(
//         laptop.current.scale,
//         {
//           x: 1.42,
//           y: 1.42,
//           z: 1.42,
//           duration: 0.45,
//           ease: "power2.inOut",
//         },
//         0.5
//       );

//       timeline.to(
//         laptop.current.position,
//         {
//           y: -0.45,
//           z: 0.5,
//           duration: 0.45,
//         },
//         0.5
//       );
//     }, scrollRef);

//     return () => {
//       context.revert();
//     };
//   }, [scrollRef]);

//   useFrame(({ pointer, clock }, delta) => {
//     if (!floatingGroup.current) return;

//     // Mouse interaction
//     mouseTarget.current.x = THREE.MathUtils.damp(
//       mouseTarget.current.x,
//       pointer.x,
//       2,
//       delta
//     );

//     mouseTarget.current.y = THREE.MathUtils.damp(
//       mouseTarget.current.y,
//       pointer.y,
//       2,
//       delta
//     );

//     floatingGroup.current.rotation.y =
//       mouseTarget.current.x * 0.12;

//     floatingGroup.current.rotation.x =
//       -mouseTarget.current.y * 0.08;

//     // Floating animation
//     floatingGroup.current.position.y =
//       -0.35 + Math.sin(clock.elapsedTime * 0.7) * 0.045;
//   });

//   return (
//     <group ref={floatingGroup}>
//       <group ref={laptop} position={[0, -0.35, 0]}>

//         {/* Laptop base */}
//         <mesh position={[0, 0, 0]}>
//           <boxGeometry args={[5.1, 0.18, 3.4]} />

//           <meshPhysicalMaterial
//             color="#a9b5c5"
//             metalness={0.94}
//             roughness={0.22}
//             clearcoat={1}
//             clearcoatRoughness={0.15}
//           />
//         </mesh>

//         {/* Front edge reflection */}
//         <mesh position={[0, -0.065, 1.7]}>
//           <boxGeometry args={[4.85, 0.025, 0.018]} />

//           <meshBasicMaterial color="#d3e4ff" />
//         </mesh>

//         {/* Keyboard */}
//         <Keyboard />

//         {/* Hinge */}
//         <mesh
//           position={[0, 0.12, -1.62]}
//           rotation={[0, 0, Math.PI / 2]}
//         >
//           <cylinderGeometry args={[0.065, 0.065, 4.7, 32]} />

//           <meshStandardMaterial
//             color="#657487"
//             metalness={1}
//             roughness={0.2}
//           />
//         </mesh>

//         {/* Rotating lid */}
//         <group
//           ref={lid}
//           position={[0, 0.12, -1.62]}
//           rotation={[1.52, 0, 0]}
//         >
//           <MacBookScreen />
//         </group>

//         {/* Trackpad border */}
//         <mesh position={[0, 0.095, 0.91]}>
//           <boxGeometry args={[1.4, 0.012, 0.8]} />

//           <meshBasicMaterial
//             color="#d5e5f5"
//             transparent
//             opacity={0.3}
//           />
//         </mesh>
//       </group>
//     </group>
//   );
// }

// /* -----------------------------------------
//    ENVIRONMENT
// ----------------------------------------- */

// function Environment() {
//   const rings = useRef<THREE.Group>(null!);

//   useFrame(({ clock }) => {
//     if (!rings.current) return;

//     rings.current.rotation.y = clock.elapsedTime * 0.06;
//     rings.current.rotation.z = Math.sin(clock.elapsedTime * 0.2) * 0.08;
//   });

//   return (
//     <>
//       <ambientLight intensity={1.2} />

//       <directionalLight
//         position={[4, 6, 5]}
//         intensity={3}
//         color="#d4e8ff"
//       />

//       <pointLight
//         position={[-4, 2, 2]}
//         intensity={35}
//         color="#087bff"
//         distance={12}
//       />

//       <pointLight
//         position={[4, -2, -3]}
//         intensity={25}
//         color="#00c8ff"
//         distance={10}
//       />

//       <pointLight
//         position={[0, 4, 3]}
//         intensity={15}
//         color="#ffffff"
//         distance={9}
//       />

//       {/* Atmospheric rings */}
//       <group ref={rings} position={[0, 0, -2.5]}>
//         {[3.6, 4.1, 4.6].map((radius, i) => (
//           <mesh
//             key={radius}
//             rotation={[
//               0.8 + i * 0.3,
//               0.4,
//               0.2 + i * 0.5,
//             ]}
//           >
//             <torusGeometry args={[radius, 0.008, 8, 160]} />

//             <meshBasicMaterial
//               color={i === 1 ? "#087bff" : "#00c8ff"}
//               transparent
//               opacity={0.22}
//             />
//           </mesh>
//         ))}
//       </group>
//     </>
//   );
// }

// /* -----------------------------------------
//    PARTICLES
// ----------------------------------------- */

// function Particles() {
//   const points = useRef<THREE.Points>(null!);

//   const positions = useMemo(() => {
//     const array = new Float32Array(650 * 3);

//     for (let i = 0; i < 650; i++) {
//       array[i * 3] = (Math.random() - 0.5) * 14;
//       array[i * 3 + 1] = (Math.random() - 0.5) * 9;
//       array[i * 3 + 2] = (Math.random() - 0.5) * 8;
//     }

//     return array;
//   }, []);

//   useFrame(({ clock }) => {
//     if (!points.current) return;

//     points.current.rotation.y = clock.elapsedTime * 0.015;
//   });

//   return (
//     <points ref={points}>
//       <bufferGeometry>
//         <bufferAttribute
//           attach="attributes-position"
//           args={[positions, 3]}
//         />
//       </bufferGeometry>

//       <pointsMaterial
//         color="#6dbdff"
//         size={0.022}
//         transparent
//         opacity={0.65}
//         sizeAttenuation
//       />
//     </points>
//   );
// }

// /* -----------------------------------------
//    MAIN SCENE
// ----------------------------------------- */

// function Scene({
//   scrollRef,
// }: {
//   scrollRef: React.RefObject<HTMLElement | null>;
// }) {
//   return (
//     <>
//       <Environment />

//       <Particles />

//       <MacBook scrollRef={scrollRef} />
//     </>
//   );
// }

// /* -----------------------------------------
//    MAIN COMPONENT
// ----------------------------------------- */

// export default function HeroBackground() {
//   const sectionRef = useRef<HTMLElement>(null);

//   return (
//     <section
//       ref={sectionRef}
//       className="relative h-[220vh] bg-[#020713]"
//     >
//       {/* Sticky 3D stage */}
//       <div className="sticky top-0 h-screen overflow-hidden">

//         {/* Atmospheric background */}
//         <div
//           className="absolute inset-0"
//           style={{
//             background:
//               "radial-gradient(ellipse at 50% 50%, #10294b 0%, #071326 42%, #020713 85%)",
//           }}
//         />

//         {/* 3D MacBook */}
//         <div className="absolute inset-0 z-10">
//           <Canvas
//             camera={{
//               position: [0, 3.2, 9.5],
//               fov: 37,
//             }}
//             dpr={[1, 1.5]}
//             gl={{
//               alpha: true,
//               antialias: true,
//               powerPreference: "high-performance",
//             }}
//           >
//             <Scene scrollRef={sectionRef} />
//           </Canvas>
//         </div>

//         {/* Hero introduction */}
//         <div className="pointer-events-none absolute inset-x-0 top-[9%] z-20 flex flex-col items-center text-center">
//           <p className="mb-5 text-xs font-medium tracking-[0.45em] text-blue-300/80">
//             DIGITAL CRAFTSMANSHIP
//           </p>

//           <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-6xl">
//             Beyond the
//             <span className="block bg-gradient-to-r from-blue-300 via-cyan-300 to-blue-500 bg-clip-text text-transparent">
//               ordinary web.
//             </span>
//           </h1>

//           <p className="mt-5 max-w-md px-5 text-sm leading-7 text-slate-400 sm:text-base">
//             Designing and developing digital experiences
//             with creativity, technology and precision.
//           </p>
//         </div>

//         {/* Scroll indicator */}
//         <div className="pointer-events-none absolute bottom-9 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-3">
//           <span className="text-[10px] tracking-[0.4em] text-blue-200/70">
//             SCROLL TO EXPLORE
//           </span>

//           <div className="h-12 w-px overflow-hidden bg-white/10">
//             <div className="h-5 w-px animate-bounce bg-blue-400" />
//           </div>
//         </div>

//         {/* Cinematic vignette */}
//         <div
//           className="pointer-events-none absolute inset-0 z-10"
//           style={{
//             background:
//               "radial-gradient(ellipse at center, transparent 35%, rgba(2,7,19,0.45) 100%)",
//           }}
//         />
//       </div>
//     </section>
//   );
// }