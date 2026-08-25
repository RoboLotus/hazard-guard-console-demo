import { ArrowCounterClockwise, Database, FloppyDisk } from "@phosphor-icons/react";
import { CollapsibleCard } from "./Common.jsx";

export default function DemoStatePanel({ savedAt, onSave, onReset }) {
  return (
    <CollapsibleCard icon={Database} title="데모 데이터" subtitle="이 브라우저에만 저장">
      <p className="demo-state-description">웨이포인트, 설비 ROI와 열화상 예시 상태는 실제 Jetson이 아니라 현재 브라우저에만 보관됩니다.</p>
      <div className="demo-state-actions">
        <button type="button" className="button secondary" onClick={onReset}><ArrowCounterClockwise size={15} />샘플 복원</button>
        <button type="button" className="button primary" onClick={onSave}><FloppyDisk size={15} />전체 저장</button>
      </div>
      <small className="demo-state-saved">{savedAt ? `마지막 저장 ${new Date(savedAt).toLocaleString("ko-KR")}` : "아직 저장하지 않았습니다."}</small>
    </CollapsibleCard>
  );
}
