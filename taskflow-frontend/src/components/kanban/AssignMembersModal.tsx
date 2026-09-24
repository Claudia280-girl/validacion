import { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import type { Tarea, Usuario } from '../../types';
import { Check, X } from 'lucide-react';

interface AssignMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAssign: (tareaId: string, miembros: string[]) => Promise<void>;
  tarea: Tarea | null;
  miembrosDisponibles: Usuario[];
}

export const AssignMembersModal = ({
  isOpen,
  onClose,
  onAssign,
  tarea,
  miembrosDisponibles,
}: AssignMembersModalProps) => {
  const [seleccionados, setSeleccionados] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (tarea?.asignados) {
      setSeleccionados(tarea.asignados.map((u: Usuario) => u._id));
    } else {
      setSeleccionados([]);
    }
  }, [tarea]);

  const toggleMiembro = (userId: string) => {
    setSeleccionados((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleAssign = async () => {
    if (!tarea) return;

    setIsLoading(true);
    try {
      await onAssign(tarea._id, seleccionados);
      onClose();
    } catch (error) {
      console.error('Error al asignar miembros:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!tarea) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Asignar Miembros">
      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          Selecciona los miembros que trabajarán en esta tarea:
        </p>

        <div className="space-y-2 max-h-64 overflow-y-auto">
          {miembrosDisponibles.map((miembro) => {
            if (!miembro?._id) {
              return null;
            }

            const isSelected = seleccionados.includes(miembro._id);
            const nombre = miembro.nombre?.trim() || 'Usuario';
            const inicial = nombre.charAt(0).toUpperCase();

            return (
              <div
                key={miembro._id}
                onClick={() => toggleMiembro(miembro._id)}
                className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                  isSelected
                    ? 'bg-blue-50 border-2 border-blue-500'
                    : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {inicial}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{nombre}</p>
                    <p className="text-sm text-gray-500">{miembro.email || 'Sin correo'}</p>
                  </div>
                </div>

                {isSelected ? (
                  <Check className="h-5 w-5 text-blue-600" />
                ) : (
                  <X className="h-5 w-5 text-gray-400" />
                )}
              </div>
            );
          })}
        </div>

        <div className="flex justify-between items-center pt-2">
          <p className="text-sm text-gray-600">
            {seleccionados.length} miembro{seleccionados.length !== 1 ? 's' : ''} seleccionado{seleccionados.length !== 1 ? 's' : ''}
          </p>
          <div className="flex space-x-3">
            <Button variant="secondary" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={handleAssign} isLoading={isLoading}>
              Asignar
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};