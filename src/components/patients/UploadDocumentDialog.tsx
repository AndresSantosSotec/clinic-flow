import { useState } from 'react';
import { Upload, X, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { documentosService } from '@/services/api';
import { CATEGORIAS_CONFIG, CategoriaDocumento } from '@/types/documentos';

interface UploadDocumentDialogProps {
  open: boolean;
  onClose: () => void;
  pacienteId: number;
  onSuccess?: () => void;
}

export default function UploadDocumentDialog({
  open,
  onClose,
  pacienteId,
  onSuccess,
}: UploadDocumentDialogProps) {
  const [archivos, setArchivos] = useState<File[]>([]);
  const [categoria, setCategoria] = useState<CategoriaDocumento>('consulta');
  const [tipoDocumento, setTipoDocumento] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [fechaDocumento, setFechaDocumento] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [visibleParaPaciente, setVisibleParaPaciente] = useState(false);
  const [esConfidencial, setEsConfidencial] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const config = CATEGORIAS_CONFIG[categoria];

      // Validar extensiones
      const archivosValidos = newFiles.filter((file) => {
        const extension = file.name.split('.').pop()?.toLowerCase();
        const extensionesPermitidas = config.extensiones as readonly string[];
        
        if (!extension || !extensionesPermitidas.includes(extension)) {
          toast({
            title: 'Archivo no válido',
            description: `${file.name} no es un tipo de archivo permitido para esta categoría.`,
            variant: 'destructive',
          });
          return false;
        }

        // Validar tamaño
        if (file.size > config.maxSize) {
          toast({
            title: 'Archivo muy grande',
            description: `${file.name} excede el tamaño máximo permitido.`,
            variant: 'destructive',
          });
          return false;
        }

        return true;
      });

      setArchivos([...archivos, ...archivosValidos]);
    }
  };

  const removeFile = (index: number) => {
    setArchivos(archivos.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (archivos.length === 0) {
      toast({
        title: 'Error',
        description: 'Debes seleccionar al menos un archivo',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);

    try {
      await documentosService.subir(pacienteId, {
        archivos,
        categoria,
        tipo_documento: tipoDocumento || undefined,
        descripcion: descripcion || undefined,
        fecha_documento: fechaDocumento,
        visible_para_paciente: visibleParaPaciente,
        es_confidencial: esConfidencial,
      });

      toast({
        title: 'Documentos subidos',
        description: `${archivos.length} documento(s) subido(s) correctamente`,
      });

      // Resetear formulario
      setArchivos([]);
      setDescripcion('');
      setTipoDocumento('');
      setVisibleParaPaciente(false);
      setEsConfidencial(false);

      onSuccess?.();
      onClose();
    } catch (error: any) {
      console.error('Error al subir documentos:', error);
      toast({
        title: 'Error al subir documentos',
        description: error.response?.data?.message || 'Ocurrió un error inesperado',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const categoriaConfig = CATEGORIAS_CONFIG[categoria];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Subir Documentos Médicos</DialogTitle>
          <DialogDescription>
            Selecciona la categoría y los archivos que deseas subir al expediente del paciente.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Categoría */}
          <div className="space-y-2">
            <Label htmlFor="categoria">Categoría *</Label>
            <Select
              value={categoria}
              onValueChange={(value) => {
                setCategoria(value as CategoriaDocumento);
                setArchivos([]); // Limpiar archivos al cambiar categoría
              }}
            >
              <SelectTrigger id="categoria">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
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
            <p className="text-xs text-muted-foreground">
              Archivos permitidos: {categoriaConfig.extensiones.join(', ').toUpperCase()} • Tamaño
              máximo: {formatFileSize(categoriaConfig.maxSize)}
            </p>
          </div>

          {/* Tipo de documento */}
          <div className="space-y-2">
            <Label htmlFor="tipo">Tipo de documento (opcional)</Label>
            <Input
              id="tipo"
              value={tipoDocumento}
              onChange={(e) => setTipoDocumento(e.target.value)}
              placeholder="Ej: Análisis de sangre, Rayos X..."
            />
          </div>

          {/* Fecha del documento */}
          <div className="space-y-2">
            <Label htmlFor="fecha">Fecha del documento</Label>
            <Input
              id="fecha"
              type="date"
              value={fechaDocumento}
              onChange={(e) => setFechaDocumento(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
            />
          </div>

          {/* Descripción */}
          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción (opcional)</Label>
            <Textarea
              id="descripcion"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Escribe detalles adicionales sobre el documento..."
              rows={3}
            />
          </div>

          {/* Selector de archivos */}
          <div className="space-y-2">
            <Label htmlFor="file-upload">Archivos *</Label>
            <div className="flex items-center gap-2">
              <Input
                id="file-upload"
                type="file"
                onChange={handleFileChange}
                multiple
                accept={categoriaConfig.extensiones.map((ext) => `.${ext}`).join(',')}
                className="cursor-pointer"
              />
            </div>
          </div>

          {/* Lista de archivos seleccionados */}
          {archivos.length > 0 && (
            <div className="space-y-2">
              <Label>Archivos seleccionados ({archivos.length})</Label>
              <div className="max-h-40 space-y-2 overflow-y-auto rounded-md border p-2">
                {archivos.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded bg-muted p-2"
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <FileText className="h-4 w-4 flex-shrink-0" />
                      <div className="overflow-hidden">
                        <p className="truncate text-sm font-medium">{file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFile(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Opciones de privacidad */}
          <div className="space-y-3 rounded-lg border p-4">
            <Label>Opciones de privacidad</Label>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="visible"
                checked={visibleParaPaciente}
                onCheckedChange={(checked) => setVisibleParaPaciente(checked as boolean)}
              />
              <label
                htmlFor="visible"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Visible para el paciente
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="confidencial"
                checked={esConfidencial}
                onCheckedChange={(checked) => setEsConfidencial(checked as boolean)}
              />
              <label
                htmlFor="confidencial"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Documento confidencial (solo médico tratante)
              </label>
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={uploading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={uploading || archivos.length === 0}>
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Subiendo...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Subir {archivos.length > 0 ? `(${archivos.length})` : ''}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
