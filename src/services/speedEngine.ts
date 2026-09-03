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

  public async start(mode: 'full' | 'download_only' = 'full'): Promise<SpeedMetrics> {
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
      if (mode === 'download_only') {
        // Quick baseline latency check (3 iterations, 0-15%)
        await this.runPingTest(4);
        if (this.abortController.signal.aborted) throw new Error('Test cancelled');

        // Dedicated High-Precision Download Test (15-95%)
        this.metrics.phase = 'download';
        this.notify();
        const downloadStreams = Math.max(this.settings.parallelStreams || 6, 4);
        const downloadDuration = Math.max(this.settings.testDurationSeconds || 9, 7);
        await this.runDownloadTest(downloadDuration, downloadStreams, true);
        if (this.abortController.signal.aborted) throw new Error('Test cancelled');

        // Finishing Phase
        this.metrics.phase = 'finishing';
        this.metrics.progress = 98;
        this.notify();
        await new Promise((r) => setTimeout(r, 300));

        this.metrics.phase = 'completed';
        this.metrics.progress = 100;
        this.notify();
        this.isRunning = false;
        return this.metrics;
      }

      // Standard Full Diagnostic Flow:
      // 1. Latency & Ping Phase (Progress 0% - 20%)
      await this.runPingTest(14);
      if (this.abortController.signal.aborted) throw new Error('Test cancelled');

      // 2. Download Phase (Progress 20% - 60%)
      this.metrics.phase = 'download';
      this.notify();
      const downloadStreams = Math.max(this.settings.parallelStreams || 6, 4);
      const downloadDuration = Math.max(this.settings.testDurationSeconds || 9, 6);
      await this.runDownloadTest(downloadDuration, downloadStreams, false);
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
  private async runDownloadTest(durationSec: number = 9, streams: number = 6, isDedicatedDownload: boolean = false): Promise<void> {
    const signal = this.abortController?.signal;

    // A. Explicit Warm-Up Probe to trigger DNS, TLS handshake and proxy wake-up
    try {
      await new Promise<void>((resolve) => {
        const warmupXhr = new XMLHttpRequest();
        warmupXhr.open('GET', `/api/speedtest/download?bytes=524288&warmup=1&t=${Date.now()}`, true);
        warmupXhr.setRequestHeader('Cache-Control', 'no-cache, no-store');
        warmupXhr.setRequestHeader('Pragma', 'no-cache');
        warmupXhr.timeout = 2000;
        warmupXhr.onload = () => resolve();
        warmupXhr.onerror = () => resolve();
        warmupXhr.ontimeout = () => resolve();
        if (signal) {
          signal.addEventListener('abort', () => warmupXhr.abort());
        }
        warmupXhr.send();
      });
    } catch {
      // Warmup fail-safe
    }

    if (signal?.aborted) return;

    const testStartTime = performance.now();
    const testEndTime = testStartTime + durationSec * 1000;
    const warmUpGracePeriodMs = 800; // 0.8s warm-up window

    let totalBytesLoaded = 0;
    let bytesAtWarmupEnd = 0;
    let warmupCompleted = false;

    const rateSamples: number[] = [];
    const telemetry: number[] = [];

    // Rolling high-resolution history queue for 900ms sliding window calculation
    const windowHistory: { time: number; bytes: number }[] = [];
    let smoothedSpeedMbps = 0;

    // Optimal chunk size per stream request (6MB - 12MB) to keep TCP socket continuously saturated
    const chunkBytes = this.settings.dataSaverMode ? 4 * 1024 * 1024 : 12 * 1024 * 1024;
    const activeXhrs: XMLHttpRequest[] = [];

    const downloadWorker = async (streamId: number) => {
      // Stagger stream starts slightly (15ms) to prevent initial socket contention
      if (streamId > 0) {
        await new Promise((r) => setTimeout(r, streamId * 15));
      }

      while (performance.now() < testEndTime && !signal?.aborted) {
        await new Promise<void>((resolve) => {
          if (signal?.aborted || performance.now() >= testEndTime) {
            resolve();
            return;
          }

          const xhr = new XMLHttpRequest();
          activeXhrs.push(xhr);

          const cacheBuster = `${Date.now()}_${streamId}_${Math.random().toString(36).substring(2, 6)}`;
          xhr.open('GET', `/api/speedtest/download?bytes=${chunkBytes}&s=${streamId}&t=${cacheBuster}`, true);
          xhr.setRequestHeader('Cache-Control', 'no-cache, no-store');
          xhr.setRequestHeader('Pragma', 'no-cache');
          xhr.responseType = 'arraybuffer';

          let lastLoaded = 0;
          xhr.onprogress = (event) => {
            if (signal?.aborted || performance.now() >= testEndTime) {
              xhr.abort();
              resolve();
              return;
            }
            const delta = event.loaded - lastLoaded;
            if (delta > 0) {
              totalBytesLoaded += delta;
              lastLoaded = event.loaded;
            }
          };

          const onFinish = () => {
            const idx = activeXhrs.indexOf(xhr);
            if (idx !== -1) activeXhrs.splice(idx, 1);
            resolve();
          };

          xhr.onload = onFinish;
          xhr.onerror = onFinish;
          xhr.onabort = onFinish;

          if (signal) {
            signal.addEventListener('abort', () => xhr.abort());
          }

          xhr.send();
        });
      }
    };

    // Real-time telemetry ticker (every 50ms for live, responsive feedback)
    const ticker = setInterval(() => {
      const now = performance.now();
      const elapsedTotalSec = (now - testStartTime) / 1000;

      // Track bytes loaded when warmup window ends
      if (!warmupCompleted && (now - testStartTime) >= warmUpGracePeriodMs) {
        warmupCompleted = true;
        bytesAtWarmupEnd = totalBytesLoaded;
      }

      // Record sliding window sample
      windowHistory.push({ time: now, bytes: totalBytesLoaded });

      // Keep sliding window of 900ms to eliminate false drops between packet arrivals
      while (windowHistory.length > 2 && (now - windowHistory[0].time) > 900) {
        windowHistory.shift();
      }

      const oldest = windowHistory[0];
      const windowDeltaSec = (now - oldest.time) / 1000;
      const deltaBytes = totalBytesLoaded - oldest.bytes;

      if (windowDeltaSec >= 0.12) {
        // Precise Window Speed: Mbps = (Delta Bytes * 8) / (Delta Seconds * 1,000,000)
        const instantMbps = (deltaBytes * 8) / (windowDeltaSec * 1000000);
        
        // Cumulative sustained speed since warmup began
        const sustainedElapsedSec = Math.max(0.1, (now - (testStartTime + warmUpGracePeriodMs)) / 1000);
        const sustainedBytes = Math.max(0, totalBytesLoaded - bytesAtWarmupEnd);
        const cumulativeSpeedMbps = warmupCompleted 
          ? (sustainedBytes * 8) / (sustainedElapsedSec * 1000000)
          : instantMbps;

        // Smooth speed indicator without sudden zero-decay
        if (instantMbps > 0.1) {
          if (smoothedSpeedMbps === 0) {
            smoothedSpeedMbps = instantMbps;
          } else {
            // Responsive EMA: rises rapidly, smoothly buffers dips
            const weight = instantMbps > smoothedSpeedMbps ? 0.65 : 0.35;
            smoothedSpeedMbps = smoothedSpeedMbps * (1 - weight) + instantMbps * weight;
          }
        } else if (cumulativeSpeedMbps > 0.1) {
          smoothedSpeedMbps = smoothedSpeedMbps * 0.85 + cumulativeSpeedMbps * 0.15;
        }

        const displaySpeed = Number(Math.max(smoothedSpeedMbps, cumulativeSpeedMbps * 0.75, 0.1).toFixed(2));

        // Record post-warmup measurements for statistical plateau determination
        if (now - testStartTime > warmUpGracePeriodMs && displaySpeed > 0.1) {
          rateSamples.push(displaySpeed);
        }

        telemetry.push(displaySpeed);
        if (telemetry.length > 100) telemetry.shift();

        const peak = Math.max(this.metrics.download.peak, displaySpeed);
        const progressFraction = Math.min(elapsedTotalSec / durationSec, 1);

        this.metrics.download = {
          current: displaySpeed,
          peak,
          avg: cumulativeSpeedMbps > 0.1 ? Number(cumulativeSpeedMbps.toFixed(2)) : displaySpeed,
          bytesTransferred: totalBytesLoaded,
          telemetry: [...telemetry],
        };

        // Progress mapping
        if (isDedicatedDownload) {
          this.metrics.progress = Math.round(15 + progressFraction * 80);
        } else {
          this.metrics.progress = Math.round(20 + progressFraction * 40);
        }
        this.notify();
      }
    }, 50);

    // Launch concurrent parallel workers (4-6 streams)
    const activeWorkers = Array.from({ length: streams }, (_, i) => downloadWorker(i));
    await Promise.all(activeWorkers);
    
    // Cleanup active XHR requests & ticker
    clearInterval(ticker);
    activeXhrs.forEach((x) => {
      try { x.abort(); } catch {}
    });

    // Final Stable Score Calculation (True Sustained Physical Throughput + Trimmed Median)
    const sustainedDurationSec = Math.max((performance.now() - (testStartTime + warmUpGracePeriodMs)) / 1000, 0.5);
    const sustainedBytesLoaded = Math.max(totalBytesLoaded - bytesAtWarmupEnd, 1);
    
    // True Physical Sustained Speed in Mbps
    const physicalSustainedMbps = (sustainedBytesLoaded * 8) / (sustainedDurationSec * 1000000);

    let finalStableMbps = 0;
    if (rateSamples.length > 5) {
      // Discard bottom 15% (ramp-up residuals) and top 5% (socket burst outliers)
      const sorted = [...rateSamples].sort((a, b) => a - b);
      const startIdx = Math.floor(sorted.length * 0.15);
      const endIdx = Math.max(startIdx + 1, Math.floor(sorted.length * 0.95));
      const plateau = sorted.slice(startIdx, endIdx);
      const plateauAvg = plateau.reduce((a, b) => a + b, 0) / plateau.length;

      // Blend physical bytes calculation (60%) with plateau sustained average (40%)
      finalStableMbps = Number(((plateauAvg * 0.4) + (physicalSustainedMbps * 0.6)).toFixed(2));
    } else {
      const testDurationActualSec = (performance.now() - testStartTime) / 1000;
      finalStableMbps = Number(((totalBytesLoaded * 8) / (testDurationActualSec * 1000000)).toFixed(2));
    }

    this.metrics.download.avg = Math.max(finalStableMbps, 0.1);
    this.metrics.download.current = Math.max(finalStableMbps, 0.1);
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
