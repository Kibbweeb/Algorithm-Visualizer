import { useMemo, useRef, useEffect, useState } from 'react';
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
} from '@xyflow/react';

import { LinkedList } from '../../core/LinkedList';

const LinkedNode = ({ data }: any) => {
  return (
    <div className="flex min-w-30 items-center justify-center rounded border-2 border-black bg-white px-5 py-2 text-lg font-bold text-slate-900">
      <Handle type="target" position={Position.Left} id="target-left" />
      <div className="flex flex-col items-center">
        <span className="text-lg font-bold">{data.value}</span>
      </div>
      <Handle type="source" position={Position.Right} id="source-right" />
    </div>
  );
};

export default function LinkedListVisualizer() {
  const listRef = useRef(new LinkedList<number>());
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  const [inputValue, setInputValue] = useState<string>('');
  const [indexValue, setIndexValue] = useState<string>('');

  const nodeTypes = useMemo(() => ({ linkedNode: LinkedNode }), []);

  const syncVisuals = () => {
    const currentArray = listRef.current.toArray();
    
    const newNodes = currentArray.map((value, index) => ({
      id: `node-${index}`,
      position: { x: index * 200, y: 150 }, 
      data: { value },
      type: 'linkedNode',
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
    }));

    const newEdges = [];
    for (let i = 0; i < currentArray.length - 1; i++) {
      newEdges.push({
        id: `edge-${i}-${i + 1}`,
        source: `node-${i}`,       
        target: `node-${i + 1}`,   
        animated: true,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 20,
          height: 20,
          color: '#64748b',
        },
        style: {
          stroke: '#64748b',
          strokeWidth: 2,
        }
      });
    }

    setNodes(newNodes);
    setEdges(newEdges);
  };

  useEffect(() => {
    syncVisuals();
  }, []);

  const handleInsertHead = () => {
    if (!inputValue) return;
    listRef.current.insertAtHead(Number(inputValue));
    syncVisuals();
    setInputValue('');
  };

  const handleInsertTail = () => {
    if (!inputValue) return;
    listRef.current.insertAtTail(Number(inputValue));
    syncVisuals();
    setInputValue('');
  };

  const handleInsertIndex = () => {
    if (!inputValue || !indexValue) return;
    listRef.current.insertAtIndex(Number(indexValue), Number(inputValue));
    syncVisuals();
    setInputValue('');
    setIndexValue('');
  };

  const handleDeleteIndex = () => {
    if (!indexValue) return;
    listRef.current.deleteByIndex(Number(indexValue));
    syncVisuals();
    setIndexValue('');
  };

  const handleDeleteValue = () => {
    if (!inputValue) return;
    listRef.current.deleteByValue(Number(inputValue));
    syncVisuals();
    setInputValue('');
  };

  return (
    <div className="flex h-full w-full flex-col">
    
      <div className="flex flex-col items-center justify-center gap-4 border-b-2 border-slate-200 bg-white p-4">
        
        <div className="flex items-center justify-center gap-4">
          <input 
            type="number" 
            placeholder="Value" 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="rounded border border-slate-300 p-2 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />

          <input 
            type="number" 
            placeholder="Index" 
            value={indexValue}
            onChange={(e) => setIndexValue(e.target.value)}
            className="w-24 rounded border border-slate-300 p-2 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center justify-center flex-wrap gap-4">
          
          <div className="flex items-center justify-center gap-2">
            <button onClick={handleInsertHead} className="rounded bg-blue-500 px-3 py-2 font-bold text-white transition-colors hover:bg-blue-600 active:bg-blue-700">
              Insert at Head
            </button>
            <button onClick={handleInsertTail} className="rounded bg-blue-500 px-3 py-2 font-bold text-white transition-colors hover:bg-blue-600 active:bg-blue-700">
              Insert at Tail
            </button>
            <button onClick={handleInsertIndex} className="rounded bg-blue-500 px-3 py-2 font-bold text-white transition-colors hover:bg-blue-600 active:bg-blue-700">
              Insert at Index
            </button>
          </div>

          <div className="h-8 w-0.5 bg-slate-200"></div>

          <div className="flex items-center justify-center gap-2">
            <button onClick={handleDeleteIndex} className="rounded bg-red-500 px-3 py-2 font-bold text-white transition-colors hover:bg-red-600 active:bg-red-700">
              Delete by Index
            </button>
            <button onClick={handleDeleteValue} className="rounded bg-red-500 px-3 py-2 font-bold text-white transition-colors hover:bg-red-600 active:bg-red-700">
              Delete by Value
            </button>
          </div>
          
        </div>

      </div>

      <div className="grow bg-slate-50">
        <ReactFlow 
          nodes={nodes} 
          edges={edges} 
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange} 
          onEdgesChange={onEdgesChange}
          fitView
        >
          <Background />
          <Controls />
        </ReactFlow>
      </div>
      
    </div>
  );
}