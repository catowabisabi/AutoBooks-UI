'use client';

import { IconX, IconUpload, IconFile, IconFileSpreadsheet, IconPhoto, IconFileText, IconLoader2, IconCheck, IconAlertCircle } from '@tabler/icons-react';
import * as React from 'react';
import Dropzone, {
  type DropzoneProps,
  type FileRejection
} from 'react-dropzone';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useControllableState } from '@/hooks/use-controllable-state';
import { cn, formatBytes } from '@/lib/utils';

// File type configurations
const FILE_TYPE_CONFIG = {
  // Images
  'image/jpeg': { icon: IconPhoto, color: 'text-green-500', label: 'Image' },
  'image/png': { icon: IconPhoto, color: 'text-green-500', label: 'Image' },
  'image/gif': { icon: IconPhoto, color: 'text-green-500', label: 'Image' },
  'image/webp': { icon: IconPhoto, color: 'text-green-500', label: 'Image' },
  // PDF
  'application/pdf': { icon: IconFileText, color: 'text-red-500', label: 'PDF' },
  // Excel
  'application/vnd.ms-excel': { icon: IconFileSpreadsheet, color: 'text-emerald-600', label: 'Excel' },
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': { icon: IconFileSpreadsheet, color: 'text-emerald-600', label: 'Excel' },
  // Word
  'application/msword': { icon: IconFileText, color: 'text-blue-500', label: 'Word' },
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': { icon: IconFileText, color: 'text-blue-500', label: 'Word' },
  // Text
  'text/plain': { icon: IconFileText, color: 'text-gray-500', label: 'Text' },
  'text/csv': { icon: IconFileSpreadsheet, color: 'text-emerald-600', label: 'CSV' },
} as const;

// Default accepted file types for document processing
export const DOCUMENT_ACCEPT_TYPES: DropzoneProps['accept'] = {
  'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp', '.jfif'],
  'application/pdf': ['.pdf'],
  'application/vnd.ms-excel': ['.xls'],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
  'application/msword': ['.doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'text/plain': ['.txt'],
  'text/csv': ['.csv'],
};

export interface FileWithStatus extends File {
  id: string;
  preview?: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
  progress: number;
  error?: string;
  result?: {
    document_id?: string;
    query_result?: string;
  };
}

interface MultiFileUploaderProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: FileWithStatus[];
  onValueChange?: React.Dispatch<React.SetStateAction<FileWithStatus[]>>;
  onUpload?: (files: FileWithStatus[]) => Promise<void>;
  onUploadSingle?: (file: FileWithStatus, index: number) => Promise<{ document_id?: string; query_result?: string }>;
  accept?: DropzoneProps['accept'];
  maxSize?: DropzoneProps['maxSize'];
  maxFiles?: DropzoneProps['maxFiles'];
  disabled?: boolean;
  showUploadButton?: boolean;
  autoUpload?: boolean;
}

export function MultiFileUploader(props: MultiFileUploaderProps) {
  const {
    value: valueProp,
    onValueChange,
    onUpload,
    onUploadSingle,
    accept = DOCUMENT_ACCEPT_TYPES,
    maxSize = 1024 * 1024 * 50, // 50MB
    maxFiles = 20,
    disabled = false,
    showUploadButton = true,
    autoUpload = false,
    className,
    ...dropzoneProps
  } = props;

  const [files, setFiles] = useControllableState<FileWithStatus[]>({
    prop: valueProp,
    onChange: onValueChange,
    defaultProp: [],
  });

  const [isUploading, setIsUploading] = React.useState(false);

  const onDrop = React.useCallback(
    (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
      if ((files?.length ?? 0) + acceptedFiles.length > maxFiles) {
        toast.error(`Cannot upload more than ${maxFiles} files / 最多只能上傳 ${maxFiles} 個檔案`);
        return;
      }

      const newFiles: FileWithStatus[] = acceptedFiles.map((file) => {
        const fileWithStatus = Object.assign(file, {
          id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
          status: 'pending' as const,
          progress: 0,
        });
        return fileWithStatus;
      });

      const updatedFiles = files ? [...files, ...newFiles] : newFiles;
      setFiles(updatedFiles);

      if (rejectedFiles.length > 0) {
        rejectedFiles.forEach(({ file, errors }) => {
          const errorMsg = errors.map(e => e.message).join(', ');
          toast.error(`${file.name}: ${errorMsg}`);
        });
      }

      // Auto upload if enabled
      if (autoUpload && newFiles.length > 0 && onUploadSingle) {
        handleUploadAll(updatedFiles);
      }
    },
    [files, maxFiles, setFiles, autoUpload, onUploadSingle]
  );

  const handleUploadAll = async (filesToUpload?: FileWithStatus[]) => {
    const targetFiles = filesToUpload || files;
    if (!targetFiles || targetFiles.length === 0) return;

    const pendingFiles = targetFiles.filter(f => f.status === 'pending');
    if (pendingFiles.length === 0) {
      toast.info('No pending files to upload / 沒有待上傳的檔案');
      return;
    }

    setIsUploading(true);

    if (onUpload) {
      try {
        await onUpload(pendingFiles);
      } catch (error) {
        console.error('Bulk upload error:', error);
      }
    } else if (onUploadSingle) {
      // Upload files one by one
      for (let i = 0; i < pendingFiles.length; i++) {
        const file = pendingFiles[i];
        const fileIndex = targetFiles.findIndex(f => f.id === file.id);

        // Update status to uploading
        setFiles(prev => prev?.map((f, idx) => 
          f.id === file.id ? { ...f, status: 'uploading' as const, progress: 0 } : f
        ) || []);

        try {
          // Simulate progress
          const progressInterval = setInterval(() => {
            setFiles(prev => prev?.map(f => 
              f.id === file.id && f.status === 'uploading' 
                ? { ...f, progress: Math.min(f.progress + 10, 90) } 
                : f
            ) || []);
          }, 200);

          const result = await onUploadSingle(file, fileIndex);

          clearInterval(progressInterval);

          // Update status to success
          setFiles(prev => prev?.map(f => 
            f.id === file.id 
              ? { ...f, status: 'success' as const, progress: 100, result } 
              : f
          ) || []);

          toast.success(`${file.name} uploaded successfully / 上傳成功`);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Upload failed';
          
          // Update status to error
          setFiles(prev => prev?.map(f => 
            f.id === file.id 
              ? { ...f, status: 'error' as const, progress: 0, error: errorMessage } 
              : f
          ) || []);

          toast.error(`${file.name}: ${errorMessage}`);
        }
      }
    }

    setIsUploading(false);
  };

  const onRemove = (fileId: string) => {
    if (!files) return;
    const fileToRemove = files.find(f => f.id === fileId);
    if (fileToRemove?.preview) {
      URL.revokeObjectURL(fileToRemove.preview);
    }
    const newFiles = files.filter(f => f.id !== fileId);
    setFiles(newFiles);
    onValueChange?.(newFiles);
  };

  const onRetry = async (fileId: string) => {
    if (!files || !onUploadSingle) return;
    const file = files.find(f => f.id === fileId);
    if (!file) return;

    const fileIndex = files.findIndex(f => f.id === fileId);

    // Reset status to pending then upload
    setFiles(prev => prev?.map(f => 
      f.id === fileId ? { ...f, status: 'pending' as const, progress: 0, error: undefined } : f
    ) || []);

    // Wait for state update then upload
    setTimeout(() => {
      handleUploadAll();
    }, 100);
  };

  const clearCompleted = () => {
    if (!files) return;
    const remainingFiles = files.filter(f => f.status !== 'success');
    setFiles(remainingFiles);
  };

  const clearAll = () => {
    if (!files) return;
    files.forEach(file => {
      if (file.preview) {
        URL.revokeObjectURL(file.preview);
      }
    });
    setFiles([]);
  };

  // Revoke preview urls when component unmounts
  React.useEffect(() => {
    return () => {
      if (!files) return;
      files.forEach((file) => {
        if (file.preview) {
          URL.revokeObjectURL(file.preview);
        }
      });
    };
  }, []);

  const isDisabled = disabled || isUploading || (files?.length ?? 0) >= maxFiles;
  const pendingCount = files?.filter(f => f.status === 'pending').length ?? 0;
  const successCount = files?.filter(f => f.status === 'success').length ?? 0;
  const errorCount = files?.filter(f => f.status === 'error').length ?? 0;

  return (
    <div className={cn('relative flex flex-col gap-4', className)}>
      <Dropzone
        onDrop={onDrop}
        accept={accept}
        maxSize={maxSize}
        maxFiles={maxFiles}
        multiple={true}
        disabled={isDisabled}
      >
        {({ getRootProps, getInputProps, isDragActive }) => (
          <div
            {...getRootProps()}
            className={cn(
              'group border-muted-foreground/25 hover:bg-muted/25 relative grid min-h-[200px] w-full cursor-pointer place-items-center rounded-lg border-2 border-dashed px-5 py-6 text-center transition',
              'ring-offset-background focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden',
              isDragActive && 'border-primary bg-primary/5',
              isDisabled && 'pointer-events-none opacity-60'
            )}
            {...dropzoneProps}
          >
            <input {...getInputProps()} />
            {isDragActive ? (
              <div className='flex flex-col items-center justify-center gap-4'>
                <div className='rounded-full border-2 border-dashed border-primary p-4'>
                  <IconUpload className='text-primary size-8' aria-hidden='true' />
                </div>
                <div className='space-y-1'>
                  <p className='text-primary font-semibold'>Drop files here / 放開以上傳檔案</p>
                </div>
              </div>
            ) : (
              <div className='flex flex-col items-center justify-center gap-4'>
                <div className='rounded-full border border-dashed p-4'>
                  <IconUpload className='text-muted-foreground size-8' aria-hidden='true' />
                </div>
                <div className='space-y-1'>
                  <p className='text-muted-foreground font-medium'>
                    Drag & drop files here, or click to select / 拖放檔案或點擊選擇
                  </p>
                  <p className='text-muted-foreground/70 text-sm'>
                    Support: PDF, Excel, Word, Images, CSV, TXT
                  </p>
                  <p className='text-muted-foreground/70 text-sm'>
                    Max {maxFiles} files, up to {formatBytes(maxSize)} each
                  </p>
                </div>
                <div className='flex flex-wrap justify-center gap-2 mt-2'>
                  <Badge variant='outline' className='text-xs'>
                    <IconFileText className='h-3 w-3 mr-1 text-red-500' />
                    PDF
                  </Badge>
                  <Badge variant='outline' className='text-xs'>
                    <IconFileSpreadsheet className='h-3 w-3 mr-1 text-emerald-600' />
                    Excel
                  </Badge>
                  <Badge variant='outline' className='text-xs'>
                    <IconPhoto className='h-3 w-3 mr-1 text-green-500' />
                    Images
                  </Badge>
                  <Badge variant='outline' className='text-xs'>
                    <IconFileText className='h-3 w-3 mr-1 text-blue-500' />
                    Word
                  </Badge>
                  <Badge variant='outline' className='text-xs'>
                    <IconFileSpreadsheet className='h-3 w-3 mr-1 text-emerald-600' />
                    CSV
                  </Badge>
                </div>
              </div>
            )}
          </div>
        )}
      </Dropzone>

      {/* File list */}
      {files && files.length > 0 && (
        <div className='space-y-3'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <span className='text-sm font-medium'>
                Files ({files.length})
              </span>
              {pendingCount > 0 && (
                <Badge variant='secondary'>{pendingCount} pending</Badge>
              )}
              {successCount > 0 && (
                <Badge variant='default' className='bg-green-500'>{successCount} uploaded</Badge>
              )}
              {errorCount > 0 && (
                <Badge variant='destructive'>{errorCount} failed</Badge>
              )}
            </div>
            <div className='flex gap-2'>
              {successCount > 0 && (
                <Button variant='ghost' size='sm' onClick={clearCompleted}>
                  Clear completed
                </Button>
              )}
              <Button variant='ghost' size='sm' onClick={clearAll}>
                Clear all
              </Button>
            </div>
          </div>

          <ScrollArea className='max-h-[300px]'>
            <div className='space-y-2 pr-3'>
              {files.map((file) => (
                <FileCard
                  key={file.id}
                  file={file}
                  onRemove={() => onRemove(file.id)}
                  onRetry={() => onRetry(file.id)}
                />
              ))}
            </div>
          </ScrollArea>

          {showUploadButton && pendingCount > 0 && (
            <Button 
              onClick={() => handleUploadAll()} 
              disabled={isUploading || pendingCount === 0}
              className='w-full'
            >
              {isUploading ? (
                <>
                  <IconLoader2 className='h-4 w-4 mr-2 animate-spin' />
                  Uploading...
                </>
              ) : (
                <>
                  <IconUpload className='h-4 w-4 mr-2' />
                  Upload {pendingCount} file{pendingCount > 1 ? 's' : ''} / 上傳 {pendingCount} 個檔案
                </>
              )}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

interface FileCardProps {
  file: FileWithStatus;
  onRemove: () => void;
  onRetry: () => void;
}

function FileCard({ file, onRemove, onRetry }: FileCardProps) {
  const fileConfig = FILE_TYPE_CONFIG[file.type as keyof typeof FILE_TYPE_CONFIG] || {
    icon: IconFile,
    color: 'text-gray-500',
    label: 'File',
  };
  const Icon = fileConfig.icon;

  return (
    <div className={cn(
      'flex items-center gap-3 p-3 rounded-lg border',
      file.status === 'error' && 'border-red-200 bg-red-50 dark:bg-red-950/20',
      file.status === 'success' && 'border-green-200 bg-green-50 dark:bg-green-950/20',
      file.status === 'uploading' && 'border-blue-200 bg-blue-50 dark:bg-blue-950/20',
    )}>
      {/* Icon */}
      <div className={cn('shrink-0', fileConfig.color)}>
        <Icon className='h-8 w-8' />
      </div>

      {/* File info */}
      <div className='flex-1 min-w-0'>
        <p className='text-sm font-medium truncate'>{file.name}</p>
        <div className='flex items-center gap-2 text-xs text-muted-foreground'>
          <span>{formatBytes(file.size)}</span>
          <span>•</span>
          <Badge variant='outline' className='text-xs px-1.5 py-0'>
            {fileConfig.label}
          </Badge>
          {file.status === 'success' && file.result?.document_id && (
            <>
              <span>•</span>
              <span className='text-green-600'>ID: {file.result.document_id}</span>
            </>
          )}
        </div>

        {/* Progress bar */}
        {file.status === 'uploading' && (
          <Progress value={file.progress} className='h-1 mt-2' />
        )}

        {/* Error message */}
        {file.status === 'error' && file.error && (
          <p className='text-xs text-red-500 mt-1'>{file.error}</p>
        )}
      </div>

      {/* Status indicator and actions */}
      <div className='flex items-center gap-2 shrink-0'>
        {file.status === 'uploading' && (
          <IconLoader2 className='h-5 w-5 animate-spin text-blue-500' />
        )}
        {file.status === 'success' && (
          <IconCheck className='h-5 w-5 text-green-500' />
        )}
        {file.status === 'error' && (
          <>
            <IconAlertCircle className='h-5 w-5 text-red-500' />
            <Button
              type='button'
              variant='ghost'
              size='sm'
              onClick={onRetry}
              className='h-7 px-2 text-xs'
            >
              Retry
            </Button>
          </>
        )}
        <Button
          type='button'
          variant='ghost'
          size='icon'
          onClick={onRemove}
          disabled={file.status === 'uploading'}
          className='h-8 w-8'
        >
          <IconX className='h-4 w-4 text-muted-foreground' />
          <span className='sr-only'>Remove</span>
        </Button>
      </div>
    </div>
  );
}
