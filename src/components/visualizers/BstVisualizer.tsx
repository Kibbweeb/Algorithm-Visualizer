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

import { BinarySearchTree } from '../../core/BinarySearchTree';

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
    <div className={`px-5 py-3 shadow-lg rounded-full border-2 transition-all duration-300 min-w-15 ${nodeStyle}`}>
      <Handle type="target" position={Position.Top} className="w-2 h-2 bg-slate-800" />
      <div className={`font-bold text-lg text-center ${textStyle}`}>
        {data.label}
      </div>
      <Handle type="source" position={Position.Bottom} className="w-2 h-2 bg-slate-800" />
    </div>
  );
};

export default function BstVisualizer() {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  
  const nodeTypes = useMemo(() => ({ treeNode: TreeNode }), []);

  const [tree] = useState(() => new BinarySearchTree<number>([51, 38, 27, 67, 89]));
  const [isPlaying, setIsPlaying] = useState(false);
  
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedNodeData, setSelectedNodeData] = useState<number | null>(null);
  
  const [insertInput, setInsertInput] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [insertError, setInsertError] = useState('');
  const [searchError, setSearchError] = useState('');
  const [deleteError, setDeleteError] = useState('');

  const animateTraversal = async (type: 'IN' | 'PRE' | 'POST') => {
    if (isPlaying || !tree.root) return;
    
    setIsPlaying(true);
    setSelectedNodeId(null);
    setSelectedNodeData(null);
    setInsertError('');
    setSearchError('');
    setDeleteError('');

    let path: string[] = [];
    if (type === 'IN') {
        path = tree.getInOrderPath(tree.root);
    } else if (type === 'PRE') {
        path = tree.getPreOrderPath(tree.root);
    } else if (type === 'POST') {
        path = tree.getPostOrderPath(tree.root);
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

  const refreshGraph = useCallback((activeHighlights: string[] = [], activeScans: string[] = []) => {
    if (!tree.root) {
      setNodes([]);
      setEdges([]);
      return;
    }

    const newNodes: Node[] = [];
    const newEdges: Edge[] = [];
    
    let currentX = 0; 
    const NODE_SPACING_X = 90;
    const LEVEL_SPACING_Y = 90;

    const positions = new Map<string, { x: number, y: number }>();

    const calculatePositions = (node: any, depth: number) => {
      if (!node) return;
      calculatePositions(node.left, depth + 1);
      positions.set(node.id, { x: currentX * NODE_SPACING_X, y: depth * LEVEL_SPACING_Y });
      currentX++;
      calculatePositions(node.right, depth + 1);
    };
    calculatePositions(tree.root, 0);

    const buildGraph = (node: any) => {
      if (!node) return;
      const nodeId = node.id;
      const pos = positions.get(nodeId)!;

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

      if (node.left) {
        const isEdgeHighlighted = activeHighlights.includes(node.left.id);
        const isEdgeScanning = activeScans.includes(node.left.id);
        newEdges.push({
          id: `e-${nodeId}-${node.left.id}`,
          source: nodeId,
          target: node.left.id,
          type: 'straight',
          markerEnd: { type: MarkerType.ArrowClosed, color: isEdgeScanning ? '#f59e0b' : '#1e293b' },
          style: { 
            stroke: isEdgeHighlighted ? '#3b82f6' : isEdgeScanning ? '#f59e0b' : '#1e293b', 
            strokeWidth: isEdgeHighlighted || isEdgeScanning ? 3 : 2 
          },
          animated: isEdgeHighlighted || isEdgeScanning
        });
        buildGraph(node.left);
      }

      if (node.right) {
        const isEdgeHighlighted = activeHighlights.includes(node.right.id);
        const isEdgeScanning = activeScans.includes(node.right.id);
        newEdges.push({
          id: `e-${nodeId}-${node.right.id}`,
          source: nodeId,
          target: node.right.id,
          type: 'straight',
          markerEnd: { type: MarkerType.ArrowClosed, color: isEdgeScanning ? '#f59e0b' : '#1e293b' },
          style: { 
            stroke: isEdgeHighlighted ? '#3b82f6' : isEdgeScanning ? '#f59e0b' : '#1e293b', 
            strokeWidth: isEdgeHighlighted || isEdgeScanning ? 3 : 2 
          },
          animated: isEdgeHighlighted || isEdgeScanning
        });
        buildGraph(node.right);
      }
    };

    buildGraph(tree.root);
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
    
    setInsertError('');
    setSearchError('');
    setDeleteError('');
  }, [isPlaying, selectedNodeId]);

  const onPaneClick = useCallback(() => {
    if (isPlaying) return;
    setSelectedNodeId(null);
    setSelectedNodeData(null);
    setInsertError('');
    setSearchError('');
    setDeleteError('');
  }, [isPlaying]);

  const handleSearchNode = async () => {
    setSearchError('');
    const val = parseInt(searchInput);
    if (isNaN(val)) {
      setSearchError('Masukkan angka yang valid!');
      return;
    }

    setIsPlaying(true);
    setSelectedNodeId(null);
    setSelectedNodeData(null);

    const scanPath: string[] = [];
    let curr = tree.root;
    let foundNodeId: string | null = null;

    while (curr) {
      scanPath.push(curr.id);
      if (val === curr.data) {
        foundNodeId = curr.id;
        break;
      }
      curr = val < curr.data ? curr.left : curr.right;
    }

    for (let i = 0; i < scanPath.length; i++) {
      refreshGraph([], scanPath.slice(0, i + 1));
      await sleep(500);
    }

    if (foundNodeId) {
      setSelectedNodeId(foundNodeId);
      setSelectedNodeData(val);
      refreshGraph([foundNodeId], []);
      setSearchInput('');
    } else {
      setSearchError('Angka tidak ditemukan di dalam pohon!');
      refreshGraph([], []);
    }

    setIsPlaying(false);
  };

  const handleInsertNode = async () => {
    setInsertError('');
    const val = parseInt(insertInput);
    if (isNaN(val)) {
      setInsertError('Masukkan angka yang valid!');
      return;
    }

    setIsPlaying(true);

    const scanPath: string[] = [];
    let curr = tree.root;
    let isDuplicate = false;

    while (curr) {
      scanPath.push(curr.id);
      if (val === curr.data) {
        isDuplicate = true;
        break;
      }
      curr = val < curr.data ? curr.left : curr.right;
    }

    for (let i = 0; i < scanPath.length; i++) {
      refreshGraph([], scanPath.slice(0, i + 1));
      await sleep(500);
    }

    if (isDuplicate) {
      setInsertError('Nilai sudah ada! BST tidak boleh memiliki data kembar.');
      refreshGraph([], []);
      setIsPlaying(false);
      return;
    }

    const newId = tree.insertNode(val);
    if (newId) {
      setInsertInput('');
      refreshGraph([newId], []);
      await sleep(600);
    }

    refreshGraph([], []);
    setIsPlaying(false);
  };

  const handleDeleteNode = async () => {
    setDeleteError('');

    if (!selectedNodeId) {
      setDeleteError('Klik salah satu node di layar untuk dihapus!');
      return;
    }

    setIsPlaying(true);
    refreshGraph([selectedNodeId], []);
    await sleep(400);

    const success = tree.removeNode(selectedNodeId);

    if (success) {
      setSelectedNodeId(null);
      setSelectedNodeData(null);
    } else {
      setDeleteError('Gagal menghapus node.');
    }

    refreshGraph([], []);
    setIsPlaying(false);
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
          <h3 className="font-bold text-slate-800 mb-4 text-lg">BST Operations</h3>
          
          <div className="space-y-4">
            
            <div className="p-3 bg-purple-50 rounded-lg border border-purple-200 flex items-center justify-between">
              <span className="text-xs font-semibold text-purple-700">SELECTED NODE:</span>
              <span className="text-sm font-bold text-slate-800">
                {selectedNodeData !== null ? selectedNodeData : 'None'}
              </span>
            </div>

            {/* Fitur Search */}
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <p className="text-xs font-semibold text-slate-500 mb-2">SEARCH VALUE</p>
              <div className="flex gap-2 mb-2">
                <input 
                  type="number" 
                  placeholder="Target Value" 
                  value={searchInput}
                  onChange={(e) => { setSearchInput(e.target.value); setSearchError(''); }}
                  className={`w-2/3 p-2 text-sm border rounded focus:ring-2 focus:ring-amber-500 ${searchError ? 'border-red-500 bg-red-50' : ''}`}
                  disabled={isPlaying}
                />
                <button 
                  onClick={handleSearchNode}
                  disabled={isPlaying || !tree.root}
                  className="w-1/3 bg-amber-500 text-white py-2 rounded text-sm font-medium hover:bg-amber-600 disabled:opacity-50"
                >
                  Search
                </button>
              </div>
              {searchError && <p className="text-xs text-red-600 font-medium">{searchError}</p>}
            </div>

            {/* Fitur Insert */}
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <p className="text-xs font-semibold text-slate-500 mb-2">INSERT VALUE</p>
              <div className="flex gap-2 mb-2">
                <input 
                  type="number" 
                  placeholder="New Number" 
                  value={insertInput}
                  onChange={(e) => { setInsertInput(e.target.value); setInsertError(''); }}
                  className={`w-2/3 p-2 text-sm border rounded focus:ring-2 focus:ring-blue-500 ${insertError ? 'border-red-500 bg-red-50' : ''}`}
                  disabled={isPlaying}
                />
                <button 
                  onClick={handleInsertNode}
                  disabled={isPlaying}
                  className="w-1/3 bg-blue-600 text-white py-2 rounded text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                >
                  Insert
                </button>
              </div>
              {insertError && <p className="text-xs text-red-600 font-medium">{insertError}</p>}
            </div>

            {/* Fitur Delete */}
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

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <p className="text-xs font-semibold text-slate-500 mb-2">TRAVERSAL ANIMATION</p>
              <div className="flex gap-2">
                <button 
                  onClick={() => animateTraversal('PRE')}
                  disabled={isPlaying || !tree.root}
                  className="flex-1 bg-teal-600 text-white py-2 rounded text-xs font-medium hover:bg-teal-700 disabled:opacity-50 transition-colors"
                >
                  Pre-Order
                </button>
                <button 
                  onClick={() => animateTraversal('IN')}
                  disabled={isPlaying || !tree.root}
                  className="flex-1 bg-indigo-600 text-white py-2 rounded text-xs font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                >
                  In-Order
                </button>
                <button 
                  onClick={() => animateTraversal('POST')}
                  disabled={isPlaying || !tree.root}
                  className="flex-1 bg-fuchsia-600 text-white py-2 rounded text-xs font-medium hover:bg-fuchsia-700 disabled:opacity-50 transition-colors"
                >
                  Post-Order
                </button>
              </div>
            </div>

          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
}