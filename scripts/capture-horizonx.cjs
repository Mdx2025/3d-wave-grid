const fs = require("fs");
const path = require("path");
const { chromium } = require("/home/clawd/.openclaw/skills/playwright-browser-automation/node_modules/playwright");

const baseUrl = process.argv[2] || process.env.PREVIEW_BASE_URL;
const outputDir = path.resolve(
    process.argv[3] || process.env.HORIZONX_OUTPUT_DIR || "./artifacts/horizonx",
);
const stillsOnly = process.env.HORIZONX_STILLS_ONLY === "1";
const coverOnly = process.env.HORIZONX_COVER_ONLY === "1";

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

    const coverContext = await browser.newContext({
        viewport: { width: 1440, height: 1080 },
        deviceScaleFactor: 1,
    });
    const coverPage = await coverContext.newPage();
    await coverPage.goto(baseUrl, { waitUntil: "networkidle" });
    await coverPage.waitForTimeout(1200);
    await movePointer(coverPage, [
        { x: 160, y: 780 },
        { x: 360, y: 610 },
        { x: 580, y: 820 },
        { x: 820, y: 570 },
        { x: 1060, y: 780 },
        { x: 1260, y: 610 },
        { x: 980, y: 860 },
        { x: 700, y: 650 },
    ], 2200);
    await coverPage.waitForTimeout(30);
    await coverPage.screenshot({
        path: path.join(outputDir, "wave-field-cover-4x3-v2.png"),
        fullPage: false,
    });
    await coverContext.close();

    if (coverOnly) {
        await browser.close();
        console.log(JSON.stringify({
            baseUrl,
            outputDir,
            cover: path.join(outputDir, "wave-field-cover-4x3-v2.png"),
        }, null, 2));
        return;
    }

    const galleryContext = await browser.newContext({
        viewport: { width: 2400, height: 1350 },
        deviceScaleFactor: 1,
    });
    const galleryPage = await galleryContext.newPage();
    await galleryPage.goto(baseUrl, { waitUntil: "networkidle" });
    await galleryPage.waitForTimeout(2800);
    await galleryPage.screenshot({
        path: path.join(outputDir, "wave-field-calm-master-v2.png"),
        fullPage: false,
    });
    await galleryPage.screenshot({
        path: path.join(outputDir, "wave-field-calm-16x3-v2.png"),
        clip: { x: 0, y: 600, width: 2400, height: 450 },
    });

    await movePointer(galleryPage, [
        { x: 520, y: 860 },
        { x: 880, y: 650 },
        { x: 1260, y: 870 },
        { x: 1640, y: 620 },
        { x: 2040, y: 850 },
    ], 1800);
    await galleryPage.waitForTimeout(220);
    await galleryPage.screenshot({
        path: path.join(outputDir, "wave-field-disturbed-master-v2.png"),
        fullPage: false,
    });
    await galleryPage.screenshot({
        path: path.join(outputDir, "wave-field-disturbed-16x3-v2.png"),
        clip: { x: 0, y: 600, width: 2400, height: 450 },
    });
    await galleryContext.close();

    if (stillsOnly) {
        await browser.close();
        console.log(JSON.stringify({
            baseUrl,
            outputDir,
            cover: path.join(outputDir, "wave-field-cover-4x3-v2.png"),
            stills: [
                path.join(outputDir, "wave-field-calm-16x3-v2.png"),
                path.join(outputDir, "wave-field-disturbed-16x3-v2.png"),
            ],
        }, null, 2));
        return;
    }

    const videoDir = path.join(outputDir, "playwright-video");
    const videoContext = await browser.newContext({
        viewport: { width: 1080, height: 2160 },
        recordVideo: {
            dir: videoDir,
            size: { width: 1080, height: 2160 },
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
                left: "540px",
                top: "1080px",
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
        { x: 180, y: 1590 },
        { x: 370, y: 1290 },
        { x: 590, y: 1560 },
        { x: 840, y: 1170 },
        { x: 930, y: 1680 },
        { x: 650, y: 1380 },
        { x: 270, y: 1740 },
        { x: 510, y: 1200 },
    ], 6200);
    await videoPage.waitForTimeout(600);

    const recordedVideo = videoPage.video();
    await videoContext.close();
    const recordedPath = await recordedVideo.path();
    fs.copyFileSync(recordedPath, path.join(outputDir, "wave-field-playwright-4x8-v2.webm"));

    await browser.close();
    console.log(JSON.stringify({
        baseUrl,
        outputDir,
        cover: path.join(outputDir, "wave-field-cover-4x3-v2.png"),
        stills: [
            path.join(outputDir, "wave-field-calm-16x3-v2.png"),
            path.join(outputDir, "wave-field-disturbed-16x3-v2.png"),
        ],
        video: path.join(outputDir, "wave-field-playwright-4x8-v2.webm"),
    }, null, 2));
})().catch((error) => {
    console.error(error);
    process.exit(1);
});
