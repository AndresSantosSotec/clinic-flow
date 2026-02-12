import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/contexts/ThemeProvider";
import api from "@/lib/api";
import {
    Moon,
    Sun,
    Monitor,
    Bell,
    Globe,
    Eye,
    Loader2,
    Save,
    RotateCcw
} from "lucide-react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

export default function SettingsPage() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const { theme: currentTheme, fontSize: currentFontSize, setTheme: applyTheme, setFontSize: applyFontSize } = useTheme();

    // State
    const [theme, setTheme] = useState(currentTheme);
    const [fontSize, setFontSize] = useState(currentFontSize);
    const [notifications, setNotifications] = useState(true);
    const [emailNotifications, setEmailNotifications] = useState(false);
    const [language, setLanguage] = useState("es");
    const [timezone, setTimezone] = useState("America/Guatemala");

    // Fetch Preferences
    const { data: preferences, isLoading } = useQuery({
        queryKey: ['user-preferences'],
        queryFn: async () => {
            const response = await api.get('/user/preferences');
            return response.data;
        },
    });

    // Update local state when data loads
    useEffect(() => {
        if (preferences) {
            setTheme(preferences.theme || "system");
            setFontSize(preferences.font_size || "medium");
            setNotifications(preferences.notifications_enabled !== false);
            setEmailNotifications(preferences.email_notifications || false);
            setLanguage(preferences.language || "es");
            setTimezone(preferences.timezone || "America/Guatemala");

            // Also apply from server prefs
            applyTheme(preferences.theme || "system");
            applyFontSize(preferences.font_size || "medium");
        }
    }, [preferences]);

    // Apply theme/font in real-time as user changes them (preview)
    const handleThemeChange = (value: string) => {
        const v = value as 'light' | 'dark' | 'system';
        setTheme(v);
        applyTheme(v);
    };

    const handleFontSizeChange = (value: string) => {
        const v = value as 'small' | 'medium' | 'large';
        setFontSize(v);
        applyFontSize(v);
    };

    // Mutation
    const mutation = useMutation({
        mutationFn: async () => {
            return api.put('/user/preferences', {
                theme,
                font_size: fontSize,
                notifications_enabled: notifications,
                email_notifications: emailNotifications,
                language,
                timezone
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['user-preferences'] });
            toast({
                title: "Preferencias guardadas",
                description: "Tus cambios han sido actualizados correctamente.",
            });
        },
        onError: () => {
            toast({
                variant: "destructive",
                title: "Error",
                description: "No se pudieron guardar los cambios.",
            });
        }
    });

    const handleRestoreDefaults = () => {
        setTheme("system");
        setFontSize("medium");
        setNotifications(true);
        setEmailNotifications(true);
        setLanguage("es");
        setTimezone("America/Guatemala");
        applyTheme("system");
        applyFontSize("medium");
    };

    if (isLoading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-10">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Preferencias</h1>
                <p className="text-muted-foreground">
                    Personaliza tu experiencia de usuario y configuración de la aplicación.
                </p>
            </div>

            {/* Preview Banner */}
            <Card className="border-primary/20 bg-primary/5">
                <CardContent className="pt-4 pb-4">
                    <div className="flex items-center gap-3">
                        <Eye className="h-5 w-5 text-primary" />
                        <div>
                            <p className="text-sm font-medium">Vista previa activa</p>
                            <p className="text-xs text-muted-foreground">
                                Los cambios de tema y tamaño de fuente se aplican en tiempo real.
                                Presiona "Guardar" para persistirlos.
                            </p>
                        </div>
                        <div className="ml-auto flex gap-2">
                            <Badge variant="outline">
                                Tema: {theme === 'light' ? 'Claro' : theme === 'dark' ? 'Oscuro' : 'Sistema'}
                            </Badge>
                            <Badge variant="outline">
                                Fuente: {fontSize === 'small' ? 'Pequeño' : fontSize === 'large' ? 'Grande' : 'Mediano'}
                            </Badge>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid gap-6">
                {/* Appearance */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Eye className="h-5 w-5 text-primary" />
                            <CardTitle>Apariencia</CardTitle>
                        </div>
                        <CardDescription>
                            Configura cómo se ve la aplicación en tu dispositivo.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label className="text-base">Tema del sistema</Label>
                                <p className="text-sm text-muted-foreground">
                                    Elige entre tema claro, oscuro o sincronizar con tu sistema.
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant={theme === 'light' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => handleThemeChange('light')}
                                    className="gap-1.5"
                                >
                                    <Sun className="h-4 w-4" />
                                    Claro
                                </Button>
                                <Button
                                    variant={theme === 'dark' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => handleThemeChange('dark')}
                                    className="gap-1.5"
                                >
                                    <Moon className="h-4 w-4" />
                                    Oscuro
                                </Button>
                                <Button
                                    variant={theme === 'system' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => handleThemeChange('system')}
                                    className="gap-1.5"
                                >
                                    <Monitor className="h-4 w-4" />
                                    Sistema
                                </Button>
                            </div>
                        </div>

                        <Separator />

                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label className="text-base">Tamaño de fuente</Label>
                                <p className="text-sm text-muted-foreground">
                                    Ajusta el tamaño del texto para una mejor lectura.
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant={fontSize === 'small' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => handleFontSizeChange('small')}
                                    className="text-xs"
                                >
                                    A<span className="text-[10px]">a</span>
                                </Button>
                                <Button
                                    variant={fontSize === 'medium' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => handleFontSizeChange('medium')}
                                >
                                    Aa
                                </Button>
                                <Button
                                    variant={fontSize === 'large' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => handleFontSizeChange('large')}
                                    className="text-lg"
                                >
                                    Aa
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Notifications */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Bell className="h-5 w-5 text-primary" />
                            <CardTitle>Notificaciones</CardTitle>
                        </div>
                        <CardDescription>
                            Gestiona qué alertas y avisos deseas recibir.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label className="text-base">Notificaciones de escritorio</Label>
                                <p className="text-sm text-muted-foreground">
                                    Recibir alertas de citas próximas y mensajes en tiempo real.
                                </p>
                            </div>
                            <Switch
                                checked={notifications}
                                onCheckedChange={setNotifications}
                            />
                        </div>

                        <Separator />

                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label className="text-base">Resumen semanal por email</Label>
                                <p className="text-sm text-muted-foreground">
                                    Recibir un reporte semanal con el resumen de actividades.
                                </p>
                            </div>
                            <Switch
                                checked={emailNotifications}
                                onCheckedChange={setEmailNotifications}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Region and Language */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Globe className="h-5 w-5 text-primary" />
                            <CardTitle>Idioma y Región</CardTitle>
                        </div>
                        <CardDescription>
                            Configura tu idioma local y zona horaria.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label className="text-base">Idioma</Label>
                                <p className="text-sm text-muted-foreground">
                                    Selecciona el idioma de la interfaz.
                                </p>
                            </div>
                            <Select value={language} onValueChange={setLanguage}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Idioma" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="es">Español</SelectItem>
                                    <SelectItem value="en">English</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <Separator />

                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label className="text-base">Zona Horaria</Label>
                                <p className="text-sm text-muted-foreground">
                                    Define tu zona horaria para mostrar las fechas correctamente.
                                </p>
                            </div>
                            <Select value={timezone} onValueChange={setTimezone}>
                                <SelectTrigger className="w-[240px]">
                                    <SelectValue placeholder="Zona Horaria" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="America/Guatemala">America/Guatemala (UTC-6)</SelectItem>
                                    <SelectItem value="America/Mexico_City">America/Mexico_City (UTC-6)</SelectItem>
                                    <SelectItem value="America/Bogota">America/Bogota (UTC-5)</SelectItem>
                                    <SelectItem value="America/New_York">America/New_York (UTC-5)</SelectItem>
                                    <SelectItem value="Europe/Madrid">Europe/Madrid (UTC+1)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end gap-4">
                    <Button variant="outline" onClick={handleRestoreDefaults} disabled={mutation.isPending} className="gap-2">
                        <RotateCcw className="h-4 w-4" />
                        Restaurar valores predeterminados
                    </Button>
                    <Button onClick={() => mutation.mutate()} disabled={mutation.isPending} className="gap-2">
                        {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                        <Save className="h-4 w-4" />
                        Guardar preferencias
                    </Button>
                </div>
            </div>
        </div>
    );
}
