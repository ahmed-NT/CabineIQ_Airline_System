import { useState } from 'react';
import { TbQrcode, TbDownload, TbX } from 'react-icons/tb';
import { QRCodeSVG } from 'qrcode.react';

interface Props {
  flightId: number;
  flightNumber: string;
}

export default function QrGenerator({ flightId, flightNumber }: Props) {
  const [open, setOpen] = useState(false);
  const surveyUrl = `${window.location.origin}/feedback?flightId=${flightId}`;

  const handleDownload = () => {
    const svg = document.getElementById('qr-code-svg');
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      ctx?.drawImage(img, 0, 0);
      const a = document.createElement('a');
      a.download = `QR-${flightNumber}.png`;
      a.href = canvas.toDataURL('image/png');
      a.click();
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 px-3 py-1.5
          bg-[#C41E3A] hover:bg-[#a01830]
          text-white rounded-lg text-xs font-medium
          transition-colors"
      >
        <TbQrcode className="w-3.5 h-3.5" />
        QR Feedback
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center
          justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#0a1e38] rounded-2xl
            border border-gray-200 dark:border-[#1a3050]
            p-6 w-72 flex flex-col items-center gap-4
            shadow-2xl">
            <div className="flex items-center justify-between w-full">
              <span className="text-sm font-semibold
                text-gray-800 dark:text-white">
                Passenger Survey
              </span>
              <button
                onClick={() => setOpen(false)}
                className="text-gray-400 hover:text-gray-600
                  dark:hover:text-white"
              >
                <TbX className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-white p-3 rounded-xl">
              <QRCodeSVG
                id="qr-code-svg"
                value={surveyUrl}
                size={180}
                bgColor="#ffffff"
                fgColor="#1A1A2E"
                level="H"
              />
            </div>

            <div className="text-center">
              <p className="text-xs font-medium
                text-gray-800 dark:text-white mb-1">
                {flightNumber}
              </p>
              <p className="text-[10px] text-gray-400
                dark:text-[#2a5080] break-all">
                {surveyUrl}
              </p>
            </div>

            <button
              onClick={handleDownload}
              className="flex items-center gap-2 w-full
                justify-center py-2 rounded-lg
                bg-[#C41E3A] hover:bg-[#a01830]
                text-white text-xs font-medium
                transition-colors"
            >
              <TbDownload className="w-3.5 h-3.5" />
              Download PNG
            </button>
          </div>
        </div>
      )}
    </>
  );
}
