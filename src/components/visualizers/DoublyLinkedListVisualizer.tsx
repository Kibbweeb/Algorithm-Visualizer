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

const DoublyNode = ({ data }: any) => {
  return (
    <div className={`relative flex min-w-30 items-center justify-center rounded border-2 border-black bg-white px-5 py-3 text-lg font-bold text-slate-900 ${data.className || ''}`}>
      {data.label && (
        <span className="absolute -top-5 text-xs font-bold uppercase tracking-wider text-slate-600">
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

  const nodeTypes = useMemo(() => ({ doublyNode: DoublyNode }), []);

  const syncVisuals = () => {
    const currentArray = listRef.current.toArray();
    const total = currentArray.length;
    
    const newNodes = currentArray.map((value, index) => {
      const label = index === 0 ? 'Head' : index === total - 1 ? 'Tail' : '';

      return {
        id: `node-${index}`,
        position: { x: index * 220, y: 150 }, 
        type: 'doublyNode', 
        data: { 
          value: value,
          index: index,
          label,
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
        style: { stroke: '#64748b', strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#64748b' },
      });

      newEdges.push({
        id: `edge-circular-prev`,
        source: `node-${0}`,
        sourceHandle: 'source-circular-prev',
        target: `node-${total - 1}`,
        targetHandle: 'target-circular-prev',
        type: 'smoothstep',
        animated: true,
        style: { stroke: '#64748b', strokeWidth: 2, strokeDasharray: '5,5' },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#64748b' },
      });
    }

    setNodes(newNodes);
    setEdges(newEdges);
  };

  useEffect(() => {
    syncVisuals();
  }, [isCircular]);

  const handleToggleCircular = () => {
    const nextMode = !isCircular;
    listRef.current.circular = nextMode;
    setIsCircular(nextMode);
  };

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
          <div className="flex gap-2">
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

          <label className="flex cursor-pointer items-center gap-2 select-none">
            <input 
              type="checkbox" 
              checked={isCircular} 
              onChange={handleToggleCircular}
              className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm font-bold text-slate-700">Circular Mode</span>
          </label>
        </div>

        <div className="flex items-center justify-center flex-wrap gap-4">
          <div className="flex items-center gap-2">
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
          <div className="flex items-center gap-2">
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
          minZoom={0.2}
        >
          <Background color="#cbd5e1" gap={16} />
          <Controls />
        </ReactFlow>
      </div>
    </div>
  );
}