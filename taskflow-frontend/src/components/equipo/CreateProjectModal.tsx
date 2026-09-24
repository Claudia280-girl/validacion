import { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (nombre: string) => Promise<void>;
}

export const CreateProjectModal = ({ isOpen, onClose, onCreate }: CreateProjectModalProps) => {
  const [nombre, setNombre] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleCreate = async () => {
    if (!nombre.trim()) return;
    
    setIsLoading(true);
    try {
      await onCreate(nombre);
      setNombre('');
      onClose();
    } catch (error) {
      console.error('Error al crear proyecto:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setNombre('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Crear Nuevo Proyecto">
      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          Al crear el proyecto se generarán automáticamente 3 listas: 
          <span className="font-medium"> Por Hacer</span>, 
          <span className="font-medium"> En Progreso</span> y 
          <span className="font-medium"> Hecho</span>.
        </p>

        <Input
          label="Nombre del proyecto"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Ej: Desarrollo de la API"
          onKeyPress={(e) => e.key === 'Enter' && handleCreate()}
        />

        <div className="flex justify-end space-x-3">
          <Button variant="secondary" onClick={handleClose}>
            Cancelar
          </Button>
          <Button 
            onClick={handleCreate} 
            disabled={!nombre.trim()}
            isLoading={isLoading}
          >
            Crear Proyecto
          </Button>
        </div>
      </div>
    </Modal>
  );
};