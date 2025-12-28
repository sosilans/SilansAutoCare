type ScrollLockSnapshot = {
  scrollY: number;
  htmlScrollBehavior: string;
  bodyScrollBehavior: string;
  bodyOverflow: string;
  bodyPosition: string;
  bodyTop: string;
  bodyLeft: string;
  bodyRight: string;
  bodyWidth: string;
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
      bodyPosition: body.style.position,
      bodyTop: body.style.top,
      bodyLeft: body.style.left,
      bodyRight: body.style.right,
      bodyWidth: body.style.width,
      bodyPaddingRight: body.style.paddingRight,
      bodyModalScrollY: body.style.getPropertyValue("--modal-scroll-y"),
    };

    const scrollbarWidth = getScrollbarWidth();
    if (scrollbarWidth > 0) {
      body.style.paddingRight = `calc(${snapshot.bodyPaddingRight || "0px"} + ${scrollbarWidth}px)`;
    }

    body.classList.add("modal-open");

    // iOS-friendly: freeze background by fixing body at the current scroll position.
    body.style.overflow = "hidden";
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";
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
      body.style.position = restore.bodyPosition;
      body.style.top = restore.bodyTop;
      body.style.left = restore.bodyLeft;
      body.style.right = restore.bodyRight;
      body.style.width = restore.bodyWidth;
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
      body.style.position = "";
      body.style.top = "";
      body.style.left = "";
      body.style.right = "";
      body.style.width = "";
      body.style.paddingRight = "";
      body.style.removeProperty("--modal-scroll-y");
    }
  };
}
