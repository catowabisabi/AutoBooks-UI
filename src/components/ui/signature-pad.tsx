'use client';

import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { IconEraser, IconCheck, IconX, IconPencil } from '@tabler/icons-react';

export interface SignaturePadProps {
  onSave?: (signatureData: string) => void;
  onClear?: () => void;
  onCancel?: () => void;
  width?: number;
  height?: number;
  strokeColor?: string;
  strokeWidth?: number;
  backgroundColor?: string;
  className?: string;
  title?: string;
  description?: string;
  showButtons?: boolean;
  disabled?: boolean;
}

export function SignaturePad({
  onSave,
  onClear,
  onCancel,
  width = 400,
  height = 200,
  strokeColor = '#000000',
  strokeWidth = 2,
  backgroundColor = '#ffffff',
  className,
  title = 'Signature',
  description = 'Sign in the box below',
  showButtons = true,
  disabled = false,
}: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const lastPos = useRef({ x: 0, y: 0 });

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = width;
    canvas.height = height;

    // Fill background
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, width, height);

    // Set stroke style
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = strokeWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, [width, height, strokeColor, strokeWidth, backgroundColor]);

  const getCoordinates = useCallback((e: React.MouseEvent | React.TouchEvent): { x: number; y: number } => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if ('touches' in e) {
      const touch = e.touches[0];
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY,
      };
    }

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  }, []);

  const startDrawing = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (disabled) return;
    e.preventDefault();
    
    const coords = getCoordinates(e);
    lastPos.current = coords;
    setIsDrawing(true);
  }, [disabled, getCoordinates]);

  const draw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || disabled) return;
    e.preventDefault();

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const coords = getCoordinates(e);

    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();

    lastPos.current = coords;
    setHasSignature(true);
  }, [isDrawing, disabled, getCoordinates]);

  const stopDrawing = useCallback(() => {
    setIsDrawing(false);
  }, []);

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
    onClear?.();
  }, [backgroundColor, onClear]);

  const saveSignature = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !hasSignature) return;

    const signatureData = canvas.toDataURL('image/png');
    onSave?.(signatureData);
  }, [hasSignature, onSave]);

  const getSignatureData = useCallback((): string | null => {
    const canvas = canvasRef.current;
    if (!canvas || !hasSignature) return null;
    return canvas.toDataURL('image/png');
  }, [hasSignature]);

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <IconPencil className="h-4 w-4" />
          {title}
        </CardTitle>
        {description && (
          <CardDescription>{description}</CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <div
          className={cn(
            'relative overflow-hidden rounded-lg border-2 border-dashed',
            disabled ? 'cursor-not-allowed opacity-50' : 'cursor-crosshair',
            'border-border hover:border-primary/50 transition-colors'
          )}
        >
          <canvas
            ref={canvasRef}
            className="touch-none"
            style={{ width: '100%', height: 'auto', aspectRatio: `${width}/${height}` }}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
          />
          {!hasSignature && !disabled && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="text-muted-foreground text-sm">Sign here</span>
            </div>
          )}
        </div>
      </CardContent>
      {showButtons && (
        <CardFooter className="flex justify-between gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={clearCanvas}
            disabled={disabled || !hasSignature}
          >
            <IconEraser className="h-4 w-4 mr-1" />
            Clear
          </Button>
          <div className="flex gap-2">
            {onCancel && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onCancel}
              >
                <IconX className="h-4 w-4 mr-1" />
                Cancel
              </Button>
            )}
            <Button
              type="button"
              size="sm"
              onClick={saveSignature}
              disabled={disabled || !hasSignature}
            >
              <IconCheck className="h-4 w-4 mr-1" />
              Confirm Signature
            </Button>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}

// Hook for using signature pad imperatively
export function useSignaturePad() {
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const [isSigned, setIsSigned] = useState(false);

  const handleSave = useCallback((data: string) => {
    setSignatureData(data);
    setIsSigned(true);
  }, []);

  const handleClear = useCallback(() => {
    setSignatureData(null);
    setIsSigned(false);
  }, []);

  const reset = useCallback(() => {
    setSignatureData(null);
    setIsSigned(false);
  }, []);

  return {
    signatureData,
    isSigned,
    handleSave,
    handleClear,
    reset,
  };
}

export default SignaturePad;
