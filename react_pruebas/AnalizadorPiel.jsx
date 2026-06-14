import React, { useState } from 'react';
import { Upload, X, Activity, AlertCircle, CheckCircle, Image as ImageIcon } from 'lucide-react';

export default function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Manejar la selección del archivo
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null);
      setError(null);
    }
  };

  // Limpiar la selección
  const handleClear = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setResult(null);
    setError(null);
  };

  // Enviar la imagen al backend Flask
  const handleAnalyze = async () => {
    if (!selectedFile) return;

    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      // Nota: Asegúrate de que tu servidor Python esté corriendo en este puerto
      const response = await fetch('http://localhost:5000/analizar', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Error del servidor: ${response.statusText}`);
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      console.error(err);
      setError("No se pudo conectar con el servidor. Asegúrate de ejecutar 'python app.py'.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 font-sans text-slate-800 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
        
        {/* Encabezado */}
        <div className="bg-blue-600 p-6 text-white text-center">
          <Activity className="w-12 h-12 mx-auto mb-2 opacity-90" />
          <h1 className="text-2xl font-bold">Analizador de Piel</h1>
          <p className="text-blue-100 text-sm mt-1">Detección asistida por IA (Roboflow)</p>
        </div>

        <div className="p-6 space-y-6">
          
          {/* Área de carga */}
          {!previewUrl ? (
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:bg-slate-50 transition-colors relative">
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <Upload className="w-10 h-10 text-slate-400 mx-auto mb-3" />
              <p className="text-slate-600 font-medium">Sube una imagen de la lesión</p>
              <p className="text-slate-400 text-xs mt-1">Soporta JPG, PNG</p>
            </div>
          ) : (
            <div className="relative rounded-xl overflow-hidden shadow-sm border border-slate-200 bg-slate-100">
              <img 
                src={previewUrl} 
                alt="Vista previa" 
                className="w-full h-64 object-cover"
              />
              <button 
                onClick={handleClear}
                className="absolute top-2 right-2 bg-white/90 p-1.5 rounded-full hover:bg-red-50 text-slate-600 hover:text-red-500 transition-colors shadow-sm"
                title="Eliminar imagen"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Botón de Acción */}
          <button
            onClick={handleAnalyze}
            disabled={!selectedFile || loading}
            className={`w-full py-3 px-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all transform active:scale-95
              ${!selectedFile 
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                : loading 
                  ? 'bg-blue-400 text-white cursor-wait' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg'
              }`}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Analizando...
              </>
            ) : (
              <>
                <Activity className="w-5 h-5" />
                Analizar Imagen
              </>
            )}
          </button>

          {/* Errores */}
          {error && (
            <div className="p-4 bg-red-50 text-red-700 rounded-xl flex items-start gap-3 border border-red-100 animate-in fade-in slide-in-from-bottom-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Resultados */}
          {result && (
            <div className="border-t border-slate-100 pt-6 animate-in fade-in slide-in-from-bottom-4">
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-blue-500" />
                Resultados del Análisis
              </h3>
              
              {result.class ? (
                <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Diagnóstico Detectado</p>
                      <p className="text-2xl font-bold text-blue-900 mt-1 capitalize">{result.class}</p>
                    </div>
                    {result.confidence > 70 ? (
                       <CheckCircle className="w-8 h-8 text-green-500" />
                    ) : (
                       <AlertCircle className="w-8 h-8 text-amber-500" />
                    )}
                  </div>

                  {/* Barra de Confianza */}
                  <div className="mb-1 flex justify-between text-sm font-medium text-slate-600">
                    <span>Confianza</span>
                    <span>{result.confidence}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ease-out ${
                        result.confidence > 80 ? 'bg-green-500' : 
                        result.confidence > 50 ? 'bg-blue-500' : 'bg-amber-500'
                      }`}
                      style={{ width: `${result.confidence}%` }}
                    ></div>
                  </div>
                  
                  {result.confidence < 50 && (
                     <p className="text-xs text-amber-600 mt-3 bg-amber-50 p-2 rounded">
                       Nota: La confianza es baja. Se recomienda tomar una foto más clara o consultar a un especialista.
                     </p>
                  )}
                </div>
              ) : (
                <div className="bg-green-50 text-green-800 p-4 rounded-xl border border-green-100 text-center">
                  <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-600" />
                  <p className="font-medium">No se detectaron lesiones preocupantes.</p>
                  <p className="text-sm mt-1 opacity-80">{result.message}</p>
                </div>
              )}

              {/* Debug Info (Opcional, útil para desarrollo) */}
              <div className="mt-6 pt-4 border-t border-slate-100">
                <details className="text-xs text-slate-400 cursor-pointer">
                  <summary className="hover:text-slate-600 transition-colors">Ver datos técnicos (JSON)</summary>
                  <pre className="mt-2 bg-slate-900 text-slate-50 p-3 rounded-lg overflow-x-auto">
                    {JSON.stringify(result, null, 2)}
                  </pre>
                </details>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}