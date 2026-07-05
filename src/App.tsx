import { useState } from 'react';
import Sidebar from './components/Sidebar';
import LinkedListVisualizer from './components/visualizers/LinkedListVisualizer';

export default function App() {
  const [activeAlgorithm, setActiveAlgorithm] = useState('linked-list');

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-white">
      
      <Sidebar 
        activeAlgorithm={activeAlgorithm} 
        setActiveAlgorithm={setActiveAlgorithm} 
      />
      
      <div className="flex-1 h-full sm:ml-64">
        
        {activeAlgorithm === 'linked-list' && <LinkedListVisualizer />}
        
        {activeAlgorithm === 'stack' && (
          <div className="flex h-full items-center justify-center text-2xl font-bold text-slate-400">
            Halaman Stack Belum Dibuat
          </div>
        )}

        {activeAlgorithm === 'queue' && (
          <div className="flex h-full items-center justify-center text-2xl font-bold text-slate-400">
            Halaman Queue Belum Dibuat
          </div>
        )}

      </div>
      
    </div>
  );
}