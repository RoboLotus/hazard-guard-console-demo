import assert from "node:assert/strict";
import test from "node:test";
import {
  buildDemoHeatDetections,
  temperatureToRgb,
  thermalTemperatureAt,
} from "../src/thermalDemo.js";

const equipment = [{
  id: "motor",
  display_name: "모터",
  enabled: true,
  roi: { min: [-0.5, -0.5, 0], max: [0.5, 0.5, 1] },
}];

test("위험 프리셋은 설비 중심 온도를 정상보다 높인다", () => {
  const normal = thermalTemperatureAt(0, 0, 0.5, equipment, "normal");
  const critical = thermalTemperatureAt(0, 0, 0.5, equipment, "critical");
  assert.ok(critical > normal);
  assert.ok(critical >= 85);
});

test("열화상 색상은 저온과 고온을 서로 다르게 표현한다", () => {
  assert.notDeepEqual(temperatureToRgb(25), temperatureToRgb(85));
});

test("정상 상태는 이벤트를 만들지 않고 위험 상태만 명시적 탐지를 만든다", () => {
  assert.equal(buildDemoHeatDetections(equipment, "normal").length, 0);
  assert.equal(buildDemoHeatDetections(equipment, "critical")[0].trend_status, "critical");
});
