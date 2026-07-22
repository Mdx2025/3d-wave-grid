const fs = require("fs");
const path = require("path");
const { chromium } = require("/home/clawd/.openclaw/skills/playwright-browser-automation/node_modules/playwright");

const baseUrl = process.argv[2] || process.env.PREVIEW_BASE_URL;
const outputDir = path.resolve(process.argv[3] || "./artifacts/horizonx");

if (!baseUrl) {
    console.error("Usage: node scripts/capture-horizonx.cjs <url> [output-dir]");
    process.exit(1);
}

const sleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

async function movePointer(page, points, durationMs) {
    const stepDuration = Math.max(16, Math.floor(durationMs / points.length));
    for (const point of points) {
        await page.mouse.move(point.x, point.y, { steps: 8 });
        await sleep(stepDuration);
    }
}

(async () => {
    fs.mkdirSync(outputDir, { recursive: true });
    const browser = await chromium.launch({ headless: true });

    const stillContext = await browser.newContext({
        viewport: { width: 1920, height: 1080 },
        deviceScaleFactor: 1,
    });
    const stillPage = await stillContext.newPage();
    await stillPage.goto(baseUrl, { waitUntil: "networkidle" });
    await stillPage.waitForTimeout(1200);
    await stillPage.screenshot({
        path: path.join(outputDir, "wave-field-calm.png"),
        fullPage: false,
    });

    await movePointer(stillPage, [
        { x: 460, y: 710 },
        { x: 720, y: 520 },
        { x: 1030, y: 660 },
        { x: 1320, y: 470 },
        { x: 1540, y: 690 },
    ], 1800);
    await stillPage.waitForTimeout(220);
    await stillPage.screenshot({
        path: path.join(outputDir, "wave-field-disturbed.png"),
        fullPage: false,
    });
    await stillContext.close();

    const videoDir = path.join(outputDir, "playwright-video");
    const videoContext = await browser.newContext({
        viewport: { width: 720, height: 1440 },
        recordVideo: {
            dir: videoDir,
            size: { width: 720, height: 1440 },
        },
    });
    const videoPage = await videoContext.newPage();
    await videoPage.addInitScript(() => {
        window.addEventListener("DOMContentLoaded", () => {
            const cursor = document.createElement("div");
            cursor.id = "capture-cursor";
            Object.assign(cursor.style, {
                position: "fixed",
                zIndex: "9999",
                width: "18px",
                height: "18px",
                border: "2px solid #baff69",
                borderRadius: "50%",
                pointerEvents: "none",
                transform: "translate(-50%, -50%)",
                boxShadow: "0 0 18px rgba(186, 255, 105, 0.7)",
                left: "360px",
                top: "720px",
            });
            document.body.appendChild(cursor);
            window.addEventListener("pointermove", (event) => {
                cursor.style.left = `${event.clientX}px`;
                cursor.style.top = `${event.clientY}px`;
            });
        }, { once: true });
    });
    await videoPage.goto(baseUrl, { waitUntil: "networkidle" });
    await videoPage.waitForTimeout(650);
    await movePointer(videoPage, [
        { x: 120, y: 1060 },
        { x: 250, y: 860 },
        { x: 390, y: 1040 },
        { x: 560, y: 780 },
        { x: 620, y: 1120 },
        { x: 430, y: 920 },
        { x: 180, y: 1160 },
        { x: 340, y: 800 },
    ], 5200);
    await videoPage.waitForTimeout(500);

    const recordedVideo = videoPage.video();
    await videoContext.close();
    const recordedPath = await recordedVideo.path();
    fs.copyFileSync(recordedPath, path.join(outputDir, "wave-field-playwright.webm"));

    await browser.close();
    console.log(JSON.stringify({
        baseUrl,
        outputDir,
        stills: [
            path.join(outputDir, "wave-field-calm.png"),
            path.join(outputDir, "wave-field-disturbed.png"),
        ],
        video: path.join(outputDir, "wave-field-playwright.webm"),
    }, null, 2));
})().catch((error) => {
    console.error(error);
    process.exit(1);
});
