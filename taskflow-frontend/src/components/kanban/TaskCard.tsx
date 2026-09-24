import { Draggable } from '@hello-pangea/dnd';
import type { Tarea, Usuario } from '../../types';
import { GripVertical, Users } from 'lucide-react';

interface TaskCardProps {
  tarea: Tarea;
  index: number;
  onClick: () => void;
  onAssignClick: () => void;
}

export const TaskCard = ({ tarea, index, onClick, onAssignClick }: TaskCardProps) => {
  return (
    <Draggable draggableId={tarea._id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={`bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-2 cursor-pointer transition-all ${
            snapshot.isDragging ? 'shadow-lg rotate-2' : 'hover:shadow-md'
          }`}
        >
          {/* Header con drag handle */}
          <div className="flex items-start justify-between mb-2">
            <div
              {...provided.dragHandleProps}
              className="flex items-center text-gray-400 hover:text-gray-600"
            >
              <GripVertical className="h-4 w-4" />
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAssignClick();
              }}
              className="text-gray-400 hover:text-blue-600 transition-colors"
            >
              <Users className="h-4 w-4" />
            </button>
          </div>

          {/* Contenido de la tarea */}
          <div onClick={onClick} className="flex-1">
            <h4 className="font-medium text-gray-900 mb-1">{tarea.titulo}</h4>
            {tarea.descripcion && (
              <p className="text-sm text-gray-600 line-clamp-2">{tarea.descripcion}</p>
            )}
          </div>

          {/* Footer con asignados */}
          {tarea.asignados && tarea.asignados.length > 0 && (
            <div className="mt-3 pt-2 border-t border-gray-100">
              <div className="flex items-center space-x-1">
                <div className="flex -space-x-2">
                  {tarea.asignados.slice(0, 3).map((usuario: Usuario) => (
                    <div
                      key={usuario._id}
                      className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-semibold border-2 border-white"
                      title={usuario.nombre}
                    >
                      {usuario.nombre.charAt(0).toUpperCase()}
                    </div>
                  ))}
                  {tarea.asignados.length > 3 && (
                    <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center text-gray-700 text-xs font-semibold border-2 border-white">
                      +{tarea.asignados.length - 3}
                    </div>
                  )}
                </div>
                <span className="text-xs text-gray-500 ml-2">
                  {tarea.asignados.length} asignado{tarea.asignados.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </Draggable>
  );
};