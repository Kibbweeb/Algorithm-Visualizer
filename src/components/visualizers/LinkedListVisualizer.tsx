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
import '@xyflow/react/dist/style.css';

import { LinkedList } from '../../core/LinkedList';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const LinkedNode = ({ data }: any) => {
  let borderStyle = 'border-black';
  if (data.isCurrent) borderStyle = 'border-orange-500 shadow-lg shadow-orange-200 scale-110 z-10';
  if (data.isNew) borderStyle = 'border-green-500 shadow-lg shadow-green-200 z-10';
  if (data.isDeleting) borderStyle = 'border-red-500 opacity-50 scale-90';

  return (
    <div className={`relative flex min-w-30 items-center justify-center rounded border-2 bg-white px-5 py-2 text-lg font-bold text-slate-900 transition-all duration-300 ${borderStyle}`}>
      {data.label && (
        <span className="absolute -top-5 text-xs font-bold uppercase tracking-wider text-slate-600">
          {data.label}
        </span>
      )}
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
  const [isAnimating, setIsAnimating] = useState<boolean>(false);

  const nodeTypes = useMemo(() => ({ linkedNode: LinkedNode }), []);

  const syncVisuals = () => {
    const currentArray = listRef.current.toArray();
    
    const newNodes = currentArray.map((value: number, index: number) => ({
      id: `node-${index}`,
      position: { x: index * 200, y: 150 }, 
      data: { value, label: index === 0 ? 'Head' : '', isCurrent: false, isNew: false, isDeleting: false },
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

  const highlightNode = async (index: number) => {
    setNodes((nds) => nds.map((n, i) => ({
      ...n,
      data: { ...n.data, isCurrent: i === index }
    })));
    await sleep(600);
  };

  const handleInsertHead = async () => {
    if (!inputValue || isAnimating) return;
    setIsAnimating(true);
    
    const val = Number(inputValue);
    const newNodeId = 'node-new';

    setNodes((nds) => [
      {
        id: newNodeId,
        position: { x: 0, y: 50 }, 
        data: { value: val, isNew: true, label: 'New' },
        type: 'linkedNode',
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
      },
      ...nds.map(n => ({ ...n, position: { x: n.position.x + 200, y: n.position.y } }))
    ]);
    await sleep(800);

    if (nodes.length > 0) {
      setEdges((eds) => [
        {
          id: `edge-new-0`,
          source: newNodeId,
          target: `node-0`,
          animated: true,
          style: { stroke: '#22c55e', strokeWidth: 2 },
          markerEnd: { type: MarkerType.ArrowClosed, color: '#22c55e' }
        },
        ...eds
      ]);
      await sleep(800);
    }

    listRef.current.insertAtHead(val);
    syncVisuals();
    setInputValue('');
    setIsAnimating(false);
  };

  const handleInsertTail = async () => {
    if (!inputValue || isAnimating) return;
    setIsAnimating(true);

    const val = Number(inputValue);
    const currentArray = listRef.current.toArray();
    const total = currentArray.length;

    if (total > 0) {
      for (let i = 0; i < total; i++) {
        await highlightNode(i);
      }
    }

    const newNodeId = 'node-new';
    setNodes((nds) => [
      ...nds.map(n => ({ ...n, data: { ...n.data, isCurrent: false } })),
      {
        id: newNodeId,
        position: { x: total * 200, y: 150 },
        data: { value: val, isNew: true, label: 'New' },
        type: 'linkedNode',
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
      }
    ]);
    await sleep(800);

    if (total > 0) {
      setEdges((eds) => [
        ...eds,
        {
          id: `edge-${total - 1}-new`,
          source: `node-${total - 1}`,
          target: newNodeId,
          animated: true,
          style: { stroke: '#22c55e', strokeWidth: 2 },
          markerEnd: { type: MarkerType.ArrowClosed, color: '#22c55e' }
        }
      ]);
      await sleep(800);
    }

    listRef.current.insertAtTail(val);
    syncVisuals();
    setInputValue('');
    setIsAnimating(false);
  };

  const handleInsertIndex = async () => {
    if (!inputValue || !indexValue || isAnimating) return;
    const targetIndex = Number(indexValue);
    const val = Number(inputValue);
    const total = listRef.current.toArray().length;

    if (targetIndex < 0 || targetIndex > total) return;
    setIsAnimating(true);

    for (let i = 0; i < targetIndex; i++) {
      await highlightNode(i);
    }

    const newNodeId = 'node-new';
    setNodes((nds) => {
      const updated = nds.map((n, i) => {
        let posX = n.position.x;
        if (i >= targetIndex) posX += 200;
        return { ...n, position: { x: posX, y: n.position.y }, data: { ...n.data, isCurrent: false } };
      });
      return [
        ...updated,
        {
          id: newNodeId,
          position: { x: targetIndex * 200, y: 50 },
          data: { value: val, isNew: true, label: 'New' },
          type: 'linkedNode',
          sourcePosition: Position.Right,
          targetPosition: Position.Left,
        }
      ];
    });
    await sleep(800);

    setEdges((eds) => {
      const newEdges = eds.filter(e => e.id !== `edge-${targetIndex - 1}-${targetIndex}`);
      if (targetIndex > 0) {
        newEdges.push({
          id: `edge-to-new`,
          source: `node-${targetIndex - 1}`,
          target: newNodeId,
          animated: true,
          style: { stroke: '#22c55e', strokeWidth: 2 },
          markerEnd: { type: MarkerType.ArrowClosed, color: '#22c55e' }
        });
      }
      if (targetIndex < total) {
        newEdges.push({
          id: `edge-from-new`,
          source: newNodeId,
          target: `node-${targetIndex}`,
          animated: true,
          style: { stroke: '#22c55e', strokeWidth: 2 },
          markerEnd: { type: MarkerType.ArrowClosed, color: '#22c55e' }
        });
      }
      return newEdges;
    });
    await sleep(1000);

    listRef.current.insertAtIndex(targetIndex, val);
    syncVisuals();
    setInputValue('');
    setIndexValue('');
    setIsAnimating(false);
  };

  const handleDeleteIndex = async () => {
    if (!indexValue || isAnimating) return;
    const targetIndex = Number(indexValue);
    const total = listRef.current.toArray().length;

    if (targetIndex < 0 || targetIndex >= total) return;
    setIsAnimating(true);

    for (let i = 0; i <= targetIndex; i++) {
      await highlightNode(i);
    }

    setNodes((nds) => nds.map((n, i) => ({
      ...n,
      data: { ...n.data, isCurrent: false, isDeleting: i === targetIndex }
    })));
    await sleep(800);

    setEdges((eds) => {
      const filtered = eds.filter(e => e.source !== `node-${targetIndex}` && e.target !== `node-${targetIndex}`);
      if (targetIndex > 0 && targetIndex < total - 1) {
        filtered.push({
          id: `edge-bypass`,
          source: `node-${targetIndex - 1}`,
          target: `node-${targetIndex + 1}`,
          animated: true,
          style: { stroke: '#ef4444', strokeWidth: 2, strokeDasharray: '5,5' },
          markerEnd: { type: MarkerType.ArrowClosed, color: '#ef4444' }
        });
      }
      return filtered;
    });
    await sleep(1000);

    listRef.current.deleteByIndex(targetIndex);
    syncVisuals();
    setIndexValue('');
    setIsAnimating(false);
  };

  const handleDeleteValue = async () => {
    if (!inputValue || isAnimating) return;
    const val = Number(inputValue);
    const currentArray = listRef.current.toArray();
    const targetIndex = currentArray.indexOf(val);

    if (targetIndex === -1) return;
    setIsAnimating(true);

    for (let i = 0; i <= targetIndex; i++) {
      await highlightNode(i);
    }

    setNodes((nds) => nds.map((n, i) => ({
      ...n,
      data: { ...n.data, isCurrent: false, isDeleting: i === targetIndex }
    })));
    await sleep(800);

    setEdges((eds) => {
      const filtered = eds.filter(e => e.source !== `node-${targetIndex}` && e.target !== `node-${targetIndex}`);
      if (targetIndex > 0 && targetIndex < currentArray.length - 1) {
        filtered.push({
          id: `edge-bypass`,
          source: `node-${targetIndex - 1}`,
          target: `node-${targetIndex + 1}`,
          animated: true,
          style: { stroke: '#ef4444', strokeWidth: 2, strokeDasharray: '5,5' },
          markerEnd: { type: MarkerType.ArrowClosed, color: '#ef4444' }
        });
      }
      return filtered;
    });
    await sleep(1000);

    listRef.current.deleteByValue(val);
    syncVisuals();
    setInputValue('');
    setIsAnimating(false);
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
            disabled={isAnimating}
            className="rounded border border-slate-300 p-2 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
          />

          <input 
            type="number" 
            placeholder="Index" 
            value={indexValue}
            onChange={(e) => setIndexValue(e.target.value)}
            disabled={isAnimating}
            className="w-24 rounded border border-slate-300 p-2 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
          />
        </div>

        <div className="flex items-center justify-center flex-wrap gap-4">
          
          <div className="flex items-center justify-center gap-2">
            <button disabled={isAnimating} onClick={handleInsertHead} className="rounded bg-blue-500 px-3 py-2 font-bold text-white transition-colors hover:bg-blue-600 active:bg-blue-700 disabled:opacity-50">
              Insert at Head
            </button>
            <button disabled={isAnimating} onClick={handleInsertTail} className="rounded bg-blue-500 px-3 py-2 font-bold text-white transition-colors hover:bg-blue-600 active:bg-blue-700 disabled:opacity-50">
              Insert at Tail
            </button>
            <button disabled={isAnimating} onClick={handleInsertIndex} className="rounded bg-blue-500 px-3 py-2 font-bold text-white transition-colors hover:bg-blue-600 active:bg-blue-700 disabled:opacity-50">
              Insert at Index
            </button>
          </div>

          <div className="h-8 w-0.5 bg-slate-200"></div>

          <div className="flex items-center justify-center gap-2">
            <button disabled={isAnimating} onClick={handleDeleteIndex} className="rounded bg-red-500 px-3 py-2 font-bold text-white transition-colors hover:bg-red-600 active:bg-red-700 disabled:opacity-50">
              Delete by Index
            </button>
            <button disabled={isAnimating} onClick={handleDeleteValue} className="rounded bg-red-500 px-3 py-2 font-bold text-white transition-colors hover:bg-red-600 active:bg-red-700 disabled:opacity-50">
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