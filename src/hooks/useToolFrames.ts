import { useState, useCallback } from 'react';
import { decodeFile } from '../lib/decoder';
import type { Frame } from '../types';

interface ToolFramesState {
  file: File | null;
  frames: Frame[];
  originalWidth: number;
  originalHeight: number;
  originalFps: number;
  isLoading: boolean;
  error: string | null;
}

interface UseToolFramesReturn extends ToolFramesState {
  handleFileSelect: (file: File) => Promise<void>;
  handleFramesChange: (frames: Frame[], width?: number, height?: number) => void;
  handleReset: () => void;
  createDownload: () => Promise<Blob | null>;
}

export function useToolFrames(): UseToolFramesReturn {
  const [state, setState] = useState<ToolFramesState>({
    file: null,
    frames: [],
    originalWidth: 0,
    originalHeight: 0,
    originalFps: 10,
    isLoading: false,
    error: null,
  });

  const handleFileSelect = useCallback(async (file: File) => {
    setState((prev) => ({
      ...prev,
      file,
      isLoading: true,
      error: null,
    }));

    try {
      const result = await decodeFile(file, () => {});
      setState((prev) => ({
        ...prev,
        frames: result.frames,
        originalWidth: result.width,
        originalHeight: result.height,
        originalFps: result.fps,
        isLoading: false,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to decode file',
      }));
    }
  }, []);

  const handleFramesChange = useCallback((frames: Frame[], width?: number, height?: number) => {
    setState((prev) => ({
      ...prev,
      frames,
      originalWidth: width ?? prev.originalWidth,
      originalHeight: height ?? prev.originalHeight,
    }));
  }, []);

  const handleReset = useCallback(() => {
    setState({
      file: null,
      frames: [],
      originalWidth: 0,
      originalHeight: 0,
      originalFps: 10,
      isLoading: false,
      error: null,
    });
  }, []);

  const createDownload = useCallback(async (): Promise<Blob | null> => {
    if (state.frames.length === 0) return null;

    const { encodeGifFast } = await import('../lib/gifEncoderFast');
    const data = await encodeGifFast(state.frames, {
      width: state.frames[0].imageData.width,
      height: state.frames[0].imageData.height,
      colors: 256,
    });

    const arrayBuffer = new ArrayBuffer(data.length);
    new Uint8Array(arrayBuffer).set(data);
    return new Blob([arrayBuffer], { type: 'image/gif' });
  }, [state.frames]);

  return {
    ...state,
    handleFileSelect,
    handleFramesChange,
    handleReset,
    createDownload,
  };
}
