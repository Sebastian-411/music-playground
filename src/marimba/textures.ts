import * as THREE from "three";

function canvasTexture(
  width: number,
  height: number,
  draw: (ctx: CanvasRenderingContext2D, width: number, height: number) => void,
) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("No se pudo crear el lienzo de textura.");
  draw(context, width, height);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

function grain(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  color: string,
  count: number,
  along: "x" | "y",
) {
  for (let i = 0; i < count; i += 1) {
    const alpha = (0.05 + (i % 7) * 0.03).toFixed(3);
    ctx.strokeStyle = color.replace("ALPHA", alpha);
    ctx.lineWidth = i % 8 === 0 ? 2.4 : 0.8;
    ctx.beginPath();
    if (along === "y") {
      let x = (i / count) * width;
      ctx.moveTo(x, 0);
      for (let y = 0; y <= height; y += 8) {
        x += Math.sin(y * 0.02 + i) * 0.35;
        ctx.lineTo(x, y);
      }
    } else {
      let y = (i / count) * height;
      ctx.moveTo(0, y);
      for (let x = 0; x <= width; x += 8) {
        y += Math.sin(x * 0.015 + i) * 0.25;
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();
  }
}

/** Chonta envejecida: gris oscuro, veta larga y desgaste de uso. */
export function createChontaTexture(): THREE.CanvasTexture {
  return canvasTexture(256, 768, (ctx, width, height) => {
    const base = ctx.createLinearGradient(0, 0, width, 0);
    base.addColorStop(0, "#3e3832");
    base.addColorStop(0.22, "#6d645a");
    base.addColorStop(0.5, "#7c7368");
    base.addColorStop(0.78, "#5c554c");
    base.addColorStop(1, "#322e2a");
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, width, height);
    grain(ctx, width, height, "rgba(28, 24, 20, ALPHA)", 130, "y");
    grain(ctx, width, height, "rgba(168, 160, 148, ALPHA)", 24, "y");
    const ends = ctx.createLinearGradient(0, 0, 0, height);
    ends.addColorStop(0, "rgba(12, 9, 7, 0.8)");
    ends.addColorStop(0.08, "rgba(12, 9, 7, 0)");
    ends.addColorStop(0.92, "rgba(12, 9, 7, 0)");
    ends.addColorStop(1, "rgba(12, 9, 7, 0.82)");
    ctx.fillStyle = ends;
    ctx.fillRect(0, 0, width, height);
  });
}

/** Madera del burro y la cama, sin tinte amarillo de instrumento de concierto. */
export function createFrameTexture(): THREE.CanvasTexture {
  return canvasTexture(512, 256, (ctx, width, height) => {
    const base = ctx.createLinearGradient(0, 0, 0, height);
    base.addColorStop(0, "#7a5a3c");
    base.addColorStop(0.5, "#624832");
    base.addColorStop(1, "#4a3424");
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, width, height);
    grain(ctx, width, height, "rgba(48, 28, 14, ALPHA)", 70, "x");
    ctx.fillStyle = "rgba(20, 10, 6, 0.18)";
    ctx.fillRect(0, height * 0.72, width, height * 0.28);
  });
}

/** Guadua curtida por la humedad: canuto oscuro, nudos y vetas, nada de metal dorado. */
export function createGuaduaTexture(): THREE.CanvasTexture {
  return canvasTexture(160, 640, (ctx, width, height) => {
    const base = ctx.createLinearGradient(0, 0, width, 0);
    base.addColorStop(0, "#3a3026");
    base.addColorStop(0.2, "#6a5844");
    base.addColorStop(0.46, "#7d6a52");
    base.addColorStop(0.7, "#5c4b3a");
    base.addColorStop(1, "#2e261e");
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, width, height);
    grain(ctx, width, height, "rgba(36, 28, 18, ALPHA)", 50, "y");
    ctx.fillStyle = "rgba(28, 22, 16, 0.72)";
    for (let i = 1; i <= 4; i += 1) ctx.fillRect(0, (i / 5) * height - 7, width, 14);
    ctx.fillStyle = "rgba(186, 170, 142, 0.1)";
    ctx.fillRect(width * 0.22, 0, width * 0.08, height);
  });
}

export function createFloorTexture(): THREE.CanvasTexture {
  const texture = canvasTexture(512, 512, (ctx, width, height) => {
    ctx.fillStyle = "#3d4a34";
    ctx.fillRect(0, 0, width, height);
    for (let i = 0; i < 900; i += 1) {
      const x = (i * 97) % width;
      const y = (i * 53) % height;
      ctx.fillStyle = i % 3 === 0 ? "rgba(28, 36, 22, 0.35)" : "rgba(92, 104, 64, 0.22)";
      ctx.fillRect(x, y, 3 + (i % 5), 2 + (i % 3));
    }
    ctx.strokeStyle = "rgba(24, 32, 18, 0.35)";
    ctx.lineWidth = 2;
    for (let i = 0; i < 18; i += 1) {
      ctx.beginPath();
      ctx.moveTo((i * 40) % width, 0);
      ctx.bezierCurveTo(80 + i * 10, 160, 40, 320, (i * 70) % width, height);
      ctx.stroke();
    }
  });
  texture.repeat.set(6, 6);
  return texture;
}
