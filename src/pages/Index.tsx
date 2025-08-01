import { CarouselProvider } from '../context/CarouselContext';
import { CarouselGenerator } from '../components/CarouselGenerator';

const Index = () => {
  return (
    <CarouselProvider>
      <CarouselGenerator />
    </CarouselProvider>
  );
};

export default Index;