import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

export interface CalendarEntry {
    id: string;
    date: string; // ISO date format (YYYY-MM-DD)
    type: 'note' | 'task' | 'custom';
    referenceId?: string; // ID of note or task
    customText?: string; // For custom entries
    createdAt: Date;
}

interface CalendarContextType {
    entries: CalendarEntry[];
    addEntry: (entry: Omit<CalendarEntry, 'id' | 'createdAt'>) => void;
    deleteEntry: (id: string) => void;
    getEntriesForDate: (date: string) => CalendarEntry[];
    navigateToNote: ((noteId: string) => void) | null;
    navigateToTask: ((taskId: string) => void) | null;
    setNavigateToNote: (fn: (noteId: string) => void) => void;
    setNavigateToTask: (fn: (taskId: string) => void) => void;
}

const CalendarContext = createContext<CalendarContextType | undefined>(undefined);

export function CalendarProvider({ children }: { children: ReactNode }) {
    const [entries, setEntries] = useState<CalendarEntry[]>([]);
    const [navigateToNote, setNavigateToNote] = useState<((noteId: string) => void) | null>(null);
    const [navigateToTask, setNavigateToTask] = useState<((taskId: string) => void) | null>(null);

    // Load entries from localStorage on mount
    useEffect(() => {
        try {
            const savedEntries = localStorage.getItem('stunote-calendar');
            if (savedEntries) {
                const parsedEntries = JSON.parse(savedEntries);
                const entriesWithDates = parsedEntries.map((entry: any) => ({
                    ...entry,
                    createdAt: new Date(entry.createdAt)
                }));
                setEntries(entriesWithDates);
            }
        } catch (error) {
            console.error('Error loading calendar entries:', error);
        }
    }, []);

    const saveEntries = (newEntries: CalendarEntry[]) => {
        try {
            setEntries(newEntries);
            localStorage.setItem('stunote-calendar', JSON.stringify(newEntries));
        } catch (error) {
            console.error('Error saving calendar entries:', error);
        }
    };

    const addEntry = (entry: Omit<CalendarEntry, 'id' | 'createdAt'>) => {
        const newEntry: CalendarEntry = {
            ...entry,
            id: crypto.randomUUID(),
            createdAt: new Date()
        };
        saveEntries([...entries, newEntry]);
    };

    const deleteEntry = (id: string) => {
        saveEntries(entries.filter(entry => entry.id !== id));
    };

    const getEntriesForDate = (date: string) => {
        return entries.filter(entry => entry.date === date);
    };

    return (
        <CalendarContext.Provider
            value={{
                entries,
                addEntry,
                deleteEntry,
                getEntriesForDate,
                navigateToNote,
                navigateToTask,
                setNavigateToNote: (fn) => setNavigateToNote(() => fn),
                setNavigateToTask: (fn) => setNavigateToTask(() => fn),
            }}
        >
            {children}
        </CalendarContext.Provider>
    );
}

export function useCalendar() {
    const context = useContext(CalendarContext);
    if (context === undefined) {
        throw new Error('useCalendar must be used within a CalendarProvider');
    }
    return context;
}
