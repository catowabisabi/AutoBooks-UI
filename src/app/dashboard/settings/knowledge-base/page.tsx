'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from '@/lib/i18n/provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Loader2, Upload, FileText, Trash2, Search, Database, FolderOpen, Plus, X } from 'lucide-react';
import { ragApi, documentsApi } from '@/lib/api';

interface KnowledgeItem {
  id: string;
  title: string;
  category: string;
  source?: string;
  createdAt?: string;
}

interface CategoryData {
  [key: string]: KnowledgeItem[];
}

const CATEGORY_LABELS: Record<string, string> = {
  accounting: 'Accounting Standards',
  audit: 'Audit Guidelines',
  tax: 'Tax Regulations',
  financial_pr: 'Financial PR',
  general: 'General Knowledge',
  company: 'Company Documents',
};

export default function KnowledgeBasePage() {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<CategoryData>({});
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploadCategory, setUploadCategory] = useState('general');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Load knowledge base data
  const loadKnowledgeBase = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await ragApi.getKnowledge();
      if (response.categories) {
        setCategories(response.categories as unknown as CategoryData);
      }
    } catch (err: any) {
      console.error('Failed to load knowledge base:', err);
      setError(err.message || 'Failed to load knowledge base');
      // Use mock data for demo
      setCategories({
        accounting: [
          { id: '1', title: 'IFRS 15 Revenue Recognition', category: 'accounting' },
          { id: '2', title: 'IFRS 16 Leases', category: 'accounting' },
        ],
        audit: [
          { id: '3', title: 'ISA 315 Risk Assessment', category: 'audit' },
          { id: '4', title: 'ISA 500 Audit Evidence', category: 'audit' },
        ],
        tax: [
          { id: '5', title: 'Corporate Tax Guidelines', category: 'tax' },
        ],
        general: [
          { id: '6', title: 'Company Policy Manual', category: 'general' },
        ],
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadKnowledgeBase();
  }, [loadKnowledgeBase]);

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  // Handle file upload
  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('category', uploadCategory);

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      await documentsApi.uploadDocument(formData);

      clearInterval(progressInterval);
      setUploadProgress(100);

      // Reload knowledge base
      await loadKnowledgeBase();

      setUploadDialogOpen(false);
      setSelectedFile(null);
      setUploadCategory('general');
    } catch (err: any) {
      setError(err.message || 'Failed to upload document');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // Handle document deletion
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return;

    try {
      await documentsApi.deleteDocument(id);
      await loadKnowledgeBase();
    } catch (err: any) {
      setError(err.message || 'Failed to delete document');
    }
  };

  // Filter items based on search and category
  const filteredItems = Object.entries(categories).flatMap(([category, items]) => {
    if (selectedCategory !== 'all' && category !== selectedCategory) {
      return [];
    }
    return items.filter((item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // Get total count
  const totalItems = Object.values(categories).reduce((sum, items) => sum + items.length, 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Database className="h-6 w-6" />
            Knowledge Base
          </h2>
          <p className="text-muted-foreground mt-1">
            Manage documents for AI-powered search and assistance
          </p>
        </div>
        
        <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Document
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload Document</DialogTitle>
              <DialogDescription>
                Add a new document to the knowledge base. Supported formats: PDF, TXT, DOCX.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <Select value={uploadCategory} onValueChange={setUploadCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">File</label>
                <div className="border-2 border-dashed rounded-lg p-4 text-center">
                  {selectedFile ? (
                    <div className="flex items-center justify-center gap-2">
                      <FileText className="h-5 w-5 text-primary" />
                      <span className="text-sm">{selectedFile.name}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => setSelectedFile(null)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <label className="cursor-pointer">
                      <div className="flex flex-col items-center gap-2">
                        <Upload className="h-8 w-8 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          Click to select or drag and drop
                        </span>
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept=".pdf,.txt,.docx,.doc"
                        onChange={handleFileSelect}
                      />
                    </label>
                  )}
                </div>
              </div>

              {isUploading && (
                <div className="space-y-2">
                  <Progress value={uploadProgress} />
                  <p className="text-xs text-muted-foreground text-center">
                    Uploading... {uploadProgress}%
                  </p>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setUploadDialogOpen(false)}
                disabled={isUploading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpload}
                disabled={!selectedFile || isUploading}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Documents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalItems}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Object.keys(categories).length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Accounting Docs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories.accounting?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Audit Docs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories.audit?.length || 0}</div>
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Document List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FolderOpen className="h-5 w-5" />
            Documents
          </CardTitle>
          <CardDescription>
            {filteredItems.length} document{filteredItems.length !== 1 ? 's' : ''} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            {filteredItems.length > 0 ? (
              <div className="space-y-2">
                {filteredItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">{item.title}</p>
                        <Badge variant="secondary" className="mt-1">
                          {CATEGORY_LABELS[item.category] || item.category}
                        </Badge>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDelete(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground">
                <Database className="h-12 w-12 mb-4 opacity-50" />
                <p>No documents found</p>
                {searchQuery && (
                  <p className="text-sm mt-1">Try adjusting your search query</p>
                )}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Usage Notes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">How It Works</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>• Upload documents to build a searchable knowledge base for AI assistants.</p>
          <p>• Documents are processed and indexed for semantic search.</p>
          <p>• AI assistants use this knowledge to provide accurate, context-aware responses.</p>
          <p>• Organize documents by category for better search results.</p>
          <p>• Supported formats: PDF, TXT, DOCX.</p>
        </CardContent>
      </Card>
    </div>
  );
}
