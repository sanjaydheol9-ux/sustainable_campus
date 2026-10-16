// ========================================
// CampusSchematic — Polished 2D SVG campus map
// ========================================

import { useState, useCallback } from 'react';
import { motion } from 'motion/react';
import {
  BookOpen,
  UtensilsCrossed,
  GraduationCap,
  Building2,
  Car,
  Trees,
} from 'lucide-react';
import { cn, statusColors, statusLabels, prefersReducedMotion } from '@/lib/utils';
import { StatusBadge } from '@/components/StatusBadge';
import type { Zone, ZoneStatus } from '@/types';

interface CampusSchematicProps {
  zones: Zone[];
  selectedZoneId?: number | null;
  onSelectZone: (zoneId: number) => void;
  className?: string;
}

/** Zone icon mapping */
const zoneIcons: Record<string, typeof BookOpen> = {
  'Library Block': BookOpen,
  'Canteen': UtensilsCrossed,
  'Academic Block A': GraduationCap,
  'Hostel Block': Building2,
  'Parking Area': Car,
  'Garden / Irrigation': Trees,
};

/** Zone positions in the SVG grid - hand-tuned for aesthetics */
const zoneLayout: Record<string, { x: number; y: number; w: number; h: number }> = {
  'Library Block': { x: 40, y: 40, w: 200, h: 140 },
  'Canteen': { x: 270, y: 40, w: 200, h: 140 },
  'Academic Block A': { x: 500, y: 40, w: 200, h: 140 },
  'Hostel Block': { x: 40, y: 210, w: 200, h: 140 },
  'Parking Area': { x: 270, y: 210, w: 200, h: 140 },
  'Garden / Irrigation': { x: 500, y: 210, w: 200, h: 140 },
};

/** Color values (non-Tailwind, for SVG fills) */
const svgStatusColors: Record<ZoneStatus, { fill: string; stroke: string; text: string }> = {
  healthy: { fill: '#5E8C6A15', stroke: '#5E8C6A', text: '#5E8C6A' },
  watch: { fill: '#B88A3B15', stroke: '#B88A3B', text: '#B88A3B' },
  critical: { fill: '#A8483F15', stroke: '#A8483F', text: '#A8483F' },
  unknown: { fill: '#7A879715', stroke: '#7A8797', text: '#7A8797' },
};

function ZoneTile({
  zone,
  isSelected,
  onSelect,
}: {
  zone: Zone;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const layout = zoneLayout[zone.name] || { x: 0, y: 0, w: 200, h: 140 };
  const colors = svgStatusColors[zone.status] || svgStatusColors.unknown;
  const Icon = zoneIcons[zone.name] || Building2;
  const reducedMotion = prefersReducedMotion();

  return (
    <motion.g
      role="button"
      tabIndex={0}
      aria-label={`${zone.name} zone, status: ${statusLabels[zone.status]}`}
      onClick={onSelect}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(); } }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsHovered(true)}
      onBlur={() => setIsHovered(false)}
      style={{ cursor: 'pointer' }}
      whileHover={reducedMotion ? undefined : { scale: 1.02 }}
      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Zone background */}
      <rect
        x={layout.x}
        y={layout.y}
        width={layout.w}
        height={layout.h}
        rx={12}
        fill={colors.fill}
        stroke={isSelected ? colors.stroke : isHovered ? colors.stroke : 'var(--border)'}
        strokeWidth={isSelected ? 2.5 : 1}
        style={{
          transition: 'stroke 0.2s, stroke-width 0.2s',
        }}
      />

      {/* Zone icon */}
      <foreignObject
        x={layout.x + layout.w / 2 - 16}
        y={layout.y + 20}
        width={32}
        height={32}
      >
        <div className="flex items-center justify-center w-8 h-8">
          <Icon size={20} color={colors.text} strokeWidth={1.5} />
        </div>
      </foreignObject>

      {/* Zone name */}
      <text
        x={layout.x + layout.w / 2}
        y={layout.y + 72}
        textAnchor="middle"
        fill="var(--text-primary)"
        fontSize={13}
        fontFamily="var(--font-body)"
        fontWeight={500}
      >
        {zone.name}
      </text>

      {/* Status badge area */}
      <foreignObject
        x={layout.x + layout.w / 2 - 40}
        y={layout.y + 84}
        width={80}
        height={24}
      >
        <div className="flex justify-center">
          <StatusBadge
            status={zone.status}
            size="sm"
            pulse={zone.status === 'critical'}
          />
        </div>
      </foreignObject>

      {/* Zone type label */}
      <text
        x={layout.x + layout.w / 2}
        y={layout.y + layout.h - 16}
        textAnchor="middle"
        fill="var(--text-secondary)"
        fontSize={11}
        fontFamily="var(--font-mono)"
        className="uppercase"
      >
        {zone.zone_type}
      </text>

      {/* Critical pulse dot */}
      {zone.status === 'critical' && !reducedMotion && (
        <circle
          cx={layout.x + layout.w - 16}
          cy={layout.y + 16}
          r={5}
          fill={colors.stroke}
          opacity={0.7}
        >
          <animate
            attributeName="opacity"
            values="0.4;0.9;0.4"
            dur="2.5s"
            repeatCount="indefinite"
          />
        </circle>
      )}

      {/* Tooltip on hover */}
      {isHovered && !isSelected && (
        <foreignObject
          x={layout.x + layout.w / 2 - 80}
          y={layout.y - 36}
          width={160}
          height={30}
        >
          <div className="flex justify-center">
            <div className="rounded-md bg-[var(--surface)] border border-[var(--border)] px-3 py-1 text-[12px] text-[var(--text-primary)] shadow-sm whitespace-nowrap">
              Click to view details
            </div>
          </div>
        </foreignObject>
      )}
    </motion.g>
  );
}

export function CampusSchematic({ zones, selectedZoneId, onSelectZone, className }: CampusSchematicProps) {
  return (
    <div className={cn('relative', className)}>
      <svg
        viewBox="0 0 740 390"
        className="w-full h-auto"
        role="img"
        aria-label="Campus schematic showing six monitored zones"
      >
        {/* Background grid pattern */}
        <defs>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="var(--border)" strokeWidth="0.3" opacity="0.5" />
          </pattern>
        </defs>
        <rect width="740" height="390" fill="transparent" />
        <rect width="740" height="390" fill="url(#grid)" rx="12" />

        {/* Campus boundary */}
        <rect
          x={20}
          y={20}
          width={700}
          height={350}
          rx={16}
          fill="none"
          stroke="var(--border)"
          strokeWidth={1}
          strokeDasharray="6 4"
          opacity={0.5}
        />

        {/* Pathway lines between zones */}
        <line x1={240} y1={110} x2={270} y2={110} stroke="var(--border)" strokeWidth={1} strokeDasharray="4 3" />
        <line x1={470} y1={110} x2={500} y2={110} stroke="var(--border)" strokeWidth={1} strokeDasharray="4 3" />
        <line x1={140} y1={180} x2={140} y2={210} stroke="var(--border)" strokeWidth={1} strokeDasharray="4 3" />
        <line x1={370} y1={180} x2={370} y2={210} stroke="var(--border)" strokeWidth={1} strokeDasharray="4 3" />
        <line x1={600} y1={180} x2={600} y2={210} stroke="var(--border)" strokeWidth={1} strokeDasharray="4 3" />
        <line x1={240} y1={280} x2={270} y2={280} stroke="var(--border)" strokeWidth={1} strokeDasharray="4 3" />
        <line x1={470} y1={280} x2={500} y2={280} stroke="var(--border)" strokeWidth={1} strokeDasharray="4 3" />

        {/* Zone tiles */}
        {zones.map(zone => (
          <ZoneTile
            key={zone.id}
            zone={zone}
            isSelected={selectedZoneId === zone.id}
            onSelect={() => onSelectZone(zone.id)}
          />
        ))}
      </svg>

      {/* Disclaimer */}
      <p className="text-[11px] text-[var(--text-secondary)] font-mono mt-2 text-center opacity-70">
        Schematic layout, not a surveyed map
      </p>
    </div>
  );
}
