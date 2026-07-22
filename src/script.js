import "./style.css";
import Orchestrator from "./ThreeJS/Orchestrator.js";
import gsap from "gsap";

const canvas = document.querySelector("canvas.webgl");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

try {
    if (canvas) new Orchestrator(canvas);
} catch (error) {
    document.documentElement.classList.add("webgl-unavailable");
    console.error("WebGL experience unavailable", error);
}
function updateTime() {
    const timeElement = document.getElementById("local-time");
    if (!timeElement) return;

    const now = new Date();
    const display = now.toLocaleTimeString("en-US", {
        timeZone: "Asia/Hong_Kong",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    });

    timeElement.textContent = `${display} HKT`;
    timeElement.dateTime = now.toISOString();
}

updateTime();
const timeInterval = window.setInterval(updateTime, 60000);
window.addEventListener("pagehide", () => window.clearInterval(timeInterval), { once: true });

if (!reducedMotion) {
    gsap.fromTo(
        "[data-reveal]",
        { opacity: 0, y: 14 },
        {
            opacity: 1,
            y: 0,
            duration: 0.9,
            stagger: 0.11,
            ease: "power3.out",
            delay: 0.16,
            clearProps: "transform",
        },
    );
}
