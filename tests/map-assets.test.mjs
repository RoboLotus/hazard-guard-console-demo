import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const root = path.resolve(import.meta.dirname, "..");
const mapDirectory = path.join(root, "public", "maps", "real-factory");

test("2D 지도와 메타데이터가 동일한 real_factory 좌표를 사용한다", () => {
  const metadata = JSON.parse(fs.readFileSync(path.join(mapDirectory, "metadata.json"), "utf8"));
  const png = fs.readFileSync(path.join(mapDirectory, "map.png"));
  assert.deepEqual([...png.subarray(1, 4)], [80, 78, 71]);
  assert.equal(png.readUInt32BE(16), metadata.width);
  assert.equal(png.readUInt32BE(20), metadata.height);
  assert.equal(metadata.world_id, "real_factory");
  assert.equal(metadata.frame_id, "map");
  assert.deepEqual(metadata.origin, [-30.4, -17.9, 0]);
  assert.equal(metadata.resolution, 0.05);
});

test("3D PLY는 브라우저용 점군과 RGB 속성을 포함한다", () => {
  const cloud = fs.readFileSync(path.join(mapDirectory, "cloud.ply"));
  const headerEnd = cloud.indexOf(Buffer.from("end_header\n"));
  assert.ok(headerEnd > 0);
  const header = cloud.subarray(0, headerEnd).toString("ascii");
  const count = Number(header.match(/element vertex (\d+)/)?.[1]);
  assert.ok(count >= 100_000);
  assert.match(header, /property uchar red/);
  assert.match(header, /property uchar green/);
  assert.match(header, /property uchar blue/);
});
