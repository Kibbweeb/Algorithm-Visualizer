import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import LinkedListVisualizer from './components/visualizers/LinkedListVisualizer';
import DoublyLinkedListVisualizer from './components/visualizers/DoublyLinkedListVisualizer';
import GeneralTreeVisualizer from './components/visualizers/GeneralTreeVisualizer';
import BstVisualizer from './components/visualizers/BstVisualizer';

export default function App() {
  return (
    <Router>
      <div className="flex h-screen w-screen overflow-hidden bg-white">
        
        <Sidebar />
        
        <div className="flex-1 h-full pt-16 sm:pt-0 sm:ml-64">
          
          <Routes>
            <Route path="/" element={<Navigate to="/linked-list" replace />} />
            <Route path="/linked-list" element={<LinkedListVisualizer />} />
            <Route path="/doubly-linked-list" element={<DoublyLinkedListVisualizer />} />
            <Route path="/general-tree" element={<GeneralTreeVisualizer />} />
            <Route path="/binary-search-tree" element={<BstVisualizer />} />
          </Routes>

        </div>
        
      </div>
    </Router>
  );
}