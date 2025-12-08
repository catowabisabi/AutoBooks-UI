'use client';

import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { ExtractedField, ExtractedFieldType, BoundingBox } from '../types';

// ============================================
// Types
// ============================================

interface BoundingBoxOverlayProps {
  /** URL of the receipt/document image */
  imageUrl: string;
  /** Extracted fields with bounding box data */
  fields: ExtractedField[];
  /** Currently selected/highlighted field */
  selectedFieldId?: string;
  /** Callback when a field bounding box is clicked */
  onFieldClick?: (field: ExtractedField) => void;
  /** Callback when hovering over a field */
  onFieldHover?: (field: ExtractedField | null) => void;
  /** Whether to show field labels */
  showLabels?: boolean;
  /** Whether to show confidence scores */
  showConfidence?: boolean;
  /** Field types to show (filter) */
  visibleFieldTypes?: ExtractedFieldType[];
  /** Whether the image is zoomable */
  zoomable?: boolean;
  /** Initial zoom level (1 = 100%) */
  initialZoom?: number;
  /** Current page number (for multi-page documents) */
  pageNumber?: number;
  /** Custom class name */
  className?: string;
}

interface FieldBoxProps {
  field: ExtractedField;
  isSelected: boolean;
  isHovered: boolean;
  showLabel: boolean;
  showConfidence: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

// ============================================
// Field Type Colors
// ============================================

const FIELD_TYPE_COLORS: Record<ExtractedFieldType, { bg: string; border: string; text: string }> = {
  VENDOR: { bg: 'bg-blue-500/20', border: 'border-blue-500', text: 'text-blue-700 dark:text-blue-300' },
  TOTAL: { bg: 'bg-green-500/20', border: 'border-green-500', text: 'text-green-700 dark:text-green-300' },
  DATE: { bg: 'bg-purple-500/20', border: 'border-purple-500', text: 'text-purple-700 dark:text-purple-300' },
  CURRENCY: { bg: 'bg-yellow-500/20', border: 'border-yellow-500', text: 'text-yellow-700 dark:text-yellow-300' },
  TAX: { bg: 'bg-orange-500/20', border: 'border-orange-500', text: 'text-orange-700 dark:text-orange-300' },
  CATEGORY: { bg: 'bg-pink-500/20', border: 'border-pink-500', text: 'text-pink-700 dark:text-pink-300' },
  SUBTOTAL: { bg: 'bg-teal-500/20', border: 'border-teal-500', text: 'text-teal-700 dark:text-teal-300' },
  TIP: { bg: 'bg-indigo-500/20', border: 'border-indigo-500', text: 'text-indigo-700 dark:text-indigo-300' },
  PAYMENT_METHOD: { bg: 'bg-cyan-500/20', border: 'border-cyan-500', text: 'text-cyan-700 dark:text-cyan-300' },
  INVOICE_NUMBER: { bg: 'bg-violet-500/20', border: 'border-violet-500', text: 'text-violet-700 dark:text-violet-300' },
  LINE_ITEM: { bg: 'bg-slate-500/20', border: 'border-slate-500', text: 'text-slate-700 dark:text-slate-300' },
  OTHER: { bg: 'bg-gray-500/20', border: 'border-gray-500', text: 'text-gray-700 dark:text-gray-300' },
};

const FIELD_TYPE_LABELS: Record<ExtractedFieldType, string> = {
  VENDOR: 'Vendor',
  TOTAL: 'Total',
  DATE: 'Date',
  CURRENCY: 'Currency',
  TAX: 'Tax',
  CATEGORY: 'Category',
  SUBTOTAL: 'Subtotal',
  TIP: 'Tip',
  PAYMENT_METHOD: 'Payment',
  INVOICE_NUMBER: 'Invoice #',
  LINE_ITEM: 'Line Item',
  OTHER: 'Other',
};

// ============================================
// Helper Functions
// ============================================

/**
 * Convert bounding box to CSS positioning
 * Handles both ratio (0-1) and pixel coordinates
 */
function getBoundingBoxStyle(field: ExtractedField, containerWidth: number, containerHeight: number) {
  const bbox = field.final_bbox || {
    x1: field.corrected_bbox_x1 ?? field.bbox_x1,
    y1: field.corrected_bbox_y1 ?? field.bbox_y1,
    x2: field.corrected_bbox_x2 ?? field.bbox_x2,
    y2: field.corrected_bbox_y2 ?? field.bbox_y2,
  };

  if (bbox.x1 == null || bbox.y1 == null || bbox.x2 == null || bbox.y2 == null) {
    return null;
  }

  const isRatio = field.bbox_unit === 'ratio' || 
    (bbox.x1 <= 1 && bbox.y1 <= 1 && bbox.x2 <= 1 && bbox.y2 <= 1);

  let left: number, top: number, width: number, height: number;

  if (isRatio) {
    // Convert ratio to percentage
    left = bbox.x1 * 100;
    top = bbox.y1 * 100;
    width = (bbox.x2 - bbox.x1) * 100;
    height = (bbox.y2 - bbox.y1) * 100;
  } else {
    // Convert pixels to percentage based on container size
    left = (bbox.x1 / containerWidth) * 100;
    top = (bbox.y1 / containerHeight) * 100;
    width = ((bbox.x2 - bbox.x1) / containerWidth) * 100;
    height = ((bbox.y2 - bbox.y1) / containerHeight) * 100;
  }

  return {
    left: `${left}%`,
    top: `${top}%`,
    width: `${width}%`,
    height: `${height}%`,
  };
}

/**
 * Get confidence indicator color
 */
function getConfidenceColor(confidence: number): string {
  if (confidence >= 0.9) return 'text-green-600 dark:text-green-400';
  if (confidence >= 0.7) return 'text-yellow-600 dark:text-yellow-400';
  return 'text-red-600 dark:text-red-400';
}

// ============================================
// FieldBox Component
// ============================================

function FieldBox({
  field,
  isSelected,
  isHovered,
  showLabel,
  showConfidence,
  onClick,
  onMouseEnter,
  onMouseLeave,
}: FieldBoxProps) {
  const colors = FIELD_TYPE_COLORS[field.field_type] || FIELD_TYPE_COLORS.OTHER;
  const label = FIELD_TYPE_LABELS[field.field_type] || field.field_name;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              'absolute border-2 cursor-pointer transition-all duration-200',
              colors.bg,
              colors.border,
              isSelected && 'ring-2 ring-offset-2 ring-primary border-primary',
              isHovered && 'ring-1 ring-offset-1 ring-primary/50',
              field.is_corrected && 'border-dashed'
            )}
            onClick={onClick}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
          >
            {/* Field label badge */}
            {showLabel && (
              <div className="absolute -top-5 left-0">
                <Badge
                  variant="secondary"
                  className={cn(
                    'text-[10px] px-1 py-0 h-4',
                    colors.text,
                    isSelected && 'bg-primary text-primary-foreground'
                  )}
                >
                  {label}
                  {field.is_corrected && ' ✓'}
                </Badge>
              </div>
            )}

            {/* Confidence indicator */}
            {showConfidence && (
              <div className="absolute -bottom-4 left-0">
                <span
                  className={cn(
                    'text-[9px] font-mono',
                    getConfidenceColor(field.confidence_score)
                  )}
                >
                  {Math.round(field.confidence_score * 100)}%
                </span>
              </div>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="right" className="max-w-xs">
          <div className="space-y-1">
            <div className="font-semibold">{label}</div>
            <div className="text-sm">
              <span className="text-muted-foreground">Value: </span>
              <span className="font-mono">{field.final_value || field.raw_value}</span>
            </div>
            <div className="text-xs text-muted-foreground">
              Confidence: {Math.round(field.confidence_score * 100)}%
            </div>
            {field.is_corrected && (
              <div className="text-xs text-blue-600 dark:text-blue-400">
                ✓ Corrected
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// ============================================
// BoundingBoxOverlay Component
// ============================================

export function BoundingBoxOverlay({
  imageUrl,
  fields,
  selectedFieldId,
  onFieldClick,
  onFieldHover,
  showLabels = true,
  showConfidence = true,
  visibleFieldTypes,
  zoomable = true,
  initialZoom = 1,
  pageNumber = 1,
  className,
}: BoundingBoxOverlayProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(initialZoom);
  const [hoveredFieldId, setHoveredFieldId] = useState<string | null>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [imageLoaded, setImageLoaded] = useState(false);

  // Filter fields by page number and visible types
  const filteredFields = useMemo(() => {
    return fields.filter((field) => {
      if (field.page_number !== pageNumber) return false;
      if (visibleFieldTypes && !visibleFieldTypes.includes(field.field_type)) return false;
      // Only show fields with bounding box data
      if (field.bbox_x1 == null && field.corrected_bbox_x1 == null) return false;
      return true;
    });
  }, [fields, pageNumber, visibleFieldTypes]);

  // Update container size on resize
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setContainerSize({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [imageLoaded]);

  // Handle zoom with mouse wheel
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      if (!zoomable || !e.ctrlKey) return;
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      setZoom((prev) => Math.max(0.5, Math.min(3, prev + delta)));
    },
    [zoomable]
  );

  // Handle field click
  const handleFieldClick = useCallback(
    (field: ExtractedField) => {
      onFieldClick?.(field);
    },
    [onFieldClick]
  );

  // Handle field hover
  const handleFieldHover = useCallback(
    (field: ExtractedField | null) => {
      setHoveredFieldId(field?.id || null);
      onFieldHover?.(field);
    },
    [onFieldHover]
  );

  return (
    <div
      ref={containerRef}
      className={cn('relative overflow-hidden bg-muted/30 rounded-lg', className)}
      onWheel={handleWheel}
    >
      {/* Image container with zoom */}
      <div
        className="relative origin-top-left transition-transform duration-200"
        style={{ transform: `scale(${zoom})` }}
      >
        {/* Receipt/Document image */}
        <img
          src={imageUrl}
          alt="Receipt"
          className="w-full h-auto"
          onLoad={() => setImageLoaded(true)}
          draggable={false}
        />

        {/* Bounding box overlays */}
        {imageLoaded &&
          filteredFields.map((field) => {
            const style = getBoundingBoxStyle(field, containerSize.width, containerSize.height);
            if (!style) return null;

            return (
              <div key={field.id} style={style} className="absolute">
                <FieldBox
                  field={field}
                  isSelected={selectedFieldId === field.id}
                  isHovered={hoveredFieldId === field.id}
                  showLabel={showLabels}
                  showConfidence={showConfidence}
                  onClick={() => handleFieldClick(field)}
                  onMouseEnter={() => handleFieldHover(field)}
                  onMouseLeave={() => handleFieldHover(null)}
                />
              </div>
            );
          })}
      </div>

      {/* Zoom controls */}
      {zoomable && (
        <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-background/80 backdrop-blur-sm rounded-md px-2 py-1 text-xs">
          <button
            onClick={() => setZoom((prev) => Math.max(0.5, prev - 0.25))}
            className="p-1 hover:bg-muted rounded"
          >
            −
          </button>
          <span className="w-12 text-center">{Math.round(zoom * 100)}%</span>
          <button
            onClick={() => setZoom((prev) => Math.min(3, prev + 0.25))}
            className="p-1 hover:bg-muted rounded"
          >
            +
          </button>
          <button
            onClick={() => setZoom(1)}
            className="p-1 hover:bg-muted rounded text-[10px]"
          >
            Reset
          </button>
        </div>
      )}

      {/* Field count indicator */}
      <div className="absolute top-2 left-2 bg-background/80 backdrop-blur-sm rounded-md px-2 py-1 text-xs">
        {filteredFields.length} field{filteredFields.length !== 1 ? 's' : ''} detected
      </div>
    </div>
  );
}

// ============================================
// Field Legend Component
// ============================================

interface FieldLegendProps {
  visibleTypes?: ExtractedFieldType[];
  onToggleType?: (type: ExtractedFieldType) => void;
  className?: string;
}

export function FieldLegend({ visibleTypes, onToggleType, className }: FieldLegendProps) {
  const allTypes = Object.keys(FIELD_TYPE_COLORS) as ExtractedFieldType[];

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {allTypes.map((type) => {
        const colors = FIELD_TYPE_COLORS[type];
        const label = FIELD_TYPE_LABELS[type];
        const isVisible = !visibleTypes || visibleTypes.includes(type);

        return (
          <button
            key={type}
            onClick={() => onToggleType?.(type)}
            className={cn(
              'flex items-center gap-1.5 px-2 py-1 rounded-md text-xs transition-opacity',
              colors.bg,
              colors.text,
              !isVisible && 'opacity-40'
            )}
          >
            <div className={cn('w-3 h-3 rounded-sm border-2', colors.border)} />
            {label}
          </button>
        );
      })}
    </div>
  );
}

export default BoundingBoxOverlay;
