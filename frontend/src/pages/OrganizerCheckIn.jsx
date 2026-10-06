import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import jsQR from "jsqr";
import {
  Camera, CameraOff, CheckCircle2, AlertTriangle, XCircle,
  Users, Download, Search, RefreshCw, ArrowLeft, Scan,
  Clock3, UserCheck, UserX, Zap,
} from "lucide-react";
import { getEventAttendance, checkInByQrToken, exportAttendanceCSV } from "../api";

function playBeep(type) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator(), gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.type = "sine"; osc.frequency.value = type === "success" ? 880 : type === "warning" ? 440 : 220;
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.4);
  } catch (_) {}
}

function ResultBanner({ result, onDismiss }) {
  if (!result) return null;
  const { code, student, checked_in_at, attendance, detail } = result;
  const isSuccess = code === "success";
  const isDuplicate = code === "already_checked_in";
  const isNotOpen = code === "checkin_not_open";
  const isEnded = code === "event_ended";
  const bg = isSuccess
    ? "linear-gradient(135deg,#16a34a,#15803d)"
    : isDuplicate
    ? "linear-gradient(135deg,#d97706,#b45309)"
    : isNotOpen
    ? "linear-gradient(135deg,#2563eb,#1d4ed8)"
    : isEnded
    ? "linear-gradient(135deg,#475569,#334155)"
    : "linear-gradient(135deg,#dc2626,#b91c1c)";
  const Icon = isSuccess ? CheckCircle2 : isDuplicate ? AlertTriangle : (isNotOpen || isEnded) ? Clock3 : XCircle;
  const title = isSuccess
    ? "Check-In Successful!"
    : isDuplicate
    ? "Already Checked In"
    : isNotOpen
    ? "Check-In Not Open Yet"
    : isEnded
    ? "Check-In Closed (Event Ended)"
    : "Invalid Ticket";
  return (
    <div style={{ position:"fixed",top:"24px",left:"50%",transform:"translateX(-50%)",zIndex:9999,background:bg,color:"#fff",borderRadius:"16px",padding:"20px 28px",minWidth:"340px",maxWidth:"460px",boxShadow:"0 20px 60px rgba(0,0,0,0.4)",animation:"slideInDown 0.3s ease" }}>
      <div style={{ display:"flex",alignItems:"flex-start",gap:"14px" }}>
        <Icon size={26} style={{ flexShrink:0,marginTop:"2px" }}/>
        <div style={{ flex:1 }}>
          <div style={{ fontWeight:700,fontSize:"1rem",marginBottom:"5px" }}>{title}</div>
          {detail && <div style={{ fontSize:"0.88rem", opacity:0.95 }}>{detail}</div>}
          {student && <div style={{ fontSize:"0.88rem", marginTop:"4px" }}><div style={{ fontWeight:600 }}>{student.name}</div><div style={{ opacity:0.85 }}>{student.email}</div>{student.registration_number && <div>Roll: {student.registration_number}</div>}</div>}
          {checked_in_at && <div style={{ fontSize:"0.78rem",opacity:0.8,marginTop:"4px" }}>{isSuccess ? "Checked in at " : "Previously at "}{new Date(checked_in_at).toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit",second:"2-digit"})}</div>}
          {isSuccess && attendance && <div style={{ marginTop:"8px",background:"rgba(255,255,255,0.18)",borderRadius:"8px",padding:"6px 12px",fontSize:"0.82rem",display:"flex",gap:"14px" }}><span>{attendance.total_checked_in} in</span><span>/ {attendance.total_registered}</span><span>({attendance.percentage}%)</span></div>}
        </div>
        <button onClick={onDismiss} style={{ background:"none",border:"none",color:"#fff",cursor:"pointer",fontSize:"1.1rem" }}>x</button>
      </div>
    </div>
  );
}

export default function OrganizerCheckIn() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const videoRef = useRef(null), canvasRef = useRef(null), streamRef = useRef(null);
  const rafRef = useRef(null), lastTokenRef = useRef(""), lastTimeRef = useRef(0);
  const [cameraOn, setCameraOn] = useState(false);
  const [cameraErr, setCameraErr] = useState("");
  const [manualCode, setManualCode] = useState("");
  const [manualLoading, setManualLoading] = useState(false);
  const [manualErr, setManualErr] = useState("");
  const [scanResult, setScanResult] = useState(null);
  const [attendance, setAttendance] = useState(null);
  const [attLoading, setAttLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [permErr, setPermErr] = useState("");

  const loadAttendance = useCallback(async () => {
    try {
      setPermErr("");
      setAttendance(await getEventAttendance(eventId));
    } catch (e) {
      if (e.status === 403 || e.data?.detail?.toLowerCase().includes("organizer")) {
        setPermErr("Access Denied: You are not authorized to manage check-ins for this event. You can only check-in attendees for events created by you.");
      } else {
        console.error(e);
      }
    } finally {
      setAttLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    loadAttendance();
    const t = setInterval(loadAttendance, 15000);
    return () => clearInterval(t);
  }, [loadAttendance]);

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    setCameraOn(false);
  };

  const startCamera = async () => {
    setCameraErr("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode:"environment", width:{ideal:1280}, height:{ideal:720} }
      });
      streamRef.current = stream;
      if (videoRef.current) { videoRef.current.srcObject = stream; await videoRef.current.play(); }
      setCameraOn(true);
      const tick = () => {
        if (!videoRef.current || !canvasRef.current) return;
        const v = videoRef.current, c = canvasRef.current;
        if (v.readyState === v.HAVE_ENOUGH_DATA) {
          c.width = v.videoWidth; c.height = v.videoHeight;
          const ctx = c.getContext("2d"); ctx.drawImage(v, 0, 0, c.width, c.height);
          const img = ctx.getImageData(0, 0, c.width, c.height);
          const code = jsQR(img.data, img.width, img.height, { inversionAttempts:"dontInvert" });
          if (code?.data) {
            const now = Date.now();
            if (code.data !== lastTokenRef.current || now - lastTimeRef.current > 5000) {
              lastTokenRef.current = code.data; lastTimeRef.current = now; doCheckIn(code.data);
            }
          }
        }
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    } catch { setCameraErr("Camera unavailable. Use manual entry below."); }
  };

  useEffect(() => () => stopCamera(), []);

  const showResult = (res) => {
    setScanResult(res);
    playBeep(res.code === "success" ? "success" : res.code === "already_checked_in" ? "warning" : "error");
    if (res.code === "success") loadAttendance();
    setTimeout(() => setScanResult(null), 5000);
  };

  const doCheckIn = async (token) => {
    try { showResult(await checkInByQrToken(token)); }
    catch (e) { const d = e.data||{}; showResult({ code:d.code||"invalid_ticket", student:d.student, checked_in_at:d.checked_in_at }); }
  };

  const handleManual = async (e) => {
    e.preventDefault(); if (!manualCode.trim()) return;
    setManualLoading(true); setManualErr("");
    try { showResult(await checkInByQrToken(manualCode.trim())); setManualCode(""); }
    catch (e) { const d = e.data||{}; setManualErr(d.detail||e.message||"Failed"); showResult({ code:d.code||"invalid_ticket", student:d.student, checked_in_at:d.checked_in_at }); }
    finally { setManualLoading(false); }
  };

  const allAttendees = attendance?.attendees || [];
  const summary = attendance?.summary || {};
  const event = attendance?.event || {};
  const pct = summary.percentage || 0;
  const filtered = allAttendees.filter(a => {
    const fOk = filter==="all" || (filter==="checked_in" && a.checked_in) || (filter==="not_arrived" && !a.checked_in);
    const q = search.toLowerCase();
    const sOk = !q || [a.student?.name, a.student?.email, a.student?.username, a.student?.registration_number].some(v => v?.toLowerCase().includes(q));
    return fOk && sOk;
  });

  // ── Access denied screen ──
  if (permErr) {
    return (
      <div style={{ padding:"60px 20px", textAlign:"center", maxWidth:"520px", margin:"40px auto" }}>
        <div style={{ width:"64px", height:"64px", borderRadius:"50%", background:"#fee2e2", color:"#dc2626", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 20px auto" }}>
          <UserX size={32} />
        </div>
        <h2 style={{ fontSize:"1.5rem", fontWeight:700, color:"#1e293b", marginBottom:"10px" }}>Access Denied</h2>
        <p style={{ color:"#64748b", lineHeight:1.6, marginBottom:"24px" }}>{permErr}</p>
        <button
          onClick={() => navigate("/events")}
          style={{ padding:"12px 24px", background:"#2563eb", color:"#ffffff", border:"none", borderRadius:"10px", fontWeight:600, cursor:"pointer", display:"inline-flex", alignItems:"center", gap:"8px" }}
        >
          <ArrowLeft size={18} /> Return to My Events
        </button>
      </div>
    );
  }

  // Determine if event is over (completed, cancelled, or end_date passed)
  const isEventOver =
    event.status === "completed" ||
    event.status === "cancelled" ||
    (event.end_date && new Date(event.end_date) < new Date());

  // ── Shared: stat cards + progress bar ──
  const StatsAndProgress = () => (
    <>
      <div className="student-stats-grid" style={{ marginBottom:"1.5rem" }}>
        {[
          ["Total Registered", summary.total_registered, <Users size={20}/>, "blue"],
          ["Checked In", summary.total_checked_in, <UserCheck size={20}/>, "green"],
          ["Not Arrived", summary.total_not_arrived, <UserX size={20}/>, "orange"],
          ["Attendance %", pct + "%", <Zap size={20}/>, "purple"],
        ].map(([label, value, icon, color]) => (
          <div key={label} className="student-stat-card">
            <div className="student-stat-top"><div className={`student-stat-icon ${color}`}>{icon}</div></div>
            <h3>{value ?? "-"}</h3><p>{label}</p>
          </div>
        ))}
      </div>
      <div className="student-card" style={{ marginBottom:"1.5rem", padding:"18px 24px" }}>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"8px", fontSize:"0.88rem", fontWeight:600 }}>
          <span>Attendance Progress</span>
          <span style={{ color:"var(--primary)" }}>{summary.total_checked_in||0} / {summary.total_registered||0}</span>
        </div>
        <div style={{ height:"10px", background:"var(--border)", borderRadius:"99px", overflow:"hidden" }}>
          <div style={{ height:"100%", borderRadius:"99px", width:`${Math.min(pct,100)}%`, background:pct>=80?"#16a34a":pct>=50?"#d97706":"#3b82f6", transition:"width 0.6s ease" }}/>
        </div>
      </div>
    </>
  );

  // ── Shared: roster list renderer ──
  const RosterList = ({ showAbsent }) => (
    <div style={{ maxHeight:"600px", overflowY:"auto", display:"flex", flexDirection:"column", gap:"7px" }}>
      {attLoading ? (
        <div style={{ textAlign:"center", padding:"40px 0", color:"var(--text-light)" }}>
          <Clock3 size={22} style={{ marginBottom:"8px" }}/><p>Loading...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign:"center", padding:"40px 0", color:"var(--text-light)" }}>
          <Users size={26} style={{ marginBottom:"8px", opacity:0.4 }}/><p>No attendees match</p>
        </div>
      ) : filtered.map(a => (
        <div key={a.registration_id} style={{ display:"flex", alignItems:"center", gap:"11px", padding:"10px 12px", border:`1px solid ${a.checked_in?"rgba(34,197,94,0.3)":"var(--border)"}`, borderRadius:"10px", background:a.checked_in?"rgba(34,197,94,0.05)":"var(--bg-secondary)" }}>
          <div style={{ width:"34px", height:"34px", borderRadius:"50%", flexShrink:0, background:a.checked_in?"rgba(34,197,94,0.15)":"var(--bg-primary)", border:`2px solid ${a.checked_in?"#22c55e":"var(--border)"}`, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, fontSize:"0.85rem", color:a.checked_in?"#16a34a":"var(--text-light)" }}>
            {(a.student?.name||"?")[0].toUpperCase()}
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontWeight:600, fontSize:"0.85rem", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{a.student?.name||a.student?.username}</div>
            <div style={{ fontSize:"0.72rem", color:"var(--text-light)" }}>{a.student?.email}{a.student?.registration_number && ` - ${a.student.registration_number}`}</div>
            {a.checked_in && a.checked_in_at && (
              <div style={{ fontSize:"0.68rem", color:"#16a34a", marginTop:"2px" }}>
                Checked in at {new Date(a.checked_in_at).toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"})}
              </div>
            )}
          </div>
          <span style={{ padding:"3px 9px", borderRadius:"99px", fontSize:"0.68rem", fontWeight:600, flexShrink:0, background:a.checked_in?"rgba(34,197,94,0.12)":showAbsent?"rgba(239,68,68,0.1)":"rgba(251,191,36,0.12)", color:a.checked_in?"#16a34a":showAbsent?"#dc2626":"#d97706", border:`1px solid ${a.checked_in?"rgba(34,197,94,0.25)":showAbsent?"rgba(239,68,68,0.25)":"rgba(251,191,36,0.25)"}` }}>
            {a.checked_in ? "Present" : showAbsent ? "Absent" : "Pending"}
          </span>
        </div>
      ))}
    </div>
  );

  return (
    <section style={{ padding:"0 0 60px" }}>
      <style>{`
        @keyframes slideInDown {
          from { transform: translateX(-50%) translateY(-20px); opacity: 0; }
          to   { transform: translateX(-50%) translateY(0);    opacity: 1; }
        }
        @keyframes scanPulse {
          0%,100% { box-shadow: 0 0 0 0   rgba(34,197,94,0.5); }
          50%      { box-shadow: 0 0 0 12px rgba(34,197,94,0);   }
        }
        .scan-active { animation: scanPulse 2s infinite; }
      `}</style>

      <ResultBanner result={scanResult} onDismiss={() => setScanResult(null)}/>

      {/* Page heading */}
      <div className="student-page-heading">
        <div style={{ display:"flex", alignItems:"center", gap:"14px" }}>
          <button
            type="button"
            onClick={() => { stopCamera(); navigate(-1); }}
            style={{ background:"var(--bg-secondary)", border:"1px solid var(--border)", borderRadius:"10px", padding:"8px 14px", cursor:"pointer", display:"flex", alignItems:"center", gap:"6px", color:"var(--text)", fontSize:"0.9rem" }}
          >
            <ArrowLeft size={16}/> Back
          </button>
          <div>
            <div className="student-welcome">ORGANIZER TOOLS</div>
            <h1 style={{ marginBottom:"4px" }}>
              {isEventOver ? "Attendance Report" : "QR Check-In"}
            </h1>
            <p style={{ margin:0 }}>
              {event.title
                ? isEventOver
                  ? `Final attendance for: ${event.title}`
                  : `Scanning for: ${event.title}`
                : "Loading..."}
            </p>
          </div>
        </div>
      </div>

      {/* ── READ-ONLY BANNER (completed / past events) ── */}
      {isEventOver && (
        <div style={{ background:"linear-gradient(135deg,#7c3aed,#6d28d9)", color:"#fff", borderRadius:"14px", padding:"14px 20px", marginBottom:"1.5rem", display:"flex", alignItems:"center", gap:"12px", fontSize:"0.9rem", fontWeight:600 }}>
          <UserCheck size={22} style={{ flexShrink:0 }}/>
          <div>
            <div>Event Ended — Attendance Report (Read-Only)</div>
            <div style={{ fontWeight:400, fontSize:"0.8rem", opacity:0.85, marginTop:"2px" }}>
              Check-in is closed. You can view and export the final attendance list below.
            </div>
          </div>
        </div>
      )}

      <StatsAndProgress />

      {isEventOver ? (
        /* ══════════════════════════════════════════
           READ-ONLY MODE — full-width roster only
        ══════════════════════════════════════════ */
        <div className="student-card">
          <div className="student-card-header">
            <div>
              <h2 style={{ display:"flex", alignItems:"center", gap:"8px" }}>
                <Users size={18}/> Final Attendance Roster
              </h2>
              <p>Event has ended — check-in is disabled</p>
            </div>
            <div style={{ display:"flex", gap:"8px" }}>
              <button type="button" className="btn-secondary" onClick={loadAttendance} style={{ display:"flex", alignItems:"center", gap:"5px", fontSize:"0.8rem", padding:"6px 10px" }}>
                <RefreshCw size={12}/> Refresh
              </button>
              <button type="button" className="btn-primary" onClick={() => exportAttendanceCSV(eventId, event.title)} style={{ display:"flex", alignItems:"center", gap:"5px", fontSize:"0.8rem", padding:"6px 10px" }}>
                <Download size={12}/> Export CSV
              </button>
            </div>
          </div>
          <div style={{ padding:"0 20px 20px" }}>
            {/* Search */}
            <div style={{ position:"relative", marginBottom:"10px" }}>
              <Search size={14} style={{ position:"absolute", left:"11px", top:"50%", transform:"translateY(-50%)", color:"var(--text-light)" }}/>
              <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name, email, roll..." style={{ width:"100%", padding:"8px 12px 8px 32px", border:"1px solid var(--border)", borderRadius:"8px", background:"var(--bg-secondary)", color:"var(--text)", fontSize:"0.82rem", boxSizing:"border-box" }}/>
            </div>
            {/* Filter tabs */}
            <div style={{ display:"flex", gap:"6px", marginBottom:"12px" }}>
              {[
                ["all",         `All (${allAttendees.length})`],
                ["checked_in",  `Present (${summary.total_checked_in||0})`],
                ["not_arrived", `Absent (${summary.total_not_arrived||0})`],
              ].map(([k, l]) => (
                <button key={k} type="button" onClick={() => setFilter(k)} style={{ padding:"4px 11px", borderRadius:"99px", fontSize:"0.75rem", cursor:"pointer", border:"1px solid var(--border)", background:filter===k?"var(--primary)":"var(--bg-secondary)", color:filter===k?"#fff":"var(--text)", fontWeight:filter===k?600:400 }}>{l}</button>
              ))}
            </div>
            <RosterList showAbsent={true}/>
          </div>
        </div>
      ) : (
        /* ══════════════════════════════════════════
           ACTIVE MODE — scanner + live roster
        ══════════════════════════════════════════ */
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1.5rem", alignItems:"start" }}>

          {/* Left column: QR Scanner + Manual Entry */}
          <div style={{ display:"flex", flexDirection:"column", gap:"1.5rem" }}>

            {/* QR Scanner */}
            <div className="student-card">
              <div className="student-card-header">
                <div>
                  <h2 style={{ display:"flex", alignItems:"center", gap:"8px" }}><Camera size={18}/> QR Scanner</h2>
                  <p>Point camera at ticket QR code</p>
                </div>
              </div>
              <div style={{ padding:"0 20px 20px" }}>
                <div
                  style={{ position:"relative", background:"#111", borderRadius:"12px", overflow:"hidden", aspectRatio:"4/3", marginBottom:"14px", border:`3px solid ${cameraOn?"#22c55e":"var(--border)"}` }}
                  className={cameraOn ? "scan-active" : ""}
                >
                  <video ref={videoRef} muted playsInline style={{ width:"100%", height:"100%", objectFit:"cover", display:cameraOn?"block":"none" }}/>
                  <canvas ref={canvasRef} style={{ display:"none" }}/>
                  {!cameraOn && (
                    <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", color:"#555", gap:"10px" }}>
                      <CameraOff size={36}/><span style={{ fontSize:"0.85rem" }}>Camera off</span>
                    </div>
                  )}
                  {cameraOn && (
                    <div style={{ position:"absolute", bottom:"10px", left:"50%", transform:"translateX(-50%)", background:"rgba(0,0,0,0.7)", color:"#22c55e", borderRadius:"99px", padding:"4px 14px", fontSize:"0.72rem", fontWeight:600, display:"flex", alignItems:"center", gap:"5px" }}>
                      <Scan size={11}/> Scanning...
                    </div>
                  )}
                </div>
                {cameraErr && (
                  <div style={{ background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.3)", borderRadius:"8px", padding:"10px 14px", color:"#ef4444", fontSize:"0.82rem", marginBottom:"12px" }}>{cameraErr}</div>
                )}
                {!cameraOn
                  ? <button type="button" className="btn-primary" style={{ width:"100%", display:"flex", alignItems:"center", justifyContent:"center", gap:"8px" }} onClick={startCamera}><Camera size={15}/> Start Camera</button>
                  : <button type="button" className="btn-secondary" style={{ width:"100%", display:"flex", alignItems:"center", justifyContent:"center", gap:"8px" }} onClick={stopCamera}><CameraOff size={15}/> Stop Camera</button>
                }
              </div>
            </div>

            {/* Manual Entry */}
            <div className="student-card">
              <div className="student-card-header">
                <div><h2>Manual Entry</h2><p>Enter QR token or registration ID</p></div>
              </div>
              <form onSubmit={handleManual} style={{ padding:"0 20px 20px", display:"flex", flexDirection:"column", gap:"10px" }}>
                <input type="text" value={manualCode} onChange={e => setManualCode(e.target.value)} placeholder="Paste QR token or registration ID..." style={{ width:"100%", padding:"11px 14px", border:"1px solid var(--border)", borderRadius:"8px", background:"var(--bg-secondary)", color:"var(--text)", fontSize:"0.88rem", boxSizing:"border-box" }}/>
                {manualErr && <div style={{ color:"#ef4444", fontSize:"0.8rem" }}>{manualErr}</div>}
                <button type="submit" className="btn-primary" disabled={manualLoading || !manualCode.trim()} style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:"8px" }}>
                  {manualLoading ? <Clock3 size={14}/> : <CheckCircle2 size={14}/>}
                  {manualLoading ? "Checking in..." : "Check In"}
                </button>
              </form>
            </div>
          </div>

          {/* Right column: Live Attendance Roster */}
          <div className="student-card">
            <div className="student-card-header">
              <div>
                <h2 style={{ display:"flex", alignItems:"center", gap:"8px" }}><Users size={18}/> Attendance Roster</h2>
                <p>Auto-refreshes every 15s</p>
              </div>
              <div style={{ display:"flex", gap:"8px" }}>
                <button type="button" className="btn-secondary" onClick={loadAttendance} style={{ display:"flex", alignItems:"center", gap:"5px", fontSize:"0.8rem", padding:"6px 10px" }}><RefreshCw size={12}/> Refresh</button>
                <button type="button" className="btn-primary" onClick={() => exportAttendanceCSV(eventId, event.title)} style={{ display:"flex", alignItems:"center", gap:"5px", fontSize:"0.8rem", padding:"6px 10px" }}><Download size={12}/> CSV</button>
              </div>
            </div>
            <div style={{ padding:"0 20px 20px" }}>
              {/* Search */}
              <div style={{ position:"relative", marginBottom:"10px" }}>
                <Search size={14} style={{ position:"absolute", left:"11px", top:"50%", transform:"translateY(-50%)", color:"var(--text-light)" }}/>
                <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name, email, roll..." style={{ width:"100%", padding:"8px 12px 8px 32px", border:"1px solid var(--border)", borderRadius:"8px", background:"var(--bg-secondary)", color:"var(--text)", fontSize:"0.82rem", boxSizing:"border-box" }}/>
              </div>
              {/* Filter tabs */}
              <div style={{ display:"flex", gap:"6px", marginBottom:"12px" }}>
                {[
                  ["all",         `All (${allAttendees.length})`],
                  ["checked_in",  `In (${summary.total_checked_in||0})`],
                  ["not_arrived", `Pending (${summary.total_not_arrived||0})`],
                ].map(([k, l]) => (
                  <button key={k} type="button" onClick={() => setFilter(k)} style={{ padding:"4px 11px", borderRadius:"99px", fontSize:"0.75rem", cursor:"pointer", border:"1px solid var(--border)", background:filter===k?"var(--primary)":"var(--bg-secondary)", color:filter===k?"#fff":"var(--text)", fontWeight:filter===k?600:400 }}>{l}</button>
                ))}
              </div>
              <RosterList showAbsent={false}/>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
