import { Laugh, Smile, Meh, Frown, Angry } from 'lucide-react';

const MOOD_ICONS = [
  { Icon: Laugh, color: 'text-emerald-500' },
  { Icon: Smile, color: 'text-green-500' },
  { Icon: Meh, color: 'text-amber-500' },
  { Icon: Frown, color: 'text-orange-500' },
  { Icon: Angry, color: 'text-red-500' },
];

export default function Loading() {
  return (
    <div className="min-h-[50vh] flex items-center justify-center bg-background">
      <div className="flex items-center gap-1">
        {MOOD_ICONS.map(({ Icon, color }, i) => (
          <Icon
            key={i}
            className={`w-6 h-6 animate-bounce ${color}`}
            style={{
              animationDelay: `${i * 80}ms`,
              animationDuration: '0.8s',
            }}
          />
        ))}
      </div>
    </div>
  );
}
