import type { Proyecto } from '../../types';
import { FolderKanban, Plus } from 'lucide-react';
import { Button } from '../ui/Button';
import { useNavigate } from 'react-router-dom';

interface ProjectsListProps {
  proyectos: Proyecto[];
  onCreateClick: () => void;
}

export const ProjectsList = ({ proyectos, onCreateClick }: ProjectsListProps) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Proyectos</h2>
        <Button size="sm" onClick={onCreateClick}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Proyecto
        </Button>
      </div>

      {proyectos.length === 0 ? (
        <div className="text-center py-8">
          <FolderKanban className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 mb-4">No hay proyectos en este equipo</p>
          <Button onClick={onCreateClick}>
            <Plus className="h-4 w-4 mr-2" />
            Crear Primer Proyecto
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {proyectos.map((proyecto) => (
            <div
              key={proyecto._id}
              onClick={() => navigate(`/proyectos/${proyecto._id}`)}
              className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-gray-900 group-hover:text-blue-600">
                  {proyecto.nombre}
                </h3>
                <FolderKanban className="h-5 w-5 text-gray-400 group-hover:text-blue-600" />
              </div>
              <p className="text-sm text-gray-500 mt-2">
                3 listas: Por Hacer, En Progreso, Hecho
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};