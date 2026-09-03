// A small, hand-rolled icon set.
//
// No icon library: this is a handful of glyphs, and a dependency for them
// would add a package, a bundle, and a licence for something that is 40 lines
// of SVG. Every icon is on a 24x24 grid with a 1.7 stroke so they sit
// together evenly at 16-20px, which is the only size the OS uses them at.

type IconProps = { size?: number; className?: string };

function Svg({ size = 18, className = "", children }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round"
      className={className} aria-hidden focusable="false"
    >
      {children}
    </svg>
  );
}

export const Icon = {
  Command: (p: IconProps) => <Svg {...p}><path d="M9 6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3z" /></Svg>,
  Home: (p: IconProps) => <Svg {...p}><path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V21h14V9.5" /></Svg>,
  Today: (p: IconProps) => <Svg {...p}><rect x="3" y="4.5" width="18" height="16" rx="2.5" /><path d="M3 9.5h18M8 3v3M16 3v3" /><circle cx="12" cy="15" r="1.6" fill="currentColor" stroke="none" /></Svg>,
  Calendar: (p: IconProps) => <Svg {...p}><rect x="3" y="4.5" width="18" height="16" rx="2.5" /><path d="M3 9.5h18M8 3v3M16 3v3" /></Svg>,
  Trip: (p: IconProps) => <Svg {...p}><path d="M3 19h18" /><path d="M5 19V9l7-5 7 5v10" /><path d="M10 19v-5h4v5" /></Svg>,
  Users: (p: IconProps) => <Svg {...p}><circle cx="9" cy="8" r="3.2" /><path d="M3 20c0-3.2 2.7-5.5 6-5.5s6 2.3 6 5.5" /><path d="M16 5.2a3.2 3.2 0 0 1 0 6.1M18 20c0-2.4-.9-4.2-2.4-5.3" /></Svg>,
  Client: (p: IconProps) => <Svg {...p}><circle cx="12" cy="8" r="3.5" /><path d="M4.5 20c0-3.6 3.4-6.2 7.5-6.2s7.5 2.6 7.5 6.2" /></Svg>,
  Truck: (p: IconProps) => <Svg {...p}><path d="M2 7.5h11v9H2z" /><path d="M13 11h4l3 3v2.5h-7z" /><circle cx="6" cy="18" r="1.8" /><circle cx="17" cy="18" r="1.8" /></Svg>,
  Box: (p: IconProps) => <Svg {...p}><path d="m12 3 8 4.5v9L12 21l-8-4.5v-9z" /><path d="m4 7.5 8 4.5 8-4.5M12 12v9" /></Svg>,
  Check: (p: IconProps) => <Svg {...p}><path d="m4.5 12.5 5 5 10-11" /></Svg>,
  CheckSquare: (p: IconProps) => <Svg {...p}><rect x="3.5" y="3.5" width="17" height="17" rx="3" /><path d="m8 12 3 3 5.5-6" /></Svg>,
  Alert: (p: IconProps) => <Svg {...p}><path d="M12 3.5 21.5 20h-19z" /><path d="M12 10v4.5M12 17.4v.1" /></Svg>,
  Bell: (p: IconProps) => <Svg {...p}><path d="M18 15.5V11a6 6 0 1 0-12 0v4.5L4.5 18h15z" /><path d="M10 21h4" /></Svg>,
  Chat: (p: IconProps) => <Svg {...p}><path d="M20.5 12c0 4-3.8 7.2-8.5 7.2-1 0-2-.15-2.9-.42L4 20.5l1.4-3.6C4.2 15.6 3.5 13.9 3.5 12c0-4 3.8-7.2 8.5-7.2s8.5 3.2 8.5 7.2z" /></Svg>,
  Chart: (p: IconProps) => <Svg {...p}><path d="M4 20V4M4 20h16" /><path d="M8 16v-4M12.5 16V8M17 16v-6" /></Svg>,
  Money: (p: IconProps) => <Svg {...p}><rect x="2.5" y="6" width="19" height="12" rx="2.5" /><circle cx="12" cy="12" r="2.6" /><path d="M6 10v4M18 10v4" /></Svg>,
  Calculator: (p: IconProps) => <Svg {...p}><rect x="5" y="2.5" width="14" height="19" rx="2.5" /><path d="M8.5 7h7" /><path d="M9 12h.01M12 12h.01M15 12h.01M9 16h.01M12 16h.01M15 16h.01" /></Svg>,
  Book: (p: IconProps) => <Svg {...p}><path d="M5 4.5A2 2 0 0 1 7 3h12v15H7a2 2 0 0 0-2 2z" /><path d="M5 19.5A2 2 0 0 1 7 18h12v3H7a2 2 0 0 1-2-1.5z" /></Svg>,
  Camera: (p: IconProps) => <Svg {...p}><path d="M3 8.5h3.5L8 6h8l1.5 2.5H21v11H3z" /><circle cx="12" cy="14" r="3.4" /></Svg>,
  Settings: (p: IconProps) => <Svg {...p}><circle cx="12" cy="12" r="3.2" /><path d="M12 2.5v3M12 18.5v3M21.5 12h-3M5.5 12h-3M18.7 5.3l-2.1 2.1M7.4 16.6l-2.1 2.1M18.7 18.7l-2.1-2.1M7.4 7.4 5.3 5.3" /></Svg>,
  Shield: (p: IconProps) => <Svg {...p}><path d="M12 3 20 6v6c0 4.6-3.3 8.2-8 9.5-4.7-1.3-8-4.9-8-9.5V6z" /><path d="m9 12 2 2 4-4.5" /></Svg>,
  Search: (p: IconProps) => <Svg {...p}><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4.5 4.5" /></Svg>,
  Plus: (p: IconProps) => <Svg {...p}><path d="M12 5v14M5 12h14" /></Svg>,
  Close: (p: IconProps) => <Svg {...p}><path d="m6 6 12 12M18 6 6 18" /></Svg>,
  Menu: (p: IconProps) => <Svg {...p}><path d="M4 7h16M4 12h16M4 17h16" /></Svg>,
  ChevronRight: (p: IconProps) => <Svg {...p}><path d="m9 5 7 7-7 7" /></Svg>,
  ChevronDown: (p: IconProps) => <Svg {...p}><path d="m5 9 7 7 7-7" /></Svg>,
  ArrowLeft: (p: IconProps) => <Svg {...p}><path d="M19 12H5M11 6l-6 6 6 6" /></Svg>,
  Clock: (p: IconProps) => <Svg {...p}><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></Svg>,
  Pin: (p: IconProps) => <Svg {...p}><path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11z" /><circle cx="12" cy="10" r="2.6" /></Svg>,
  Folder: (p: IconProps) => <Svg {...p}><path d="M3 6.5A1.5 1.5 0 0 1 4.5 5h4L11 7.5h8.5A1.5 1.5 0 0 1 21 9v9.5a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 18.5z" /></Svg>,
  Doc: (p: IconProps) => <Svg {...p}><path d="M6 2.5h8L19 7.5V21.5H6z" /><path d="M14 2.5V8h5" /><path d="M9 13h7M9 17h5" /></Svg>,
  Star: (p: IconProps) => <Svg {...p}><path d="m12 3.5 2.6 5.6 6 .8-4.4 4.2 1.1 6.1-5.3-2.9-5.3 2.9 1.1-6.1L3.4 9.9l6-.8z" /></Svg>,
  Sparkle: (p: IconProps) => <Svg {...p}><path d="M12 3v5M12 16v5M4.5 12h5M14.5 12h5" /><path d="m7.5 7.5 2 2M14.5 14.5l2 2M16.5 7.5l-2 2M9.5 14.5l-2 2" /></Svg>,
  Logout: (p: IconProps) => <Svg {...p}><path d="M14 4.5H6.5A1.5 1.5 0 0 0 5 6v12a1.5 1.5 0 0 0 1.5 1.5H14" /><path d="M17 8.5 20.5 12 17 15.5M20 12H10" /></Svg>,
  Print: (p: IconProps) => <Svg {...p}><path d="M7 9V3.5h10V9" /><rect x="3.5" y="9" width="17" height="7.5" rx="2" /><path d="M7 14h10v6.5H7z" /></Svg>,
  Link: (p: IconProps) => <Svg {...p}><path d="M10.5 13.5a4 4 0 0 0 5.7 0l2.8-2.8a4 4 0 1 0-5.7-5.7L11.9 6.4" /><path d="M13.5 10.5a4 4 0 0 0-5.7 0L5 13.3a4 4 0 1 0 5.7 5.7l1.3-1.3" /></Svg>,
  Building: (p: IconProps) => <Svg {...p}><path d="M4 21V5.5L13 3v18" /><path d="M13 9h7v12M4 21h17" /><path d="M7.5 8h2M7.5 12h2M7.5 16h2M16 13h1M16 17h1" /></Svg>,
  Flag: (p: IconProps) => <Svg {...p}><path d="M5 21V4" /><path d="M5 4.5h11l-1.8 3.5L16 11.5H5z" /></Svg>,
  Refresh: (p: IconProps) => <Svg {...p}><path d="M20 12a8 8 0 1 1-2.6-5.9" /><path d="M20 4v4.5h-4.5" /></Svg>,
  Filter: (p: IconProps) => <Svg {...p}><path d="M3.5 5.5h17L14 13v6l-4 2v-8z" /></Svg>,
  Download: (p: IconProps) => <Svg {...p}><path d="M12 3.5v11M7.5 10.5 12 15l4.5-4.5" /><path d="M4.5 19.5h15" /></Svg>,
  Play: (p: IconProps) => <Svg {...p}><path d="M7 4.5 19 12 7 19.5z" /></Svg>,
  Tool: (p: IconProps) => <Svg {...p}><path d="M14.5 6.5a4.5 4.5 0 0 0 5.7 5.7l-8 8a2.5 2.5 0 0 1-3.5-3.5l8-8a4.5 4.5 0 0 0-2.2-2.2z" /></Svg>,
};

export type IconName = keyof typeof Icon;
