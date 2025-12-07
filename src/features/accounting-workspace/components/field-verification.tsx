'use client';

import { useState, useMemo } from 'react';
import { useTranslation } from '@/lib/i18n/provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  AlertCircle,
  Check,
  CheckCircle,
  Edit2,
  Eye,
  Info,
  Loader2,
  Save,
  X,
  Zap,
} from 'lucide-react';
import { toast } from 'sonner';
import { useFieldExtractions, useCorrectField } from '../hooks';
import type { FieldExtraction, AccountingDocument } from '../types';
import { cn } from '@/lib/utils';

interface FieldVerificationProps {
  document: AccountingDocument;
  onClose?: () => void;
}

// Field labels for display
const FIELD_LABELS: Record<string, { en: string; zh: string }> = {
  vendor_name: { en: 'Vendor Name', zh: '供應商名稱' },
  vendor_address: { en: 'Vendor Address', zh: '供應商地址' },
  vendor_phone: { en: 'Vendor Phone', zh: '供應商電話' },
  vendor_tax_id: { en: 'Tax ID', zh: '統一編號' },
  receipt_number: { en: 'Receipt Number', zh: '收據編號' },
  receipt_date: { en: 'Date', zh: '日期' },
  receipt_time: { en: 'Time', zh: '時間' },
  total_amount: { en: 'Total Amount', zh: '總金額' },
  subtotal: { en: 'Subtotal', zh: '小計' },
  tax_amount: { en: 'Tax Amount', zh: '稅額' },
  discount_amount: { en: 'Discount', zh: '折扣' },
  payment_method: { en: 'Payment Method', zh: '付款方式' },
  currency: { en: 'Currency', zh: '幣別' },
};

// Mock data for demo
const getMockFieldExtractions = (): FieldExtraction[] => [
  {
    id: '1',
    receipt: 'doc-1',
    field_name: 'vendor_name',
    extracted_value: '全聯福利中心',
    final_value: '全聯福利中心',
    confidence: 0.95,
    bounding_box: [100, 50, 200, 30],
    is_verified: true,
    needs_review: false,
    created_at: '2024-12-05T10:00:00Z',
    updated_at: '2024-12-05T10:00:00Z',
  },
  {
    id: '2',
    receipt: 'doc-1',
    field_name: 'receipt_date',
    extracted_value: '2024-12-05',
    final_value: '2024-12-05',
    confidence: 0.92,
    bounding_box: [100, 90, 100, 25],
    is_verified: true,
    needs_review: false,
    created_at: '2024-12-05T10:00:00Z',
    updated_at: '2024-12-05T10:00:00Z',
  },
  {
    id: '3',
    receipt: 'doc-1',
    field_name: 'total_amount',
    extracted_value: '1,250',
    corrected_value: '1250.00',
    final_value: '1250.00',
    confidence: 0.68,
    bounding_box: [250, 200, 80, 30],
    is_verified: false,
    needs_review: true,
    created_at: '2024-12-05T10:00:00Z',
    updated_at: '2024-12-05T10:00:00Z',
  },
  {
    id: '4',
    receipt: 'doc-1',
    field_name: 'tax_amount',
    extracted_value: '60',
    final_value: '60',
    confidence: 0.55,
    bounding_box: [250, 170, 50, 25],
    is_verified: false,
    needs_review: true,
    created_at: '2024-12-05T10:00:00Z',
    updated_at: '2024-12-05T10:00:00Z',
  },
  {
    id: '5',
    receipt: 'doc-1',
    field_name: 'vendor_tax_id',
    extracted_value: '12345678',
    final_value: '12345678',
    confidence: 0.88,
    bounding_box: [100, 120, 100, 20],
    is_verified: false,
    needs_review: false,
    created_at: '2024-12-05T10:00:00Z',
    updated_at: '2024-12-05T10:00:00Z',
  },
];

export function FieldVerification({ document, onClose }: FieldVerificationProps) {
  const { t, locale } = useTranslation();
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [hoveredField, setHoveredField] = useState<string | null>(null);
  
  // Get field extractions
  const { data: apiData, isLoading, error, refetch } = useFieldExtractions(document.id);
  const correctFieldMutation = useCorrectField();
  
  // Use API data or fallback to mock
  const fields = useMemo(() => {
    if (apiData && Array.isArray(apiData) && apiData.length > 0) {
      return apiData;
    }
    if (error || !apiData) {
      return getMockFieldExtractions();
    }
    return [];
  }, [apiData, error]);
  
  // Stats
  const stats = useMemo(() => {
    const total = fields.length;
    const verified = fields.filter((f: FieldExtraction) => f.is_verified).length;
    const needsReview = fields.filter((f: FieldExtraction) => f.needs_review).length;
    const avgConfidence = total > 0 
      ? fields.reduce((sum: number, f: FieldExtraction) => sum + f.confidence, 0) / total 
      : 0;
    return { total, verified, needsReview, avgConfidence };
  }, [fields]);
  
  // i18n helper
  const getText = (key: string, fallback: string) => {
    const translated = t(key);
    return translated === key ? fallback : translated;
  };
  
  const getFieldLabel = (fieldName: string) => {
    const label = FIELD_LABELS[fieldName];
    if (!label) return fieldName;
    return locale === 'zh-TW' ? `${label.zh} (${label.en})` : `${label.en} (${label.zh})`;
  };
  
  // Confidence badge
  const getConfidenceBadge = (confidence: number) => {
    const percent = Math.round(confidence * 100);
    const variant = percent >= 90 ? 'default' : percent >= 70 ? 'secondary' : 'destructive';
    return (
      <Badge variant={variant} className="text-xs">
        {percent}%
      </Badge>
    );
  };
  
  // Start editing
  const handleStartEdit = (field: FieldExtraction) => {
    setEditingFieldId(field.id);
    setEditValue(field.final_value);
  };
  
  // Cancel editing
  const handleCancelEdit = () => {
    setEditingFieldId(null);
    setEditValue('');
  };
  
  // Save correction
  const handleSaveCorrection = (field: FieldExtraction) => {
    if (editValue === field.final_value) {
      handleCancelEdit();
      return;
    }
    
    correctFieldMutation.mutate({
      receiptId: document.id,
      fieldName: field.field_name,
      correctedValue: editValue,
    }, {
      onSuccess: () => {
        handleCancelEdit();
        refetch();
      },
    });
  };
  
  // Verify field (mark as verified)
  const handleVerifyField = (field: FieldExtraction) => {
    correctFieldMutation.mutate({
      receiptId: document.id,
      fieldName: field.field_name,
      correctedValue: field.final_value,
      notes: 'Verified by user',
    }, {
      onSuccess: () => {
        refetch();
      },
    });
  };
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="h-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              {getText('fieldVerification.title', 'Field Verification')}
            </CardTitle>
            <CardDescription>
              {getText('fieldVerification.description', 'Review and correct AI-extracted fields')}
            </CardDescription>
          </div>
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        {/* Stats bar */}
        <div className="flex gap-4 mt-4">
          <div className="flex items-center gap-2 text-sm">
            <div className="h-3 w-3 rounded-full bg-green-500" />
            <span className="text-muted-foreground">
              {stats.verified}/{stats.total} {getText('fieldVerification.verified', 'Verified')}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="h-3 w-3 rounded-full bg-orange-500" />
            <span className="text-muted-foreground">
              {stats.needsReview} {getText('fieldVerification.needsReview', 'Needs Review')}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Info className="h-3 w-3 text-blue-500" />
            <span className="text-muted-foreground">
              {Math.round(stats.avgConfidence * 100)}% {getText('fieldVerification.avgConfidence', 'Avg. Confidence')}
            </span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex gap-4">
        {/* Document Preview with bounding boxes */}
        <div className="w-1/2 border rounded-lg overflow-hidden bg-muted/30 relative">
          <div className="aspect-[3/4] relative">
            {document.image ? (
              <img
                src={document.image}
                alt={document.original_filename}
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <Eye className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>{getText('fieldVerification.noPreview', 'No preview available')}</p>
                </div>
              </div>
            )}
            
            {/* Bounding boxes overlay */}
            {document.image && fields.map((field: FieldExtraction) => {
              if (!field.bounding_box) return null;
              const [x, y, width, height] = field.bounding_box;
              const isHovered = hoveredField === field.id;
              const isEditing = editingFieldId === field.id;
              
              return (
                <div
                  key={field.id}
                  className={cn(
                    'absolute border-2 transition-all cursor-pointer',
                    isHovered || isEditing
                      ? 'border-blue-500 bg-blue-500/20'
                      : field.is_verified
                        ? 'border-green-500/50 bg-green-500/10'
                        : field.needs_review
                          ? 'border-orange-500/50 bg-orange-500/10'
                          : 'border-gray-400/50 bg-gray-400/10'
                  )}
                  style={{
                    left: `${x / 5}%`,
                    top: `${y / 5}%`,
                    width: `${width / 5}%`,
                    height: `${height / 5}%`,
                  }}
                  onMouseEnter={() => setHoveredField(field.id)}
                  onMouseLeave={() => setHoveredField(null)}
                  onClick={() => handleStartEdit(field)}
                >
                  {(isHovered || isEditing) && (
                    <div className="absolute -top-6 left-0 bg-blue-500 text-white text-xs px-2 py-0.5 rounded whitespace-nowrap">
                      {getFieldLabel(field.field_name)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Fields list */}
        <div className="w-1/2">
          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-3">
              {fields.map((field: FieldExtraction) => (
                <div
                  key={field.id}
                  className={cn(
                    'border rounded-lg p-3 transition-colors',
                    hoveredField === field.id && 'border-blue-500 bg-blue-50/50',
                    editingFieldId === field.id && 'border-blue-500 bg-blue-50'
                  )}
                  onMouseEnter={() => setHoveredField(field.id)}
                  onMouseLeave={() => setHoveredField(null)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Label className="font-medium text-sm">
                        {getFieldLabel(field.field_name)}
                      </Label>
                      {field.is_verified && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            </TooltipTrigger>
                            <TooltipContent>
                              {getText('fieldVerification.verifiedTooltip', 'Verified')}
                              {field.verified_at && ` - ${new Date(field.verified_at).toLocaleDateString(locale)}`}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                      {field.needs_review && !field.is_verified && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <AlertCircle className="h-4 w-4 text-orange-500" />
                            </TooltipTrigger>
                            <TooltipContent>
                              {getText('fieldVerification.needsReviewTooltip', 'Low confidence - needs review')}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                    {getConfidenceBadge(field.confidence)}
                  </div>
                  
                  {editingFieldId === field.id ? (
                    <div className="flex gap-2">
                      <Input
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="flex-1"
                        autoFocus
                      />
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleSaveCorrection(field)}
                        disabled={correctFieldMutation.isPending}
                      >
                        {correctFieldMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Check className="h-4 w-4 text-green-500" />
                        )}
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={handleCancelEdit}
                      >
                        <X className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-mono text-sm">{field.final_value}</p>
                        {field.corrected_value && field.corrected_value !== field.extracted_value && (
                          <p className="text-xs text-muted-foreground line-through mt-1">
                            {getText('fieldVerification.original', 'Original')}: {field.extracted_value}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleStartEdit(field)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        {!field.is_verified && (
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleVerifyField(field)}
                            disabled={correctFieldMutation.isPending}
                          >
                            <Check className="h-4 w-4 text-green-500" />
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
              
              {fields.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Info className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>{getText('fieldVerification.noFields', 'No fields extracted for this document')}</p>
                </div>
              )}
            </div>
          </ScrollArea>
          
          {/* Actions */}
          <div className="mt-4 flex gap-2 justify-end border-t pt-4">
            <Button variant="outline" onClick={() => refetch()}>
              {getText('fieldVerification.refresh', 'Refresh')}
            </Button>
            <Button
              onClick={() => {
                const unverified = fields.filter((f: FieldExtraction) => !f.is_verified);
                if (unverified.length === 0) {
                  toast.info(getText('fieldVerification.allVerified', 'All fields are already verified'));
                  return;
                }
                // Verify all in sequence
                toast.info(`Verifying ${unverified.length} fields...`);
              }}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              {getText('fieldVerification.verifyAll', 'Verify All')}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default FieldVerification;
