import React from "react";
import styles from "./Navbar.module.css";
import NavbarMain from "./NavbarMain";
// import NavbarLinks from "./NavbarLinks";

/**
 * NexaGrid Enterprise Navbar
 *
 * Props:
 *  - cartCount   {number}  Badge count on cart icon
 *  - activePath  {string}  Current route path for active link highlight
 */
export default function Navbar({ cartCount = 0, activePath = "/" }) {
  return (
    <header className={styles.navbar}>
      <NavbarMain cartCount={cartCount} />
      {/* <NavbarLinks activePath={activePath} /> */}
    </header>
  );
}
