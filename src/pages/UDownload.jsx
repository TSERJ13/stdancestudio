import React, { useState, useEffect, useRef } from 'react';
import { 
  Download, 
  Music, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Clipboard, 
  X, 
  Zap, 
  ShieldCheck, 
  Headphones,
  ArrowRight
} from 'lucide-react';
import './UDownload.css';

const YoutubeIcon = ({ size = 22, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path fill="#ef4444" d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

const FORMATS = [
  { id: 'mp3', label: 'MP3 (Audio)' },
  { id: 'm4a', label: 'M4A (AAC)' },
];

export default function UDownload() {
  const [url, setUrl] = useState('');
  const [format, setFormat] = useState('mp3');
  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [downloadingFile, setDownloadingFile] = useState(false);

  const pollIntervalRef = useRef(null);
  const isDownloadingRef = useRef(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('stdance_udownload_history');
      if (saved) setHistory(JSON.parse(saved));
    } catch {}

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, []);

  const saveToHistory = (item) => {
    try {
      const updated = [item, ...history.filter(h => h.id !== item.id)].slice(0, 8);
      setHistory(updated);
      localStorage.setItem('stdance_udownload_history', JSON.stringify(updated));
    } catch {}
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text && (text.includes('youtube.com') || text.includes('youtu.be'))) {
        setUrl(text.trim());
        setError(null);
      }
    } catch {
      // Clipboard permissions denied
    }
  };

  // Direct Ad-Free Blob Download into browser without opening ad tabs
  const triggerDirectDownload = async (directUrl, songTitle, songFmt = 'mp3') => {
    if (!directUrl || isDownloadingRef.current) return;
    isDownloadingRef.current = true;
    setDownloadingFile(true);

    const safeFilename = `${(songTitle || 'YouTube_Audio')
      .replace(/[/\\?%*:|"<>]/g, '_')
      .trim()}.${(songFmt || 'mp3').toLowerCase()}`;

    try {
      // 1. Fetch direct binary stream via client fetch (Zero popups, zero tabs, zero ads)
      const res = await fetch(directUrl);
      if (!res.ok) throw new Error(`Direct fetch returned ${res.status}`);

      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = safeFilename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => window.URL.revokeObjectURL(blobUrl), 25000);
    } catch (err) {
      console.warn('Direct blob download failed, trying server proxy stream...', err);
      // 2. Fallback: stream through our own Vercel API endpoint
      try {
        const proxyUrl = `/api/yt-download?action=file&fileUrl=${encodeURIComponent(directUrl)}&filename=${encodeURIComponent(safeFilename)}`;
        const link = document.createElement('a');
        link.href = proxyUrl;
        link.download = safeFilename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (fallbackErr) {
        console.error('All download methods failed', fallbackErr);
        setError('ფაილის გადმოწერა ვერ მოხერხდა. გთხოვთ სცადოთ ხელახლა.');
      }
    } finally {
      isDownloadingRef.current = false;
      setDownloadingFile(false);
    }
  };

  const handleConvert = async (overrideUrl) => {
    const targetUrl = (overrideUrl || url).trim();
    if (!targetUrl) {
      setError('გთხოვთ ჩასვათ YouTube-ის ლინკი');
      return;
    }

    if (!targetUrl.includes('youtube.com') && !targetUrl.includes('youtu.be')) {
      setError('გთხოვთ მიუთითოთ სწორი YouTube ლინკი (მაგ. youtube.com/watch?v=...)');
      return;
    }

    setError(null);
    setResult(null);
    setLoading(true);
    setProgress(15);
    setStatusText('YouTube ვიდეოს დამუშავება...');

    try {
      // 1. Initiate Conversion Request via proxy API
      const apiEndpoint = `/api/yt-download?url=${encodeURIComponent(targetUrl)}&format=${format}`;
      let res;
      try {
        res = await fetch(apiEndpoint);
      } catch (networkErr) {
        res = await fetch(`https://loader.to/ajax/download.php?button=1&start=1&end=1&format=${format}&url=${encodeURIComponent(targetUrl)}`);
      }

      if (!res.ok) {
        throw new Error('კონვერტაციის დაწყება ვერ მოხერხდა. სცადეთ თავიდან.');
      }

      const data = await res.json();
      if (!data.id) {
        throw new Error(data.message || 'ვიდეოს მოძიება ვერ მოხერხდა.');
      }

      setProgress(40);
      setStatusText('აუდიოს ამოღება & MP3-ში კონვერტაცია...');

      // 2. Poll for Progress URL
      const progressId = data.id;
      let attempts = 0;
      const maxAttempts = 35; // 35 * 1.5s ~ 50 seconds max

      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);

      pollIntervalRef.current = setInterval(async () => {
        attempts++;
        if (attempts > maxAttempts) {
          clearInterval(pollIntervalRef.current);
          setLoading(false);
          setError('კონვერტაციას ზედმეტად დიდი დრო დასჭირდა. გთხოვთ სცადოთ სხვა ვიდეო.');
          return;
        }

        try {
          let pollRes;
          try {
            pollRes = await fetch(`/api/yt-download?id=${encodeURIComponent(progressId)}`);
          } catch {
            pollRes = await fetch(`https://lto2.affadaffa.com/api/progress?id=${encodeURIComponent(progressId)}`);
          }

          if (!pollRes.ok) return;

          const pollData = await pollRes.json();

          if (pollData.progress && pollData.progress > 0) {
            const mappedProgress = Math.min(95, Math.floor(40 + (pollData.progress / 1000) * 55));
            setProgress(mappedProgress);
          }

          if (pollData.download_url && (pollData.success === 1 || pollData.progress === 1000)) {
            clearInterval(pollIntervalRef.current);
            setProgress(100);
            setStatusText('მზადაა! ფაილი ავტომატურად იწერება...');
            setLoading(false);

            const resultObj = {
              id: progressId,
              title: pollData.title || data.title || 'YouTube Audio',
              thumbnail: pollData.thumbnail_url || data.thumbnail_url || '',
              downloadUrl: pollData.download_url,
              format: format.toUpperCase(),
              date: new Date().toLocaleDateString('ka-GE')
            };

            setResult(resultObj);
            saveToHistory(resultObj);

            // Automatically download file directly into browser (Zero ads)
            triggerDirectDownload(pollData.download_url, resultObj.title, format);
          }
        } catch (pollErr) {
          console.warn('Poll error, retrying...', pollErr);
        }
      }, 1500);

    } catch (err) {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      setLoading(false);
      setError(err.message || 'დაფიქსირდა შეცდომა. გთხოვთ გადაამოწმოთ ლინკი.');
    }
  };

  return (
    <div className="udownload-page">
      <div className="udownload-container">
        {/* Header */}
        <div className="udownload-header">
          <span className="udownload-badge">
            <Sparkles size={13} />
            <span>STDance Studio • Free Downloader</span>
          </span>
          <h1 className="udownload-title">YouTube to MP3 Downloader</h1>
          <p className="udownload-subtitle">
            ჩამოტვირთეთ ნებისმიერი საცეკვაო მუსიკა და ტრეკი YouTube-იდან უმაღლესი ხარისხით, პირდაპირ მოწყობილობაში რეკლამების გარეშე.
          </p>
        </div>

        {/* Converter Card */}
        <div className="udownload-card">
          <div className="udownload-input-box">
            <YoutubeIcon className="udownload-input-icon" size={22} />
            <input 
              type="text" 
              className="udownload-input"
              placeholder="ჩასვით YouTube-ის ლინკი აქ (მაგ. https://youtube.com/watch?v=...)"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                if (error) setError(null);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleConvert();
              }}
            />
            {url ? (
              <button 
                type="button" 
                className="input-action-btn"
                onClick={() => setUrl('')}
                title="გასუფთავება"
              >
                <X size={14} />
              </button>
            ) : (
              <button 
                type="button" 
                className="input-action-btn"
                onClick={handlePaste}
                title="Clipboard-იდან ჩასმა"
              >
                <Clipboard size={14} />
                <span>ჩასმა</span>
              </button>
            )}
          </div>

          {/* Options & Action */}
          <div className="udownload-options">
            <div className="format-pills">
              {FORMATS.map(f => (
                <button
                  key={f.id}
                  type="button"
                  className={`format-pill ${format === f.id ? 'active' : ''}`}
                  onClick={() => setFormat(f.id)}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <button
              type="button"
              className="btn-convert"
              disabled={loading || !url.trim()}
              onClick={() => handleConvert()}
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="spinner" style={{ margin: 0 }} />
                  <span>მუშავდება...</span>
                </>
              ) : (
                <>
                  <Download size={18} />
                  <span>Convert &amp; Download</span>
                </>
              )}
            </button>
          </div>

          {/* Status / Loading State */}
          {loading && (
            <div className="status-container animate-in">
              <div className="status-loading-box">
                <Loader2 size={32} className="spinner" />
                <p style={{ margin: '0 0 6px', fontSize: '14.5px', fontWeight: 600 }}>{statusText}</p>
                <span style={{ fontSize: '12px', color: '#94a3b8' }}>{progress}% შესრულებულია</span>
                <div className="progress-track">
                  <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="status-container animate-in">
              <div className="error-box">
                <AlertCircle size={20} style={{ flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            </div>
          )}

          {/* Ready Result Card */}
          {result && (
            <div className="status-container animate-in">
              <div className="result-card">
                {result.thumbnail && (
                  <img src={result.thumbnail} alt="" className="result-thumb" />
                )}
                <div className="result-info">
                  <span className="result-badge">✓ {result.format} Ready</span>
                  <h3 className="result-title" title={result.title}>{result.title}</h3>
                  <p style={{ margin: 0, fontSize: '12px', color: downloadingFile ? '#4ade80' : '#94a3b8' }}>
                    {downloadingFile ? '⏳ ფაილი პირდაპირ იწერება მოწყობილობაში...' : 'ფაილი მზადაა (რეკლამების გარეშე)'}
                  </p>
                </div>
                <button 
                  type="button"
                  onClick={() => triggerDirectDownload(result.downloadUrl, result.title, result.format)}
                  disabled={downloadingFile}
                  className="btn-download-direct"
                >
                  {downloadingFile ? (
                    <>
                      <Loader2 size={18} className="spinner" style={{ margin: 0 }} />
                      <span>იწერება...</span>
                    </>
                  ) : (
                    <>
                      <Download size={18} />
                      <span>Download {result.format}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Feature Points */}
        <div className="udownload-features">
          <div className="feature-item">
            <Zap className="feature-icon" size={24} />
            <h4 className="feature-title">სწრაფი კონვერტაცია</h4>
            <p className="feature-desc">პირდაპირი MP3 ნაკადი მაქსიმალური სიჩქარითა და მაღალი ბიტრეიტით.</p>
          </div>
          <div className="feature-item">
            <ShieldCheck className="feature-icon" size={24} />
            <h4 className="feature-title">სუფთა &amp; უსაფრთხო</h4>
            <p className="feature-desc">არანაირი ამომხტარი რეკლამები, სპამი ან მავნე გადამისამართებები.</p>
          </div>
          <div className="feature-item">
            <Headphones className="feature-icon" size={24} />
            <h4 className="feature-title">მზადაა საცეკვაოდ</h4>
            <p className="feature-desc">გადმოწერილი ფაილები იდეალურია პრაქტიკისთვის და მუსიკალური ბიბლიოთეკისთვის.</p>
          </div>
        </div>

        {/* Recent Downloads History */}
        {history.length > 0 && (
          <div className="udownload-history">
            <h3 className="history-title">ბოლოს გადმოწერილი სიმღერები</h3>
            <div className="history-list">
              {history.map((item) => (
                <div key={item.id} className="history-item">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1 }}>
                    <Music size={16} style={{ color: '#c084fc', flexShrink: 0 }} />
                    <span style={{ fontSize: '13.5px', color: '#e2e8f0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.title}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => triggerDirectDownload(item.downloadUrl, item.title, item.format || 'mp3')}
                    disabled={downloadingFile}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: downloadingFile ? 'not-allowed' : 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      color: '#4ade80',
                      fontSize: '12px',
                      fontWeight: 700,
                      textDecoration: 'none',
                      marginLeft: '12px',
                      flexShrink: 0,
                      opacity: downloadingFile ? 0.6 : 1
                    }}
                  >
                    <span>Download</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
