import React, { useState, useEffect, useRef } from 'react';
import { BrowserQRCodeReader } from '@zxing/browser';
import { ValidatedQRSession, Restaurant, RestaurantTable, QRToken } from '../../types';
import { db } from '../../lib/database';
import { Camera, X, AlertCircle, QrCode, Check } from 'lucide-react';
import { Button } from '../ui/Button';

interface QRScannerModalProps {
  restaurant: Restaurant;
  onSuccess: (session: ValidatedQRSession) => void;
  onClose: () => void;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({
  restaurant,
  onSuccess,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'camera' | 'demo_tables' | 'manual'>('camera');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState<boolean>(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [manualToken, setManualToken] = useState<string>('');
  const [availableTables, setAvailableTables] = useState<{ table: RestaurantTable; qr: QRToken }[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<any>(null);

  useEffect(() => {
    const branches = db.getBranches(restaurant.id);
    const primaryBranch = branches[0];
    if (primaryBranch) {
      const tables = db.getTables(restaurant.id, primaryBranch.id);
      const list: { table: RestaurantTable; qr: QRToken }[] = [];
      tables.forEach((t) => {
        const qr = db.getQRTokenForTable(t.id);
        if (qr) list.push({ table: t, qr });
      });
      setAvailableTables(list);
    }
  }, [restaurant]);

  useEffect(() => {
    let active = true;

    if (activeTab === 'camera') {
      const startScanner = async () => {
        setErrorMessage(null);

        try {
          if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            setHasCameraPermission(false);
            setErrorMessage('Camera access is not supported by your current browser.');
            return;
          }

          const codeReader = new BrowserQRCodeReader();
          const videoElement = videoRef.current;
          if (!videoElement) return;

          const controls = await codeReader.decodeFromVideoDevice(
            undefined,
            videoElement,
            (result) => {
              if (result && active) {
                const text = result.getText();
                handleScannedContent(text);
              }
            }
          );

          controlsRef.current = controls;
          setHasCameraPermission(true);
        } catch (err: any) {
          if (active) {
            setHasCameraPermission(false);
            if (err?.name === 'NotAllowedError' || err?.name === 'PermissionDeniedError') {
              setErrorMessage('Camera permission was denied. Please allow camera access in browser settings.');
            } else {
              setErrorMessage(`Camera unavailable (${err?.message || 'in use'}). Select a table below.`);
            }
          }
        }
      };

      startScanner();
    }

    return () => {
      active = false;
      if (controlsRef.current) {
        controlsRef.current.stop();
        controlsRef.current = null;
      }
    };
  }, [activeTab]);

  const handleScannedContent = (rawText: string) => {
    if (controlsRef.current) {
      controlsRef.current.stop();
      controlsRef.current = null;
    }

    let token = rawText.trim();
    if (token.includes('/scan/')) {
      const parts = token.split('/scan/');
      token = parts[parts.length - 1];
    }

    validateAndUnlock(token);
  };

  const validateAndUnlock = (token: string) => {
    setErrorMessage(null);
    setIsValidating(true);

    setTimeout(() => {
      const result = db.validateQRToken(token);
      setIsValidating(false);

      if (!result.success || !result.session) {
        setErrorMessage(result.error || 'Invalid QR code.');
        return;
      }

      if (result.session.restaurant.id !== restaurant.id) {
        setErrorMessage(`This QR belongs to "${result.session.restaurant.name}". Cross-restaurant QR codes are not allowed.`);
        return;
      }

      onSuccess(result.session);
    }, 200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-xs">
      <div className="relative w-full max-w-sm bg-white rounded-xl shadow-lg border border-zinc-200 overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100">
          <div>
            <h3 className="text-sm font-semibold text-zinc-900 tracking-tight">Scan Table QR</h3>
            <p className="text-xs text-zinc-500 mt-0.5">Locate the QR code on your dining table</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-zinc-600 rounded-md transition-colors"
          >
            <X className="w-4 h-4 stroke-[1.5]" />
          </button>
        </div>

        {/* Tab Controls (Clean segmented style) */}
        <div className="flex border-b border-zinc-100 bg-zinc-50/50 p-1 gap-1 text-xs">
          <button
            onClick={() => setActiveTab('camera')}
            className={`flex-1 py-1.5 px-2 font-medium rounded-md text-center transition-colors ${
              activeTab === 'camera'
                ? 'bg-white text-zinc-900 shadow-2xs'
                : 'text-zinc-500 hover:text-zinc-800'
            }`}
          >
            Camera
          </button>
          <button
            onClick={() => setActiveTab('demo_tables')}
            className={`flex-1 py-1.5 px-2 font-medium rounded-md text-center transition-colors ${
              activeTab === 'demo_tables'
                ? 'bg-white text-zinc-900 shadow-2xs'
                : 'text-zinc-500 hover:text-zinc-800'
            }`}
          >
            Tables ({availableTables.length})
          </button>
          <button
            onClick={() => setActiveTab('manual')}
            className={`flex-1 py-1.5 px-2 font-medium rounded-md text-center transition-colors ${
              activeTab === 'manual'
                ? 'bg-white text-zinc-900 shadow-2xs'
                : 'text-zinc-500 hover:text-zinc-800'
            }`}
          >
            Token
          </button>
        </div>

        {/* Tab 1: Camera Scanner */}
        {activeTab === 'camera' && (
          <div className="p-6 flex flex-col items-center">
            <div className="relative w-56 h-56 bg-zinc-900 rounded-lg overflow-hidden flex items-center justify-center border border-zinc-800">
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                autoPlay
                playsInline
                muted
              />

              {/* Minimal Clean Hairline Frame */}
              <div className="absolute inset-8 border border-white/60 rounded-md pointer-events-none" />

              {!hasCameraPermission && !errorMessage && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900/90 text-white p-4 text-center">
                  <Camera className="w-6 h-6 text-zinc-400 mb-2 stroke-[1.5]" />
                  <p className="text-xs text-zinc-300">Requesting camera...</p>
                </div>
              )}

              {isValidating && (
                <div className="absolute inset-0 flex items-center justify-center bg-zinc-950/70 text-white text-xs">
                  <span>Verifying QR token...</span>
                </div>
              )}
            </div>

            <p className="mt-4 text-xs text-zinc-500 text-center leading-relaxed">
              Point your camera at the QR code on your table tent card.
            </p>
          </div>
        )}

        {/* Tab 2: Demo Tables Quick Tap */}
        {activeTab === 'demo_tables' && (
          <div className="p-5 space-y-2">
            <p className="text-xs text-zinc-500 mb-3">
              Select your dining table to unlock the menu:
            </p>
            <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
              {availableTables.map(({ table, qr }) => (
                <button
                  key={table.id}
                  onClick={() => validateAndUnlock(qr.token_opaque)}
                  className="w-full flex items-center justify-between p-2.5 rounded-lg border border-zinc-200/90 hover:border-zinc-300 hover:bg-zinc-50 text-left transition-colors"
                >
                  <div>
                    <span className="text-xs font-semibold text-zinc-900 block">
                      {table.label}
                    </span>
                    <span className="text-[11px] text-zinc-500">
                      Seats {table.capacity} · {table.location_area}
                    </span>
                  </div>
                  <span className="text-xs font-medium text-zinc-600 hover:text-zinc-900">
                    Select →
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Manual Token Input */}
        {activeTab === 'manual' && (
          <div className="p-5 space-y-3">
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">
                Enter QR Token
              </label>
              <input
                type="text"
                value={manualToken}
                onChange={(e) => setManualToken(e.target.value)}
                placeholder="pzp_live_..."
                className="w-full px-3 py-2 text-xs border border-zinc-200 rounded-lg focus:outline-hidden focus:border-zinc-900 font-mono"
              />
            </div>

            <div className="flex gap-2 pt-1">
              <Button
                variant="primary"
                size="md"
                onClick={() => validateAndUnlock(manualToken)}
                disabled={!manualToken.trim()}
                className="flex-1"
              >
                Validate
              </Button>
              <Button
                variant="secondary"
                size="md"
                onClick={() => validateAndUnlock('invalid_token')}
              >
                Test Invalid
              </Button>
            </div>
          </div>
        )}

        {/* Error Notification */}
        {errorMessage && (
          <div className="mx-5 mb-4 p-3 bg-rose-50/70 border border-rose-200/80 rounded-lg flex items-start gap-2 text-rose-800 text-xs">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5 stroke-[1.5]" />
            <div className="flex-1">
              <p className="font-medium">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="px-5 py-2.5 bg-zinc-50 border-t border-zinc-100 flex items-center justify-between text-[11px] text-zinc-400">
          <span>Penta Prizm Table Protocol</span>
          <span className="font-mono">Active</span>
        </div>
      </div>
    </div>
  );
};
