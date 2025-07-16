import { signal } from "@preact/signals";
import { useEffect } from "preact/hooks";

interface CounterProps {
  start: number;
  step?: number;
  min?: number;
  max?: number;
}

export default function Counter(props: CounterProps) {
  const { start, step = 1, min = -Infinity, max = Infinity } = props;
  const count = signal(start);
  const isAtMin = signal(false);
  const isAtMax = signal(false);

  // Update boundary checks when count changes
  useEffect(() => {
    isAtMin.value = count.value <= min;
    isAtMax.value = count.value >= max;
  }, [count.value, min, max]);

  const increment = () => {
    if (count.value + step <= max) {
      count.value += step;
    }
  };

  const decrement = () => {
    if (count.value - step >= min) {
      count.value -= step;
    }
  };

  const reset = () => {
    count.value = start;
  };

  return (
    <div class="space-y-4">
      <div class="flex items-center justify-center space-x-4">
        <button
          class={`px-4 py-2 text-white rounded-lg font-medium transition-all duration-200 ${
            isAtMin.value 
              ? "bg-gray-300 cursor-not-allowed" 
              : "bg-red-500 hover:bg-red-600 hover:scale-105 active:scale-95"
          }`}
          onClick={decrement}
          disabled={isAtMin.value}
          title={`Decrease by ${step}`}
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
          </svg>
        </button>
        
        <div class="bg-gray-50 rounded-lg px-6 py-3 min-w-[120px] text-center">
          <div class="text-3xl font-mono font-bold text-gray-900">
            {count.value}
          </div>
          <div class="text-xs text-gray-500 mt-1">
            {min !== -Infinity && max !== Infinity && `${min} - ${max}`}
          </div>
        </div>
        
        <button
          class={`px-4 py-2 text-white rounded-lg font-medium transition-all duration-200 ${
            isAtMax.value 
              ? "bg-gray-300 cursor-not-allowed" 
              : "bg-green-500 hover:bg-green-600 hover:scale-105 active:scale-95"
          }`}
          onClick={increment}
          disabled={isAtMax.value}
          title={`Increase by ${step}`}
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>
      
      <div class="flex justify-center space-x-2">
        <button
          class="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
          onClick={reset}
          title="Reset to initial value"
        >
          Reset
        </button>
        
        {step !== 1 && (
          <span class="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded">
            Step: {step}
          </span>
        )}
      </div>
      
      <div class="text-center text-xs text-gray-500">
        Fresh 2.0 Island Component with Preact Signals
      </div>
    </div>
  );
}