import { useGameStore } from '../systems/gameStore'
import { OWNER, PROJECTS, SKILLS, EXPERIENCE, RESEARCH, ACHIEVEMENTS, DESTINATIONS } from '../data/portfolio'
import styles from './Panels.module.css'

// ── Panel wrapper ─────────────────────────────────────────────────────────

function Panel({ title, onClose, children }: {
  title: string
  onClose: () => void
  children: React.ReactNode
}) {
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>{title}</h2>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>
        <div className={styles.body}>{children}</div>
      </div>
    </div>
  )
}

// ── About Panel ───────────────────────────────────────────────────────────

function AboutPanel({ onClose }: { onClose: () => void }) {
  return (
    <Panel title="About Me" onClose={onClose}>
      <div className={styles.aboutContent}>
        <div className={styles.avatar}>A</div>
        <h3 className={styles.name}>{OWNER.name}</h3>
        <p className={styles.tagline}>{OWNER.tagline}</p>
        <p className={styles.bio}>{OWNER.bio}</p>
        <div className={styles.links}>
          <a href={OWNER.linkedin} target="_blank" rel="noreferrer" className={styles.link}>💼 LinkedIn</a>
        </div>
      </div>
    </Panel>
  )
}

// ── Projects Panel ────────────────────────────────────────────────────────

function ProjectsPanel({ onClose }: { onClose: () => void }) {
  return (
    <Panel title="Projects" onClose={onClose}>
      <div className={styles.grid}>
        {PROJECTS.map((p) => (
          <div key={p.id} className={styles.card}>
            {p.featured && <span className={styles.badge}>Featured</span>}
            <h4 className={styles.cardTitle}>{p.title}</h4>
            <p className={styles.cardDesc}>{p.description}</p>
            <div className={styles.chips}>
              {p.technologies.map((t) => <span key={t} className={styles.chip}>{t}</span>)}
            </div>
            <div className={styles.cardLinks}>
              <a href={p.github} target="_blank" rel="noreferrer" className={styles.link}>GitHub →</a>
              {p.demo && <a href={p.demo} target="_blank" rel="noreferrer" className={styles.link}>Live →</a>}
            </div>
          </div>
        ))}
      </div>
    </Panel>
  )
}

// ── Skills Panel ──────────────────────────────────────────────────────────

function SkillsPanel({ onClose }: { onClose: () => void }) {
  // Format keys like 'soft_skills' into 'Soft Skills'
  const formatLabel = (key: string) => {
    return key.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  }
  
  return (
    <Panel title="Skills" onClose={onClose}>
      <div className={styles.skillsGrid}>
        {Object.entries(SKILLS).map(([key, items]) => (
          <div key={key} className={styles.skillCategory}>
            <h4 className={styles.catLabel}>{formatLabel(key)}</h4>
            <div className={styles.chips}>
              {(items as string[]).map((item) => <span key={item} className={styles.chip}>{item}</span>)}
            </div>
          </div>
        ))}
      </div>
    </Panel>
  )
}

// ── Research Panel ────────────────────────────────────────────────────────

function ResearchPanel({ onClose }: { onClose: () => void }) {
  return (
    <Panel title="Research" onClose={onClose}>
      {RESEARCH.map((r) => (
        <div key={r.id} className={styles.card}>
          <h4 className={styles.cardTitle}>{r.title}</h4>
          <p className={styles.cardDesc}>{r.description}</p>
          <span className={styles.chip}>{r.year}</span>
          {r.link && <a href={r.link} className={styles.link}>Read →</a>}
        </div>
      ))}
    </Panel>
  )
}

// ── Experience Panel ──────────────────────────────────────────────────────

function ExperiencePanel({ onClose }: { onClose: () => void }) {
  return (
    <Panel title="Experience" onClose={onClose}>
      <div className={styles.timeline}>
        {EXPERIENCE.map((e, i) => (
          <div key={e.id} className={styles.timelineItem}>
            <div className={styles.timelineDot} />
            {i < EXPERIENCE.length - 1 && <div className={styles.timelineLine} />}
            <div className={styles.timelineContent}>
              <h4 className={styles.cardTitle}>{e.role}</h4>
              <span className={styles.company}>{e.company} · {e.duration}</span>
              <p className={styles.cardDesc}>{e.description}</p>
              <div className={styles.chips}>
                {e.technologies.map((t) => <span key={t} className={styles.chip}>{t}</span>)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Panel>
  )
}

// ── Achievements Panel ────────────────────────────────────────────────────

function AchievementsPanel({ onClose }: { onClose: () => void }) {
  const unlocked = useGameStore((s) => s.unlockedAchievements)
  return (
    <Panel title="Achievements" onClose={onClose}>
      <div className={styles.grid}>
        {ACHIEVEMENTS.map((a) => {
          const isUnlocked = unlocked.has(a.id as any)
          return (
            <div key={a.id} className={`${styles.achCard} ${isUnlocked ? styles.unlocked : styles.locked}`}>
              <span className={styles.achIcon}>{isUnlocked ? a.icon : '🔒'}</span>
              <span className={styles.achTitle}>{isUnlocked ? a.title : (a.secret ? '???' : a.title)}</span>
              {isUnlocked && <span className={styles.achDesc}>{a.description}</span>}
            </div>
          )
        })}
      </div>
    </Panel>
  )
}

// ── Contact Panel ─────────────────────────────────────────────────────────

function ContactPanel({ onClose }: { onClose: () => void }) {
  return (
    <Panel title="Contact" onClose={onClose}>
      <div className={styles.aboutContent}>
        <p className={styles.bio}>
          Reach the horizon and you've made it to the end of the voyage. Let's connect!
        </p>
        <div className={styles.links}>
          <a href={`mailto:${OWNER.email}`} className={styles.link}>✉️ Email</a>
          <a href={OWNER.linkedin} target="_blank" rel="noreferrer" className={styles.link}>💼 LinkedIn</a>
          {/* @ts-ignore */}
          <a href={OWNER.leetcode} target="_blank" rel="noreferrer" className={styles.link}>💻 LeetCode</a>
        </div>
      </div>
    </Panel>
  )
}

// ── World Map Panel ───────────────────────────────────────────────────────

function MapPanel({ onClose }: { onClose: () => void }) {
  const discovered = useGameStore((s) => s.discoveredDestinations)
  const shipPos    = useGameStore((s) => s.shipPosition)

  // Map extents: x: -150..150, z: 0..-520 → normalize to 0..1
  const toMap = (wx: number, wz: number) => ({
    x: ((wx + 160) / 360) * 100,
    y: ((wz + 20) / -540) * 100,
  })

  const shipMapPos = toMap(shipPos[0], shipPos[2])

  return (
    <Panel title="World Map" onClose={onClose}>
      <div className={styles.mapContainer}>
        {DESTINATIONS.map((d) => {
          const mp = toMap(d.position[0], d.position[2])
          const isDiscovered = discovered.has(d.id as any)
          return (
            <div
              key={d.id}
              className={`${styles.mapMarker} ${isDiscovered ? styles.markerFound : styles.markerHidden}`}
              style={{ left: `${mp.x}%`, top: `${mp.y}%` }}
              title={isDiscovered ? d.label : '???'}
            >
              {isDiscovered ? d.icon : '?'}
              {isDiscovered && <span className={styles.markerLabel}>{d.label}</span>}
            </div>
          )
        })}
        {/* Ship position */}
        <div
          className={styles.shipMarker}
          style={{ left: `${shipMapPos.x}%`, top: `${shipMapPos.y}%` }}
        >⛵</div>
      </div>
      <p className={styles.mapHint}>Sail to discover new locations</p>
    </Panel>
  )
}

// ── Router — renders the correct panel ───────────────────────────────────

export function Panels() {
  const activePanel = useGameStore((s) => s.activePanel)
  const closePanel  = useGameStore((s) => s.closePanel)

  if (!activePanel) return null

  const panels: Record<NonNullable<typeof activePanel>, React.ReactElement | null> = {
    about:        <AboutPanel       onClose={closePanel} />,
    projects:     <ProjectsPanel   onClose={closePanel} />,
    skills:       <SkillsPanel     onClose={closePanel} />,
    research:     <ResearchPanel   onClose={closePanel} />,
    experience:   <ExperiencePanel onClose={closePanel} />,
    achievements: <AchievementsPanel onClose={closePanel} />,
    contact:      <ContactPanel    onClose={closePanel} />,
    map:          <MapPanel        onClose={closePanel} />,
    settings:     null,
  }

  return <>{panels[activePanel]}</>
}
