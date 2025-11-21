import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Notebook, ListTodo, Plus, X } from 'lucide-react';

interface Note {
    id: string;
    title: string;
    content: string;
    createdAt: Date;
}

interface Task {
    id: string;
    text: string;
    status: 'todo' | 'inProgress' | 'done';
}

interface CalendarEntry {
    id: string;
    date: string; // YYYY-MM-DD format
    type: 'note' | 'task' | 'custom';
    referenceId?: string;
    customText?: string;
}

const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const getStatusLabel = (status: 'todo' | 'inProgress' | 'done') => {
    switch (status) {
        case 'todo': return 'To Do';
        case 'inProgress': return 'In Progress';
        case 'done': return 'Done';
    }
};

// Simple Modal Component (No Portal!)
function SimpleModal({ isOpen, onClose, title, children }: {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center">
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-black/80"
                onClick={onClose}
            />
            {/* Modal */}
            <div className="relative z-10 w-full max-w-md bg-[#1a1a1a] border border-[#303030] rounded-lg shadow-xl p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-semibold text-white">{title}</h2>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-[#303030] rounded transition-colors"
                    >
                        <X className="w-6 h-6 text-white" />
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
}

export default function Calendar() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [notes, setNotes] = useState<Note[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [entries, setEntries] = useState<CalendarEntry[]>([]);
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [showMenu, setShowMenu] = useState<string | null>(null);
    const [showNoteDialog, setShowNoteDialog] = useState(false);
    const [showTaskDialog, setShowTaskDialog] = useState(false);
    const [showCustomDialog, setShowCustomDialog] = useState(false);
    const [selectedNoteId, setSelectedNoteId] = useState<string>('');
    const [selectedTaskId, setSelectedTaskId] = useState<string>('');
    const [customText, setCustomText] = useState('');
    const menuRef = useRef<HTMLDivElement>(null);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowMenu(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Load data from localStorage
    useEffect(() => {
        try {
            // Load notes
            const savedNotes = localStorage.getItem('stunote-notes');
            if (savedNotes) {
                const parsedNotes = JSON.parse(savedNotes);
                setNotes(parsedNotes.map((note: any) => ({
                    ...note,
                    createdAt: new Date(note.createdAt)
                })));
            }

            // Load tasks
            const savedTasks = localStorage.getItem('stunote-tasks');
            if (savedTasks) {
                setTasks(JSON.parse(savedTasks));
            }

            // Load calendar entries
            const savedEntries = localStorage.getItem('stunote-calendar');
            if (savedEntries) {
                setEntries(JSON.parse(savedEntries));
            }
        } catch (error) {
            console.error('Error loading data:', error);
        }
    }, []);

    // Save entries to localStorage whenever they change
    useEffect(() => {
        try {
            localStorage.setItem('stunote-calendar', JSON.stringify(entries));
        } catch (error) {
            console.error('Error saving calendar entries:', error);
        }
    }, [entries]);

    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        const days: (number | null)[] = [];

        for (let i = 0; i < startingDayOfWeek; i++) {
            days.push(null);
        }

        for (let i = 1; i <= daysInMonth; i++) {
            days.push(i);
        }

        return days;
    };

    const formatDateKey = (year: number, month: number, day: number) => {
        return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    };

    const getEntriesForDate = (dateKey: string) => {
        return entries.filter(entry => entry.date === dateKey);
    };

    const addEntry = (entry: Omit<CalendarEntry, 'id'>) => {
        const newEntry: CalendarEntry = {
            ...entry,
            id: Date.now().toString()
        };
        setEntries(prev => [...prev, newEntry]);
    };

    const deleteEntry = (entryId: string) => {
        setEntries(prev => prev.filter(e => e.id !== entryId));
    };

    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const handleDayClick = (dateKey: string) => {
        setShowMenu(showMenu === dateKey ? null : dateKey);
        setSelectedDate(dateKey);
    };

    const handleAddNote = () => {
        if (selectedNoteId && selectedDate) {
            addEntry({
                date: selectedDate,
                type: 'note',
                referenceId: selectedNoteId,
            });
            setShowNoteDialog(false);
            setSelectedNoteId('');
            setShowMenu(null);
        }
    };

    const handleAddTask = () => {
        if (selectedTaskId && selectedDate) {
            addEntry({
                date: selectedDate,
                type: 'task',
                referenceId: selectedTaskId,
            });
            setShowTaskDialog(false);
            setSelectedTaskId('');
            setShowMenu(null);
        }
    };

    const handleAddCustom = () => {
        if (customText.trim() && selectedDate) {
            addEntry({
                date: selectedDate,
                type: 'custom',
                customText: customText.trim(),
            });
            setShowCustomDialog(false);
            setCustomText('');
            setShowMenu(null);
        }
    };

    const days = getDaysInMonth(currentDate);
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    return (
        <div className="h-full flex flex-col gap-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-medium">Calendar</h2>
                <div className="flex items-center gap-4">
                    <button
                        onClick={handlePrevMonth}
                        className="p-2 hover:bg-[#303030] rounded-full transition-colors"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <span className="text-2xl font-medium min-w-[200px] text-center">
                        {MONTHS[month]} {year}
                    </span>
                    <button
                        onClick={handleNextMonth}
                        className="p-2 hover:bg-[#303030] rounded-full transition-colors"
                    >
                        <ChevronRight className="w-6 h-6" />
                    </button>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="flex-1 bg-[#1a1a1a] rounded-lg border border-[#303030] p-4">
                {/* Day headers */}
                <div className="grid grid-cols-7 gap-2 mb-2">
                    {DAYS.map(day => (
                        <div key={day} className="text-center font-medium text-gray-400 py-2">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Calendar days */}
                <div className="grid grid-cols-7 gap-2 flex-1">
                    {days.map((day, index) => {
                        if (day === null) {
                            return <div key={`empty-${index}`} className="min-h-[120px]" />;
                        }

                        const dateKey = formatDateKey(year, month, day);
                        const dayEntries = getEntriesForDate(dateKey);
                        const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();

                        return (
                            <div key={dateKey} className="relative">
                                <div
                                    className={`min-h-[120px] p-2 rounded-md border cursor-pointer transition-colors ${isToday
                                        ? 'border-blue-500 bg-blue-500/10'
                                        : 'border-[#303030] hover:border-[#404040] hover:bg-[#202020]'
                                        }`}
                                    onClick={() => handleDayClick(dateKey)}
                                >
                                    <div className="font-medium mb-2 text-lg">{day}</div>
                                    <div className="flex flex-col gap-1">
                                        {dayEntries.map(entry => {
                                            const note = entry.type === 'note' ? notes.find(n => n.id === entry.referenceId) : null;
                                            const task = entry.type === 'task' ? tasks.find(t => t.id === entry.referenceId) : null;

                                            return (
                                                <div
                                                    key={entry.id}
                                                    className={`group relative text-xs px-2 py-1 rounded truncate ${entry.type === 'note'
                                                        ? 'bg-blue-600/20 text-blue-300 hover:bg-blue-600/30'
                                                        : entry.type === 'task'
                                                            ? 'bg-green-600/20 text-green-300 hover:bg-green-600/30'
                                                            : 'bg-purple-600/20 text-purple-300 hover:bg-purple-600/30'
                                                        }`}
                                                >
                                                    <span className="flex items-center gap-1">
                                                        {entry.type === 'note' && <Notebook className="w-3 h-3" />}
                                                        {entry.type === 'task' && <ListTodo className="w-3 h-3" />}
                                                        {note?.title || task?.text || entry.customText}
                                                    </span>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            deleteEntry(entry.id);
                                                        }}
                                                        className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Simple dropdown menu */}
                                {showMenu === dateKey && (
                                    <div
                                        ref={menuRef}
                                        className="absolute top-full left-0 mt-1 w-48 bg-[#1a1a1a] border border-[#303030] rounded-md shadow-lg z-50"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <button
                                            onClick={() => { setShowNoteDialog(true); setShowMenu(null); }}
                                            className="w-full text-left px-4 py-2 hover:bg-[#303030] flex items-center gap-2 text-white"
                                        >
                                            <Notebook className="w-4 h-4" />
                                            Add Note
                                        </button>
                                        <button
                                            onClick={() => { setShowTaskDialog(true); setShowMenu(null); }}
                                            className="w-full text-left px-4 py-2 hover:bg-[#303030] flex items-center gap-2 text-white"
                                        >
                                            <ListTodo className="w-4 h-4" />
                                            Add Task
                                        </button>
                                        <div className="border-t border-[#303030]" />
                                        <button
                                            onClick={() => { setShowCustomDialog(true); setShowMenu(null); }}
                                            className="w-full text-left px-4 py-2 hover:bg-[#303030] flex items-center gap-2 text-white"
                                        >
                                            <Plus className="w-4 h-4" />
                                            Add Custom
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Note Selection Modal */}
            <SimpleModal
                isOpen={showNoteDialog}
                onClose={() => setShowNoteDialog(false)}
                title="Select a Note"
            >
                <div className="space-y-4">
                    <select
                        value={selectedNoteId}
                        onChange={(e) => setSelectedNoteId(e.target.value)}
                        className="w-full px-4 py-2 bg-[#2a2a2a] border border-[#303030] rounded-md text-white text-xl"
                    >
                        <option value="">Choose a note</option>
                        {notes.map(note => (
                            <option key={note.id} value={note.id}>
                                {note.title}
                            </option>
                        ))}
                    </select>
                    <div className="flex gap-2 justify-end">
                        <button
                            onClick={() => setShowNoteDialog(false)}
                            className="px-4 py-2 bg-[#303030] text-white rounded-md hover:bg-[#404040] transition-colors text-xl"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleAddNote}
                            disabled={!selectedNoteId}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-xl"
                        >
                            Add
                        </button>
                    </div>
                </div>
            </SimpleModal>

            {/* Task Selection Modal */}
            <SimpleModal
                isOpen={showTaskDialog}
                onClose={() => setShowTaskDialog(false)}
                title="Select a Task"
            >
                <div className="space-y-4">
                    <select
                        value={selectedTaskId}
                        onChange={(e) => setSelectedTaskId(e.target.value)}
                        className="w-full px-4 py-2 bg-[#2a2a2a] border border-[#303030] rounded-md text-white text-xl"
                    >
                        <option value="">Choose a task</option>
                        {tasks.map(task => (
                            <option key={task.id} value={task.id}>
                                {task.text} ({getStatusLabel(task.status)})
                            </option>
                        ))}
                    </select>
                    <div className="flex gap-2 justify-end">
                        <button
                            onClick={() => setShowTaskDialog(false)}
                            className="px-4 py-2 bg-[#303030] text-white rounded-md hover:bg-[#404040] transition-colors text-xl"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleAddTask}
                            disabled={!selectedTaskId}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-xl"
                        >
                            Add
                        </button>
                    </div>
                </div>
            </SimpleModal>

            {/* Custom Entry Modal */}
            <SimpleModal
                isOpen={showCustomDialog}
                onClose={() => setShowCustomDialog(false)}
                title="Add Custom Entry"
            >
                <div className="space-y-4">
                    <input
                        type="text"
                        value={customText}
                        onChange={(e) => setCustomText(e.target.value)}
                        placeholder="Enter custom text..."
                        className="w-full px-4 py-2 bg-[#2a2a2a] border border-[#303030] rounded-md text-white text-xl"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                handleAddCustom();
                            }
                        }}
                    />
                    <div className="flex gap-2 justify-end">
                        <button
                            onClick={() => setShowCustomDialog(false)}
                            className="px-4 py-2 bg-[#303030] text-white rounded-md hover:bg-[#404040] transition-colors text-xl"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleAddCustom}
                            disabled={!customText.trim()}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-xl"
                        >
                            Add
                        </button>
                    </div>
                </div>
            </SimpleModal>
        </div>
    );
}
