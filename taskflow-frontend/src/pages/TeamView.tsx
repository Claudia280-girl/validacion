import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { equiposService } from '../services/equiposService';
import { proyectosService } from '../services/proyectosService';
import { useAuthStore } from '../store/useAuthStore';
import type { Equipo, Proyecto } from '../types';
import { TeamHeader } from '../components/equipo/TeamHeader';
import { MembersList } from '../components/equipo/MembersList';
import { InviteMemberModal } from '../components/equipo/InviteMemberModal';
import { ProjectsList } from '../components/equipo/ProjectsList';
import { CreateProjectModal } from '../components/equipo/CreateProjectModal';

export const TeamView = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  
  const [equipo, setEquipo] = useState<Equipo | null>(null);
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showCreateProjectModal, setShowCreateProjectModal] = useState(false);

  const esLider = equipo?.lider._id === user?._id;

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  const loadData = async () => {
    if (!id) return;
    
    try {
      setIsLoading(true);
      const [equipoData, proyectosData] = await Promise.all([
        equiposService.getById(id),
        proyectosService.getByEquipo(id),
      ]);
      setEquipo(equipoData);
      setProyectos(proyectosData);
    } catch (error) {
      console.error('Error al cargar datos del equipo:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInviteMember = async (userId: string) => {
    if (!id) return;
    await equiposService.addMiembro(id, userId);
    await loadData();
  };

  const handleRemoveMember = async (userId: string) => {
    if (!id) return;
    try {
      await equiposService.removeMiembro(id, userId);
      await loadData();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error al eliminar miembro');
    }
  };

  const handleCreateProject = async (nombre: string) => {
    if (!id) return;
    await proyectosService.create(nombre, id);
    await loadData();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!equipo || !user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-500">Equipo no encontrado</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <TeamHeader equipo={equipo} esLider={esLider} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MembersList
          lider={equipo.lider}
          miembros={equipo.miembros}
          usuarioActual={user}
          esLider={esLider}
          onInviteClick={() => setShowInviteModal(true)}
          onRemoveMember={handleRemoveMember}
        />

        <ProjectsList
          proyectos={proyectos}
          onCreateClick={() => setShowCreateProjectModal(true)}
        />
      </div>

      <InviteMemberModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        onInvite={handleInviteMember}
      />

      <CreateProjectModal
        isOpen={showCreateProjectModal}
        onClose={() => setShowCreateProjectModal(false)}
        onCreate={handleCreateProject}
      />
    </div>
  );
};