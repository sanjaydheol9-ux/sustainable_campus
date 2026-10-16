import React, { useState } from 'react';
import { Camera, Upload, CheckCircle2, AlertTriangle, Eye, ShieldCheck, X } from 'lucide-react';
import { SourceBadge } from '@/components/SourceBadge';
import { useToast } from '@/components/Toast';

interface VisionObservationCardProps {
  onObservationAdded?: (event: any) => void;
}

const SAMPLE_OBSERVATIONS = [
  {
    id: 's1',
    title: 'Overflowing Bin at Canteen Quad',
    type: 'waste',
    zone: 'Canteen',
    confidence: 0.88,
    source: 'sample' as const,
    label: 'Waste overflow detected',
    image: 'https://images.unsplash.com/photo-1605600659908-0ef719419d41?w=500&auto=format&fit=crop&q=60',
    description: 'Visual evidence indicates full receptacle exceeding 90% volumetric threshold.',
  },
  {
    id: 's2',
    title: 'Water Puddle on Garden Walkway',
    type: 'leak',
    zone: 'Garden / Irrigation',
    confidence: 0.79,
    source: 'sample' as const,
    label: 'Puddle / liquid accumulation',
    image: 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?w=500&auto=format&fit=crop&q=60',
    description: 'Standing water surface reflections detected on unshaded path.',
  },
];

export function VisionObservationCard({ onObservationAdded }: VisionObservationCardProps) {
  const { toast } = useToast();
  const [selectedSample, setSelectedSample] = useState<any>(SAMPLE_OBSERVATIONS[0]);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isManual, setIsManual] = useState(false);
  const [manualDetection, setManualDetection] = useState<{ label: string; confidence: number } | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast('Please upload an image file (PNG, JPG, WebP)', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast('Image file exceeds 5 MB limit', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setUploadedImage(reader.result as string);
      setIsManual(true);
      // Realistic simulated model inference on uploaded image
      setManualDetection({
        label: 'Waste overflow detected',
        confidence: 0.84,
      });
      toast('Image ingested. Computer vision inference simulated.', 'info');
    };
    reader.readAsDataURL(file);
  };

  const handleSelectSample = (sample: any) => {
    setSelectedSample(sample);
    setUploadedImage(null);
    setIsManual(false);
    setManualDetection(null);
  };

  const activeEvent = isManual && uploadedImage
    ? {
        title: 'Manual Field Upload',
        type: 'waste',
        zone: 'Campus Wide',
        confidence: manualDetection?.confidence || 0.84,
        source: 'manual' as const,
        label: manualDetection?.label || 'Waste overflow detected',
        image: uploadedImage,
        description: 'Uploaded by operator for visual validation review.',
      }
    : selectedSample;

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-[var(--color-accent)]/15 flex items-center justify-center text-[var(--color-accent)]">
            <Camera className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="font-semibold text-sm text-[var(--text-primary)]">
              Visual Observation
            </h3>
            <p className="text-[11px] text-[var(--text-secondary)]">
              Camera feeds & optical issue recognition
            </p>
          </div>
        </div>

        <SourceBadge source={activeEvent.source} />
      </div>

      {/* Main Body */}
      <div className="mt-3 flex-1 flex flex-col space-y-3">
        {/* Sample Selectors */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-[var(--text-secondary)] font-mono">Samples:</span>
          {SAMPLE_OBSERVATIONS.map(s => (
            <button
              key={s.id}
              type="button"
              onClick={() => handleSelectSample(s)}
              className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                !isManual && selectedSample.id === s.id
                  ? 'bg-[var(--color-accent)] text-white'
                  : 'border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {s.type === 'waste' ? 'Overflow Bin' : 'Water Puddle'}
            </button>
          ))}

          {/* Upload Button */}
          <label className="ml-auto inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-medium border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--border)]/30 text-[var(--text-primary)] cursor-pointer transition-colors">
            <Upload className="w-3 h-3 text-[var(--color-accent)]" />
            <span>Upload (≤5MB)</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>

        {/* Observation Image Preview with Bounding Overlay */}
        <div className="relative rounded-lg overflow-hidden border border-[var(--border)] bg-[var(--color-ink)] h-[170px] flex items-center justify-center group">
          <img
            src={activeEvent.image}
            alt={activeEvent.title}
            className="w-full h-full object-cover"
          />

          {/* Optical bounding box simulation */}
          <div className="absolute inset-4 border-2 border-dashed border-[var(--color-watch)] rounded pointer-events-none opacity-80 flex flex-col justify-between p-1.5">
            <span className="self-start px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[var(--color-watch)] text-black">
              {activeEvent.label} ({Math.round(activeEvent.confidence * 100)}%)
            </span>
            <span className="self-end text-[9px] font-mono text-white/80 bg-black/60 px-1 rounded">
              YOLOv8 Detection
            </span>
          </div>

          {/* Clear upload button if manual */}
          {isManual && (
            <button
              type="button"
              onClick={() => {
                setIsManual(false);
                setUploadedImage(null);
              }}
              className="absolute top-2 right-2 p-1 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
              title="Clear uploaded photo"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Observation Metadata */}
        <div className="rounded-lg border border-[var(--border)] p-2.5 bg-[var(--surface)] space-y-1.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-[var(--text-primary)]">
              {activeEvent.title}
            </span>
            <span className="text-[11px] font-mono text-[var(--color-accent)]">
              Zone: {activeEvent.zone}
            </span>
          </div>
          <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
            {activeEvent.description}
          </p>

          <div className="pt-1.5 border-t border-[var(--border)]/40 flex items-center justify-between text-[10px] font-mono text-[var(--text-secondary)]">
            <span>Model: Pretrained Roboflow YOLOv8</span>
            <span>Confidence: {(activeEvent.confidence * 100).toFixed(0)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
