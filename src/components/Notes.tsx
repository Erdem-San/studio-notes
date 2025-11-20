import { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
}

export default function Notes() {
    const [notes, setNotes] = useState<Note[]>([]);
    const [newNoteTitle, setNewNoteTitle] = useState('');
    const [newNoteContent, setNewNoteContent] = useState('');
    const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
    const [isCreating, setIsCreating] = useState(false);

    useEffect(() => {
        const loadNotes = () => {
            try {
                const savedNotes = localStorage.getItem('stunote-notes');
                if (savedNotes) {
                    const parsedNotes = JSON.parse(savedNotes);
                    // Convert date strings back to Date objects
                    const notesWithDates = parsedNotes.map((note: any) => ({
                        ...note,
                        createdAt: new Date(note.createdAt)
                    }));
                    setNotes(notesWithDates);
                }
            } catch (error) {
                console.error('Error loading notes from localStorage:', error);
            }
        };
        
        loadNotes();
    }, []);

    const saveNotes = (newNotes: Note[]) => {
        try {
            setNotes(newNotes);
            localStorage.setItem('stunote-notes', JSON.stringify(newNotes));
        } catch (error) {
            console.error('Error saving notes to localStorage:', error);
        }
    };

    const handleCreateNote = () => {
        if (!newNoteTitle.trim() && !newNoteContent.trim()) return;
        
        const newNote: Note = {
            id: crypto.randomUUID(),
            title: newNoteTitle.trim() || 'Untitled Note',
            content: newNoteContent,
            createdAt: new Date()
        };
        
        saveNotes([newNote, ...notes]);
        setNewNoteTitle('');
        setNewNoteContent('');
        setSelectedNoteId(newNote.id);
        setIsCreating(false);
    };

    const handleUpdateNote = (id: string, content: string) => {
        const updatedNotes = notes.map(note => 
            note.id === id ? { ...note, content } : note
        );
        saveNotes(updatedNotes);
    };

    const handleDeleteNote = (id: string) => {
        const updatedNotes = notes.filter(note => note.id !== id);
        saveNotes(updatedNotes);
        if (selectedNoteId === id) {
            setSelectedNoteId(updatedNotes.length > 0 ? updatedNotes[0].id : null);
        }
    };

    const selectedNote = notes.find(note => note.id === selectedNoteId) || null;

    return (
        <div className="h-full flex flex-col gap-4">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-medium">Notes</h2>
                <button
                    onClick={() => setIsCreating(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-xl"
                >
                    <Plus className="w-5 h-5" />
                    New Note
                </button>
            </div>

            {isCreating ? (
                <div className="flex flex-col gap-3 p-4 bg-[#1a1a1a] border border-[#303030] rounded-md">
                    <input
                        type="text"
                        value={newNoteTitle}
                        onChange={(e) => setNewNoteTitle(e.target.value)}
                        placeholder="Note title"
                        className="px-3 py-2 bg-[#2a2a2a] border border-[#303030] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-xl"
                        autoFocus
                    />
                    <textarea
                        value={newNoteContent}
                        onChange={(e) => setNewNoteContent(e.target.value)}
                        placeholder="Note content"
                        className="flex-1 p-3 bg-[#2a2a2a] border border-[#303030] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-xl min-h-[100px]"
                    />
                    <div className="flex gap-2 justify-end">
                        <button
                            onClick={() => setIsCreating(false)}
                            className="px-4 py-2 bg-[#303030] text-white rounded-md hover:bg-[#404040] transition-colors text-xl"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleCreateNote}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-xl"
                        >
                            Save
                        </button>
                    </div>
                </div>
            ) : null}

            <div className="flex flex-1 gap-4">
                {/* Notes List */}
                <div className="w-1/3 flex flex-col gap-2 overflow-y-auto max-h-[calc(100vh-200px)]">
                    {notes.map((note) => (
                        <div
                            key={note.id}
                            onClick={() => setSelectedNoteId(note.id)}
                            className={`p-3 bg-[#1a1a1a] border rounded-md cursor-pointer transition-colors ${
                                selectedNoteId === note.id 
                                    ? 'border-blue-500 bg-[#1a2a3a]' 
                                    : 'border-[#303030] hover:border-[#404040]'
                            }`}
                        >
                            <div className="font-medium truncate text-xl">{note.title}</div>
                            <div className="text-base text-gray-400 truncate mt-1">
                                {note.content.substring(0, 50)}{note.content.length > 50 ? '...' : ''}
                            </div>
                            <div className="text-md text-gray-500 mt-2">
                                {note.createdAt.toLocaleDateString()}
                            </div>
                        </div>
                    ))}
                    
                    {notes.length === 0 && (
                        <div className="text-center text-gray-500 py-8 text-xl">
                            No notes yet. Create your first note!
                        </div>
                    )}
                </div>

                {/* Note Detail */}
                <div className="flex-1 flex flex-col">
                    {selectedNote ? (
                        <>
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-2xl font-medium">{selectedNote.title}</h3>
                                <button
                                    onClick={() => handleDeleteNote(selectedNote.id)}
                                    className="p-2 text-red-500 hover:bg-red-500/10 rounded-md transition-colors"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                            <textarea
                                value={selectedNote.content}
                                onChange={(e) => handleUpdateNote(selectedNote.id, e.target.value)}
                                className="flex-1 p-4 bg-[#1a1a1a] border border-[#303030] rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-xl"
                                placeholder="Note content"
                            />
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-gray-500 text-xl">
                            {notes.length > 0 
                                ? 'Select a note to view or edit' 
                                : 'Create a new note to get started'}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}