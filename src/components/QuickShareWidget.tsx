import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import {
  Share2,
  Copy,
  Check,
  QrCode,
  Download,
  ExternalLink,
  MessageCircle,
  Send,
  Sparkles,
  Users,
  Eye,
  CheckCircle2
} from 'lucide-react';
import { User } from '../types';

interface QuickShareWidgetProps {
  user: User;
  directsCount: number;
}

export const QuickShareWidget: React.FC<QuickShareWidgetProps> = ({ user, directsCount }) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrSize, setQrSize] = useState<number>(180);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const referralUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/?tab=register&ref=${user.referralId}`
    : `https://sareemlm.com/?tab=register&ref=${user.referralId}`;

  const sharePitch = `🌸 *Join Saree MLM with ${user.fullName}!* 🌸\n\n🛍️ Pay just *₹2,000* to receive *4 Designer Sarees* delivered straight to your home!\n💰 Earn up to *₹99,120* passive income through our strict 3x8 matrix network!\n\n👉 *My Sponsor Referral ID:* ${user.referralId}\n🔗 *Direct Registration Link:* ${referralUrl}`;

  // Generate QR code whenever referralUrl changes
  useEffect(() => {
    let isMounted = true;

    QRCode.toDataURL(referralUrl, {
      width: 400,
      margin: 2,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    })
      .then((url: string) => {
        if (isMounted) {
          setQrDataUrl(url);
        }
      })
      .catch((err: Error) => {
        console.error('Failed to generate QR code:', err);
      });

    return () => {
      isMounted = false;
    };
  }, [referralUrl]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCopyPitch = () => {
    navigator.clipboard.writeText(sharePitch);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2500);
  };

  const handleShareWhatsApp = () => {
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(sharePitch)}`, '_blank');
  };

  const handleShareTelegram = () => {
    window.open(`https://t.me/share/url?url=${encodeURIComponent(referralUrl)}&text=${encodeURIComponent(sharePitch)}`, '_blank');
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join Saree MLM 3x8 Network',
          text: sharePitch,
          url: referralUrl,
        });
      } catch (err) {
        // User cancelled or share failed
      }
    } else {
      handleCopyLink();
    }
  };

  const handleDownloadQr = () => {
    if (!qrDataUrl) return;

    // Create a branded canvas with referral text and logo
    const img = new Image();
    img.src = qrDataUrl;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const width = 500;
      const height = 620;
      canvas.width = width;
      canvas.height = height;

      // Background gradient
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, '#0f172a');
      gradient.addColorStop(1, '#1e1b4b');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Card container
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.roundRect(25, 25, width - 50, height - 50, 24);
      ctx.fill();

      // Brand Title
      ctx.fillStyle = '#9f1239';
      ctx.font = 'bold 24px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('SAREE MLM 3x8 NETWORK', width / 2, 70);

      ctx.fillStyle = '#64748b';
      ctx.font = '14px sans-serif';
      ctx.fillText('Get 4 Designer Sarees for ₹2,000 & Earn ₹99,120', width / 2, 95);

      // Draw QR Code
      const qrSizeDraw = 320;
      const qrX = (width - qrSizeDraw) / 2;
      const qrY = 120;
      ctx.drawImage(img, qrX, qrY, qrSizeDraw, qrSizeDraw);

      // Member Sponsor Info Box
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.roundRect(50, 460, width - 100, 100, 16);
      ctx.fill();
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText(`Sponsor: ${user.fullName}`, width / 2, 495);

      ctx.fillStyle = '#e11d48';
      ctx.font = 'bold 22px monospace';
      ctx.fillText(`REFERRAL ID: ${user.referralId}`, width / 2, 530);

      // Footer note
      ctx.fillStyle = '#94a3b8';
      ctx.font = '12px sans-serif';
      ctx.fillText('Scan with any Camera or UPI / QR Scanner to Register', width / 2, 585);

      // Trigger download
      const downloadLink = document.createElement('a');
      downloadLink.download = `saree-mlm-qr-${user.referralId}.png`;
      downloadLink.href = canvas.toDataURL('image/png');
      downloadLink.click();
    };
  };

  const vacantSlots = Math.max(0, 3 - directsCount);

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-rose-950/40 border border-rose-900/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
      {/* Widget Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-bold mb-2 border border-rose-500/30">
            <Share2 className="w-3.5 h-3.5 text-amber-400" />
            <span>Quick Share &amp; Member Referral Utility</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            Quick Share Your Referral Link
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Share your unique invitation link or QR code to fill your strictly limited 3 direct slots.
          </p>
        </div>

        {/* Direct Slots Counter Badge */}
        <div className="flex items-center gap-3 bg-slate-950/90 border border-slate-800 px-4 py-2 rounded-2xl shrink-0 self-start sm:self-auto">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Direct Slots Status</div>
            <div className="text-sm font-black text-amber-400 font-mono">
              {directsCount} / 3 Filled {vacantSlots > 0 ? `(${vacantSlots} Open)` : '(Full)'}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Side: Referral Link & Copy Actions (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Main Referral Link Box */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span>Your Unique Referral Link</span>
              <span className="text-[11px] text-amber-400 font-mono font-bold">
                Referral ID: {user.referralId}
              </span>
            </label>

            <div className="flex items-center bg-slate-950 border border-slate-700/80 rounded-2xl p-1.5 focus-within:border-rose-500 transition shadow-inner">
              <input
                type="text"
                readOnly
                value={referralUrl}
                className="w-full bg-transparent px-3 py-2 text-xs sm:text-sm text-slate-200 font-mono focus:outline-none truncate selection:bg-rose-500 selection:text-white"
              />
              <button
                onClick={handleCopyLink}
                className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 shrink-0 transition shadow-lg ${
                  copiedLink
                    ? 'bg-emerald-600 text-white shadow-emerald-600/30'
                    : 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30'
                }`}
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-200" /> : <Copy className="w-4 h-4" />}
                <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
              </button>
            </div>
          </div>

          {/* Instant Share Buttons */}
          <div>
            <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Instant 1-Click Share to Channels
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {/* WhatsApp */}
              <button
                onClick={handleShareWhatsApp}
                className="py-2.5 px-3 bg-emerald-950/70 hover:bg-emerald-900/80 border border-emerald-500/40 text-emerald-300 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition hover:scale-[1.02] shadow-lg shadow-emerald-950/40"
              >
                <MessageCircle className="w-4 h-4 text-emerald-400" />
                <span>WhatsApp</span>
              </button>

              {/* Telegram */}
              <button
                onClick={handleShareTelegram}
                className="py-2.5 px-3 bg-sky-950/70 hover:bg-sky-900/80 border border-sky-500/40 text-sky-300 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition hover:scale-[1.02] shadow-lg shadow-sky-950/40"
              >
                <Send className="w-4 h-4 text-sky-400" />
                <span>Telegram</span>
              </button>

              {/* Copy Full Pitch */}
              <button
                onClick={handleCopyPitch}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition hover:scale-[1.02] border ${
                  copiedText
                    ? 'bg-emerald-950 border-emerald-500 text-emerald-300'
                    : 'bg-slate-950 hover:bg-slate-800 border-slate-700 text-slate-300'
                }`}
              >
                {copiedText ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-amber-400" />}
                <span>{copiedText ? 'Pitch Copied!' : 'Copy Pitch'}</span>
              </button>

              {/* Native Device Share */}
              <button
                onClick={handleNativeShare}
                className="py-2.5 px-3 bg-purple-950/70 hover:bg-purple-900/80 border border-purple-500/40 text-purple-300 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition hover:scale-[1.02]"
              >
                <Share2 className="w-4 h-4 text-purple-400" />
                <span>More Apps</span>
              </button>
            </div>
          </div>

          {/* Ready Pitch Preview Box */}
          <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-2xl text-xs space-y-1.5">
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold">
              <span className="flex items-center gap-1.5 text-amber-400">
                <Sparkles className="w-3.5 h-3.5" />
                Pre-Written Invite Message:
              </span>
              <button
                onClick={handleCopyPitch}
                className="text-rose-400 hover:text-rose-300 underline font-bold"
              >
                {copiedText ? 'Copied to Clipboard!' : 'Copy Text'}
              </button>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed italic bg-slate-900/80 p-2.5 rounded-xl border border-slate-800/80 font-mono">
              "Join Saree MLM with {user.fullName}! Pay just ₹2,000 to receive 4 designer sarees at home and earn up to ₹99,120 through our strict 3x8 matrix team! My Referral ID is {user.referralId}."
            </p>
          </div>
        </div>

        {/* Right Side: QR Code Generation Utility (5 cols) */}
        <div className="lg:col-span-5 flex flex-col items-center bg-slate-950/90 border border-slate-800 p-6 rounded-3xl relative overflow-hidden group">
          <div className="text-center mb-3">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-400 bg-rose-500/10 px-2.5 py-0.5 rounded-full border border-rose-500/20">
              Personalized QR Code
            </span>
            <h3 className="text-sm font-bold text-white mt-1">Scan to Register Instantly</h3>
          </div>

          {/* QR Code Canvas / Image Display */}
          <div className="p-3 bg-white rounded-2xl shadow-xl border-4 border-slate-800 group-hover:border-rose-500/60 transition duration-300 relative">
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt={`QR code for ${user.referralId}`}
                className="w-44 h-44 object-contain rounded-lg"
              />
            ) : (
              <div className="w-44 h-44 flex items-center justify-center text-slate-400 text-xs">
                Generating QR code...
              </div>
            )}
            <div className="absolute inset-x-0 -bottom-2 text-center">
              <span className="bg-slate-900 text-amber-400 font-mono text-[10px] font-black px-2 py-0.5 rounded-full border border-slate-700 shadow">
                {user.referralId}
              </span>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 text-center mt-4 max-w-xs">
            Show this on your phone screen or download to print on flyers, posters, or WhatsApp stories.
          </p>

          {/* QR Code Utility Action Buttons */}
          <div className="mt-4 flex items-center gap-2.5 w-full">
            <button
              onClick={handleDownloadQr}
              className="flex-1 py-2.5 px-3 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg shadow-rose-600/30 transition hover:scale-[1.02]"
            >
              <Download className="w-4 h-4" />
              <span>Download Image</span>
            </button>
            <button
              onClick={() => setShowQrModal(true)}
              className="py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border border-slate-700 transition"
              title="View Large QR"
            >
              <Eye className="w-4 h-4 text-amber-400" />
              <span>Preview</span>
            </button>
          </div>
        </div>
      </div>

      {/* Enlarged QR Code Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative text-center space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="text-left">
                <h3 className="text-lg font-black text-white">Your Referral QR Code</h3>
                <p className="text-xs text-slate-400 font-mono">Sponsor: {user.fullName} ({user.referralId})</p>
              </div>
              <button
                onClick={() => setShowQrModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <div className="p-4 bg-white rounded-2xl mx-auto inline-block shadow-2xl border-4 border-slate-800">
              {qrDataUrl && (
                <img
                  src={qrDataUrl}
                  alt={`QR code for ${user.referralId}`}
                  className="w-64 h-64 object-contain"
                />
              )}
            </div>

            <div className="text-xs text-slate-300 space-y-1">
              <div className="font-mono text-amber-400 font-bold break-all bg-slate-950 p-2 rounded-xl border border-slate-800">
                {referralUrl}
              </div>
              <p className="text-[11px] text-slate-500">
                Any member scanning this QR code will automatically have your Referral ID {user.referralId} pre-filled.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={handleCopyLink}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copiedLink ? 'Link Copied!' : 'Copy URL'}</span>
              </button>
              <button
                onClick={handleDownloadQr}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-rose-600/30 transition"
              >
                <Download className="w-4 h-4" />
                <span>Download Poster PNG</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
