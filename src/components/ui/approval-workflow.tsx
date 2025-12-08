'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  IconCheck,
  IconX,
  IconMessage,
  IconClock,
  IconUser,
  IconSignature,
  IconHistory,
  IconAlertCircle,
} from '@tabler/icons-react';
import { cn } from '@/lib/utils';
import { SignaturePad, useSignaturePad } from '@/components/ui/signature-pad';

// Types
export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'on_hold' | 'cancelled';

export interface ApprovalHistoryItem {
  id: string;
  action: 'submitted' | 'approved' | 'rejected' | 'commented' | 'requested_info' | 'cancelled';
  user: {
    id: string;
    name: string;
    email: string;
    avatar_url?: string;
    role?: string;
  };
  comment?: string;
  signature_data?: string;
  timestamp: string;
}

export interface ApprovalWorkflowProps {
  title: string;
  description?: string;
  status: ApprovalStatus;
  history: ApprovalHistoryItem[];
  currentApprover?: {
    id: string;
    name: string;
    email: string;
    role?: string;
  };
  requireSignature?: boolean;
  onApprove?: (data: { comment?: string; signature?: string }) => void;
  onReject?: (data: { comment: string }) => void;
  onRequestInfo?: (data: { comment: string }) => void;
  onAddComment?: (comment: string) => void;
  disabled?: boolean;
  className?: string;
}

// Status configuration
const statusConfig: Record<ApprovalStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: React.ReactNode }> = {
  pending: { label: 'Pending Approval', variant: 'secondary', icon: <IconClock className="h-3 w-3" /> },
  approved: { label: 'Approved', variant: 'default', icon: <IconCheck className="h-3 w-3" /> },
  rejected: { label: 'Rejected', variant: 'destructive', icon: <IconX className="h-3 w-3" /> },
  on_hold: { label: 'On Hold', variant: 'outline', icon: <IconAlertCircle className="h-3 w-3" /> },
  cancelled: { label: 'Cancelled', variant: 'outline', icon: <IconX className="h-3 w-3" /> },
};

// Action icons for history
const actionIcons: Record<ApprovalHistoryItem['action'], React.ReactNode> = {
  submitted: <IconClock className="h-4 w-4 text-blue-500" />,
  approved: <IconCheck className="h-4 w-4 text-green-500" />,
  rejected: <IconX className="h-4 w-4 text-red-500" />,
  commented: <IconMessage className="h-4 w-4 text-gray-500" />,
  requested_info: <IconAlertCircle className="h-4 w-4 text-yellow-500" />,
  cancelled: <IconX className="h-4 w-4 text-gray-500" />,
};

// Format timestamp - returns static format for SSR, relative time on client
function formatTimestamp(timestamp: string, isClient: boolean): string {
  const date = new Date(timestamp);
  
  // On server, return static ISO format to avoid hydration mismatch
  if (!isClient) {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
  
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function ApprovalWorkflow({
  title,
  description,
  status,
  history,
  currentApprover,
  requireSignature = false,
  onApprove,
  onReject,
  onRequestInfo,
  onAddComment,
  disabled = false,
  className,
}: ApprovalWorkflowProps) {
  const [comment, setComment] = useState('');
  const [showSignature, setShowSignature] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'request_info' | null>(null);
  const { signatureData, isSigned, handleSave, handleClear } = useSignaturePad();

  const isPending = status === 'pending';
  const config = statusConfig[status];

  const handleApproveClick = () => {
    if (requireSignature) {
      setActionType('approve');
      setShowSignature(true);
    } else {
      onApprove?.({ comment: comment || undefined });
      setComment('');
    }
  };

  const handleRejectClick = () => {
    setActionType('reject');
  };

  const handleRequestInfoClick = () => {
    setActionType('request_info');
  };

  const confirmAction = () => {
    if (actionType === 'approve') {
      onApprove?.({ comment: comment || undefined, signature: signatureData || undefined });
    } else if (actionType === 'reject') {
      if (comment.trim()) {
        onReject?.({ comment });
      }
    } else if (actionType === 'request_info') {
      if (comment.trim()) {
        onRequestInfo?.({ comment });
      }
    }
    setComment('');
    setActionType(null);
    setShowSignature(false);
    handleClear();
  };

  const handleCommentSubmit = () => {
    if (comment.trim() && onAddComment) {
      onAddComment(comment);
      setComment('');
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          <Badge variant={config.variant} className="gap-1">
            {config.icon}
            {config.label}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Current Approver */}
        {currentApprover && isPending && (
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            <IconUser className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Awaiting approval from</p>
              <p className="text-sm text-muted-foreground">
                {currentApprover.name}
                {currentApprover.role && ` (${currentApprover.role})`}
              </p>
            </div>
          </div>
        )}

        {/* Approval History */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <IconHistory className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Approval History</span>
          </div>
          <ScrollArea className="h-[200px]">
            <div className="space-y-4">
              {history.map((item, index) => (
                <div key={item.id} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="rounded-full bg-muted p-1.5">
                      {actionIcons[item.action]}
                    </div>
                    {index < history.length - 1 && (
                      <div className="w-px flex-1 bg-border my-1" />
                    )}
                  </div>
                  <div className="flex-1 pb-4">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={item.user.avatar_url} />
                        <AvatarFallback>{item.user.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">{item.user.name}</span>
                      <span className="text-xs text-muted-foreground">{formatTimestamp(item.timestamp)}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 capitalize">
                      {item.action.replace('_', ' ')}
                    </p>
                    {item.comment && (
                      <p className="text-sm mt-1 bg-muted/50 rounded p-2">{item.comment}</p>
                    )}
                    {item.signature_data && (
                      <div className="mt-2">
                        <img
                          src={item.signature_data}
                          alt="Signature"
                          className="h-12 border rounded bg-white"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Add Comment */}
        {isPending && onAddComment && (
          <div className="space-y-2">
            <Separator />
            <div className="flex items-center gap-2">
              <IconMessage className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Add Comment</span>
            </div>
            <div className="flex gap-2">
              <Textarea
                placeholder="Add a comment..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="min-h-[60px]"
                disabled={disabled}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleCommentSubmit}
                disabled={disabled || !comment.trim()}
              >
                <IconMessage className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>

      {/* Action Buttons */}
      {isPending && (onApprove || onReject || onRequestInfo) && (
        <CardFooter className="flex flex-wrap gap-2 justify-end border-t pt-4">
          {onRequestInfo && (
            <Dialog open={actionType === 'request_info'} onOpenChange={(open) => !open && setActionType(null)}>
              <DialogTrigger asChild>
                <Button variant="outline" disabled={disabled} onClick={handleRequestInfoClick}>
                  <IconAlertCircle className="h-4 w-4 mr-1" />
                  Request Info
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Request Additional Information</DialogTitle>
                  <DialogDescription>
                    Specify what additional information is needed before approval.
                  </DialogDescription>
                </DialogHeader>
                <Textarea
                  placeholder="What information do you need?"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="min-h-[100px]"
                />
                <DialogFooter>
                  <Button variant="outline" onClick={() => setActionType(null)}>Cancel</Button>
                  <Button onClick={confirmAction} disabled={!comment.trim()}>Send Request</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}

          {onReject && (
            <Dialog open={actionType === 'reject'} onOpenChange={(open) => !open && setActionType(null)}>
              <DialogTrigger asChild>
                <Button variant="destructive" disabled={disabled} onClick={handleRejectClick}>
                  <IconX className="h-4 w-4 mr-1" />
                  Reject
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Reject Request</DialogTitle>
                  <DialogDescription>
                    Please provide a reason for rejecting this request.
                  </DialogDescription>
                </DialogHeader>
                <Textarea
                  placeholder="Reason for rejection (required)"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="min-h-[100px]"
                />
                <DialogFooter>
                  <Button variant="outline" onClick={() => setActionType(null)}>Cancel</Button>
                  <Button variant="destructive" onClick={confirmAction} disabled={!comment.trim()}>
                    Confirm Rejection
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}

          {onApprove && (
            <Dialog open={showSignature} onOpenChange={(open) => !open && setShowSignature(false)}>
              <Button disabled={disabled} onClick={handleApproveClick}>
                {requireSignature && <IconSignature className="h-4 w-4 mr-1" />}
                <IconCheck className="h-4 w-4 mr-1" />
                Approve
              </Button>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Sign to Approve</DialogTitle>
                  <DialogDescription>
                    Please sign below to confirm your approval.
                  </DialogDescription>
                </DialogHeader>
                <Textarea
                  placeholder="Add a comment (optional)"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="min-h-[60px] mb-4"
                />
                <SignaturePad
                  onSave={handleSave}
                  onClear={handleClear}
                  showButtons={false}
                  title="Your Signature"
                  description="Sign in the box below"
                />
                <DialogFooter className="mt-4">
                  <Button variant="outline" onClick={() => setShowSignature(false)}>Cancel</Button>
                  <Button onClick={confirmAction} disabled={!isSigned}>
                    <IconCheck className="h-4 w-4 mr-1" />
                    Approve with Signature
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </CardFooter>
      )}
    </Card>
  );
}

export default ApprovalWorkflow;
