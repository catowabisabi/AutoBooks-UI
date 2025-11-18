// import type { Node } from 'reactflow';
//
// export interface NodeData {
//   label: string;
//   description?: string;
//   required?: boolean;
//
//   // Input node properties
//   dataSource?: 'manual' | 'api' | 'database' | 'file';
//   sampleData?: string;
//
//   // Output node properties
//   outputType?: 'console' | 'api' | 'database' | 'file';
//   outputFormat?: 'json' | 'csv' | 'xml' | 'text';
//
//   // Process node properties
//   processType?: 'transform' | 'filter' | 'aggregate' | 'sort';
//   processConfig?: string;
//
//   // Conditional node properties
//   condition?: string;
//   trueLabel?: string;
//   falseLabel?: string;
//
//   // Code node properties
//   codeLanguage?: 'javascript' | 'typescript';
//   code?: string;
// }
//
// export type WorkflowNode = Node<NodeData>;
//
// export interface Workflow {
//   nodes: WorkflowNode[];
//   edges: any[];
// }

// @/lib/types.ts

export interface NodeData {
  label?: string;
  description?: string;
  onUpdate?: (data: any) => void;

  [key: string]: any;
}

export interface WorkflowNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: NodeData;
}

export interface InputNodeData extends NodeData {
  file?: File;
  fileName?: string;
  dataSource?: string;
}

export interface ProcessNodeData extends NodeData {
  query?: string;
  prompt?: string;
  status?: 'idle' | 'processing' | 'completed' | 'error';
}

export interface OutputNodeData extends NodeData {
  result?: string;
  documentId?: string;
  queryType?: string;
  filename?: string;
  status?: 'idle' | 'processing' | 'completed' | 'error';
  error?: string;
}

export interface DocumentProcessingResult {
  success: boolean;
  document_id: string;
  document_processed: boolean;
  query_processed: boolean;
  query_type?: string;
  query_result?: string;
  filename?: string;
  error?: string;
}
