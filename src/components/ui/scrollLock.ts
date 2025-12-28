type ScrollLockSnapshot = {
  scrollY: number;
  htmlOverflow: string;
  htmlOverscrollBehavior: string;
  htmlScrollBehavior: string;
  bodyScrollBehavior: string;
  bodyPaddingRight: string;
  bodyModalScrollY: string;
  rootPosition: string;
  rootTop: string;
  rootLeft: string;
  rootRight: string;
  rootWidth: string;
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
  const root = document.getElementById('root') as HTMLElement | null;

  lockCount += 1;
  if (lockCount === 1) {
    const scrollY = window.scrollY || 0;

    const rootStyle = root?.style;

    snapshot = {
      scrollY,
      htmlOverflow: html.style.overflow,
      htmlOverscrollBehavior: (html.style as any).overscrollBehavior ?? "",
      htmlScrollBehavior: html.style.scrollBehavior,
      bodyScrollBehavior: body.style.scrollBehavior,
      bodyPaddingRight: body.style.paddingRight,
      bodyModalScrollY: body.style.getPropertyValue("--modal-scroll-y"),
      rootPosition: rootStyle?.position || "",
      rootTop: rootStyle?.top || "",
      rootLeft: rootStyle?.left || "",
      rootRight: rootStyle?.right || "",
      rootWidth: rootStyle?.width || "",
    };

    const scrollbarWidth = getScrollbarWidth();
    if (scrollbarWidth > 0) {
      body.style.paddingRight = `calc(${snapshot.bodyPaddingRight || "0px"} + ${scrollbarWidth}px)`;
    }

    // Lock the app container instead of <body> to avoid iOS Safari bugs
    // where fixed-position descendants become relative to the fixed body.
    if (root) {
      root.style.position = 'fixed';
      root.style.top = `-${scrollY}px`;
      root.style.left = '0';
      root.style.right = '0';
      root.style.width = '100%';
    } else {
      // Fallback to legacy strategy.
      body.style.setProperty("--modal-scroll-y", `-${scrollY}px`);
    }

    body.classList.add("modal-open");

    html.style.overflow = "hidden";
  }

  return () => {
    if (typeof window === "undefined") return;

    lockCount = Math.max(0, lockCount - 1);
    if (lockCount !== 0) return;

    const body = document.body;
    const html = document.documentElement;
    const root = document.getElementById('root') as HTMLElement | null;

    const restore = snapshot;
    snapshot = null;

    body.classList.remove("modal-open");

    if (restore) {
      body.style.paddingRight = restore.bodyPaddingRight;
      body.style.setProperty("--modal-scroll-y", restore.bodyModalScrollY);

      if (root) {
        root.style.position = restore.rootPosition;
        root.style.top = restore.rootTop;
        root.style.left = restore.rootLeft;
        root.style.right = restore.rootRight;
        root.style.width = restore.rootWidth;
      }

      html.style.overflow = restore.htmlOverflow;
      (html.style as any).overscrollBehavior = restore.htmlOverscrollBehavior;

      // Prevent global smooth scrolling from animating the restoration.
      html.style.scrollBehavior = "auto";
      body.style.scrollBehavior = "auto";
      window.scrollTo(0, restore.scrollY);
      html.style.scrollBehavior = restore.htmlScrollBehavior;
      body.style.scrollBehavior = restore.bodyScrollBehavior;
    } else {
      body.style.paddingRight = "";
      body.style.removeProperty("--modal-scroll-y");
      html.style.overflow = "";
      (html.style as any).overscrollBehavior = "";

      if (root) {
        root.style.position = '';
        root.style.top = '';
        root.style.left = '';
        root.style.right = '';
        root.style.width = '';
      }
    }
  };
}
