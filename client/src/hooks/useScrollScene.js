import { useEffect } from 'react';

const clamp = (v, min = 0, max = 1) => Math.min(max, Math.max(min, v));

/**
 * Lightweight scroll choreography for the landing page.
 *
 *   [data-scene]            → section tracked while near the viewport. Writes `--p` (0..1) on it.
 *       data-scene="pin"      p runs while a tall section is stuck (sticky storytelling)
 *       data-scene="range"    p runs while rect.top travels from data-start to data-end (fractions of viewport height)
 *       (default)             p runs from "enters at bottom" to "leaves at top"
 *   [data-speed]            → child parallax. translateY = distance-from-viewport-center × speed.
 *       data-speed-x          optional horizontal drift, same unit
 *
 * One passive scroll listener + one rAF per frame, only for scenes that are on screen.
 * Under prefers-reduced-motion nothing is attached and the page renders in its final state
 * (every scrubbed style is gated behind the `is-scrubbing` class this hook adds to the root).
 */
export default function useScrollScene(rootRef) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (reduced.matches) return undefined;

    const scenes = Array.from(root.querySelectorAll('[data-scene]')).map((el) => ({
      el,
      mode: el.dataset.scene || 'enter',
      start: parseFloat(el.dataset.start ?? '1'),
      end: parseFloat(el.dataset.end ?? '0'),
      layers: Array.from(el.querySelectorAll('[data-speed]')).map((layer) => ({
        el: layer,
        speed: parseFloat(layer.dataset.speed) || 0,
        speedX: parseFloat(layer.dataset.speedX) || 0,
      })),
      last: -1,
    }));

    const visible = new Set();
    let vh = window.innerHeight;
    let damp = window.innerWidth < 768 ? 0.45 : 1;
    let frame = 0;

    const progress = (scene, rect) => {
      switch (scene.mode) {
        case 'pin':
          return clamp(-rect.top / Math.max(1, rect.height - vh));
        case 'range': {
          const from = vh * scene.start;
          const to = vh * scene.end;
          return clamp((from - rect.top) / (from - to));
        }
        default:
          return clamp((vh - rect.top) / (vh + rect.height));
      }
    };

    const update = () => {
      frame = 0;
      const reads = [];
      visible.forEach((scene) => reads.push([scene, scene.el.getBoundingClientRect()]));

      reads.forEach(([scene, rect]) => {
        const p = progress(scene, rect);
        if (Math.abs(p - scene.last) > 0.0005) {
          scene.el.style.setProperty('--p', p.toFixed(4));
          scene.last = p;
        }
        if (scene.layers.length) {
          const offset = rect.top + rect.height / 2 - vh / 2;
          scene.layers.forEach((layer) => {
            const y = (offset * layer.speed * damp).toFixed(1);
            const x = (offset * layer.speedX * damp).toFixed(1);
            layer.el.style.setProperty('--py', `${y}px`);
            layer.el.style.setProperty('--px', `${x}px`);
          });
        }
      });
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const scene = scenes.find((s) => s.el === entry.target);
          if (!scene) return;
          if (entry.isIntersecting) visible.add(scene);
          else visible.delete(scene);
        });
        schedule();
      },
      { rootMargin: '15% 0px 15% 0px' }
    );

    const onResize = () => {
      vh = window.innerHeight;
      damp = window.innerWidth < 768 ? 0.45 : 1;
      schedule();
    };

    root.classList.add('is-scrubbing');
    scenes.forEach((scene) => io.observe(scene.el));
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', onResize);
    schedule();

    return () => {
      root.classList.remove('is-scrubbing');
      io.disconnect();
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', onResize);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [rootRef]);
}
