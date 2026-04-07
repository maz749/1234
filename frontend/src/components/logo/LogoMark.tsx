'use client';

interface Props {
  size?: number;
  color?: string;
  bg?: string;
  delay?: number;
  loop?: boolean;
}

export default function LogoMark({
  size  = 48,
  color = '#f5f0e8',
  bg    = '#141210',
  delay = 0,
  loop  = false,
}: Props) {
  const uid = `fs${size}d${delay}`.replace(/\W/g, 'z');

  // Геометрия — проверена рендером через cairosvg
  const RY = 33, RX = 22, R = 24, TILT = 20, SW = 1.4;

  const css = `
    @keyframes ${uid}fly {
      0%   { opacity:0; transform: scale(0.48) rotate(-28deg); }
      62%  { opacity:1; transform: scale(1.06) rotate(3.5deg); }
      80%  { transform: scale(0.97) rotate(-0.5deg); }
      100% { opacity:1; transform: scale(1) rotate(0deg); }
    }
    .${uid}logo {
      transform-origin: 0px 0px;
      opacity: 0;
      animation: ${uid}fly 880ms cubic-bezier(.16,1,.3,1) ${delay}ms forwards;
    }
    ${loop ? `
      @keyframes ${uid}rot { to { transform: rotate(360deg); } }
      .${uid}spin {
        transform-origin: 0px 0px;
        animation: ${uid}rot 22s linear ${delay + 1200}ms infinite;
      }
    ` : ''}
  `;

  return (
    <svg
      width={size} height={size}
      viewBox="-62 -62 124 124"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block', overflow: 'visible' }}
      aria-label="Facade Studio"
    >
      <defs>
        <style dangerouslySetInnerHTML={{ __html: css }} />
      </defs>
      <g className={`${uid}spin`}>
        <g className={`${uid}logo`}>
          {Array.from({ length: 8 }, (_, i) => (
            <ellipse
              key={i}
              cx={0} cy={0}
              rx={RX} ry={RY}
              fill={color}
              stroke={bg}
              strokeWidth={SW}
              transform={`rotate(${i * 45}) translate(0,-${R}) rotate(${TILT})`}
            />
          ))}
        </g>
      </g>
    </svg>
  );
}
