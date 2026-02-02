interface Window {
  windowControls: {
    minimize: () => void;
    maximize: () => void;
    close: () => void;
    isMaximized: () => Promise<boolean>;
    onMaximizeChange: (
      callback: (_: unknown, isMaximized: boolean) => void
    ) => void;
    onFullscreenChange: (
      callback: (_: unknown, isFullscreen: boolean) => void
    ) => void;
  };
}
