import os
from pathlib import Path

from dotenv import load_dotenv

# Load .env from the project root. A variable already set in the shell wins.
load_dotenv(Path(__file__).resolve().parent / ".env")

# One place for the site address and the practice-page paths.
# Paths come from the cards on /practice-page-selection.
BASE_URL = os.getenv("BASE_URL", "https://www.qapractice.com")
LOGIN_EMAIL = os.getenv("LOGIN_EMAIL", "")
LOGIN_PASSWORD = os.getenv("LOGIN_PASSWORD", "")

# Keys are the names used in the feature files.
PAGES = {
    "login": "/practice-login-form",
    "web form": "/practice-forms",
    # The site spells this path "ecommerece". Do not "fix" it.
    "e-commerce": "/practice-ecommerece-website",
    "flight booking": "/flight-booking-scenarios",
    "ui elements": "/practice-different-ui-elements",
    "xpath": "/SeleniumXPathGuide",
    "forgot password": "/forget-password",
    "registration": "/register",
    "api": "/api-playground",
}


def path_for(name):
    """Return the URL path for a practice page name from a feature file."""
    try:
        return PAGES[name]
    except KeyError:
        known = ", ".join(PAGES)
        raise AssertionError(f"Unknown practice page '{name}'. Use one of: {known}")
