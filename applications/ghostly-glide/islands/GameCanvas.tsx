import { useEffect, useRef, useState } from "preact/hooks";
import { ParkourGameEngine } from "../game/parkour-engine.ts";
import { ValidatedLevelGenerator } from "../game/validated-levels.ts";

export default function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<ParkourGameEngine | null>(null);
  const levelGeneratorRef = useRef<ValidatedLevelGenerator | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Initialize game
    const engine = new ParkourGameEngine(canvasRef.current);
    engineRef.current = engine;

    // Initialize level generator
    const levelGenerator = new ValidatedLevelGenerator();
    levelGeneratorRef.current = levelGenerator;

    // Load first level
    const firstLevel = levelGenerator.getLevel(1);
    if (firstLevel) {
      engine.loadLevel(firstLevel);
    }

    // Handle window resize
    const handleResize = () => {
      if (canvasRef.current) {
        if (isFullscreen) {
          canvasRef.current.width = window.innerWidth;
          canvasRef.current.height = window.innerHeight;
        } else {
          canvasRef.current.width = 800;
          canvasRef.current.height = 600;
        }
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    // Start game when space is pressed
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space' && showInstructions) {
        setShowInstructions(false);
        engine.start();
      }
    };

    window.addEventListener('keypress', handleKeyPress);

    return () => {
      engine.stop();
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keypress', handleKeyPress);
    };
  }, [isFullscreen]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      canvasRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const restartGame = () => {
    if (engineRef.current && levelGeneratorRef.current) {
      engineRef.current.restart();
    }
  };

  return (
    <div class="relative w-full h-screen bg-gray-900 flex items-center justify-center">
      <div class="relative">
        <canvas
          ref={canvasRef}
          class="border-2 border-purple-600 rounded-lg shadow-2xl"
          width={800}
          height={600}
        />
        
        {showInstructions && (
          <div class="absolute inset-0 bg-black bg-opacity-80 flex items-center justify-center rounded-lg">
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
                onClick={() => {
                  setShowInstructions(false);
                  engineRef.current?.start();
                }}
              >
                Start Parkour Challenge
              </button>
            </div>
          </div>
        )}
        
        <div class="absolute top-4 right-4 space-x-2">
          <button
            onClick={toggleFullscreen}
            class="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded"
          >
            {isFullscreen ? '🗗' : '⛶'} Fullscreen
          </button>
          <button
            onClick={restartGame}
            class="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded"
          >
            🔄 Restart
          </button>
        </div>
      </div>
    </div>
  );
}