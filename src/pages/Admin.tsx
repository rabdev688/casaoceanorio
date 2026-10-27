import { useEffect, useMemo, useState, type FormEvent } from "react";

import { formatLongDate, todayInTimeZone } from "../../server/dates.ts";

interface Stay {
  id: string;
  reference: string;
  source: "website" | "manual";
  status: "confirmed" | "cancelled";
  checkIn: string;
  checkOut: string;
  guestName: string | null;
  guestEmail: string | null;
  guestPhone: string | null;
  guests: number | null;
  message: string | null;
  conflict: boolean;
  guestEmailStatus: "pending" | "sent" | "failed";
  hostEmailStatus: "pending" | "sent" | "failed";
  cancelledAt: string | null;
}

interface VrboBlock {
  id: string;
  eventUid: string;
  checkIn: string;
  checkOut: string;
  summary: string | null;
}

interface SyncStatus {
  state: "not_configured" | "never_synced" | "ok" | "error";
  lastSync: string | null;
  lastError: string | null;
}

interface AdminPayload {
  stays: Stay[];
  vrboBlocks: VrboBlock[];
  syncStatus: SyncStatus;
  banner: string | null;
  exportUrl: string | null;
}

function nightFlags(iso: string, stays: Stay[], blocks: VrboBlock[]) {
  const website = stays.find(
    (stay) => stay.status === "confirmed" && stay.source === "website" && iso >= stay.checkIn && iso < stay.checkOut,
  );
  if (website) return { source: "website" as const, conflict: website.conflict };
  const manual = stays.find(
    (stay) => stay.status === "confirmed" && stay.source === "manual" && iso >= stay.checkIn && iso < stay.checkOut,
  );
  if (manual) return { source: "manual" as const, conflict: false };
  const vrbo = blocks.find((block) => iso >= block.checkIn && iso < block.checkOut);
  if (vrbo) return { source: "vrbo" as const, conflict: false };
  return { source: null, conflict: false };
}

export function Admin() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [data, setData] = useState<AdminPayload | null>(null);
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [month, setMonth] = useState(() => {
    const today = todayInTimeZone();
    const [year, monthNumber] = today.split("-").map(Number);
    return new Date(year, monthNumber - 1, 1);
  });
  const [blockIn, setBlockIn] = useState("");
  const [blockOut, setBlockOut] = useState("");
  const [note, setNote] = useState("");
  const today = todayInTimeZone();

  async function load() {
    const response = await fetch("/api/admin/stays", { cache: "no-store" });
    if (response.status === 401) {
      setAuthed(false);
      return;
    }
    const body = (await response.json()) as AdminPayload & { error?: string };
    if (!response.ok) {
      setNotice(body.error || "The bookings could not be loaded.");
      return;
    }
    setAuthed(true);
    setData(body);
  }

  useEffect(() => {
    void load();
  }, []);

  const cells = useMemo(() => {
    const year = month.getFullYear();
    const monthIndex = month.getMonth();
    const first = new Date(year, monthIndex, 1).getDay();
    const count = new Date(year, monthIndex + 1, 0).getDate();
    const days: { iso: string; label: string; source: string | null; conflict: boolean }[] = [];
    for (let blank = 0; blank < first; blank += 1) {
      days.push({ iso: `blank-${blank}`, label: "", source: null, conflict: false });
    }
    for (let day = 1; day <= count; day += 1) {
      const iso = `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      const flags = nightFlags(iso, data?.stays ?? [], data?.vrboBlocks ?? []);
      days.push({ iso, label: String(day), source: flags.source, conflict: flags.conflict });
    }
    return days;
  }, [data, month]);

  const stays = data?.stays ?? [];
  const upcoming = stays.filter((stay) => stay.status === "confirmed" && stay.checkOut > today);
  const earlier = stays.filter((stay) => stay.status !== "confirmed" || stay.checkOut <= today);
  const conflictCount = stays.filter((stay) => stay.conflict && stay.status === "confirmed").length;

  async function onLogin(event: FormEvent) {
    event.preventDefault();
    setLoginError("");
    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ password }),
    });
    const body = (await response.json().catch(() => ({}))) as { error?: string };
    if (!response.ok) {
      setLoginError(body.error || "Sign in failed.");
      return;
    }
    setPassword("");
    setAuthed(true);
    await load();
  }

  async function signOut() {
    await fetch("/api/admin/logout", { method: "POST" });
    setAuthed(false);
    setData(null);
    setNotice("");
  }

  async function syncNow() {
    setBusy(true);
    setNotice("");
    const response = await fetch("/api/admin/sync", { method: "POST" });
    const body = (await response.json().catch(() => ({}))) as { error?: string; ok?: boolean };
    setNotice(body.ok ? "VRBO calendar synced." : body.error || "VRBO sync did not finish.");
    await load();
    setBusy(false);
  }

  async function copyExport() {
    if (!data?.exportUrl) return;
    try {
      await navigator.clipboard.writeText(data.exportUrl);
      setNotice("Export URL copied. Paste it into VRBO's import calendar.");
    } catch {
      setNotice("Could not copy the export URL. Select it and copy it by hand.");
    }
  }

  async function cancelStay(id: string) {
    if (!window.confirm("Cancel this website booking and email the guest?")) return;
    setBusy(true);
    const response = await fetch("/api/admin/cancel", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id }),
    });
    const body = (await response.json().catch(() => ({}))) as { error?: string };
    setNotice(response.ok ? "Booking cancelled. The guest was emailed." : body.error || "Cancel failed.");
    await load();
    setBusy(false);
  }

  async function resend(id: string) {
    setBusy(true);
    const response = await fetch("/api/admin/resend", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id }),
    });
    const body = (await response.json().catch(() => ({}))) as { error?: string; ok?: boolean };
    setNotice(body.ok ? "Guest email sent." : body.error || "The email was not sent.");
    await load();
    setBusy(false);
  }

  async function addBlock(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    const response = await fetch("/api/admin/manual-block", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ checkIn: blockIn, checkOut: blockOut, note }),
    });
    const body = (await response.json().catch(() => ({}))) as { error?: string };
    if (!response.ok) setNotice(body.error || "The block was not saved.");
    else {
      setNotice("Manual block saved.");
      setBlockIn("");
      setBlockOut("");
      setNote("");
    }
    await load();
    setBusy(false);
  }

  async function removeBlock(id: string) {
    setBusy(true);
    const response = await fetch(`/api/admin/manual-block?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    const body = (await response.json().catch(() => ({}))) as { error?: string };
    setNotice(response.ok ? "Manual block removed." : body.error || "The block was not removed.");
    await load();
    setBusy(false);
  }

  if (!authed) {
    return (
      <section className="admin-page">
        <div className="admin-login">
          <p className="eyebrow">Hosts only</p>
          <h1>Booking admin</h1>
          <p className="admin-lead">Willie and Shelly sign in here to see blocked nights and direct bookings.</p>
          <form className="admin-card" onSubmit={onLogin}>
            <div className="form-group">
              <label htmlFor="adminPassword">Password</label>
              <input
                id="adminPassword"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
              />
            </div>
            {loginError ? <p className="error-msg">{loginError}</p> : null}
            <button className="primary submit-btn" type="submit">
              Sign in
            </button>
          </form>
        </div>
      </section>
    );
  }

  const monthName = month.toLocaleString("en-US", { month: "long", year: "numeric" });

  return (
    <section className="admin-page">
      <div className="admin-top">
        <div>
          <p className="eyebrow">Listing 294715</p>
          <h1>Bookings</h1>
          <p className="admin-lead">Direct stays, owner blocks, and read-only nights imported from VRBO.</p>
        </div>
        <button className="admin-quiet" type="button" onClick={() => void signOut()}>
          Sign out
        </button>
      </div>

      <div className="admin-stats">
        <div className="admin-stat">
          <span>Open stays</span>
          <strong>{upcoming.filter((stay) => stay.source === "website").length}</strong>
        </div>
        <div className="admin-stat">
          <span>Owner blocks</span>
          <strong>{upcoming.filter((stay) => stay.source === "manual").length}</strong>
        </div>
        <div className="admin-stat">
          <span>VRBO nights</span>
          <strong>{data?.vrboBlocks.length ?? 0}</strong>
        </div>
        <div className={conflictCount ? "admin-stat is-alert" : "admin-stat"}>
          <span>Conflicts</span>
          <strong>{conflictCount}</strong>
        </div>
      </div>

      {data?.banner ? <div className="admin-banner">{data.banner}</div> : null}
      {data?.syncStatus.lastError ? <p className="admin-error">Last sync error: {data.syncStatus.lastError}</p> : null}
      {notice ? <p className="admin-note">{notice}</p> : null}

      <div className="admin-split">
        <div className="admin-card">
          <div className="admin-month-head">
            <h2>{monthName}</h2>
            <div className="admin-actions">
              <button
                type="button"
                onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}
              >
                Prev
              </button>
              <button
                type="button"
                onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}
              >
                Next
              </button>
            </div>
          </div>
          <div className="admin-legend">
            <span>
              <i className="admin-swatch is-website" /> Website
            </span>
            <span>
              <i className="admin-swatch is-manual" /> Manual
            </span>
            <span>
              <i className="admin-swatch is-vrbo" /> VRBO
            </span>
          </div>
          <div className="admin-month" aria-label={monthName}>
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <span key={day} className="admin-weekday">
                {day}
              </span>
            ))}
            {cells.map((cell) => (
              <span
                key={cell.iso}
                className={
                  cell.label
                    ? `admin-day is-${cell.source || "open"}${cell.conflict ? " is-conflict" : ""}${cell.iso === today ? " is-today" : ""}`
                    : "admin-day is-pad"
                }
              >
                {cell.label}
              </span>
            ))}
          </div>
        </div>

        <div className="admin-card">
          <h2>VRBO calendar</h2>
          <p className="admin-meta">
            Last sync: {data?.syncStatus.lastSync ? new Date(data.syncStatus.lastSync).toLocaleString() : "Never"}
          </p>
          <div className="admin-export">
            <span>Paste this into VRBO's import calendar</span>
            {data?.exportUrl ? <code>{data.exportUrl}</code> : <span>Set PUBLIC_SITE_URL and ICS_EXPORT_TOKEN.</span>}
          </div>
          <div className="admin-actions">
            <button className="primary" type="button" onClick={() => void syncNow()} disabled={busy}>
              Sync now
            </button>
            <button className="admin-quiet" type="button" onClick={() => void copyExport()} disabled={!data?.exportUrl}>
              Copy export URL
            </button>
          </div>
        </div>
      </div>

      <div className="admin-stack">
        <form className="admin-card" onSubmit={addBlock}>
          <h2>Block nights</h2>
          <p className="form-subtitle">Use this for an owner stay or maintenance. It is included in the VRBO export.</p>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="blockIn">Check-in</label>
              <input id="blockIn" type="date" value={blockIn} onChange={(event) => setBlockIn(event.target.value)} required />
            </div>
            <div className="form-group">
              <label htmlFor="blockOut">Check-out</label>
              <input
                id="blockOut"
                type="date"
                value={blockOut}
                onChange={(event) => setBlockOut(event.target.value)}
                required
              />
            </div>
            <div className="form-group full-width">
              <label htmlFor="blockNote">Note</label>
              <input id="blockNote" value={note} onChange={(event) => setNote(event.target.value)} placeholder="Owner stay" />
            </div>
          </div>
          <button className="primary" type="submit" disabled={busy}>
            Block these nights
          </button>
        </form>

        <div className="admin-card">
          <h2>Stays</h2>
          <p className="admin-group-label">Coming up</p>
          {upcoming.map((stay) => (
            <StayRow
              key={stay.id}
              stay={stay}
              busy={busy}
              onCancel={cancelStay}
              onResend={resend}
              onRemove={removeBlock}
            />
          ))}
          {upcoming.length === 0 ? <p className="admin-meta">No upcoming stays.</p> : null}
          <p className="admin-group-label">Earlier</p>
          {earlier.map((stay) => (
            <StayRow
              key={stay.id}
              stay={stay}
              busy={busy}
              onCancel={cancelStay}
              onResend={resend}
              onRemove={removeBlock}
            />
          ))}
          {earlier.length === 0 ? <p className="admin-meta">No earlier stays.</p> : null}
        </div>

        <div className="admin-card">
          <h2>VRBO blocks</h2>
          <p className="form-subtitle">Read only. Change or cancel these on VRBO, then sync.</p>
          {(data?.vrboBlocks ?? []).map((block) => (
            <article key={block.id} className="admin-stay">
              <div className="admin-pills">
                <span className="admin-pill is-vrbo">VRBO</span>
                <span className="admin-pill">Read only</span>
              </div>
              <h3>
                {formatLongDate(block.checkIn)} to {formatLongDate(block.checkOut)}
              </h3>
              {block.summary ? <p>{block.summary}</p> : null}
            </article>
          ))}
          {data && data.vrboBlocks.length === 0 ? <p className="admin-meta">No VRBO blocks stored.</p> : null}
        </div>
      </div>
    </section>
  );
}

function StayRow({
  stay,
  busy,
  onCancel,
  onResend,
  onRemove,
}: {
  stay: Stay;
  busy: boolean;
  onCancel: (id: string) => void;
  onResend: (id: string) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <article className={stay.conflict ? "admin-stay is-conflict" : "admin-stay"}>
      <div className="admin-stay-top">
        <h3>{stay.reference}</h3>
        <div className="admin-pills">
          <span className={`admin-pill is-${stay.source}`}>{stay.source === "website" ? "Website" : "Manual"}</span>
          <span className={`admin-pill is-${stay.status}`}>{stay.status === "confirmed" ? "Confirmed" : "Cancelled"}</span>
          {stay.conflict ? <span className="admin-pill is-conflict">Conflict</span> : null}
        </div>
      </div>
      <p>
        {formatLongDate(stay.checkIn)} to {formatLongDate(stay.checkOut)}
        {stay.guests ? ` · ${stay.guests} ${stay.guests === 1 ? "guest" : "guests"}` : ""}
      </p>
      {stay.guestName ? (
        <p>
          {stay.guestName}
          {stay.guestEmail ? ` · ${stay.guestEmail}` : ""}
          {stay.guestPhone ? ` · ${stay.guestPhone}` : ""}
        </p>
      ) : null}
      {stay.message ? <p>{stay.message}</p> : null}
      {stay.source === "website" ? (
        <div className="admin-pills">
          <span className={`admin-pill is-${stay.guestEmailStatus}`}>Guest email {stay.guestEmailStatus}</span>
          <span className={`admin-pill is-${stay.hostEmailStatus}`}>Host email {stay.hostEmailStatus}</span>
        </div>
      ) : null}
      <div className="admin-actions">
        {stay.source === "website" && stay.status === "confirmed" ? (
          <button className="admin-quiet danger" type="button" onClick={() => onCancel(stay.id)} disabled={busy}>
            Cancel booking
          </button>
        ) : null}
        {stay.source === "website" ? (
          <button className="admin-quiet" type="button" onClick={() => onResend(stay.id)} disabled={busy}>
            Resend guest email
          </button>
        ) : null}
        {stay.source === "manual" ? (
          <button className="admin-quiet danger" type="button" onClick={() => onRemove(stay.id)} disabled={busy}>
            Remove block
          </button>
        ) : null}
      </div>
    </article>
  );
}
