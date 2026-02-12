import { useState } from "react";
import {
    Moon,
    Sun,
    Monitor,
    Bell,
    Globe,
    Lock,
    Eye,
    Type
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

export default function SettingsPage() {
    const [theme, setTheme] = useState("system");
    const [notifications, setNotifications] = useState(true);
    const [marketingEmails, setMarketingEmails] = useState(false);
    const [language, setLanguage] = useState("es");

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Preferencias</h1>
                <p className="text-muted-foreground">
                    Personaliza tu experiencia de usuario y configuración de la aplicación.
                </p>
            </div>

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
                            <Select value={theme} onValueChange={setTheme}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Seleccionar tema" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="light">
                                        <div className="flex items-center gap-2">
                                            <Sun className="h-4 w-4" />
                                            Claro
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="dark">
                                        <div className="flex items-center gap-2">
                                            <Moon className="h-4 w-4" />
                                            Oscuro
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="system">
                                        <div className="flex items-center gap-2">
                                            <Monitor className="h-4 w-4" />
                                            Sistema
                                        </div>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <Separator />

                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label className="text-base">Tamaño de fuente</Label>
                                <p className="text-sm text-muted-foreground">
                                    Ajusta el tamaño del texto para una mejor lectura.
                                </p>
                            </div>
                            <Select defaultValue="medium">
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Tamaño" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="small">Pequeño</SelectItem>
                                    <SelectItem value="medium">Mediano</SelectItem>
                                    <SelectItem value="large">Grande</SelectItem>
                                </SelectContent>
                            </Select>
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
                                checked={marketingEmails}
                                onCheckedChange={setMarketingEmails}
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
                    </CardContent>
                </Card>

                <div className="flex justify-end gap-4">
                    <Button variant="outline">Restaurar valores predeterminados</Button>
                    <Button>Guardar preferencias</Button>
                </div>
            </div>
        </div>
    );
}
