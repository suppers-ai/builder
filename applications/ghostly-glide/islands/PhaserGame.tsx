import { useEffect, useRef, useState } from "preact/hooks";

export default function PhaserGame() {
  const gameRef = useRef<HTMLDivElement>(null);
  const [showInstructions, setShowInstructions] = useState(true);
  const [gameInstance, setGameInstance] = useState<any>(null);

  useEffect(() => {
    if (!gameRef.current || !showInstructions) return;

    // Load Phaser dynamically
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/phaser@3.70.0/dist/phaser.min.js';
    script.async = true;
    script.onload = () => {
      // Import our game scenes dynamically
      import('../phaser/game-config.ts').then(({ default: createGame }) => {
        if (gameRef.current && window.Phaser) {
          const game = createGame(gameRef.current);
          setGameInstance(game);
        }
      });
    };
    document.head.appendChild(script);

    return () => {
      if (gameInstance) {
        gameInstance.destroy(true);
      }
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [showInstructions]);

  return (
    <div class="relative w-full h-screen flex items-center justify-center">
      <div class="relative">
        <div ref={gameRef} id="phaser-game" class="border-2 border-purple-600 rounded-lg shadow-2xl" />
        
        {showInstructions && (
          <div class="absolute inset-0 bg-black bg-opacity-80 flex items-center justify-center rounded-lg" style="width: 800px; height: 600px;">
            <div class="text-center text-white p-8">
              <h1 class="text-5xl font-bold mb-8 text-purple-400">Ghostly Parkour</h1>
              <div class="space-y-4 mb-8">
                <p class="text-xl">Master challenging parkour to reach the top!</p>
                <div class="text-left max-w-md mx-auto space-y-2">
                  <p>🎮 A/D or ← → : Move left/right</p>
                  <p>🦘 W/SPACE/↑ : Jump (double jump available!)</p>
                  <p>🧗 Wall Jump: Jump while sliding on walls</p>
                  <p>🚩 Reach checkpoints to save progress</p>
                  <p>⚠️ Avoid red spikes - they're deadly!</p>
                  <p>🟢 Green = Bouncy | 🔴 Red = Crumbling | 🟣 Purple = Moving</p>
                  <p>🔁 R: Restart from checkpoint | ⏸️ ESC/P: Pause</p>
                </div>
              </div>
              <button
                class="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-lg text-xl animate-pulse"
                onClick={() => setShowInstructions(false)}
              >
                Start Parkour Challenge
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}