import { useState, useEffect } from 'react';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { cn } from '../lib/utils';
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent, DragOverEvent, DragStartEvent } from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Task {
  id: string;
  text: string;
  status: 'todo' | 'inProgress' | 'done';
}

interface Column {
  id: 'todo' | 'inProgress' | 'done';
  title: string;
}

const columns: Column[] = [
  { id: 'todo', title: 'To Do' },
  { id: 'inProgress', title: 'In Progress' },
  { id: 'done', title: 'Done' },
];

function SortableTask({ task, onDelete }: { task: Task; onDelete: (id: string) => void; }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-3 p-4 bg-[#1a1a1a] border border-[#303030] rounded-md group",
        isDragging && "opacity-50"
      )}
      {...attributes}
    >
      <button
        className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-200"
        {...listeners}
      >
        <GripVertical className="w-5 h-5" />
      </button>
      <span className="flex-1 text-xl">
        {task.text}
      </span>
      <button 
        onClick={() => onDelete(task.id)}
        className="opacity-0 group-hover:opacity-100 p-1.5 text-red-500 hover:bg-red-500/10 rounded transition-all"
      >
        <Trash2 className="w-5 h-5" />
      </button>
    </div>
  );
}

function TaskColumn({ 
  column, 
  tasks,
  onDeleteTask,
  isOver
}: { 
  column: Column; 
  tasks: Task[];
  onDeleteTask: (id: string) => void;
  isOver?: boolean;
}) {
  const { setNodeRef } = useSortable({ 
    id: column.id,
    data: {
      type: 'column',
      column
    }
  });

  return (
    <div 
      ref={setNodeRef} 
      className="flex flex-col gap-4 h-full"
    >
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-xl">{column.title}</h3>
        <span className="bg-[#303030] text-gray-300 text-md px-2 py-1 rounded-full">
          {tasks.length}
        </span>
      </div>
      
      <div 
        className={`flex flex-col gap-3 min-h-[100px] flex-1 ${isOver ? 'border-2 border-dashed border-blue-500 rounded-md p-2 bg-[#1a2a3a]' : 'border-2 border-dashed border-[#303030] rounded-md p-2'}`}
      >
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <SortableTask key={task.id} task={task} onDelete={onDeleteTask} />
          ))}
        </SortableContext>
        
        {tasks.length === 0 && (
          <div className={`text-center text-gray-500 py-8 text-xl rounded-lg flex-1 flex items-center justify-center ${isOver ? 'border-blue-500 bg-[#1a2a3a]' : ''}`}>
            {isOver ? 'Release to drop' : 'Drop tasks here'}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState('');
  const [overId, setOverId] = useState<string | null>(null);

  useEffect(() => {
    const savedTasks = localStorage.getItem('stunote-tasks');
    if (savedTasks) {
      try {
        setTasks(JSON.parse(savedTasks));
      } catch {
        setTasks([]);
      }
    }
  }, []);

  const saveTasks = (newTasks: Task[]) => {
    setTasks(newTasks);
    localStorage.setItem('stunote-tasks', JSON.stringify(newTasks));
  };

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) return;

    const task: Task = {
      id: crypto.randomUUID(),
      text: newTask,
      status: 'todo', // Always add new tasks to todo column
    };

    saveTasks([...tasks, task]);
    setNewTask('');
  };

  const deleteTask = (id: string) => {
    const newTasks = tasks.filter(t => t.id !== id);
    saveTasks(newTasks);
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (_event: DragStartEvent) => {
    // We don't need to use the event parameter
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event;
    
    if (!over) {
      setOverId(null);
      return;
    }
    
    // Check if we're over a column directly
    const overColumn = columns.find(col => col.id === over.id);
    if (overColumn) {
      setOverId(over.id as string);
      return;
    }
    
    // Check if we're over a task, and if so, get its column
    const overTask = tasks.find(task => task.id === over.id);
    if (overTask) {
      setOverId(overTask.status); // Set the column ID as overId
      return;
    }
    
    setOverId(null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setOverId(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Find the task being dragged
    const activeTask = tasks.find(task => task.id === activeId);
    if (!activeTask) return;

    // Check if we're dropping on a column
    const overColumn = columns.find(col => col.id === overId);
    if (overColumn) {
      // Move task to the column
      const newTasks = tasks.map(task => 
        task.id === activeId 
          ? { ...task, status: overColumn.id } 
          : task
      );
      saveTasks(newTasks);
      return;
    }

    // Check if we're dropping on another task
    const overTask = tasks.find(task => task.id === overId);
    if (overTask) {
      // If it's a different column, move the task to that column
      if (overTask.status !== activeTask.status) {
        const newTasks = tasks.map(task => 
          task.id === activeId 
            ? { ...task, status: overTask.status } 
            : task
        );
        saveTasks(newTasks);
        return;
      }
      
      // If it's the same column, reorder the tasks
      const activeIndex = tasks.findIndex(task => task.id === activeId);
      const overIndex = tasks.findIndex(task => task.id === overId);
      
      if (activeIndex !== overIndex) {
        const newTasks = arrayMove(tasks, activeIndex, overIndex);
        saveTasks(newTasks);
      }
    }
  };

  const tasksByColumn = {
    todo: tasks.filter(task => task.status === 'todo'),
    inProgress: tasks.filter(task => task.status === 'inProgress'),
    done: tasks.filter(task => task.status === 'done'),
  };

  return (
    <div className="flex flex-col gap-6 h-full">
      <form onSubmit={addTask} className="flex gap-3">
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="Add a new task..."
          className="flex-1 px-4 py-3 text-xl bg-[#1a1a1a] border border-[#303030] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="p-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
        </button>
      </form>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-3 gap-6 flex-1">
          <SortableContext items={columns.map(c => c.id)}>
            {columns.map(column => (
              <TaskColumn
                key={column.id}
                column={column}
                tasks={tasksByColumn[column.id]}
                onDeleteTask={deleteTask}
                isOver={overId === column.id}
              />
            ))}
          </SortableContext>
        </div>
      </DndContext>
    </div>
  );
}