'use client';

import { useState, useCallback, useEffect } from 'react';
import { useTranslation } from '@/lib/i18n/provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AlertCircle,
  Check,
  Clock,
  Edit2,
  History,
  Loader2,
  MapPin,
  Save,
  X,
  Undo2,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { fieldExtractionApi } from '../services';
import type {
  ExtractedField,
  ExtractedFieldType,
  BoundingBoxInput,
  FieldCorrectionHistoryEntry,
  ReceiptCorrectionSummary,
} from '../types';

// ============================================
// Types
// ============================================

interface FieldCorrectionModalProps {
  /** Whether the modal is open */
  open: boolean;
  /** Callback when the modal is closed */
  onClose: () => void;
  /** The field to correct (null for creating new field) */
  field: ExtractedField | null;
  /** Receipt ID for API calls */
  receiptId: string;
  /** Image URL for bounding box preview */
  imageUrl?: string;
  /** Callback after successful correction */
  onCorrectionComplete?: (updatedField: ExtractedField) => void;
  /** Allow creating new fields */
  allowCreate?: boolean;
}

interface BoundingBoxEditorProps {
  value: BoundingBoxInput;
  onChange: (value: BoundingBoxInput) => void;
  isRatio?: boolean;
}

// ============================================
// Field Type Options
// ============================================

const FIELD_TYPE_OPTIONS: { value: ExtractedFieldType; label: string }[] = [
  { value: 'VENDOR', label: 'Vendor' },
  { value: 'TOTAL', label: 'Total Amount' },
  { value: 'DATE', label: 'Date' },
  { value: 'CURRENCY', label: 'Currency' },
  { value: 'TAX', label: 'Tax' },
  { value: 'CATEGORY', label: 'Category' },
  { value: 'SUBTOTAL', label: 'Subtotal' },
  { value: 'TIP', label: 'Tip' },
  { value: 'PAYMENT_METHOD', label: 'Payment Method' },
  { value: 'INVOICE_NUMBER', label: 'Invoice Number' },
  { value: 'LINE_ITEM', label: 'Line Item' },
  { value: 'OTHER', label: 'Other' },
];

// ============================================
// BoundingBoxEditor Component
// ============================================

function BoundingBoxEditor({ value, onChange, isRatio = true }: BoundingBoxEditorProps) {
  const handleChange = (key: keyof BoundingBoxInput, val: string) => {
    const numVal = parseFloat(val) || 0;
    onChange({ ...value, [key]: numVal });
  };

  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">X1 (Left)</Label>
        <Input
          type="number"
          step={isRatio ? '0.01' : '1'}
          min="0"
          max={isRatio ? '1' : undefined}
          value={value.x1}
          onChange={(e) => handleChange('x1', e.target.value)}
          className="h-8"
        />
      </div>
      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">Y1 (Top)</Label>
        <Input
          type="number"
          step={isRatio ? '0.01' : '1'}
          min="0"
          max={isRatio ? '1' : undefined}
          value={value.y1}
          onChange={(e) => handleChange('y1', e.target.value)}
          className="h-8"
        />
      </div>
      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">X2 (Right)</Label>
        <Input
          type="number"
          step={isRatio ? '0.01' : '1'}
          min="0"
          max={isRatio ? '1' : undefined}
          value={value.x2}
          onChange={(e) => handleChange('x2', e.target.value)}
          className="h-8"
        />
      </div>
      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">Y2 (Bottom)</Label>
        <Input
          type="number"
          step={isRatio ? '0.01' : '1'}
          min="0"
          max={isRatio ? '1' : undefined}
          value={value.y2}
          onChange={(e) => handleChange('y2', e.target.value)}
          className="h-8"
        />
      </div>
    </div>
  );
}

// ============================================
// HistoryEntry Component
// ============================================

function HistoryEntry({ entry }: { entry: FieldCorrectionHistoryEntry }) {
  return (
    <div className="border rounded-lg p-3 space-y-2 text-sm">
      <div className="flex items-center justify-between">
        <Badge variant="outline" className="text-xs">
          v{entry.version}
        </Badge>
        <span className="text-xs text-muted-foreground">
          {new Date(entry.created_at).toLocaleString()}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <span className="text-muted-foreground">Previous: </span>
          <span className="font-mono text-red-600 dark:text-red-400 line-through">
            {entry.previous_value || '(empty)'}
          </span>
        </div>
        <div>
          <span className="text-muted-foreground">New: </span>
          <span className="font-mono text-green-600 dark:text-green-400">
            {entry.new_value || '(empty)'}
          </span>
        </div>
      </div>
      {entry.correction_reason && (
        <div className="text-xs text-muted-foreground">
          Reason: {entry.correction_reason}
        </div>
      )}
      {entry.corrected_by_name && (
        <div className="text-xs text-muted-foreground">
          By: {entry.corrected_by_name}
        </div>
      )}
    </div>
  );
}

// ============================================
// FieldCorrectionModal Component
// ============================================

export function FieldCorrectionModal({
  open,
  onClose,
  field,
  receiptId,
  imageUrl,
  onCorrectionComplete,
  allowCreate = true,
}: FieldCorrectionModalProps) {
  const { t } = useTranslation();
  const isCreating = !field;

  // Form state
  const [fieldType, setFieldType] = useState<ExtractedFieldType>(field?.field_type || 'OTHER');
  const [fieldName, setFieldName] = useState(field?.field_name || '');
  const [value, setValue] = useState(field?.final_value || field?.raw_value || '');
  const [correctionReason, setCorrectionReason] = useState('');
  const [boundingBox, setBoundingBox] = useState<BoundingBoxInput>({
    x1: field?.corrected_bbox_x1 ?? field?.bbox_x1 ?? 0,
    y1: field?.corrected_bbox_y1 ?? field?.bbox_y1 ?? 0,
    x2: field?.corrected_bbox_x2 ?? field?.bbox_x2 ?? 0,
    y2: field?.corrected_bbox_y2 ?? field?.bbox_y2 ?? 0,
  });
  const [editBoundingBox, setEditBoundingBox] = useState(false);
  const [pageNumber, setPageNumber] = useState(field?.page_number || 1);

  // Loading states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [history, setHistory] = useState<FieldCorrectionHistoryEntry[]>([]);
  const [activeTab, setActiveTab] = useState('edit');

  // Reset form when field changes
  useEffect(() => {
    if (field) {
      setFieldType(field.field_type);
      setFieldName(field.field_name);
      setValue(field.final_value || field.raw_value || '');
      setBoundingBox({
        x1: field.corrected_bbox_x1 ?? field.bbox_x1 ?? 0,
        y1: field.corrected_bbox_y1 ?? field.bbox_y1 ?? 0,
        x2: field.corrected_bbox_x2 ?? field.bbox_x2 ?? 0,
        y2: field.corrected_bbox_y2 ?? field.bbox_y2 ?? 0,
      });
      setPageNumber(field.page_number);
      setEditBoundingBox(false);
    } else {
      setFieldType('OTHER');
      setFieldName('');
      setValue('');
      setBoundingBox({ x1: 0, y1: 0, x2: 0, y2: 0 });
      setPageNumber(1);
      setEditBoundingBox(true);
    }
    setCorrectionReason('');
    setHistory([]);
  }, [field]);

  // Load history when tab is switched
  const loadHistory = useCallback(async () => {
    if (!field || history.length > 0) return;
    
    setIsLoadingHistory(true);
    try {
      const response = await fieldExtractionApi.getCorrectionHistory(receiptId, {
        field_id: field.id,
      });
      setHistory(response.history);
    } catch (error) {
      console.error('Failed to load history:', error);
      toast.error('Failed to load correction history');
    } finally {
      setIsLoadingHistory(false);
    }
  }, [field, receiptId, history.length]);

  useEffect(() => {
    if (activeTab === 'history' && field) {
      loadHistory();
    }
  }, [activeTab, field, loadHistory]);

  // Handle submit
  const handleSubmit = async () => {
    if (!value.trim()) {
      toast.error('Value is required');
      return;
    }

    setIsSubmitting(true);
    try {
      const correctionData = {
        fields: [
          {
            ...(field ? { field_id: field.id } : { field_type: fieldType }),
            field_name: fieldName || undefined,
            value: value.trim(),
            bounding_box: editBoundingBox ? boundingBox : undefined,
            correction_reason: correctionReason || undefined,
            page_number: !field ? pageNumber : undefined,
          },
        ],
        correction_source: 'UI' as const,
        notes: correctionReason || undefined,
      };

      const response = await fieldExtractionApi.correctFields(receiptId, correctionData);
      
      const updatedField = field
        ? response.corrected_fields[0]
        : response.created_fields[0];

      toast.success(field ? 'Field corrected successfully' : 'Field created successfully');
      onCorrectionComplete?.(updatedField);
      onClose();
    } catch (error: any) {
      console.error('Correction failed:', error);
      toast.error(error.response?.data?.detail || 'Failed to save correction');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle revert (for corrected fields)
  const handleRevert = async () => {
    if (!field || !field.is_corrected) return;

    setIsSubmitting(true);
    try {
      // Revert by setting corrected_value back to raw_value
      const correctionData = {
        fields: [
          {
            field_id: field.id,
            value: field.raw_value,
            correction_reason: 'Reverted to original value',
          },
        ],
        correction_source: 'UI' as const,
        notes: 'Reverted correction',
      };

      const response = await fieldExtractionApi.correctFields(receiptId, correctionData);
      
      toast.success('Field reverted to original value');
      onCorrectionComplete?.(response.corrected_fields[0]);
      onClose();
    } catch (error: any) {
      console.error('Revert failed:', error);
      toast.error(error.response?.data?.detail || 'Failed to revert field');
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasChanges = field
    ? value !== (field.corrected_value || field.raw_value) ||
      (editBoundingBox && (
        boundingBox.x1 !== (field.corrected_bbox_x1 ?? field.bbox_x1) ||
        boundingBox.y1 !== (field.corrected_bbox_y1 ?? field.bbox_y1) ||
        boundingBox.x2 !== (field.corrected_bbox_x2 ?? field.bbox_x2) ||
        boundingBox.y2 !== (field.corrected_bbox_y2 ?? field.bbox_y2)
      ))
    : value.trim().length > 0;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isCreating ? (
              <>
                <Edit2 className="h-4 w-4" />
                Add New Field
              </>
            ) : (
              <>
                <Edit2 className="h-4 w-4" />
                Edit Field: {field?.field_name || FIELD_TYPE_OPTIONS.find(f => f.value === field?.field_type)?.label}
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {isCreating
              ? 'Manually add a new extracted field with bounding box coordinates.'
              : 'Correct the extracted value and optionally adjust the bounding box.'}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="edit" className="flex items-center gap-2">
              <Edit2 className="h-3 w-3" />
              Edit
            </TabsTrigger>
            <TabsTrigger 
              value="history" 
              disabled={isCreating}
              className="flex items-center gap-2"
            >
              <History className="h-3 w-3" />
              History
              {field?.version && field.version > 1 && (
                <Badge variant="secondary" className="ml-1 text-xs">
                  {field.version - 1}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="edit" className="space-y-4 mt-4">
            {/* Field Info (for existing fields) */}
            {field && (
              <div className="rounded-lg bg-muted/50 p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{field.field_type}</Badge>
                    {field.is_corrected && (
                      <Badge variant="secondary" className="text-xs">
                        <Check className="h-3 w-3 mr-1" />
                        Corrected
                      </Badge>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    Confidence: {Math.round(field.confidence_score * 100)}%
                  </span>
                </div>
                {field.raw_value && field.raw_value !== value && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Original: </span>
                    <span className="font-mono text-muted-foreground">{field.raw_value}</span>
                  </div>
                )}
              </div>
            )}

            {/* Field Type (for new fields) */}
            {isCreating && (
              <div className="space-y-2">
                <Label>Field Type</Label>
                <Select value={fieldType} onValueChange={(v) => setFieldType(v as ExtractedFieldType)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select field type" />
                  </SelectTrigger>
                  <SelectContent>
                    {FIELD_TYPE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Field Name */}
            <div className="space-y-2">
              <Label>Field Name (Optional)</Label>
              <Input
                value={fieldName}
                onChange={(e) => setFieldName(e.target.value)}
                placeholder="e.g., vendor_name, total_amount"
              />
            </div>

            {/* Value */}
            <div className="space-y-2">
              <Label>Value *</Label>
              <Textarea
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Enter the corrected value"
                rows={2}
              />
            </div>

            {/* Correction Reason */}
            <div className="space-y-2">
              <Label>Reason for Correction (Optional)</Label>
              <Input
                value={correctionReason}
                onChange={(e) => setCorrectionReason(e.target.value)}
                placeholder="e.g., OCR error, wrong field detected"
              />
            </div>

            <Separator />

            {/* Bounding Box */}
            <Accordion type="single" collapsible>
              <AccordionItem value="bbox">
                <AccordionTrigger className="text-sm">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Bounding Box Coordinates
                    {editBoundingBox && (
                      <Badge variant="secondary" className="text-xs">Editing</Badge>
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-3 pt-2">
                  {!editBoundingBox && field && (
                    <Alert>
                      <AlertDescription className="text-xs">
                        Bounding box shows the field location on the receipt image.
                        Click &quot;Edit&quot; to modify coordinates.
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <Button
                      variant={editBoundingBox ? 'secondary' : 'outline'}
                      size="sm"
                      onClick={() => setEditBoundingBox(!editBoundingBox)}
                    >
                      {editBoundingBox ? 'Cancel Edit' : 'Edit Coordinates'}
                    </Button>
                    
                    {isCreating && (
                      <div className="flex items-center gap-2">
                        <Label className="text-xs">Page:</Label>
                        <Input
                          type="number"
                          min="1"
                          value={pageNumber}
                          onChange={(e) => setPageNumber(parseInt(e.target.value) || 1)}
                          className="w-16 h-8"
                        />
                      </div>
                    )}
                  </div>

                  {(editBoundingBox || isCreating) && (
                    <BoundingBoxEditor
                      value={boundingBox}
                      onChange={setBoundingBox}
                      isRatio={field?.bbox_unit === 'ratio' || !field}
                    />
                  )}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </TabsContent>

          <TabsContent value="history" className="mt-4">
            {isLoadingHistory ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : history.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No correction history</p>
                <p className="text-xs mt-1">This field has not been corrected yet.</p>
              </div>
            ) : (
              <ScrollArea className="h-[300px]">
                <div className="space-y-3 pr-4">
                  {history.map((entry) => (
                    <HistoryEntry key={entry.id} entry={entry} />
                  ))}
                </div>
              </ScrollArea>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex items-center justify-between sm:justify-between">
          <div>
            {field?.is_corrected && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRevert}
                disabled={isSubmitting}
              >
                <Undo2 className="h-4 w-4 mr-2" />
                Revert to Original
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !hasChanges}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {isCreating ? 'Create Field' : 'Save Correction'}
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default FieldCorrectionModal;
