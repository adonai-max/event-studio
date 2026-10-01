"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

interface QRScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onScanError?: (error: string) => void;
}

export default function QRScanner({
  onScanSuccess,
  onScanError,
}: QRScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  const startScanner = async () => {
    try {
      setError("");

      const scanner = new Html5Qrcode("qr-reader");
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: {
            width: 250,
            height: 250,
          },
        },
        (decodedText) => {
          onScanSuccess(decodedText);
        },
        (scanErrorMessage) => {
          onScanError?.(scanErrorMessage);
        }
      );

      setIsScanning(true);
    } catch (err) {
      console.error(err);
      setError(
        "Impossible d'accéder à la caméra. Vérifiez les autorisations du navigateur."
      );
      setIsScanning(false);
    }
  };

  const stopScanner = async () => {
    if (!scannerRef.current) return;

    try {
      if (scannerRef.current.isScanning) {
        await scannerRef.current.stop();
      }

      await scannerRef.current.clear();
    } catch (err) {
      console.error("Erreur lors de l'arrêt du scanner :", err);
    }

    scannerRef.current = null;
    setIsScanning(false);
  };

  return (
    <div className="mx-auto w-full max-w-md">
      <div
        id="qr-reader"
        className="w-full overflow-hidden rounded-2xl border border-gray-200 bg-black"
      />

      {error && (
        <div className="mt-4 rounded-xl bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="mt-4 flex justify-center gap-3">
        {!isScanning ? (
          <button
            type="button"
            onClick={startScanner}
            className="rounded-xl bg-green-600 px-5 py-3 font-medium text-white transition hover:bg-green-700"
          >
            📷 Démarrer le scanner
          </button>
        ) : (
          <button
            type="button"
            onClick={stopScanner}
            className="rounded-xl bg-red-600 px-5 py-3 font-medium text-white transition hover:bg-red-700"
          >
            ⏹ Arrêter le scanner
          </button>
        )}
      </div>
    </div>
  );
}