import { useEffect, useState, useMemo, useCallback } from 'react';
import { 
  ReactFlow, 
  Background, 
  Controls, 
  useNodesState, 
  useEdgesState,
  type Node, 
  type Edge,
  MarkerType,
  Position,
  Handle,
  Panel
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { Tree } from '../../core/GeneralTree';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const TreeNode = ({ data }: any) => {
  let nodeStyle = 'border-slate-800 bg-white';
  let textStyle = 'text-slate-800';
  
  if (data.isSelected) {
    nodeStyle = 'border-purple-500 bg-purple-100 scale-110 shadow-[0_0_15px_rgba(168,85,247,0.5)]';
    textStyle = 'text-purple-700';
  } else if (data.isHighlight) {
    nodeStyle = 'border-blue-500 bg-blue-100 scale-110';
    textStyle = 'text-blue-700';
  } else if (data.isScanning) {
    nodeStyle = 'border-amber-500 bg-amber-100 scale-105 animate-pulse';
    textStyle = 'text-amber-700';
  }

  return (
    <div className={`px-6 py-3 shadow-lg rounded-full border-2 transition-all duration-300 ${nodeStyle}`}>
      <Handle type="target" position={Position.Top} className="w-2 h-2 bg-slate-800" />
      <div className={`font-bold text-lg text-center ${textStyle}`}>
        {data.label}
      </div>
      <Handle type="source" position={Position.Bottom} className="w-2 h-2 bg-slate-800" />
    </div>
  );
};

export default function GeneralTreeVisualizer() {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  
  const nodeTypes = useMemo(() => ({ treeNode: TreeNode }), []);

  const [tree] = useState(() => new Tree());
  const [isPlaying, setIsPlaying] = useState(false);
  
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedNodeData, setSelectedNodeData] = useState<number | null>(null);
  
  const [childInput, setChildInput] = useState('');
  const [addError, setAddError] = useState('');
  const [deleteError, setDeleteError] = useState('');

  const refreshGraph = useCallback((activeHighlights: string[] = [], activeScans: string[] = []) => {
    if (!tree.root) {
      setNodes([]);
      setEdges([]);
      return;
    }

    const newNodes: Node[] = [];
    const newEdges: Edge[] = [];
    
    let currentXOffset = 0; 
    const NODE_SPACING_X = 120;
    const LEVEL_SPACING_Y = 100;

    const calculateLayout = (node: any, depth: number): { x: number, y: number } => {
      const nodeId = node.id;

      if (node.children.length === 0) {
        const pos = { x: currentXOffset, y: depth * LEVEL_SPACING_Y };
        currentXOffset += NODE_SPACING_X;
        
        newNodes.push({
          id: nodeId,
          position: pos,
          data: { 
            label: node.data, 
            isHighlight: activeHighlights.includes(nodeId),
            isScanning: activeScans.includes(nodeId),
            isSelected: selectedNodeId === nodeId
          },
          type: 'treeNode',
        });
        return pos;
      }

      const childPositions = node.children.map((child: any) => {
        const childPos = calculateLayout(child, depth + 1);
        
        const isEdgeHighlighted = activeHighlights.includes(child.id);
        const isEdgeScanning = activeScans.includes(child.id);

        newEdges.push({
          id: `e-${nodeId}-${child.id}`,
          source: nodeId,
          target: child.id,
          type: 'straight',
          markerEnd: { type: MarkerType.ArrowClosed, color: isEdgeScanning ? '#f59e0b' : '#1e293b' },
          style: { 
            stroke: isEdgeHighlighted ? '#3b82f6' : isEdgeScanning ? '#f59e0b' : '#1e293b', 
            strokeWidth: isEdgeHighlighted || isEdgeScanning ? 3 : 2 
          },
          animated: isEdgeHighlighted || isEdgeScanning
        });
        
        return childPos;
      });

      const pos = {
        x: (childPositions[0].x + childPositions[childPositions.length - 1].x) / 2,
        y: depth * LEVEL_SPACING_Y
      };

      newNodes.push({
        id: nodeId,
        position: pos,
        data: { 
          label: node.data, 
          isHighlight: activeHighlights.includes(nodeId),
          isScanning: activeScans.includes(nodeId),
          isSelected: selectedNodeId === nodeId
        },
        type: 'treeNode',
      });

      return pos;
    };

    calculateLayout(tree.root, 0);
    setNodes(newNodes);
    setEdges(newEdges);
  }, [tree, setNodes, setEdges, selectedNodeId]);

  useEffect(() => {
    refreshGraph();
  }, [refreshGraph]);

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    if (isPlaying) return;
    
    if (selectedNodeId === node.id) {
      setSelectedNodeId(null);
      setSelectedNodeData(null);
    } else {
      setSelectedNodeId(node.id);
      setSelectedNodeData(node.data.label as number);
    }
    
    setAddError('');
    setDeleteError('');
  }, [isPlaying, selectedNodeId]);

  const onPaneClick = useCallback(() => {
    if (isPlaying) return;
    setSelectedNodeId(null);
    setSelectedNodeData(null);
    setAddError('');
    setDeleteError('');
  }, [isPlaying]);

  const handleAddChild = async () => {
    setAddError('');
    
    const child = parseInt(childInput);
    if (isNaN(child)) {
      setAddError('Please enter a valid number for Child!');
      return;
    }
    
    if (!selectedNodeId && tree.root !== null) {
      setAddError('Please click a node on the screen to be the parent!');
      return;
    }

    setIsPlaying(true);

    const success = tree.addChild(selectedNodeId, child);
    
    if (success) {
      setChildInput('');
      refreshGraph([success], []);
      await sleep(600);
    } else {
      setAddError('Failed to add node.');
    }

    refreshGraph([], []);
    setIsPlaying(false);
  };

  const handleDeleteNode = async () => {
    setDeleteError('');

    if (!selectedNodeId) {
      setDeleteError('Please click a node on the screen to delete!');
      return;
    }

    setIsPlaying(true);
    refreshGraph([selectedNodeId], []);
    await sleep(400);

    const success = tree.removeChild(selectedNodeId);

    if (success) {
      setSelectedNodeId(null);
      setSelectedNodeData(null);
    } else {
      setDeleteError('Failed to delete node.');
    }

    refreshGraph([], []);
    setIsPlaying(false);
  };

  const animateTraversal = async (type: 'DFS' | 'BFS') => {
    if (isPlaying) return;
    setIsPlaying(true);
    setAddError('');
    setDeleteError('');
    setSelectedNodeId(null);

    const path: string[] = [];
    if (type === 'DFS') {
      tree.traverseDFS((node) => path.push(node.id));
    } else {
      tree.traverseBFS((node) => path.push(node.id));
    }

    const activeNodes: string[] = [];
    for (const id of path) {
      activeNodes.push(id);
      refreshGraph([...activeNodes], []);
      await sleep(600);
    }

    setTimeout(() => {
      refreshGraph([], []);
      setIsPlaying(false);
    }, 1500);
  };

  return (
    <div className="w-full h-full relative bg-slate-50">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        fitView
      >
        <Background gap={16} color="#cbd5e1" />
        <Controls />
        
        <Panel position="top-left" className="bg-white/90 p-4 rounded-xl shadow-lg border border-slate-200 w-80 backdrop-blur-sm">
          <h3 className="font-bold text-slate-800 mb-4 text-lg">Tree Operations</h3>
          
          <div className="space-y-4">
            
            <div className="p-3 bg-purple-50 rounded-lg border border-purple-200 flex items-center justify-between">
              <span className="text-xs font-semibold text-purple-700">SELECTED NODE:</span>
              <span className="text-sm font-bold text-slate-800">
                {selectedNodeData !== null ? selectedNodeData : 'None (Click a node)'}
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <p className="text-xs font-semibold text-slate-500 mb-2">ADD CHILD</p>
              <div className="flex gap-2 mb-2">
                <input 
                  type="number" 
                  placeholder="New Data" 
                  value={childInput}
                  onChange={(e) => { setChildInput(e.target.value); setAddError(''); }}
                  className={`w-2/3 p-2 text-sm border rounded focus:ring-2 focus:ring-blue-500 ${addError ? 'border-red-500 bg-red-50' : ''}`}
                  disabled={isPlaying}
                />
                <button 
                  onClick={handleAddChild}
                  disabled={isPlaying}
                  className="w-1/3 bg-blue-600 text-white py-2 rounded text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                >
                  Add
                </button>
              </div>
              {addError && <p className="text-xs text-red-600 font-medium">{addError}</p>}
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <p className="text-xs font-semibold text-slate-500 mb-2">DELETE NODE</p>
              <button 
                onClick={handleDeleteNode}
                disabled={isPlaying || !selectedNodeId}
                className="w-full bg-red-500 text-white py-2 rounded text-sm font-medium hover:bg-red-600 disabled:opacity-50"
              >
                Delete Selected Node
              </button>
              {deleteError && <p className="text-xs text-red-600 mt-2 font-medium">{deleteError}</p>}
            </div>

            <div className="flex gap-2 pt-2 border-t border-slate-200">
              <button 
                onClick={() => animateTraversal('DFS')}
                disabled={isPlaying || !tree.root}
                className="flex-1 bg-teal-600 text-white py-2 rounded text-sm font-medium hover:bg-teal-700 disabled:opacity-50"
              >
                DFS
              </button>
              <button 
                onClick={() => animateTraversal('BFS')}
                disabled={isPlaying || !tree.root}
                className="flex-1 bg-indigo-600 text-white py-2 rounded text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
              >
                BFS
              </button>
            </div>
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
}