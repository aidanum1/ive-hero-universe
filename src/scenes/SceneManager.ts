import { motion, range, type SceneId, type VisualState } from "@/motion/config";

export interface SceneModule {
  enter(): void;
  update(progress: number, frame: VisualState): void;
  exit(): void;
  dispose(): void;
}

export class SceneManager {
  private active = new Set<SceneId>();
  private disposed = false;
  constructor(private modules: Record<SceneId, SceneModule>) {}

  update(frame: VisualState) {
    if (this.disposed) return;
    const wanted: Record<SceneId, boolean> = {
      signal:
        frame.prologueOpacity > 0 ||
        (frame.pageOpacity > 0 && frame.progress < motion.beats.purple),
      purple: frame.purpleOpacity > 0,
      released: frame.finish > 0,
    };
    const progress: Record<SceneId, number> = {
      signal: range(frame.progress, 0, motion.beats.purple),
      purple: range(frame.progress, motion.beats.purple, 1),
      released: frame.finish,
    };
    for (const id of Object.keys(this.modules) as SceneId[]) {
      const adapter = this.modules[id];
      if (wanted[id]) {
        if (!this.active.has(id)) {
          adapter.enter();
          this.active.add(id);
        }
        adapter.update(progress[id], frame);
      } else if (this.active.delete(id)) adapter.exit();
    }
  }

  dispose() {
    if (this.disposed) return;
    this.active.forEach((id) => this.modules[id].exit());
    Object.values(this.modules).forEach((adapter) => adapter.dispose());
    this.active.clear();
    this.disposed = true;
  }
}

export function domScene(
  element: HTMLElement,
  opacity: "prologueOpacity" | "purpleOpacity" | "finish",
): SceneModule {
  element.style.visibility = "hidden";
  return {
    enter() {
      element.style.visibility = "visible";
      element.dataset.active = "true";
    },
    update(progress, frame) {
      element.style.opacity = String(frame[opacity]);
      element.dataset.sceneProgress = progress.toFixed(4);
    },
    exit() {
      element.style.visibility = "hidden";
      delete element.dataset.active;
    },
    dispose() {
      element.style.removeProperty("visibility");
      element.style.removeProperty("opacity");
      delete element.dataset.sceneProgress;
    },
  };
}
