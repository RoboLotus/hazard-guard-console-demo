import assert from "node:assert/strict";
import test from "node:test";

const values = new Map();
globalThis.localStorage = {
  getItem: (key) => values.get(key) ?? null,
  setItem: (key, value) => values.set(key, String(value)),
  removeItem: (key) => values.delete(key),
};

const {
  createInitialDemoDocument,
  loadDemoDocument,
  recommendWaypointOrder,
  resetDemoDocument,
  saveDemoDocument,
} = await import("../src/demo/demoScenario.js");

test("데모 문서는 브라우저 저장 후 다시 복원된다", () => {
  values.clear();
  const initial = createInitialDemoDocument();
  const saved = saveDemoDocument({ ...initial, thermalPreset: "critical" });
  const loaded = loadDemoDocument();
  assert.equal(loaded.thermalPreset, "critical");
  assert.ok(saved.savedAt);
  assert.equal(loaded.waypoints.length, initial.waypoints.length);
});

test("샘플 복원은 사용자 편집값을 제거한다", () => {
  saveDemoDocument({ ...createInitialDemoDocument(), waypoints: [] });
  const restored = resetDemoDocument();
  assert.ok(restored.waypoints.length > 0);
  assert.equal(loadDemoDocument().thermalPreset, "normal");
});

test("경로 추천은 첫 지점에서 가까운 순서로 정렬한다", () => {
  const ordered = recommendWaypointOrder([
    { id: "a", x: 0, y: 0 },
    { id: "c", x: 8, y: 0 },
    { id: "b", x: 2, y: 0 },
  ]);
  assert.deepEqual(ordered.map((item) => item.id), ["a", "b", "c"]);
});
