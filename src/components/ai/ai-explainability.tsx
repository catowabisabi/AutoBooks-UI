/**
 * AI Explainability Components
 * ============================
 * Confidence scores, highlighting, explanations, and feedback system
 */

'use client';

import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  AlertCircle,
  CheckCircle,
  HelpCircle,
  Info,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Brain,
  Sparkles,
  AlertTriangle,
  Eye,
  Flag,
  Send,
  Loader2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// =================================================================
// Types
// =================================================================

export interface AIFieldConfidence {
  fieldName: string;
  fieldLabel: string;
  value: string | number | null;
  confidence: number; // 0-1
  reasoning?: string;
  alternatives?: Array<{ value: string; confidence: number }>;
  sourceHighlight?: {
    startIndex: number;
    endIndex: number;
    text: string;
  };
}

export interface AIClassification {
  label: string;
  confidence: number;
  reasoning: string;
  factors: Array<{
    factor: string;
    weight: number;
    impact: 'positive' | 'negative' | 'neutral';
  }>;
}

export interface AIFeedback {
  resultId: string;
  fieldName?: string;
  feedbackType: 'correct' | 'incorrect' | 'partial' | 'unsure';
  correctedValue?: string;
  comment?: string;
  metadata?: Record<string, any>;
}

// =================================================================
// Confidence Score Badge
// =================================================================

interface ConfidenceScoreProps {
  confidence: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  onClick?: () => void;
}

export function ConfidenceScore({ 
  confidence, 
  size = 'sm', 
  showLabel = true,
  onClick 
}: ConfidenceScoreProps) {
  const percentage = Math.round(confidence * 100);
  
  const getColorClass = () => {
    if (percentage >= 90) return 'bg-green-500 text-white';
    if (percentage >= 70) return 'bg-yellow-500 text-white';
    if (percentage >= 50) return 'bg-orange-500 text-white';
    return 'bg-red-500 text-white';
  };
  
  const getIcon = () => {
    if (percentage >= 90) return <CheckCircle className="h-3 w-3" />;
    if (percentage >= 70) return <Info className="h-3 w-3" />;
    return <AlertTriangle className="h-3 w-3" />;
  };
  
  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-sm px-2 py-1',
    lg: 'text-base px-3 py-1.5',
  };
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            className={cn(
              "gap-1 cursor-pointer transition-opacity hover:opacity-80",
              getColorClass(),
              sizeClasses[size]
            )}
            onClick={onClick}
          >
            {getIcon()}
            {showLabel && `${percentage}%`}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>AI Confidence: {percentage}%</p>
          <p className="text-xs text-muted-foreground">Click for explanation</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// =================================================================
// Extracted Field with Confidence
// =================================================================

interface ExtractedFieldProps {
  field: AIFieldConfidence;
  onFeedback?: (feedback: AIFeedback) => void;
  resultId: string;
  editable?: boolean;
}

export function ExtractedField({ 
  field, 
  onFeedback, 
  resultId,
  editable = false 
}: ExtractedFieldProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [editValue, setEditValue] = useState(String(field.value || ''));
  const [feedbackSent, setFeedbackSent] = useState<'correct' | 'incorrect' | null>(null);
  
  const isLowConfidence = field.confidence < 0.7;
  
  const handleFeedback = (type: 'correct' | 'incorrect') => {
    setFeedbackSent(type);
    onFeedback?.({
      resultId,
      fieldName: field.fieldName,
      feedbackType: type,
      correctedValue: type === 'incorrect' ? editValue : undefined,
    });
  };
  
  return (
    <div className={cn(
      "p-3 rounded-lg border transition-colors",
      isLowConfidence ? "bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800" : "bg-muted/30"
    )}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <Label className="text-xs text-muted-foreground">{field.fieldLabel}</Label>
            <ConfidenceScore 
              confidence={field.confidence} 
              onClick={() => setIsExpanded(!isExpanded)}
            />
            {isLowConfidence && (
              <Badge variant="outline" className="text-xs text-yellow-600 border-yellow-300">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Review
              </Badge>
            )}
          </div>
          
          {editable && isLowConfidence ? (
            <input
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="mt-1 w-full px-2 py-1 text-sm border rounded bg-background"
            />
          ) : (
            <p className="mt-1 font-medium">{field.value || '—'}</p>
          )}
        </div>
        
        {/* Feedback buttons */}
        {onFeedback && (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className={cn("h-7 w-7", feedbackSent === 'correct' && "text-green-500")}
              onClick={() => handleFeedback('correct')}
              disabled={feedbackSent !== null}
            >
              <ThumbsUp className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={cn("h-7 w-7", feedbackSent === 'incorrect' && "text-red-500")}
              onClick={() => handleFeedback('incorrect')}
              disabled={feedbackSent !== null}
            >
              <ThumbsDown className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>
      
      {/* Expandable explanation */}
      {isExpanded && (
        <div className="mt-3 pt-3 border-t space-y-2">
          {field.reasoning && (
            <div>
              <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                <Brain className="h-3 w-3" />
                AI Reasoning
              </p>
              <p className="text-sm mt-1">{field.reasoning}</p>
            </div>
          )}
          
          {field.alternatives && field.alternatives.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground">Alternative Values</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {field.alternatives.map((alt, i) => (
                  <Badge key={i} variant="outline" className="text-xs">
                    {alt.value} ({Math.round(alt.confidence * 100)}%)
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {field.sourceHighlight && (
            <div>
              <p className="text-xs font-medium text-muted-foreground">Source Text</p>
              <p className="text-sm mt-1 bg-yellow-100 dark:bg-yellow-900/30 px-2 py-1 rounded">
                "{field.sourceHighlight.text}"
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// =================================================================
// Low Confidence Zone Highlighter
// =================================================================

interface HighlightZone {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
  label: string;
  reasoning?: string;
}

interface LowConfidenceOverlayProps {
  zones: HighlightZone[];
  imageUrl?: string;
  width?: number;
  height?: number;
  onZoneClick?: (zone: HighlightZone) => void;
}

export function LowConfidenceOverlay({
  zones,
  imageUrl,
  width = 600,
  height = 400,
  onZoneClick,
}: LowConfidenceOverlayProps) {
  const [selectedZone, setSelectedZone] = useState<HighlightZone | null>(null);
  
  const getZoneColor = (confidence: number) => {
    if (confidence >= 0.9) return 'rgba(34, 197, 94, 0.3)'; // green
    if (confidence >= 0.7) return 'rgba(234, 179, 8, 0.3)'; // yellow
    if (confidence >= 0.5) return 'rgba(249, 115, 22, 0.4)'; // orange
    return 'rgba(239, 68, 68, 0.4)'; // red
  };
  
  const getBorderColor = (confidence: number) => {
    if (confidence >= 0.9) return '#22c55e';
    if (confidence >= 0.7) return '#eab308';
    if (confidence >= 0.5) return '#f97316';
    return '#ef4444';
  };
  
  return (
    <div className="relative inline-block">
      {imageUrl && (
        <img 
          src={imageUrl} 
          alt="Document" 
          style={{ width, height }}
          className="rounded-lg"
        />
      )}
      
      <svg 
        className="absolute top-0 left-0 pointer-events-none"
        width={width}
        height={height}
        style={{ zIndex: 10 }}
      >
        {zones.map((zone) => (
          <g key={zone.id}>
            <rect
              x={zone.x}
              y={zone.y}
              width={zone.width}
              height={zone.height}
              fill={getZoneColor(zone.confidence)}
              stroke={getBorderColor(zone.confidence)}
              strokeWidth={2}
              rx={4}
              className="cursor-pointer pointer-events-auto transition-opacity hover:opacity-80"
              onClick={() => {
                setSelectedZone(zone);
                onZoneClick?.(zone);
              }}
            />
          </g>
        ))}
      </svg>
      
      {/* Zone labels */}
      {zones.map((zone) => (
        <div
          key={`label-${zone.id}`}
          className="absolute text-xs font-medium pointer-events-none"
          style={{
            left: zone.x,
            top: zone.y - 20,
            color: getBorderColor(zone.confidence),
          }}
        >
          {zone.label} ({Math.round(zone.confidence * 100)}%)
        </div>
      ))}
      
      {/* Selected zone details */}
      {selectedZone && (
        <div 
          className="absolute bg-background border rounded-lg shadow-lg p-3 z-20"
          style={{
            left: Math.min(selectedZone.x, width - 200),
            top: selectedZone.y + selectedZone.height + 10,
            maxWidth: 250,
          }}
        >
          <div className="flex items-center justify-between">
            <span className="font-medium">{selectedZone.label}</span>
            <ConfidenceScore confidence={selectedZone.confidence} />
          </div>
          {selectedZone.reasoning && (
            <p className="text-xs text-muted-foreground mt-2">
              {selectedZone.reasoning}
            </p>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="mt-2 w-full"
            onClick={() => setSelectedZone(null)}
          >
            Close
          </Button>
        </div>
      )}
    </div>
  );
}

// =================================================================
// Classification Explanation Dialog
// =================================================================

interface ClassificationExplanationProps {
  classification: AIClassification;
  trigger?: React.ReactNode;
}

export function ClassificationExplanation({ 
  classification, 
  trigger 
}: ClassificationExplanationProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="gap-1">
            <HelpCircle className="h-3 w-3" />
            Why this classification?
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-500" />
            AI Classification Explanation
          </DialogTitle>
          <DialogDescription>
            Understanding why AI classified this item as "{classification.label}"
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Overall confidence */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <div>
              <p className="font-medium">{classification.label}</p>
              <p className="text-sm text-muted-foreground">Classification Result</p>
            </div>
            <ConfidenceScore confidence={classification.confidence} size="lg" />
          </div>
          
          {/* Reasoning */}
          <div>
            <h4 className="font-medium mb-2 flex items-center gap-1">
              <Sparkles className="h-4 w-4 text-yellow-500" />
              Reasoning
            </h4>
            <p className="text-sm text-muted-foreground">{classification.reasoning}</p>
          </div>
          
          {/* Contributing factors */}
          <div>
            <h4 className="font-medium mb-2 flex items-center gap-1">
              <Info className="h-4 w-4 text-blue-500" />
              Contributing Factors
            </h4>
            <div className="space-y-2">
              {classification.factors.map((factor, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    factor.impact === 'positive' && "bg-green-500",
                    factor.impact === 'negative' && "bg-red-500",
                    factor.impact === 'neutral' && "bg-gray-400"
                  )} />
                  <span className="flex-1 text-sm">{factor.factor}</span>
                  <Badge variant="outline" className="text-xs">
                    {factor.weight > 0 ? '+' : ''}{Math.round(factor.weight * 100)}%
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// =================================================================
// AI Feedback Form
// =================================================================

interface AIFeedbackFormProps {
  resultId: string;
  fieldName?: string;
  currentValue?: string;
  onSubmit: (feedback: AIFeedback) => Promise<void>;
  onClose?: () => void;
}

export function AIFeedbackForm({
  resultId,
  fieldName,
  currentValue,
  onSubmit,
  onClose,
}: AIFeedbackFormProps) {
  const [feedbackType, setFeedbackType] = useState<AIFeedback['feedbackType']>('correct');
  const [correctedValue, setCorrectedValue] = useState(currentValue || '');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onSubmit({
        resultId,
        fieldName,
        feedbackType,
        correctedValue: feedbackType === 'incorrect' ? correctedValue : undefined,
        comment: comment || undefined,
      });
      onClose?.();
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="space-y-4">
      <div>
        <Label className="text-sm font-medium">How accurate was this result?</Label>
        <div className="flex gap-2 mt-2">
          {(['correct', 'partial', 'incorrect', 'unsure'] as const).map((type) => (
            <Button
              key={type}
              variant={feedbackType === type ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFeedbackType(type)}
              className="capitalize"
            >
              {type}
            </Button>
          ))}
        </div>
      </div>
      
      {feedbackType === 'incorrect' && (
        <div>
          <Label htmlFor="correctedValue">Correct Value</Label>
          <input
            id="correctedValue"
            type="text"
            value={correctedValue}
            onChange={(e) => setCorrectedValue(e.target.value)}
            className="w-full mt-1 px-3 py-2 border rounded-md"
            placeholder="Enter the correct value"
          />
        </div>
      )}
      
      <div>
        <Label htmlFor="comment">Additional Comments (optional)</Label>
        <Textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Any additional feedback..."
          rows={3}
        />
      </div>
      
      <div className="flex justify-end gap-2">
        {onClose && (
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        )}
        <Button onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Send className="h-4 w-4 mr-2" />
          )}
          Submit Feedback
        </Button>
      </div>
    </div>
  );
}

// =================================================================
// AI Result Card with Full Explainability
// =================================================================

interface AIResultCardProps {
  title: string;
  resultId: string;
  fields: AIFieldConfidence[];
  classification?: AIClassification;
  onFeedback?: (feedback: AIFeedback) => Promise<void>;
  imageUrl?: string;
  highlightZones?: HighlightZone[];
}

export function AIResultCard({
  title,
  resultId,
  fields,
  classification,
  onFeedback,
  imageUrl,
  highlightZones,
}: AIResultCardProps) {
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  
  const lowConfidenceFields = fields.filter(f => f.confidence < 0.7);
  const overallConfidence = fields.reduce((acc, f) => acc + f.confidence, 0) / fields.length;
  
  const handleFieldFeedback = async (feedback: AIFeedback) => {
    await onFeedback?.(feedback);
  };
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-500" />
            <CardTitle className="text-base">{title}</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <ConfidenceScore confidence={overallConfidence} size="md" />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </div>
        <CardDescription className="flex items-center gap-2">
          {lowConfidenceFields.length > 0 && (
            <Badge variant="outline" className="text-yellow-600 border-yellow-300">
              <AlertTriangle className="h-3 w-3 mr-1" />
              {lowConfidenceFields.length} fields need review
            </Badge>
          )}
          {classification && (
            <ClassificationExplanation 
              classification={classification}
              trigger={
                <Badge variant="secondary" className="cursor-pointer">
                  <HelpCircle className="h-3 w-3 mr-1" />
                  {classification.label}
                </Badge>
              }
            />
          )}
        </CardDescription>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="space-y-4">
          {/* Document preview with highlights */}
          {imageUrl && highlightZones && (
            <div className="mb-4">
              <LowConfidenceOverlay
                zones={highlightZones}
                imageUrl={imageUrl}
              />
            </div>
          )}
          
          {/* Extracted fields */}
          <div className="space-y-2">
            {fields.map((field) => (
              <ExtractedField
                key={field.fieldName}
                field={field}
                resultId={resultId}
                onFeedback={handleFieldFeedback}
                editable={field.confidence < 0.7}
              />
            ))}
          </div>
        </CardContent>
      )}
      
      <CardFooter className="pt-0">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Eye className="h-3 w-3" />
            AI-extracted • Click fields for details
          </div>
          <Dialog open={showFeedbackForm} onOpenChange={setShowFeedbackForm}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1">
                <Flag className="h-3 w-3" />
                Report Issue
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Submit Feedback</DialogTitle>
                <DialogDescription>
                  Help improve AI accuracy by providing feedback
                </DialogDescription>
              </DialogHeader>
              {onFeedback && (
                <AIFeedbackForm
                  resultId={resultId}
                  onSubmit={onFeedback}
                  onClose={() => setShowFeedbackForm(false)}
                />
              )}
            </DialogContent>
          </Dialog>
        </div>
      </CardFooter>
    </Card>
  );
}

export default AIResultCard;
