/**
 * Example usage of the ReverseTool component
 * This demonstrates how to integrate the ReverseTool into your application
 */

import { useState } from 'react';
import { ReverseTool } from './ReverseTool';
import type { Frame } from '../../types';

export function ReverseToolExample() {
  const [frames, setFrames] = useState<Frame[]>([]);

  // Example: Load frames from a file or use existing frames
  // const loadedFrames = await decodeFile(file);
  // setFrames(loadedFrames.frames);

  const handleFramesChange = (newFrames: Frame[]) => {
    setFrames(newFrames);
    console.log(`Frames updated: ${newFrames.length} frames`);
    // You can now encode these frames to GIF or continue editing
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-white mb-6">
        Reverse Tool Demo
      </h1>

      {frames.length > 0 ? (
        <ReverseTool
          frames={frames}
          onFramesChange={handleFramesChange}
        />
      ) : (
        <div className="bg-gray-800 p-8 rounded-lg text-center text-gray-400">
          Load frames to use the Reverse Tool
        </div>
      )}
    </div>
  );
}

/**
 * Integration Example with Full App
 *
 * import { ReverseTool } from './components/tools/ReverseTool';
 *
 * function App() {
 *   const [frames, setFrames] = useState<Frame[]>([]);
 *   const [selectedTool, setSelectedTool] = useState<string>('none');
 *
 *   return (
 *     <div>
 *       {selectedTool === 'reverse' && (
 *         <ReverseTool
 *           frames={frames}
 *           onFramesChange={setFrames}
 *         />
 *       )}
 *     </div>
 *   );
 * }
 */
