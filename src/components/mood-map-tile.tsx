'use client';

import { Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface MoodMapTileProps {
  moodData: (number | null)[];
  delay?: number;
}

export function MoodMapTile({ moodData }: MoodMapTileProps) {
  const router = useRouter();
  const hasAnyData = moodData.some((mood) => mood !== null);

  // Base color for mood visualization
  const baseColor = { r: 72, g: 180, b: 172 }; // #48B4AC

  const handleClick = () => {
    // Navigate to Timeline page with "This week" filter and calendar view
    router.push('/timeline?dateRange=week&view=calendar');
  };

  return (
    <div
      onClick={handleClick}
      className="bg-white dark:bg-neutral-900 rounded-2xl p-5 shadow-sm border border-neutral-200 dark:border-neutral-800 cursor-pointer hover:shadow-md hover:scale-[1.02] transition-all duration-200"
    >
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="h-5 w-5 text-violet-500" />
        <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">
          Mood Map
        </h3>
      </div>

      {/* SVG Visualization - Circular arrangement */}
      <div className="flex items-center justify-center h-20">
        <svg
          width="80"
          height="80"
          viewBox="0 0 100 100"
          className="overflow-visible"
        >
          {moodData.map((mood, index) => {
            // Arrange circles in a circular pattern
            const centerX = 50;
            const centerY = 50;
            const arrangementRadius = 32; // Radius of the circle arrangement
            const circleRadius = 8;

            // Calculate angle for this circle (start from top, go clockwise)
            const angleStep = (2 * Math.PI) / 7; // 360° / 7 circles
            const angle = index * angleStep - Math.PI / 2; // -90° to start at top

            // Calculate position
            const cx = centerX + arrangementRadius * Math.cos(angle);
            const cy = centerY + arrangementRadius * Math.sin(angle);

            // Calculate fill based on mood value
            let fill: string;
            let stroke: string | undefined;
            let strokeDasharray: string | undefined;

            if (mood !== null) {
              // Mood exists: use opacity based on mood value (1-5)
              const opacity = 0.2 * mood;
              fill = `rgba(${baseColor.r}, ${baseColor.g}, ${baseColor.b}, ${opacity})`;
            } else {
              // No mood: placeholder style
              fill = `rgba(${baseColor.r}, ${baseColor.g}, ${baseColor.b}, 0.15)`;
              stroke = `rgba(${baseColor.r}, ${baseColor.g}, ${baseColor.b}, 0.4)`;
              strokeDasharray = '4 2';
            }

            return (
              <circle
                key={index}
                cx={cx}
                cy={cy}
                r={circleRadius}
                fill={fill}
                stroke={stroke}
                strokeWidth={stroke ? 1 : undefined}
                strokeDasharray={strokeDasharray}
              />
            );
          })}
        </svg>
      </div>

      {/* Description */}
      <p className="text-xs text-neutral-500 dark:text-neutral-500 mt-3 text-center">
        {hasAnyData
          ? 'Last 7 days'
          : 'Your mood trend will appear here after a few recaps'}
      </p>
    </div>
  );
}
