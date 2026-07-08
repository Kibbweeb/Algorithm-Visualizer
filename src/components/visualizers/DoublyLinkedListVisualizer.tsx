import { useRef, useEffect, useState, useMemo } from 'react';
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
  Handle
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { DoublyLinkedList } from '../../core/DoublyLinkedList';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const DoublyNode = ({ data }: any) => {
  let borderStyle = 'border-slate-800';
  if (data.isCurrent) borderStyle = 'border-orange-500 shadow-lg shadow-orange-200 scale-110 z-10';
  if (data.isNew) borderStyle = 'border-green-500 shadow-lg shadow-green-200 z-10';
  if (data.isDeleting) borderStyle = 'border-red-500 opacity-50 scale-90';

  return (
    <div className={`relative flex min-w-30 items-center justify-center rounded border-2 bg-white px-5 py-3 text-lg font-bold text-slate-900 transition-all duration-300 ${borderStyle} ${data.className || ''}`}>
      
      {data.label && (
        <span className="absolute -top-6 text-xs font-bold uppercase tracking-wider text-slate-600">
          {data.label}
        </span>
      )}

      <Handle type="source" position={Position.Top} id="source-circular-prev" style={{ left: '70%', opacity: 0 }} />
      <Handle type="target" position={Position.Top} id="target-circular-prev" style={{ left: '30%', opacity: 0 }} />
      <Handle type="source" position={Position.Bottom} id="source-circular-next" style={{ left: '30%', opacity: 0 }} />
      <Handle type="target" position={Position.Bottom} id="target-circular-next" style={{ left: '70%', opacity: 0 }} />

      <Handle type="target" position={Position.Left} id="target-next" style={{ top: '35%' }} />
      <Handle type="source" position={Position.Left} id="source-prev" style={{ top: '65%' }} />

      <div className="flex flex-col items-center">
        <span className="text-lg font-bold">{data.value}</span>
      </div>

      <Handle type="source" position={Position.Right} id="source-next" style={{ top: '35%' }} />
      <Handle type="target" position={Position.Right} id="target-prev" style={{ top: '65%' }} />
    </div>
  );
};

export default function DoublyLinkedListVisualizer() {
  const listRef = useRef(new DoublyLinkedList<number>());
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  const [inputValue, setInputValue] = useState<string>('');
  const [indexValue, setIndexValue] = useState<string>('');
  const [isCircular, setIsCircular] = useState<boolean>(false);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);

  const nodeTypes = useMemo(() => ({ doublyNode: DoublyNode }), []);

  const syncVisuals = () => {
    const currentArray = listRef.current.toArray();
    const total = currentArray.length;
    
    const newNodes = currentArray.map((value, index) => {
      let nodeLabel = '';
      if (total === 1) {
        nodeLabel = 'Head & Tail';
      } else if (index === 0) {
        nodeLabel = 'Head';
      } else if (index === total - 1) {
        nodeLabel = 'Tail';
      }

      return {
        id: `node-${index}`,
        position: { x: index * 220, y: 150 }, 
        type: 'doublyNode', 
        data: { 
          value: value, 
          index: index, 
          label: nodeLabel, 
          isCurrent: false, 
          isNew: false, 
          isDeleting: false 
        },      
      };
    });

    const newEdges: Edge[] = [];
    
    for (let i = 0; i < total; i++) {
      if (i < total - 1) {
        newEdges.push({
          id: `edge-next-${i}-${i + 1}`,
          source: `node-${i}`,
          sourceHandle: 'source-next',       
          target: `node-${i + 1}`,   
          targetHandle: 'target-next',
          type: 'straight', 
          animated: true,
          style: { stroke: '#64748b', strokeWidth: 2 },
          markerEnd: { type: MarkerType.ArrowClosed, color: '#64748b' },
        });

        newEdges.push({
          id: `edge-prev-${i + 1}-${i}`,
          source: `node-${i + 1}`, 
          sourceHandle: 'source-prev',      
          target: `node-${i}`,   
          targetHandle: 'target-prev',
          type: 'straight',
          animated: true,
          style: { stroke: '#64748b', strokeWidth: 2, strokeDasharray: '5,5' },
          markerEnd: { type: MarkerType.ArrowClosed, color: '#64748b' },
        });
      }
    }

    if (isCircular && total > 1) {
      newEdges.push({
        id: `edge-circular-next`,
        source: `node-${total - 1}`,
        sourceHandle: 'source-circular-next',
        target: `node-${0}`,
        targetHandle: 'target-circular-next',
        type: 'smoothstep',
        animated: true,
        style: { stroke: '#2563eb', strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#2563eb' },
      });

      newEdges.push({
        id: `edge-circular-prev`,
        source: `node-${0}`,
        sourceHandle: 'source-circular-prev',
        target: `node-${total - 1}`,
        targetHandle: 'target-circular-prev',
        type: 'smoothstep',
        animated: true,
        style: { stroke: '#dc2626', strokeWidth: 2, strokeDasharray: '5,5' },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#dc2626' },
      });
    }

    setNodes(newNodes);
    setEdges(newEdges);
  };

  useEffect(() => {
    syncVisuals();
  }, [isCircular]);

  const handleToggleCircular = () => {
    if (isAnimating) return;
    const nextMode = !isCircular;
    listRef.current.circular = nextMode;
    setIsCircular(nextMode);
    syncVisuals();
  };

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
        type: 'doublyNode',
      },
      ...nds.map(n => ({ ...n, position: { x: n.position.x + 220, y: n.position.y } }))
    ]);
    await sleep(800);

    if (nodes.length > 0) {
      setEdges((eds) => [
        { id: `edge-next-new-0`, source: newNodeId, sourceHandle: 'source-next', target: `node-0`, targetHandle: 'target-next', type: 'straight', animated: true, style: { stroke: '#22c55e', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#22c55e' } },
        { id: `edge-prev-0-new`, source: `node-0`, sourceHandle: 'source-prev', target: newNodeId, targetHandle: 'target-prev', type: 'straight', animated: true, style: { stroke: '#22c55e', strokeWidth: 2, strokeDasharray: '5,5' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#22c55e' } },
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
    const total = listRef.current.toArray().length;

    if (total > 0) {
      if (isCircular) {
        await highlightNode(0);
        if (total > 1) {
          await highlightNode(total - 1);
        }
      } else {
        for (let i = 0; i < total; i++) {
          await highlightNode(i);
        }
      }
    }

    const newNodeId = 'node-new';
    setNodes((nds) => [
      ...nds.map(n => ({ ...n, data: { ...n.data, isCurrent: false } })),
      {
        id: newNodeId,
        position: { x: total * 220, y: 150 },
        data: { value: val, isNew: true, label: 'New' },
        type: 'doublyNode',
      }
    ]);
    await sleep(800);

    if (total > 0) {
      setEdges((eds) => [
        ...eds,
        { id: `edge-next-${total - 1}-new`, source: `node-${total - 1}`, sourceHandle: 'source-next', target: newNodeId, targetHandle: 'target-next', type: 'straight', animated: true, style: { stroke: '#22c55e', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#22c55e' } },
        { id: `edge-prev-new-${total - 1}`, source: newNodeId, sourceHandle: 'source-prev', target: `node-${total - 1}`, targetHandle: 'target-prev', type: 'straight', animated: true, style: { stroke: '#22c55e', strokeWidth: 2, strokeDasharray: '5,5' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#22c55e' } }
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

    if (total > 0) {
      if (targetIndex <= total / 2) {
        for (let i = 0; i <= (targetIndex < total ? targetIndex : total - 1); i++) {
          await highlightNode(i);
        }
      } else {
        if (isCircular) await highlightNode(0);
        for (let i = total - 1; i >= (targetIndex < total ? targetIndex - 1 : targetIndex - 1); i--) {
          await highlightNode(i);
        }
      }
    }

    const newNodeId = 'node-new';
    setNodes((nds) => {
      const updated = nds.map((n, i) => {
        let posX = n.position.x;
        if (i >= targetIndex) posX += 220;
        return { ...n, position: { x: posX, y: n.position.y }, data: { ...n.data, isCurrent: false } };
      });
      return [
        ...updated,
        {
          id: newNodeId,
          position: { x: targetIndex * 220, y: 50 },
          data: { value: val, isNew: true, label: 'New' },
          type: 'doublyNode',
        }
      ];
    });
    await sleep(800);

    setEdges((eds) => {
      const newEdges = eds.filter(e => e.id !== `edge-next-${targetIndex - 1}-${targetIndex}` && e.id !== `edge-prev-${targetIndex}-${targetIndex - 1}`);
      if (targetIndex > 0) {
        newEdges.push(
          { id: `edge-next-to-new`, source: `node-${targetIndex - 1}`, sourceHandle: 'source-next', target: newNodeId, targetHandle: 'target-next', type: 'straight', animated: true, style: { stroke: '#22c55e', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#22c55e' } },
          { id: `edge-prev-from-new`, source: newNodeId, sourceHandle: 'source-prev', target: `node-${targetIndex - 1}`, targetHandle: 'target-prev', type: 'straight', animated: true, style: { stroke: '#22c55e', strokeWidth: 2, strokeDasharray: '5,5' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#22c55e' } }
        );
      }
      if (targetIndex < total) {
        newEdges.push(
          { id: `edge-next-from-new`, source: newNodeId, sourceHandle: 'source-next', target: `node-${targetIndex}`, targetHandle: 'target-next', type: 'straight', animated: true, style: { stroke: '#22c55e', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#22c55e' } },
          { id: `edge-prev-to-new`, source: `node-${targetIndex}`, sourceHandle: 'source-prev', target: newNodeId, targetHandle: 'target-prev', type: 'straight', animated: true, style: { stroke: '#22c55e', strokeWidth: 2, strokeDasharray: '5,5' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#22c55e' } }
        );
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

    if (targetIndex <= total / 2) {
      for (let i = 0; i <= targetIndex; i++) {
        await highlightNode(i);
      }
    } else {
      if (isCircular) await highlightNode(0);
      for (let i = total - 1; i >= targetIndex; i--) {
        await highlightNode(i);
      }
    }

    setNodes((nds) => nds.map((n, i) => ({
      ...n,
      data: { ...n.data, isCurrent: false, isDeleting: i === targetIndex }
    })));
    await sleep(800);

    setEdges((eds) => {
      const filtered = eds.filter(e => e.source !== `node-${targetIndex}` && e.target !== `node-${targetIndex}`);
      if (targetIndex > 0 && targetIndex < total - 1) {
        filtered.push(
          { id: `edge-bypass-next`, source: `node-${targetIndex - 1}`, sourceHandle: 'source-next', target: `node-${targetIndex + 1}`, targetHandle: 'target-next', type: 'straight', animated: true, style: { stroke: '#ef4444', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#ef4444' } },
          { id: `edge-bypass-prev`, source: `node-${targetIndex + 1}`, sourceHandle: 'source-prev', target: `node-${targetIndex - 1}`, targetHandle: 'target-prev', type: 'straight', animated: true, style: { stroke: '#ef4444', strokeWidth: 2, strokeDasharray: '5,5' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#ef4444' } }
        );
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
    const total = currentArray.length;

    if (targetIndex === -1) return;
    setIsAnimating(true);

    // Pencarian By Value tetap dilakukan dari depan (Linear Search konvensional)
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
        filtered.push(
          { id: `edge-bypass-next`, source: `node-${targetIndex - 1}`, sourceHandle: 'source-next', target: `node-${targetIndex + 1}`, targetHandle: 'target-next', type: 'straight', animated: true, style: { stroke: '#ef4444', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#ef4444' } },
          { id: `edge-bypass-prev`, source: `node-${targetIndex + 1}`, sourceHandle: 'source-prev', target: `node-${targetIndex - 1}`, targetHandle: 'target-prev', type: 'straight', animated: true, style: { stroke: '#ef4444', strokeWidth: 2, strokeDasharray: '5,5' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#ef4444' } }
        );
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
        
        <div className="flex w-full flex-col items-stretch justify-center gap-4 sm:flex-row sm:items-center sm:gap-4">
          <div className="flex flex-wrap justify-center gap-2">
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

          <label className={`flex cursor-pointer items-center justify-center gap-2 select-none text-center sm:justify-start ${isAnimating ? 'opacity-50' : ''}`}>
            <input 
              type="checkbox" 
              checked={isCircular} 
              onChange={handleToggleCircular}
              disabled={isAnimating}
              className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm font-bold leading-tight text-slate-700">Circular Mode</span>
          </label>
        </div>

        <div className="flex items-center justify-center flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <button disabled={isAnimating} onClick={handleInsertHead} className="rounded bg-blue-500 px-3 py-2 font-bold text-white transition-colors hover:bg-blue-600 active:bg-blue-700 disabled:opacity-50">
              Insert Head
            </button>
            <button disabled={isAnimating} onClick={handleInsertTail} className="rounded bg-blue-500 px-3 py-2 font-bold text-white transition-colors hover:bg-blue-600 active:bg-blue-700 disabled:opacity-50">
              Insert Tail
            </button>
            <button disabled={isAnimating} onClick={handleInsertIndex} className="rounded bg-blue-500 px-3 py-2 font-bold text-white transition-colors hover:bg-blue-600 active:bg-blue-700 disabled:opacity-50">
              Insert at Index
            </button>
          </div>
          <div className="h-8 w-0.5 bg-slate-200"></div>
          <div className="flex items-center gap-2">
            <button disabled={isAnimating} onClick={handleDeleteIndex} className="rounded bg-red-500 px-3 py-2 font-bold text-white transition-colors hover:bg-red-600 active:bg-red-700 disabled:opacity-50">
              Delete Index
            </button>
            <button disabled={isAnimating} onClick={handleDeleteValue} className="rounded bg-red-500 px-3 py-2 font-bold text-white transition-colors hover:bg-red-600 active:bg-red-700 disabled:opacity-50">
              Delete Value
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
          minZoom={0.2}
        >
          <Background color="#cbd5e1" gap={16} />
          <Controls />
        </ReactFlow>
      </div>
    </div>
  );
}