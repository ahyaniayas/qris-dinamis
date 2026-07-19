'use client';

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import jsQR from 'jsqr';
import { QRCodeSVG } from 'qrcode.react';
import { Upload, Camera, Download, QrCode, AlertCircle, X, Image as ImageIcon, Sun, Moon, CheckCircle2, Info, Share2, Maximize2 } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import { useTheme } from 'next-themes';

export default function Home() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [qrisPayload, setQrisPayload] = useState<string | null>(null);
  const [amount, setAmount] = useState<string>('');
  const [formattedAmount, setFormattedAmount] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dynamicQris, setDynamicQris] = useState<string | null>(null);

  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const [inputMode, setInputMode] = useState<'upload' | 'scan'>('upload');
  const [isScanning, setIsScanning] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [closingInfo, setClosingInfo] = useState(false);
  const [isFullscreenQr, setIsFullscreenQr] = useState(false);
  const [closingFullscreen, setClosingFullscreen] = useState(false);

  const handleCloseFullscreen = () => {
    setClosingFullscreen(true);
    setTimeout(() => {
      setIsFullscreenQr(false);
      setClosingFullscreen(false);
    }, 200);
  };

  const handleCloseInfo = () => {
    setClosingInfo(true);
    setTimeout(() => {
      setShowInfo(false);
      setClosingInfo(false);
    }, 200);
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);

  const [logoIcon, setLogoIcon] = useState<string | null>(null);
  const [logoDims, setLogoDims] = useState<{ width: number, height: number } | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (inputMode === 'scan') {
      startScan();
    } else {
      stopScan();
    }
    return () => {
      stopScan();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputMode]);

  useEffect(() => {
    if (showInfo || isFullscreenQr) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showInfo, isFullscreenQr]);

  const startScan = async () => {
    if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
      return;
    }

    setIsScanning(true);
    setQrisPayload(null);
    setError(null);
    setImagePreview(null);

    try {
      if (!html5QrCodeRef.current) {
        html5QrCodeRef.current = new Html5Qrcode("reader");
      }

      await html5QrCodeRef.current.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          setQrisPayload(decodedText);
          setInputMode('upload'); // Switch back to upload view to show success
        },
        () => {
          // Ignore frequent scan errors
        }
      );
    } catch (err: any) {
      console.warn("Scan start error:", err);
      // Ignore transition overlap errors, otherwise show error to user
      if (typeof err === 'string' && (err.includes("transition") || err.includes("ongoing"))) {
        return;
      }
      setError("Gagal mengakses kamera. Pastikan izin diberikan.");
      setIsScanning(false);
      setInputMode('upload');
    }
  };

  const stopScan = () => {
    if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
      try {
        html5QrCodeRef.current.stop().then(() => {
          setIsScanning(false);
        }).catch((e) => console.warn('Async stop error:', e));
      } catch (err) {
        console.warn('Sync stop error:', err);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset states
    setError(null);
    setQrisPayload(null);
    setDynamicQris(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setImagePreview(dataUrl);
      decodeQR(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 1MB)
    if (file.size > 1 * 1024 * 1024) {
      alert("Ukuran gambar logo terlalu besar! Maksimal 1MB agar perangkat tidak hang.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      const img = new window.Image();
      img.onload = () => {
        // Compute proper aspect ratio (max dimension 64px, about 25% of 256px)
        let w = 64;
        let h = 64;
        if (img.width > img.height) {
          h = 64 * (img.height / img.width);
        } else if (img.height > img.width) {
          w = 64 * (img.width / img.height);
        }
        setLogoDims({ width: w, height: h });
        setLogoIcon(dataUrl);
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  const decodeQR = (dataUrl: string) => {
    const image = new window.Image();
    image.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = image.width;
      canvas.height = image.height;
      ctx.drawImage(image, 0, 0, image.width, image.height);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: "dontInvert",
      });

      if (code) {
        setQrisPayload(code.data);
      } else {
        setError('QR Code tidak terdeteksi pada gambar. Pastikan gambar jelas.');
      }
    };
    image.src = dataUrl;
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Remove non-numeric characters
    const rawValue = e.target.value.replace(/\D/g, '');
    if (!rawValue) {
      setAmount('');
      setFormattedAmount('');
      return;
    }
    // Format with id-ID locale for thousands separator
    const formatted = new Intl.NumberFormat('id-ID').format(Number(rawValue));
    setAmount(rawValue);
    setFormattedAmount(formatted);
  };

  const handleConvert = async () => {
    if (!qrisPayload) {
      setError('Payload QRIS tidak ditemukan. Silakan input ulang QRIS.');
      return;
    }

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setError('Masukkan nominal yang valid.');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setDynamicQris(null);

    try {
      const res = await fetch('/api/convert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payload: qrisPayload, amount: Number(amount) })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Terjadi kesalahan saat memproses QRIS.');
      }

      setDynamicQris(data.payload);
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setIsProcessing(false);
    }
  };

  const createQrisCanvas = (img: HTMLImageElement, logoImg: HTMLImageElement | null, onReady: (canvas: HTMLCanvasElement) => void) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    const PADDING = 40;
    const HEADER_HEIGHT = logoImg ? 60 : 0;
    const FOOTER_HEIGHT = 100;
    
    canvas.width = img.width + (PADDING * 2);
    canvas.height = img.height + HEADER_HEIGHT + FOOTER_HEIGHT + (PADDING * 2);
    
    if (ctx) {
      // Background
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      let qrY = PADDING;
      
      if (logoImg) {
        const logoH = 40;
        const logoW = (logoImg.width / logoImg.height) * logoH;
        const logoX = (canvas.width - logoW) / 2;
        ctx.drawImage(logoImg, logoX, PADDING, logoW, logoH);
        qrY += HEADER_HEIGHT;
      }

      // Draw QR Code
      ctx.drawImage(img, PADDING, qrY);
      
      // Footer text
      const footerY = qrY + img.height + 50;
      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 32px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`Rp ${formattedAmount}`, canvas.width / 2, footerY);
      
      ctx.fillStyle = '#64748b';
      ctx.font = '16px sans-serif';
      ctx.fillText('Konversi QRIS Statismu di qris.yukmaju.com', canvas.width / 2, footerY + 30);
      
      onReady(canvas);
    }
  };

  const handleDownload = () => {
    const svg = document.getElementById('qris-svg');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const img = new window.Image();

    img.onload = () => {
      const finish = (logoImg: HTMLImageElement | null) => {
        createQrisCanvas(img, logoImg, (canvas) => {
          const pngFile = canvas.toDataURL('image/png');
          const downloadLink = document.createElement('a');
          downloadLink.download = `QRIS-${amount}.png`;
          downloadLink.href = pngFile;
          downloadLink.click();
        });
      };

      const logoImg = new window.Image();
      logoImg.src = '/qris-logo.svg';
      logoImg.onload = () => finish(logoImg);
      logoImg.onerror = () => finish(null);
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  const handleShare = () => {
    const svg = document.getElementById('qris-svg');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const img = new window.Image();

    img.onload = () => {
      const finish = (logoImg: HTMLImageElement | null) => {
        createQrisCanvas(img, logoImg, async (canvas) => {
          canvas.toBlob(async (blob) => {
            if (!blob) return;
            const file = new File([blob], `QRIS-${amount}.png`, { type: 'image/png' });

            if (navigator.canShare && navigator.canShare({ files: [file] })) {
              try {
                await navigator.share({
                  title: 'QRIS Dinamis',
                  text: `QRIS Dinamis sebesar Rp ${formattedAmount}.\n\nKonversi QRIS Statismu di qris.yukmaju.com`,
                  files: [file]
                });
              } catch (err) {
                console.error("Error sharing:", err);
              }
            } else {
              alert('Peramban Anda tidak mendukung fitur berbagi file.');
            }
          });
        });
      };

      const logoImg = new window.Image();
      logoImg.src = '/qris-logo.svg';
      logoImg.onload = () => finish(logoImg);
      logoImg.onerror = () => finish(null);
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <div className="glass-card">
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginBottom: '1rem' }}>
        {mounted && (
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            style={{ background: 'var(--input-bg)', border: '1px solid var(--glass-border)', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', cursor: 'pointer', transition: 'all 0.2s' }}
            title="Ganti Tema"
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        )}
        <button
          onClick={() => setShowInfo(true)}
          style={{ background: 'var(--input-bg)', border: '1px solid var(--glass-border)', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', cursor: 'pointer', transition: 'all 0.2s' }}
          title="Informasi & Disclaimer"
        >
          <Info size={20} />
        </button>
      </div>

      <div className="header">
        <h1>QRIS Dinamis</h1>
        <p>Ubah QRIS Statis Anda menjadi Dinamis dengan mudah</p>
      </div>

      <div className="form-group">
        <label>1. Masukkan QRIS Statis</label>

        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
          <button
            className={`btn ${inputMode === 'upload' ? '' : 'inactive-btn'}`}
            style={{ flex: 1, opacity: inputMode === 'upload' ? 1 : 0.5, background: inputMode === 'upload' ? '' : 'var(--btn-secondary-bg)', color: inputMode === 'upload' ? '' : 'var(--text-primary)' }}
            onClick={() => setInputMode('upload')}
          >
            <ImageIcon size={18} /> Upload
          </button>
          <button
            className={`btn ${inputMode === 'scan' ? '' : 'inactive-btn'}`}
            style={{ flex: 1, opacity: inputMode === 'scan' ? 1 : 0.5, background: inputMode === 'scan' ? '' : 'var(--btn-secondary-bg)', color: inputMode === 'scan' ? '' : 'var(--text-primary)' }}
            onClick={() => setInputMode('scan')}
          >
            <Camera size={18} /> Kamera
          </button>
        </div>

        <div style={{ display: inputMode === 'upload' ? 'block' : 'none' }}>
          <div
            className="upload-area"
            onClick={() => fileInputRef.current?.click()}
          >
            {imagePreview ? (
              <img src={imagePreview} alt="Preview" className="preview-image" />
            ) : (
              <>
                <Upload className="upload-icon" />
                <p>Klik untuk memilih gambar QRIS</p>
              </>
            )}
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleFileChange}
            />
          </div>
        </div>

        <div style={{ display: inputMode === 'scan' ? 'block' : 'none' }}>
          <div id="reader" style={{ width: '100%', borderRadius: '16px', overflow: 'hidden' }}></div>
          {isScanning && <p style={{ textAlign: 'center', marginTop: '1rem' }}>Mencari QR Code...</p>}
        </div>

        {qrisPayload && !error && (
          <p style={{ color: '#4ade80', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem' }}>
            <CheckCircle2 size={16} /> QRIS berhasil dipindai
          </p>
        )}
      </div>

      <div className="form-group">
        <label>2. Masukkan Nominal (Rp)</label>
        <div style={{ position: 'relative' }}>
          <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }}>Rp</span>
          <input
            type="text"
            className="input-field"
            style={{ paddingLeft: '2.5rem' }}
            placeholder="Contoh: 50.000"
            value={formattedAmount}
            onChange={handleAmountChange}
          />
        </div>
      </div>

      {error && (
        <div className="error-message form-group">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      <button
        suppressHydrationWarning
        className="btn"
        onClick={handleConvert}
        disabled={isProcessing || !qrisPayload || !amount}
      >
        <QrCode size={20} />
        {isProcessing ? 'Memproses...' : 'Buat QRIS Dinamis'}
      </button>

      {dynamicQris && (
        <div className="result-container">
          <h3>QRIS Dinamis Anda Siap!</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            Nominal: Rp {formattedAmount}
          </p>

          <div className="qr-wrapper" onClick={() => setIsFullscreenQr(true)} style={{ cursor: 'pointer', position: 'relative', background: 'white', padding: '2rem 1.5rem', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
              <img src="/qris-logo.svg" alt="QRIS" style={{ height: '36px' }} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <QRCodeSVG
                id="qris-svg"
                value={dynamicQris}
                size={256}
                level="H"
                className="qr-code"
                {...(logoIcon && logoDims ? {
                  imageSettings: {
                    src: logoIcon,
                    height: logoDims.height,
                    width: logoDims.width,
                    excavate: true
                  }
                } : {})}
              />
            </div>

            <div style={{ textAlign: 'center', marginTop: '1.5rem', color: '#1e293b' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>Rp {formattedAmount}</div>
              <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                Konversi QRIS Statismu di <a href="https://qris.yukmaju.com" target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 'bold' }}>qris.yukmaju.com</a>
              </div>
            </div>

            <div style={{ position: 'absolute', bottom: '-1rem', right: '-1rem', background: 'var(--accent)', color: 'white', padding: '0.6rem', borderRadius: '50%', display: 'flex', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
              <Maximize2 size={18} />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem', alignItems: 'center' }}>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Opsional: Tambahkan Logo di Tengah QR</p>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="btn" style={{ background: 'var(--btn-secondary-bg)', color: 'var(--text-primary)', fontSize: '0.9rem', padding: '0.5rem 1rem', width: 'auto' }} onClick={() => logoInputRef.current?.click()}>
                <ImageIcon size={16} /> Pilih Logo
              </button>
              {logoIcon && (
                <button className="btn" style={{ background: 'var(--error)', fontSize: '0.9rem', padding: '0.5rem 1rem', width: 'auto' }} onClick={() => setLogoIcon(null)}>
                  Hapus Logo
                </button>
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              ref={logoInputRef}
              onChange={handleLogoChange}
              style={{ display: 'none' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', maxWidth: '400px', margin: '0 auto' }}>
            <button className="btn" onClick={handleDownload} style={{ flex: 1, background: '#10b981' }}>
              <Download size={20} />
              Download
            </button>
            <button className="btn" onClick={handleShare} style={{ flex: 1, background: '#3b82f6' }}>
              <Share2 size={20} />
              Bagikan
            </button>
          </div>
        </div>
      )}

      {mounted && isFullscreenQr && dynamicQris && createPortal(
        <div className={`modal-overlay ${closingFullscreen ? 'modal-overlay-closing' : 'modal-overlay-animated'}`} onClick={handleCloseFullscreen} style={{ zIndex: 9999, background: 'rgba(0,0,0,0.9)' }}>
          <div className={closingFullscreen ? 'modal-content-closing' : 'modal-content-animated'} style={{ background: 'white', padding: '1rem 1rem 1.5rem 1rem', borderRadius: typeof window !== 'undefined' && window.innerWidth <= 500 ? '0' : '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', width: '100%', maxWidth: '500px', maxHeight: '100vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-end', marginBottom: '0.5rem' }}>
              <button
                onClick={handleCloseFullscreen}
                style={{ background: 'var(--slate-100, #f1f5f9)', border: 'none', color: '#1e293b', cursor: 'pointer', borderRadius: '50%', padding: '0.5rem', display: 'flex', transition: 'background 0.2s' }}
              >
                <X size={24} />
              </button>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
              <img src="/qris-logo.svg" alt="QRIS" style={{ height: '36px' }} />
            </div>

            <QRCodeSVG
              value={dynamicQris}
              size={Math.min(typeof window !== 'undefined' ? window.innerWidth - 32 : 468, typeof window !== 'undefined' ? window.innerHeight - 200 : 468, 468)}
              level="H"
              {...(logoIcon && logoDims ? {
                imageSettings: {
                  src: logoIcon,
                  height: logoDims.height * 1.5,
                  width: logoDims.width * 1.5,
                  excavate: true
                }
              } : {})}
            />
            <div style={{ textAlign: 'center', marginTop: '1.5rem', color: '#1e293b' }}>
              <div style={{ fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>Rp {formattedAmount}</div>
              <div style={{ fontSize: '1rem', color: '#64748b' }}>
                Konversi QRIS Statismu di <a href="https://qris.yukmaju.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 'bold' }}>qris.yukmaju.com</a>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      <canvas ref={canvasRef} className="hidden-canvas" />

      {mounted && showInfo && createPortal(
        <div className={`modal-overlay ${closingInfo ? 'modal-overlay-closing' : 'modal-overlay-animated'}`} onClick={handleCloseInfo}>
          <div className={`modal-content glass-card ${closingInfo ? 'modal-content-closing' : 'modal-content-animated'}`} onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: '500px', maxHeight: '90vh', padding: 0, display: 'flex', flexDirection: 'column', position: 'relative', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', boxSizing: 'border-box', overflowY: 'auto' }}>
            
            <div style={{ position: 'sticky', top: 0, padding: '1.5rem 2rem', borderBottom: '1px solid var(--glass-border)', background: 'var(--glass-bg)', backdropFilter: 'blur(16px)', zIndex: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '1.5rem', color: 'var(--accent)', margin: 0 }}>Informasi & Disclaimer</h2>
              <button onClick={handleCloseInfo} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                <X size={24} />
              </button>
            </div>

            <div style={{ padding: '1.5rem 2rem', overflowY: 'auto', fontSize: '0.9rem', lineHeight: '1.5', color: 'var(--text-primary)', textAlign: 'left' }}>
              <h3 style={{ marginBottom: '0.75rem', color: 'var(--text-primary)', fontSize: '1.1rem' }}>Tata Cara Pemakaian:</h3>
              <ol style={{ paddingLeft: '1.5rem', marginBottom: '1.5rem', listStyleType: 'decimal' }}>
                <li style={{ marginBottom: '0.5rem' }}><strong>Siapkan QRIS Statis:</strong> Gunakan gambar QRIS dari bank/e-wallet Anda.</li>
                <li style={{ marginBottom: '0.5rem' }}><strong>Pilih Input:</strong> Upload gambar atau gunakan Kamera untuk scan langsung.</li>
                <li style={{ marginBottom: '0.5rem' }}><strong>Tentukan Nominal:</strong> Masukkan jumlah pembayaran yang diinginkan.</li>
                <li style={{ marginBottom: '0.5rem' }}><strong>Proses:</strong> Klik tombol "Buat QRIS Dinamis".</li>
                <li style={{ marginBottom: '0.5rem' }}><strong>Selesai:</strong> Unduh QR Code yang baru untuk dibagikan.</li>
              </ol>

              <h3 style={{ marginTop: '1.5rem', marginBottom: '0.75rem', color: 'var(--error)', fontSize: '1.1rem' }}>⚠️ Disclaimer:</h3>
              <ol style={{ paddingLeft: '1.5rem', marginBottom: '1rem', listStyleType: 'decimal' }}>
                <li style={{ marginBottom: '0.5rem' }}>Aplikasi ini 100% berjalan lokal. Tidak ada data yang dikirim ke server.</li>
                <li style={{ marginBottom: '0.5rem' }}>Penambahan logo di tengah QRIS dapat membuat QR lebih sulit di-scan oleh beberapa aplikasi bank.</li>
                <li style={{ marginBottom: '0.5rem' }}>Pengembang tidak bertanggung jawab atas kerugian finansial, gagal transfer, atau error sistem. Segala risiko adalah tanggung jawab pengguna sepenuhnya.</li>
                <li style={{ marginBottom: '0.5rem' }}>Selalu lakukan tes scan dengan nominal kecil sebelum digunakan untuk transaksi sungguhan.</li>
              </ol>
            </div>

          </div>
        </div>,
        document.body
      )}

      {/* Footer */}
      <footer className="mt-8 text-center" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
        <p>
          Situs ini merupakan bagian dari{' '}
          <a href="https://yukmaju.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 'bold' }}>
            yukmaju.com
          </a>
        </p>
      </footer>
    </div>
  );
}
