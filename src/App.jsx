import { useState, useEffect, useMemo } from "react"

// ═══════════════════════════════════════════
// Design System (Tailwind Stone palette)
// ═══════════════════════════════════════════
const FEED_URL = "https://api.github.com/repos/AAAlexanderS/ai-feed-aggregator/contents/data/feeds"
const DISPATCH_URL = "https://api.github.com/repos/AAAlexanderS/ai-feed-aggregator/actions/workflows/weekly-feed.yml/dispatches"

const DOMAINS = {
  ui_ux_design:   { label: "UI/UX",   emoji: "🎨", l: "#be185d", d: "#fb7185" },
  "3d_rendering": { label: "3D",      emoji: "🧊", l: "#1d4ed8", d: "#60a5fa" },
  film_video:     { label: "Film",    emoji: "🎬", l: "#b45309", d: "#fbbf24" },
  motion_design:  { label: "Motion",  emoji: "✨", l: "#7c3aed", d: "#a78bfa" },
}

const theme = {
  light: {
    bg: "#fafaf9", surface: "#ffffff", surfaceAlt: "#f5f5f4",
    border: "#e7e5e4", text1: "#1c1917", text2: "#44403c",
    text3: "#78716c", text4: "#a8a29e", accent: "#be185d",
    tagBg: "#f5f5f4", tagBorder: "#e7e5e4",
    collectBg: "#1c1917", collectText: "#fafaf9",
    collectHover: "#292524",
  },
  dark: {
    bg: "#0c0a09", surface: "#1c1917", surfaceAlt: "#1c1917",
    border: "#292524", text1: "#fafaf9", text2: "#d6d3d1",
    text3: "#78716c", text4: "#57534e", accent: "#fb7185",
    tagBg: "#292524", tagBorder: "#44403c",
    collectBg: "#fafaf9", collectText: "#0c0a09",
    collectHover: "#e7e5e4",
  },
}

// ═══════════════════════════════════════════
// Utilities
// ═══════════════════════════════════════════
function fmtDate(s) {
  try {
    const d = new Date(s + "T00:00:00Z")
    return {
      month: d.toLocaleDateString("en-US", { month: "short" }).toUpperCase(),
      day: d.getDate(), year: d.getFullYear(),
      weekday: d.toLocaleDateString("en-US", { weekday: "long" }),
    }
  } catch { return { month: "---", day: "--", year: "----", weekday: "" } }
}

// ═══════════════════════════════════════════
// Atoms
// ═══════════════════════════════════════════
const s = { font: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }

function Tag({ children, c }) {
  return <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 500, lineHeight: "18px", color: c.text3, background: c.tagBg, border: `1px solid ${c.tagBorder}` }}>{children}</span>
}

function DomainBadge({ id, dark }) {
  const d = DOMAINS[id] || DOMAINS.ui_ux_design
  const color = dark ? d.d : d.l
  return <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 10px", borderRadius: 4, fontSize: 11, fontWeight: 600, lineHeight: "18px", color, background: color + "10", border: `1px solid ${color}20` }}>{d.emoji} {d.label}</span>
}

// ═══════════════════════════════════════════
// Post Card
// ═══════════════════════════════════════════
function PostCard({ post, rank, c, dark }) {
  const [open, setOpen] = useState(false)
  const ai = post.ai || {}
  const dm = DOMAINS[ai.domain] || DOMAINS.ui_ux_design
  const accent = dark ? dm.d : dm.l
  const url = post.url && post.url !== "#" ? post.url : null

  return (
    <article
      onClick={() => setOpen(!open)}
      style={{
        padding: "20px 24px", borderRadius: 8, cursor: "pointer",
        background: open ? c.surface : "transparent",
        border: open ? `1px solid ${c.border}` : "1px solid transparent",
        transition: "all 0.15s", marginBottom: 4,
      }}
      onMouseEnter={e => { if (!open) e.currentTarget.style.background = c.surfaceAlt }}
      onMouseLeave={e => { if (!open) e.currentTarget.style.background = open ? c.surface : "transparent" }}
    >
      <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
        {/* Rank */}
        <span style={{ fontSize: 20, fontWeight: 300, color: c.text4, lineHeight: "28px", minWidth: 28, textAlign: "right", fontFeatureSettings: "'tnum'" }}>
          {String(rank).padStart(2, "0")}
        </span>

        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Title */}
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, lineHeight: 1.4, color: c.text1, letterSpacing: "-0.01em" }}>
            {ai.title || post.content?.slice(0, 100)}
          </h3>

          {/* Meta */}
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, marginTop: 8 }}>
            <DomainBadge id={ai.domain} dark={dark} />
            {ai.has_demo_or_repo && <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", color: dark ? "#4ade80" : "#16a34a", textTransform: "uppercase" }}>DEMO</span>}
            <span style={{ fontSize: 12, color: c.text3, marginLeft: "auto" }}>{post.author?.name}</span>
          </div>

          {/* Keywords */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
            {(ai.keywords || []).map((k, i) => <Tag key={i} c={c}>{k}</Tag>)}
          </div>

          {/* Expanded */}
          {open && (
            <div style={{ marginTop: 20, paddingTop: 20, borderTop: `1px solid ${c.border}`, display: "flex", flexDirection: "column", gap: 16 }}>
              {ai.summary && <p style={{ margin: 0, fontSize: 14, lineHeight: 1.7, color: c.text2 }}>{ai.summary}</p>}

              {ai.why_important && (
                <div style={{ padding: "12px 16px", borderRadius: 6, borderLeft: `3px solid ${accent}`, background: accent + "08" }}>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", color: accent, textTransform: "uppercase", marginBottom: 6 }}>Why This Matters</div>
                  <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6, color: c.text2 }}>{ai.why_important}</p>
                </div>
              )}

              {ai.learnings && (
                <div style={{ padding: "12px 16px", borderRadius: 6, borderLeft: `3px solid ${c.text4}`, background: c.tagBg }}>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", color: c.text3, textTransform: "uppercase", marginBottom: 6 }}>Key Takeaway</div>
                  <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6, color: c.text2 }}>{ai.learnings}</p>
                </div>
              )}

              {/* Tools + Scores */}
              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 6 }}>
                {(ai.tools_mentioned || []).map((t, i) => <Tag key={i} c={c}>{t}</Tag>)}
                <div style={{ marginLeft: "auto", display: "flex", gap: 16 }}>
                  {ai.credibility_score > 0 && <span style={{ fontSize: 11, color: c.text4 }}>Cred <strong style={{ color: ai.credibility_score >= 8 ? c.accent : c.text3, fontWeight: 600 }}>{ai.credibility_score}</strong></span>}
                  {ai.creative_workflow_value > 0 && <span style={{ fontSize: 11, color: c.text4 }}>Value <strong style={{ color: ai.creative_workflow_value >= 8 ? c.accent : c.text3, fontWeight: 600 }}>{ai.creative_workflow_value}</strong></span>}
                </div>
              </div>

              {/* Footer */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 12, color: c.text4, fontStyle: "italic" }}>{post.author?.name}{ai.author_role ? ` — ${ai.author_role}` : ""}</span>
                {url && (
                  <a href={url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
                    style={{ fontSize: 13, fontWeight: 600, color: accent, textDecoration: "none", padding: "6px 14px", borderRadius: 6, border: `1px solid ${accent}30`, transition: "background 0.15s" }}
                    onMouseEnter={e => e.currentTarget.style.background = accent + "12"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    Read Source ↗
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </article>
  )
}

// ═══════════════════════════════════════════
// Day Section
// ═══════════════════════════════════════════
function DaySection({ day, isFirst, c, dark }) {
  const [collapsed, setCollapsed] = useState(!isFirst)
  const d = fmtDate(day.date)
  const dc = {}
  day.posts.forEach(p => { const k = p.ai?.domain; if (k) dc[k] = (dc[k] || 0) + 1 })

  return (
    <section style={{ marginBottom: 32 }}>
      <button onClick={() => setCollapsed(!collapsed)} style={{
        display: "flex", alignItems: "center", width: "100%", padding: "16px 0",
        border: "none", cursor: "pointer", background: "transparent", textAlign: "left",
        borderBottom: `2px solid ${c.text1}`, fontFamily: s.font,
      }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
          <span style={{ fontSize: 40, fontWeight: 300, color: c.text1, lineHeight: 1, letterSpacing: "-0.03em" }}>{d.day}</span>
          <div>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", color: c.accent, textTransform: "uppercase" }}>{d.month}</span>
            <span style={{ fontSize: 12, color: c.text3, marginLeft: 8 }}>{d.weekday}, {d.year}</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, marginLeft: "auto", alignItems: "center" }}>
          {Object.entries(dc).map(([k, n]) => { const dm = DOMAINS[k]; return dm ? <span key={k} style={{ fontSize: 11, color: c.text4 }}>{dm.emoji}{n}</span> : null })}
          <span style={{ fontSize: 16, color: c.text4, marginLeft: 4, transform: collapsed ? "rotate(-90deg)" : "rotate(0)", transition: "transform 0.2s", display: "inline-block" }}>▾</span>
        </div>
      </button>
      {!collapsed && (
        <div style={{ paddingTop: 8 }}>
          {day.posts.map((post, i) => <PostCard key={`${day.date}-${i}`} post={post} rank={i + 1} c={c} dark={dark} />)}
        </div>
      )}
    </section>
  )
}

// ═══════════════════════════════════════════
// Collect Now Button
// ═══════════════════════════════════════════
function CollectButton({ c }) {
  const today = new Date().toISOString().slice(0, 10)
  const [state, setState] = useState(() => {
    try {
      const last = localStorage.getItem("gh_last_collect")
      if (last === today) return "done"
    } catch {}
    return "idle"
  })
  const [token, setToken] = useState(() => {
    try { return localStorage.getItem("gh_dispatch_token") || "" } catch { return "" }
  })
  const [showInput, setShowInput] = useState(false)

  async function trigger() {
    if (state === "done") return
    if (!token) { setShowInput(true); setState("needToken"); return }
    setState("loading")
    try {
      const res = await fetch(DISPATCH_URL, {
        method: "POST",
        headers: {
          Accept: "application/vnd.github.v3+json",
          Authorization: `token ${token}`,
        },
        body: JSON.stringify({ ref: "main" }),
      })
      if (res.status === 204) {
        setState("done")
        try {
          localStorage.setItem("gh_dispatch_token", token)
          localStorage.setItem("gh_last_collect", today)
        } catch {}
      } else {
        setState("error")
        setTimeout(() => setState("idle"), 3000)
      }
    } catch {
      setState("error")
      setTimeout(() => setState("idle"), 3000)
    }
  }

  const label = {
    idle: "⚡ Collect Now",
    loading: "Running...",
    done: "✓ Collected Today",
    error: "✗ Failed",
    needToken: "Enter token below",
  }[state]

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end" }}>
      <button
        onClick={trigger}
        disabled={state === "loading" || state === "done"}
        style={{
          padding: "8px 20px", borderRadius: 6, border: "none",
          fontSize: 13, fontWeight: 600, cursor: state === "done" || state === "loading" ? "default" : "pointer",
          fontFamily: s.font, letterSpacing: "-0.01em",
          background: state === "done" ? (c === theme.dark ? "#166534" : "#16a34a") : state === "error" ? "#dc2626" : c.collectBg,
          color: state === "done" || state === "error" ? "#fff" : c.collectText,
          opacity: state === "loading" ? 0.6 : state === "done" ? 0.7 : 1,
          transition: "all 0.2s",
        }}
      >
        {state === "loading" && <span style={{ display: "inline-block", width: 12, height: 12, border: "2px solid transparent", borderTopColor: c.collectText, borderRadius: "50%", animation: "spin 0.6s linear infinite", verticalAlign: "middle", marginRight: 6 }} />}
        {label}
      </button>

      {showInput && (
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <input
            type="password"
            placeholder="GitHub token (repo scope)"
            value={token}
            onChange={e => setToken(e.target.value)}
            style={{
              padding: "6px 10px", borderRadius: 4, border: `1px solid ${c.border}`,
              background: c.surface, color: c.text1, fontSize: 11, width: 220,
              fontFamily: s.font, outline: "none",
            }}
            onKeyDown={e => { if (e.key === "Enter") { setShowInput(false); trigger() } }}
          />
          <button
            onClick={() => { setShowInput(false); if (token) trigger() }}
            style={{ padding: "6px 10px", borderRadius: 4, border: `1px solid ${c.border}`, background: c.surface, color: c.text2, fontSize: 11, cursor: "pointer", fontFamily: s.font }}>
            Save
          </button>
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════
// App
// ═══════════════════════════════════════════
export default function App() {
  const [dark, setDark] = useState(false)
  const [feeds, setFeeds] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("all")

  const c = dark ? theme.dark : theme.light

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(FEED_URL, { headers: { Accept: "application/vnd.github.v3+json", "User-Agent": "ai-feed-dashboard" } })
        if (!res.ok) { setLoading(false); return }
        const data = await res.json()
        const files = Array.isArray(data) ? data : [data]
        const sorted = files.filter(f => f.name?.endsWith(".json")).sort((a, b) => b.name.localeCompare(a.name)).slice(0, 8)
        const all = await Promise.all(sorted.map(async f => { try { const r = await fetch(f.download_url); return r.json() } catch { return null } }))
        setFeeds(all.filter(Boolean))
      } catch {}
      setLoading(false)
    })()
  }, [])

  const days = useMemo(() => {
    return feeds.map(day => {
      if (filter === "all") return day
      return { ...day, posts: day.posts.filter(p => p.ai?.domain === filter) }
    }).filter(d => d.posts?.length > 0)
  }, [feeds, filter])

  const total = feeds.reduce((n, d) => n + (d.posts?.length || 0), 0)

  return (
    <div style={{ fontFamily: s.font, background: c.bg, color: c.text1, minHeight: "100vh", transition: "background 0.3s, color 0.3s" }}>
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 24px" }}>

        {/* ── Header ── */}
        <header style={{
          position: "sticky", top: 0, zIndex: 20,
          background: c.bg + "F0", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
          paddingTop: 24, paddingBottom: 16, borderBottom: `1px solid ${c.border}`,
        }}>
          {/* Row 1: Title + Controls */}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
            <div>
              <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, lineHeight: 1.2, letterSpacing: "-0.03em" }}>AI News Digest</h1>
              <p style={{ margin: "4px 0 0", fontSize: 12, color: c.text3 }}>{total} posts · 𝕏 · LinkedIn · GitHub</p>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "flex-start", flexShrink: 0 }}>
              <CollectButton c={c} />
              <button onClick={() => setDark(!dark)} style={{
                background: c.surface, border: `1px solid ${c.border}`, borderRadius: 6,
                padding: "8px 12px", cursor: "pointer", fontSize: 12, fontWeight: 500, color: c.text2,
                fontFamily: s.font, transition: "all 0.15s", whiteSpace: "nowrap",
              }}>{dark ? "☀ Light" : "◑ Dark"}</button>
            </div>
          </div>

          {/* Row 2: Filters */}
          <div style={{ display: "flex", gap: 4, marginTop: 16, overflowX: "auto", paddingBottom: 2 }}>
            {[{ k: "all", l: "All" }, ...Object.entries(DOMAINS).map(([k, v]) => ({ k, l: `${v.emoji}  ${v.label}` }))].map(f => (
              <button key={f.k} onClick={() => setFilter(f.k)} style={{
                padding: "6px 14px", borderRadius: 6, cursor: "pointer", whiteSpace: "nowrap",
                fontFamily: s.font, fontSize: 12, fontWeight: filter === f.k ? 600 : 400,
                border: filter === f.k ? "none" : `1px solid ${c.border}`,
                background: filter === f.k ? c.text1 : "transparent",
                color: filter === f.k ? c.bg : c.text3, transition: "all 0.15s",
              }}>{f.l}</button>
            ))}
          </div>
        </header>

        {/* ── Content ── */}
        <main style={{ paddingTop: 24, paddingBottom: 64 }}>
          {loading ? (
            <div style={{ padding: "80px 0", textAlign: "center" }}>
              <div style={{ width: 24, height: 24, border: `2px solid ${c.border}`, borderTopColor: c.accent, borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 12px" }} />
              <p style={{ fontSize: 13, color: c.text3 }}>Loading feed...</p>
            </div>
          ) : days.length === 0 ? (
            <div style={{ padding: "80px 0", textAlign: "center" }}>
              <p style={{ fontSize: 14, color: c.text3 }}>No posts available</p>
              <p style={{ fontSize: 12, color: c.text4, marginTop: 4 }}>Click "Collect Now" to trigger a collection</p>
            </div>
          ) : (
            days.map((d, i) => <DaySection key={d.date} day={d} isFirst={i === 0} c={c} dark={dark} />)
          )}
        </main>

        {/* ── Footer ── */}
        <footer style={{ padding: "24px 0 40px", borderTop: `1px solid ${c.border}`, textAlign: "center" }}>
          <p style={{ margin: 0, fontSize: 11, color: c.text4, letterSpacing: "0.04em" }}>AI × Creative Production Intelligence Agent</p>
        </footer>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
