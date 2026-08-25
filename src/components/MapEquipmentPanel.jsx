import { useMemo, useState } from "react";
import { Buildings, Cube, FloppyDisk, MapPin, Plus, Trash } from "@phosphor-icons/react";
import { CollapsibleCard } from "./Common.jsx";
import {
  adjustEquipmentRoi,
  conflictingEquipmentIds,
  EQUIPMENT_ROI_CLEARANCE_M,
  EQUIPMENT_ROI_STEP_M,
} from "../equipmentRoi.js";

export default function MapEquipmentPanel({
  equipment,
  selectedId,
  pointMode,
  onSelect,
  onChange,
  onStartPoint,
  onOpen3d,
  onSave,
  notify,
}) {
  const [busy, setBusy] = useState(false);
  const selected = equipment.find((item) => item.id === selectedId) || null;
  const overlapping = useMemo(() => conflictingEquipmentIds(equipment), [equipment]);

  const updateSelected = (patch) => {
    if (!selected) return;
    onChange(equipment.map((item) => item.id === selected.id ? { ...item, ...patch } : item));
  };

  const adjustRoi = (bound, axis, delta) => {
    if (!selected) return;
    onChange(equipment.map((item) => (
      item.id === selected.id ? adjustEquipmentRoi(item, bound, axis, delta) : item
    )));
  };

  const save = async () => {
    if (overlapping.size) {
      notify(`설비 ROI는 서로 겹치거나 ${EQUIPMENT_ROI_CLEARANCE_M * 100}cm보다 가까울 수 없습니다.`, "warning");
      return;
    }
    setBusy(true);
    try {
      await onSave(equipment);
    } finally {
      setBusy(false);
    }
  };

  return (
    <CollapsibleCard icon={Buildings} title="지도 설비 등록" subtitle="정적 map 좌표계 ROI" className="map-equipment-card">
      <div className="map-registration-gate ready">
        <span />
        <div><strong>등록 가능</strong><small>real_factory의 고정 좌표계에 브라우저 데모 데이터를 저장합니다.</small></div>
      </div>
      <div className="map-equipment-toolbar">
        <button type="button" className="button secondary" onClick={onStartPoint}><MapPin size={15} weight="duotone" />{pointMode ? "지도에서 선택 중" : "2D 위치 추가"}</button>
        <button type="button" className="button secondary" disabled={!selected} onClick={onOpen3d}><Cube size={15} />3D ROI 확인</button>
      </div>
      {equipment.length ? (
        <div className="map-equipment-list" aria-label="데모 설비 목록">
          {equipment.map((item) => (
            <button key={item.id} type="button" className={`${item.id === selectedId ? "selected" : ""} ${overlapping.has(item.id) ? "conflict" : ""}`} onClick={() => onSelect(item.id)}>
              <span /><strong>{item.display_name}</strong><small>{item.enabled ? "감시" : "비활성"}{overlapping.has(item.id) ? " · ROI 충돌" : ""}</small>
            </button>
          ))}
        </div>
      ) : <p className="map-equipment-empty">등록된 설비가 없습니다.</p>}
      {selected && (
        <div className="map-equipment-editor">
          <label><span>설비 이름</span><input value={selected.display_name} onChange={(event) => updateSelected({ display_name: event.target.value })} /></label>
          <label className="map-equipment-enabled"><input type="checkbox" checked={selected.enabled} onChange={(event) => updateSelected({ enabled: event.target.checked })} /><span>순찰 열화상 감시 활성화</span></label>
          <div className="map-roi-grid">
            {["X", "Y", "Z"].map((axis, index) => (
              <div key={axis} className="map-roi-axis">
                <strong>{axis} 범위 <small>m</small></strong>
                {[["min", "최소"], ["max", "최대"]].map(([bound, label]) => (
                  <label key={bound} className="map-roi-bound">
                    <span>{label}</span>
                    <div className="map-roi-stepper">
                      <button type="button" aria-label={`${axis} ${label} 감소`} onClick={() => adjustRoi(bound, index, -EQUIPMENT_ROI_STEP_M)}>−</button>
                      <input readOnly value={Number(selected.roi[bound][index]).toFixed(2)} aria-label={`${axis} ${label}`} />
                      <button type="button" aria-label={`${axis} ${label} 증가`} onClick={() => adjustRoi(bound, index, EQUIPMENT_ROI_STEP_M)}>+</button>
                    </div>
                  </label>
                ))}
              </div>
            ))}
          </div>
          <div className="map-equipment-actions">
            <button type="button" className="button danger ghost" onClick={() => {
              const next = equipment.filter((item) => item.id !== selected.id);
              onChange(next);
              onSelect(next[0]?.id || null);
            }}><Trash size={15} />삭제</button>
            <button type="button" className="button primary" disabled={busy || overlapping.size > 0} onClick={save}><FloppyDisk size={15} />{busy ? "저장 중" : "저장"}</button>
          </div>
        </div>
      )}
      {!selected && <button type="button" className="map-equipment-add-empty" onClick={onStartPoint}><Plus size={16} />첫 설비 위치 등록</button>}
    </CollapsibleCard>
  );
}
