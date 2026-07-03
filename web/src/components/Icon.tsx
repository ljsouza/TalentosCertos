import type { CSSProperties, ReactNode } from "react";

// Ícones standard (sem dependência externa). Pure SVG — server ou client.
type IconProps = { name: string; size?: number; stroke?: number; style?: CSSProperties };

export function Icon({ name, size = 20, stroke = 1.7, style }: IconProps) {
  const p = { fill: "none", stroke: "currentColor", strokeWidth: stroke, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  const paths: Record<string, ReactNode> = {
    search: <><circle cx="11" cy="11" r="7" {...p} /><line x1="16.5" y1="16.5" x2="21" y2="21" {...p} /></>,
    pin: <><path d="M12 21s7-6.3 7-11a7 7 0 1 0-14 0c0 4.7 7 11 7 11z" {...p} /><circle cx="12" cy="10" r="2.5" {...p} /></>,
    bookmark: <path d="M6 4h12v16l-6-4-6 4z" {...p} />,
    arrow: <><line x1="4" y1="12" x2="20" y2="12" {...p} /><polyline points="14 6 20 12 14 18" {...p} /></>,
    chevron: <polyline points="6 9 12 15 18 9" {...p} />,
    check: <polyline points="4 12 10 18 20 6" {...p} />,
    star: <path d="M12 3l2.6 5.6L20.5 9l-4.5 4.2 1.2 6.1L12 16.8 6.8 19.3 8 13.2 3.5 9l5.9-.4z" {...p} />,
    clock: <><circle cx="12" cy="12" r="8.5" {...p} /><polyline points="12 7 12 12 16 14" {...p} /></>,
    users: <><circle cx="9" cy="8" r="3.2" {...p} /><path d="M3.5 20a5.5 5.5 0 0 1 11 0" {...p} /><path d="M16 5.2a3.2 3.2 0 0 1 0 6M20.5 20a5.5 5.5 0 0 0-4-5.3" {...p} /></>,
    whatsapp: <path d="M5 19l1.2-3.4A7 7 0 1 1 9.4 18L5 19z" {...p} />,
    share: <><circle cx="18" cy="5" r="3" {...p} /><circle cx="6" cy="12" r="3" {...p} /><circle cx="18" cy="19" r="3" {...p} /><line x1="8.6" y1="13.5" x2="15.4" y2="17.5" {...p} /><line x1="15.4" y1="6.5" x2="8.6" y2="10.5" {...p} /></>,
    facebook: <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" {...p} />,
    xtwitter: <><line x1="17" y1="7" x2="7" y2="17" {...p} /><line x1="7" y1="7" x2="17" y2="17" {...p} /></>,
    linkedin: <><rect x="2" y="2" width="20" height="20" rx="4" {...p} /><line x1="8" y1="10" x2="8" y2="16" {...p} /><circle cx="8" cy="7" r="1.2" fill="currentColor" stroke="none" /><path d="M12 10v6M12 13a3 3 0 0 1 6 0v3" {...p} /></>,
    telegram: <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" {...p} />,
    instagram: <><rect x="2" y="2" width="20" height="20" rx="5" {...p} /><circle cx="12" cy="12" r="5" {...p} /><circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" stroke="none" /></>,
    link: <><path d="M10 13a5 5 0 0 0 7.5.7l3-3a5 5 0 0 0-7-7l-1.7 1.6" {...p} /><path d="M14 11a5 5 0 0 0-7.5-.7l-3 3a5 5 0 0 0 7 7l1.7-1.6" {...p} /></>,
    building: <><rect x="3" y="7" width="18" height="14" rx="1" {...p} /><path d="M8 21V7M16 21V7M3 12h18" {...p} /><rect x="9" y="2" width="6" height="5" rx="1" {...p} /></>,
    layers: <><polygon points="12 2 2 7 12 12 22 7" {...p} /><polyline points="2 17 12 22 22 17" {...p} /><polyline points="2 12 12 17 22 12" {...p} /></>,
    globe: <><circle cx="12" cy="12" r="9" {...p} /><path d="M2 12h20M12 2a15 15 0 0 1 4 10 15 15 0 0 1-4 10 15 15 0 0 1-4-10 15 15 0 0 1 4-10z" {...p} /></>,
    mic: <><rect x="9" y="3" width="6" height="11" rx="3" {...p} /><path d="M5 11a7 7 0 0 0 14 0M12 18v3" {...p} /></>,
    play: <polygon points="8 5 19 12 8 19" {...p} />,
    video: <><rect x="3" y="6" width="13" height="12" rx="2" {...p} /><polygon points="16 10 21 7 21 17 16 14" {...p} /></>,
    upload: <><path d="M12 16V5" {...p} /><polyline points="7 9 12 4 17 9" {...p} /><path d="M5 16v3h14v-3" {...p} /></>,
    bolt: <path d="M13 3L5 13h5l-1 8 8-11h-5z" {...p} />,
    chart: <><line x1="5" y1="20" x2="5" y2="11" {...p} /><line x1="12" y1="20" x2="12" y2="5" {...p} /><line x1="19" y1="20" x2="19" y2="14" {...p} /></>,
    map: <><polygon points="3 6 9 4 15 6 21 4 21 18 15 20 9 18 3 20" {...p} /><line x1="9" y1="4" x2="9" y2="18" {...p} /><line x1="15" y1="6" x2="15" y2="20" {...p} /></>,
    plus: <><line x1="12" y1="5" x2="12" y2="19" {...p} /><line x1="5" y1="12" x2="19" y2="12" {...p} /></>,
    eye: <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" {...p} /><circle cx="12" cy="12" r="3" {...p} /></>,
    doc: <><path d="M7 3h7l4 4v14H7z" {...p} /><polyline points="14 3 14 7 18 7" {...p} /></>,
    shield: <path d="M12 3l7 3v5c0 5-3.5 8-7 9-3.5-1-7-4-7-9V6z" {...p} />,
    heart: <path d="M12 20s-7-4.3-9.3-9A4.6 4.6 0 0 1 12 6.5 4.6 4.6 0 0 1 21.3 11C19 15.7 12 20 12 20z" {...p} />,
    chat: <path d="M21 12a8 8 0 0 1-11.5 7.2L4 21l1.8-5.5A8 8 0 1 1 21 12z" {...p} />,
    flame: <path d="M12 3c1 3 4 4.5 4 8a4 4 0 1 1-8 0c0-1.5.5-2.5 1.2-3.3C9 9 11 7 12 3z" {...p} />,
  };
  return <svg viewBox="0 0 24 24" width={size} height={size} style={style} aria-hidden="true">{paths[name]}</svg>;
}
