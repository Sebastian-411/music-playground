import * as THREE from "three";

function canvasTexture(width: number, height: number, draw: (ctx: CanvasRenderingContext2D, width: number, height: number) => void) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("No se pudo crear el lienzo de textura.");
  draw(context, width, height);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}

export function createWoodTexture(seedHue: number): THREE.CanvasTexture {
  return canvasTexture(256, 512, (ctx, width, height) => {
    ctx.fillStyle = `hsl(${seedHue} 46% 46%)`;
    ctx.fillRect(0, 0, width, height);
    for (let i = 0; i < 70; i += 1) {
      const y = (i / 70) * height;
      ctx.strokeStyle = `rgba(62, 28, 10, ${0.05 + (i % 5) * 0.025})`;
      ctx.lineWidth = 1 + (i % 3);
      ctx.beginPath();
      ctx.moveTo(0, y);
      for (let x = 0; x <= width; x += 12) {
        ctx.lineTo(x, y + Math.sin(x * 0.08 + i * 0.7) * 2.4);
      }
      ctx.stroke();
    }
    const shade = ctx.createLinearGradient(0, 0, width, 0);
    shade.addColorStop(0, "rgba(40, 16, 6, 0.28)");
    shade.addColorStop(0.45, "rgba(255, 220, 170, 0.08)");
    shade.addColorStop(1, "rgba(40, 16, 6, 0.22)");
    ctx.fillStyle = shade;
    ctx.fillRect(0, 0, width, height);
  });
}

export function createBambooTexture(): THREE.CanvasTexture {
  const texture = canvasTexture(128, 512, (ctx, width, height) => {
    const base = ctx.createLinearGradient(0, 0, width, 0);
    base.addColorStop(0, "#8d6a3b");
    base.addColorStop(0.35, "#e6c98a");
    base.addColorStop(0.7, "#c79a58");
    base.addColorStop(1, "#7d5a30");
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = "rgba(70, 42, 16, 0.45)";
    for (let i = 1; i < 7; i += 1) {
      const y = (i / 7) * height;
      ctx.fillRect(0, y, width, 9);
    }
  });
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

export function createGroundTexture(): THREE.CanvasTexture {
  return canvasTexture(512, 512, (ctx, width, height) => {
    ctx.fillStyle = "#143028";
    ctx.fillRect(0, 0, width, height);
    for (let i = 0; i < 1400; i += 1) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      ctx.fillStyle = `rgba(8, 20, 14, ${Math.random() * 0.35})`;
      ctx.fillRect(x, y, 2, 1 + Math.random() * 3);
    }
    const glow = ctx.createRadialGradient(width / 2, height / 2, 40, width / 2, height / 2, width / 2);
    glow.addColorStop(0, "rgba(196, 150, 90, 0.16)");
    glow.addColorStop(1, "rgba(8, 18, 14, 0.55)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, width, height);
  });
}

const labels = new Map<string, THREE.CanvasTexture>();

export function noteLabelTexture(text: string): THREE.CanvasTexture {
  const cached = labels.get(text);
  if (cached) return cached;
  const texture = canvasTexture(256, 64, (ctx, width, height) => {
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "rgba(48, 22, 8, 0.9)";
    ctx.font = "600 36px 'DejaVu Sans', 'Liberation Sans', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, width / 2, height / 2 + 1);
  });
  texture.anisotropy = 4;
  labels.set(text, texture);
  return texture;
}
