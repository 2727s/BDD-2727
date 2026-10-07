# BDD-2727

Small BDD framework for the practice pages on [QA Practice](https://www.qapractice.com/practice-page-selection).

pytest-bdd reads the `.feature` files. Playwright drives the browser. Page objects hold the locators.

```
features/login.feature            what the user does
features/practice_pages.feature   each practice page opens
features/steps/                   shared steps, written as {string}
test_login.py                     login scenarios and their steps
Bdd.py                            each practice page opens
conftest.py                       start and stop the browser
pages/                            locators and actions for one screen
config.py                         site URL and page paths
```

Login is the worked example. For another page, copy `pages/login_page.py` and `features/login.feature`, then add steps only if the existing ones do not fit.

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
playwright install chromium
pytest
```

Copy `.env.example` to `.env` before the first run. `HEADLESS=0` in `.env` shows the browser. `pytest test_login.py` runs the login scenarios.
