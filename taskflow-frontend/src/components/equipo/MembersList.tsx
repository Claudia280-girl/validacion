import { useState } from 'react';
import type { Usuario } from '../../types';
import { Button } from '../ui/Button';
import { UserPlus, Trash2, Crown, Mail } from 'lucide-react';

interface MembersListProps {
  lider: Usuario;
  miembros: Usuario[];
  usuarioActual: Usuario;
  esLider: boolean;
  onInviteClick: () => void;
  onRemoveMember: (userId: string) => void;
}

// ✅ Función helper para obtener iniciales de forma segura
const getInitial = (nombre?: string, email?: string): string => {
  if (nombre && nombre.length > 0) {
    return nombre.charAt(0).toUpperCase();
  }
  if (email && email.length > 0) {
    return email.charAt(0).toUpperCase();
  }
  return '?';
};

export const MembersList = ({
  lider,
  miembros,
  usuarioActual,
  esLider,
  onInviteClick,
  onRemoveMember,
}: MembersListProps) => {
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  // ✅ Debug: Ver qué datos estamos recibiendo
  console.log('🔍 Datos del líder:', lider);
  console.log('🔍 Datos de miembros:', miembros);

  const handleRemoveClick = (userId: string) => {
    if (confirmDelete === userId) {
      onRemoveMember(userId);
      setConfirmDelete(null);
    } else {
      setConfirmDelete(userId);
      setTimeout(() => setConfirmDelete(null), 3000);
    }
  };

  // ✅ Filtrar miembros inválidos (por si acaso)
  const miembrosValidos = miembros.filter(m => m && m._id);

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Miembros del Equipo</h2>
        {esLider && (
          <Button size="sm" onClick={onInviteClick}>
            <UserPlus className="h-4 w-4 mr-2" />
            Invitar
          </Button>
        )}
      </div>

      <div className="space-y-3">
        {/* Líder - con manejo defensivo */}
        <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center text-white font-semibold">
              {getInitial(lider?.nombre, lider?.email)}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <p className="font-medium text-gray-900">
                  {lider?.nombre || 'Sin nombre'}
                </p>
                <span className="inline-flex items-center text-xs text-yellow-700">
                  <Crown className="h-3 w-3 mr-1" />
                  Líder
                </span>
              </div>
              <p className="text-sm text-gray-500 flex items-center">
                <Mail className="h-3 w-3 mr-1" />
                {lider?.email || 'Sin email'}
              </p>
            </div>
          </div>
          {lider?._id === usuarioActual?._id && (
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
              Tú
            </span>
          )}
        </div>

        {/* Miembros - con manejo defensivo */}
        {miembrosValidos.map((miembro) => (
          <div
            key={miembro._id}
            className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                {getInitial(miembro.nombre, miembro.email)}
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  {miembro.nombre || 'Usuario'}
                </p>
                <p className="text-sm text-gray-500 flex items-center">
                  <Mail className="h-3 w-3 mr-1" />
                  {miembro.email || 'Sin email'}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {miembro._id === usuarioActual?._id && (
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                  Tú
                </span>
              )}

              {esLider && miembro._id !== lider?._id && (
                <Button
                  variant={confirmDelete === miembro._id ? 'danger' : 'ghost'}
                  size="sm"
                  onClick={() => handleRemoveClick(miembro._id)}
                >
                  <Trash2 className="h-4 w-4" />
                  {confirmDelete === miembro._id && <span className="ml-1">¿Seguro?</span>}
                </Button>
              )}
            </div>
          </div>
        ))}

        {/* Mensaje si hay miembros inválidos */}
        {miembros.length !== miembrosValidos.length && (
          <p className="text-sm text-orange-600 italic">
            ⚠️ Algunos miembros no tienen datos completos
          </p>
        )}
      </div>
    </div>
  );
};