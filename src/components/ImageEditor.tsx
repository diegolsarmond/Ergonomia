import React, { useRef, useState, useEffect, useCallback } from 'react';
import { X, ArrowUpRight, Square, Circle, EyeOff, Undo2, Check } from 'lucide-react';

type Tool = 'arrow' | 'rect' | 'circle' | 'blur';

interface DrawnShape {
  tool: Tool;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
  lineWidth: number;
}

interface Props {
  imageDataUrl: string;
  onSave: (editedDataUrl: string) => void;
  onClose: () => void;
}

// Draw a single committed shape onto a context
function renderShape(ctx: CanvasRenderingContext2D, s: DrawnShape, img?: HTMLImageElement) {
  ctx.save();
  ctx.strokeStyle = s.color;
  ctx.fillStyle = s.color;
  ctx.lineWidth = s.lineWidth;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  const x1 = s.x1, y1 = s.y1, x2 = s.x2, y2 = s.y2;

  if (s.tool === 'rect') {
    ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
  } else if (s.tool === 'circle') {
    const rx = Math.abs(x2 - x1) / 2;
    const ry = Math.abs(y2 - y1) / 2;
    const cx = (x1 + x2) / 2;
    const cy = (y1 + y2) / 2;
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    ctx.stroke();
  } else if (s.tool === 'arrow') {
    const angle = Math.atan2(y2 - y1, x2 - x1);
    const headLen = Math.max(16, s.lineWidth * 5);
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    // arrowhead
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(
      x2 - headLen * Math.cos(angle - Math.PI / 6),
      y2 - headLen * Math.sin(angle - Math.PI / 6),
    );
    ctx.lineTo(
      x2 - headLen * Math.cos(angle + Math.PI / 6),
      y2 - headLen * Math.sin(angle + Math.PI / 6),
    );
    ctx.closePath();
    ctx.fill();
  } else if (s.tool === 'blur' && img) {
    applyBlurRegion(ctx, img, x1, y1, x2, y2);
  }
  ctx.restore();
}

function applyBlurRegion(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
) {
  const rx = Math.min(x1, x2);
  const ry = Math.min(y1, y2);
  const rw = Math.abs(x2 - x1);
  const rh = Math.abs(y2 - y1);
  if (rw < 4 || rh < 4) return;

  // pixelation block size
  const blockSize = Math.max(10, Math.round(Math.min(rw, rh) / 10));

  // Create a small temp canvas to pixelate
  const tmpCanvas = document.createElement('canvas');
  tmpCanvas.width = rw;
  tmpCanvas.height = rh;
  const tmpCtx = tmpCanvas.getContext('2d')!;
  // Draw original image region into tmp
  tmpCtx.drawImage(img, rx, ry, rw, rh, 0, 0, rw, rh);
  // Also draw any existing canvas content (shapes) under blur area
  // (we just use the img source for simplicity — committed shapes underneath will still be visible)

  // Pixelate
  for (let bx = 0; bx < rw; bx += blockSize) {
    for (let by = 0; by < rh; by += blockSize) {
      const bw = Math.min(blockSize, rw - bx);
      const bh = Math.min(blockSize, rh - by);
      const data = tmpCtx.getImageData(bx, by, bw, bh).data;
      let r = 0, g = 0, b = 0, a = 0, count = 0;
      for (let i = 0; i < data.length; i += 4) {
        r += data[i]; g += data[i + 1]; b += data[i + 2]; a += data[i + 3]; count++;
      }
      r = Math.round(r / count); g = Math.round(g / count);
      b = Math.round(b / count); a = Math.round(a / count);
      tmpCtx.fillStyle = `rgba(${r},${g},${b},${a / 255})`;
      tmpCtx.fillRect(bx, by, bw, bh);
    }
  }

  ctx.drawImage(tmpCanvas, 0, 0, rw, rh, rx, ry, rw, rh);
}

export const ImageEditor: React.FC<Props> = ({ imageDataUrl, onSave, onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [tool, setTool] = useState<Tool>('arrow');
  const [color, setColor] = useState('#ef4444');
  const [lineWidth] = useState(3);
  const [shapes, setShapes] = useState<DrawnShape[]>([]);
  const [drawing, setDrawing] = useState(false);
  const [startPt, setStartPt] = useState({ x: 0, y: 0 });
  const [livePt, setLivePt] = useState({ x: 0, y: 0 });

  const redraw = useCallback(
    (shapeList: DrawnShape[], img: HTMLImageElement, liveShape?: DrawnShape) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d')!;
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      ctx.drawImage(img, 0, 0);
      shapeList.forEach(s => renderShape(ctx, s, img));
      if (liveShape) renderShape(ctx, liveShape, img);
    },
    [],
  );

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      imgRef.current = img;
      redraw([], img);
    };
    img.src = imageDataUrl;
  }, [imageDataUrl, redraw]);

  const getPoint = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) * canvas.width) / rect.width,
      y: ((e.clientY - rect.top) * canvas.height) / rect.height,
    };
  };

  const onMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pt = getPoint(e);
    setStartPt(pt);
    setLivePt(pt);
    setDrawing(true);
  };

  const onMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!drawing) return;
    const pt = getPoint(e);
    setLivePt(pt);
    const img = imgRef.current!;
    const liveShape: DrawnShape = {
      tool, color, lineWidth,
      x1: startPt.x, y1: startPt.y, x2: pt.x, y2: pt.y,
    };
    redraw(shapes, img, liveShape);
  };

  const onMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!drawing) return;
    setDrawing(false);
    const pt = getPoint(e);
    const newShape: DrawnShape = {
      tool, color, lineWidth,
      x1: startPt.x, y1: startPt.y, x2: pt.x, y2: pt.y,
    };
    const next = [...shapes, newShape];
    setShapes(next);
    redraw(next, imgRef.current!);
  };

  const undo = () => {
    const next = shapes.slice(0, -1);
    setShapes(next);
    redraw(next, imgRef.current!);
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    onSave(canvas.toDataURL('image/jpeg', 0.92));
  };

  const TOOLS: { id: Tool; label: string; Icon: React.FC<{ className?: string }> }[] = [
    { id: 'arrow', label: 'Seta', Icon: ArrowUpRight },
    { id: 'rect', label: 'Retângulo', Icon: Square },
    { id: 'circle', label: 'Círculo', Icon: Circle },
    { id: 'blur', label: 'Desfocar Rosto', Icon: EyeOff },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="flex flex-col bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
          <span className="font-semibold text-slate-700 text-sm">Editor de Imagem</span>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 border-b border-slate-200 flex-wrap">
          {TOOLS.map(({ id, label, Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTool(id)}
              title={label}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                tool === id
                  ? 'bg-teal-600 text-white border-teal-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}

          {tool !== 'blur' && (
            <label className="inline-flex items-center gap-1.5 ml-2 cursor-pointer" title="Cor">
              <span className="text-xs text-slate-500">Cor</span>
              <input
                type="color"
                value={color}
                onChange={e => setColor(e.target.value)}
                className="w-7 h-7 rounded border border-slate-300 cursor-pointer p-0"
              />
            </label>
          )}

          <button
            type="button"
            onClick={undo}
            disabled={shapes.length === 0}
            title="Desfazer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border bg-white text-slate-600 border-slate-200 hover:bg-slate-100 disabled:opacity-40 ml-auto"
          >
            <Undo2 className="w-3.5 h-3.5" />
            Desfazer
          </button>
        </div>

        {/* Canvas */}
        <div className="flex-1 overflow-auto bg-slate-800 flex items-center justify-center p-3 min-h-0">
          <canvas
            ref={canvasRef}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={() => { if (drawing) { onMouseUp({ clientX: livePt.x, clientY: livePt.y } as any); } }}
            className="max-w-full max-h-full object-contain rounded-md cursor-crosshair select-none"
            style={{ display: 'block' }}
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-teal-600 text-white text-sm font-medium hover:bg-teal-700"
          >
            <Check className="w-4 h-4" />
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
};
