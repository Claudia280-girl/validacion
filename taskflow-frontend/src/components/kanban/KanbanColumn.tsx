import { Droppable } from '@hello-pangea/dnd';
import type { DroppableProvided, DroppableStateSnapshot } from '@hello-pangea/dnd';
import type { Lista, Tarea } from '../../types';
import { TaskCard } from './TaskCard';
import { Plus } from 'lucide-react';
import { Button } from '../ui/Button';

interface KanbanColumnProps {
  lista: Lista;
  tareas: Tarea[];
  onAddTask: () => void;
  onTaskClick: (tarea: Tarea) => void;
  onAssignClick: (tarea: Tarea) => void;
}

export const KanbanColumn = ({
  lista,
  tareas,
  onAddTask,
  onTaskClick,
  onAssignClick,
}: KanbanColumnProps) => {
  return (
    <div className="flex-shrink-0 w-80 bg-gray-50 rounded-lg p-3">
      {/* Header de la columna */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-900">{lista.nombre}</h3>
        <span className="bg-gray-200 text-gray-700 text-xs font-medium px-2 py-1 rounded-full">
          {tareas.length}
        </span>
      </div>

      {/* Zona droppable */}
      <Droppable droppableId={lista._id}>
        {(provided: DroppableProvided, snapshot: DroppableStateSnapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`min-h-[200px] transition-colors rounded-lg ${
              snapshot.isDraggingOver ? 'bg-blue-50' : ''
            }`}
          >
            {tareas.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-sm">
                Arrastra tareas aquí
              </div>
            ) : (
              tareas.map((tarea, index) => (
                <TaskCard
                  key={tarea._id}
                  tarea={tarea}
                  index={index}
                  onClick={() => onTaskClick(tarea)}
                  onAssignClick={() => onAssignClick(tarea)}
                />
              ))
            )}
            {provided.placeholder}
          </div>
        )}
      </Droppable>

      {/* Botón agregar tarea */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onAddTask}
        className="w-full mt-2 text-gray-600 hover:text-gray-900"
      >
        <Plus className="h-4 w-4 mr-2" />
        Agregar tarea
      </Button>
    </div>
  );
};