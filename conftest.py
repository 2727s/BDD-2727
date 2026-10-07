import os

import pytest
from playwright.sync_api import sync_playwright

# Importing config loads .env before the browser starts.
import config  # noqa: F401

# Step modules register pytest-bdd fixtures. Pytest only sees them if they are plugins.
pytest_plugins = [
    "features.steps.common_steps",
]


@pytest.fixture
def page():
    # One fresh tab per scenario, so tests do not share cookies or form data.
    # HEADLESS=0 in .env shows the window.
    headless = os.getenv("HEADLESS", "1") != "0"
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=headless)
        tab = browser.new_page()
        yield tab
        # The scenario may already have closed the browser.
        if browser.is_connected():
            browser.close()
