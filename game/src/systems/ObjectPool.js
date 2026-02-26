/**
 * Generic object pool for reusing game objects
 * Reduces garbage collection and improves performance
 */
export default class ObjectPool {
  constructor(scene, createFn, initialSize = 20) {
    this.scene = scene;
    this.createFn = createFn;
    this.pool = [];
    this.active = new Set();

    // Pre-create initial objects
    for (let i = 0; i < initialSize; i++) {
      const obj = this.createFn();
      obj.setVisible(false).setActive(false);
      this.pool.push(obj);
    }
  }

  /**
   * Get an object from the pool or create a new one if needed
   */
  get() {
    let obj = this.pool.pop();
    if (!obj) {
      obj = this.createFn();
    }
    obj.setActive(true).setVisible(true);
    this.active.add(obj);
    return obj;
  }

  /**
   * Return an object to the pool for reuse
   */
  release(obj) {
    if (!this.active.has(obj)) return;
    this.active.delete(obj);
    obj.setActive(false).setVisible(false);
    this.pool.push(obj);
  }

  /**
   * Release all active objects
   */
  releaseAll() {
    this.active.forEach(obj => {
      obj.setActive(false).setVisible(false);
      this.pool.push(obj);
    });
    this.active.clear();
  }

  /**
   * Get count of active objects
   */
  getActiveCount() {
    return this.active.size;
  }

  /**
   * Clean up - destroy all pooled objects
   */
  destroy() {
    this.active.forEach(obj => obj.destroy());
    this.pool.forEach(obj => obj.destroy());
    this.active.clear();
    this.pool = [];
  }
}
