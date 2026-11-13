"use client";

import { useEffect, useRef, type MutableRefObject } from "react";
import * as THREE from "three";

type Props = {
  /** 0 → 1 scroll progress of the pinned hero */
  progress: MutableRefObject<number>;
  /** 0 → 1 entrance, tweened by GSAP in the hero page */
  intro: MutableRefObject<{ v: number }>;
};

/* ---------- Eclipse: a dark disc with a bright corona and slow light rays ---------- */

const orbVert = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const orbFrag = /* glsl */ `
  uniform float uTime;
  uniform float uDark;
  uniform float uOpacity;
  varying vec2 vUv;

  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }
  float vn(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
               mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
  }

  void main() {
    vec2 p = (vUv - 0.5) * 2.0;     // -1..1 across the plane, the disc edge sits at 0.5
    float r = length(p);
    float d = r - 0.5;              // distance from the disc edge
    vec2 dir = p / max(r, 0.0001);
    float outside = smoothstep(-0.01, 0.01, d);

    // light rays, built on the unit circle so there is no seam
    float rays = 0.6 * vn(dir * 2.5 + vec2(uTime * 0.15, 0.0))
               + 0.4 * vn(dir * 6.0 - vec2(uTime * 0.2, 0.0));
    rays = pow(rays, 2.0);

    float disc  = 1.0 - smoothstep(-0.004, 0.004, d);
    float ring  = exp(-pow(d * 38.0, 2.0));                                  // thin bright edge
    float ring2 = exp(-pow((d - 0.13 - 0.01 * sin(uTime * 0.7)) * 70.0, 2.0)) * 0.35;
    float glow  = exp(-max(d, 0.0) * 7.0) * outside;
    float beams = exp(-max(d, 0.0) * 4.5) * rays * outside;

    vec3 discCol   = mix(vec3(0.06, 0.09, 0.28), vec3(0.01, 0.02, 0.07), uDark);
    vec3 coronaCol = mix(vec3(0.10, 0.25, 0.90), vec3(0.80, 0.95, 1.00), uDark);
    vec3 glowCol   = mix(vec3(0.40, 0.45, 0.95), vec3(0.35, 0.35, 1.00), uDark);

    float cor  = ring * 1.4 + ring2;
    float soft = glow * 0.6 + beams * 1.3;

    vec3 col = discCol * disc + coronaCol * cor + glowCol * soft;
    float a = max(disc * 0.88, clamp(cor + soft, 0.0, 1.0));
    a *= 1.0 - smoothstep(0.85, 1.0, r);
    gl_FragColor = vec4(col, a * uOpacity);
  }
`;

/* ---------- The figure: a plane with rim light, pseudo-depth and a fade at the bottom ---------- */

const figVert = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const figFrag = /* glsl */ `
  precision highp float;
  uniform sampler2D uTex;
  uniform float uAspect;
  uniform float uDark;
  uniform float uOpacity;
  uniform vec2 uMouse;
  varying vec2 vUv;

  float A(vec2 uv) { return texture2D(uTex, uv).a; }
  vec2 o(float r) { return vec2(r, r * uAspect); }

  void main() {
    // pseudo depth from a soft blur of the silhouette: the middle shifts more than the edges
    vec2 ob = o(0.03);
    float depth = (A(vUv + vec2(ob.x, 0.0)) + A(vUv - vec2(ob.x, 0.0))
                 + A(vUv + vec2(0.0, ob.y)) + A(vUv - vec2(0.0, ob.y))) * 0.25;
    vec2 uv = vUv + uMouse * vec2(-0.014, -0.007) * depth;
    vec4 tex = texture2D(uTex, uv);

    // rim light along the outline, a little stronger on the upper edges
    vec2 oe = o(0.008);
    float gx = A(uv + vec2(oe.x, 0.0)) - A(uv - vec2(oe.x, 0.0));
    float gy = A(uv + vec2(0.0, oe.y)) - A(uv - vec2(0.0, oe.y));
    vec2 n = -vec2(gx, gy);
    float edge = clamp(length(n) * 1.6, 0.0, 1.0);
    float top = 0.55 + 0.45 * max(0.0, normalize(n + 1e-4).y);
    float rim = edge * top * tex.a;

    vec3 rimCol = mix(vec3(0.20, 0.35, 0.85), vec3(0.45, 0.78, 1.00), uDark);
    vec3 col = tex.rgb + rimCol * rim * mix(0.35, 0.95, uDark);

    // fade into the background at the bottom (transparency only)
    float fade = smoothstep(0.0, 0.22, vUv.y);
    gl_FragColor = vec4(col, tex.a * fade * uOpacity);
  }
`;

/* ---------- Bokeh discs drifting in front ---------- */

const fgVert = /* glsl */ `
  uniform float uTime;
  uniform float uPR;
  uniform float uDark;
  uniform float uOpacity;
  attribute float aSeed;
  varying float vA;
  varying vec3 vCol;

  void main() {
    vec3 p = position;
    p.x += sin(uTime * 0.25 + aSeed * 40.0) * 0.35;
    p.y += sin(uTime * 0.35 + aSeed * 25.0) * 0.3;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = (6.0 + aSeed * 22.0) * uPR * (10.0 / -mv.z);
    vA = (0.10 + aSeed * 0.18) * mix(0.6, 1.0, uDark) * smoothstep(0.6, 2.5, -mv.z) * uOpacity;
    vCol = mix(vec3(0.15, 0.30, 0.85), vec3(0.55, 0.80, 1.00), uDark);
  }
`;

const fgFrag = /* glsl */ `
  varying float vA;
  varying vec3 vCol;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    float body = 1.0 - smoothstep(0.0, 0.5, d);
    float ring = smoothstep(0.30, 0.48, d) * (1.0 - smoothstep(0.48, 0.5, d));
    gl_FragColor = vec4(vCol, (body * 0.35 + ring * 0.5) * vA);
  }
`;

/* ---------- Component ---------- */

const FIG_Z = 1.5;
const TAN = Math.tan(THREE.MathUtils.degToRad(55 / 2));

// Floating crystal shards around the eclipse: a = angle, r = distance (x orb radius),
// z = depth, s = size (x orb radius), front = drawn in front of the figure
const SHARDS = [
  { a: 0.6, r: 1.45, z: -1.5, s: 0.16, spin: 0.5, front: false },
  { a: 2.1, r: 1.75, z: -0.5, s: 0.1, spin: -0.7, front: false },
  { a: 3.6, r: 1.5, z: -2.0, s: 0.2, spin: 0.4, front: false },
  { a: 5.2, r: 1.9, z: 0.0, s: 0.12, spin: -0.5, front: false },
  { a: 1.2, r: 1.25, z: 3.2, s: 0.07, spin: 0.9, front: true },
  { a: 4.3, r: 1.35, z: 3.8, s: 0.09, spin: -0.8, front: true },
];

export default function HeroFigure({ progress, intro }: Props) {
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
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "high-performance" });
    } catch {
      return;
    }
    const pr = Math.min(window.devicePixelRatio || 1, 2);
    renderer.setPixelRatio(pr);
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.className = "block";
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, mount.clientWidth / mount.clientHeight, 0.1, 100);
    camera.position.set(0, 0, 9);

    const dark0 = isDark() ? 1 : 0;
    let alive = true;

    /* Eclipse (a plane facing the camera) */
    const orbGeo = new THREE.PlaneGeometry(2, 2);
    const orbMat = new THREE.ShaderMaterial({
      vertexShader: orbVert,
      fragmentShader: orbFrag,
      transparent: true,
      depthTest: false,
      depthWrite: false,
      uniforms: { uTime: { value: 0 }, uDark: { value: dark0 }, uOpacity: { value: 0 } },
    });
    const orb = new THREE.Mesh(orbGeo, orbMat);
    orb.renderOrder = 1;
    scene.add(orb);

    /* Crystal shards: stretched octahedrons drawn as glowing edges */
    const shardGeo = new THREE.EdgesGeometry(new THREE.OctahedronGeometry(1));
    const shardMat = new THREE.LineBasicMaterial({
      transparent: true,
      opacity: 0,
      depthTest: false,
      depthWrite: false,
    });
    const shards = SHARDS.map((d) => {
      const m = new THREE.LineSegments(shardGeo, shardMat);
      m.renderOrder = d.front ? 4 : 0;
      m.frustumCulled = false;
      scene.add(m);
      return m;
    });

    /* Figure */
    let figAspect = 0;
    let figTex: THREE.Texture | null = null;
    const fig = { W: 1, H: 1, y: 0 };
    const figGeo = new THREE.PlaneGeometry(1, 1);
    figGeo.translate(0, 0.5, 0); // origin at the feet, so it tilts from the ground
    const figMat = new THREE.ShaderMaterial({
      vertexShader: figVert,
      fragmentShader: figFrag,
      transparent: true,
      depthTest: false,
      depthWrite: false,
      uniforms: {
        uTex: { value: null },
        uAspect: { value: 1 },
        uDark: { value: dark0 },
        uOpacity: { value: 0 },
        uMouse: { value: new THREE.Vector2() },
      },
    });
    const figure = new THREE.Mesh(figGeo, figMat);
    figure.visible = false;
    figure.frustumCulled = false;
    figure.renderOrder = 2;
    scene.add(figure);

    /* Bokeh */
    const FG = small ? 30 : 60;
    const fgPos = new Float32Array(FG * 3);
    const fgSeed = new Float32Array(FG);
    for (let i = 0; i < FG; i++) {
      fgPos[i * 3] = (Math.random() - 0.5) * 14;
      fgPos[i * 3 + 1] = (Math.random() - 0.5) * 8;
      fgPos[i * 3 + 2] = 2.5 + Math.random() * 4;
      fgSeed[i] = Math.random();
    }
    const fgGeo = new THREE.BufferGeometry();
    fgGeo.setAttribute("position", new THREE.BufferAttribute(fgPos, 3));
    fgGeo.setAttribute("aSeed", new THREE.BufferAttribute(fgSeed, 1));
    const fgMat = new THREE.ShaderMaterial({
      vertexShader: fgVert,
      fragmentShader: fgFrag,
      transparent: true,
      depthTest: false,
      depthWrite: false,
      blending: dark0 ? THREE.AdditiveBlending : THREE.NormalBlending,
      uniforms: {
        uTime: { value: 0 },
        uPR: { value: pr },
        uDark: { value: dark0 },
        uOpacity: { value: 0 },
      },
    });
    const bokeh = new THREE.Points(fgGeo, fgMat);
    bokeh.frustumCulled = false;
    bokeh.renderOrder = 3;
    scene.add(bokeh);

    /* Layout: orb and figure sit in the middle, like the reference */
    const lay = { R: 1, cy: 0 };
    const layout = () => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();

      const asp = w / h;
      const wide = asp > 1.15;
      const visH0 = 2 * TAN * 9; // visible height at the orb's depth
      const visW0 = visH0 * asp;
      const cyFrac = wide ? 0.56 : 0.66; // centre of the orb, measured from the bottom
      const orbD = wide ? 0.58 * visH0 : Math.min(0.84 * visW0, 0.4 * visH0);

      lay.R = orbD / 2;
      lay.cy = (cyFrac - 0.5) * visH0;
      orb.position.set(0, lay.cy, 0);

      if (figAspect) {
        const visH1 = 2 * TAN * (9 - FIG_Z); // visible height at the figure's depth
        let H = (1.03 * orbD / visH0) * visH1;
        let W = H * figAspect;
        const maxW = visH1 * asp * 0.95;
        if (W > maxW) {
          H *= maxW / W;
          W = maxW;
        }
        fig.W = W;
        fig.H = H;
        fig.y = ((cyFrac - (0.45 * orbD) / visH0) - 0.5) * visH1; // feet sit a bit below the orb's centre
      }
    };
    layout();

    new THREE.TextureLoader().load(
      "/images/hooded-figure.png",
      (tex) => {
        if (!alive) {
          tex.dispose();
          return;
        }
        const img = tex.image as { width: number; height: number };
        tex.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
        figTex = tex;
        figAspect = img.width / img.height;
        figMat.uniforms.uTex.value = tex;
        figMat.uniforms.uAspect.value = figAspect;
        figure.visible = true;
        layout();
        if (reduced) frame(6);
      },
      undefined,
      () => console.warn("Could not load /images/hooded-figure.png (check public/images)")
    );

    /* Input */
    const mouse = { x: 0, y: 0 };
    const onMove = (e: PointerEvent) => {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    if (!reduced) window.addEventListener("pointermove", onMove, { passive: true });

    /* Theme: follow the Tailwind "dark" class on <html> */
    let target = dark0;
    let current = dark0;
    let lastDark = dark0 > 0.5;
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
    const m = { x: 0, y: 0 };
    const darkLine = new THREE.Color(0.55, 0.75, 1.0);
    const lightLine = new THREE.Color(0.1, 0.25, 0.8);

    function frame(t: number) {
      current += (target - current) * (reduced ? 1 : 0.06);
      const dark = current > 0.5;
      if (dark !== lastDark) {
        lastDark = dark;
        fgMat.blending = dark ? THREE.AdditiveBlending : THREE.NormalBlending;
        fgMat.needsUpdate = true;
      }

      smoothed += ((reduced ? 0 : progress.current) - smoothed) * 0.08;

      // same camera as the background layer, so both stay perfectly aligned
      camera.position.z = 9 - smoothed * 7.2;
      camera.position.x += (mouse.x * 0.6 - camera.position.x) * 0.04;
      camera.position.y += (mouse.y * 0.4 - camera.position.y) * 0.04;
      camera.lookAt(0, 0, 0);

      const auto = Math.min(Math.max(t - 3, 0) / 1.5, 1); // fallback fade-in if the GSAP intro never runs
      const iv = Math.max(reduced ? 1 : intro.current.v, auto);
      const away = 1 - THREE.MathUtils.smoothstep(smoothed, 0.35, 0.8);
      const orbAway = 1 - THREE.MathUtils.smoothstep(smoothed, 0.7, 1.0);
      m.x += (mouse.x - m.x) * 0.05;
      m.y += (mouse.y - m.y) * 0.05;

      // eclipse
      orbMat.uniforms.uTime.value = t;
      orbMat.uniforms.uDark.value = current;
      orbMat.uniforms.uOpacity.value = iv * orbAway;
      orb.scale.setScalar(lay.R * 2 * (0.9 + 0.1 * iv) * (1 + Math.sin(t * 0.9) * 0.006));

      // shards drift slowly around it
      shardMat.color.copy(lightLine).lerp(darkLine, current);
      shardMat.opacity = 0.75 * iv * away;
      SHARDS.forEach((d, i) => {
        const a = d.a + t * 0.05 * (i % 2 ? -1 : 1);
        shards[i].position.set(
          Math.cos(a) * d.r * lay.R,
          lay.cy + Math.sin(a) * d.r * lay.R * 0.8 + Math.sin(t * 0.6 + i * 2.0) * 0.12,
          d.z
        );
        const k = d.s * lay.R;
        shards[i].scale.set(k * 0.55, k * 1.5, k * 0.55);
        shards[i].rotation.set(t * d.spin * 0.6, t * d.spin, i);
      });

      // figure
      figMat.uniforms.uOpacity.value = iv * away;
      figMat.uniforms.uDark.value = current;
      (figMat.uniforms.uMouse.value as THREE.Vector2).set(m.x, m.y);
      figure.rotation.set(-m.y * 0.05, m.x * 0.14, 0);
      const grow = 0.94 + 0.06 * iv;
      figure.scale.set(fig.W * grow, fig.H * grow * (1 + Math.sin(t * 1.1) * 0.0035), 1);
      figure.position.set(0, fig.y - (1 - iv) * 0.4 - smoothed * 0.4, FIG_Z);

      // bokeh
      fgMat.uniforms.uTime.value = t;
      fgMat.uniforms.uDark.value = current;
      fgMat.uniforms.uOpacity.value = iv * away;

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
      alive = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      mo.disconnect();
      window.removeEventListener("pointermove", onMove);
      orbGeo.dispose();
      orbMat.dispose();
      shardGeo.dispose();
      shardMat.dispose();
      figGeo.dispose();
      figMat.dispose();
      figTex?.dispose();
      fgGeo.dispose();
      fgMat.dispose();
      renderer.forceContextLoss();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [progress, intro]);

  return <div ref={mountRef} className="absolute inset-0" aria-hidden="true" />;
}
