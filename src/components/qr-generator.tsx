"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Copy } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

interface QrCodeGeneratorProps {
  payload: string;
  amount: number;
  paymentType: 'MSISDN' | 'NATID';
  target: string;
  onReset?: () => void;
  showResetButton?: boolean;
}

export function QrCodeGenerator({ 
  payload, 
  amount, 
  paymentType, 
  target, 
  onReset,
  showResetButton = true
}: QrCodeGeneratorProps) {
  const qrRef = useRef<HTMLDivElement>(null);

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatTarget = (target: string, type: 'MSISDN' | 'NATID') => {
    if (type === 'MSISDN') {
      // Format phone number: 0812345678 -> 081-234-5678
      return target.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
    } else {
      // Format national ID: 1234567890123 -> 1-2345-67890-12-3
      return target.replace(/(\d{1})(\d{4})(\d{5})(\d{2})(\d{1})/, '$1-$2-$3-$4-$5');
    }
  };

  const downloadQRCode = () => {
    if (!qrRef.current) return;

    const svg = qrRef.current.querySelector('svg');
    if (!svg) return;

    // สร้าง canvas เพื่อแปลง SVG เป็นรูปภาพ
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    const iconImg = new Image();

    // กำหนดขนาด canvas
    canvas.width = 300;
    canvas.height = 300;

    // โหลด icon ก่อน
    iconImg.crossOrigin = 'anonymous';
    iconImg.onload = () => {
      // แปลง SVG เป็น data URL (โดยไม่มี icon เพราะจะวาดเอง)
      const svgClone = svg.cloneNode(true) as SVGElement;
      // ลบ image element ออกจาก SVG clone
      const imageElements = svgClone.querySelectorAll('image');
      imageElements.forEach(el => el.remove());
      
      const svgData = new XMLSerializer().serializeToString(svgClone);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);

      img.onload = () => {
        if (ctx) {
          // วาดพื้นหลังสีขาว
          ctx.fillStyle = 'white';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          
          // วาด QR Code (ไม่มี icon)
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          
          // วาดพื้นหลังสีขาวสำหรับ icon ตรงกลาง
          const iconSize = 72;
          const iconBgSize = iconSize + 8; // padding 4px รอบ ๆ
          const iconX = (canvas.width - iconBgSize) / 2;
          const iconY = (canvas.height - iconBgSize) / 2;
          
          ctx.fillStyle = 'white';
          ctx.fillRect(iconX, iconY, iconBgSize, iconBgSize);
          
          // วาด icon ตรงกลาง
          const iconImageX = (canvas.width - iconSize) / 2;
          const iconImageY = (canvas.height - iconSize) / 2;
          ctx.drawImage(iconImg, iconImageX, iconImageY, iconSize, iconSize);
          
          // สร้างลิงก์ดาวน์โหลด
          canvas.toBlob((blob) => {
            if (blob) {
              const link = document.createElement('a');
              link.download = `promptpay-qr-${target}-${amount}.png`;
              link.href = URL.createObjectURL(blob);
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              URL.revokeObjectURL(link.href);
            }
          }, 'image/png');
        }
        URL.revokeObjectURL(url);
      };

      img.src = url;
    };

    iconImg.onerror = () => {
      // ถ้าโหลด icon ไม่ได้ ให้ดาวน์โหลดแบบไม่มี icon
      const svgData = new XMLSerializer().serializeToString(svg);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);

      img.onload = () => {
        if (ctx) {
          ctx.fillStyle = 'white';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          
          canvas.toBlob((blob) => {
            if (blob) {
              const link = document.createElement('a');
              link.download = `promptpay-qr-${target}-${amount}.png`;
              link.href = URL.createObjectURL(blob);
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              URL.revokeObjectURL(link.href);
            }
          }, 'image/png');
        }
        URL.revokeObjectURL(url);
      };

      img.src = url;
    };

    iconImg.src = '/icon-thaiqr.png';
  };

  const copyQRCodeAsImage = async () => {
    if (!qrRef.current) return;

    try {
      const svg = qrRef.current.querySelector('svg');
      if (!svg) return;

      // สร้าง canvas เพื่อแปลง SVG เป็นรูปภาพ
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      const iconImg = new Image();

      // กำหนดขนาด canvas
      canvas.width = 300;
      canvas.height = 300;

      // โหลด icon ก่อน
      iconImg.crossOrigin = 'anonymous';
      iconImg.onload = () => {
        // แปลง SVG เป็น data URL (โดยไม่มี icon เพราะจะวาดเอง)
        const svgClone = svg.cloneNode(true) as SVGElement;
        // ลบ image element ออกจาก SVG clone
        const imageElements = svgClone.querySelectorAll('image');
        imageElements.forEach(el => el.remove());
        
        const svgData = new XMLSerializer().serializeToString(svgClone);
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);

        img.onload = async () => {
          if (ctx) {
            // วาดพื้นหลังสีขาว
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // วาด QR Code (ไม่มี icon)
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            
            // วาดพื้นหลังสีขาวสำหรับ icon ตรงกลาง
            const iconSize = 72;
            const iconBgSize = iconSize + 8; // padding 4px รอบ ๆ
            const iconX = (canvas.width - iconBgSize) / 2;
            const iconY = (canvas.height - iconBgSize) / 2;
            
            ctx.fillStyle = 'white';
            ctx.fillRect(iconX, iconY, iconBgSize, iconBgSize);
            
            // วาด icon ตรงกลาง
            const iconImageX = (canvas.width - iconSize) / 2;
            const iconImageY = (canvas.height - iconSize) / 2;
            ctx.drawImage(iconImg, iconImageX, iconImageY, iconSize, iconSize);
            
            // แปลงเป็น blob และคัดลอกไปยัง clipboard
            canvas.toBlob(async (blob) => {
              if (blob) {
                try {
                  await navigator.clipboard.write([
                    new ClipboardItem({ 'image/png': blob })
                  ]);
                  // TODO: Add toast notification - คัดลอกรูปภาพสำเร็จ
                } catch (err) {
                  console.error('Failed to copy image:', err);
                  // Fallback: คัดลอกข้อความแทน
                  await navigator.clipboard.writeText(payload);
                }
              }
            }, 'image/png');
          }
          URL.revokeObjectURL(url);
        };

        img.src = url;
      };

      iconImg.onerror = async () => {
        // ถ้าโหลด icon ไม่ได้ ให้คัดลอกแบบไม่มี icon
        const svgData = new XMLSerializer().serializeToString(svg);
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);

        img.onload = async () => {
          if (ctx) {
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            
            canvas.toBlob(async (blob) => {
              if (blob) {
                try {
                  await navigator.clipboard.write([
                    new ClipboardItem({ 'image/png': blob })
                  ]);
                } catch (err) {
                  console.error('Failed to copy image:', err);
                  await navigator.clipboard.writeText(payload);
                }
              }
            }, 'image/png');
          }
          URL.revokeObjectURL(url);
        };

        img.src = url;
      };

      iconImg.src = '/icon-thaiqr.png';
    } catch (err) {
      console.error('Failed to copy QR code image:', err);
      // Fallback: คัดลอกข้อความแทน
      try {
        await navigator.clipboard.writeText(payload);
      } catch (textErr) {
        console.error('Failed to copy text:', textErr);
      }
    }
  };

  return (
    <div className="text-center space-y-6">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-white">QR Code สำหรับชำระเงิน</h2>
        
        <div className="flex justify-center">
          <div className="bg-white p-4 rounded-2xl shadow-2xl relative" ref={qrRef}>
            <QRCodeSVG
              value={payload}
              size={256}
              level="H"
              includeMargin={true}
              imageSettings={{
                src: "/icon-thaiqr.png",
                x: undefined,
                y: undefined,
                height: 48,
                width: 48,
                excavate: false,
              }}
            />
          </div>
        </div>

        <div className="bg-gray-800/50 rounded-lg p-4 space-y-2">
          <div className="text-sm text-gray-400">
            {paymentType === 'MSISDN' ? 'เบอร์โทรศัพท์' : 'เลขบัตรประชาชน'}
          </div>
          <div className="text-lg font-medium text-white">
            {formatTarget(target, paymentType)}
          </div>
          <div className="text-2xl font-bold text-green-400">
            {formatAmount(amount)}
          </div>
        </div>

        <div className="flex gap-3 justify-center">
          <Button
            onClick={downloadQRCode}
            variant="outline"
            className="border-gray-700 text-white hover:bg-gray-800"
          >
            <Download className="h-4 w-4 mr-2" />
            ดาวน์โหลด
          </Button>
          <Button
            onClick={copyQRCodeAsImage}
            variant="outline"
            className="border-gray-700 text-white hover:bg-gray-800"
          >
            <Copy className="h-4 w-4 mr-2" />
            คัดลอกรูป
          </Button>
        </div>
      </div>

      {showResetButton && onReset && (
        <Button
          onClick={onReset}
          variant="outline"
          className="w-full border-gray-700 text-white hover:bg-gray-800"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          กลับไปสร้างใหม่
        </Button>
      )}
    </div>
  );
}