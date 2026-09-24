import { useNavigate } from 'react-router-dom';
import type { Equipo } from '../../types';
import { ArrowLeft, Users, Crown } from 'lucide-react';

interface TeamHeaderProps {
  equipo: Equipo;
  esLider: boolean;
}

export const TeamHeader = ({ equipo, esLider }: TeamHeaderProps) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
      <button
        onClick={() => navigate('/')}
        className="flex items-center text-gray-500 hover:text-gray-700 mb-4 transition-colors"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Volver al Dashboard
      </button>

      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-3xl font-bold text-gray-900">{equipo.nombre}</h1>
            {esLider && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                <Crown className="h-4 w-4 mr-1" />
                Eres el líder
              </span>
            )}
          </div>
          <p className="text-gray-600 mt-2">
            Liderado por <span className="font-medium">{equipo.lider.nombre}</span>
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-blue-50 px-4 py-2 rounded-lg">
          <Users className="h-5 w-5 text-blue-600" />
          <span className="text-blue-900 font-medium">
            {equipo.miembros.length} miembro{equipo.miembros.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>
    </div>
  );
};