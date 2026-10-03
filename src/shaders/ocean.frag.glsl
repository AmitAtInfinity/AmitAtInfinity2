// Ocean fragment shader — color, depth, Fresnel, foam, highlights
varying vec2 vUv;
varying float vElevation;
varying vec3 vWorldPosition;

uniform vec3  uDepthColor;
uniform vec3  uSurfaceColor;
uniform float uColorOffset;
uniform float uColorMultiplier;
uniform float uTime;
uniform vec3  uCameraPosition;
uniform vec2  uWhirlpools[4];

// ─── Noise helpers ───────────────────────────────────────────────────────────
vec3 hash3(vec2 p) {
  vec3 q = vec3(dot(p, vec2(127.1, 311.7)),
                dot(p, vec2(269.5, 183.3)),
                dot(p, vec2(419.2,  371.9)));
  return fract(sin(q) * 43758.5453);
}

// Value noise – returns 0..1
float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = hash3(i + vec2(0,0)).x;
  float b = hash3(i + vec2(1,0)).x;
  float c = hash3(i + vec2(0,1)).x;
  float d = hash3(i + vec2(1,1)).x;
  return mix(mix(a,b,u.x), mix(c,d,u.x), u.y);
}

// Fractal Brownian Motion – layered noise gives organic blobs
float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  vec2  shift = vec2(100.0);
  mat2  rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5));
  for (int i = 0; i < 5; i++) {
    v += a * vnoise(p);
    p  = rot * p * 2.0 + shift;
    a *= 0.5;
  }
  return v;
}

void main() {
  // Depth-based color mixing
  float mixStrength = (vElevation + uColorOffset) * uColorMultiplier;
  mixStrength = clamp(mixStrength, 0.0, 1.0);
  vec3 color = mix(uDepthColor, uSurfaceColor, mixStrength);

  // Fresnel — more reflective at grazing angles
  vec3 viewDir = normalize(uCameraPosition - vWorldPosition);
  vec3 normal  = vec3(0.0, 1.0, 0.0);
  float fresnel = pow(1.0 - max(dot(viewDir, normal), 0.0), 3.0);
  color = mix(color, vec3(0.8, 0.9, 1.0), fresnel * 0.4);

  // ── Organic multi-scale foam patches ──────────────────────────────────────
  vec2 foamUv    = vWorldPosition.xz * 0.012;
  vec2 foamDrift = vec2(uTime * 0.03, uTime * 0.018);

  // Large blobs — only appear at very high noise values (sparse patches)
  float largeFoam = fbm(foamUv + foamDrift);
  // Medium patches
  float midFoam   = fbm(foamUv * 3.1 + foamDrift * 1.7 + vec2(4.3, 9.1));
  // Small flecks
  float smallFoam = fbm(foamUv * 8.5 + foamDrift * 3.4 + vec2(13.7, 2.2));

  // Raised thresholds → much less coverage, only real foam areas show
  float foam = 0.0;
  foam += smoothstep(0.76, 0.84, largeFoam) * 0.30;   // sparse big blobs
  foam += smoothstep(0.73, 0.80, midFoam)   * 0.18;   // occasional mid patches
  foam += smoothstep(0.72, 0.78, smallFoam) * 0.10;   // rare tiny flecks
  foam  = clamp(foam, 0.0, 1.0);

  // Crest foam only on the tallest peaks
  float crestFoam = smoothstep(0.18, 0.28, vElevation) * 0.35;
  foam = clamp(foam + crestFoam, 0.0, 1.0);

  // Slightly creamy off-white, blended subtly
  vec3 foamColor = vec3(0.94, 0.97, 1.0);
  color = mix(color, foamColor, foam);

  // ── Subtle surface micro-texture ──────────────────────────────────────────
  float microNoise = fbm(vWorldPosition.xz * 0.25 + vec2(uTime * 0.08));
  color += (microNoise - 0.5) * 0.04;  // Very subtle ±2% brightness variation

  // ── Specular highlight ────────────────────────────────────────────────────
  vec3 lightDir  = normalize(vec3(1.0, 2.0, 1.5));
  float specular = pow(max(dot(reflect(-lightDir, normal), viewDir), 0.0), 64.0);
  color += vec3(1.0) * specular * 0.3;

  // ── Waterfall mist ────────────────────────────────────────────────────────
  float opacity = 0.92;
  if (vWorldPosition.y < -20.0) {
    opacity *= clamp(1.0 - (-20.0 - vWorldPosition.y) / 30.0, 0.0, 1.0);
    color = mix(color, vec3(1.0), 0.5);
  }

  // --- WHIRLPOOLS COLOR ---
  float maxWpEffect = 0.0;
  float maxWpFoam = 0.0;
  for (int i = 0; i < 4; i++) {
    float distToWp = distance(vWorldPosition.xz, uWhirlpools[i]);
    float wpRadius = 40.0;
    if (distToWp < wpRadius) {
      float effect = 1.0 - (distToWp / wpRadius);
      effect = smoothstep(0.0, 1.0, effect);
      maxWpEffect = max(maxWpEffect, effect);
      
      float angle = atan(vWorldPosition.x - uWhirlpools[i].x, vWorldPosition.z - uWhirlpools[i].y);
      float spiral = sin(angle * 3.0 + distToWp * 0.5 - uTime * 5.0);
      
      // Foam is strong on the ridges of the spiral, and near the center but not in the very black hole
      float foam = smoothstep(0.4, 1.0, spiral) * effect * (1.0 - pow(effect, 4.0));
      maxWpFoam = max(maxWpFoam, foam);
    }
  }

  if (maxWpEffect > 0.0) {
    // Darken the deep center (deep ocean blue, not ominous black)
    float depthDarkness = pow(maxWpEffect, 2.0);
    vec3 deepBlue = vec3(0.02, 0.15, 0.25);
    color = mix(color, deepBlue, depthDarkness * 0.9);
    
    // Add bright white/cyan foam for the swirls
    color = mix(color, vec3(0.8, 1.0, 1.0), maxWpFoam * 0.8);
  }

  // --- BERMUDA TRIANGLE COLOR ---
  vec2 bermudaCenter = vec2(0.0, 250.0);
  float distToBermuda = distance(vWorldPosition.xz, bermudaCenter);
  float bermudaRadius = 100.0;
  if (distToBermuda < bermudaRadius) {
    float effect = smoothstep(bermudaRadius, 0.0, distToBermuda);
    // Dark ominous green/black color
    vec3 bermudaColor = vec3(0.01, 0.1, 0.05);
    color = mix(color, bermudaColor, effect * 0.85);
    // Add glowing green highlights in the chaos
    if (vElevation > 2.0) {
      color += vec3(0.1, 0.8, 0.3) * effect * 0.5;
    }
  }
  
  if (opacity <= 0.01) discard;

  gl_FragColor = vec4(color, opacity);
}
