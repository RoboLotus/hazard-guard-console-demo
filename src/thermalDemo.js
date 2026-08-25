export const thermalDemoPresets = Object.freeze({
  normal: { label: "정상", peak: 46, status: "normal" },
  warning: { label: "주의", peak: 66, status: "warning" },
  critical: { label: "위험", peak: 86, status: "critical" },
});

function equipmentCenter(item) {
  return {
    x: (Number(item.roi.min[0]) + Number(item.roi.max[0])) / 2,
    y: (Number(item.roi.min[1]) + Number(item.roi.max[1])) / 2,
    z: (Number(item.roi.min[2]) + Number(item.roi.max[2])) / 2,
  };
}

export function temperatureToRgb(temperature) {
  const stops = [
    [20, [35, 62, 125]],
    [35, [41, 164, 196]],
    [50, [244, 202, 70]],
    [65, [239, 126, 45]],
    [85, [211, 48, 58]],
  ];
  const value = Math.max(stops[0][0], Math.min(stops.at(-1)[0], Number(temperature)));
  const upperIndex = stops.findIndex(([threshold]) => threshold >= value);
  if (upperIndex <= 0) return stops[0][1];
  const [lowerValue, lowerColor] = stops[upperIndex - 1];
  const [upperValue, upperColor] = stops[upperIndex];
  const ratio = (value - lowerValue) / (upperValue - lowerValue);
  return lowerColor.map((channel, index) => Math.round(channel + (upperColor[index] - channel) * ratio));
}

export function thermalTemperatureAt(x, y, z, equipment = [], preset = "normal") {
  const peak = thermalDemoPresets[preset]?.peak ?? thermalDemoPresets.normal.peak;
  let temperature = 24 + Math.max(0, z) * 1.2;
  equipment.filter((item) => item.enabled !== false).forEach((item, index) => {
    const center = equipmentCenter(item);
    const distance = Math.hypot(x - center.x, y - center.y, (z - center.z) * 0.7);
    const localPeak = peak - index * 4;
    temperature = Math.max(temperature, 24 + Math.max(0, localPeak - 24) * Math.exp(-(distance * distance) / 2.4));
  });
  return temperature;
}

export function buildThermalColorArray(positionAttribute, equipment, preset) {
  const colors = new Float32Array(positionAttribute.count * 3);
  for (let index = 0; index < positionAttribute.count; index += 1) {
    const temperature = thermalTemperatureAt(
      positionAttribute.getX(index),
      positionAttribute.getY(index),
      positionAttribute.getZ(index),
      equipment,
      preset,
    );
    const rgb = temperatureToRgb(temperature);
    colors[index * 3] = rgb[0] / 255;
    colors[index * 3 + 1] = rgb[1] / 255;
    colors[index * 3 + 2] = rgb[2] / 255;
  }
  return colors;
}

export function buildDemoHeatDetections(equipment = [], preset = "normal") {
  const spec = thermalDemoPresets[preset] || thermalDemoPresets.normal;
  if (preset === "normal") return [];
  return equipment.filter((item) => item.enabled !== false).slice(0, preset === "critical" ? 2 : 1).map((item, index) => {
    const center = equipmentCenter(item);
    return {
      detection_id: `static-${preset}-${item.id}`,
      equipment_id: item.id,
      equipment_name: item.display_name,
      frame_id: "map",
      x: center.x,
      y: center.y,
      temperature_c: spec.peak - index * 5,
      confidence: 0.94,
      radius_m: 0.65,
      trend_status: index === 0 ? spec.status : "warning",
      simulated: true,
      source: "demo:operator-selected",
      age_sec: 0,
    };
  });
}
