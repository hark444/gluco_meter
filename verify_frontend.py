from playwright.sync_api import Page, expect

def test_app_screenshot(page: Page):
    page.goto('http://localhost:5173', wait_until='networkidle')
    page.screenshot(path='/home/jules/verification/home-page.png')
    page.goto('http://localhost:5173/auth/login', wait_until='networkidle')
    page.screenshot(path='/home/jules/verification/login-page.png')
