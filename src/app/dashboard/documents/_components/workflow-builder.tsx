// 'use client';
//
// import type React from 'react';
//
// import { useState, useCallback, useRef } from 'react';
// import ReactFlow, {
//   ReactFlowProvider,
//   Background,
//   Controls,
//   MiniMap,
//   addEdge,
//   Panel,
//   useNodesState,
//   useEdgesState,
//   type Connection,
//   type Edge,
//   type NodeTypes,
//   type EdgeTypes,
//   type Node
// } from 'reactflow';
// import 'reactflow/dist/style.css';
// import { toast } from 'sonner';
// import { Button } from '@/components/ui/button';
// import { Save, Upload, Play } from 'lucide-react';
// import NodeLibrary from './node-library';
// import NodeConfigPanel from './node-config-panel';
// import CustomEdge from './custom-edge';
// import { InputNode } from './nodes/input-node';
// import { OutputNode } from './nodes/output-node';
// import { ProcessNode } from './nodes/process-node';
// import { ConditionalNode } from './nodes/conditional-node';
// import { CodeNode } from './nodes/code-node';
// import { generateNodeId, createNode } from '@/lib/workflow-utils';
// import type { WorkflowNode } from '@/lib/types';
//
// const nodeTypes: NodeTypes = {
//   input: InputNode,
//   output: OutputNode,
//   process: ProcessNode,
//   conditional: ConditionalNode,
//   code: CodeNode
// };
//
// const edgeTypes: EdgeTypes = {
//   custom: CustomEdge
// };
//
// export default function WorkflowBuilder() {
//   const reactFlowWrapper = useRef<HTMLDivElement>(null);
//   const [nodes, setNodes, onNodesChange] = useNodesState([]);
//   const [edges, setEdges, onEdgesChange] = useEdgesState([]);
//   const [selectedNode, setSelectedNode] = useState<Node | null>(null);
//   const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
//
//   const onConnect = useCallback(
//     (params: Edge | Connection) =>
//       setEdges((eds) => addEdge({ ...params, type: 'custom' }, eds)),
//     [setEdges]
//   );
//
//   const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
//     event.preventDefault();
//     event.dataTransfer.dropEffect = 'move';
//   }, []);
//
//   const onDrop = useCallback(
//     (event: React.DragEvent<HTMLDivElement>) => {
//       event.preventDefault();
//
//       const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
//       const type = event.dataTransfer.getData('application/reactflow');
//
//       // Check if the dropped element is valid
//       if (typeof type === 'undefined' || !type) {
//         return;
//       }
//
//       if (reactFlowBounds && reactFlowInstance) {
//         const position = reactFlowInstance.screenToFlowPosition({
//           x: event.clientX - reactFlowBounds.left,
//           y: event.clientY - reactFlowBounds.top
//         });
//
//         const newNode = createNode({
//           type,
//           position,
//           id: generateNodeId(type)
//         });
//
//         setNodes((nds) => nds.concat(newNode));
//       }
//     },
//     [reactFlowInstance, setNodes]
//   );
//
//   const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
//     setSelectedNode(node);
//   }, []);
//
//   const onPaneClick = useCallback(() => {
//     setSelectedNode(null);
//   }, []);
//
//   const updateNodeData = useCallback(
//     (nodeId: string, data: any) => {
//       setNodes((nds) =>
//         nds.map((node) => {
//           if (node.id === nodeId) {
//             return {
//               ...node,
//               data: {
//                 ...node.data,
//                 ...data
//               }
//             };
//           }
//           return node;
//         })
//       );
//     },
//     [setNodes]
//   );
//
//   const saveWorkflow = () => {
//     if (nodes.length === 0) {
//       toast.error('Nothing to save', {
//         description: 'Add some nodes to your workflow first'
//       });
//       return;
//     }
//
//     const workflow = {
//       nodes,
//       edges
//     };
//
//     const workflowString = JSON.stringify(workflow);
//     localStorage.setItem('workflow', workflowString);
//
//     toast.success('Workflow saved', {
//       description: 'Your workflow has been saved successfully'
//     });
//   };
//
//   const loadWorkflow = () => {
//     const savedWorkflow = localStorage.getItem('workflow');
//
//     if (!savedWorkflow) {
//       toast.error('No saved workflow', {
//         description: 'There is no workflow saved in your browser'
//       });
//       return;
//     }
//
//     try {
//       const { nodes: savedNodes, edges: savedEdges } =
//         JSON.parse(savedWorkflow);
//       setNodes(savedNodes);
//       setEdges(savedEdges);
//
//       toast.success('Workflow loaded', {
//         description: 'Your workflow has been loaded successfully'
//       });
//     } catch (error) {
//       toast.error('Error loading workflow', {
//         description: 'There was an error loading your workflow'
//       });
//     }
//   };
//
//   const executeWorkflow = () => {
//     if (nodes.length === 0) {
//       toast.error('Nothing to execute', {
//         description: 'Add some nodes to your workflow first'
//       });
//       return;
//     }
//
//     toast('Executing workflow', {
//       description:
//         'Your workflow is being executed (simulation only in this MVP)'
//     });
//
//     // In a real implementation, we would traverse the graph and execute each node
//     // For the MVP, we'll just simulate execution with a success message
//     setTimeout(() => {
//       toast.success('Workflow executed', {
//         description: 'Your workflow has been executed successfully'
//       });
//     }, 2000);
//   };
//
//   return (
//     <div className='flex h-[calc(100dvh-200px)]'>
//       <div className='w-64 border-r border-border bg-card p-4 dark:bg-card'>
//         <h2 className='mb-4 text-lg font-semibold'>Node Library</h2>
//         <NodeLibrary />
//       </div>
//
//       <div className='flex flex-1 flex-col'>
//         <div className='flex-1' ref={reactFlowWrapper}>
//           <ReactFlowProvider>
//             <ReactFlow
//               nodes={nodes}
//               edges={edges}
//               onNodesChange={onNodesChange}
//               onEdgesChange={onEdgesChange}
//               onConnect={onConnect}
//               onInit={setReactFlowInstance}
//               onDrop={onDrop}
//               onDragOver={onDragOver}
//               onNodeClick={onNodeClick}
//               onPaneClick={onPaneClick}
//               nodeTypes={nodeTypes}
//               edgeTypes={edgeTypes}
//               fitView
//               snapToGrid
//               snapGrid={[15, 15]}
//               defaultEdgeOptions={{ type: 'custom' }}
//               className='bg-background dark:bg-background'
//             >
//               <Background className='dark:bg-background' />
//               <Controls />
//               <MiniMap />
//               <Panel position='top-right'>
//                 <div className='flex gap-2'>
//                   <Button onClick={saveWorkflow} size='sm' variant='outline'>
//                     <Save className='mr-2 h-4 w-4' />
//                     Save
//                   </Button>
//                   <Button onClick={loadWorkflow} size='sm' variant='outline'>
//                     <Upload className='mr-2 h-4 w-4' />
//                     Load
//                   </Button>
//                   <Button onClick={executeWorkflow} size='sm' variant='default'>
//                     <Play className='mr-2 h-4 w-4' />
//                     Execute
//                   </Button>
//                 </div>
//               </Panel>
//             </ReactFlow>
//           </ReactFlowProvider>
//         </div>
//       </div>
//
//       {selectedNode && (
//         <div className='w-80 border-l border-border bg-card p-4 dark:bg-card'>
//           <NodeConfigPanel
//             node={selectedNode as WorkflowNode}
//             updateNodeData={updateNodeData}
//             onClose={() => setSelectedNode(null)}
//           />
//         </div>
//       )}
//     </div>
//   );
// }

// 'use client';
//
// import type React from 'react';
//
// import { useState, useCallback, useRef } from 'react';
// import ReactFlow, {
//   ReactFlowProvider,
//   Background,
//   Controls,
//   MiniMap,
//   addEdge,
//   Panel,
//   useNodesState,
//   useEdgesState,
//   type Connection,
//   type Edge,
//   type NodeTypes,
//   type EdgeTypes,
//   type Node
// } from 'reactflow';
// import 'reactflow/dist/style.css';
// import { toast } from 'sonner';
// import { Button } from '@/components/ui/button';
// import { Save, Upload, Play, Loader2 } from 'lucide-react';
// import NodeLibrary from './node-library';
// import NodeConfigPanel from './node-config-panel';
// import CustomEdge from './custom-edge';
// import { InputNode } from './nodes/input-node';
// import { OutputNode } from './nodes/output-node';
// import { ProcessNode } from './nodes/process-node';
// import { ConditionalNode } from './nodes/conditional-node';
// import { CodeNode } from './nodes/code-node';
// import { generateNodeId, createNode } from '@/lib/workflow-utils';
// import type { WorkflowNode } from '@/lib/types';
//
// const nodeTypes: NodeTypes = {
//   input: InputNode,
//   output: OutputNode,
//   process: ProcessNode,
//   conditional: ConditionalNode,
//   code: CodeNode
// };
//
// const edgeTypes: EdgeTypes = {
//   custom: CustomEdge
// };
//
// interface DocumentProcessingResult {
//   success: boolean;
//   document_id: string;
//   document_processed: boolean;
//   query_processed: boolean;
//   query_type?: string;
//   query_result?: string;
//   filename?: string;
//   error?: string;
// }
//
// export default function WorkflowBuilder() {
//   const reactFlowWrapper = useRef<HTMLDivElement>(null);
//   const [nodes, setNodes, onNodesChange] = useNodesState([]);
//   const [edges, setEdges, onEdgesChange] = useEdgesState([]);
//   const [selectedNode, setSelectedNode] = useState<Node | null>(null);
//   const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
//   const [isExecuting, setIsExecuting] = useState(false);
//
//   const onConnect = useCallback(
//     (params: Edge | Connection) =>
//       setEdges((eds) => addEdge({ ...params, type: 'custom' }, eds)),
//     [setEdges]
//   );
//
//   const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
//     event.preventDefault();
//     event.dataTransfer.dropEffect = 'move';
//   }, []);
//
//   const updateNodeData = useCallback(
//     (nodeId: string, data: any) => {
//       setNodes((nds) =>
//         nds.map((node) => {
//           if (node.id === nodeId) {
//             return {
//               ...node,
//               data: {
//                 ...node.data,
//                 ...data,
//                 onUpdate: (newData: any) => updateNodeData(nodeId, newData)
//               }
//             };
//           }
//           return node;
//         })
//       );
//     },
//     [setNodes]
//   );
//
//   const onDrop = useCallback(
//     (event: React.DragEvent<HTMLDivElement>) => {
//       event.preventDefault();
//
//       const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
//       const type = event.dataTransfer.getData('application/reactflow');
//
//       // Check if the dropped element is valid
//       if (typeof type === 'undefined' || !type) {
//         return;
//       }
//
//       if (reactFlowBounds && reactFlowInstance) {
//         const position = reactFlowInstance.screenToFlowPosition({
//           x: event.clientX - reactFlowBounds.left,
//           y: event.clientY - reactFlowBounds.top
//         });
//
//         const newNode = createNode({
//           type,
//           position,
//           id: generateNodeId(type)
//         });
//
//         // Add onUpdate function to node data
//         newNode.data = {
//           ...newNode.data,
//           onUpdate: (data: any) => updateNodeData(newNode.id, data)
//         };
//
//         setNodes((nds) => nds.concat(newNode));
//       }
//     },
//     [reactFlowInstance, setNodes, updateNodeData]
//   );
//
//   const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
//     setSelectedNode(node);
//   }, []);
//
//   const onPaneClick = useCallback(() => {
//     setSelectedNode(null);
//   }, []);
//
//   const saveWorkflow = () => {
//     if (nodes.length === 0) {
//       toast.error('Nothing to save', {
//         description: 'Add some nodes to your workflow first'
//       });
//       return;
//     }
//
//     const workflow = {
//       nodes,
//       edges
//     };
//
//     const workflowString = JSON.stringify(workflow);
//     localStorage.setItem('workflow', workflowString);
//
//     toast.success('Workflow saved', {
//       description: 'Your workflow has been saved successfully'
//     });
//   };
//
//   const loadWorkflow = () => {
//     const savedWorkflow = localStorage.getItem('workflow');
//
//     if (!savedWorkflow) {
//       toast.error('No saved workflow', {
//         description: 'There is no workflow saved in your browser'
//       });
//       return;
//     }
//
//     try {
//       const { nodes: savedNodes, edges: savedEdges } =
//         JSON.parse(savedWorkflow);
//
//       // Restore onUpdate functions to loaded nodes
//       const nodesWithCallbacks = savedNodes.map((node: any) => ({
//         ...node,
//         data: {
//           ...node.data,
//           onUpdate: (data: any) => updateNodeData(node.id, data)
//         }
//       }));
//
//       setNodes(nodesWithCallbacks);
//       setEdges(savedEdges);
//
//       toast.success('Workflow loaded', {
//         description: 'Your workflow has been loaded successfully'
//       });
//     } catch (error) {
//       toast.error('Error loading workflow', {
//         description: 'There was an error loading your workflow'
//       });
//     }
//   };
//
//   const findNodeByType = (nodeType: string) => {
//     return nodes.find((node) => node.type === nodeType);
//   };
//
//   const processDocumentWithAPI = async (
//     file: File,
//     query: string
//   ): Promise<DocumentProcessingResult> => {
//     const formData = new FormData();
//     formData.append('file', file);
//     formData.append('query', query);
//     formData.append('return_document_data', 'false');
//
//     try {
//       // Use your existing environment variable
//       const API_BASE_URL =
//         process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8001';
//
//       const response = await fetch(
//         `${API_BASE_URL}/api/v1/document-assistant/process/`,
//         {
//           method: 'POST',
//           body: formData
//         }
//       );
//
//       if (!response.ok) {
//         const errorData = await response.json().catch(() => ({}));
//         throw new Error(
//           errorData.error || `HTTP error! status: ${response.status}`
//         );
//       }
//
//       return await response.json();
//     } catch (error) {
//       console.error('API Error:', error);
//       throw error;
//     }
//   };
//
//   const executeWorkflow = async () => {
//     if (nodes.length === 0) {
//       toast.error('Nothing to execute', {
//         description: 'Add some nodes to your workflow first'
//       });
//       return;
//     }
//
//     setIsExecuting(true);
//
//     try {
//       // Find the input node (should contain the file)
//       const inputNode = findNodeByType('input');
//       if (!inputNode) {
//         throw new Error(
//           'No input node found. Please add an input node with a file.'
//         );
//       }
//
//       const file = inputNode.data?.file;
//       if (!file) {
//         throw new Error(
//           'No file found in input node. Please upload a file to the input node.'
//         );
//       }
//
//       // Find the process node (should contain the query)
//       const processNode = findNodeByType('process');
//       if (!processNode) {
//         throw new Error(
//           'No process node found. Please add a process node with a query.'
//         );
//       }
//
//       const query = processNode.data?.query || processNode.data?.prompt;
//       if (!query) {
//         throw new Error(
//           'No query found in process node. Please add a query to the process node.'
//         );
//       }
//
//       // Find the output node
//       const outputNode = findNodeByType('output');
//       if (!outputNode) {
//         throw new Error(
//           'No output node found. Please add an output node to display results.'
//         );
//       }
//
//       // Update nodes to show processing state
//       updateNodeData(processNode.id, { status: 'processing' });
//       updateNodeData(outputNode.id, {
//         status: 'processing',
//         result: null,
//         error: null
//       });
//
//       toast.info('Processing workflow', {
//         description: 'Processing your document and query...'
//       });
//
//       // Call the combined API
//       const result = await processDocumentWithAPI(file, query);
//
//       if (result.success) {
//         // Update the output node with the result
//         updateNodeData(outputNode.id, {
//           result: result.query_result,
//           documentId: result.document_id,
//           queryType: result.query_type,
//           filename: result.filename,
//           status: 'completed'
//         });
//
//         // Update process node status
//         updateNodeData(processNode.id, { status: 'completed' });
//
//         toast.success('Workflow executed successfully', {
//           description: 'Document processed and query answered successfully'
//         });
//       } else {
//         throw new Error(result.error || 'Failed to process document');
//       }
//     } catch (error: any) {
//       console.error('Workflow execution error:', error);
//
//       // Update nodes with error state
//       const outputNode = findNodeByType('output');
//       const processNode = findNodeByType('process');
//
//       if (outputNode) {
//         updateNodeData(outputNode.id, {
//           result: null,
//           error: error.message,
//           status: 'error'
//         });
//       }
//
//       if (processNode) {
//         updateNodeData(processNode.id, { status: 'error' });
//       }
//
//       toast.error('Workflow execution failed', {
//         description: error.message || 'An unexpected error occurred'
//       });
//     } finally {
//       setIsExecuting(false);
//     }
//   };
//
//   return (
//     <div className='flex h-[calc(100dvh-200px)]'>
//       <div className='border-border bg-card dark:bg-card w-64 border-r p-4'>
//         <h2 className='mb-4 text-lg font-semibold'>Node Library</h2>
//         <NodeLibrary />
//       </div>
//
//       <div className='flex flex-1 flex-col'>
//         <div className='flex-1' ref={reactFlowWrapper}>
//           <ReactFlowProvider>
//             <ReactFlow
//               nodes={nodes}
//               edges={edges}
//               onNodesChange={onNodesChange}
//               onEdgesChange={onEdgesChange}
//               onConnect={onConnect}
//               onInit={setReactFlowInstance}
//               onDrop={onDrop}
//               onDragOver={onDragOver}
//               onNodeClick={onNodeClick}
//               onPaneClick={onPaneClick}
//               nodeTypes={nodeTypes}
//               edgeTypes={edgeTypes}
//               fitView
//               snapToGrid
//               snapGrid={[15, 15]}
//               defaultEdgeOptions={{ type: 'custom' }}
//               className='bg-background dark:bg-background'
//             >
//               <Background className='dark:bg-background' />
//               <Controls />
//               <MiniMap />
//               <Panel position='top-right'>
//                 <div className='flex gap-2'>
//                   <Button onClick={saveWorkflow} size='sm' variant='outline'>
//                     <Save className='mr-2 h-4 w-4' />
//                     Save
//                   </Button>
//                   <Button onClick={loadWorkflow} size='sm' variant='outline'>
//                     <Upload className='mr-2 h-4 w-4' />
//                     Load
//                   </Button>
//                   <Button
//                     onClick={executeWorkflow}
//                     size='sm'
//                     variant='default'
//                     disabled={isExecuting}
//                   >
//                     {isExecuting ? (
//                       <Loader2 className='mr-2 h-4 w-4 animate-spin' />
//                     ) : (
//                       <Play className='mr-2 h-4 w-4' />
//                     )}
//                     {isExecuting ? 'Executing...' : 'Execute'}
//                   </Button>
//                 </div>
//               </Panel>
//             </ReactFlow>
//           </ReactFlowProvider>
//         </div>
//       </div>
//
//       {selectedNode && (
//         <div className='border-border bg-card dark:bg-card w-80 border-l p-4'>
//           <NodeConfigPanel
//             node={selectedNode as WorkflowNode}
//             updateNodeData={updateNodeData}
//             onClose={() => setSelectedNode(null)}
//           />
//         </div>
//       )}
//     </div>
//   );
// }

'use client';

import type React from 'react';

import { useState, useCallback, useRef } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
  addEdge,
  Panel,
  useNodesState,
  useEdgesState,
  type Connection,
  type Edge,
  type NodeTypes,
  type EdgeTypes,
  type Node
} from 'reactflow';
import 'reactflow/dist/style.css';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Save, Upload, Play, Loader2 } from 'lucide-react';
import NodeLibrary from './node-library';
import NodeConfigPanel from './node-config-panel';
import CustomEdge from './custom-edge';
import { InputNode } from './nodes/input-node';
import { OutputNode } from './nodes/output-node';
import { ProcessNode } from './nodes/process-node';
import { ConditionalNode } from './nodes/conditional-node';
import { CodeNode } from './nodes/code-node';
import { generateNodeId, createNode } from '@/lib/workflow-utils';
import type { WorkflowNode } from '@/lib/types';

const nodeTypes: NodeTypes = {
  input: InputNode,
  output: OutputNode,
  process: ProcessNode,
  conditional: ConditionalNode,
  code: CodeNode
};

const edgeTypes: EdgeTypes = {
  custom: CustomEdge
};

interface DocumentProcessingResult {
  success: boolean;
  document_id: string;
  document_processed: boolean;
  query_processed: boolean;
  query_type?: string;
  query_result?: string;
  filename?: string;
  error?: string;
}

export default function WorkflowBuilder() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
  const [isExecuting, setIsExecuting] = useState(false);

  const onConnect = useCallback(
    (params: Edge | Connection) =>
      setEdges((eds) => addEdge({ ...params, type: 'custom' }, eds)),
    [setEdges]
  );

  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const updateNodeData = useCallback(
    (nodeId: string, data: any) => {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === nodeId) {
            return {
              ...node,
              data: {
                ...node.data,
                ...data,
                onUpdate: (newData: any) => updateNodeData(nodeId, newData)
              }
            };
          }
          return node;
        })
      );
    },
    [setNodes]
  );

  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();

      const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
      const type = event.dataTransfer.getData('application/reactflow');

      // Check if the dropped element is valid
      if (typeof type === 'undefined' || !type) {
        return;
      }

      if (reactFlowBounds && reactFlowInstance) {
        const position = reactFlowInstance.screenToFlowPosition({
          x: event.clientX - reactFlowBounds.left,
          y: event.clientY - reactFlowBounds.top
        });

        const newNode = createNode({
          type,
          position,
          id: generateNodeId(type)
        });

        // Add onUpdate function to node data
        newNode.data = {
          ...newNode.data,
          onUpdate: (data: any) => updateNodeData(newNode.id, data)
        };

        setNodes((nds) => nds.concat(newNode));
      }
    },
    [reactFlowInstance, setNodes, updateNodeData]
  );

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  const saveWorkflow = () => {
    if (nodes.length === 0) {
      toast.error('Nothing to save', {
        description: 'Add some nodes to your workflow first'
      });
      return;
    }

    const workflow = {
      nodes,
      edges
    };

    const workflowString = JSON.stringify(workflow);
    localStorage.setItem('workflow', workflowString);

    toast.success('Workflow saved', {
      description: 'Your workflow has been saved successfully'
    });
  };

  const loadWorkflow = () => {
    const savedWorkflow = localStorage.getItem('workflow');

    if (!savedWorkflow) {
      toast.error('No saved workflow', {
        description: 'There is no workflow saved in your browser'
      });
      return;
    }

    try {
      const { nodes: savedNodes, edges: savedEdges } =
        JSON.parse(savedWorkflow);

      // Restore onUpdate functions to loaded nodes
      const nodesWithCallbacks = savedNodes.map((node: any) => ({
        ...node,
        data: {
          ...node.data,
          onUpdate: (data: any) => updateNodeData(node.id, data)
        }
      }));

      setNodes(nodesWithCallbacks);
      setEdges(savedEdges);

      toast.success('Workflow loaded', {
        description: 'Your workflow has been loaded successfully'
      });
    } catch (error) {
      toast.error('Error loading workflow', {
        description: 'There was an error loading your workflow'
      });
    }
  };

  const findNodeByType = (nodeType: string) => {
    return nodes.find((node) => node.type === nodeType);
  };

  const processDocumentWithAPI = async (
    file: File,
    query: string
  ): Promise<DocumentProcessingResult> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('query', query);
    formData.append('return_document_data', 'false');

    try {
      // Use your existing environment variable
      const API_BASE_URL =
        process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8001';

      const response = await fetch(
        `${API_BASE_URL}/api/v1/document-assistant/process/`,
        {
          method: 'POST',
          body: formData
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  };

  const executeWorkflow = async () => {
    if (nodes.length === 0) {
      toast.error('Nothing to execute', {
        description: 'Add some nodes to your workflow first'
      });
      return;
    }

    setIsExecuting(true);

    try {
      // Find the input node (should contain the file)
      const inputNode = findNodeByType('input');
      if (!inputNode) {
        throw new Error(
          'No input node found. Please add an input node with a file.'
        );
      }

      const file = inputNode.data?.file;
      if (!file) {
        throw new Error(
          'No file found in input node. Please upload a file to the input node.'
        );
      }

      // Find the process node (should contain the document query)
      const processNode = findNodeByType('process');
      if (!processNode) {
        throw new Error(
          'No process node found. Please add a process node with a document query.'
        );
      }

      const query = processNode.data?.query;
      if (!query || !query.trim()) {
        throw new Error(
          'No document query found in process node. Please add a document query to the process node.'
        );
      }

      // Find the output node
      const outputNode = findNodeByType('output');
      if (!outputNode) {
        throw new Error(
          'No output node found. Please add an output node to display results.'
        );
      }

      // Update nodes to show processing state
      updateNodeData(inputNode.id, { status: 'processing' });
      updateNodeData(processNode.id, { status: 'processing' });
      updateNodeData(outputNode.id, {
        status: 'processing',
        result: null,
        error: null
      });

      toast.info('Processing document query', {
        description: 'Processing your document with the specified query...'
      });

      // Call the document processing API
      const result = await processDocumentWithAPI(file, query);

      if (result.success) {
        // Update the output node with the result
        updateNodeData(outputNode.id, {
          result: result.query_result,
          documentId: result.document_id,
          queryType: result.query_type,
          filename: result.filename,
          status: 'completed'
        });

        // Update other nodes status
        updateNodeData(inputNode.id, { status: 'completed' });
        updateNodeData(processNode.id, { status: 'completed' });

        toast.success('Document query executed successfully', {
          description:
            'Your document has been processed and query answered successfully'
        });
      } else {
        throw new Error(result.error || 'Failed to process document query');
      }
    } catch (error: any) {
      console.error('Workflow execution error:', error);

      // Update nodes with error state
      const outputNode = findNodeByType('output');
      const processNode = findNodeByType('process');
      const inputNode = findNodeByType('input');

      if (outputNode) {
        updateNodeData(outputNode.id, {
          result: null,
          error: error.message,
          status: 'error'
        });
      }

      if (processNode) {
        updateNodeData(processNode.id, { status: 'error' });
      }

      if (inputNode) {
        updateNodeData(inputNode.id, { status: 'error' });
      }

      toast.error('Document query execution failed', {
        description:
          error.message ||
          'An unexpected error occurred while processing your document query'
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const getWorkflowStatus = () => {
    if (isExecuting) return 'executing';

    const hasInput = findNodeByType('input');
    const hasProcess = findNodeByType('process');
    const hasOutput = findNodeByType('output');

    if (!hasInput || !hasProcess || !hasOutput) {
      return 'incomplete';
    }

    const inputHasFile = hasInput.data?.file;
    const processHasQuery = hasProcess.data?.query?.trim();

    if (!inputHasFile || !processHasQuery) {
      return 'unconfigured';
    }

    return 'ready';
  };

  const getExecuteButtonText = () => {
    if (isExecuting) return 'Processing...';

    const status = getWorkflowStatus();
    switch (status) {
      case 'incomplete':
        return 'Add Required Nodes';
      case 'unconfigured':
        return 'Configure Nodes';
      case 'ready':
        return 'Execute Query';
      default:
        return 'Execute';
    }
  };

  const isExecuteDisabled = () => {
    return isExecuting || getWorkflowStatus() !== 'ready';
  };

  return (
    <div className='flex h-[calc(100dvh-200px)]'>
      <div className='border-border bg-card dark:bg-card w-64 border-r p-4'>
        <h2 className='mb-4 text-lg font-semibold'>Node Library</h2>
        <div className='mb-4 rounded-md border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-950/20'>
          <h3 className='mb-2 text-sm font-medium text-blue-800 dark:text-blue-200'>
            Document Query Workflow
          </h3>
          <p className='text-xs text-blue-700 dark:text-blue-300'>
            Build workflows to query and analyze your documents. Connect Input →
            Process → Output nodes.
          </p>
        </div>
        <NodeLibrary />
      </div>

      <div className='flex flex-1 flex-col'>
        <div className='flex-1' ref={reactFlowWrapper}>
          <ReactFlowProvider>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onInit={setReactFlowInstance}
              onDrop={onDrop}
              onDragOver={onDragOver}
              onNodeClick={onNodeClick}
              onPaneClick={onPaneClick}
              nodeTypes={nodeTypes}
              edgeTypes={edgeTypes}
              fitView
              snapToGrid
              snapGrid={[15, 15]}
              defaultEdgeOptions={{ type: 'custom' }}
              className='bg-background dark:bg-background'
            >
              <Background className='dark:bg-background' />
              <Controls />
              <MiniMap />
              <Panel position='top-right'>
                <div className='flex gap-2'>
                  <Button
                    onClick={saveWorkflow}
                    size='sm'
                    variant='outline'
                    disabled={nodes.length === 0}
                  >
                    <Save className='mr-2 h-4 w-4' />
                    Save
                  </Button>
                  <Button onClick={loadWorkflow} size='sm' variant='outline'>
                    <Upload className='mr-2 h-4 w-4' />
                    Load
                  </Button>
                  <Button
                    onClick={executeWorkflow}
                    size='sm'
                    variant='default'
                    disabled={isExecuteDisabled()}
                    className={
                      getWorkflowStatus() === 'ready'
                        ? 'bg-blue-600 hover:bg-blue-700'
                        : ''
                    }
                  >
                    {isExecuting ? (
                      <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    ) : (
                      <Play className='mr-2 h-4 w-4' />
                    )}
                    {getExecuteButtonText()}
                  </Button>
                </div>
              </Panel>

              {/* Workflow Status Panel */}
              <Panel position='top-left'>
                <div className='bg-card rounded-md border p-3 shadow-sm'>
                  <div className='flex items-center space-x-2'>
                    <div
                      className={`h-2 w-2 rounded-full ${
                        getWorkflowStatus() === 'ready'
                          ? 'bg-green-500'
                          : getWorkflowStatus() === 'executing'
                            ? 'animate-pulse bg-yellow-500'
                            : 'bg-gray-400'
                      }`}
                    />
                    <span className='text-sm font-medium'>
                      {getWorkflowStatus() === 'ready' && 'Ready to Execute'}
                      {getWorkflowStatus() === 'executing' && 'Processing...'}
                      {getWorkflowStatus() === 'incomplete' &&
                        'Incomplete Workflow'}
                      {getWorkflowStatus() === 'unconfigured' &&
                        'Needs Configuration'}
                    </span>
                  </div>
                  <div className='text-muted-foreground mt-1 text-xs'>
                    Nodes: {nodes.length} | Connections: {edges.length}
                  </div>
                </div>
              </Panel>
            </ReactFlow>
          </ReactFlowProvider>
        </div>
      </div>

      {selectedNode && (
        <div className='border-border bg-card dark:bg-card w-80 border-l p-4'>
          <NodeConfigPanel
            node={selectedNode as WorkflowNode}
            updateNodeData={updateNodeData}
            onClose={() => setSelectedNode(null)}
          />
        </div>
      )}
    </div>
  );
}
