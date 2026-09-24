import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DragDropContext } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
import { proyectosService } from '../services/proyectosService';
import { tareasService } from '../services/tareasService';
import { equiposService } from '../services/equiposService';
import type { Lista, Tarea, Proyecto, Equipo } from '../types';
import { KanbanColumn } from '../components/kanban/KanbanColumn';
import { CreateTaskModal } from '../components/kanban/CreateTaskModal';
import { AssignMembersModal } from '../components/kanban/AssignMembersModal';
import { ArrowLeft, Plus } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const KanbanBoard = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [proyecto, setProyecto] = useState<Proyecto | null>(null);
  const [equipo, setEquipo] = useState<Equipo | null>(null);
  const [listas, setListas] = useState<Lista[]>([]);
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [listaPreseleccionada, setListaPreseleccionada] = useState<string>('');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [tareaSeleccionada, setTareaSeleccionada] = useState<Tarea | null>(null);

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  const loadData = async () => {
    if (!id) return;

    try {
      setIsLoading(true);

      // 1. Obtener el proyecto usando el ID de la URL
      const proyectoData = await proyectosService.getById(id);
      setProyecto(proyectoData);

      // 2. Obtener equipo
      const equipoId = typeof proyectoData.equipo === 'string' 
        ? proyectoData.equipo 
        : proyectoData.equipo._id;
      
      const equipoData = await equiposService.getById(equipoId);
      setEquipo(equipoData);

      // 3. Obtener listas
      const listasData = await proyectosService.getListas(id);
      setListas(listasData);

      // 4. Obtener tareas
      const tareasData = await tareasService.getByProyecto(id);
      setTareas(tareasData);
    } catch (error) {
      console.error('Error al cargar datos del proyecto:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    // Si no hay destino o no cambió de posición
    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    // Actualizar UI optimistamente
    const tarea = tareas.find((t) => t._id === draggableId);
    if (!tarea) return;

    const nuevasTareas = tareas.map((t) => {
      if (t._id === draggableId) {
        return { ...t, lista: destination.droppableId };
      }
      return t;
    });

    setTareas(nuevasTareas);

    // Actualizar en el backend
    try {
      await tareasService.mover(draggableId, destination.droppableId);
    } catch (error) {
      console.error('Error al mover tarea:', error);
      // Revertir si falla
      loadData();
    }
  };

  const handleCreateTask = async (titulo: string, descripcion: string, listaId: string) => {
    try {
      const nuevaTarea = await tareasService.create({
        titulo,
        descripcion,
        listaId,
      });
      setTareas([...tareas, nuevaTarea]);
    } catch (error) {
      console.error('Error al crear tarea:', error);
      throw error;
    }
  };

  const handleAssignMembers = async (tareaId: string, miembros: string[]) => {
    try {
      const tareaActualizada = await tareasService.asignarMiembros(tareaId, miembros);
      setTareas(
        tareas.map((t) => (t._id === tareaId ? tareaActualizada : t))
      );
    } catch (error) {
      console.error('Error al asignar miembros:', error);
      throw error;
    }
  };

  const openCreateModal = (listaId: string) => {
    setListaPreseleccionada(listaId);
    setShowCreateModal(true);
  };

  const openAssignModal = (tarea: Tarea) => {
    setTareaSeleccionada(tarea);
    setShowAssignModal(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!proyecto || !equipo) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-500">Proyecto no encontrado</p>
      </div>
    );
  }

  // Agrupar tareas por lista
  const tareasPorLista = listas.reduce((acc, lista) => {
    acc[lista._id] = tareas.filter(
      (t) => (typeof t.lista === 'string' ? t.lista : t.lista._id) === lista._id
    );
    return acc;
  }, {} as Record<string, Tarea[]>);

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate(`/equipos/${typeof proyecto.equipo === 'string' ? proyecto.equipo : proyecto.equipo._id}`)}
              className="flex items-center text-gray-500 hover:text-gray-700 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Volver
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{proyecto.nombre}</h1>
              <p className="text-sm text-gray-500">{equipo.nombre}</p>
            </div>
          </div>

          <Button onClick={() => openCreateModal(listas[0]?._id || '')}>
            <Plus className="h-5 w-5 mr-2" />
            Nueva Tarea
          </Button>
        </div>
      </div>

      {/* Tablero */}
      <div className="flex-1 overflow-x-auto p-6">
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex space-x-4 h-full">
            {listas.map((lista) => (
              <KanbanColumn
                key={lista._id}
                lista={lista}
                tareas={tareasPorLista[lista._id] || []}
                onAddTask={() => openCreateModal(lista._id)}
                onTaskClick={(tarea) => console.log('Ver tarea:', tarea)}
                onAssignClick={openAssignModal}
              />
            ))}
          </div>
        </DragDropContext>
      </div>

      {/* Modales */}
      <CreateTaskModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreateTask}
        listas={listas}
        listaPreseleccionada={listaPreseleccionada}
      />

      <AssignMembersModal
        isOpen={showAssignModal}
        onClose={() => {
          setShowAssignModal(false);
          setTareaSeleccionada(null);
        }}
        onAssign={handleAssignMembers}
        tarea={tareaSeleccionada}
        miembrosDisponibles={equipo.miembros}
      />
    </div>
  );
};