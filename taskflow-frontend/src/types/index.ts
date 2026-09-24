// ============================================
// USUARIOS
// ============================================
export interface Usuario {
  _id: string;
  nombre: string;
  email: string;
}

// ============================================
// EQUIPOS
// ============================================
export interface Equipo {
  _id: string;
  nombre: string;
  lider: Usuario;
  miembros: Usuario[];
}

// ============================================
// PROYECTOS
// ============================================
export interface Proyecto {
  _id: string;
  nombre: string;
  equipo: string | Equipo;
}

// ============================================
// LISTAS (Tablero Kanban)
// ============================================
export interface Lista {
  _id: string;
  nombre: string;
  proyecto: string;
}

// ============================================
// TAREAS
// ============================================
export interface Tarea {
  _id: string;
  titulo: string;
  descripcion?: string;
  lista: string | Lista;
  asignados: Usuario[];
  createdAt?: string;
}

// ============================================
// AUTENTICACIÓN
// ============================================
export interface AuthResponse {
  access_token: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  nombre: string;
  email: string;
  password: string;
}