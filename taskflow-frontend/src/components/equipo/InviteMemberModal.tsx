import { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { authService } from '../../services/authService';
import type { Usuario } from '../../types';
import { Mail, UserCheck, AlertCircle } from 'lucide-react';

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInvite: (userId: string) => Promise<void>;
}

export const InviteMemberModal = ({ isOpen, onClose, onInvite }: InviteMemberModalProps) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [usuarioEncontrado, setUsuarioEncontrado] = useState<Usuario | null>(null);

  const handleSearch = async () => {
    if (!email.trim()) return;
    
    setIsLoading(true);
    setError('');
    setUsuarioEncontrado(null);

    try {
      const usuario = await authService.searchByEmail(email);
      setUsuarioEncontrado(usuario);
    } catch (err: any) {
      setError('No se encontró un usuario con ese email');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInvite = async () => {
    if (!usuarioEncontrado) return;
    
    setIsLoading(true);
    try {
      await onInvite(usuarioEncontrado._id);
      handleClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al invitar al usuario');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    setError('');
    setUsuarioEncontrado(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Invitar Miembro">
      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          Busca a un usuario por su email para invitarlo al equipo.
        </p>

        <div className="flex space-x-2">
          <div className="flex-1">
            <Input
              type="email"
              placeholder="usuario@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail size={20} />}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <Button 
            onClick={handleSearch} 
            isLoading={isLoading}
            disabled={!email.trim()}
          >
            Buscar
          </Button>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm flex items-center">
            <AlertCircle className="h-4 w-4 mr-2" />
            {error}
          </div>
        )}

        {usuarioEncontrado && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-semibold">
                {(usuarioEncontrado.nombre?.trim() || 'Usuario').charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-medium text-gray-900">{usuarioEncontrado.nombre || 'Sin nombre'}</p>
                <p className="text-sm text-gray-500">{usuarioEncontrado.email || 'Sin correo'}</p>
              </div>
            </div>
            <Button 
              onClick={handleInvite} 
              isLoading={isLoading}
              className="w-full"
            >
              <UserCheck className="h-4 w-4 mr-2" />
              Invitar al Equipo
            </Button>
          </div>
        )}

        <div className="flex justify-end pt-2">
          <Button variant="secondary" onClick={handleClose}>
            Cancelar
          </Button>
        </div>
      </div>
    </Modal>
  );
};