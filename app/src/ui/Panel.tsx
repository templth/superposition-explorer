import { useState, type CSSProperties, type ReactNode } from 'react';
import { useExplorer, type RenderId } from '../state/useExplorer';

type Props = {
  title: string;
  tagValue?: string;
  hotkey?: RenderId;
  children: ReactNode;
  footer?: ReactNode;
  style?: CSSProperties;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
};

export function Panel({
  title,
  tagValue,
  hotkey,
  children,
  footer,
  style,
  collapsible,
  defaultCollapsed,
}: Props) {
  const setPresenterRender = useExplorer((s) => s.setPresenterRender);
  const [collapsed, setCollapsed] = useState(defaultCollapsed ?? false);

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
          alignItems: 'center',
          gap: 12,
        }}
      >
        <span>{title}</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {tagValue !== undefined && <span style={{ color: 'var(--pos)' }}>{tagValue}</span>}
          {collapsible && (
            <button
              onClick={() => setCollapsed((c) => !c)}
              title={collapsed ? 'Déplier' : 'Replier'}
              aria-expanded={!collapsed}
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 10,
                letterSpacing: '0.08em',
                padding: '2px 7px',
                borderRadius: 2,
                background: 'transparent',
                color: 'var(--dim)',
                border: '1px solid var(--line)',
                cursor: 'pointer',
              }}
            >
              {collapsed ? '▸' : '▾'}
            </button>
          )}
          {hotkey !== undefined && (
            <button
              onClick={() => setPresenterRender(hotkey)}
              title={`Isoler (${hotkey})`}
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 10,
                letterSpacing: '0.08em',
                padding: '2px 7px',
                borderRadius: 2,
                background: 'transparent',
                color: 'var(--dim)',
                border: '1px solid var(--line)',
                cursor: 'pointer',
              }}
            >
              {hotkey}
            </button>
          )}
        </span>
      </div>
      {!collapsed && (
        <>
          {children}
          {footer}
        </>
      )}
    </div>
  );
}
