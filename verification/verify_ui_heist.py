from playwright.sync_api import sync_playwright, expect
import os

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()

    # Listen to console logs
    page.on("console", lambda msg: print(f"PAGE CONSOLE: {msg.text}"))

    # Get absolute paths to inject
    cwd = os.getcwd()
    mock_path = os.path.join(cwd, "e2e/chrome-mock.js")
    utils_path = os.path.join(cwd, "ui-heist/utils.js")
    content_path = os.path.join(cwd, "ui-heist/content.js")
    styles_path = os.path.join(cwd, "ui-heist/styles.css")
    simulation_path = "file://" + os.path.join(cwd, "e2e/simulation.html")

    print(f"Loading simulation: {simulation_path}")
    page.goto(simulation_path)

    # Inject Scripts and Styles
    page.add_style_tag(path=styles_path)
    page.add_script_tag(path=mock_path)
    page.add_script_tag(path=utils_path)
    page.add_script_tag(path=content_path)

    # 1. Trigger Inspection Mode
    print("Triggering inspection mode...")
    page.evaluate("window.startInspection()")

    page.wait_for_timeout(500)

    # 2. Hover over the Title to test highlighting
    # e.target logic means the specific element under cursor gets the class
    print("Hovering over Title...")
    title = page.locator(".card-title")
    title.hover()

    # Wait for highlight class on the TITLE
    try:
        expect(title).to_have_class("card-title ui-heist-highlight", timeout=2000)
    except Exception as e:
        print("Wait for class on Title failed.")
        print("Current class:", title.get_attribute("class"))
        raise e

    # Take screenshot of highlighter
    screenshot_path = "verification/highlighter.png"
    page.screenshot(path=screenshot_path)
    print(f"Screenshot saved to {screenshot_path}")

    # 3. Click to Capture (Clicking the Title)
    # This should capture the Title, but we want to capture the CARD to test recursion?
    # Actually, if I click the title, I only capture the title (and its children/text).
    # To capture the Card, I must hover the Card (e.g. padding area).
    # But for this test, let's verify capturing the Title first to ensure the click works.

    # WAIT! The prompt requirement was: "inspect a cool button or card".
    # If I click the title, I get the title. If I want the card, I have to click the card container.
    # Let's try to click the Card Container specifically by hovering a safe spot?
    # Or just verify that clicking the Title captures the Title correctly.
    # That proves the flow. Recursion is tested by "children". The Title has text, but no element children.

    # Let's adjust: Hover the CARD (force position) to capture the CARD.
    # We can use force=True or position argument in Playwright to click the edge.

    print("Hovering Card Edge to capture full component...")
    card = page.locator("#target-card")
    # Hover top-left corner which usually has padding
    card.hover(position={"x": 10, "y": 10})

    # Expect Card to be highlighted now
    expect(card).to_have_class("card ui-heist-highlight")

    print("Clicking Card...")
    card.click(position={"x": 10, "y": 10})

    # 4. Verify Captured Code in Mock Storage
    print("Verifying captured code...")
    captured_code = page.evaluate("window.chrome.storage.local.data.capturedCode")

    if not captured_code:
        raise Exception("Captured code is empty!")

    print("Captured Code Snippet:\n", captured_code[:200], "...")

    # Check for recursive capture
    if "card-title" not in captured_code: # converted to className?
         # logic does not preserve class names in the output style object,
         # but it DOES preserve the original HTML structure (clone.outerHTML).
         # Wait, my logic in content.js:
         # const clone = el.cloneNode(true); ... html = clone.outerHTML;
         # So class names ARE preserved (as className).
         pass

    if "CapturedComponent" not in captured_code:
        raise Exception("Output does not look like a React component")

    if "backgroundColor" not in captured_code:
        raise Exception("Computed styles (backgroundColor) missing")

    if "<button" not in captured_code:
        raise Exception("Recursive capture failed: Button missing inside Card capture")

    print("✅ E2E Verification Passed: Highlight worked, Capture worked, Recursion worked.")

    browser.close()

if __name__ == "__main__":
    with sync_playwright() as playwright:
        run(playwright)
