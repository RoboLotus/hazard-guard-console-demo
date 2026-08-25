import { fallbackSpatialState } from "../spatial.js";

export const DEMO_STORAGE_VERSION = 1;
export const DEMO_STORAGE_KEY = "hazard-guard:static-demo:v1";
export const DEMO_WORLD_ID = "real_factory";

export const demoMapSpec = Object.freeze({
  map_id: "simulation-env:real-factory-v1",
  frame_id: "map",
  width: 1216,
  height: 716,
  resolution: 0.05,
  origin_x: -30.4,
  origin_y: -17.9,
  source: "Simulation_env/gazebo/maps/real_factory.pgm",
});

export const demoSystemMode = Object.freeze({
  mode: "patrol",
  state: "running",
  control_enabled: false,
  deployment_target: "simulation",
  active_world_id: DEMO_WORLD_ID,
  active_map_session_id: "static-real-factory-v1",
  map_available: true,
  navigation_ready: true,
  readiness_message: "정적 데모에서는 지도 편집 기능만 제공합니다.",
  localization_pose: { x: -4.2, y: -3.4, yaw: 0.18 },
});

export const demoMediaStatus = Object.freeze({
  rgb: { available: false, source: "demo:static-image" },
  thermal: { available: false, source: "demo:static-image" },
  map: {
    available: true,
    source: "demo:real-factory",
    static_url: `${import.meta.env.BASE_URL}maps/real-factory/map.png`,
    width: demoMapSpec.width,
    height: demoMapSpec.height,
    metadata: demoMapSpec,
  },
});

export const demoTelemetry = Object.freeze({
  battery: { percentage: 78, voltage: 11.9 },
  network: { connected: true, signal: 82 },
  lidar: { connected: true },
  speed: { linear: 0.18 },
  speed_mps: 0,
  mode: "stopped",
});

export const initialDemoEquipment = Object.freeze([
  {
    id: "primary_shredder_motor",
    display_name: "1차 파쇄기 모터",
    enabled: true,
    critical_temperature_c: 80,
    adaptive_delta_c: 10,
    adaptive_threshold_enabled: true,
    roi: { min: [-6.4, -3.4, 0], max: [-5.4, -2.4, 1.2] },
  },
  {
    id: "sorting_line_drive",
    display_name: "선별 라인 구동부",
    enabled: true,
    critical_temperature_c: 75,
    adaptive_delta_c: 8,
    adaptive_threshold_enabled: true,
    roi: { min: [1.6, -1.2, 0], max: [3.0, 0.2, 1.0] },
  },
  {
    id: "baler_hydraulic_tank",
    display_name: "압축기 유압 탱크",
    enabled: true,
    critical_temperature_c: 85,
    adaptive_delta_c: 12,
    adaptive_threshold_enabled: false,
    roi: { min: [7.2, 3.0, 0], max: [8.2, 4.0, 1.4] },
  },
]);

export const initialDemoWaypoints = Object.freeze([
  { id: "demo-wp-1", name: "파쇄기 점검", equipment_id: "primary_shredder_motor", x: -7.2, y: -4.1, yaw: 0.35, dwell_seconds: 4, enabled: true },
  { id: "demo-wp-2", name: "선별 라인 점검", equipment_id: "sorting_line_drive", x: 0.8, y: -1.8, yaw: 0.1, dwell_seconds: 5, enabled: true },
  { id: "demo-wp-3", name: "압축기 점검", equipment_id: "baler_hydraulic_tank", x: 6.4, y: 2.4, yaw: 0.65, dwell_seconds: 5, enabled: true },
]);

export const demoSpatialState = Object.freeze({
  ...fallbackSpatialState,
  source: "demo:real-factory",
  mock: true,
  map: demoMapSpec,
  pose: {
    available: true,
    frame_id: "map",
    x: demoSystemMode.localization_pose.x,
    y: demoSystemMode.localization_pose.y,
    z: 0,
    yaw: demoSystemMode.localization_pose.yaw,
    mock: true,
  },
  trail: [],
  heatmap: {
    available: true,
    simulated: true,
    minimum_c: 22,
    maximum_c: 84.6,
    detections: [],
  },
});

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

export function createInitialDemoDocument() {
  return {
    version: DEMO_STORAGE_VERSION,
    worldId: DEMO_WORLD_ID,
    mapSignature: null,
    waypoints: clone(initialDemoWaypoints),
    equipment: clone(initialDemoEquipment),
    thermalPreset: "normal",
    savedAt: null,
  };
}

export function loadDemoDocument() {
  try {
    const parsed = JSON.parse(localStorage.getItem(DEMO_STORAGE_KEY) || "null");
    if (parsed?.version === DEMO_STORAGE_VERSION && parsed.worldId === DEMO_WORLD_ID) {
      return { ...createInitialDemoDocument(), ...parsed };
    }
  } catch {
    // A corrupt browser value must never prevent the static demo from loading.
  }
  return createInitialDemoDocument();
}

export function saveDemoDocument(document) {
  const payload = {
    ...document,
    version: DEMO_STORAGE_VERSION,
    worldId: DEMO_WORLD_ID,
    savedAt: new Date().toISOString(),
  };
  localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(payload));
  return payload;
}

export function resetDemoDocument() {
  localStorage.removeItem(DEMO_STORAGE_KEY);
  return createInitialDemoDocument();
}

export function recommendWaypointOrder(waypoints = []) {
  const remaining = waypoints.filter((item) => item.enabled !== false);
  const disabled = waypoints.filter((item) => item.enabled === false);
  if (remaining.length < 2) return [...remaining, ...disabled];
  const ordered = [remaining.shift()];
  while (remaining.length) {
    const previous = ordered.at(-1);
    let nearestIndex = 0;
    let nearestDistance = Number.POSITIVE_INFINITY;
    remaining.forEach((candidate, index) => {
      const distance = Math.hypot(candidate.x - previous.x, candidate.y - previous.y);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestIndex = index;
      }
    });
    ordered.push(remaining.splice(nearestIndex, 1)[0]);
  }
  return [...ordered, ...disabled];
}
