import Navbar from "./components/Navbar";
import React, { useEffect, useState } from "react";
import { fetchCartItemCount } from "./services/bffNavbarApi";

export default function Root() {
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    let mounted = true;

    const syncCartCount = async () => {
      const count = await fetchCartItemCount();
      if (mounted) {
        setCartCount(count);
      }
    };

    syncCartCount();

    const refresh = () => {
      syncCartCount();
    };

    window.addEventListener("storage", refresh);
    window.addEventListener("focus", refresh);
    window.addEventListener("nexagrid:cart-updated", refresh);

    return () => {
      mounted = false;
      window.removeEventListener("storage", refresh);
      window.removeEventListener("focus", refresh);
      window.removeEventListener("nexagrid:cart-updated", refresh);
    };
  }, []);

  const activePath =
    typeof window !== "undefined" ? window.location.pathname : "/";

  return <Navbar cartCount={cartCount} activePath={activePath} />;
}
