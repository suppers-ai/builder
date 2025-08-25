import { useEffect, useRef } from "preact/hooks";

export default function ProfessorGopher() {
  const leftEyeRef = useRef<HTMLDivElement>(null);
  const rightEyeRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!leftEyeRef.current || !rightEyeRef.current || !containerRef.current) return;

      const container = containerRef.current.getBoundingClientRect();
      const leftSocket = leftEyeRef.current.parentElement!.getBoundingClientRect();
      const rightSocket = rightEyeRef.current.parentElement!.getBoundingClientRect();

      // Calculate angle for left eye
      const leftCenterX = leftSocket.left + leftSocket.width / 2;
      const leftCenterY = leftSocket.top + leftSocket.height / 2;
      const leftAngle = Math.atan2(e.clientY - leftCenterY, e.clientX - leftCenterX);
      const leftDegrees = leftAngle * (180 / Math.PI);

      // Calculate angle for right eye
      const rightCenterX = rightSocket.left + rightSocket.width / 2;
      const rightCenterY = rightSocket.top + rightSocket.height / 2;
      const rightAngle = Math.atan2(e.clientY - rightCenterY, e.clientX - rightCenterX);
      const rightDegrees = rightAngle * (180 / Math.PI);

      // Apply rotation to eyes
      leftEyeRef.current.style.transform = `rotate(${leftDegrees}deg)`;
      rightEyeRef.current.style.transform = `rotate(${rightDegrees}deg)`;
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <div ref={containerRef} class="gopher-container relative inline-block">
      <img 
        src="/professor-gopher.png" 
        alt="Professor Gopher" 
        class="w-64 h-64 object-contain"
      />
      
      {/* Left eye socket */}
      <div class="eye-socket absolute w-7 h-7 rounded-full flex items-center justify-center " 
           style="top: 34%; left: 24%; background: #ffeedf">
        <div ref={leftEyeRef} class="eye relative w-full h-full">
          <div class="pupil absolute bg-black rounded-full w-3 h-3" 
               style="top: 50%; left: 70%; transform: translate(-50%, -50%);">
          </div>
        </div>
      </div>
      
      {/* Right eye socket */}
      <div class="eye-socket absolute w-7 h-7 rounded-full flex items-center justify-center" 
           style="top: 33%; left: 44%; background: #ffeedf">
        <div ref={rightEyeRef} class="eye relative w-full h-full">
          <div class="pupil absolute bg-black rounded-full w-3 h-3" 
               style="top: 50%; left: 70%; transform: translate(-50%, -50%);">
          </div>
        </div>
      </div>
    </div>
  );
}