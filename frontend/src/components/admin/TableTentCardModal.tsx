import React, { useEffect, useState } from 'react';
import { Restaurant, Branch, RestaurantTable, QRToken } from '../../types';
import { generateQRCodeDataUrl } from '../../lib/qrHelper';
import { Printer, X } from 'lucide-react';
import { Button } from '../ui/Button';

interface TableTentCardModalProps {
  restaurant: Restaurant;
  branch: Branch;
  table: RestaurantTable;
  qrToken: QRToken;
  onClose: () => void;
}

export const TableTentCardModal: React.FC<TableTentCardModalProps> = ({
  restaurant,
  branch,
  table,
  qrToken,
  onClose
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  useEffect(() => {
    const domain = restaurant.custom_domain || `${restaurant.subdomain}.pentaprizm.app`;
    generateQRCodeDataUrl(qrToken.token_opaque, domain).then(setQrDataUrl);
  }, [restaurant, qrToken]);

  const handlePrint = () => {
    window.print();
  };

  const domain = restaurant.custom_domain || `${restaurant.subdomain}.pentaprizm.app`;
  const scanUrl = `https://${domain}/scan/${qrToken.token_opaque}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-white rounded-xl shadow-xl border border-zinc-200 overflow-hidden">
        {/* Modal Controls (Hidden in print) */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-100 bg-zinc-50/50 no-print">
          <div>
            <h3 className="text-xs font-semibold text-zinc-900">Print Table Tent Card</h3>
            <p className="text-[11px] text-zinc-500">{branch.name} · {table.label}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              size="sm"
              onClick={handlePrint}
              className="gap-1.5"
            >
              <Printer className="w-3.5 h-3.5 stroke-[1.5]" />
              <span>Print</span>
            </Button>
            <button
              onClick={onClose}
              className="p-1 text-zinc-400 hover:text-zinc-600 rounded-md transition-colors"
            >
              <X className="w-4 h-4 stroke-[1.5]" />
            </button>
          </div>
        </div>

        {/* Printable Tent Card View */}
        <div className="p-8 flex flex-col items-center text-center bg-white" id="printable-tent-card">
          <div className="w-full max-w-xs p-6 border border-zinc-900 rounded-xl bg-white flex flex-col items-center">
            {/* Branding */}
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-xl">{restaurant.logo_url}</span>
              <h4 className="text-base font-bold text-zinc-900 tracking-tight">{restaurant.name}</h4>
            </div>
            <p className="text-[11px] text-zinc-500 mb-3">{branch.name}</p>

            {/* Table Identifier */}
            <div className="w-full py-1.5 px-3 mb-4 rounded-md bg-zinc-100 text-zinc-900 text-xs font-semibold tracking-wide">
              {table.label}
            </div>

            {/* QR Graphic */}
            <div className="p-2 bg-white border border-zinc-200 rounded-lg mb-3">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt={`QR for ${table.label}`}
                  className="w-40 h-40 object-contain"
                />
              ) : (
                <div className="w-40 h-40 flex items-center justify-center text-xs text-zinc-400">
                  Generating QR...
                </div>
              )}
            </div>

            <h5 className="text-xs font-semibold text-zinc-900 mb-0.5">Scan to Order at Your Table</h5>
            <p className="text-[11px] text-zinc-500 leading-relaxed mb-2 max-w-[200px]">
              Point your phone camera to view our menu and place your order.
            </p>

            <span className="text-[10px] text-zinc-400 font-mono">
              Powered by Penta Prizm
            </span>
          </div>

          <div className="mt-3 text-[11px] text-zinc-400 font-mono no-print truncate max-w-xs">
            {scanUrl}
          </div>
        </div>
      </div>
    </div>
  );
};
