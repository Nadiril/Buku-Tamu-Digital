"use client";

import { useState, useEffect, useRef, useCallback } from "react";

const THROTTLED_EVENTS = ["mousemove", "scroll"];
const ACTIVITY_EVENTS = [
  "mousedown",
  "keydown",
  "touchstart",
  "click",
];

const CHANNEL_NAME = "session-timeout";

function getChannelId(id) {
  return `${CHANNEL_NAME}-${id}`;
}

export function useIdleTimer({
  timeout = 30 * 60 * 1000,
  warningBefore = 60 * 1000,
  onTimeout,
  onForceTimeout,
  channelId = "default",
}) {
  const [showWarning, setShowWarning] = useState(false);
  const [remaining, setRemaining] = useState(warningBefore);

  const timeoutRef = useRef(timeout);
  const warningBeforeRef = useRef(warningBefore);
  const onTimeoutRef = useRef(onTimeout);
  const onForceTimeoutRef = useRef(onForceTimeout);

  const lastActivityRef = useRef(null);
  const warningTimerRef = useRef(null);
  const countdownRef = useRef(null);
  const timeoutTimerRef = useRef(null);
  const channelRef = useRef(null);

  useEffect(() => {
    timeoutRef.current = timeout;
  }, [timeout]);

  useEffect(() => {
    warningBeforeRef.current = warningBefore;
  }, [warningBefore]);

  useEffect(() => {
    onTimeoutRef.current = onTimeout;
  }, [onTimeout]);

  useEffect(() => {
    onForceTimeoutRef.current = onForceTimeout;
  }, [onForceTimeout]);

  const clearAllTimers = useCallback(() => {
    if (warningTimerRef.current) {
      clearTimeout(warningTimerRef.current);
      warningTimerRef.current = null;
    }
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
    if (timeoutTimerRef.current) {
      clearTimeout(timeoutTimerRef.current);
      timeoutTimerRef.current = null;
    }
  }, []);

  const scheduleTimers = useCallback(() => {
    warningTimerRef.current = setTimeout(() => {
      setShowWarning(true);
      setRemaining(warningBeforeRef.current);

      let count = warningBeforeRef.current;
      countdownRef.current = setInterval(() => {
        count -= 1000;
        if (count <= 0) {
          clearInterval(countdownRef.current);
          countdownRef.current = null;
          setRemaining(0);
        } else {
          setRemaining(count);
        }
      }, 1000);

      timeoutTimerRef.current = setTimeout(() => {
        timeoutTimerRef.current = null;
        onTimeoutRef.current?.();
      }, warningBeforeRef.current);
    }, timeoutRef.current - warningBeforeRef.current);
  }, []);

  const reset = useCallback(() => {
    clearAllTimers();
    lastActivityRef.current = Date.now();
    setShowWarning(false);
    setRemaining(warningBeforeRef.current);
    scheduleTimers();
  }, [clearAllTimers, scheduleTimers]);

  const extend = useCallback(() => {
    reset();
    channelRef.current?.postMessage({ type: "EXTEND" });
  }, [reset]);

  const forceTimeout = useCallback(() => {
    clearAllTimers();
    setShowWarning(false);
    (onForceTimeoutRef.current || onTimeoutRef.current)?.();
    channelRef.current?.postMessage({ type: "TIMEOUT" });
  }, [clearAllTimers]);

  useEffect(() => {
    lastActivityRef.current = Date.now();

    const handleActivity = () => {
      reset();
    };

    ACTIVITY_EVENTS.forEach((event) => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    let lastThrottled = 0;
    const handleThrottled = () => {
      const now = Date.now();
      if (now - lastThrottled < 1000) return;
      lastThrottled = now;
      reset();
    };
    THROTTLED_EVENTS.forEach((event) => {
      window.addEventListener(event, handleThrottled, { passive: true });
    });

    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        const elapsed = Date.now() - lastActivityRef.current;

        if (elapsed >= timeoutRef.current) {
          clearAllTimers();
          setShowWarning(false);
          onTimeoutRef.current?.();
          return;
        }

        if (elapsed >= timeoutRef.current - warningBeforeRef.current) {
          clearAllTimers();
          const remainingMs =
            timeoutRef.current - elapsed;
          setShowWarning(true);
          setRemaining(remainingMs);

          let count = remainingMs;
          countdownRef.current = setInterval(() => {
            count -= 1000;
            if (count <= 0) {
              clearInterval(countdownRef.current);
              countdownRef.current = null;
              setRemaining(0);
              onTimeoutRef.current?.();
            } else {
              setRemaining(count);
            }
          }, 1000);
          return;
        }
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    let storageFallback = null;
    try {
      channelRef.current = new BroadcastChannel(getChannelId(channelId));
      channelRef.current.onmessage = (event) => {
        if (event.data.type === "EXTEND") {
          reset();
        } else if (event.data.type === "TIMEOUT") {
          clearAllTimers();
          setShowWarning(false);
          onTimeoutRef.current?.();
        }
      };
    } catch {
      storageFallback = (e) => {
        if (e.key === getChannelId(channelId)) {
          try {
            const data = JSON.parse(e.newValue);
            if (data.type === "EXTEND") reset();
            else if (data.type === "TIMEOUT") {
              clearAllTimers();
              setShowWarning(false);
              onTimeoutRef.current?.();
            }
          } catch {}
        }
      };
      window.addEventListener("storage", storageFallback);
    }

    scheduleTimers();

    return () => {
      ACTIVITY_EVENTS.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
      THROTTLED_EVENTS.forEach((event) => {
        window.removeEventListener(event, handleThrottled);
      });
      document.removeEventListener("visibilitychange", onVisibility);
      channelRef.current?.close();
      if (storageFallback) {
        window.removeEventListener("storage", storageFallback);
      }
      clearAllTimers();
    };
  }, [channelId, reset, clearAllTimers, scheduleTimers]);

  return { showWarning, remaining, extend, forceTimeout, reset };
}
