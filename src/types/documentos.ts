export type CategoriaDocumento = 'laboratorio' | 'radiologia' | 'receta' | 'orden_medica' | 'consulta' | 'consentimiento' | 'referencia' | 'reporte_operatorio' | 'alta_medica' | 'historial_clinico' | 'vacunacion' | 'video';

export type TipoDocumento = 
  | 'analisis_sangre'
  | 'analisis_orina'
  | 'biopsia'
  | 'cultivo'
  | 'rayos_x'
  | 'ecografia'
  | 'tomografia'
  | 'resonancia'
  | 'mamografia'
  | 'electrocardiograma'
  | 'receta_medica'
  | 'orden_estudios'
  | 'interconsulta'
  | 'nota_evolucion'
  | 'nota_ingreso'
  | 'nota_egreso'
  | 'consentimiento_informado'
  | 'carta_referencia'
  | 'reporte_quirurgico'
  | 'nota_alta'
  | 'expediente_completo'
  | 'carnet_vacunacion'
  | 'certificado_vacuna'
  | 'video_procedimiento'
  | 'video_consulta'
  | 'otro';

export type TipoAcceso = 'visualizacion' | 'descarga' | 'eliminacion' | 'modificacion' | 'compartir';

export interface PacienteDocumento {
  id: number;
  paciente_id: number;
  doctor_id?: number;
  consulta_id?: number;
  cita_id?: number;
  tipo_documento: TipoDocumento;
  categoria: CategoriaDocumento;
  nombre_archivo: string;
  ruta_storage: string;
  mime_type: string;
  tamanio_bytes: number;
  tamanio_legible?: string;
  icono_tipo?: string;
  extension?: string;
  descripcion?: string;
  fecha_documento?: string;
  es_dicom: boolean;
  metadata?: Record<string, any>;
  hash_sha256: string;
  visible_para_paciente: boolean;
  es_confidencial: boolean;
  subido_por?: number;
  ultimo_acceso_at?: string;
  total_accesos: number;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  
  // Relaciones
  paciente?: any;
  doctor?: any;
  consulta?: any;
  cita?: any;
  usuario_subida?: any;
}

export interface DocumentoAcceso {
  id: number;
  documento_id: number;
  usuario_id: number;
  tipo_acceso: TipoAcceso;
  ip_address?: string;
  user_agent?: string;
  detalles?: Record<string, any>;
  created_at: string;
}

export interface FiltrosDocumentos {
  categoria?: CategoriaDocumento;
  tipo_documento?: TipoDocumento;
  doctor_id?: number;
  consulta_id?: number;
  cita_id?: number;
  fecha_desde?: string;
  fecha_hasta?: string;
  es_confidencial?: boolean;
  visible_para_paciente?: boolean;
  buscar?: string;
}

export interface SubirDocumentoData {
  archivos: File[];
  categoria: CategoriaDocumento;
  tipo_documento?: TipoDocumento;
  descripcion?: string;
  fecha_documento?: string;
  consulta_id?: number;
  cita_id?: number;
  visible_para_paciente?: boolean;
  es_confidencial?: boolean;
}

export interface DocumentosResponse {
  success: boolean;
  data: {
    documentos: PacienteDocumento[];
    total: number;
    por_categoria: Record<CategoriaDocumento, number>;
    resumen: {
      total_documentos: number;
      total_tamanio: number;
      total_tamanio_legible: string;
    };
  };
  message?: string;
}

export interface UrlTemporalResponse {
  success: boolean;
  data: {
    url: string;
    expira_en: string;
    expira_timestamp: number;
  };
  message: string;
}

export const CATEGORIAS_CONFIG = {
  laboratorio: {
    label: 'Laboratorio',
    icon: '🧪',
    color: 'bg-blue-500',
    extensiones: ['pdf', 'xlsx', 'csv', 'jpg', 'png'],
    maxSize: 5 * 1024 * 1024, // 5MB
  },
  radiologia: {
    label: 'Radiología',
    icon: '🩻',
    color: 'bg-purple-500',
    extensiones: ['jpg', 'png', 'dcm', 'pdf'],
    maxSize: 50 * 1024 * 1024, // 50MB
  },
  receta: {
    label: 'Recetas',
    icon: '💊',
    color: 'bg-green-500',
    extensiones: ['pdf', 'jpg', 'png'],
    maxSize: 3 * 1024 * 1024, // 3MB
  },
  orden_medica: {
    label: 'Órdenes Médicas',
    icon: '📋',
    color: 'bg-orange-500',
    extensiones: ['pdf', 'doc', 'docx'],
    maxSize: 5 * 1024 * 1024, // 5MB
  },
  consulta: {
    label: 'Notas de Consulta',
    icon: '📝',
    color: 'bg-teal-500',
    extensiones: ['pdf', 'jpg', 'png', 'doc', 'docx'],
    maxSize: 10 * 1024 * 1024, // 10MB
  },
  consentimiento: {
    label: 'Consentimientos',
    icon: '✍️',
    color: 'bg-indigo-500',
    extensiones: ['pdf'],
    maxSize: 5 * 1024 * 1024, // 5MB
  },
  referencia: {
    label: 'Referencias',
    icon: '🔄',
    color: 'bg-pink-500',
    extensiones: ['pdf', 'doc', 'docx'],
    maxSize: 5 * 1024 * 1024, // 5MB
  },
  reporte_operatorio: {
    label: 'Reportes Operatorios',
    icon: '🏥',
    color: 'bg-red-500',
    extensiones: ['pdf', 'doc', 'docx'],
    maxSize: 10 * 1024 * 1024, // 10MB
  },
  alta_medica: {
    label: 'Altas Médicas',
    icon: '📄',
    color: 'bg-cyan-500',
    extensiones: ['pdf', 'doc', 'docx'],
    maxSize: 5 * 1024 * 1024, // 5MB
  },
  historial_clinico: {
    label: 'Historial Clínico',
    icon: '📚',
    color: 'bg-amber-500',
    extensiones: ['pdf'],
    maxSize: 20 * 1024 * 1024, // 20MB
  },
  vacunacion: {
    label: 'Vacunación',
    icon: '💉',
    color: 'bg-lime-500',
    extensiones: ['pdf', 'jpg', 'png'],
    maxSize: 3 * 1024 * 1024, // 3MB
  },
  video: {
    label: 'Videos',
    icon: '🎥',
    color: 'bg-violet-500',
    extensiones: ['mp4', 'mov', 'avi'],
    maxSize: 500 * 1024 * 1024, // 500MB
  },
} as const;
