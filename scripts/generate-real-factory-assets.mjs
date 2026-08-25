import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import zlib from "node:zlib";

const projectRoot = path.resolve(import.meta.dirname, "..");
const sourceMap = path.resolve(
  projectRoot,
  "..",
  "Simulation_env",
  "gazebo",
  "maps",
  "real_factory.pgm",
);
const outputDirectory = path.join(projectRoot, "public", "maps", "real-factory");

const RESOLUTION = 0.05;
const ORIGIN_X = -30.4;
const ORIGIN_Y = -17.9;
const WALL_SAMPLE_STEP = 3;
const FLOOR_SAMPLE_STEP = 12;
const WALL_HEIGHT_M = 1.8;
const WALL_LAYER_STEP_M = 0.3;

function readPgm(file) {
  const source = fs.readFileSync(file);
  let offset = 0;
  const token = () => {
    while (offset < source.length) {
      if (source[offset] === 35) {
        while (offset < source.length && source[offset] !== 10) offset += 1;
      } else if (source[offset] <= 32) offset += 1;
      else break;
    }
    const start = offset;
    while (offset < source.length && source[offset] > 32 && source[offset] !== 35) offset += 1;
    return source.subarray(start, offset).toString("ascii");
  };
  const magic = token();
  const width = Number(token());
  const height = Number(token());
  const maximum = Number(token());
  if (magic !== "P5" || maximum !== 255) throw new Error("Only 8-bit binary PGM is supported.");
  const pixels = source.subarray(offset, offset + width * height);
  if (pixels.length !== width * height) throw new Error("PGM pixel data is incomplete.");
  return { width, height, pixels };
}

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const value of buffer) {
    crc ^= value;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function pngChunk(type, payload) {
  const name = Buffer.from(type);
  const length = Buffer.alloc(4);
  length.writeUInt32BE(payload.length);
  const checksum = Buffer.alloc(4);
  checksum.writeUInt32BE(crc32(Buffer.concat([name, payload])));
  return Buffer.concat([length, name, payload, checksum]);
}

function encodePng({ width, height, pixels }) {
  const rows = [];
  for (let row = 0; row < height; row += 1) {
    rows.push(Buffer.from([0]));
    rows.push(pixels.subarray(row * width, (row + 1) * width));
  }
  const header = Buffer.alloc(13);
  header.writeUInt32BE(width, 0);
  header.writeUInt32BE(height, 4);
  header[8] = 8;
  header[9] = 0;
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    pngChunk("IHDR", header),
    pngChunk("IDAT", zlib.deflateSync(Buffer.concat(rows), { level: 9 })),
    pngChunk("IEND", Buffer.alloc(0)),
  ]);
}

function gridToMap(column, row, height) {
  return {
    x: ORIGIN_X + (column + 0.5) * RESOLUTION,
    y: ORIGIN_Y + (height - row - 0.5) * RESOLUTION,
  };
}

function buildPointCloud({ width, height, pixels }) {
  const points = [];
  for (let row = 0; row < height; row += 1) {
    for (let column = 0; column < width; column += 1) {
      const value = pixels[row * width + column];
      const occupied = value < 80;
      const free = value > 245;
      const { x, y } = gridToMap(column, row, height);
      if (occupied && row % WALL_SAMPLE_STEP === 0 && column % WALL_SAMPLE_STEP === 0) {
        for (let z = 0.05; z <= WALL_HEIGHT_M; z += WALL_LAYER_STEP_M) {
          const shade = Math.max(92, Math.round(190 - z * 32));
          points.push([x, y, z, shade, Math.min(215, shade + 16), Math.min(230, shade + 28)]);
        }
      } else if (free && row % FLOOR_SAMPLE_STEP === 0 && column % FLOOR_SAMPLE_STEP === 0) {
        points.push([x, y, 0, 48, 70, 88]);
      }
    }
  }
  return points;
}

function encodeBinaryPly(points) {
  const header = Buffer.from([
    "ply",
    "format binary_little_endian 1.0",
    "comment HazardGuard static demo generated from real_factory.pgm",
    `element vertex ${points.length}`,
    "property float x",
    "property float y",
    "property float z",
    "property uchar red",
    "property uchar green",
    "property uchar blue",
    "end_header",
    "",
  ].join("\n"));
  const body = Buffer.alloc(points.length * 15);
  points.forEach(([x, y, z, red, green, blue], index) => {
    const offset = index * 15;
    body.writeFloatLE(x, offset);
    body.writeFloatLE(y, offset + 4);
    body.writeFloatLE(z, offset + 8);
    body[offset + 12] = red;
    body[offset + 13] = green;
    body[offset + 14] = blue;
  });
  return Buffer.concat([header, body]);
}

if (!fs.existsSync(sourceMap)) {
  throw new Error(`Simulation_env map not found: ${sourceMap}`);
}

const map = readPgm(sourceMap);
const cloud = buildPointCloud(map);
fs.mkdirSync(outputDirectory, { recursive: true });
fs.writeFileSync(path.join(outputDirectory, "map.png"), encodePng(map));
fs.writeFileSync(path.join(outputDirectory, "cloud.ply"), encodeBinaryPly(cloud));
fs.writeFileSync(path.join(outputDirectory, "metadata.json"), `${JSON.stringify({
  id: "static-real-factory-v1",
  world_id: "real_factory",
  frame_id: "map",
  source: "RoboLotus/Simulation_env: gazebo/maps/real_factory.pgm",
  width: map.width,
  height: map.height,
  resolution: RESOLUTION,
  origin: [ORIGIN_X, ORIGIN_Y, 0],
  bounds: {
    min: [ORIGIN_X, ORIGIN_Y, 0],
    max: [ORIGIN_X + map.width * RESOLUTION, ORIGIN_Y + map.height * RESOLUTION, WALL_HEIGHT_M],
  },
  point_count: cloud.length,
  generated: true,
}, null, 2)}\n`);

console.log(`Generated ${map.width}x${map.height} map and ${cloud.length} point cloud vertices.`);
