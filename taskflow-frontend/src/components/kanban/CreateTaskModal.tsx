import { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import type { Lista } from '../../types';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (titulo: string, descripcion: string, listaId: string) => Promise<void>;
  listas: Lista[];
  listaPreseleccionada?: string;
}

export const CreateTaskModal = ({
  isOpen,
  onClose,
  onCreate,
  listas,
  listaPreseleccionada,
}: CreateTaskModalProps) => {
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [listaId, setListaId] = useState(listaPreseleccionada || listas[0]?._id || '');
  const [isLoading, setIsLoading] = useState(false);

  const handleCreate = async () => {
    if (!titulo.trim()) return;

    setIsLoading(true);
    try {
      await onCreate(titulo, descripcion, listaId);
      setTitulo('');
      setDescripcion('');
      onClose();
    } catch (error) {
      console.error('Error al crear tarea:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setTitulo('');
    setDescripcion('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Crear Nueva Tarea">
      <div className="space-y-4">
        <Input
          label="Título de la tarea"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          placeholder="Ej: Diseñar la interfaz de usuario"
          onKeyPress={(e) => e.key === 'Enter' && handleCreate()}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Descripción (opcional)
          </label>
          <textarea
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder="Describe los detalles de la tarea..."
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Lista
          </label>
          <select
            value={listaId}
            onChange={(e) => setListaId(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {listas.map((lista) => (
              <option key={lista._id} value={lista._id}>
                {lista.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-end space-x-3 pt-2">
          <Button variant="secondary" onClick={handleClose}>
            Cancelar
          </Button>
          <Button
            onClick={handleCreate}
            disabled={!titulo.trim()}
            isLoading={isLoading}
          >
            Crear Tarea
          </Button>
        </div>
      </div>
    </Modal>
  );
};