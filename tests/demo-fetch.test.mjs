import assert from "node:assert/strict";
import test from "node:test";
import { isBlockedDemoRequest } from "../src/demo/demoFetch.js";

const base = "https://robolotus.github.io/hazard-guard-console-demo/";

test("정적 지도 자산은 데모 fetch 가드를 통과한다", () => {
  assert.equal(isBlockedDemoRequest("/hazard-guard-console-demo/maps/real-factory/cloud.ply", base), false);
  assert.equal(isBlockedDemoRequest("/hazard-guard-console-demo/maps/real-factory/map.png", base), false);
});

test("API와 외부 요청은 정적 데모에서 차단한다", () => {
  assert.equal(isBlockedDemoRequest("/api/v1/system/mode", base), true);
  assert.equal(isBlockedDemoRequest("https://example.com/data.json", base), true);
});
