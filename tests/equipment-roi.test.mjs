import assert from "node:assert/strict";
import test from "node:test";
import {
  adjustEquipmentRoi,
  conflictingEquipmentIds,
  createEquipmentAt,
  equipmentRoiConflict,
} from "../src/equipmentRoi.js";

function equipment(id, min, max) {
  return { id, enabled: true, roi: { min, max } };
}

test("겹치거나 3cm보다 가까운 ROI를 충돌로 판정한다", () => {
  const first = equipment("first", [0, 0, 0], [1, 1, 1]);
  const near = equipment("near", [1.02, 0, 0], [2, 1, 1]);
  const far = equipment("far", [1.04, 0, 0], [2, 1, 1]);
  assert.equal(equipmentRoiConflict(first, near), true);
  assert.equal(equipmentRoiConflict(first, far), false);
  assert.deepEqual([...conflictingEquipmentIds([first, near])].sort(), ["first", "near"]);
});

test("ROI 스테퍼는 최소와 최대 순서를 뒤집지 않는다", () => {
  const source = equipment("target", [0, 0, 0], [0.01, 1, 1]);
  const adjusted = adjustEquipmentRoi(source, "min", 0, 1);
  assert.equal(adjusted.roi.min[0], 0);
  assert.equal(adjusted.roi.max[0], 0.01);
});

test("지도 클릭으로 생성한 설비는 유효한 기본 3D ROI를 가진다", () => {
  const created = createEquipmentAt({ mapX: 2, mapY: -1 }, 0);
  assert.deepEqual(created.roi.min, [1.7, -1.3, 0]);
  assert.deepEqual(created.roi.max, [2.3, -0.7, 0.8]);
});
