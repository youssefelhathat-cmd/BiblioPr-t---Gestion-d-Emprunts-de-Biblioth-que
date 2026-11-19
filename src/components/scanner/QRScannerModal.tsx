import React, { useEffect, useState, useRef } from 'react';
import { useLibrary } from '../../context/LibraryContext';
import {
  X,
  Camera,
  QrCode,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Zap,
  Upload,
  SwitchCamera,
  Play,
  ShieldCheck,
} from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({ isOpen, onClose }) => {
  const { returnLoanWithQR, loans, getBookById, getStudentById, addToast } = useLibrary();

  const [scanResult, setScanResult] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<string | null>(null);
  const [isLoadingCamera, setIsLoadingCamera] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameras, setCameras] = useState<Array<{ id: string; label: string }>>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string | null>(null);

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const activeLoans = loans.filter((l) => l.status === 'en_cours' || l.status === 'en_retard');

  useEffect(() => {
    if (!isOpen) {
      stopScanner();
      setScanResult(null);
      setSuccessInfo(null);
      setCameraError(null);
      setIsCameraActive(false);
      return;
    }

    // Initialize camera listing and auto-start
    initAndStartScanner();

    return () => {
      stopScanner();
    };
  }, [isOpen]);

  const initAndStartScanner = async (preferredCameraId?: string) => {
    setIsLoadingCamera(true);
    setCameraError(null);

    // Stop existing scanner if running
    await stopScanner();

    try {
      const elementId = 'qr-camera-stream';
      // Ensure element exists in DOM
      const streamContainer = document.getElementById(elementId);
      if (!streamContainer) {
        setIsLoadingCamera(false);
        return;
      }

      const html5QrCode = new Html5Qrcode(elementId);
      scannerRef.current = html5QrCode;

      // Detect available video devices
      let deviceId = preferredCameraId || selectedCameraId;
      try {
        const devices = await Html5Qrcode.getCameras();
        if (devices && devices.length > 0) {
          setCameras(devices);
          if (!deviceId) {
            // Prefer back camera (environment) if available, otherwise first device
            const backCam = devices.find(
              (d) =>
                d.label.toLowerCase().includes('back') ||
                d.label.toLowerCase().includes('arrière') ||
                d.label.toLowerCase().includes('environment')
            );
            deviceId = backCam ? backCam.id : devices[0].id;
            setSelectedCameraId(deviceId);
          }
        }
      } catch (camListErr) {
        console.warn('Could not list cameras, will try default constraints:', camListErr);
      }

      // Scanner configuration
      const qrConfig = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
      };

      // Try starting with deviceId or facingMode
      try {
        if (deviceId) {
          await html5QrCode.start(
            deviceId,
            qrConfig,
            (decodedText) => handleDetectedCode(decodedText),
            () => {}
          );
        } else {
          // Try environment first, then fallback to user
          try {
            await html5QrCode.start(
              { facingMode: 'environment' },
              qrConfig,
              (decodedText) => handleDetectedCode(decodedText),
              () => {}
            );
          } catch (envErr) {
            console.warn('Environment camera failed, falling back to user facing camera:', envErr);
            await html5QrCode.start(
              { facingMode: 'user' },
              qrConfig,
              (decodedText) => handleDetectedCode(decodedText),
              () => {}
            );
          }
        }

        setIsCameraActive(true);
        setCameraError(null);
      } catch (startErr: any) {
        console.error('Failed to start camera feed:', startErr);
        setIsCameraActive(false);

        const errorMsg =
          startErr?.name === 'NotAllowedError' || startErr?.message?.includes('Permission')
            ? "Accès caméra refusé. Veuillez autoriser l'accès à la caméra dans la barre d'adresse de votre navigateur pour scanner en direct."
            : startErr?.name === 'NotFoundError'
            ? 'Aucune caméra vidéo détectée sur cet appareil.'
            : "Impossible d'accéder au flux vidéo de la caméra. Vous pouvez cliquer sur 'Réactiver la caméra', 'Charger une photo du QR', ou utiliser la simulation ci-dessous.";

        setCameraError(errorMsg);
      }
    } catch (err: any) {
      console.error('General scanner init error:', err);
      setIsCameraActive(false);
      setCameraError("Erreur d'initialisation du lecteur optique.");
    } finally {
      setIsLoadingCamera(false);
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
        scannerRef.current.clear();
      } catch (e) {
        console.warn('Error stopping scanner:', e);
      }
      scannerRef.current = null;
    }
    setIsCameraActive(false);
  };

  const handleSwitchCamera = async () => {
    if (cameras.length <= 1) return;
    const currentIndex = cameras.findIndex((c) => c.id === selectedCameraId);
    const nextIndex = (currentIndex + 1) % cameras.length;
    const nextCamId = cameras[nextIndex].id;
    setSelectedCameraId(nextCamId);
    await initAndStartScanner(nextCamId);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setCameraError(null);

    try {
      // Use existing or create temporary Html5Qrcode instance
      let scanner = scannerRef.current;
      if (!scanner) {
        scanner = new Html5Qrcode('qr-camera-stream');
        scannerRef.current = scanner;
      }

      // Stop camera if currently scanning before decoding file
      if (scanner.isScanning) {
        await scanner.stop();
        setIsCameraActive(false);
      }

      const decodedText = await scanner.scanFile(file, true);
      if (decodedText) {
        handleDetectedCode(decodedText);
      }
    } catch (err: any) {
      console.warn('File QR decode failed:', err);
      setCameraError('Aucun Code QR lisible détecté sur cette photo. Veuillez réessayer.');
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDetectedCode = async (code: string) => {
    if (isProcessing) return;
    setIsProcessing(true);
    setScanResult(code);

    const res = await returnLoanWithQR(code);
    setIsProcessing(false);

    if (res.success) {
      setSuccessInfo(res.message || 'Restitution confirmée avec succès !');
      stopScanner();
    } else {
      setCameraError(res.error || 'Code QR invalide ou non reconnu.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white p-4 flex items-center justify-between border-b border-blue-900">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600/90 text-white flex items-center justify-center shadow-xs">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold font-serif flex items-center gap-1.5">
                <span>Scanner QR Code de Restitution</span>
                {isCameraActive && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                )}
              </h3>
              <p className="text-[11px] text-blue-200 font-mono">
                Guichet retour · Bibliothèque Universitaire EST Fès
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scanner View Area */}
        <div className="p-5 space-y-4 overflow-y-auto">
          {successInfo ? (
            <div className="p-6 bg-emerald-50 border border-emerald-300 rounded-2xl text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-700 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              </div>
              <div className="text-base font-bold text-emerald-950 font-serif">
                {successInfo}
              </div>
              <p className="text-xs text-emerald-800 leading-relaxed">
                L'exemplaire a été réintégré immédiatement dans le stock disponible de la bibliothèque de l'EST Fès. Le pass étudiant a été mis à jour.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => {
                    setSuccessInfo(null);
                    setScanResult(null);
                    initAndStartScanner();
                  }}
                  className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer inline-flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Scanner un autre retour</span>
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Camera Video Container */}
              <div className="relative bg-slate-950 rounded-2xl overflow-hidden aspect-video flex items-center justify-center border border-slate-800 shadow-inner group">
                {/* DOM target where Html5Qrcode injects video */}
                <div id="qr-camera-stream" className="w-full h-full overflow-hidden" />

                {/* Laser scan animation when active */}
                {isCameraActive && (
                  <div className="pointer-events-none absolute inset-x-8 top-1/2 -translate-y-1/2 h-44 border-2 border-emerald-400/80 rounded-xl flex items-center justify-center">
                    <div className="w-full h-0.5 bg-emerald-400 shadow-[0_0_12px_#34d399] animate-pulse" />
                    <div className="absolute top-2 left-2 text-[10px] font-mono font-bold text-emerald-300 bg-black/60 px-2 py-0.5 rounded">
                      VISEZ LE QR CODE DU PASS OU DU LIVRE
                    </div>
                  </div>
                )}

                {/* Loading state */}
                {isLoadingCamera && (
                  <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center text-center text-xs text-slate-300 space-y-2.5 p-4">
                    <RefreshCw className="w-6 h-6 text-blue-400 animate-spin" />
                    <span className="font-medium">Activation du capteur optique...</span>
                  </div>
                )}

                {/* Error overlay with actionable controls */}
                {!isLoadingCamera && cameraError && (
                  <div className="absolute inset-0 bg-slate-950/95 p-5 flex flex-col items-center justify-center text-center text-xs text-slate-200 space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-400 flex items-center justify-center">
                      <Camera className="w-5 h-5" />
                    </div>
                    <div className="max-w-xs space-y-1">
                      <div className="font-bold text-white text-xs">Accès caméra</div>
                      <p className="text-[11px] text-slate-300 leading-relaxed">{cameraError}</p>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => initAndStartScanner()}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Activer la caméra</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Charger photo QR</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Camera Controls Bar */}
              <div className="flex items-center justify-between text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <div className="flex items-center gap-2">
                  {isCameraActive ? (
                    <span className="inline-flex items-center gap-1.5 text-emerald-700 font-semibold text-[11px]">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                      Caméra en direct active
                    </span>
                  ) : (
                    <span className="text-[11px] text-slate-500">Flux caméra inactif</span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {cameras.length > 1 && (
                    <button
                      type="button"
                      onClick={handleSwitchCamera}
                      className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg text-[11px] font-semibold text-slate-700 flex items-center gap-1 cursor-pointer transition-colors"
                      title="Changer d'objectif caméra"
                    >
                      <SwitchCamera className="w-3.5 h-3.5" />
                      <span>Basculer</span>
                    </button>
                  )}

                  {!isCameraActive && (
                    <button
                      type="button"
                      onClick={() => initAndStartScanner()}
                      className="px-2.5 py-1 bg-blue-900 hover:bg-blue-800 text-white rounded-lg text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Relancer caméra</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg text-[11px] font-semibold text-slate-700 flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5 text-blue-800" />
                    <span>Photo / Fichier</span>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Instant Simulator for easy demonstration */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-600" />
                    <span>Simulation instantanée au guichet :</span>
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">
                    Test 1-clic sans caméra
                  </span>
                </div>

                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                  {activeLoans.length === 0 ? (
                    <div className="p-3 bg-slate-50 text-center text-xs text-slate-500 rounded-lg">
                      Aucun emprunt en cours à restituer.
                    </div>
                  ) : (
                    activeLoans.map((loan) => {
                      const book = getBookById(loan.bookId);
                      const student = getStudentById(loan.studentId);

                      return (
                        <button
                          key={loan.id}
                          onClick={() => handleDetectedCode(loan.qrToken)}
                          disabled={isProcessing}
                          className="w-full p-2.5 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-xl text-left text-xs transition-all flex items-center justify-between gap-3 group cursor-pointer"
                        >
                          <div className="min-w-0">
                            <div className="font-bold text-slate-900 truncate">
                              {book?.title}
                            </div>
                            <div className="text-[11px] text-slate-500">
                              <span>{student?.fullName}</span>
                              <span className="mx-1">·</span>
                              <span className="font-mono text-slate-700">{loan.loanNumber}</span>
                            </div>
                          </div>

                          <span className="shrink-0 text-[11px] font-semibold text-blue-700 group-hover:underline">
                            Simuler scan →
                          </span>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-slate-500 font-mono text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>{activeLoans.length} prêt{activeLoans.length > 1 ? 's' : ''} en circulation</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
