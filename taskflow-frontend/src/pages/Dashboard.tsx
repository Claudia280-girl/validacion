import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { equiposService } from '../services/equiposService';
import { useAuthStore } from '../store/useAuthStore';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import type { Equipo } from '../types';
import { Plus, Users, FolderKanban, Crown } from 'lucide-react';

export const Dashboard = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [nombreEquipo, setNombreEquipo] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    loadEquipos();
  }, []);

  const loadEquipos = async () => {
    try {
      const data = await equiposService.getAll();
      setEquipos(data);
    } catch (error) {
      console.error('Error al cargar equipos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateEquipo = async () => {
    if (!nombreEquipo.trim()) return;
    setIsCreating(true);

    try {
      await equiposService.create(nombreEquipo);
      setNombreEquipo('');
      setShowModal(false);
      loadEquipos();
    } catch (error) {
      console.error('Error al crear equipo:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleEquipoClick = (equipoId: string) => {
    navigate(`/equipos/${equipoId}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Bienvenido, {user?.nombre} 👋
          </h1>
          <p className="text-gray-600 mt-1">Tus equipos de trabajo</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="h-5 w-5 mr-2" />
          Nuevo Equipo
        </Button>
      </div>

      {equipos.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
          <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No tienes equipos aún
          </h3>
          <p className="text-gray-500 mb-6">
            Crea tu primer equipo para empezar a colaborar
          </p>
          <Button onClick={() => setShowModal(true)}>
            <Plus className="h-5 w-5 mr-2" />
            Crear Equipo
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {equipos.map((equipo) => {
            const esLider = equipo.lider._id === user?._id;
            
            return (
              <div
                key={equipo._id}
                onClick={() => handleEquipoClick(equipo._id)}
                className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all p-6 cursor-pointer border border-transparent hover:border-blue-200 group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {equipo.nombre}
                      </h3>
                      {esLider && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          <Crown className="h-3 w-3 mr-1" />
                          Líder
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      Liderado por {equipo.lider.nombre}
                    </p>
                  </div>
                  <FolderKanban className="h-5 w-5 text-blue-600" />
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center text-sm text-gray-500">
                    <Users className="h-4 w-4 mr-2" />
                    {equipo.miembros.length} miembro{equipo.miembros.length !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Crear Nuevo Equipo"
      >
        <div className="space-y-4">
          <Input
            label="Nombre del equipo"
            value={nombreEquipo}
            onChange={(e) => setNombreEquipo(e.target.value)}
            placeholder="Ej: Equipo Backend"
          />
          <div className="flex justify-end space-x-3">
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleCreateEquipo} 
              disabled={!nombreEquipo.trim()}
              isLoading={isCreating}
            >
              Crear Equipo
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};