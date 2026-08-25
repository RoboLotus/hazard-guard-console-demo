export const EQUIPMENT_ROI_CLEARANCE_M = 0.03;
export const EQUIPMENT_ROI_STEP_M = 0.01;

export function roundCoordinate(value) {
  return Number(Number(value).toFixed(2));
}

export function equipmentRoiConflict(first, second, clearance = EQUIPMENT_ROI_CLEARANCE_M) {
  if (!first?.roi || !second?.roi) return false;
  return [0, 1, 2].every((axis) => (
    Number(first.roi.max[axis]) + clearance > Number(second.roi.min[axis])
    && Number(second.roi.max[axis]) + clearance > Number(first.roi.min[axis])
  ));
}

export function conflictingEquipmentIds(equipment = []) {
  const enabled = equipment.filter((item) => item.enabled !== false);
  const result = new Set();
  enabled.forEach((first, index) => {
    enabled.slice(index + 1).forEach((second) => {
      if (equipmentRoiConflict(first, second)) {
        result.add(first.id);
        result.add(second.id);
      }
    });
  });
  return result;
}

export function createEquipmentAt(candidate, index) {
  const x = roundCoordinate(candidate.mapX ?? candidate.x);
  const y = roundCoordinate(candidate.mapY ?? candidate.y);
  return {
    id: globalThis.crypto?.randomUUID?.() || `equipment-${Date.now()}-${index}`,
    display_name: `설비 ${index + 1}`,
    enabled: true,
    critical_temperature_c: 80,
    adaptive_delta_c: 10,
    adaptive_threshold_enabled: true,
    roi: {
      min: [roundCoordinate(x - 0.3), roundCoordinate(y - 0.3), 0],
      max: [roundCoordinate(x + 0.3), roundCoordinate(y + 0.3), 0.8],
    },
  };
}

export function adjustEquipmentRoi(equipment, bound, axis, delta) {
  const minimum = Number(equipment.roi.min[axis]);
  const maximum = Number(equipment.roi.max[axis]);
  const current = bound === "min" ? minimum : maximum;
  const candidate = roundCoordinate(current + delta);
  const nextValue = bound === "min"
    ? Math.min(candidate, roundCoordinate(maximum - EQUIPMENT_ROI_STEP_M))
    : Math.max(candidate, roundCoordinate(minimum + EQUIPMENT_ROI_STEP_M));
  const roi = { min: [...equipment.roi.min], max: [...equipment.roi.max] };
  roi[bound][axis] = nextValue;
  return { ...equipment, roi };
}
