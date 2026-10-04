"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
  const scanLockedRef = useRef(false);
  const unlockTimerRef = useRef<number | null>(null);

  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState("");
  const [decodedValue, setDecodedValue] = useState("");

  const stopScanner = useCallback(async () => {
    scanLockedRef.current = true;

    if (unlockTimerRef.current !== null) {
      window.clearTimeout(unlockTimerRef.current);
      unlockTimerRef.current = null;
    }

    const scanner = scannerRef.current;

    if (!scanner) {
      setIsScanning(false);
      return;
    }

    try {
      if (scanner.isScanning) {
        await scanner.stop();
      }

      await scanner.clear();
    } catch (err) {
      console.error(
        "Erreur lors de l'arrêt du scanner :",
        err,
      );
    } finally {
      if (scannerRef.current === scanner) {
        scannerRef.current = null;
      }

      setIsScanning(false);
    }
  }, []);

  useEffect(() => {
    return () => {
      void stopScanner();
    };
  }, [stopScanner]);

  const startScanner = async () => {
    try {
      setError("");
      setDecodedValue("");
      scanLockedRef.current = false;

      await stopScanner();

      scanLockedRef.current = false;

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
          aspectRatio: 1,
        },
        (decodedText) => {
          if (scanLockedRef.current) {
            return;
          }

          scanLockedRef.current = true;

          console.log(
            "🔥🔥🔥 QR DÉTECTÉ :",
            decodedText,
          );

          setDecodedValue(decodedText);

          alert(
            "QR DÉTECTÉ !\n\n" +
              decodedText,
          );

          onScanSuccess(decodedText);

          unlockTimerRef.current =
            window.setTimeout(() => {
              scanLockedRef.current = false;
              unlockTimerRef.current = null;
            }, 1500);
        },
        (scanErrorMessage) => {
          onScanError?.(scanErrorMessage);
        },
      );

      setIsScanning(true);
    } catch (err) {
      console.error(
        "❌ ERREUR DU SCANNER :",
        err,
      );

      scannerRef.current = null;

      setError(
        "Impossible d'accéder à la caméra. Vérifiez les autorisations du navigateur.",
      );

      setIsScanning(false);
    }
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

      {decodedValue && (
        <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">
            QR détecté
          </p>

          <p className="mt-2 break-all text-sm font-medium text-emerald-900">
            {decodedValue}
          </p>
        </div>
      )}

      <div className="mt-4 flex justify-center gap-3">
        {!isScanning ? (
          <button
            type="button"
            onClick={() => void startScanner()}
            className="rounded-xl bg-green-600 px-5 py-3 font-medium text-white transition hover:bg-green-700"
          >
            📷 Démarrer le scanner
          </button>
        ) : (
          <button
            type="button"
            onClick={() => void stopScanner()}
            className="rounded-xl bg-red-600 px-5 py-3 font-medium text-white transition hover:bg-red-700"
          >
            ⏹ Arrêter le scanner
          </button>
        )}
      </div>

      {isScanning && (
        <p className="mt-3 text-center text-xs text-zinc-500">
          Placez le QR code dans le cadre et maintenez-le
          suffisamment stable.
        </p>
      )}
    </div>
  );
}
