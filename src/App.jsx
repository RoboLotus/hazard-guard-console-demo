import { useState } from "react";
import { CheckCircle, Warning } from "@phosphor-icons/react";
import Sidebar from "./components/Sidebar.jsx";
import { initialEvents, navigationLabels } from "./data/dashboardData.js";
import {
  demoMediaStatus,
  demoSpatialState,
  demoSystemMode,
  demoTelemetry,
} from "./demo/demoScenario.js";
import EventsPage from "./pages/EventsPage.jsx";
import HelpPage from "./pages/HelpPage.jsx";
import MapPage from "./pages/MapPage.jsx";
import Overview from "./pages/Overview.jsx";
import ReportsPage from "./pages/ReportsPage.jsx";
import Settings from "./pages/Settings.jsx";
import VideoPage from "./pages/VideoPage.jsx";

export function App() {
  const [active, setActive] = useState("overview");
  const [events, setEvents] = useState(initialEvents);
  const [toast, setToast] = useState(null);

  const notify = (message, tone = "info") => {
    setToast({ message, tone, id: Date.now() });
    window.setTimeout(() => setToast(null), 3200);
  };
  const navigate = (id) => {
    if (["overview", "map", "events", "video", "report", "settings", "help"].includes(id)) setActive(id);
    else notify(`${navigationLabels[id] || "선택한"} 화면은 데모에 포함되지 않습니다.`);
  };
  const acknowledge = (id) => {
    setEvents((current) => current.map((event) => event.id === id
      ? { ...event, acknowledged: true, status: "acknowledged" }
      : event));
    notify("데모에서 이벤트를 확인 처리했습니다.");
  };
  const updateEventStatus = (id, status) => {
    setEvents((current) => current.map((event) => event.id === id
      ? { ...event, status, acknowledged: status !== "new", assignee: "관리자" }
      : event));
  };
  const demoAction = () => {
    notify("DEMO MODE에서는 실제 로봇 명령을 전송하지 않습니다.", "warning");
    return Promise.resolve(demoSystemMode);
  };

  return (
    <div className="app-shell demo-shell">
      <Sidebar
        active={active}
        onNavigate={navigate}
        pendingEvents={events.filter((event) => event.status === "new").length}
      />
      <main className="main-content">
        <div className="demo-banner" role="status">
          <span>DEMO MODE</span>
          <p>정적 화면 예시입니다. 실제 로봇·서버·ROS와 연결되지 않습니다.</p>
        </div>
        {active === "overview" && <Overview events={events} onAcknowledge={acknowledge} onNavigate={navigate} notify={notify} telemetry={demoTelemetry} mediaStatus={demoMediaStatus} spatialState={demoSpatialState} sendCommand={demoAction} />}
        {active === "map" && <MapPage mediaStatus={demoMediaStatus} telemetry={demoTelemetry} spatialState={demoSpatialState} systemMode={demoSystemMode} modeBusy={false} onModeChange={demoAction} onInitializeLocalization={demoAction} onSystemModeUpdate={() => {}} onSaveSystemMap={demoAction} onSaveAndStop={demoAction} onStopSystemMode={demoAction} notify={notify} demoMode />}
        {active === "events" && <EventsPage events={events} onUpdateStatus={updateEventStatus} notify={notify} onOpenVideo={() => navigate("video")} />}
        {active === "video" && <VideoPage mediaStatus={demoMediaStatus} telemetry={demoTelemetry} events={events} notify={notify} />}
        {active === "report" && <ReportsPage notify={notify} />}
        {active === "settings" && <Settings notify={notify} apiOnline={false} spatialState={demoSpatialState} />}
        {active === "help" && <HelpPage onNavigate={navigate} />}
      </main>
      {toast && <div className={`toast ${toast.tone}`} role="status">{toast.tone === "warning" ? <Warning size={19} weight="fill" /> : <CheckCircle size={19} weight="fill" />}<span>{toast.message}</span></div>}
    </div>
  );
}
