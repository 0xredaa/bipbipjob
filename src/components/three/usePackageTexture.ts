import { useMemo } from 'react';
import * as THREE from 'three';
import type { JobOffer } from '@/types';

/**
 * Builds a crisp canvas texture used as a shipping label on the parcel's front
 * face: job title, company and location, plus a faux barcode for flavour.
 */
export function usePackageLabelTexture(offer: JobOffer | null): THREE.CanvasTexture {
  return useMemo(() => {
    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    // Cardboard base
    ctx.fillStyle = '#C19A6B';
    ctx.fillRect(0, 0, size, size);

    // Subtle cardboard noise
    for (let i = 0; i < 1600; i++) {
      ctx.fillStyle = `rgba(0,0,0,${Math.random() * 0.04})`;
      ctx.fillRect(Math.random() * size, Math.random() * size, 2, 2);
    }

    // Yellow tape across the middle (matches the 3D ruban)
    ctx.fillStyle = 'rgba(250, 204, 21, 0.0)';

    // White shipping label card
    const pad = 46;
    const labelY = 70;
    const labelH = 300;
    roundRect(ctx, pad, labelY, size - pad * 2, labelH, 18);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.12)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Header strip
    roundRect(ctx, pad, labelY, size - pad * 2, 54, 18);
    ctx.fillStyle = '#0B0F17';
    ctx.fill();
    ctx.fillStyle = '#FACC15';
    ctx.font = '700 26px "Space Grotesk", system-ui, sans-serif';
    ctx.textBaseline = 'middle';
    ctx.fillText('BIPBIPJOB · EXPRESS', pad + 22, labelY + 28);

    const offerTitle = offer?.title ?? 'Chargement…';
    const company = offer?.company ?? '—';
    const location = offer?.location ?? '—';
    const contract = offer?.contract ?? '';

    // Title (wrapped)
    ctx.fillStyle = '#0B0F17';
    ctx.font = '700 36px "Space Grotesk", system-ui, sans-serif';
    const titleLines = wrapText(ctx, offerTitle, size - pad * 2 - 44);
    let ty = labelY + 96;
    titleLines.slice(0, 2).forEach((line) => {
      ctx.fillText(line, pad + 22, ty);
      ty += 42;
    });

    // Company
    ctx.fillStyle = '#374151';
    ctx.font = '600 28px Inter, system-ui, sans-serif';
    ctx.fillText(company, pad + 22, ty + 6);

    // Location + contract row
    ctx.fillStyle = '#6B7280';
    ctx.font = '400 24px Inter, system-ui, sans-serif';
    ctx.fillText(`${location}  ·  ${contract}`, pad + 22, ty + 44);

    // Faux barcode at the bottom of the label
    const bx = pad + 22;
    const by = labelY + labelH - 46;
    let cursor = bx;
    while (cursor < size - pad - 22) {
      const w = 2 + Math.random() * 5;
      ctx.fillStyle = Math.random() > 0.35 ? '#0B0F17' : '#FFFFFF';
      ctx.fillRect(cursor, by, w, 30);
      cursor += w + 1.5;
    }

    // "FRAGILE / TALENT INSIDE" stamp
    ctx.save();
    ctx.translate(size - 130, size - 96);
    ctx.rotate(-0.18);
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.85)';
    ctx.lineWidth = 4;
    roundRect(ctx, -84, -28, 168, 56, 8);
    ctx.stroke();
    ctx.fillStyle = 'rgba(239, 68, 68, 0.9)';
    ctx.font = '700 22px "Space Grotesk", system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('TALENT INSIDE', 0, 0);
    ctx.restore();
    ctx.textAlign = 'left';

    const texture = new THREE.CanvasTexture(canvas);
    texture.anisotropy = 8;
    texture.needsUpdate = true;
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }, [offer]);
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let line = '';
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}
