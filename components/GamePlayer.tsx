"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Game } from "@/lib/games";

type GamePlayerProps = {
  game: Game;
};

export function GamePlayer({ game }: GamePlayerProps) {
  const [isDesktop, setIsDesktop] = useState(true);
  const [mobileFullscreen, setMobileFullscreen] = useState(false);
  /** 移动端是否已首次点击过 Play Now（用于保留 iframe 不卸载） */
  const [hasOpenedOnce, setHasOpenedOnce] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [loadState, setLoadState] = useState<"idle" | "loading" | "success" | "error">(
    "loading",
  );
  const timeoutRef = useRef<number | null>(null);
  const [reloadCount, setReloadCount] = useState(0);

  const numericWidth = Number(game.width) || 16;
  const numericHeight = Number(game.height) || 9;
  const aspectRatio = `${numericWidth} / ${numericHeight}`;

  useEffect(() => {
    const mql = window.matchMedia("(min-width: 768px)");
    const handler = () => setIsDesktop(mql.matches);
    handler();
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  const enterFullscreen = useCallback(() => {
    setHasOpenedOnce(true);
    setMobileFullscreen(true);
  }, []);

  const exitFullscreen = useCallback(() => {
    setMobileFullscreen(false);
  }, []);

  useEffect(() => {
    if (!mobileFullscreen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") exitFullscreen();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [mobileFullscreen, exitFullscreen]);

  const clearTimeoutIfNeeded = () => {
    if (timeoutRef.current != null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const beginLoading = useCallback(() => {
    clearTimeoutIfNeeded();
    setLoadState("loading");
    timeoutRef.current = window.setTimeout(() => {
      setLoadState((prev) => (prev === "loading" ? "error" : prev));
    }, 20000);
  }, []);

  useEffect(() => {
    beginLoading();
    return () => {
      clearTimeoutIfNeeded();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game.url, reloadCount]);

  const handleIframeLoad = () => {
    clearTimeoutIfNeeded();
    setLoadState("success");
  };

  const handleIframeError = () => {
    clearTimeoutIfNeeded();
    setLoadState("error");
  };

  const handleRetry = () => {
    setReloadCount((c) => c + 1);
    setLoadState("loading");
    if (!mobileFullscreen) {
      setHasOpenedOnce(true);
      setMobileFullscreen(true);
    }
  };

  if (isDesktop) {
    return (
      <div className="relative max-h-[80vh] w-full overflow-hidden rounded-2xl bg-slate-800 shadow-lg md:rounded-xl">
        <div
          className="relative h-full w-full"
          style={{
            aspectRatio,
          }}
        >
          <iframe
            key={`${game.id}-${reloadCount}`}
            src={game.url}
            title={game.title}
            className="absolute inset-0 h-full w-full border-0"
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            onLoad={handleIframeLoad}
            onError={handleIframeError}
          />
        </div>

        {loadState === "loading" && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-slate-900/40">
            <div className="flex flex-col items-center gap-3 rounded-xl bg-slate-900/80 px-5 py-3 text-sm text-slate-100">
              <span className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-amber-400 border-t-transparent" />
              <span>Loading, please wait…</span>
            </div>
          </div>
        )}

        {loadState === "error" && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900/70">
            <div className="flex flex-col items-center gap-3 rounded-xl bg-slate-900 px-5 py-4 text-sm text-slate-100">
              <p className="text-center">
                Game loading failed, maybe network problem or game link exception.
              </p>
              <button
                type="button"
                onClick={handleRetry}
                className="rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white shadow hover:bg-[var(--color-primary)]/90"
              >
                Reload
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      <div ref={containerRef} className="space-y-3 md:hidden">
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-slate-200 shadow-md">
          <Image
            src={game.thumb}
            alt={game.title}
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
        </div>
        <button
          type="button"
          onClick={enterFullscreen}
          className="w-full rounded-xl bg-[var(--color-primary)] py-3.5 text-base font-semibold text-white shadow-md transition hover:bg-[var(--color-primary)]/90 active:scale-[0.98]"
        >
          Play Now
        </button>
      </div>

      {/* 移动端全屏层：首次点击后挂载，退出全屏时仅隐藏不卸载，再次点击直接显示以保留游戏内容 */}
      {hasOpenedOnce && (
        <div
          className="fixed inset-0 z-[100] flex h-[100dvh] max-h-[100dvh] flex-col overflow-hidden bg-slate-900 md:hidden"
          aria-modal
          role="dialog"
          aria-hidden={!mobileFullscreen}
          style={{
            visibility: mobileFullscreen ? "visible" : "hidden",
            pointerEvents: mobileFullscreen ? "auto" : "none",
          }}
        >
          <div className="flex shrink-0 items-center justify-between border-b border-slate-700 px-4 py-3">
            <span className="truncate text-sm font-medium text-white">
              {game.title}
            </span>
            <button
              type="button"
              onClick={exitFullscreen}
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-300 hover:bg-slate-700 hover:text-white"
              aria-label="Exit fullscreen"
            >
              Exit
            </button>
          </div>
          <div className="relative min-h-0 flex-1 overflow-hidden bg-black">
            <div className="absolute inset-0 flex items-center justify-center overflow-hidden p-0">
              <div
                className="relative h-full max-h-full w-full max-w-full"
                style={{
                  aspectRatio,
                }}
              >
                <iframe
                  key={`${game.id}-${reloadCount}`}
                  src={game.url}
                  title={game.title}
                  className="absolute inset-0 h-full w-full border-0"
                  allowFullScreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  onLoad={handleIframeLoad}
                  onError={handleIframeError}
                />
              </div>
            </div>

            {loadState === "loading" && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-slate-900/40">
                <div className="flex flex-col items-center gap-3 rounded-xl bg-slate-900/80 px-5 py-3 text-sm text-slate-100">
                  <span className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-amber-400 border-t-transparent" />
                  <span>Loading, please wait…</span>
                </div>
              </div>
            )}

            {loadState === "error" && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-900/70">
                <div className="flex flex-col items-center gap-3 rounded-xl bg-slate-900 px-5 py-4 text-sm text-slate-100">
                  <p className="text-center">
                    Game loading failed, maybe network problem or game link exception.
                  </p>
                  <button
                    type="button"
                    onClick={handleRetry}
                    className="rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white shadow hover:bg-[var(--color-primary)]/90"
                  >
                    Reload
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
