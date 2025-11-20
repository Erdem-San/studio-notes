import { useEffect, useState } from 'react';
import { X, Notebook, ListTodo } from 'lucide-react';
import { cn } from './lib/utils';
import Notes from './components/Notes';
import Tasks from './components/Tasks';

function App() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'notes' | 'tasks'>('notes');

  useEffect(() => {
    const handleToggle = () => setIsOpen((prev) => !prev);
    window.addEventListener('stunote-toggle', handleToggle);
    return () => window.removeEventListener('stunote-toggle', handleToggle);
  }, []);

  return (
    <div
      className={cn(
        "fixed inset-y-0 right-0 z-[9999] w-2/3 bg-[#0f0f0f] text-white border-l border-[#303030] shadow-2xl transform transition-transform duration-300 ease-in-out font-roboto",
        isOpen ? "translate-x-0" : "translate-x-full",
        "dark" // Force dark mode
      )}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#303030]">
          <h2 className="text-2xl font-medium">Studio Notes</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-[#303030] rounded-full transition-colors text-[#aaa] hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="px-6 pt-4">
          <div className="flex p-1 bg-[#202020] rounded-lg">
            <button
              onClick={() => setActiveTab('notes')}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-3 text-lg font-medium rounded-md transition-all",
                activeTab === 'notes'
                  ? "bg-[#303030] text-white shadow-sm"
                  : "text-[#aaa] hover:text-white hover:bg-[#282828]"
              )}
            >
              <Notebook className="w-5 h-5" />
              Notes
            </button>
            <button
              onClick={() => setActiveTab('tasks')}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-3 text-lg font-medium rounded-md transition-all",
                activeTab === 'tasks'
                  ? "bg-[#303030] text-white shadow-sm"
                  : "text-[#aaa] hover:text-white hover:bg-[#282828]"
              )}
            >
              <ListTodo className="w-5 h-5" />
              Tasks
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'notes' ? <Notes /> : <Tasks />}
        </div>
      </div>
    </div>
  );
}

export default App;