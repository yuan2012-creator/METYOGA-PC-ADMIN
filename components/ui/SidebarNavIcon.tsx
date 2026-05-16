import React from 'react';

export type SidebarNavIconName =
  | 'dashboard'
  | 'today'
  | 'members'
  | 'courses'
  | 'staff'
  | 'products'
  | 'finance'
  | 'stores'
  | 'marketing'
  | 'rules'
  | 'data'
  | 'investment'
  | 'partner'
  | 'audit';

const svgBase = {
  width: 18,
  height: 18,
  viewBox: '0 0 24 24',
  fill: 'none' as const,
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

const icons: Record<SidebarNavIconName, React.ReactNode> = {
  dashboard: (
    <>
      <rect x="4" y="4" width="7" height="7" rx="1.5" />
      <rect x="13" y="4" width="7" height="7" rx="1.5" />
      <rect x="4" y="13" width="7" height="7" rx="1.5" />
      <rect x="13" y="13" width="7" height="7" rx="1.5" />
    </>
  ),
  today: (
    <>
      <rect x="4" y="5" width="16" height="16" rx="2" />
      <path d="M8 3v4M16 3v4M4 10h16" />
      <path d="M9.5 14.5l1.5 1.5 3.5-3.5" />
    </>
  ),
  members: (
    <>
      <circle cx="9" cy="8" r="2.5" />
      <path d="M4 18c0-2.5 2.2-4 5-4s5 1.5 5 4" />
      <circle cx="16.5" cy="9" r="2" />
      <path d="M14 18c0-1.8 1.6-3 3.5-3s3.5 1.2 3.5 3" />
    </>
  ),
  courses: (
    <>
      <rect x="4" y="5" width="16" height="16" rx="2" />
      <path d="M8 3v4M16 3v4M4 10h16" />
      <path d="M8 14h3M8 17h5M13 14h3" />
    </>
  ),
  staff: (
    <>
      <circle cx="10" cy="9" r="2.5" />
      <path d="M5 18c0-2.5 2.2-4 5-4" />
      <rect x="15" y="8" width="5" height="5" rx="1.25" />
      <path d="M17.5 10.5v1" />
    </>
  ),
  products: (
    <>
      <path d="M8 4h9l3 3v13H8z" />
      <path d="M17 4v3h3M8 9h8M8 13h6M8 17h4" />
    </>
  ),
  finance: (
    <>
      <rect x="3" y="7" width="18" height="12" rx="2" />
      <path d="M3 11h18M7 15h2" />
      <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
    </>
  ),
  stores: (
    <>
      <path d="M4 10 12 5l8 5" />
      <path d="M6 10v9h12v-9" />
      <path d="M10 19v-5h4v5" />
    </>
  ),
  marketing: (
    <>
      <path d="M5 10v5l3-1.5V10z" />
      <path d="M8 8.5 14 6v8l-6-2.5" />
      <path d="M14 10.5c1.5.5 2.5 1.5 3 3" />
    </>
  ),
  rules: (
    <>
      <circle cx="12" cy="12" r="2.25" />
      <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4M18.4 18.4 17 17M7 7 5.6 5.6" />
    </>
  ),
  data: (
    <>
      <path d="M4 19V9M10 19V5M16 19v-7M20 19H4" />
    </>
  ),
  investment: (
    <>
      <rect x="5" y="3" width="14" height="18" rx="2" />
      <path d="M9 7h6M9 11h2M13 11h2M9 15h2M13 15h2" />
    </>
  ),
  partner: (
    <>
      <circle cx="7" cy="12" r="2.5" />
      <circle cx="17" cy="12" r="2.5" />
      <path d="M9.5 12h5" />
      <path d="M7 9.5V7a2 2 0 0 1 2-2M17 9.5V7a2 2 0 0 0-2-2" />
    </>
  ),
  audit: (
    <>
      <path d="M12 3 5 6v5c0 4.2 3 7.5 7 8.5 4-1 7-4.3 7-8.5V6z" />
      <path d="M9.5 12.5 11 14l3.5-3.5" />
    </>
  ),
};

export function SidebarNavIcon({
  name,
  className,
}: {
  name: SidebarNavIconName;
  className?: string;
}) {
  return (
    <svg className={className} {...svgBase} aria-hidden>
      {icons[name]}
    </svg>
  );
}

/** 品牌区小 logo（线性，与导航 icon 同风格） */
export function SidebarBrandMark({ className }: { className?: string }) {
  return (
    <svg className={className} {...svgBase} aria-hidden>
      <circle cx="12" cy="12" r="7.5" />
      <path d="M12 7.5v9M9 10.5h6M9 13.5h6" />
    </svg>
  );
}
