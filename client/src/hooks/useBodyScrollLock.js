import { useEffect } from 'react';

/**
 * Custom hook to lock background scroll when a modal or sheet is open.
 * - Allows normal internal scrolling inside modal content.
 * - Prevents background menu / page scroll chaining when modal reaches boundaries.
 * - Prevents wheel / touch scrolling on the blurred backdrops.
 * - Restores normal page scrolling when closed.
 */
export const useBodyScrollLock = (isLocked) => {
  useEffect(() => {
    if (!isLocked || typeof window === 'undefined') return undefined;

    const originalHtmlOverflow = document.documentElement.style.overflow;
    const originalBodyOverflow = document.body.style.overflow;
    const originalHtmlOverscroll = document.documentElement.style.overscrollBehavior;
    const originalBodyOverscroll = document.body.style.overscrollBehavior;

    // Lock root scroll containers
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overscrollBehavior = 'none';
    document.body.style.overscrollBehavior = 'none';
    document.documentElement.classList.add('modal-scroll-locked');
    document.body.classList.add('modal-scroll-locked');

    // Intercept wheel events to stop scroll chaining to background
    const handleWheel = (e) => {
      let el = e.target;
      while (el && el !== document.body && el !== document.documentElement) {
        const style = window.getComputedStyle(el);
        const isScrollable =
          (style.overflowY === 'auto' || style.overflowY === 'scroll') &&
          el.scrollHeight > el.clientHeight;

        if (isScrollable) {
          const isAtTop = el.scrollTop <= 0 && e.deltaY < 0;
          const isAtBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 1 && e.deltaY > 0;
          if (isAtTop || isAtBottom) {
            e.preventDefault();
          }
          return;
        }
        el = el.parentElement;
      }
      // Over backdrop or non-scrollable modal areas, prevent background scrolling
      e.preventDefault();
    };

    // Intercept touchmove events on non-scrollable areas
    const handleTouchMove = (e) => {
      let el = e.target;
      while (el && el !== document.body && el !== document.documentElement) {
        const style = window.getComputedStyle(el);
        const isScrollable =
          (style.overflowY === 'auto' || style.overflowY === 'scroll') &&
          el.scrollHeight > el.clientHeight;

        if (isScrollable) {
          return;
        }
        el = el.parentElement;
      }
      if (e.cancelable) {
        e.preventDefault();
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });

    return () => {
      document.documentElement.style.overflow = originalHtmlOverflow;
      document.body.style.overflow = originalBodyOverflow;
      document.documentElement.style.overscrollBehavior = originalHtmlOverscroll;
      document.body.style.overscrollBehavior = originalBodyOverscroll;
      document.documentElement.classList.remove('modal-scroll-locked');
      document.body.classList.remove('modal-scroll-locked');
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, [isLocked]);
};

export default useBodyScrollLock;
