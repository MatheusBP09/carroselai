import { CarouselGenerator } from "@/components/CarouselGenerator";
import { CarouselProvider } from "@/context/CarouselContext";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <CarouselProvider>
        <CarouselGenerator />
      </CarouselProvider>
    </div>
  );
};

export default Index;