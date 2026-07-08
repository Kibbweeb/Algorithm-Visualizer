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
  
  if (data.isHighlight) {
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
  const [parentInput, setParentInput] = useState('');
  const [childInput, setChildInput] = useState('');
  const [deleteInput, setDeleteInput] = useState('');

  const refreshGraph = useCallback((activeHighlights: number[] = [], activeScans: number[] = []) => {
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
      if (node.children.length === 0) {
        const pos = { x: currentXOffset, y: depth * LEVEL_SPACING_Y };
        currentXOffset += NODE_SPACING_X;
        
        newNodes.push({
          id: node.data.toString(),
          position: pos,
          data: { 
            label: node.data, 
            isHighlight: activeHighlights.includes(node.data),
            isScanning: activeScans.includes(node.data)
          },
          type: 'treeNode',
        });
        return pos;
      }

      const childPositions = node.children.map((child: any) => {
        const childPos = calculateLayout(child, depth + 1);
        
        const isEdgeHighlighted = activeHighlights.includes(child.data);
        const isEdgeScanning = activeScans.includes(child.data);

        newEdges.push({
          id: `e-${node.data}-${child.data}`,
          source: node.data.toString(),
          target: child.data.toString(),
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
        id: node.data.toString(),
        position: pos,
        data: { 
          label: node.data, 
          isHighlight: activeHighlights.includes(node.data),
          isScanning: activeScans.includes(node.data)
        },
        type: 'treeNode',
      });

      return pos;
    };

    calculateLayout(tree.root, 0);
    setNodes(newNodes);
    setEdges(newEdges);
  }, [tree, setNodes, setEdges]);

  useEffect(() => {
    refreshGraph();
  }, [refreshGraph]);

  const animateSearch = async (targetData: number, type: 'NODE' | 'PARENT'): Promise<boolean> => {
    const currentScans: number[] = [];
    let foundNode: any = null;

    const searchHelper = async (currentNode: any): Promise<any> => {
      if (!currentNode) return null;
      
      currentScans.push(currentNode.data);
      refreshGraph([], [...currentScans]);
      await sleep(500);

      if (type === 'NODE' && currentNode.data === targetData) {
        return currentNode;
      }

      for (const child of currentNode.children) {
        if (type === 'PARENT' && child.data === targetData) {
          return currentNode;
        }
        const found = await searchHelper(child);
        if (found) return found;
      }
      return null;
    };

    foundNode = await searchHelper(tree.root);
    
    if (foundNode) {
      refreshGraph([foundNode.data], []);
      await sleep(600);
      return true;
    }
    
    refreshGraph([], []);
    return false;
  };

  const handleAddChild = async () => {
    const parent = parseInt(parentInput);
    const child = parseInt(childInput);
    
    if (isNaN(parent) || isNaN(child)) return alert('Masukkan angka yang valid!');
    if (tree.findNode(tree.root, child)) return alert('Data Child sudah ada di dalam tree!');

    setIsPlaying(true);

    const parentExists = await animateSearch(parent, 'NODE');

    if (!parentExists) {
      alert(`Parent dengan angka ${parent} tidak ditemukan!`);
      refreshGraph([], []);
      setIsPlaying(false);
      return;
    }

    tree.addChild(parent, child);
    
    setParentInput('');
    setChildInput('');
    refreshGraph([], []);
    setIsPlaying(false);
  };

  const handleDeleteNode = async () => {
    const target = parseInt(deleteInput);
    if (isNaN(target)) return;

    setIsPlaying(true);

    if (tree.root && tree.root.data === target) {
      refreshGraph([tree.root.data], []);
      await sleep(600);
      tree.removeChild(target);
      setDeleteInput('');
      refreshGraph([], []);
      setIsPlaying(false);
      return;
    }

    const parentFound = await animateSearch(target, 'PARENT');

    if (!parentFound) {
      alert('Data tidak ditemukan!');
    } else {
      tree.removeChild(target);
      setDeleteInput('');
    }

    refreshGraph([], []);
    setIsPlaying(false);
  };

  const animateTraversal = async (type: 'DFS' | 'BFS') => {
    if (isPlaying) return;
    setIsPlaying(true);

    const path: number[] = [];
    if (type === 'DFS') {
      tree.traverseDFS((node) => path.push(node.data));
    } else {
      tree.traverseBFS((node) => path.push(node.data));
    }

    const activeNodes: number[] = [];
    for (const data of path) {
      activeNodes.push(data);
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
        fitView
      >
        <Background gap={16} color="#cbd5e1" />
        <Controls />
        
        <Panel position="top-left" className="bg-white/90 p-4 rounded-xl shadow-lg border border-slate-200 w-80 backdrop-blur-sm">
          <h3 className="font-bold text-slate-800 mb-4 text-lg">Tree Operations</h3>
          
          <div className="space-y-4">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <p className="text-xs font-semibold text-slate-500 mb-2">ADD NODE</p>
              <div className="flex gap-2 mb-2">
                <input 
                  type="number" 
                  placeholder="Parent" 
                  value={parentInput}
                  onChange={(e) => setParentInput(e.target.value)}
                  className="w-1/2 p-2 text-sm border rounded focus:ring-2 focus:ring-blue-500"
                  disabled={isPlaying}
                />
                <input 
                  type="number" 
                  placeholder="Child" 
                  value={childInput}
                  onChange={(e) => setChildInput(e.target.value)}
                  className="w-1/2 p-2 text-sm border rounded focus:ring-2 focus:ring-blue-500"
                  disabled={isPlaying}
                />
              </div>
              <button 
                onClick={handleAddChild}
                disabled={isPlaying}
                className="w-full bg-blue-600 text-white py-2 rounded text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                {isPlaying ? 'Scanning...' : 'Add'}
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <p className="text-xs font-semibold text-slate-500 mb-2">DELETE NODE</p>
              <div className="flex gap-2">
                <input 
                  type="number" 
                  placeholder="Data Target" 
                  value={deleteInput}
                  onChange={(e) => setDeleteInput(e.target.value)}
                  className="w-2/3 p-2 text-sm border rounded focus:ring-2 focus:ring-red-500"
                  disabled={isPlaying}
                />
                <button 
                  onClick={handleDeleteNode}
                  disabled={isPlaying}
                  className="w-1/3 bg-red-500 text-white py-2 rounded text-sm font-medium hover:bg-red-600 disabled:opacity-50"
                >
                  {isPlaying ? 'Scan...' : 'Delete'}
                </button>
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t border-slate-200">
              <button 
                onClick={() => animateTraversal('DFS')}
                disabled={isPlaying || !tree.root}
                className="flex-1 bg-teal-600 text-white py-2 rounded text-sm font-medium hover:bg-teal-700 disabled:opacity-50"
              >
                DFS Traversal
              </button>
              <button 
                onClick={() => animateTraversal('BFS')}
                disabled={isPlaying || !tree.root}
                className="flex-1 bg-indigo-600 text-white py-2 rounded text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
              >
                BFS Traversal
              </button>
            </div>
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
}