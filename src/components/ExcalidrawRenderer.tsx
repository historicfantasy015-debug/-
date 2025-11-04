import React, { useEffect, useRef } from 'react';

interface ExcalidrawElement {
  x: number;
  y: number;
  id?: string;
  type: 'rectangle' | 'ellipse' | 'line' | 'text' | 'arrow';
  width?: number;
  height?: number;
  points?: number[][];
  text?: string;
  strokeColor?: string;
  backgroundColor?: string;
  strokeWidth?: number;
  fontSize?: number;
  fontFamily?: number;
  version?: number;
}

interface ExcalidrawRendererProps {
  elements: ExcalidrawElement[] | ExcalidrawElement[][];
  width?: number;
  height?: number;
  className?: string;
}

export function ExcalidrawRenderer({ elements, width = 500, height = 400, className = '' }: ExcalidrawRendererProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Flatten elements if nested (for options)
    const flatElements = Array.isArray(elements[0]) && Array.isArray((elements[0] as any)[0])
      ? (elements as ExcalidrawElement[][]).flat()
      : (elements as ExcalidrawElement[]);

    // Calculate bounds for auto-centering
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    flatElements.forEach(element => {
      if (element.type === 'line' && element.points) {
        element.points.forEach(([px, py]) => {
          minX = Math.min(minX, element.x + px);
          minY = Math.min(minY, element.y + py);
          maxX = Math.max(maxX, element.x + px);
          maxY = Math.max(maxY, element.y + py);
        });
      } else {
        minX = Math.min(minX, element.x);
        minY = Math.min(minY, element.y);
        maxX = Math.max(maxX, element.x + (element.width || 0));
        maxY = Math.max(maxY, element.y + (element.height || 0));
      }
    });

    // Calculate scale and offset
    const contentWidth = maxX - minX;
    const contentHeight = maxY - minY;
    const scale = Math.min(
      (width - 40) / contentWidth,
      (height - 40) / contentHeight,
      1
    );
    const offsetX = (width - contentWidth * scale) / 2 - minX * scale;
    const offsetY = (height - contentHeight * scale) / 2 - minY * scale;

    // Draw elements
    flatElements.forEach(element => {
      ctx.save();

      const x = element.x * scale + offsetX;
      const y = element.y * scale + offsetY;

      ctx.strokeStyle = element.strokeColor || '#000000';
      ctx.fillStyle = element.backgroundColor || 'transparent';
      ctx.lineWidth = (element.strokeWidth || 1) * scale;

      switch (element.type) {
        case 'rectangle':
          if (element.width && element.height) {
            ctx.beginPath();
            ctx.rect(x, y, element.width * scale, element.height * scale);
            if (element.backgroundColor) ctx.fill();
            ctx.stroke();
          }
          break;

        case 'ellipse':
          if (element.width && element.height) {
            ctx.beginPath();
            ctx.ellipse(
              x + (element.width * scale) / 2,
              y + (element.height * scale) / 2,
              (element.width * scale) / 2,
              (element.height * scale) / 2,
              0,
              0,
              2 * Math.PI
            );
            if (element.backgroundColor) ctx.fill();
            ctx.stroke();
          }
          break;

        case 'line':
        case 'arrow':
          if (element.points && element.points.length > 0) {
            ctx.beginPath();
            ctx.moveTo(x, y);
            element.points.forEach(([px, py]) => {
              ctx.lineTo(x + px * scale, y + py * scale);
            });
            ctx.stroke();

            // Draw arrow head if type is arrow
            if (element.type === 'arrow' && element.points.length > 0) {
              const lastPoint = element.points[element.points.length - 1];
              const secondLastPoint = element.points.length > 1
                ? element.points[element.points.length - 2]
                : [0, 0];

              const endX = x + lastPoint[0] * scale;
              const endY = y + lastPoint[1] * scale;
              const startX = x + secondLastPoint[0] * scale;
              const startY = y + secondLastPoint[1] * scale;

              const angle = Math.atan2(endY - startY, endX - startX);
              const arrowLength = 10 * scale;

              ctx.beginPath();
              ctx.moveTo(endX, endY);
              ctx.lineTo(
                endX - arrowLength * Math.cos(angle - Math.PI / 6),
                endY - arrowLength * Math.sin(angle - Math.PI / 6)
              );
              ctx.moveTo(endX, endY);
              ctx.lineTo(
                endX - arrowLength * Math.cos(angle + Math.PI / 6),
                endY - arrowLength * Math.sin(angle + Math.PI / 6)
              );
              ctx.stroke();
            }
          }
          break;

        case 'text':
          if (element.text) {
            ctx.fillStyle = element.strokeColor || '#000000';
            ctx.font = `${(element.fontSize || 16) * scale}px ${
              element.fontFamily === 1 ? 'Arial' :
              element.fontFamily === 2 ? 'Courier New' :
              element.fontFamily === 3 ? 'Georgia' : 'Arial'
            }`;
            ctx.textBaseline = 'top';
            ctx.fillText(element.text, x, y);
          }
          break;
      }

      ctx.restore();
    });
  }, [elements, width, height]);

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-2 ${className}`}>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="mx-auto"
      />
    </div>
  );
}

export function extractExcalidrawFromText(text: string): ExcalidrawElement[] | null {
  if (!text || typeof text !== 'string') return null;

  try {
    // Find the opening bracket of the JSON array
    const startIdx = text.lastIndexOf('[');
    if (startIdx === -1) return null;

    // Find matching closing bracket with bracket counting
    let depth = 0;
    let endIdx = -1;

    for (let i = startIdx; i < text.length; i++) {
      if (text[i] === '[') depth++;
      else if (text[i] === ']') {
        depth--;
        if (depth === 0) {
          endIdx = i;
          break;
        }
      }
    }

    if (endIdx === -1) return null;

    // Extract and parse the JSON
    const jsonStr = text.substring(startIdx, endIdx + 1);
    const parsed = JSON.parse(jsonStr);

    // Validate it's an array of elements with type property
    if (Array.isArray(parsed) && parsed.length > 0) {
      const allHaveType = parsed.every((elem: any) => elem && typeof elem === 'object' && elem.type);
      if (allHaveType) {
        return parsed as ExcalidrawElement[];
      }
    }

    return null;
  } catch (error) {
    return null;
  }
}

export function removeExcalidrawFromText(text: string): string {
  if (!text || typeof text !== 'string') return '';

  // Find the last opening bracket
  const startIdx = text.lastIndexOf('[');
  if (startIdx === -1) return text.trim();

  // Check if this looks like a JSON array (contains "type")
  const potentialJson = text.substring(startIdx);
  if (!potentialJson.includes('"type"')) {
    return text.trim();
  }

  // Find matching closing bracket
  let depth = 0;
  let endIdx = -1;

  for (let i = startIdx; i < text.length; i++) {
    if (text[i] === '[') depth++;
    else if (text[i] === ']') {
      depth--;
      if (depth === 0) {
        endIdx = i;
        break;
      }
    }
  }

  if (endIdx === -1) return text.trim();

  // Remove the JSON and trim
  return (text.substring(0, startIdx) + text.substring(endIdx + 1)).trim();
}

export function splitTextAndDiagram(text: string): {
  text: string;
  diagram: ExcalidrawElement[] | null;
} {
  const diagram = extractExcalidrawFromText(text);
  const cleanText = diagram ? removeExcalidrawFromText(text) : text;
  return { text: cleanText, diagram };
}
