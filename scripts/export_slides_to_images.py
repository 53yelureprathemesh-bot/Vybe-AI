import os
import asyncio
from playwright.async_api import async_playwright

async def export_slides():
    dist_slides = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend", "dist", "slides"))
    artifact_slides = os.path.abspath(r"C:\Users\PRAJKTA\.gemini\antigravity\brain\0d03fad5-79d2-4e8a-ba91-c855460419b9\slides")
    
    os.makedirs(dist_slides, exist_ok=True)
    os.makedirs(artifact_slides, exist_ok=True)

    print("Launching Playwright to capture presentation slides...")
    async with async_playwright() as p:
        browser = await p.chromium.launch(
            executable_path=r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
            headless=True
        )
        context = await browser.new_context(viewport={"width": 1920, "height": 1080})
        page = await context.new_page()

        await page.goto("http://127.0.0.1:8000/presentation", wait_until="networkidle")
        await page.wait_for_timeout(1000)

        total_slides = 16
        for i in range(1, total_slides + 1):
            # Navigate to slide i
            await page.evaluate(f"goToSlide({i})")
            await page.wait_for_timeout(500)

            # Locate stage or screenshot full viewport
            stage_element = await page.query_selector(".slide-stage")
            filename = f"slide_{i:02d}.png"
            dist_file = os.path.join(dist_slides, filename)
            art_file = os.path.join(artifact_slides, filename)

            if stage_element:
                await stage_element.screenshot(path=dist_file)
                await stage_element.screenshot(path=art_file)
            else:
                await page.screenshot(path=dist_file)
                await page.screenshot(path=art_file)

            print(f"Captured Slide {i:02d}/{total_slides} -> {dist_file}")

        await browser.close()
    print("All slides captured successfully!")

if __name__ == "__main__":
    asyncio.run(export_slides())
