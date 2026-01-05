"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FaSignOutAlt, FaUserShield, FaCalendarAlt, FaEnvelope, FaCheckCircle, FaTimesCircle, FaArrowLeft } from "react-icons/fa";
import Link from "next/link";

import { auth } from "@/lib/auth";
import { Card, CardHeader, CardBody, Avatar, Button, Divider, Chip } from "@heroui/react";
import ARC from "@/components/UI/ARC";

export default function AdminMe() {
  const { data: session, isPending } = auth.useSession();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    if (!isPending && !session) {
      router.replace("/admin/signin");
    }
  }, [isPending, session, router]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await auth.signOut();
    router.push("/");
  };

  if (isPending) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center gap-4 bg-background">
        <div className="animate-pulse">
          <ARC />
        </div>
        <p className="text-foreground/40 font-medium animate-pulse">Autenticando...</p>
      </div>
    );
  }

  const user = session?.user;
  if (!user) return null;

  return (
    <div className="min-h-screen p-6 md:p-12 relative overflow-hidden">

      <div className="max-w-4xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div className="space-y-2">
            <Link 
              href="/" 
              className="flex items-center gap-2 text-foreground/60 hover:text-primary transition-colors group mb-4"
            >
              <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
              <span>Voltar ao site</span>
            </Link>
            <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
              <FaUserShield className="text-primary" />
              Perfil do Administrador
            </h1>
            <p className="text-foreground/60 text-lg">Gerencie suas informações de acesso e segurança.</p>
          </div>
          
          <Button 
            color="danger" 
            variant="flat" 
            onPress={handleLogout}
            isLoading={isLoggingOut}
            startContent={!isLoggingOut && <FaSignOutAlt />}
            className="font-bold"
          >
            Encerrar Sessão
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Sidebar Info */}
          <Card className="md:col-span-1 border border-foreground/10 bg-background/40 backdrop-blur-xl shadow-xl h-fit">
            <CardBody className="flex flex-col items-center p-8 gap-6">
              <div className="relative">
                <Avatar 
                  src={user.image || ""} 
                  className="w-32 h-32 text-large border-4 border-primary/20"
                  showFallback
                  name={user.name}
                />
                <div className="absolute bottom-1 right-1 bg-success w-6 h-6 rounded-full border-4 border-background" />
              </div>
              
              <div className="text-center space-y-1">
                <h2 className="text-2xl font-bold">{user.name}</h2>
                <Chip 
                  color="primary" 
                  variant="dot" 
                  className="border-none font-bold uppercase tracking-widest text-[10px]"
                >
                  {user.role || "Administrator"}
                </Chip>
              </div>
            </CardBody>
          </Card>

          {/* Main Content */}
          <Card className="md:col-span-2 border border-foreground/10 bg-background/40 backdrop-blur-xl shadow-xl">
            <CardHeader className="px-8 pt-8 flex flex-col items-start gap-1">
              <h3 className="text-xl font-bold">Detalhes da Conta</h3>
              <p className="text-foreground/40 text-sm">Informações técnicas da sua sessão atual.</p>
            </CardHeader>
            
            <CardBody className="p-8 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground/40 uppercase tracking-wider flex items-center gap-2">
                    <FaEnvelope className="text-primary/60" />
                    Endereço de E-mail
                  </label>
                  <p className="font-medium">{user.email}</p>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground/40 uppercase tracking-wider flex items-center gap-2">
                    {user.emailVerified ? <FaCheckCircle className="text-success" /> : <FaTimesCircle className="text-danger" />}
                    Status de Verificação
                  </label>
                  <p className="font-medium">{user.emailVerified ? "Verificado" : "Pendente"}</p>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground/40 uppercase tracking-wider flex items-center gap-2">
                    <FaCalendarAlt className="text-primary/60" />
                    Membro desde
                  </label>
                  <p className="font-medium">{new Date(user.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground/40 uppercase tracking-wider flex items-center gap-2">
                    <FaCalendarAlt className="text-primary/60" />
                    Última Atividade
                  </label>
                  <p className="font-medium">{new Date(user.updatedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                </div>
              </div>

              <Divider className="my-4 opacity-50" />

              <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 space-y-2">
                <h4 className="font-bold text-primary flex items-center gap-2">
                  <FaUserShield />
                  Segurança da Conta
                </h4>
                <p className="text-sm text-foreground/60">
                  Sua conta está protegida por autenticação baseada em sessão. Certifique-se de encerrar a sessão ao usar dispositivos públicos.
                </p>
              </div>
            </CardBody>
            
            {/* <CardFooter className="px-8 pb-8 flex justify-end gap-3">
              <Button variant="bordered" className="font-bold border-foreground/10">
                Alterar Senha
              </Button>
              <Button color="primary" className="font-bold">
                Editar Perfil
              </Button>
            </CardFooter> */}
          </Card>
        </div>

        <div className="mt-12 text-center">
          <p className="text-xs text-foreground/20 uppercase tracking-[0.2em]">
            ARC Studio Management System • v{process.env.NEXT_PUBLIC_APP_VERSION || "1.0.0"}
          </p>
        </div>
      </div>
    </div>
  );
}
