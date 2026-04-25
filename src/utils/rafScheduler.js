/**
 * High-Performance rAF-Based Batch Update Scheduler
 * Prevents layout thrashing by batching CSS custom property updates
 * Guarantees all writes occur in a single paint cycle
 */

class RAFScheduler {
  constructor() {
    this.queue = [];
    this.isScheduled = false;
    this.rafId = null;
  }

  /**
   * Schedule a callback to execute in the next animation frame
   * Multiple callbacks are batched into a single rAF call
   */
  schedule(callback) {
    this.queue.push(callback);

    if (!this.isScheduled) {
      this.isScheduled = true;
      this.rafId = requestAnimationFrame(() => {
        this.flush();
      });
    }
  }

  /**
   * Execute all queued callbacks synchronously
   * This happens in a single rAF frame, preventing thrashing
   */
  flush() {
    const callbacks = this.queue;
    this.queue = [];
    this.isScheduled = false;

    // Execute all callbacks in sequence within the same frame
    callbacks.forEach((callback) => {
      callback();
    });
  }

  /**
   * Cancel any pending scheduled work
   */
  cancel() {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.queue = [];
    this.isScheduled = false;
  }

  /**
   * Immediately apply CSS custom properties to an element
   * Bypasses queue for immediate effects (only use when necessary)
   */
  setCSSVars(element, properties) {
    Object.entries(properties).forEach(([key, value]) => {
      element.style.setProperty(`--${key}`, value);
    });
  }

  /**
   * Batch-apply CSS custom properties with rAF scheduling
   * This is the primary method for slider-driven updates
   */
  scheduleVarUpdate(element, properties) {
    this.schedule(() => {
      this.setCSSVars(element, properties);
    });
  }
}
let ticking = false;

export const updateTypographicVar = (variableName, value) => {
  if (!ticking) {
    window.requestAnimationFrame(() => {
      document.documentElement.style.setProperty(variableName, value);
      ticking = false;
    });
    ticking = true;
  }
};

// Export singleton instance
export const rafScheduler = new RAFScheduler();
