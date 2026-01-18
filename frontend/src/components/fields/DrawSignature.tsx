'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { Eraser } from 'lucide-react';

interface DrawSignatureProps {
    width?: number;
    height?: number;
    lineColor?: string;
    lineWidth?: number;
    onSignatureChange?: (dataUrl: string | null) => void;
}

interface Point {
    x: number;
    y: number;
    pressure: number;
}

export function DrawSignature({
    width = 400,
    height = 150,
    lineColor = '#1a1a2e',
    lineWidth = 2.5,
    onSignatureChange,
}: DrawSignatureProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [hasSignature, setHasSignature] = useState(false);
    const lastPointRef = useRef<Point | null>(null);

    // Initialize canvas
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set up high DPI canvas
        const dpr = window.devicePixelRatio || 1;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        ctx.scale(dpr, dpr);

        // Set drawing styles
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = lineColor;
        ctx.lineWidth = lineWidth;
    }, [width, height, lineColor, lineWidth]);

    const getPointFromEvent = useCallback((e: React.MouseEvent | React.TouchEvent): Point => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0, pressure: 0.5 };

        const rect = canvas.getBoundingClientRect();
        let clientX: number, clientY: number, pressure = 0.5;

        if ('touches' in e) {
            const touch = e.touches[0] || e.changedTouches[0];
            clientX = touch.clientX;
            clientY = touch.clientY;
            // Use force if available (iOS)
            if ('force' in touch) {
                pressure = Math.max(0.1, Math.min(1, (touch as Touch & { force: number }).force));
            }
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }

        return {
            x: clientX - rect.left,
            y: clientY - rect.top,
            pressure,
        };
    }, []);

    const startDrawing = useCallback((e: React.MouseEvent | React.TouchEvent) => {
        e.preventDefault();
        const point = getPointFromEvent(e);
        lastPointRef.current = point;
        setIsDrawing(true);
    }, [getPointFromEvent]);

    const draw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing) return;
        e.preventDefault();

        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx || !lastPointRef.current) return;

        const currentPoint = getPointFromEvent(e);

        // Draw smooth line with pressure variation
        ctx.beginPath();
        ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y);

        // Use quadratic curve for smoother lines
        const midX = (lastPointRef.current.x + currentPoint.x) / 2;
        const midY = (lastPointRef.current.y + currentPoint.y) / 2;
        ctx.quadraticCurveTo(lastPointRef.current.x, lastPointRef.current.y, midX, midY);

        // Vary line width based on pressure
        ctx.lineWidth = lineWidth * (0.5 + currentPoint.pressure);
        ctx.stroke();

        lastPointRef.current = currentPoint;

        if (!hasSignature) {
            setHasSignature(true);
        }
    }, [isDrawing, lineWidth, hasSignature, getPointFromEvent]);

    const stopDrawing = useCallback(() => {
        if (isDrawing) {
            setIsDrawing(false);
            lastPointRef.current = null;

            // Notify parent of signature change
            if (onSignatureChange && canvasRef.current) {
                const dataUrl = canvasRef.current.toDataURL('image/png');
                onSignatureChange(dataUrl);
            }
        }
    }, [isDrawing, onSignatureChange]);

    const clearSignature = useCallback(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) return;

        const dpr = window.devicePixelRatio || 1;
        ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
        setHasSignature(false);
        onSignatureChange?.(null);
    }, [onSignatureChange]);

    // Get current signature as data URL
    const getSignatureDataUrl = useCallback((): string | null => {
        if (!hasSignature || !canvasRef.current) return null;
        return canvasRef.current.toDataURL('image/png');
    }, [hasSignature]);

    // Expose method to parent via ref
    useEffect(() => {
        // Store getter on canvas element for external access
        if (canvasRef.current) {
            (canvasRef.current as HTMLCanvasElement & { getSignatureDataUrl: () => string | null }).getSignatureDataUrl = getSignatureDataUrl;
        }
    }, [getSignatureDataUrl]);

    return (
        <div className="draw-signature flex flex-col">
            {/* Canvas container */}
            <div className="relative border-2 border-gray-300 rounded-lg bg-white overflow-hidden">
                <canvas
                    ref={canvasRef}
                    className="cursor-crosshair touch-none"
                    style={{ width, height }}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    onTouchCancel={stopDrawing}
                />

                {/* Signature line */}
                <div
                    className="absolute bottom-8 left-4 right-4 border-b border-gray-300"
                    style={{ pointerEvents: 'none' }}
                />

                {/* X marker */}
                <span
                    className="absolute bottom-6 left-4 text-gray-400 text-lg font-serif"
                    style={{ pointerEvents: 'none' }}
                >
                    ✕
                </span>

                {/* Placeholder text */}
                {!hasSignature && (
                    <div
                        className="absolute inset-0 flex items-center justify-center pointer-events-none"
                        style={{ paddingBottom: '20px' }}
                    >
                        <span className="text-gray-400 text-sm">Draw your signature here</span>
                    </div>
                )}
            </div>

            {/* Clear button */}
            <div className="flex justify-end mt-2">
                <button
                    type="button"
                    onClick={clearSignature}
                    disabled={!hasSignature}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                    <Eraser className="w-4 h-4" />
                    Clear
                </button>
            </div>
        </div>
    );
}

export default DrawSignature;
