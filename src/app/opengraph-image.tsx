import { ImageResponse } from 'next/og';
import { getConfig } from '@/lib/config-loader';

export const alt = 'Abdulkarim G. Mohammed — Senior Full-Stack Engineer & AI/LLM Specialist';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OpengraphImage() {
  const { personal, stats } = getConfig();

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#faf9f6',
          padding: 72,
          fontFamily: 'sans-serif',
          position: 'relative',
        }}
      >
        {/* clay top rule */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 8,
            background: '#c15f3c',
          }}
        />

        {/* Top: monogram + availability */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div
            style={{
              width: 84,
              height: 84,
              background: '#141413',
              color: '#faf9f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 40,
              fontWeight: 700,
              letterSpacing: -2,
            }}
          >
            {personal.initials}
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              border: '1px solid #d6d2c4',
              borderRadius: 6,
              padding: '10px 18px',
              fontSize: 22,
              color: '#6b6960',
            }}
          >
            <div style={{ width: 12, height: 12, borderRadius: 12, background: '#4f7a3f' }} />
            Available for work
          </div>
        </div>

        {/* Middle: name + title */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 76, fontWeight: 700, color: '#141413', letterSpacing: -3, lineHeight: 1.05 }}>
            {personal.name}
          </div>
          <div style={{ fontSize: 34, color: '#c15f3c', marginTop: 16, fontWeight: 500 }}>
            {personal.title}
          </div>
          <div style={{ fontSize: 26, color: '#6b6960', marginTop: 20, maxWidth: 900, lineHeight: 1.4 }}>
            {personal.tagline}
          </div>
        </div>

        {/* Bottom: stats */}
        <div style={{ display: 'flex', gap: 40, borderTop: '1px solid #e7e4da', paddingTop: 28 }}>
          {stats.map((s) => (
            <div key={s.label} style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontSize: 30, fontWeight: 700, color: '#141413' }}>{s.value}</div>
              <div style={{ fontSize: 18, color: '#6b6960', marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
