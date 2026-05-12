import { useState } from 'react';
import Topbar from '../components/Topbar';
import { useTheme } from '../context/ThemeContext';
import './SettingsPage.css';

const FONTS = [
  { value: "'DM Sans', sans-serif", label: 'DM Sans' },
  { value: "'Segoe UI', sans-serif", label: 'Segoe UI' },
  { value: "Georgia, serif", label: 'Georgia' },
  { value: "'Courier New', monospace", label: 'Courier New' },
];

export default function SettingsPage() {
  const { settings, update, toggleMode } = useTheme();

  return (
    <>
      <Topbar title="Appearance Settings" showSearch={false} />
      <div className="page-content" style={{ maxWidth: 540 }}>
        <h2 style={{ fontFamily:'var(--font-display)', fontSize:22, fontWeight:600, marginBottom:24 }}>
          Appearance Settings
        </h2>

        <div className="settings-card">
          {/* Theme */}
          <div className="settings-section">
            <div className="settings-title">Theme</div>
            <div className="setting-row">
              <div>
                <div className="setting-label">Colour Mode</div>
                <div className="setting-desc">Light or dark background</div>
              </div>
              <select
                className="setting-control"
                value={settings.mode}
                onChange={e => update({ mode: e.target.value })}
              >
                <option value="dark">Dark</option>
                <option value="light">Light</option>
              </select>
            </div>
            <div className="setting-row">
              <div>
                <div className="setting-label">Accent Colour</div>
                <div className="setting-desc">Highlights and active states</div>
              </div>
              <input
                type="color"
                value={settings.accent}
                onChange={e => update({ accent: e.target.value })}
                className="color-pick"
              />
            </div>
          </div>

          {/* Typography */}
          <div className="settings-section">
            <div className="settings-title">Typography</div>
            <div className="setting-row">
              <div>
                <div className="setting-label">Font Size</div>
                <div className="setting-desc">Base text size</div>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <input
                  type="range" min={12} max={20} step={1}
                  value={settings.fontSize}
                  onChange={e => update({ fontSize: Number(e.target.value) })}
                  style={{ accentColor:'var(--accent)', width:120 }}
                />
                <span style={{ fontSize:12, color:'var(--muted)', minWidth:32 }}>{settings.fontSize}px</span>
              </div>
            </div>
            <div className="setting-row">
              <div>
                <div className="setting-label">Font Family</div>
                <div className="setting-desc">App-wide typeface</div>
              </div>
              <select
                className="setting-control"
                value={settings.font}
                onChange={e => update({ font: e.target.value })}
              >
                {FONTS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
              </select>
            </div>
          </div>

          {/* Chat */}
          <div className="settings-section">
            <div className="settings-title">Chat Background</div>
            <div className="setting-row">
              <div>
                <div className="setting-label">Chat Background Colour</div>
                <div className="setting-desc">Background in group chats</div>
              </div>
              <input type="color" value={settings.chatBg}
                onChange={e => update({ chatBg: e.target.value })} className="color-pick" />
            </div>
            <div className="setting-row">
              <div>
                <div className="setting-label">Message Bubble Colour</div>
                <div className="setting-desc">Your sent messages</div>
              </div>
              <input type="color" value={settings.bubble}
                onChange={e => update({ bubble: e.target.value })} className="color-pick" />
            </div>
          </div>

          {/* Preview */}
          <div>
            <div className="settings-title">Preview</div>
            <div className="preview-text" style={{ fontSize: settings.fontSize, fontFamily: settings.font }}>
              This is how your text will look across Kerala Connect. Adjust the settings above to personalise your experience.
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
