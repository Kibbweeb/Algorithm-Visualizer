import { useState } from 'react';
import { NavLink } from 'react-router-dom';

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { id: 'linked-list', name: 'Linked List', path: '/linked-list' },
    { id: 'doubly-linked-list', name: 'Doubly Linked List', path: '/doubly-linked-list' },
    { id: 'general-tree', name: 'General Tree', path: '/general-tree'},
    {id: 'binary-search-tree', name: 'Binary Search Tree', path: '/binary-search-tree'},
  ];

  return (
    <>
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          type="button" 
          className="fixed top-4 left-4 z-50 inline-flex items-center p-2 ms-3 text-sm rounded-lg sm:hidden bg-white border border-slate-200 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-200"
        >
          <span className="sr-only">Open sidebar</span>
          <svg className="w-6 h-6 text-slate-800" aria-hidden="true" fill="none" viewBox="0 0 24 24">
            <path stroke="currentColor" strokeLinecap="round" strokeWidth="2" d="M5 7h14M5 12h14M5 17h10" />
          </svg>
        </button>
      )}

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
                <NavLink
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) =>
                    `flex w-full items-center p-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-blue-500 text-white'
                        : 'text-slate-700 hover:bg-slate-200'
                    }`
                  }
                >
                  <span className="ms-3">{item.name}</span>
                </NavLink>
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