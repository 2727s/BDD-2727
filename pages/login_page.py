from config import path_for
from pages.base_page import BasePage


class LoginPage(BasePage):
    """Login form at /practice-login-form. Locators are the page's data-testid values."""

    def open(self):
        self.open_path(path_for("login"))

    def sign_in(self, email, password):
        self.page.get_by_test_id("login-email").fill(email)
        self.page.get_by_test_id("login-password").fill(password)
        self.page.get_by_test_id("login-submit").click()

    def shows(self, text):
        # Success and error both render as visible text on the same form.
        self.page.get_by_text(text, exact=True).wait_for()
