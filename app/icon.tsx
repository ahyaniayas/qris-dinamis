import { ImageResponse } from 'next/og';

export const size = { width: 64, height: 64 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#38bdf8',
          borderRadius: '12px',
          border: '3px solid #38bdf8',
        }}
      >
        <div style={{ position: 'absolute', top: '6px', left: '6px', width: '12px', height: '12px', border: '2px solid #38bdf8', borderRadius: '3px' }}>
          <div style={{ position: 'absolute', top: '2px', left: '2px', width: '4px', height: '4px', backgroundColor: '#38bdf8', borderRadius: '1px' }}></div>
        </div>
        <div style={{ position: 'absolute', top: '6px', right: '6px', width: '12px', height: '12px', border: '2px solid #38bdf8', borderRadius: '3px' }}>
          <div style={{ position: 'absolute', top: '2px', left: '2px', width: '4px', height: '4px', backgroundColor: '#38bdf8', borderRadius: '1px' }}></div>
        </div>
        <div style={{ position: 'absolute', bottom: '6px', left: '6px', width: '12px', height: '12px', border: '2px solid #38bdf8', borderRadius: '3px' }}>
          <div style={{ position: 'absolute', top: '2px', left: '2px', width: '4px', height: '4px', backgroundColor: '#38bdf8', borderRadius: '1px' }}></div>
        </div>
        <span style={{ fontSize: '18px', fontWeight: '900', letterSpacing: '-0.5px', marginTop: '2px', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>QRIS</span>
      </div>
    ),
    { ...size }
  );
}
