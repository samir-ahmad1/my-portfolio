"use client";

import { useEffect, useRef, type MutableRefObject } from "react";
import * as THREE from "three";

type Props = {
  /** 0 → 1 scroll progress of the pinned hero, written by GSAP ScrollTrigger */
  progress: MutableRefObject<number>;
};

/* ---------- Flow field (full-screen shader) ---------- */

const bgVert = /* glsl */ `
  void main() { gl_Position = vec4(position.xy, 0.0, 1.0); }
`;

const bgFrag = /* glsl */ `
  precision highp float;
  uniform float uTime;
  uniform float uDark;
  uniform float uProgress;
  uniform vec2 uRes;
  uniform vec2 uMouse;
  uniform vec2 uCenter;

  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
               mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
  }
  float fbm(vec2 p) {
    float v = 0.0, a = 0.5;
    mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
    for (int i = 0; i < 4; i++) { v += a * noise(p); p = m * p; a *= 0.5; }
    return v;
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / uRes;
    float asp = uRes.x / uRes.y;
    vec2 p = (uv - 0.5) * vec2(asp, 1.0);

    // twist the space around the vortex center
    vec2 d = p - uCenter;
    float rad = length(d);
    float tw = (0.5 / (0.35 + rad)) * (1.0 + uProgress * 2.0) + uTime * 0.12;
    float s = sin(tw), c = cos(tw);
    vec2 sp = mat2(c, -s, s, c) * d;

    // domain-warped noise = liquid, smoky motion
    float t = uTime * 0.06;
    vec2 q = vec2(fbm(sp * 1.5 + t), fbm(sp * 1.5 + vec2(5.2, 1.3) - t));
    vec2 r = vec2(fbm(sp * 2.0 + 3.0 * q + vec2(1.7, 9.2) + t * 1.4),
                  fbm(sp * 2.0 + 3.0 * q + vec2(8.3, 2.8) - t * 1.1));
    float f = fbm(sp * 2.2 + 3.2 * r);

    // light that follows the cursor
    vec2 mp = (uMouse - 0.5) * vec2(asp, 1.0);
    float mg = exp(-pow(length(p - mp) * 2.6, 2.0));
    f += mg * 0.22;

    float core = exp(-rad * 3.2);

    vec3 base = mix(vec3(0.933, 0.949, 0.976), vec3(0.0196, 0.0275, 0.051), uDark);
    vec3 cA = mix(vec3(0.62, 0.74, 1.00), vec3(0.00, 0.28, 0.80), uDark);
    vec3 cB = mix(vec3(0.30, 0.42, 0.95), vec3(0.25, 0.85, 1.00), uDark);
    vec3 cC = mix(vec3(0.78, 0.66, 0.98), vec3(0.42, 0.18, 0.85), uDark);

    vec3 col = base;
    col = mix(col, cA, smoothstep(0.30, 0.85, f) * mix(0.55, 0.85, uDark));
    col = mix(col, cC, smoothstep(0.45, 1.05, length(r)) * mix(0.30, 0.40, uDark));
    float hi = pow(smoothstep(0.55, 1.0, f), 3.0) + core * 0.9 + mg * 0.35;
    col = mix(mix(col, cB, clamp(hi * 0.5, 0.0, 1.0)), col + cB * hi * 0.9, uDark);

    // calm the edges, and melt into the next section at the bottom
    float v = 1.0 - smoothstep(0.35, 1.5, rad);
    col = mix(base, col, 0.35 + 0.65 * v);
    col = mix(col, base, 1.0 - smoothstep(0.0, 0.22, uv.y));

    col += (hash(gl_FragCoord.xy + fract(uTime)) - 0.5) * 0.025; // film grain
    gl_FragColor = vec4(col, 1.0);
  }
`;

/* ---------- Galaxy (points) ---------- */

const galaxyVert = /* glsl */ `
  uniform float uTime;
  uniform float uPR;
  uniform float uDark;
  uniform float uProgress;
  attribute vec3 aPolar;   // radius, start angle, height
  attribute float aSeed;
  varying vec3 vCol;
  varying float vA;

  void main() {
    float r = aPolar.x;
    float th = aPolar.y; // the whole galaxy spins as one rigid disc (done in JS), so its shape never drifts
    vec3 p = vec3(cos(th) * r,
                  aPolar.z + sin(uTime * 0.6 + aSeed * 30.0 + r) * 0.05,
                  sin(th) * r);

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = (1.0 + aSeed * 2.2) * uPR * (18.0 / -mv.z);

    float t = clamp(r / 5.2, 0.0, 1.0);
    vec3 coreD = vec3(0.85, 0.95, 1.00), midD = vec3(0.20, 0.55, 1.00), outD = vec3(0.45, 0.25, 0.95);
    vec3 coreL = vec3(0.05, 0.15, 0.55), midL = vec3(0.10, 0.30, 0.95), outL = vec3(0.45, 0.25, 0.85);
    vec3 cD = t < 0.5 ? mix(coreD, midD, t * 2.0) : mix(midD, outD, (t - 0.5) * 2.0);
    vec3 cL = t < 0.5 ? mix(coreL, midL, t * 2.0) : mix(midL, outL, (t - 0.5) * 2.0);
    vCol = mix(cL, cD, uDark);

    vA = mix(0.75, 0.9, uDark) * (0.35 + 0.65 * (1.0 - t * 0.7)) * smoothstep(1.0, 3.0, -mv.z);
  }
`;

const galaxyFrag = /* glsl */ `
  varying vec3 vCol;
  varying float vA;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    float a = pow(1.0 - smoothstep(0.0, 0.5, d), 1.4);
    gl_FragColor = vec4(vCol, a * vA);
  }
`;

/* ---------- Component ---------- */

const K = 9.364; // world units per screen-height at the camera's start distance

export default function HeroBackground({ progress }: Props) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const small = window.innerWidth < 768;
    const root = document.documentElement;
    const isDark = () => root.classList.contains("dark");

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: "high-performance" });
    } catch {
      return; // no WebGL: the page background colour still shows
    }

    const pr = Math.min(window.devicePixelRatio || 1, small ? 1.25 : 1.5);
    renderer.setPixelRatio(pr);
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.domElement.className = "block";
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, mount.clientWidth / mount.clientHeight, 0.1, 100);
    camera.position.set(0, 0, 9);

    /* Flow field */
    const bgMat = new THREE.ShaderMaterial({
      vertexShader: bgVert,
      fragmentShader: bgFrag,
      depthTest: false,
      depthWrite: false,
      uniforms: {
        uTime: { value: 0 },
        uDark: { value: isDark() ? 1 : 0 },
        uProgress: { value: 0 },
        uRes: { value: new THREE.Vector2(1, 1) },
        uMouse: { value: new THREE.Vector2(0.7, 0.5) },
        uCenter: { value: new THREE.Vector2(0.3, 0) },
      },
    });
    const bg = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), bgMat);
    bg.frustumCulled = false;
    bg.renderOrder = -10;
    scene.add(bg);

    /* Galaxy */
    const N = small ? 22000 : 50000;
    const R = 5.2;
    const polar = new Float32Array(N * 3);
    const seed = new Float32Array(N);
    const arms = 4;
    for (let i = 0; i < N; i++) {
      const r = Math.pow(Math.random(), 1.9) * R + 0.05;
      const arm = i % arms;
      const theta =
        (arm / arms) * Math.PI * 2 + r * 1.15 + (Math.random() + Math.random() + Math.random() - 1.5) * (0.12 + r * 0.07);
      const h = (Math.random() - 0.5) * 0.35 * Math.exp(-r * 0.35);
      polar[i * 3] = r;
      polar[i * 3 + 1] = theta;
      polar[i * 3 + 2] = h;
      seed[i] = Math.random();
    }
    const galaxyGeo = new THREE.BufferGeometry();
    galaxyGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(N * 3), 3));
    galaxyGeo.setAttribute("aPolar", new THREE.BufferAttribute(polar, 3));
    galaxyGeo.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
    const galaxyMat = new THREE.ShaderMaterial({
      vertexShader: galaxyVert,
      fragmentShader: galaxyFrag,
      transparent: true,
      depthWrite: false,
      blending: isDark() ? THREE.AdditiveBlending : THREE.NormalBlending,
      uniforms: {
        uTime: { value: 0 },
        uPR: { value: pr },
        uDark: { value: isDark() ? 1 : 0 },
        uProgress: { value: 0 },
      },
    });
    const galaxy = new THREE.Points(galaxyGeo, galaxyMat);
    galaxy.frustumCulled = false;

    /* Two thin rings around the core */
    const ringMat = new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
      blending: isDark() ? THREE.AdditiveBlending : THREE.NormalBlending,
    });
    const ringGeos = [1.8, 3.4].map((r) => new THREE.TorusGeometry(r, 0.006, 8, 200));
    const rings = ringGeos.map((g) => {
      const m = new THREE.Mesh(g, ringMat);
      m.rotation.x = Math.PI / 2;
      return m;
    });

    const group = new THREE.Group();
    group.add(galaxy, ...rings);
    scene.add(group);

    /* Layout: put the vortex behind the figure on wide screens */
    const layout = () => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      if (!w || !h) return;
      const asp = w / h;
      renderer.setSize(w, h);
      camera.aspect = asp;
      camera.updateProjectionMatrix();
      const cx = 0;
      const cy = asp > 1.15 ? 0.06 : 0.16; // same height as the orb in the figure layer
      bgMat.uniforms.uCenter.value.set(cx, cy);
      group.position.set(cx * K, cy * K, 0);
      const size = renderer.getDrawingBufferSize(new THREE.Vector2());
      bgMat.uniforms.uRes.value.copy(size);
    };
    layout();

    /* Input */
    const mouse = { x: 0, y: 0, u: 0.7, v: 0.5 };
    const onMove = (e: PointerEvent) => {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -((e.clientY / window.innerHeight) * 2 - 1);
      mouse.u = e.clientX / window.innerWidth;
      mouse.v = 1 - e.clientY / window.innerHeight;
    };
    if (!reduced) window.addEventListener("pointermove", onMove, { passive: true });

    /* Theme: watch the <html> class and ease between dark and light */
    let target = isDark() ? 1 : 0;
    let current = target;
    let lastDark = target > 0.5;
    const applyTheme = () => {
      const dark = current > 0.5;
      if (dark === lastDark) return;
      lastDark = dark;
      const blending = dark ? THREE.AdditiveBlending : THREE.NormalBlending;
      galaxyMat.blending = blending;
      ringMat.blending = blending;
      galaxyMat.needsUpdate = true;
      ringMat.needsUpdate = true;
    };
    const mo = new MutationObserver(() => {
      target = isDark() ? 1 : 0;
      if (reduced) {
        current = target;
        frame(6);
      }
    });
    mo.observe(root, { attributes: true, attributeFilter: ["class"] });

    /* Render */
    let smoothed = 0;
    let tiltX = 1.0;
    let tiltY = 0;
    let spinAngle = 0;
    let lastT = 0;
    const darkRing = new THREE.Color(0.45, 0.8, 1.0);
    const lightRing = new THREE.Color(0.1, 0.25, 0.8);

    function frame(t: number) {
      current += (target - current) * (reduced ? 1 : 0.06);
      applyTheme();

      smoothed += ((reduced ? 0 : progress.current) - smoothed) * 0.08;

      bgMat.uniforms.uTime.value = t;
      bgMat.uniforms.uDark.value = current;
      bgMat.uniforms.uProgress.value = smoothed;
      const m = bgMat.uniforms.uMouse.value as THREE.Vector2;
      m.x += (mouse.u - m.x) * 0.06;
      m.y += (mouse.v - m.y) * 0.06;

      galaxyMat.uniforms.uTime.value = t;
      galaxyMat.uniforms.uDark.value = current;
      galaxyMat.uniforms.uProgress.value = smoothed;

      ringMat.color.copy(lightRing).lerp(darkRing, current);

      // dive into the galaxy as you scroll, tilt with the cursor
      camera.position.z = 9 - smoothed * 7.2;
      camera.position.x += (mouse.x * 0.6 - camera.position.x) * 0.04;
      camera.position.y += (mouse.y * 0.4 - camera.position.y) * 0.04;
      camera.lookAt(0, 0, 0);

      tiltX += (1.0 + mouse.y * 0.12 - tiltX) * 0.05;
      tiltY += (mouse.x * 0.2 - tiltY) * 0.05;
      group.rotation.set(tiltX, tiltY, -0.35 + smoothed * 0.8);
      const dt = Math.min(Math.max(t - lastT, 0), 0.05);
      lastT = t;
      spinAngle += dt * (0.1 + smoothed * 0.6);
      galaxy.rotation.y = spinAngle;
      rings[0].rotation.z = t * 0.15;
      rings[1].rotation.z = -t * 0.08;

      renderer.render(scene, camera);
    }

    let raf = 0;
    const start = performance.now();
    const loop = () => {
      frame((performance.now() - start) / 1000);
      raf = requestAnimationFrame(loop);
    };
    if (reduced) frame(6);
    else loop();

    const ro = new ResizeObserver(() => {
      layout();
      if (reduced) frame(6);
    });
    ro.observe(mount);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      mo.disconnect();
      window.removeEventListener("pointermove", onMove);
      bg.geometry.dispose();
      bgMat.dispose();
      galaxyGeo.dispose();
      galaxyMat.dispose();
      ringGeos.forEach((g) => g.dispose());
      ringMat.dispose();
      renderer.forceContextLoss();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [progress]);

  return <div ref={mountRef} className="absolute inset-0" aria-hidden="true" />;
}
