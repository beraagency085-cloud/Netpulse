import { SpeedMetrics, PingMetrics, QualityAssessment, TestSettings } from '../types';

export class SpeedTestEngine {
  private abortController: AbortController | null = null;
  private isRunning: boolean = false;
  private onUpdate: (metrics: SpeedMetrics) => void;
  private settings: TestSettings;

  private metrics: SpeedMetrics = {
    ping: {
      current: 0,
      min: 0,
      avg: 0,
      max: 0,
      jitter: 0,
      samples: [],
    },
    download: {
      current: 0,
      peak: 0,
      avg: 0,
      bytesTransferred: 0,
      telemetry: [],
    },
    upload: {
      current: 0,
      peak: 0,
      avg: 0,
      bytesTransferred: 0,
      telemetry: [],
    },
    progress: 0,
    phase: 'idle',
  };

  constructor(onUpdate: (metrics: SpeedMetrics) => void, settings: TestSettings) {
    this.onUpdate = onUpdate;
    this.settings = settings;
  }

  public updateSettings(settings: TestSettings) {
    this.settings = settings;
  }

  public async start(): Promise<SpeedMetrics> {
    if (this.isRunning) {
      this.abort();
    }

    this.isRunning = true;
    this.abortController = new AbortController();

    // Reset initial metrics
    this.metrics = {
      ping: { current: 0, min: 0, avg: 0, max: 0, jitter: 0, samples: [] },
      download: { current: 0, peak: 0, avg: 0, bytesTransferred: 0, telemetry: [] },
      upload: { current: 0, peak: 0, avg: 0, bytesTransferred: 0, telemetry: [] },
      progress: 0,
      phase: 'latency',
      timestamp: Date.now(),
    };
    this.notify();

    try {
      // 1. Latency & Ping Phase (Progress 0% - 20%)
      await this.runPingTest(14);
      if (this.abortController.signal.aborted) throw new Error('Test cancelled');

      // 2. Download Phase (Progress 20% - 60%)
      this.metrics.phase = 'download';
      this.notify();
      const downloadStreams = Math.max(this.settings.parallelStreams || 6, 4);
      const downloadDuration = Math.max(this.settings.testDurationSeconds || 9, 6);
      await this.runDownloadTest(downloadDuration, downloadStreams);
      if (this.abortController.signal.aborted) throw new Error('Test cancelled');

      // 3. Upload Phase (Progress 60% - 95%)
      this.metrics.phase = 'upload';
      this.notify();
      const uploadStreams = Math.min(Math.max(this.settings.parallelStreams || 4, 3), 6);
      const uploadDuration = Math.max(this.settings.testDurationSeconds || 7, 5);
      await this.runUploadTest(uploadDuration, uploadStreams);
      if (this.abortController.signal.aborted) throw new Error('Test cancelled');

      // 4. Finishing Phase (Progress 95% - 100%)
      this.metrics.phase = 'finishing';
      this.metrics.progress = 98;
      this.notify();
      await new Promise((r) => setTimeout(r, 400));

      this.metrics.phase = 'completed';
      this.metrics.progress = 100;
      this.notify();
      this.isRunning = false;
      return this.metrics;
    } catch (err: any) {
      if (err.message !== 'Test cancelled') {
        console.error('Speed test execution error:', err);
        this.metrics.phase = 'error';
        this.metrics.error = err.message || 'Network test failed. Please verify your connection.';
        this.notify();
      }
      this.isRunning = false;
      throw err;
    }
  }

  public abort() {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
    this.isRunning = false;
    this.metrics.phase = 'idle';
    this.metrics.progress = 0;
    this.notify();
  }

  private notify() {
    this.onUpdate({ ...this.metrics });
  }

  // --- 1. Real Latency & Jitter Engine ---
  private async runPingTest(iterations: number = 14): Promise<PingMetrics> {
    const samples: number[] = [];
    const signal = this.abortController?.signal;

    // A. Warm-Up Probes: Execute 2 initial requests to warm up TCP, TLS socket, and DNS lookup.
    // We discard the 1st cold connection overhead so physical round-trip time is accurately captured.
    try {
      await fetch(`/api/speedtest/ping?warmup=1&t=${Date.now()}`, {
        cache: 'no-store',
        signal,
        headers: { 'Cache-Control': 'no-cache', Pragma: 'no-cache' },
      }).catch(() => {});
    } catch {
      // Ignore warmup errors
    }

    let runningJitter = 0;

    for (let i = 0; i < iterations; i++) {
      if (signal?.aborted) break;

      const t0 = performance.now();
      try {
        const response = await fetch(`/api/speedtest/ping?t=${Date.now()}&i=${i}`, {
          cache: 'no-store',
          signal,
          headers: { 
            'Cache-Control': 'no-cache', 
            Pragma: 'no-cache',
            'X-Client-Timestamp': `${Date.now()}` 
          },
        });

        if (!response.ok) {
          // If server is not ready or static CDN fallback
          throw new Error('Ping response not ok');
        }

        await response.text();
        const rtt = Math.max(1, Math.round(performance.now() - t0));
        samples.push(rtt);

        // Calculate RFC 3550 Standard Jitter & successive delta
        if (samples.length > 1) {
          const diff = Math.abs(samples[samples.length - 1] - samples[samples.length - 2]);
          // Standard Jitter smoothing: J = J + (|D| - J) / 16
          runningJitter = runningJitter === 0 ? diff : runningJitter + (diff - runningJitter) / 16;
        }

        // Statistical aggregation
        const min = Math.min(...samples);
        const max = Math.max(...samples);
        const avg = Math.round(samples.reduce((a, b) => a + b, 0) / samples.length);
        const jitter = Math.round(runningJitter);

        this.metrics.ping = {
          current: rtt,
          min,
          max,
          avg,
          jitter,
          samples: [...samples],
        };
        this.metrics.progress = Math.round(((i + 1) / iterations) * 20);
        this.notify();

        // High frequency sampling with 40ms interval
        await new Promise((r) => setTimeout(r, 40));
      } catch (err: any) {
        if (signal?.aborted) throw err;
        // Fallback probe measurement
        const fallbackRtt = Math.max(5, Math.round(performance.now() - t0));
        samples.push(fallbackRtt);
      }
    }

    // Final ping smoothing (trimmed median for highly stable score)
    if (samples.length > 0) {
      const sorted = [...samples].sort((a, b) => a - b);
      const min = sorted[0];
      const max = sorted[sorted.length - 1];
      // Trim top and bottom outliers for avg
      const trimmed = sorted.slice(1, sorted.length > 3 ? sorted.length - 1 : sorted.length);
      const avg = Math.round(trimmed.reduce((a, b) => a + b, 0) / trimmed.length);

      this.metrics.ping.min = min;
      this.metrics.ping.max = max;
      this.metrics.ping.avg = avg;
      this.metrics.ping.current = avg;
      this.notify();
    }

    return this.metrics.ping;
  }

  // --- 2. Real Multi-Stream Download Throughput Engine ---
  private async runDownloadTest(durationSec: number = 9, streams: number = 6): Promise<void> {
    const signal = this.abortController?.signal;

    // A. Explicit Download Warm-Up Probe (Allows TCP Slow-Start, TLS buffers, and 4G/5G carrier radio to awaken)
    try {
      await fetch(`/api/speedtest/download?bytes=1048576&warmup=1&t=${Date.now()}`, {
        cache: 'no-store',
        signal,
        headers: { 'Cache-Control': 'no-cache', Pragma: 'no-cache' },
      }).then(r => r.body?.getReader().read()).catch(() => {});
    } catch {
      // Warmup fail-safe
    }

    if (signal?.aborted) return;

    const testStartTime = performance.now();
    const testEndTime = testStartTime + durationSec * 1000;
    const warmUpGracePeriodMs = 1000; // Discard initial 1.0s ramp-up from final average

    let totalBytesLoaded = 0;
    const rateSamples: number[] = [];
    const telemetry: number[] = [];

    // High-resolution sliding window for instantaneous throughput
    let lastWindowBytes = 0;
    let lastWindowTime = testStartTime;
    let smoothedSpeedMbps = 0;

    // High capacity chunk per stream (15MB - 35MB) to keep TCP pipes continuously full
    const streamChunkBytes = this.settings.dataSaverMode ? 6 * 1024 * 1024 : 35 * 1024 * 1024;

    const downloadWorker = async (streamId: number) => {
      // Stagger stream starts slightly (25ms) to prevent single-packet TCP synchronization drops
      if (streamId > 0) {
        await new Promise((r) => setTimeout(r, streamId * 25));
      }

      while (performance.now() < testEndTime && !signal?.aborted) {
        try {
          const res = await fetch(`/api/speedtest/download?bytes=${streamChunkBytes}&s=${streamId}&t=${Date.now()}`, {
            cache: 'no-store',
            signal,
            headers: {
              'Cache-Control': 'no-cache',
              Pragma: 'no-cache',
            },
          });

          if (!res.ok || !res.body) {
            throw new Error(`Download stream failed: ${res.statusText}`);
          }

          const reader = res.body.getReader();
          while (true) {
            if (signal?.aborted) {
              await reader.cancel();
              return;
            }

            const { done, value } = await reader.read();
            if (done) break;

            if (value) {
              totalBytesLoaded += value.length;
            }

            if (performance.now() >= testEndTime) {
              await reader.cancel();
              return;
            }
          }
        } catch (e: any) {
          if (signal?.aborted) return;
          // Graceful retry backoff
          await new Promise((r) => setTimeout(r, 50));
        }
      }
    };

    // Real-time telemetry ticker (every 60ms for ultra-responsive live feedback)
    const ticker = setInterval(() => {
      const now = performance.now();
      const elapsedTotalSec = (now - testStartTime) / 1000;
      const windowDeltaSec = (now - lastWindowTime) / 1000;

      if (windowDeltaSec >= 0.1) {
        const deltaBytes = totalBytesLoaded - lastWindowBytes;
        // Formula: Mbps = (Delta Bytes * 8) / (Delta Seconds * 1,000,000)
        const rawInstantMbps = (deltaBytes * 8) / (windowDeltaSec * 1000000);
        
        // Exponential Moving Average (EMA) filter for responsive yet non-jittery live UI rendering
        if (smoothedSpeedMbps === 0) {
          smoothedSpeedMbps = rawInstantMbps;
        } else {
          smoothedSpeedMbps = smoothedSpeedMbps * 0.4 + rawInstantMbps * 0.6;
        }

        const displaySpeed = Number(smoothedSpeedMbps.toFixed(2));

        // Record post-warmup measurements for statistical plateau determination
        if (now - testStartTime > warmUpGracePeriodMs && displaySpeed > 0.05) {
          rateSamples.push(displaySpeed);
        }

        telemetry.push(displaySpeed);
        if (telemetry.length > 100) telemetry.shift();

        const peak = Math.max(this.metrics.download.peak, displaySpeed);
        const progressFraction = Math.min(elapsedTotalSec / durationSec, 1);

        this.metrics.download = {
          current: displaySpeed,
          peak,
          avg: displaySpeed,
          bytesTransferred: totalBytesLoaded,
          telemetry: [...telemetry],
        };
        this.metrics.progress = Math.round(20 + progressFraction * 40);
        this.notify();

        lastWindowBytes = totalBytesLoaded;
        lastWindowTime = now;
      }
    }, 60);

    // Launch concurrent parallel workers (4-6 streams)
    const activeWorkers = Array.from({ length: streams }, (_, i) => downloadWorker(i));
    await Promise.all(activeWorkers);
    clearInterval(ticker);

    // Final Stable Score Calculation (Trimmed Mean / Plateau Median)
    // Discards the bottom 15% (slow start/ramp) and top 5% (cache burst outliers)
    let finalStableMbps = 0;
    if (rateSamples.length > 0) {
      const sorted = [...rateSamples].sort((a, b) => a - b);
      const startIdx = Math.floor(sorted.length * 0.15);
      const endIdx = Math.max(startIdx + 1, Math.floor(sorted.length * 0.95));
      const plateau = sorted.slice(startIdx, endIdx);
      finalStableMbps = Number((plateau.reduce((a, b) => a + b, 0) / plateau.length).toFixed(2));
    } else {
      const totalElapsedSec = Math.max((performance.now() - testStartTime) / 1000, 0.5);
      finalStableMbps = Number(((totalBytesLoaded * 8) / (totalElapsedSec * 1000000)).toFixed(2));
    }

    this.metrics.download.avg = finalStableMbps;
    this.metrics.download.current = finalStableMbps;
    this.metrics.download.peak = Math.max(this.metrics.download.peak, finalStableMbps);
    this.metrics.download.bytesTransferred = totalBytesLoaded;
    this.notify();
  }

  // --- 3. Real Multi-Stream Upload Throughput Engine ---
  private async runUploadTest(durationSec: number = 7, streams: number = 4): Promise<void> {
    const signal = this.abortController?.signal;
    const testStartTime = performance.now();
    const testEndTime = testStartTime + durationSec * 1000;
    const warmUpDurationMs = 1000; // 1.0s upload warm-up

    let totalBytesSent = 0;
    const rateSamples: number[] = [];
    const telemetry: number[] = [];

    // Pre-allocate 4MB binary payload to reuse across streams without memory allocations
    const uploadPayloadSize = this.settings.dataSaverMode ? 1024 * 1024 : 4 * 1024 * 1024;
    const buffer = new Uint8Array(uploadPayloadSize);
    for (let i = 0; i < buffer.length; i += 64) {
      buffer[i] = (Math.random() * 255) | 0;
    }
    const uploadBlob = new Blob([buffer], { type: 'application/octet-stream' });

    let lastWindowBytes = 0;
    let lastWindowTime = testStartTime;

    const uploadWorker = async (_streamId: number) => {
      while (performance.now() < testEndTime && !signal?.aborted) {
        await new Promise<void>((resolve) => {
          const xhr = new XMLHttpRequest();
          xhr.open('POST', `/api/speedtest/upload?t=${Date.now()}`, true);
          xhr.setRequestHeader('Cache-Control', 'no-cache');
          xhr.setRequestHeader('Content-Type', 'application/octet-stream');

          let lastLoaded = 0;
          xhr.upload.onprogress = (event) => {
            if (signal?.aborted) {
              xhr.abort();
              resolve();
              return;
            }
            const delta = event.loaded - lastLoaded;
            if (delta > 0) {
              totalBytesSent += delta;
              lastLoaded = event.loaded;
            }
          };

          xhr.onload = () => resolve();
          xhr.onerror = () => resolve();
          xhr.onabort = () => resolve();

          if (signal) {
            signal.addEventListener('abort', () => xhr.abort());
          }

          xhr.send(uploadBlob);
        });
      }
    };

    // Real-time telemetry ticker
    const ticker = setInterval(() => {
      const now = performance.now();
      const elapsedTotalSec = (now - testStartTime) / 1000;
      const windowDeltaSec = (now - lastWindowTime) / 1000;

      if (windowDeltaSec >= 0.15) {
        const deltaBytes = totalBytesSent - lastWindowBytes;
        // Formula: Mbps = (Delta Bytes * 8) / (Delta Seconds * 1,000,000)
        const instantMbps = (deltaBytes * 8) / (windowDeltaSec * 1000000);
        const roundedInstantMbps = Number(instantMbps.toFixed(2));

        if (now - testStartTime > warmUpDurationMs && roundedInstantMbps > 0.05) {
          rateSamples.push(roundedInstantMbps);
        }

        telemetry.push(roundedInstantMbps);
        if (telemetry.length > 100) telemetry.shift();

        const peak = Math.max(this.metrics.upload.peak, roundedInstantMbps);
        const progressFraction = Math.min(elapsedTotalSec / durationSec, 1);

        this.metrics.upload = {
          current: roundedInstantMbps,
          peak,
          avg: roundedInstantMbps,
          bytesTransferred: totalBytesSent,
          telemetry: [...telemetry],
        };
        this.metrics.progress = Math.round(60 + progressFraction * 35);
        this.notify();

        lastWindowBytes = totalBytesSent;
        lastWindowTime = now;
      }
    }, 80);

    const activeWorkers = Array.from({ length: streams }, (_, i) => uploadWorker(i));
    await Promise.all(activeWorkers);
    clearInterval(ticker);

    // Final Stable Score Calculation (Trimmed Mean of Sustained Plateau)
    let finalStableMbps = 0;
    if (rateSamples.length > 0) {
      const sorted = [...rateSamples].sort((a, b) => a - b);
      const startIdx = Math.floor(sorted.length * 0.15);
      const endIdx = Math.max(startIdx + 1, Math.floor(sorted.length * 0.95));
      const plateau = sorted.slice(startIdx, endIdx);
      finalStableMbps = Number((plateau.reduce((a, b) => a + b, 0) / plateau.length).toFixed(2));
    } else {
      const totalElapsedSec = Math.max((performance.now() - testStartTime) / 1000, 0.5);
      finalStableMbps = Number(((totalBytesSent * 8) / (totalElapsedSec * 1000000)).toFixed(2));
    }

    this.metrics.upload.avg = finalStableMbps;
    this.metrics.upload.current = finalStableMbps;
    this.metrics.upload.peak = Math.max(this.metrics.upload.peak, finalStableMbps);
    this.metrics.upload.bytesTransferred = totalBytesSent;
    this.notify();
  }

  // --- Quality Assessment Algorithm ---
  public static calculateAssessment(downloadMbps: number, uploadMbps: number, pingMs: number, jitterMs: number): QualityAssessment {
    let score = 100;

    // Download evaluation
    if (downloadMbps < 5) score -= 35;
    else if (downloadMbps < 25) score -= 20;
    else if (downloadMbps < 50) score -= 10;
    else if (downloadMbps > 100) score += 5;

    // Upload evaluation
    if (uploadMbps < 2) score -= 25;
    else if (uploadMbps < 10) score -= 15;
    else if (uploadMbps < 20) score -= 5;

    // Latency evaluation
    if (pingMs > 100) score -= 30;
    else if (pingMs > 50) score -= 15;
    else if (pingMs > 25) score -= 5;

    // Jitter evaluation
    if (jitterMs > 20) score -= 20;
    else if (jitterMs > 10) score -= 10;

    let grade: 'A+' | 'A' | 'B' | 'C' | 'D' = 'B';
    let label = 'Good Connection';
    let color = 'text-emerald-400';
    let summary = 'Great for standard 1080p streaming, browsing, and remote work.';

    if (score >= 90) {
      grade = 'A+';
      label = 'Elite High-Speed';
      color = 'text-cyan-400';
      summary = 'Flawless performance for competitive gaming, multi-device 4K streaming, and heavy cloud transfers.';
    } else if (score >= 80) {
      grade = 'A';
      label = 'Excellent Connection';
      color = 'text-emerald-400';
      summary = 'Superb speed and ultra-responsive ping, suitable for demanding online workloads.';
    } else if (score >= 65) {
      grade = 'B';
      label = 'Good Connection';
      color = 'text-blue-400';
      summary = 'Smooth video conferencing and fast downloads with stable responsiveness.';
    } else if (score >= 45) {
      grade = 'C';
      label = 'Fair Connection';
      color = 'text-amber-400';
      summary = 'Adequate for regular browsing and single-stream video, but may buffer during peak loads.';
    } else {
      grade = 'D';
      label = 'Sub-optimal Speed';
      color = 'text-rose-400';
      summary = 'High latency or low bandwidth detected. You may experience noticeable lag.';
    }

    // Individual use-case ratings
    const isGamingOk = pingMs <= 35 && jitterMs <= 8;
    const isStreaming4KOk = downloadMbps >= 30;
    const isVideoCallsOk = uploadMbps >= 5 && pingMs <= 70;
    const isCloudBackupOk = uploadMbps >= 25;

    return {
      grade,
      label,
      summary,
      color,
      suitability: {
        gaming: {
          rating: isGamingOk ? 'Excellent' : pingMs <= 60 ? 'Good' : pingMs <= 100 ? 'Fair' : 'Poor',
          icon: 'Gamepad2',
          detail: pingMs <= 35 ? 'Low latency & minimal jitter' : 'Moderate ping delays expected',
        },
        streaming4K: {
          rating: isStreaming4KOk ? 'Excellent' : downloadMbps >= 15 ? 'Good' : 'Fair',
          icon: 'Tv',
          detail: downloadMbps >= 30 ? 'Smooth Ultra-HD HDR bufferless' : 'HD 1080p supported',
        },
        videoCalls: {
          rating: isVideoCallsOk ? 'Excellent' : uploadMbps >= 2 ? 'Good' : 'Fair',
          icon: 'Video',
          detail: isVideoCallsOk ? 'Crystal clear HD video & audio' : 'Basic video conferencing',
        },
        cloudBackup: {
          rating: isCloudBackupOk ? 'Excellent' : uploadMbps >= 10 ? 'Good' : 'Fair',
          icon: 'CloudUpload',
          detail: isCloudBackupOk ? 'Blazing file & video uploads' : 'Moderate upload transfer times',
        },
      },
    };
  }
}
