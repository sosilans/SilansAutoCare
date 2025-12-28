type ScrollLockSnapshot = {
  scrollY: number;
  htmlScrollBehavior: string;
  bodyScrollBehavior: string;
  bodyOverflow: string;
  bodyPaddingRight: string;
  bodyModalScrollY: string;
};

let lockCount = 0;
let snapshot: ScrollLockSnapshot | null = null;

function getScrollbarWidth(): number {
  return Math.max(0, window.innerWidth - document.documentElement.clientWidth);
}

export function lockScroll(): () => void {
  if (typeof window === "undefined") return () => {};

  const body = document.body;
  const html = document.documentElement;

  lockCount += 1;
  if (lockCount === 1) {
    const scrollY = window.scrollY || 0;

    snapshot = {
      scrollY,
      htmlScrollBehavior: html.style.scrollBehavior,
      bodyScrollBehavior: body.style.scrollBehavior,
      bodyOverflow: body.style.overflow,
      bodyPaddingRight: body.style.paddingRight,
      bodyModalScrollY: body.style.getPropertyValue("--modal-scroll-y"),
    };

    const scrollbarWidth = getScrollbarWidth();
    if (scrollbarWidth > 0) {
      body.style.paddingRight = `calc(${snapshot.bodyPaddingRight || "0px"} + ${scrollbarWidth}px)`;
    }

    body.classList.add("modal-open");

    // Keep background fixed by disabling body scroll only.
    // This is the most compatible approach with portaled modals.
    body.style.overflow = "hidden";
  }

  return () => {
    if (typeof window === "undefined") return;

    lockCount = Math.max(0, lockCount - 1);
    if (lockCount !== 0) return;

    const body = document.body;
    const html = document.documentElement;

    const restore = snapshot;
    snapshot = null;

    body.classList.remove("modal-open");

    if (restore) {
      body.style.overflow = restore.bodyOverflow;
      body.style.paddingRight = restore.bodyPaddingRight;
      body.style.setProperty("--modal-scroll-y", restore.bodyModalScrollY);

      // Prevent global smooth scrolling from animating the restoration.
      html.style.scrollBehavior = "auto";
      body.style.scrollBehavior = "auto";
      window.scrollTo(0, restore.scrollY);
      html.style.scrollBehavior = restore.htmlScrollBehavior;
      body.style.scrollBehavior = restore.bodyScrollBehavior;
    } else {
      body.style.overflow = "";
      body.style.paddingRight = "";
      body.style.removeProperty("--modal-scroll-y");
    }
  };
}
