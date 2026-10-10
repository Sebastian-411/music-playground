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

function grainLines(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  color: string,
  count: number,
  along: "x" | "y",
) {
  for (let i = 0; i < count; i += 1) {
    ctx.strokeStyle = color.replace("ALPHA", (0.08 + (i % 5) * 0.035).toFixed(3));
    ctx.lineWidth = i % 6 === 0 ? 2.2 : 1;
    ctx.beginPath();
    if (along === "y") {
      const x = (i / count) * width;
      ctx.moveTo(x, 0);
      for (let y = 0; y <= height; y += 10) ctx.lineTo(x + Math.sin(y * 0.03 + i) * 2.2, y);
    } else {
      const y = (i / count) * height;
      ctx.moveTo(0, y);
      for (let x = 0; x <= width; x += 10) ctx.lineTo(x, y + Math.sin(x * 0.02 + i) * 2.4);
    }
    ctx.stroke();
  }
}

export function createBarTopTexture(accidental: boolean): THREE.CanvasTexture {
  return canvasTexture(256, 640, (ctx, width, height) => {
    const base = ctx.createLinearGradient(0, 0, width, 0);
    base.addColorStop(0, accidental ? "#1a0d09" : "#24140e");
    base.addColorStop(0.16, accidental ? "#3a2016" : "#5c3420");
    base.addColorStop(0.5, accidental ? "#4a2818" : "#6e4128");
    base.addColorStop(0.84, accidental ? "#32180f" : "#4e2c1a");
    base.addColorStop(1, "#160c08");
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, width, height);
    grainLines(ctx, width, height, "rgba(18, 8, 4, ALPHA)", 110, "y");
    const wear = ctx.createRadialGradient(width / 2, height * 0.58, 6, width / 2, height * 0.55, height * 0.34);
    wear.addColorStop(0, "rgba(214, 150, 86, 0.62)");
    wear.addColorStop(0.4, "rgba(140, 78, 40, 0.28)");
    wear.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = wear;
    ctx.fillRect(0, 0, width, height);
    const ends = ctx.createLinearGradient(0, 0, 0, height);
    ends.addColorStop(0, "rgba(8, 3, 2, 0.72)");
    ends.addColorStop(0.14, "rgba(8, 3, 2, 0)");
    ends.addColorStop(0.86, "rgba(8, 3, 2, 0)");
    ends.addColorStop(1, "rgba(8, 3, 2, 0.75)");
    ctx.fillStyle = ends;
    ctx.fillRect(0, 0, width, height);
  });
}

export function createPineTexture(): THREE.CanvasTexture {
  return canvasTexture(512, 128, (ctx, width, height) => {
    const base = ctx.createLinearGradient(0, 0, 0, height);
    base.addColorStop(0, "#f0c56a");
    base.addColorStop(0.45, "#e2a84a");
    base.addColorStop(1, "#c4842e");
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, width, height);
    grainLines(ctx, width, height, "rgba(120, 62, 16, ALPHA)", 40, "x");
    ctx.fillStyle = "rgba(255, 236, 190, 0.18)";
    ctx.fillRect(0, 0, width, height * 0.22);
  });
}

export function createStainTexture(): THREE.CanvasTexture {
  return canvasTexture(256, 512, (ctx, width, height) => {
    ctx.fillStyle = "#6a3d24";
    ctx.fillRect(0, 0, width, height);
    grainLines(ctx, width, height, "rgba(40, 18, 8, ALPHA)", 70, "y");
    const shade = ctx.createLinearGradient(0, 0, width, 0);
    shade.addColorStop(0, "rgba(20, 8, 4, 0.35)");
    shade.addColorStop(0.4, "rgba(255, 210, 160, 0.08)");
    shade.addColorStop(1, "rgba(20, 8, 4, 0.28)");
    ctx.fillStyle = shade;
    ctx.fillRect(0, 0, width, height);
  });
}

export function createBambooTexture(): THREE.CanvasTexture {
  return canvasTexture(128, 512, (ctx, width, height) => {
    const base = ctx.createLinearGradient(0, 0, width, 0);
    base.addColorStop(0, "#a86428");
    base.addColorStop(0.22, "#f0c36e");
    base.addColorStop(0.48, "#e0943c");
    base.addColorStop(0.74, "#c97830");
    base.addColorStop(1, "#8a4c1c");
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = "rgba(90, 40, 12, 0.55)";
    for (let i = 1; i <= 5; i += 1) ctx.fillRect(0, (i / 6) * height - 4, width, 10);
    ctx.fillStyle = "rgba(255, 236, 200, 0.16)";
    ctx.fillRect(width * 0.18, 0, width * 0.12, height);
  });
}

export function createFloorTexture(): THREE.CanvasTexture {
  const texture = canvasTexture(512, 512, (ctx, width, height) => {
    ctx.fillStyle = "#efe8dc";
    ctx.fillRect(0, 0, width, height);
    const plank = 72;
    for (let y = 0; y < height; y += plank) {
      ctx.fillStyle = y % (plank * 2) === 0 ? "rgba(150, 116, 78, 0.09)" : "rgba(120, 86, 52, 0.05)";
      ctx.fillRect(0, y, width, plank - 3);
      ctx.strokeStyle = "rgba(110, 74, 42, 0.16)";
      ctx.lineWidth = 1;
      for (let line = 0; line < 4; line += 1) {
        const gy = y + 12 + line * 16;
        ctx.beginPath();
        ctx.moveTo(0, gy);
        ctx.bezierCurveTo(width * 0.3, gy + 2, width * 0.7, gy - 2, width, gy + 1);
        ctx.stroke();
      }
      ctx.fillStyle = "rgba(92, 64, 40, 0.35)";
      ctx.fillRect(0, y + plank - 3, width, 3);
    }
  });
  texture.repeat.set(4, 4);
  return texture;
}
