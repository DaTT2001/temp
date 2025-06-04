import { useContext, useEffect } from "react";
import { UNSAFE_NavigationContext as NavigationContext } from "react-router-dom";

export function useBlocker(blocker, when = true) {
  const navigator = useContext(NavigationContext).navigator;

  useEffect(() => {
    if (!when) return;

    const unblock = navigator.block((tx) => {
      const autoUnblock = () => unblock();
      blocker({
        ...tx,
        retry() {
          autoUnblock();
          tx.retry();
        },
      });
    });

    return unblock;
  }, [navigator, blocker, when]);
}
