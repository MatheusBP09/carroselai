import { RotateCcw } from "lucide-react";
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
import logo from "@/assets/logo.png";

interface HeaderProps {
  onReset?: () => void;
}

export const Header = ({ onReset }: HeaderProps) => {
  return (
    <header className="w-full bg-card/95 backdrop-blur-sm border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-center sm:text-left">
            <img src={logo} alt="Logo" className="h-10 sm:h-12 w-auto object-contain" />
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-primary">
                Gerador de Carrossel
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground font-medium hidden sm:block">
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