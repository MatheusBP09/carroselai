import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, AlertTriangle, TestTube } from 'lucide-react';
import { testCarouselExport, validateCarouselData } from '@/services/carouselTestService';
import { Slide } from '@/types/carousel';

interface CarouselTestRunnerProps {
  username: string;
  handle: string;
  isVerified: boolean;
  slides: Slide[];
}

export const CarouselTestRunner: React.FC<CarouselTestRunnerProps> = ({
  username,
  handle,
  isVerified,
  slides
}) => {
  const [testing, setTesting] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);
  const [progress, setProgress] = useState(0);

  const runTests = async () => {
    setTesting(true);
    setProgress(0);
    setTestResults(null);

    try {
      // Quick validation first
      const validation = validateCarouselData({ username, handle, isVerified, slides });
      
      if (!validation.isValid) {
        setTestResults({
          overallSuccess: false,
          preValidation: validation,
          slideResults: [],
          summary: { totalSlides: 0, successfulSlides: 0, failedSlides: 0, totalErrors: validation.issues.length, totalWarnings: 0 }
        });
        setTesting(false);
        return;
      }

      setProgress(20);

      // Run export tests
      const results = await testCarouselExport({ username, handle, isVerified, slides });
      
      setProgress(100);
      setTestResults({ ...results, preValidation: validation });
    } catch (error) {
      console.error('Test execution failed:', error);
      setTestResults({
        overallSuccess: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        slideResults: [],
        summary: { totalSlides: 0, successfulSlides: 0, failedSlides: 0, totalErrors: 1, totalWarnings: 0 }
      });
    } finally {
      setTesting(false);
    }
  };

  const getStatusIcon = (success: boolean) => {
    return success ? (
      <CheckCircle className="w-4 h-4 text-green-500" />
    ) : (
      <XCircle className="w-4 h-4 text-red-500" />
    );
  };

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TestTube className="w-5 h-5" />
          <h3 className="text-lg font-semibold">Teste de Validação do Carrossel</h3>
        </div>
        <Button 
          onClick={runTests} 
          disabled={testing}
          size="sm"
        >
          {testing ? 'Testando...' : 'Executar Testes'}
        </Button>
      </div>

      {testing && (
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
            <span>Executando testes...</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="w-full" />
        </div>
      )}

      {testResults && (
        <div className="space-y-4">
          {/* Overall Status */}
          <Alert className={testResults.overallSuccess ? 'border-green-500' : 'border-red-500'}>
            <div className="flex items-center gap-2">
              {getStatusIcon(testResults.overallSuccess)}
              <AlertDescription>
                {testResults.overallSuccess 
                  ? '✅ Todos os testes passaram! O carrossel está pronto para download.'
                  : '❌ Alguns testes falharam. Verifique os erros abaixo.'
                }
              </AlertDescription>
            </div>
          </Alert>

          {/* Pre-validation Issues */}
          {testResults.preValidation && testResults.preValidation.issues.length > 0 && (
            <div>
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-500" />
                Problemas de Validação
              </h4>
              <div className="space-y-1">
                {testResults.preValidation.issues.map((issue: string, index: number) => (
                  <div key={index} className="text-sm text-red-600 bg-red-50 p-2 rounded">
                    {issue}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Summary */}
          {testResults.summary && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{testResults.summary.totalSlides}</div>
                <div className="text-sm text-muted-foreground">Total de Slides</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{testResults.summary.successfulSlides}</div>
                <div className="text-sm text-muted-foreground">Sucessos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{testResults.summary.failedSlides}</div>
                <div className="text-sm text-muted-foreground">Falhas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{testResults.summary.totalErrors}</div>
                <div className="text-sm text-muted-foreground">Erros</div>
              </div>
            </div>
          )}

          {/* Individual Slide Results */}
          {testResults.slideResults && testResults.slideResults.length > 0 && (
            <div>
              <h4 className="font-medium mb-3">Resultados por Slide</h4>
              <div className="space-y-2">
                {testResults.slideResults.map((result: any, index: number) => (
                  <div key={index} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(result.success)}
                        <span className="font-medium">Slide {index + 1}</span>
                        <Badge variant={result.success ? "default" : "destructive"}>
                          {result.imageSize} bytes
                        </Badge>
                      </div>
                      <div className="flex gap-1">
                        {result.hasValidImage && <Badge variant="outline" className="text-green-600">✓ Imagem</Badge>}
                        {result.handleCorrect && <Badge variant="outline" className="text-green-600">✓ @Handle</Badge>}
                        {result.nameNotTruncated && <Badge variant="outline" className="text-green-600">✓ Nome</Badge>}
                      </div>
                    </div>
                    
                    {result.errors.length > 0 && (
                      <div className="space-y-1">
                        {result.errors.map((error: string, errorIndex: number) => (
                          <div key={errorIndex} className="text-sm text-red-600 bg-red-50 p-1 rounded">
                            ❌ {error}
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {result.warnings.length > 0 && (
                      <div className="space-y-1">
                        {result.warnings.map((warning: string, warningIndex: number) => (
                          <div key={warningIndex} className="text-sm text-yellow-600 bg-yellow-50 p-1 rounded">
                            ⚠️ {warning}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Error Details */}
          {testResults.error && (
            <Alert className="border-red-500">
              <XCircle className="w-4 h-4" />
              <AlertDescription>
                Erro durante a execução dos testes: {testResults.error}
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}
    </Card>
  );
};