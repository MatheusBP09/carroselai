import { useCarousel } from '../context/CarouselContext';
import { Header } from './Layout/Header';
import { ProgressIndicator } from './Layout/ProgressIndicator';
import { Step0ApiKey } from '../steps/Step0ApiKey';
import { Step1Identification } from '../steps/Step1Identification';
import { Step2Content } from '../steps/Step2Content';
import { Step3PhotoUpload } from '../steps/Step3PhotoUpload';
import Step4Processing from '../steps/Step4Processing';
import Step5Review from '../steps/Step5Review';
import Step6Download from '../steps/Step6Download';

const stepLabels = [
  'API Config',
  'Identificação',
  'Conteúdo',
  'Foto Perfil',
  'Processamento',
  'Revisão',
  'Download'
];

export const CarouselGenerator = () => {
  const { currentStep, data, updateData, nextStep, prevStep, setCurrentStep, resetCarousel } = useCarousel();

  const handleNext = (updatedData: any) => {
    updateData(updatedData);
    nextStep();
  };

  const handleStepClick = (step: number) => {
    setCurrentStep(step as any);
  };

  const renderCurrentStep = () => {
    const stepProps = {
      data,
      onNext: handleNext,
      onBack: prevStep
    };

    switch (currentStep) {
      case 0:
        return <Step0ApiKey {...stepProps} />;
      case 1:
        return <Step1Identification {...stepProps} />;
      case 2:
        return <Step2Content {...stepProps} />;
      case 3:
        return <Step3PhotoUpload {...stepProps} />;
      case 4:
        return <Step4Processing {...stepProps} />;
      case 5:
        return <Step5Review {...stepProps} />;
      case 6:
        return <Step6Download {...stepProps} />;
      default:
        return <Step0ApiKey {...stepProps} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onReset={resetCarousel} />
      
      <main className="container mx-auto px-6 py-8">
        <ProgressIndicator
          currentStep={currentStep + 1}
          totalSteps={7}
          stepLabels={stepLabels}
          onStepClick={handleStepClick}
        />
        
        <div className="mt-8">
          {renderCurrentStep()}
        </div>
      </main>
    </div>
  );
};