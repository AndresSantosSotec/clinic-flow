import { useState, useEffect } from 'react';
import { X, Download, ZoomIn, ZoomOut, RotateCw, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { documentosService } from '@/services/api';
import { PacienteDocumento } from '@/types/documentos';
import { useToast } from '@/hooks/use-toast';

interface DocumentViewerProps {
  documento: PacienteDocumento | null;
  pacienteId: number;
  open: boolean;
  onClose: () => void;
}

export default function DocumentViewer({
  documento,
  pacienteId,
  open,
  onClose,
}: DocumentViewerProps) {
  const [urlTemporal, setUrlTemporal] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    if (documento && open) {
      cargarUrlTemporal();
    } else {
      setUrlTemporal(null);
      setZoom(100);
      setRotation(0);
    }
  }, [documento, open]);

  const cargarUrlTemporal = async () => {
    if (!documento) return;

    setLoading(true);
    try {
      const response = await documentosService.obtenerUrlTemporal(
        pacienteId,
        documento.id
      );
      setUrlTemporal(response.data.url);
    } catch (error) {
      console.error('Error al obtener URL temporal:', error);
      toast({
        title: 'Error',
        description: 'No se pudo cargar el documento',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDescargar = async () => {
    if (!documento) return;

    try {
      await documentosService.descargar(pacienteId, documento.id);
      toast({
        title: 'Descarga exitosa',
        description: 'El documento se ha descargado correctamente',
      });
    } catch (error) {
      console.error('Error al descargar:', error);
      toast({
        title: 'Error',
        description: 'No se pudo descargar el documento',
        variant: 'destructive',
      });
    }
  };

  const esImagen = documento?.mime_type?.startsWith('image/');
  const esPDF = documento?.mime_type === 'application/pdf';
  const esVideo = documento?.mime_type?.startsWith('video/');

  const renderVisor = () => {
    if (loading) {
      return (
        <div className="flex h-96 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      );
    }

    if (!urlTemporal) {
      return (
        <div className="flex h-96 items-center justify-center text-muted-foreground">
          No se pudo cargar el documento
        </div>
      );
    }

    // Vista previa para imágenes
    if (esImagen) {
      return (
        <div className="flex justify-center overflow-auto bg-gray-100 p-4">
          <img
            src={urlTemporal}
            alt={documento?.nombre_archivo}
            style={{
              transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
              transition: 'transform 0.2s ease',
              maxWidth: '100%',
              height: 'auto',
            }}
            className="shadow-lg"
          />
        </div>
      );
    }

    // Vista previa para PDFs
    if (esPDF) {
      return (
        <div className="h-[600px] w-full">
          <iframe
            src={urlTemporal}
            className="h-full w-full border-0"
            title={documento?.nombre_archivo}
          />
        </div>
      );
    }

    // Vista previa para videos
    if (esVideo) {
      return (
        <div className="flex justify-center bg-black p-4">
          <video
            src={urlTemporal}
            controls
            className="max-h-[600px] w-full max-w-4xl"
            style={{
              transform: `rotate(${rotation}deg)`,
            }}
          >
            Tu navegador no soporta el elemento de video.
          </video>
        </div>
      );
    }

    // Para otros tipos de archivo, mostrar mensaje
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-4 text-center">
        <p className="text-muted-foreground">
          Este tipo de archivo no puede visualizarse en el navegador.
        </p>
        <Button onClick={handleDescargar} className="gap-2">
          <Download className="h-4 w-4" />
          Descargar documento
        </Button>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>{documento?.nombre_archivo}</DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {documento?.categoria?.replace('_', ' ').toUpperCase()} • {documento?.tamanio_legible}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {/* Controles de zoom para imágenes */}
              {esImagen && (
                <>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setZoom(Math.max(25, zoom - 25))}
                    disabled={zoom <= 25}
                  >
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                  <span className="text-sm font-medium">{zoom}%</span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setZoom(Math.min(200, zoom + 25))}
                    disabled={zoom >= 200}
                  >
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                </>
              )}

              {/* Control de rotación para imágenes y videos */}
              {(esImagen || esVideo) && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setRotation((rotation + 90) % 360)}
                >
                  <RotateCw className="h-4 w-4" />
                </Button>
              )}

              {/* Botón de descarga */}
              <Button
                variant="outline"
                size="icon"
                onClick={handleDescargar}
              >
                <Download className="h-4 w-4" />
              </Button>

              {/* Botón cerrar */}
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="mt-4">
          {renderVisor()}
        </div>

        {/* Información adicional del documento */}
        {documento && (
          <div className="mt-4 grid grid-cols-2 gap-4 rounded-lg bg-muted p-4 text-sm md:grid-cols-4">
            <div>
              <p className="font-medium">Tipo</p>
              <p className="text-muted-foreground">{documento.tipo_documento?.replace('_', ' ')}</p>
            </div>
            <div>
              <p className="font-medium">Subido</p>
              <p className="text-muted-foreground">
                {new Date(documento.created_at).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="font-medium">Accesos</p>
              <p className="text-muted-foreground">{documento.total_accesos}</p>
            </div>
            {documento.descripcion && (
              <div className="col-span-2 md:col-span-1">
                <p className="font-medium">Descripción</p>
                <p className="text-muted-foreground truncate">{documento.descripcion}</p>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
