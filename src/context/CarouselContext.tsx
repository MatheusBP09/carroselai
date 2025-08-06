import React, { createContext, useContext, useState, ReactNode } from 'react';
import { CarouselData, Step } from '../types/carousel';

interface CarouselContextType {
  currentStep: Step;
  data: CarouselData;
  setCurrentStep: (step: Step) => void;
  updateData: (newData: Partial<CarouselData>) => void;
  nextStep: () => void;
  prevStep: () => void;
  resetCarousel: () => void;
}

const CarouselContext = createContext<CarouselContextType | undefined>(undefined);

const initialData: CarouselData = {
  title: '',
  username: '',
  instagramHandle: '',
  isVerified: false,
  content: '',
  slideCount: 10,
  contentType: 'educational',
  contentFormat: 'feed',
  callToAction: 'follow',
  copywritingFramework: 'aida',
  profileImage: undefined,
  slides: undefined,
  caption: undefined,
  hashtags: undefined
};

export const CarouselProvider = ({ children }: { children: ReactNode }) => {
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [data, setData] = useState<CarouselData>(initialData);

  const updateData = (newData: Partial<CarouselData>) => {
    setData(prev => ({ ...prev, ...newData }));
  };

  const nextStep = () => {
    if (currentStep < 6) {
      setCurrentStep((prev) => (prev + 1) as Step);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as Step);
    }
  };

  const resetCarousel = () => {
    setCurrentStep(1);
    setData(initialData);
  };

  return (
    <CarouselContext.Provider
      value={{
        currentStep,
        data,
        setCurrentStep,
        updateData,
        nextStep,
        prevStep,
        resetCarousel,
      }}
    >
      {children}
    </CarouselContext.Provider>
  );
};

export const useCarousel = () => {
  const context = useContext(CarouselContext);
  if (context === undefined) {
    throw new Error('useCarousel must be used within a CarouselProvider');
  }
  return context;
};