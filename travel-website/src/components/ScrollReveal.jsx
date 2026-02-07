import { useEffect, useRef } from "react";

function ScrollReveal({ children }) {
  const ref = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("show");
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(ref.current);
  }, []);

  return <div ref={ref} className="reveal">{children}</div>;
}

export default ScrollReveal;
