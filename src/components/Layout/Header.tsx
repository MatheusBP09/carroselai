import { Instagram, RotateCcw } from "lucide-react";
import { EnhancedButton } from "@/components/ui/enhanced-button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface HeaderProps {
  onReset?: () => void;
}

export const Header = ({ onReset }: HeaderProps) => {
  return (
    <header className="w-full bg-white/80 backdrop-blur-sm border-b sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-instagram-start via-instagram-middle to-instagram-end flex items-center justify-center shadow-lg">
              <Instagram className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-instagram-start to-instagram-end bg-clip-text text-transparent">
                Gerador de Carrossel
              </h1>
              <p className="text-sm text-muted-foreground">
                Transforme textos longos em carrosséis visuais para Instagram
              </p>
            </div>
          </div>
          
          {onReset && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <EnhancedButton variant="outline" size="sm">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Recomeçar
                </EnhancedButton>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Recomeçar do início?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Todos os dados preenchidos serão perdidos e você voltará ao primeiro passo.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={onReset}>
                    Sim, recomeçar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>
    </header>
  );
};