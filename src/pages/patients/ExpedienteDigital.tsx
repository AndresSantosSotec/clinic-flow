import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  Upload,
  Download,
  FileText,
  Eye,
  Trash2,
  Filter,
  Search,
  Folder,
  Clock,
  User,
  Calendar,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { documentosService } from '@/services/api';
import api from '@/lib/api';
import { CATEGORIAS_CONFIG, CategoriaDocumento, PacienteDocumento } from '@/types/documentos';
import UploadDocumentDialog from '@/components/patients/UploadDocumentDialog';
import DocumentViewer from '@/components/patients/DocumentViewer';

export default function ExpedienteDigital() {
  const { id: pacienteId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<PacienteDocumento | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<PacienteDocumento | null>(null);

  // Filtros
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>('todas');
  const [busqueda, setBusqueda] = useState('');
  const [errorShown, setErrorShown] = useState(false);

  // Obtener información del paciente
  const { data: patient } = useQuery({
    queryKey: ['patients', pacienteId],
    queryFn: async () => {
      const response = await api.get(`/patients/${pacienteId}`);
      return response.data;
    },
  });

  // Obtener documentos
  const { data: documentosData, isLoading, error, refetch } = useQuery({
    queryKey: ['documentos', pacienteId, categoriaFiltro],
    queryFn: async () => {
      try {
        const filtros = categoriaFiltro !== 'todas' ? { categoria: categoriaFiltro as CategoriaDocumento } : undefined;
        return await documentosService.listar(Number(pacienteId), filtros);
      } catch (error: any) {
        console.error('Error detallado al cargar documentos:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          message: error.message
        });
        
        // Si la tabla no existe, devolver datos vacíos en lugar de fallar
        if (error.response?.status === 500 || error.response?.status === 404 || error.response?.status === 403) {
          return {
            success: true,
            data: {
              documentos: [],
              total: 0,
              por_categoria: {},
              resumen: {
                total_documentos: 0,
                total_tamanio: 0,
                total_tamanio_legible: '0 Bytes',
              },
            },
          };
        }
        throw error;
      }
    },
    enabled: !!pacienteId,
    retry: false, // No reintentar
    staleTime: 5000, // 5 segundos
  });

  // Mutación para eliminar documento
  const deleteMutation = useMutation({
    mutationFn: ({ docId }: { docId: number }) =>
      documentosService.eliminar(Number(pacienteId), docId),
    onSuccess: () => {
      toast({
        title: 'Documento eliminado',
        description: 'El documento se ha eliminado correctamente',
      });
      queryClient.invalidateQueries({ queryKey: ['documentos', pacienteId] });
      setDeleteDialogOpen(false);
      setDocumentToDelete(null);
    },
    onError: (error: any) => {
      toast({
        title: 'Error al eliminar',
        description: error.response?.data?.message || 'No se pudo eliminar el documento',
        variant: 'destructive',
      });
    },
  });

  // Mostrar error solo una vez cuando el módulo no esté disponible
  useEffect(() => {
    if (error && !errorShown) {
      console.error('Error al cargar documentos:', error);
      const errorResponse = (error as any)?.response;
      
      let title = '⚠️ No se pudieron cargar los documentos';
      let description = 'Verifica la consola del navegador para más detalles';
      
      if (errorResponse?.status === 403) {
        title = '🔒 Sin permisos';
        description = 'No tienes permisos para ver los documentos de este paciente';
      } else if (errorResponse?.status === 500) {
        title = '⚙️ Error del servidor';
        description = 'Asegúrate de que las migraciones se hayan ejecutado: php artisan migrate';
      } else if (errorResponse?.status === 404) {
        title = '❌ Recurso no encontrado';
        description = 'La ruta del backend no existe o no está configurada correctamente';
      }
      
      toast({
        title,
        description,
        variant: 'destructive',
      });
      setErrorShown(true);
    }
  }, [error, errorShown, toast]);

  // Exportar expediente completo
  const handleExportar = async () => {
    try {
      toast({
        title: 'Preparando exportación...',
        description: 'Esto puede tomar unos momentos',
      });
      await documentosService.exportarExpediente(Number(pacienteId));
      toast({
        title: 'Expediente exportado',
        description: 'El expediente se ha descargado correctamente',
      });
    } catch (error) {
      toast({
        title: 'Error al exportar',
        description: 'No se pudo exportar el expediente',
        variant: 'destructive',
      });
    }
  };

  const handleVerDocumento = (documento: PacienteDocumento) => {
    setSelectedDocument(documento);
    setViewerOpen(true);
  };

  const handleEliminarDocumento = (documento: PacienteDocumento) => {
    setDocumentToDelete(documento);
    setDeleteDialogOpen(true);
  };

  // Filtrar documentos por búsqueda
  const documentosFiltrados = documentosData?.data.documentos.filter((doc) => {
    if (!busqueda) return true;
    const searchLower = busqueda.toLowerCase();
    return (
      doc.nombre_archivo.toLowerCase().includes(searchLower) ||
      doc.descripcion?.toLowerCase().includes(searchLower) ||
      doc.tipo_documento?.toLowerCase().includes(searchLower)
    );
  }) || [];

  // Agrupar por categoría
  const documentosPorCategoria = documentosFiltrados.reduce<Record<string, PacienteDocumento[]>>((acc, doc) => {
    if (!acc[doc.categoria]) {
      acc[doc.categoria] = [];
    }
    acc[doc.categoria].push(doc);
    return acc;
  }, {});

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  const totalDocumentos = documentosData?.data?.total || 0;
  const resumen = documentosData?.data?.resumen;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Expediente Digital</h1>
            {patient && (
              <p className="text-sm text-muted-foreground">
                {patient.first_name} {patient.last_name}
              </p>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={handleExportar}>
            <Download className="h-4 w-4" />
            Exportar todo
          </Button>
          <Button className="gap-2" onClick={() => setUploadDialogOpen(true)}>
            <Upload className="h-4 w-4" />
            Subir documentos
          </Button>
        </div>
      </div>

      {/* Resumen */}
      {resumen && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Documentos</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalDocumentos}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tamaño Total</CardTitle>
              <Folder className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{resumen.total_tamanio_legible}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Categorías</CardTitle>
              <Folder className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Object.keys(documentosData?.data.por_categoria || {}).length}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filtros y búsqueda */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar documentos..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            <div className="w-full sm:w-64">
              <Select value={categoriaFiltro} onValueChange={setCategoriaFiltro}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas las categorías</SelectItem>
                  {Object.entries(CATEGORIAS_CONFIG).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      <span className="flex items-center gap-2">
                        <span>{config.icon}</span>
                        <span>{config.label}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de documentos agrupados por categoría */}
      {totalDocumentos === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-2">No hay documentos</p>
            <p className="text-sm text-muted-foreground mb-6">
              Comienza subiendo el primer documento del expediente
            </p>
            <Button onClick={() => setUploadDialogOpen(true)} className="gap-2">
              <Upload className="h-4 w-4" />
              Subir documento
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(documentosPorCategoria).map(([categoria, documentos]) => {
            const config = CATEGORIAS_CONFIG[categoria as CategoriaDocumento];
            return (
              <Card key={categoria}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span>{config?.icon || '📄'}</span>
                    <span>{config?.label || categoria}</span>
                    <Badge variant="secondary" className="ml-2">
                      {documentos.length}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {documentos.map((documento) => (
                      <div
                        key={documento.id}
                        className="flex items-center justify-between rounded-lg border p-4 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <div className="text-2xl mt-1">
                            {documento.icono_tipo || '📄'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium truncate">{documento.nombre_archivo}</h4>
                            <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {new Date(documento.created_at).toLocaleDateString()}
                              </span>
                              <span>•</span>
                              <span>{documento.tamanio_legible}</span>
                              {documento.doctor && (
                                <>
                                  <span>•</span>
                                  <span className="flex items-center gap-1">
                                    <User className="h-3 w-3" />
                                    Dr. {documento.doctor.first_name}
                                  </span>
                                </>
                              )}
                              {documento.es_confidencial && (
                                <>
                                  <span>•</span>
                                  <Badge variant="destructive" className="h-5">
                                    Confidencial
                                  </Badge>
                                </>
                              )}
                            </div>
                            {documento.descripcion && (
                              <p className="text-sm text-muted-foreground mt-1 truncate">
                                {documento.descripcion}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 ml-4">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleVerDocumento(documento)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() =>
                              documentosService.descargar(Number(pacienteId), documento.id)
                            }
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleEliminarDocumento(documento)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Diálogos */}
      <UploadDocumentDialog
        open={uploadDialogOpen}
        onClose={() => setUploadDialogOpen(false)}
        pacienteId={Number(pacienteId)}
        onSuccess={() => refetch()}
      />

      <DocumentViewer
        documento={selectedDocument}
        pacienteId={Number(pacienteId)}
        open={viewerOpen}
        onClose={() => {
          setViewerOpen(false);
          setSelectedDocument(null);
        }}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar documento?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará el documento "{documentToDelete?.nombre_archivo}". El
              documento se archivará y podrá ser recuperado por un administrador si es necesario.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (documentToDelete) {
                  deleteMutation.mutate({ docId: documentToDelete.id });
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
