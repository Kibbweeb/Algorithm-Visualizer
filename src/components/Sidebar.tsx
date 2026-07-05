import { useState } from 'react';

interface SidebarProps {
  activeAlgorithm: string;
  setActiveAlgorithm: (algo: string) => void;
}

export default function Sidebar({ activeAlgorithm, setActiveAlgorithm }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { id: 'linked-list', name: 'Linked List' },
    { id: 'stack', name: 'Stack (Coming Soon)' },
    { id: 'queue', name: 'Queue (Coming Soon)' },
  ];

  return (
    <>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        type="button" 
        className="absolute top-4 left-4 z-50 inline-flex items-center p-2 ms-3 text-sm rounded-lg sm:hidden bg-white border border-slate-200 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-200"
      >
        <span className="sr-only">Open sidebar</span>
        <svg className="w-6 h-6 text-slate-800" aria-hidden="true" fill="none" viewBox="0 0 24 24">
          <path stroke="currentColor" strokeLinecap="round" strokeWidth="2" d="M5 7h14M5 12h14M5 17h10" />
        </svg>
      </button>

      <aside 
        className={`fixed top-0 left-0 z-40 w-64 h-full transition-transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } sm:translate-x-0`} 
        aria-label="Sidebar"
      >
        <div className="h-full px-3 py-6 overflow-y-auto bg-slate-50 border-r border-slate-200 shadow-sm">
          
          <h2 className="mb-6 px-3 text-xl font-extrabold text-slate-800">
            AlgoVisualizer
          </h2>

          <ul className="space-y-2 font-medium">
            {menuItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => {
                    setActiveAlgorithm(item.id);
                    setIsOpen(false);
                  }}
                  className={`flex w-full items-center p-3 rounded-lg transition-colors ${
                    activeAlgorithm === item.id
                      ? 'bg-blue-500 text-white'
                      : 'text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <span className="ms-3">{item.name}</span>
                </button>
              </li>
            ))}
          </ul>

        </div>
      </aside>

      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)} 
          className="fixed inset-0 z-30 bg-black/50 sm:hidden"
        ></div>
      )}
    </>
  );
}