import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import {
    User,
    Mail,
    Shield,
    Key,
    Camera,
    Save,
    CheckCircle2
} from "lucide-react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import api from "@/lib/api";

export default function ProfilePage() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    // Form states
    const [name, setName] = useState(user?.name || "");
    const [email, setEmail] = useState(user?.email || "");
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    if (!user) return null;

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await api.put(`/users/${user.id}`, { name, email });
            toast({
                title: "Perfil actualizado",
                description: "Tus datos básicos se han guardado correctamente.",
            });
            // Update local storage
            const updatedUser = { ...user, name, email };
            localStorage.setItem('user', JSON.stringify(updatedUser));
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error.response?.data?.message || "No se pudo actualizar el perfil.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Las contraseñas nuevas no coinciden.",
            });
            return;
        }

        setIsLoading(true);
        try {
            await api.put(`/users/${user.id}`, {
                password: newPassword,
                current_password: currentPassword
            });
            toast({
                title: "Contraseña actualizada",
                description: "Tu contraseña ha sido cambiada exitosamente.",
            });
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error.response?.data?.message || "No se pudo cambiar la contraseña.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const initials = user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Mi Perfil</h1>
                <p className="text-muted-foreground">
                    Administra tu información personal y configuración de seguridad.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Left column: User info display */}
                <div className="space-y-6">
                    <Card className="overflow-hidden border-none shadow-lg bg-gradient-to-b from-primary/5 to-background">
                        <CardContent className="pt-8 pb-8 flex flex-col items-center text-center">
                            <div className="relative group mb-4">
                                <Avatar className="h-24 w-24 border-4 border-background shadow-xl">
                                    <AvatarFallback className="bg-primary text-primary-foreground text-3xl font-bold">
                                        {initials}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                    <Camera className="h-6 w-6 text-white" />
                                </div>
                            </div>
                            <h2 className="text-xl font-bold">{user.name}</h2>
                            <p className="text-sm text-muted-foreground mb-4">{user.email}</p>

                            <div className="flex flex-wrap justify-center gap-2">
                                {user.roles?.map((role) => (
                                    <Badge key={role.id} variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                                        <Shield className="h-3 w-3 mr-1" />
                                        {role.name}
                                    </Badge>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-semibold">Resumen de cuenta</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Estado</span>
                                <span className="flex items-center text-green-600 font-medium">
                                    <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                                    Activo
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Miembro desde</span>
                                <span>{new Date().toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right column: Edit forms */}
                <div className="md:col-span-2">
                    <Tabs defaultValue="info" className="space-y-6">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="info" className="gap-2">
                                <User className="h-4 w-4" />
                                Información Básica
                            </TabsTrigger>
                            <TabsTrigger value="security" className="gap-2">
                                <Key className="h-4 w-4" />
                                Seguridad
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="info">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Información Personal</CardTitle>
                                    <CardDescription>
                                        Actualiza tu nombre y dirección de correo electrónico.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleUpdateProfile} className="space-y-4">
                                        <div className="grid gap-4 sm:grid-cols-2">
                                            <div className="space-y-2">
                                                <Label htmlFor="name">Nombre completo</Label>
                                                <Input
                                                    id="name"
                                                    value={name}
                                                    onChange={(e) => setName(e.target.value)}
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="email">Correo electrónico</Label>
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="pt-2">
                                            <Button type="submit" className="gap-2" disabled={isLoading}>
                                                {isLoading ? "Guardando..." : "Guardar cambios"}
                                                <Save className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="security">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Cambiar Contraseña</CardTitle>
                                    <CardDescription>
                                        Asegúrate de usar una contraseña segura y única.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleChangePassword} className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="current">Contraseña actual</Label>
                                            <Input
                                                id="current"
                                                type="password"
                                                value={currentPassword}
                                                onChange={(e) => setCurrentPassword(e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div className="grid gap-4 sm:grid-cols-2">
                                            <div className="space-y-2">
                                                <Label htmlFor="new">Nueva contraseña</Label>
                                                <Input
                                                    id="new"
                                                    type="password"
                                                    value={newPassword}
                                                    onChange={(e) => setNewPassword(e.target.value)}
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="confirm">Confirmar contraseña</Label>
                                                <Input
                                                    id="confirm"
                                                    type="password"
                                                    value={confirmPassword}
                                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="pt-2">
                                            <Button type="submit" variant="destructive" className="gap-2" disabled={isLoading}>
                                                {isLoading ? "Actualizando..." : "Actualizar contraseña"}
                                                <Key className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}
