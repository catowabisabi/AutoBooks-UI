// src/app/dashboard/documents/_components/node-config-panel.tsx
'use client';

import { useState, useEffect } from 'react';
import {
  X,
  Upload,
  File,
  Copy,
  CheckCircle,
  XCircle,
  Clock,
  FileSearch,
  Monitor,
  Download,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import type { WorkflowNode } from '@/lib/types';
import CodeEditor from './code-editor';

interface NodeConfigPanelProps {
  node: WorkflowNode;
  updateNodeData: (nodeId: string, data: any) => void;
  onClose: () => void;
}

export default function NodeConfigPanel({
  node,
  updateNodeData,
  onClose
}: NodeConfigPanelProps) {
  const [localData, setLocalData] = useState({ ...node.data });
  const [isDragOver, setIsDragOver] = useState(false);
  const [copied, setCopied] = useState(false);

  // Update local data when node data changes (for real-time updates)
  useEffect(() => {
    setLocalData({ ...node.data });
  }, [node.data]);

  const handleChange = (key: string, value: any) => {
    setLocalData((prev) => ({
      ...prev,
      [key]: value
    }));
    updateNodeData(node.id, { [key]: value });
  };

  const handleFileSelect = (file: File) => {
    // Check file type
    const allowedTypes = ['pdf', 'png', 'jpg', 'jpeg', 'gif', 'jfif'];
    const fileExtension = file.name.split('.').pop()?.toLowerCase();

    if (!fileExtension || !allowedTypes.includes(fileExtension)) {
      alert(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`);
      return;
    }

    handleChange('file', file);
    handleChange('fileName', file.name);
    handleChange('description', `File: ${file.name}`);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const removeFile = () => {
    handleChange('file', undefined);
    handleChange('fileName', undefined);
    handleChange('description', 'Upload document file');
  };

  // Helper function to safely get response data
  const getResponseData = () => {
    return localData.result || localData.query_result || localData.queryResult;
  };

  // Helper function to detect response type
  const detectResponseType = () => {
    const responseData = getResponseData();
    const queryType = localData.queryType || localData.query_type;

    if (!responseData) return 'NONE';

    // Check based on query type first
    if (queryType === 'TABLE_TO_EXCEL') return 'EXCEL';
    if (queryType === 'TRANSLATE') return 'HTML';

    // Check if it's an object with tables
    if (typeof responseData === 'object' && responseData.tables) {
      return 'EXCEL';
    }

    // Check content type for strings
    if (typeof responseData === 'string') {
      if (
        responseData.includes('<html>') ||
        responseData.includes('<table>') ||
        responseData.includes('<h1>')
      ) {
        return 'HTML';
      }
      // Check for CSV-like content
      if (
        responseData.includes(',') &&
        responseData.includes('\n') &&
        responseData.split('\n').length > 2
      ) {
        return 'CSV';
      }
    }

    return 'TEXT';
  };

  // Helper function to get text content for display
  const getDisplayText = () => {
    const responseData = getResponseData();
    if (!responseData) return '';

    if (typeof responseData === 'string') {
      return responseData;
    }

    if (typeof responseData === 'object') {
      // For table objects, return a summary
      if (responseData.tables) {
        return `Found ${responseData.tables.length} table(s). ${responseData.message || ''}`;
      }
      // For other objects, stringify
      return JSON.stringify(responseData, null, 2);
    }

    return String(responseData);
  };

  const copyToClipboard = async () => {
    const responseData = getResponseData();
    if (responseData) {
      try {
        // Convert object to string if needed
        const textToCopy =
          typeof responseData === 'string'
            ? responseData
            : JSON.stringify(responseData, null, 2);
        await navigator.clipboard.writeText(textToCopy);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy text: ', err);
      }
    }
  };

  const downloadResponse = () => {
    const responseData = getResponseData();
    const filename = localData.filename || localData.fileName || 'output';
    const responseType = detectResponseType();

    if (!responseData) return;

    switch (responseType) {
      case 'HTML':
        downloadAsHTML(responseData, filename);
        break;
      case 'EXCEL':
        downloadAsCSV(responseData, filename);
        break;
      case 'CSV':
        downloadAsCSV(responseData, filename);
        break;
      default:
        downloadAsText(responseData, filename);
        break;
    }
  };

  const downloadAsHTML = (content: any, filename: string) => {
    const htmlContent =
      typeof content === 'string' ? content : JSON.stringify(content, null, 2);

    // Create a complete HTML document
    const fullHtmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document - ${filename}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
            line-height: 1.6;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            color: #333;
        }
        table {
            border-collapse: collapse;
            width: 100%;
            margin: 20px 0;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 12px;
            text-align: left;
        }
        th {
            background-color: #f2f2f2;
            font-weight: bold;
        }
        h1, h2, h3 {
            color: #2c3e50;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #eee;
        }
        pre {
            background: #f5f5f5;
            padding: 20px;
            border-radius: 8px;
            overflow-x: auto;
            white-space: pre-wrap;
        }
    </style>
</head>
<body>
    <div class="header">
        <p><small>Generated from: ${filename}</small></p>
        <p><small>Date: ${new Date().toLocaleString()}</small></p>
    </div>
    ${htmlContent.includes('<html>') || htmlContent.includes('<div>') ? htmlContent : `<pre>${htmlContent}</pre>`}
</body>
</html>`;

    const blob = new Blob([fullHtmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename.replace(/\.[^/.]+$/, '')}-${Date.now()}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadAsCSV = (data: any, filename: string) => {
    let csvContent = '';

    if (typeof data === 'object' && data.tables) {
      // Handle structured table data
      data.tables.forEach((table: any, index: number) => {
        if (index > 0) csvContent += '\n\n';

        // Add table title if available
        if (table.title) {
          csvContent += `${table.title}\n`;
        } else {
          csvContent += `Table ${index + 1}\n`;
        }

        // Add headers - check for both 'columns' and 'headers' properties
        const headers = table.columns || table.headers;
        if (headers && headers.length > 0) {
          csvContent +=
            headers.map((header: any) => `"${header}"`).join(',') + '\n';
        }

        // Add rows
        if (table.rows && table.rows.length > 0) {
          table.rows.forEach((row: any[]) => {
            csvContent +=
              row
                .map((cell: any) => `"${String(cell).replace(/"/g, '""')}"`)
                .join(',') + '\n';
          });
        }
      });
    } else if (typeof data === 'string') {
      csvContent = data;
    } else {
      // For other objects, convert to CSV format
      csvContent = JSON.stringify(data, null, 2);
    }

    // Ensure we have content
    if (!csvContent.trim()) {
      csvContent = 'No data available\n';
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename.replace(/\.[^/.]+$/, '')}-${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadAsText = (content: any, filename: string) => {
    const textContent =
      typeof content === 'string' ? content : JSON.stringify(content, null, 2);
    const blob = new Blob([textContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename.replace(/\.[^/.]+$/, '')}-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'processing':
        return <Clock className='h-4 w-4 animate-spin text-yellow-500' />;
      case 'completed':
        return <CheckCircle className='h-4 w-4 text-green-500' />;
      case 'error':
        return <XCircle className='h-4 w-4 text-red-500' />;
      default:
        return null;
    }
  };

  const renderInputFields = () => {
    switch (node.type) {
      case 'input':
        return (
          <div className='space-y-3'>
            <Label>File Upload</Label>
            {localData.file ? (
              <div className='rounded-md border border-green-200 bg-green-50 p-3 dark:border-green-800 dark:bg-green-950/20'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center'>
                    <File className='mr-2 h-4 w-4 text-green-600 dark:text-green-400' />
                    <div>
                      <div className='text-sm font-medium text-green-800 dark:text-green-200'>
                        {localData.fileName}
                      </div>
                      <div className='text-xs text-green-600 dark:text-green-400'>
                        {localData.file
                          ? (localData.file.size / 1024 / 1024).toFixed(2) +
                            ' MB'
                          : ''}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={removeFile}
                    className='h-6 w-6 p-0 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-200'
                  >
                    <X className='h-3 w-3' />
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div
                  className={`cursor-pointer rounded-md border-2 border-dashed p-6 text-center transition-colors ${
                    isDragOver
                      ? 'border-blue-400 bg-blue-50 dark:bg-blue-950/20'
                      : 'border-gray-300 hover:border-blue-300 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800'
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => {
                    const fileInput = document.getElementById(
                      'fileUploadInput'
                    ) as HTMLInputElement;
                    fileInput?.click();
                  }}
                >
                  <Upload className='mx-auto mb-2 h-8 w-8 text-gray-400' />
                  <div className='text-sm text-gray-600 dark:text-gray-400'>
                    <div>Drop a file here or click to browse</div>
                    <div className='mt-1 text-xs text-gray-500'>
                      PDF, PNG, JPG, JPEG, GIF, JFIF (Max 50MB)
                    </div>
                  </div>
                </div>
                <input
                  id='fileUploadInput'
                  type='file'
                  style={{ display: 'none' }}
                  accept='.pdf,.png,.jpg,.jpeg,.gif,.jfif'
                  onChange={handleFileUpload}
                />

                {/* Alternative Button Upload */}
                <div className='mt-2'>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => {
                      const fileInput = document.getElementById(
                        'fileUploadInput'
                      ) as HTMLInputElement;
                      fileInput?.click();
                    }}
                    className='w-full'
                  >
                    <Upload className='mr-2 h-4 w-4' />
                    Browse Files
                  </Button>
                </div>
              </>
            )}
          </div>
        );

      case 'process':
        return (
          <div className='space-y-4'>
            {/* Document Query Header */}
            <div className='flex items-center space-x-2 rounded-md border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-950/20'>
              <FileSearch className='h-5 w-5 text-blue-600 dark:text-blue-400' />
              <div>
                <h3 className='text-sm font-medium text-blue-800 dark:text-blue-200'>
                  Document Query
                </h3>
                <p className='text-xs text-blue-600 dark:text-blue-400'>
                  Ask questions about your document content
                </p>
              </div>
            </div>

            {/* Query Input */}
            <div className='space-y-3'>
              <Label htmlFor='query' className='text-sm font-medium'>
                Document Query
              </Label>
              <Textarea
                id='query'
                value={localData.query || ''}
                onChange={(e) => {
                  const queryValue = e.target.value;
                  handleChange('query', queryValue);
                  handleChange(
                    'description',
                    queryValue
                      ? 'Document query configured'
                      : 'Configure document query'
                  );
                  // Reset status when query changes
                  if (localData.status && localData.status !== 'idle') {
                    handleChange('status', 'idle');
                  }
                }}
                className='min-h-[120px] resize-none'
                placeholder='Enter your question about the document here...

Examples:
• What is the main topic of this document?
• Summarize the key points in bullet format
• Extract all dates and events mentioned
• What are the conclusions or recommendations?'
              />

              {/* Character count */}
              <div className='text-muted-foreground flex justify-between text-xs'>
                <span>Ask specific questions to get the best results</span>
                <span>{localData.query?.length || 0} characters</span>
              </div>
            </div>

            {/* Query Status */}
            {localData.status && localData.status !== 'idle' && (
              <div className='space-y-2'>
                <div className='flex items-center space-x-2 text-sm'>
                  {getStatusIcon(localData.status)}
                  <span
                    className={
                      localData.status === 'processing'
                        ? 'text-yellow-600 dark:text-yellow-400'
                        : localData.status === 'completed'
                          ? 'text-green-600 dark:text-green-400'
                          : localData.status === 'error'
                            ? 'text-red-600 dark:text-red-400'
                            : 'text-gray-600 dark:text-gray-400'
                    }
                  >
                    Status:{' '}
                    {localData.status.charAt(0).toUpperCase() +
                      localData.status.slice(1)}
                  </span>
                </div>

                {localData.status === 'processing' && (
                  <div className='rounded-md border border-yellow-200 bg-yellow-50 p-2 dark:border-yellow-800 dark:bg-yellow-950/20'>
                    <div className='text-xs text-yellow-700 dark:text-yellow-300'>
                      Processing your document query...
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Query Tips */}
            <div className='rounded-md border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800'>
              <h4 className='mb-2 text-xs font-medium text-gray-700 dark:text-gray-300'>
                💡 Query Tips:
              </h4>
              <ul className='space-y-1 text-xs text-gray-600 dark:text-gray-400'>
                <li>• Be specific about what information you want</li>
                <li>
                  • Ask for specific formats (tables, bullet points, etc.)
                </li>
                <li>• Reference specific sections if needed</li>
                <li>• Use follow-up questions for detailed analysis</li>
              </ul>
            </div>
          </div>
        );

      case 'output':
        // Handle different response formats - support both 'result' and API response format
        const responseData = getResponseData();
        const documentId = localData.documentId || localData.document_id;
        const queryType = localData.queryType || localData.query_type;
        const filename = localData.filename || localData.fileName;
        const responseType = detectResponseType();

        return (
          <div className='space-y-4'>
            {/* Output Header */}
            <div className='flex items-center space-x-2 rounded-md border border-purple-200 bg-purple-50 p-3 dark:border-purple-800 dark:bg-purple-950/20'>
              <Monitor className='h-5 w-5 text-purple-600 dark:text-purple-400' />
              <div className='flex-1'>
                <h3 className='text-sm font-medium text-purple-800 dark:text-purple-200'>
                  Query Response
                </h3>
                <p className='text-xs text-purple-600 dark:text-purple-400'>
                  View and manage the response from your document query
                </p>
              </div>
              {/* Status indicator in header */}
              {localData.status && getStatusIcon(localData.status)}
            </div>

            {/* API Response Debug Info */}
            {localData.success !== undefined && (
              <div className='rounded-md border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-950/20'>
                <div className='mb-2 flex items-center text-xs font-medium text-blue-700 dark:text-blue-300'>
                  <CheckCircle className='mr-1 h-3 w-3' />
                  API Response Status
                </div>
                <div className='space-y-1 text-xs text-blue-600 dark:text-blue-400'>
                  <div className='flex items-center'>
                    <span className='w-24 font-medium'>Success:</span>
                    <span
                      className={
                        localData.success ? 'text-green-600' : 'text-red-600'
                      }
                    >
                      {localData.success ? 'Yes' : 'No'}
                    </span>
                  </div>
                  {localData.document_processed !== undefined && (
                    <div className='flex items-center'>
                      <span className='w-24 font-medium'>Doc Processed:</span>
                      <span
                        className={
                          localData.document_processed
                            ? 'text-green-600'
                            : 'text-red-600'
                        }
                      >
                        {localData.document_processed ? 'Yes' : 'No'}
                      </span>
                    </div>
                  )}
                  {localData.query_processed !== undefined && (
                    <div className='flex items-center'>
                      <span className='w-24 font-medium'>Query Processed:</span>
                      <span
                        className={
                          localData.query_processed
                            ? 'text-green-600'
                            : 'text-red-600'
                        }
                      >
                        {localData.query_processed ? 'Yes' : 'No'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Document Metadata */}
            {(filename || documentId || queryType) && (
              <div className='rounded-md border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800'>
                <div className='mb-2 flex items-center text-xs font-medium text-gray-700 dark:text-gray-300'>
                  <File className='mr-1 h-3 w-3' />
                  Document Information
                </div>
                <div className='space-y-1 text-xs text-gray-600 dark:text-gray-400'>
                  {filename && (
                    <div className='flex items-center'>
                      <span className='w-16 font-medium'>File:</span>
                      <span>{filename}</span>
                    </div>
                  )}
                  {documentId && (
                    <div className='flex items-center'>
                      <span className='w-16 font-medium'>ID:</span>
                      <span className='font-mono'>
                        {documentId.substring(0, 12)}...
                      </span>
                    </div>
                  )}
                  {queryType && (
                    <div className='flex items-center'>
                      <span className='w-16 font-medium'>Type:</span>
                      <span>{queryType}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Main Content Area */}
            <div className='flex-1 space-y-3'>
              {/* Error Display */}
              {localData.status === 'error' && localData.error && (
                <div className='rounded-md border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950/20'>
                  <div className='flex items-start'>
                    <XCircle className='mt-0.5 mr-3 h-5 w-5 flex-shrink-0 text-red-500' />
                    <div className='flex-1'>
                      <div className='mb-2 text-sm font-medium text-red-800 dark:text-red-200'>
                        Query Failed
                      </div>
                      <ScrollArea className='max-h-40'>
                        <div className='text-sm whitespace-pre-wrap text-red-700 dark:text-red-300'>
                          {localData.error}
                        </div>
                      </ScrollArea>
                    </div>
                  </div>
                </div>
              )}

              {/* Processing State */}
              {localData.status === 'processing' && (
                <div className='rounded-md border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-950/20'>
                  <div className='flex items-center'>
                    <Clock className='mr-3 h-5 w-5 animate-spin text-yellow-500' />
                    <div>
                      <div className='text-sm font-medium text-yellow-800 dark:text-yellow-200'>
                        Processing Query
                      </div>
                      <div className='text-xs text-yellow-700 dark:text-yellow-300'>
                        Analyzing your document and generating response...
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Success Result Display */}
              {responseData &&
                (localData.status === 'completed' || localData.success) && (
                  <div className='rounded-md border border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20'>
                    {/* Response Header with Actions */}
                    <div className='flex items-center justify-between border-b border-green-200 p-3 dark:border-green-800'>
                      <div className='flex items-center'>
                        <CheckCircle className='mr-2 h-5 w-5 text-green-500' />
                        <div>
                          <div className='text-sm font-medium text-green-800 dark:text-green-200'>
                            Query Response
                          </div>
                          <div className='text-xs text-green-600 dark:text-green-400'>
                            {getDisplayText().length} characters •{' '}
                            {responseType} format
                          </div>
                        </div>
                      </div>
                      <div className='flex items-center space-x-1'>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={copyToClipboard}
                          className='h-7 w-7 p-0 text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300'
                          title='Copy response to clipboard'
                        >
                          {copied ? (
                            <CheckCircle className='h-4 w-4' />
                          ) : (
                            <Copy className='h-4 w-4' />
                          )}
                        </Button>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={downloadResponse}
                          className='h-7 w-7 p-0 text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300'
                          title={`Download as ${responseType.toLowerCase()} file`}
                        >
                          <Download className='h-4 w-4' />
                        </Button>
                      </div>
                    </div>

                    {/* Response Content */}
                    <div className='p-4'>
                      {(() => {
                        switch (responseType) {
                          case 'HTML':
                            return (
                              <div className='space-y-3'>
                                <div className='flex items-center justify-between rounded-md border border-orange-200 bg-orange-50 p-2 dark:border-orange-800 dark:bg-orange-950/20'>
                                  <div className='flex items-center text-xs text-orange-700 dark:text-orange-300'>
                                    <FileText className='mr-1 h-3 w-3' />
                                    HTML Document Ready
                                  </div>
                                  <Button
                                    variant='ghost'
                                    size='sm'
                                    onClick={() =>
                                      downloadAsHTML(
                                        responseData,
                                        filename || 'document'
                                      )
                                    }
                                    className='h-6 text-xs text-orange-600 hover:text-orange-700 dark:text-orange-400'
                                  >
                                    Download HTML
                                  </Button>
                                </div>
                                <div className='text-xs text-green-700 dark:text-green-300'>
                                  HTML content is ready for download. The
                                  document has been formatted and can be saved
                                  as an HTML file.
                                </div>
                              </div>
                            );

                          case 'EXCEL':
                            return (
                              <div className='space-y-3'>
                                <div className='flex items-center justify-between rounded-md border border-emerald-200 bg-emerald-50 p-2 dark:border-emerald-800 dark:bg-emerald-950/20'>
                                  <div className='flex items-center text-xs text-emerald-700 dark:text-emerald-300'>
                                    <FileSearch className='mr-1 h-3 w-3' />
                                    Table Data Extracted
                                  </div>
                                  <Button
                                    variant='ghost'
                                    size='sm'
                                    onClick={() =>
                                      downloadAsCSV(
                                        responseData,
                                        filename || 'tables'
                                      )
                                    }
                                    className='h-6 text-xs text-emerald-600 hover:text-emerald-700 dark:text-emerald-400'
                                  >
                                    Download CSV
                                  </Button>
                                </div>
                                {typeof responseData === 'object' &&
                                responseData.tables ? (
                                  <div className='space-y-2'>
                                    <div className='text-xs text-green-700 dark:text-green-300'>
                                      Found {responseData.tables.length}{' '}
                                      table(s) •{' '}
                                      {responseData.message ||
                                        'Ready for download'}
                                    </div>
                                    {responseData.tables
                                      .slice(0, 2)
                                      .map((table: any, index: number) => (
                                        <div
                                          key={index}
                                          className='rounded border border-gray-200 bg-white p-2 dark:border-gray-700 dark:bg-gray-900'
                                        >
                                          <div className='mb-1 text-xs font-medium'>
                                            {table.title ||
                                              `Table ${index + 1}`}
                                          </div>
                                          {table.columns && (
                                            <div className='text-xs text-gray-600 dark:text-gray-400'>
                                              Columns:{' '}
                                              {table.columns.join(', ')}
                                            </div>
                                          )}
                                          {table.rows && (
                                            <div className='text-xs text-gray-600 dark:text-gray-400'>
                                              Rows: {table.rows.length}
                                            </div>
                                          )}
                                        </div>
                                      ))}
                                    {responseData.tables.length > 2 && (
                                      <div className='text-xs text-gray-500'>
                                        ... and {responseData.tables.length - 2}{' '}
                                        more table(s)
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <div className='text-xs text-green-700 dark:text-green-300'>
                                    Table data is ready for download as CSV
                                    format.
                                  </div>
                                )}
                              </div>
                            );

                          case 'CSV':
                            return (
                              <div className='space-y-3'>
                                <div className='flex items-center justify-between rounded-md border border-blue-200 bg-blue-50 p-2 dark:border-blue-800 dark:bg-blue-950/20'>
                                  <div className='flex items-center text-xs text-blue-700 dark:text-blue-300'>
                                    <FileSearch className='mr-1 h-3 w-3' />
                                    CSV Data Ready
                                  </div>
                                  <Button
                                    variant='ghost'
                                    size='sm'
                                    onClick={() =>
                                      downloadAsCSV(
                                        responseData,
                                        filename || 'data'
                                      )
                                    }
                                    className='h-6 text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400'
                                  >
                                    Download CSV
                                  </Button>
                                </div>
                                <div className='text-xs text-green-700 dark:text-green-300'>
                                  CSV data is ready for download. Contains
                                  structured tabular data.
                                </div>
                              </div>
                            );

                          default: // TEXT
                            return (
                              <div className='space-y-3'>
                                <div className='flex items-center rounded-md border border-gray-200 bg-gray-50 p-2 dark:border-gray-700 dark:bg-gray-800'>
                                  <div className='flex items-center text-xs text-gray-700 dark:text-gray-300'>
                                    <FileText className='mr-1 h-3 w-3' />
                                    Text Response
                                  </div>
                                </div>
                                <ScrollArea className='max-h-96'>
                                  <div className='bg-green-25 rounded border border-green-100 p-3 text-sm leading-relaxed whitespace-pre-wrap text-green-800 dark:border-green-800 dark:bg-green-950/10 dark:text-green-200'>
                                    {getDisplayText()}
                                  </div>
                                </ScrollArea>
                              </div>
                            );
                        }
                      })()}
                    </div>
                  </div>
                )}

              {/* Empty State */}
              {!responseData &&
                !localData.error &&
                localData.status !== 'processing' && (
                  <div className='rounded-md border border-dashed border-gray-300 bg-gray-50 p-8 text-center dark:border-gray-600 dark:bg-gray-800'>
                    <Monitor className='mx-auto mb-3 h-12 w-12 text-gray-400' />
                    <div className='text-sm font-medium text-gray-600 dark:text-gray-400'>
                      No Response Available
                    </div>
                    <div className='mt-1 text-xs text-gray-500 dark:text-gray-500'>
                      Execute the workflow to see query results here
                    </div>
                    <div className='mt-3 text-xs text-gray-400 dark:text-gray-600'>
                      Connect this output node to a process node and run the
                      workflow
                    </div>
                  </div>
                )}
            </div>
          </div>
        );

      case 'conditional':
        return (
          <>
            <div className='space-y-2'>
              <Label htmlFor='condition'>Condition</Label>
              <Input
                id='condition'
                value={localData.condition || ''}
                onChange={(e) => handleChange('condition', e.target.value)}
                placeholder='data.value > 10'
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='trueLabel'>True Path Label</Label>
              <Input
                id='trueLabel'
                value={localData.trueLabel || 'Yes'}
                onChange={(e) => handleChange('trueLabel', e.target.value)}
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='falseLabel'>False Path Label</Label>
              <Input
                id='falseLabel'
                value={localData.falseLabel || 'No'}
                onChange={(e) => handleChange('falseLabel', e.target.value)}
              />
            </div>
          </>
        );

      case 'code':
        return (
          <>
            <div className='space-y-2'>
              <Label htmlFor='codeLanguage'>Language</Label>
              <Select
                value={localData.codeLanguage || 'javascript'}
                onValueChange={(value) => handleChange('codeLanguage', value)}
              >
                <SelectTrigger id='codeLanguage'>
                  <SelectValue placeholder='Select language' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='javascript'>JavaScript</SelectItem>
                  <SelectItem value='typescript'>TypeScript</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='code'>Code</Label>
              <CodeEditor
                value={
                  localData.code ||
                  '// Write your code here\nfunction process(data) {\n  // Transform data\n  return data;\n}'
                }
                onChange={(value) => handleChange('code', value)}
                language={localData.codeLanguage || 'javascript'}
              />
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className='flex h-full flex-col'>
      <div className='mb-4 flex items-center justify-between'>
        <h2 className='text-lg font-semibold'>Configure {node.data.label}</h2>
        <Button variant='ghost' size='icon' onClick={onClose}>
          <X className='h-4 w-4' />
        </Button>
      </div>

      <div className='flex-1 space-y-4 overflow-y-auto'>
        <div className='space-y-2'>
          <Label htmlFor='label'>Node Label</Label>
          <Input
            id='label'
            value={localData.label || ''}
            onChange={(e) => handleChange('label', e.target.value)}
          />
        </div>

        <div className='space-y-2'>
          <Label htmlFor='description'>Description</Label>
          <Textarea
            id='description'
            value={localData.description || ''}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder='Describe what this node does'
          />
        </div>

        <div className='border-border my-4 border-t'></div>

        {renderInputFields()}
      </div>
    </div>
  );
}
