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
      await this.runPingTest(12);
      if (this.abortController.signal.aborted) throw new Error('Test cancelled');

      // 2. Download Phase (Progress 20% - 60%)
      this.metrics.phase = 'download';
      this.notify();
      await this.runDownloadTest(this.settings.testDurationSeconds || 8, this.settings.parallelStreams || 4);
      if (this.abortController.signal.aborted) throw new Error('Test cancelled');

      // 3. Upload Phase (Progress 60% - 95%)
      this.metrics.phase = 'upload';
      this.notify();
      await this.runUploadTest(this.settings.testDurationSeconds || 6, Math.min(this.settings.parallelStreams || 4, 3));
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
        console.error('Speed test error:', err);
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

  // --- Real Latency & Jitter Test ---
  private async runPingTest(iterations: number = 10): Promise<PingMetrics> {
    const samples: number[] = [];
    const signal = this.abortController?.signal;

    for (let i = 0; i < iterations; i++) {
      if (signal?.aborted) break;

      const t0 = performance.now();
      try {
        const response = await fetch(`/api/speedtest/ping?t=${Date.now()}&i=${i}`, {
          cache: 'no-store',
          signal,
          headers: { 'Cache-Control': 'no-cache', 'X-Client-Timestamp': `${Date.now()}` },
        });
        if (!response.ok) throw new Error('Ping failed');
        await response.json();
        const rtt = Math.round(performance.now() - t0);
        samples.push(rtt);

        // Update live metrics
        const min = Math.min(...samples);
        const max = Math.max(...samples);
        const avg = Math.round(samples.reduce((a, b) => a + b, 0) / samples.length);

        // Jitter: average difference between consecutive pings
        let jitterSum = 0;
        for (let j = 1; j < samples.length; j++) {
          jitterSum += Math.abs(samples[j] - samples[j - 1]);
        }
        const jitter = samples.length > 1 ? Math.round(jitterSum / (samples.length - 1)) : 0;

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

        // Brief delay between pings to avoid burst queuing
        await new Promise((r) => setTimeout(r, 60));
      } catch (err: any) {
        if (signal?.aborted) throw err;
        // Fallback sample if minor glitch
        samples.push(Math.round(performance.now() - t0));
      }
    }

    return this.metrics.ping;
  }

  // --- Real Multi-Stream Download Throughput Test ---
  private async runDownloadTest(durationSec: number = 8, streams: number = 4): Promise<void> {
    const signal = this.abortController?.signal;
    const startTime = performance.now();
    const endTime = startTime + durationSec * 1000;

    let totalBytesLoaded = 0;
    const streamTrackers: { [key: number]: number } = {};
    const telemetry: number[] = [];

    // Chunk size: 5MB per fetch request
    const chunkSize = this.settings.dataSaverMode ? 2 * 1024 * 1024 : 6 * 1024 * 1024;

    const workerStream = async (streamId: number) => {
      while (performance.now() < endTime && !signal?.aborted) {
        try {
          const res = await fetch(`/api/speedtest/download?bytes=${chunkSize}&s=${streamId}&t=${Date.now()}`, {
            cache: 'no-store',
            signal,
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
              const chunkLen = value.length;
              totalBytesLoaded += chunkLen;
              streamTrackers[streamId] = (streamTrackers[streamId] || 0) + chunkLen;
            }

            if (performance.now() >= endTime) {
              await reader.cancel();
              return;
            }
          }
        } catch (e: any) {
          if (signal?.aborted) return;
          // small backoff before next fetch iteration
          await new Promise((r) => setTimeout(r, 100));
        }
      }
    };

    // Polling ticker for smooth UI updates and telemetry
    const ticker = setInterval(() => {
      const elapsedSec = (performance.now() - startTime) / 1000;
      if (elapsedSec <= 0) return;

      // Mbps = (Bytes * 8) / (ElapsedSeconds * 1,000,000)
      const currentMbps = (totalBytesLoaded * 8) / (elapsedSec * 1000000);
      const roundedMbps = Number(currentMbps.toFixed(2));

      telemetry.push(roundedMbps);
      if (telemetry.length > 100) telemetry.shift();

      const peak = Math.max(this.metrics.download.peak, roundedMbps);
      const progressFraction = Math.min(elapsedSec / durationSec, 1);

      this.metrics.download = {
        current: roundedMbps,
        peak,
        avg: roundedMbps,
        bytesTransferred: totalBytesLoaded,
        telemetry: [...telemetry],
      };
      this.metrics.progress = Math.round(20 + progressFraction * 40);
      this.notify();
    }, 100);

    // Launch concurrent parallel download workers
    const activeWorkers = Array.from({ length: streams }, (_, i) => workerStream(i));
    await Promise.all(activeWorkers);
    clearInterval(ticker);

    // Finalize download numbers
    const totalElapsedSec = Math.max((performance.now() - startTime) / 1000, 0.5);
    const finalAvgMbps = Number(((totalBytesLoaded * 8) / (totalElapsedSec * 1000000)).toFixed(2));
    this.metrics.download.avg = finalAvgMbps;
    this.metrics.download.current = finalAvgMbps;
    this.notify();
  }

  // --- Real Multi-Stream Upload Throughput Test ---
  private async runUploadTest(durationSec: number = 6, streams: number = 3): Promise<void> {
    const signal = this.abortController?.signal;
    const startTime = performance.now();
    const endTime = startTime + durationSec * 1000;

    let totalBytesSent = 0;
    const telemetry: number[] = [];

    // Pre-create 1.5MB binary payload to upload in loops
    const uploadPayloadSize = this.settings.dataSaverMode ? 1024 * 1024 : 2 * 1024 * 1024;
    const buffer = new Uint8Array(uploadPayloadSize);
    for (let i = 0; i < buffer.length; i += 64) {
      buffer[i] = (Math.random() * 255) | 0;
    }
    const blob = new Blob([buffer], { type: 'application/octet-stream' });

    const uploadWorker = async (_streamId: number) => {
      while (performance.now() < endTime && !signal?.aborted) {
        await new Promise<void>((resolve) => {
          const xhr = new XMLHttpRequest();
          xhr.open('POST', `/api/speedtest/upload?t=${Date.now()}`, true);
          xhr.setRequestHeader('Cache-Control', 'no-cache');

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

          xhr.send(blob);
        });
      }
    };

    const ticker = setInterval(() => {
      const elapsedSec = (performance.now() - startTime) / 1000;
      if (elapsedSec <= 0) return;

      const currentMbps = (totalBytesSent * 8) / (elapsedSec * 1000000);
      const roundedMbps = Number(currentMbps.toFixed(2));

      telemetry.push(roundedMbps);
      if (telemetry.length > 100) telemetry.shift();

      const peak = Math.max(this.metrics.upload.peak, roundedMbps);
      const progressFraction = Math.min(elapsedSec / durationSec, 1);

      this.metrics.upload = {
        current: roundedMbps,
        peak,
        avg: roundedMbps,
        bytesTransferred: totalBytesSent,
        telemetry: [...telemetry],
      };
      this.metrics.progress = Math.round(60 + progressFraction * 35);
      this.notify();
    }, 100);

    const activeWorkers = Array.from({ length: streams }, (_, i) => uploadWorker(i));
    await Promise.all(activeWorkers);
    clearInterval(ticker);

    const totalElapsedSec = Math.max((performance.now() - startTime) / 1000, 0.5);
    const finalAvgMbps = Number(((totalBytesSent * 8) / (totalElapsedSec * 1000000)).toFixed(2));
    this.metrics.upload.avg = finalAvgMbps;
    this.metrics.upload.current = finalAvgMbps;
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
