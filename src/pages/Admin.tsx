import { useEffect, useMemo, useState, type FormEvent } from "react";

import { formatLongDate, todayInTimeZone } from "../../server/dates.js";
import { Icon } from "@/components/icon.tsx";

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

  async function removeBlock(id: string) {
    setBusy(true);
    const response = await fetch(`/api/admin/manual-block?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    const body = (await response.json().catch(() => ({}))) as { error?: string };
    setNotice(response.ok ? "Manual block removed." : body.error || "The block was not removed.");
    await load();
    setBusy(false);
  }

  // ---- Login screen ----
  if (!authed) {
    return (
      <section className="admin-page">
        <div className="admin-login">
          <p className="eyebrow">Hosts only</p>
          <h1 className="text-2xl font-bold mb-16">Booking admin</h1>

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
  const lastSyncLabel = data?.syncStatus.lastSync
    ? new Date(data.syncStatus.lastSync).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })
    : "Never";

  // ---- Dashboard ----
  return (
    <section className="admin-page">
      {/* ---- Header ---- */}
      <div className="admin-header">
        <div className="admin-header-left">
          <p className="eyebrow">Listing 294715</p>
          <h1>Bookings</h1>
        </div>

        <div className="admin-header-right">
          <div className="admin-stats">
            <div className="admin-stat">
              <strong>{upcoming.filter((s) => s.source === "website").length}</strong>
              <span>Open stays</span>
            </div>
            <div className="admin-stat">
              <strong>{upcoming.filter((s) => s.source === "manual").length}</strong>
              <span>Owner blocks</span>
            </div>
            <div className="admin-stat">
              <strong>{data?.vrboBlocks.length ?? 0}</strong>
              <span>VRBO nights</span>
            </div>
            <div className={conflictCount ? "admin-stat is-alert" : "admin-stat"}>
              <strong>{conflictCount}</strong>
              <span>Conflicts</span>
            </div>
          </div>

          <div className="admin-header-actions">
            <button className="admin-btn" type="button" onClick={() => void syncNow()} disabled={busy}>
              Sync VRBO
            </button>
            <button className="admin-btn is-quiet" type="button" onClick={() => void signOut()}>
              Sign out
            </button>
          </div>
        </div>
      </div>

      {/* ---- Notices ---- */}
      {data?.banner ? <div className="admin-banner">{data.banner}</div> : null}
      {data?.syncStatus.lastError ? <p className="admin-notice is-error">Sync error: {data.syncStatus.lastError}</p> : null}
      {notice ? <p className="admin-notice">{notice}</p> : null}

      {/* ---- Two-column body ---- */}
      <div className="admin-body">

        {/* LEFT: Calendar */}
        <div className="admin-cal-col">
          <div className="admin-card">
            <div className="admin-month-head">
              <button
                className="admin-btn is-quiet is-small"
                type="button"
                onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}
              >
                Prev
              </button>
              <h2>{monthName}</h2>
              <button
                className="admin-btn is-quiet is-small"
                type="button"
                onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}
              >
                Next
              </button>
            </div>

            <div className="admin-legend">
              <span><i className="admin-swatch is-website" /> Website</span>
              <span><i className="admin-swatch is-manual" /> Manual</span>
              <span><i className="admin-swatch is-vrbo" /> VRBO</span>
            </div>

            <div className="admin-month" aria-label={monthName}>
              {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
                <span key={d} className="admin-weekday">{d}</span>
              ))}
              {cells.map((cell) => {
                const sourceLabel =
                  cell.source === "website" ? "Website" : cell.source === "manual" ? "Manual" : cell.source === "vrbo" ? "VRBO" : "Open";
                return (
                  <span
                    key={cell.iso}
                    className={
                      cell.label
                        ? `admin-day is-${cell.source || "open"}${cell.conflict ? " is-conflict" : ""}${cell.iso === today ? " is-today" : ""}`
                        : "admin-day is-pad"
                    }
                    title={cell.label ? sourceLabel : undefined}
                  >
                    {cell.label}
                    {cell.label ? <span className="admin-day-tip">{sourceLabel}</span> : null}
                  </span>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT: Panel */}
        <div className="admin-panel">

          {/* Section 1: Upcoming stays */}
          <div className="admin-section">
            <h2 className="admin-section-title">
              Upcoming stays
              {conflictCount > 0 && (
                <span className="admin-pill is-conflict" style={{ marginLeft: 10 }}>
                  {conflictCount} conflict{conflictCount > 1 ? "s" : ""}
                </span>
              )}
            </h2>

            {upcoming.length === 0 ? (
              <p className="admin-empty">No upcoming stays.</p>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Ref</th>
                    <th>Dates</th>
                    <th>Guest</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
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
                </tbody>
              </table>
            )}
          </div>

          {/* Section 2: Earlier / Cancelled (collapsed) */}
          {earlier.length > 0 && (
            <details className="admin-section admin-collapsible">
              <summary className="admin-section-title is-toggle">
                Earlier &amp; cancelled
                <span className="admin-count">{earlier.length}</span>
                <Icon type="chevron-down" />
              </summary>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Ref</th>
                    <th>Dates</th>
                    <th>Guest</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
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
                </tbody>
              </table>
            </details>
          )}

          {/* Section 3: VRBO sync */}
          <div className="admin-section">
            <h2 className="admin-section-title">VRBO calendar</h2>
            <div className="admin-vrbo-row">
              <span className="admin-vrbo-sync-label">
                Last sync: <strong>{lastSyncLabel}</strong>
              </span>
              <div className="admin-vrbo-actions">
                <button className="admin-btn is-quiet is-small" type="button" onClick={() => void syncNow()} disabled={busy}>
                  Sync now
                </button>
                <button className="admin-btn is-quiet is-small" type="button" onClick={() => void copyExport()} disabled={!data?.exportUrl}>
                  Copy export URL
                </button>
              </div>
            </div>

          </div>

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
  const dateRange = `${formatLongDate(stay.checkIn)} to ${formatLongDate(stay.checkOut)}`;
  const statusLabel = stay.conflict ? "Conflict" : stay.status === "confirmed" ? "Confirmed" : "Cancelled";
  const statusKind = stay.conflict ? "conflict" : stay.status;

  return (
    <tr className={stay.conflict ? "is-conflict" : undefined}>
      <td>
        <span className="admin-mobile-label">Reference</span>
        <span className="admin-ref">{stay.reference}</span>
        <div className="admin-pills">
          <span className={`admin-pill is-${stay.source}`}>
            {stay.source === "website" ? "Website" : "Manual"}
          </span>
        </div>
      </td>
      <td className="admin-dates">
        <span className="admin-mobile-label">Dates</span>
        {dateRange}
      </td>
      <td className="admin-guest">
        <span className="admin-mobile-label">Guest</span>
        <span className="admin-guest-name">
          {stay.guestName || "No guest name"}
          {stay.guests ? ` · ${stay.guests} ${stay.guests === 1 ? "guest" : "guests"}` : ""}
        </span>
        {stay.guestEmail ? <span className="admin-guest-line">{stay.guestEmail}</span> : null}
        {stay.guestPhone ? <span className="admin-guest-line">{stay.guestPhone}</span> : null}
        {stay.message ? <span className="admin-guest-line">{stay.message}</span> : null}
      </td>
      <td>
        <span className="admin-mobile-label">Status</span>
        <span className={`admin-pill is-${statusKind}`}>{statusLabel}</span>
      </td>
      <td className="admin-row-actions">
        <span className="admin-mobile-label">Actions</span>
        {stay.source === "website" && stay.status === "confirmed" ? (
          <button className="admin-action-btn is-danger" type="button" onClick={() => onCancel(stay.id)} disabled={busy}>
            Cancel Booking
          </button>
        ) : null}
        {stay.source === "website" ? (
          <button className="admin-action-btn" type="button" onClick={() => onResend(stay.id)} disabled={busy}>
            Resend Email
          </button>
        ) : null}
        {stay.source === "manual" ? (
          <button className="admin-action-btn is-danger" type="button" onClick={() => onRemove(stay.id)} disabled={busy}>
            Remove Block
          </button>
        ) : null}
      </td>
    </tr>
  );
}
