"use client";

import type { RiveParameters } from "@rive-app/react-webgl2";
import type { FC, ReactNode } from "react";

import { cn } from "@/lib/utils";
import {
  useRive,
  useStateMachineInput,
  useViewModel,
  useViewModelInstance,
  useViewModelInstanceColor,
} from "@rive-app/react-webgl2";
import { memo, useEffect, useMemo, useRef, useState } from "react";

export type PersonaState =
  | "idle"
  | "listening"
  | "thinking"
  | "speaking"
  | "asleep";

interface PersonaProps {
  state: PersonaState;
  onLoad?: RiveParameters["onLoad"];
  onLoadError?: RiveParameters["onLoadError"];
  onReady?: () => void;
  onPause?: RiveParameters["onPause"];
  onPlay?: RiveParameters["onPlay"];
  onStop?: RiveParameters["onStop"];
  className?: string;
  variant?: keyof typeof sources;
}

// The state machine name is always 'default' for Elements AI visuals
const stateMachine = "default";

const sources = {
  command: {
    dynamicColor: true,
    hasModel: true,
    source:
      "https://ejiidnob33g9ap1r.public.blob.vercel-storage.com/command-2.0.riv",
  },
  glint: {
    dynamicColor: true,
    hasModel: true,
    source:
      "https://ejiidnob33g9ap1r.public.blob.vercel-storage.com/glint-2.0.riv",
  },
  halo: {
    dynamicColor: true,
    hasModel: true,
    source:
      "https://ejiidnob33g9ap1r.public.blob.vercel-storage.com/halo-2.0.riv",
  },
  mana: {
    dynamicColor: false,
    hasModel: true,
    source:
      "https://ejiidnob33g9ap1r.public.blob.vercel-storage.com/mana-2.0.riv",
  },
  obsidian: {
    dynamicColor: true,
    hasModel: true,
    source:
      "https://ejiidnob33g9ap1r.public.blob.vercel-storage.com/obsidian-2.0.riv",
  },
  opal: {
    dynamicColor: false,
    hasModel: false,
    source:
      "https://ejiidnob33g9ap1r.public.blob.vercel-storage.com/orb-1.2.riv",
  },
};

const getCurrentTheme = (): "light" | "dark" => {
  if (typeof window !== "undefined") {
    if (document.documentElement.classList.contains("dark")) {
      return "dark";
    }
    if (window.matchMedia?.("(prefers-color-scheme: dark)").matches) {
      return "dark";
    }
  }
  return "light";
};

const useTheme = (enabled: boolean) => {
  const [theme, setTheme] = useState<"light" | "dark">(getCurrentTheme);

  useEffect(() => {
    // Skip if not enabled (avoids unnecessary observers for non-dynamic-color variants)
    if (!enabled) {
      return;
    }

    // Watch for classList changes
    const observer = new MutationObserver(() => {
      setTheme(getCurrentTheme());
    });

    observer.observe(document.documentElement, {
      attributeFilter: ["class"],
      attributes: true,
    });

    // Watch for OS-level theme changes
    let mql: MediaQueryList | null = null;
    const handleMediaChange = () => {
      setTheme(getCurrentTheme());
    };

    if (window.matchMedia) {
      mql = window.matchMedia("(prefers-color-scheme: dark)");
      mql.addEventListener("change", handleMediaChange);
    }

    return () => {
      observer.disconnect();
      if (mql) {
        mql.removeEventListener("change", handleMediaChange);
      }
    };
  }, [enabled]);

  return theme;
};

interface PersonaWithModelProps {
  rive: ReturnType<typeof useRive>["rive"];
  source: (typeof sources)[keyof typeof sources];
  state: PersonaState;
  children: React.ReactNode;
}

const PersonaWithModel = memo(
  ({ rive, source, state, children }: PersonaWithModelProps) => {
    const theme = useTheme(source.dynamicColor);
    const viewModel = useViewModel(rive, { useDefault: true });
    const viewModelInstance = useViewModelInstance(viewModel, {
      rive,
      useDefault: true,
    });
    const viewModelInstanceColor = useViewModelInstanceColor(
      "color",
      viewModelInstance
    );

    useEffect(() => {
      if (!(viewModelInstanceColor && source.dynamicColor)) {
        return;
      }

      let [r, g, b] = theme === "dark" ? [255, 255, 255] : [0, 0, 0];

      // Dynamic color based on AI state
      if (state === "listening") {
        [r, g, b] = [239, 68, 68]; // Red-500
      } else if (state === "thinking") {
        [r, g, b] = [168, 85, 247]; // Purple-500
      } else if (state === "speaking") {
        [r, g, b] = [99, 102, 241]; // Indigo-500
      }

      viewModelInstanceColor.setRgb(r, g, b);
    }, [viewModelInstanceColor, theme, source.dynamicColor, state]);

    return children;
  }
);

PersonaWithModel.displayName = "PersonaWithModel";

interface PersonaWithoutModelProps {
  state: PersonaState;
  children: ReactNode;
}

const PersonaWithoutModel = memo(
  ({ children }: PersonaWithoutModelProps) => children
);

PersonaWithoutModel.displayName = "PersonaWithoutModel";

export const Persona: FC<PersonaProps> = memo(
  ({
    variant = "obsidian",
    state = "idle",
    onLoad,
    onLoadError,
    onReady,
    onPause,
    onPlay,
    onStop,
    className,
  }) => {
    const source = sources[variant];

    if (!source) {
      throw new Error(`Invalid variant: ${variant}`);
    }

    // Stabilize callbacks to prevent useRive from reinitializing
    const callbacksRef = useRef({
      onLoad,
      onLoadError,
      onPause,
      onPlay,
      onReady,
      onStop,
    });

    useEffect(() => {
      callbacksRef.current = {
        onLoad,
        onLoadError,
        onPause,
        onPlay,
        onReady,
        onStop,
      };
    }, [onLoad, onLoadError, onPause, onPlay, onReady, onStop]);

    const stableCallbacks = useMemo(
      () => ({
        onLoad: ((loadedRive) =>
          callbacksRef.current.onLoad?.(
            loadedRive
          )) as RiveParameters["onLoad"],
        onLoadError: ((err) =>
          callbacksRef.current.onLoadError?.(
            err
          )) as RiveParameters["onLoadError"],
        onPause: ((event) =>
          callbacksRef.current.onPause?.(event)) as RiveParameters["onPause"],
        onPlay: ((event) =>
          callbacksRef.current.onPlay?.(event)) as RiveParameters["onPlay"],
        onReady: () => callbacksRef.current.onReady?.(),
        onStop: ((event) =>
          callbacksRef.current.onStop?.(event)) as RiveParameters["onStop"],
      }),
      []
    );

    const { rive, RiveComponent } = useRive({
      autoplay: true,
      onLoad: stableCallbacks.onLoad,
      onLoadError: stableCallbacks.onLoadError,
      onPause: stableCallbacks.onPause,
      onPlay: stableCallbacks.onPlay,
      onRiveReady: stableCallbacks.onReady,
      onStop: stableCallbacks.onStop,
      src: source.source,
      stateMachines: stateMachine,
    });

    const listeningInput = useStateMachineInput(
      rive,
      stateMachine,
      "listening"
    );
    const thinkingInput = useStateMachineInput(rive, stateMachine, "thinking");
    const speakingInput = useStateMachineInput(rive, stateMachine, "speaking");
    const asleepInput = useStateMachineInput(rive, stateMachine, "asleep");

    // Use a ref to store inputs to avoid "mutating hook result" lint errors
    const inputsRef = useRef<Record<string, { value: number | boolean } | null | undefined>>({});


    useEffect(() => {
      inputsRef.current = {
        listening: listeningInput,
        thinking: thinkingInput,
        speaking: speakingInput,
        asleep: asleepInput,
      };
    }, [listeningInput, thinkingInput, speakingInput, asleepInput]);

    useEffect(() => {
      const { listening, thinking, speaking, asleep } = inputsRef.current;
      if (listening) listening.value = state === "listening";
      if (thinking) thinking.value = state === "thinking";
      if (speaking) speaking.value = state === "speaking";
      if (asleep) asleep.value = state === "asleep";
    }, [state]);

    const Component = source.hasModel ? PersonaWithModel : PersonaWithoutModel;

    return (
      <Component rive={rive} source={source} state={state}>
        <RiveComponent className={cn("size-16 shrink-0", className)} />
      </Component>
    );
  }
);

Persona.displayName = "Persona";
