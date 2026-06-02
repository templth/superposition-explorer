import type { CSSProperties, ReactNode } from 'react';

type Props = {
  title: string;
  tagValue?: string;
  children: ReactNode;
  footer?: ReactNode;
  style?: CSSProperties;
};

export function Panel({ title, tagValue, children, footer, style }: Props) {
  return (
    <div
      style={{
        background: 'var(--panel)',
        border: '1px solid var(--line)',
        borderRadius: 4,
        padding: 18,
        position: 'relative',
        ...style,
      }}
    >
      <div
        style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: 10.5,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: 'var(--dim)',
          marginBottom: 14,
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <span>{title}</span>
        {tagValue !== undefined && <span style={{ color: 'var(--pos)' }}>{tagValue}</span>}
      </div>
      {children}
      {footer}
    </div>
  );
}
