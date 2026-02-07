import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import styles from "../styles/Navbar.module.css";

export default function Navbar() {
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    setTheme(savedTheme);
    document.documentElement.setAttribute("data-theme", savedTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.navContainer}>
        <Link href="/" className={styles.navLogo}>
          <Image
            src="/images/traceroots-logo.svg"
            alt="TraceRoots"
            width={40}
            height={40}
            className={styles.logoImg}
          />
          <span className={styles.logoText}>TraceRoots</span>
        </Link>
        <div className={styles.navLinks}>
          <Link href="/farmer" className={styles.navLink}>
            Farmer
          </Link>
          <Link href="/processor" className={styles.navLink}>
            Processor
          </Link>
          <Link href="/consumer" className={styles.navLink}>
            Consumer
          </Link>
          <Link href="/ngo" className={styles.navLink}>
            NGO
          </Link>
          <Link href="/admin" className={styles.navLink}>
            Admin
          </Link>
          <Link href="/impact" className={styles.navLink}>
            Impact
          </Link>
          <Link href="/join" className={styles.navLink}>
            Join
          </Link>
          <button
            className={styles.themeToggle}
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            <i className={`fas fa-${theme === "dark" ? "sun" : "moon"}`}></i>
          </button>
        </div>
      </div>
    </nav>
  );
}
