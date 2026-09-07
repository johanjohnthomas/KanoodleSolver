import { CanvasTexture, ExtrudeGeometry, Path, Shape, SRGBColorSpace, RepeatWrapping } from 'three';
import { DESK_COLORS } from '@/lib/tabletop';

export function roundedShape(width: number, height: number, radius: number): Shape {
  const s = new Shape(); const x = -width / 2; const y = -height / 2;
  s.moveTo(x + radius, y); s.lineTo(x + width - radius, y);
  s.quadraticCurveTo(x + width, y, x + width, y + radius);
  s.lineTo(x + width, y + height - radius);
  s.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  s.lineTo(x + radius, y + height); s.quadraticCurveTo(x, y + height, x, y + height - radius);
  s.lineTo(x, y + radius); s.quadraticCurveTo(x, y, x + radius, y);
  return s;
}

export function caseGeometry(sockets: boolean): ExtrudeGeometry {
  const shape = roundedShape(12, 6.2, .65);
  if (sockets) for (let y = 0; y < 5; y++) for (let x = 0; x < 11; x++) {
    const hole = new Path(); hole.absarc(x - 5, 2 - y, .445, 0, Math.PI * 2, true); shape.holes.push(hole);
  }
  return new ExtrudeGeometry(shape, { depth: sockets ? .19 : .15, bevelEnabled: true, bevelSegments: 3,
    steps: 1, bevelSize: sockets ? .045 : .1, bevelThickness: .045, curveSegments: 28 });
}

export function deskTexture(): CanvasTexture {
  const canvas = document.createElement('canvas'); canvas.width = 1024; canvas.height = 1024;
  const c = canvas.getContext('2d');
  if (c) {
    c.fillStyle = DESK_COLORS.desk; c.fillRect(0, 0, 1024, 1024);
    for (let i = 0; i < 900; i++) {
      const seed = Math.sin(i * 127.1 + 17) * 43758.5453; const f = seed - Math.floor(seed);
      c.strokeStyle = DESK_COLORS.grain; c.globalAlpha = .015 + f * .08; c.lineWidth = .3 + f * 1.3;
      const y = i * 1024 / 900; c.beginPath(); c.moveTo(0, y);
      c.bezierCurveTo(300, y + Math.sin(i * .02) * 5, 760, y - f * 9, 1024, y + Math.sin(i * .06) * 3); c.stroke();
    }
  }
  const texture = new CanvasTexture(canvas); texture.colorSpace = SRGBColorSpace;
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  texture.repeat.set(3, 3); return texture;
}

export function caseInscription(): CanvasTexture {
  const canvas = document.createElement('canvas'); canvas.width = 512; canvas.height = 80;
  const c = canvas.getContext('2d');
  if (c) {
    c.clearRect(0, 0, 512, 80); c.fillStyle = DESK_COLORS.brass; c.font = '600 38px sans-serif';
    c.textAlign = 'center'; c.fillText('K A N O O D L E', 256, 55);
  }
  const t = new CanvasTexture(canvas); t.colorSpace = SRGBColorSpace; return t;
}
