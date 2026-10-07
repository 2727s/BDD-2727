"""The same three scenarios as features/login.feature.

Ctrl+click a step in the feature file to open the function here.
Ctrl+click the quoted step string here to open that step in the feature file.
"""

from pytest_bdd import scenario

from config import LOGIN_EMAIL, LOGIN_PASSWORD
from features.steps.expressions import then, when
from pages.login_page import LoginPage


@when("I sign in with the demo account")
def sign_in_demo(page):
    # Email and password come from .env, not from the feature file.
    if not LOGIN_EMAIL or not LOGIN_PASSWORD:
        raise AssertionError("Set LOGIN_EMAIL and LOGIN_PASSWORD in .env")
    LoginPage(page).sign_in(LOGIN_EMAIL, LOGIN_PASSWORD)



@when("I sign in as {string} with password {string}")
def sign_in(page, email, password):
    LoginPage(page).sign_in(email, password)


@then("I see {string}")
def see_text(page, text):
    LoginPage(page).shows(text)


@scenario("login.feature", "Valid user sees a success message")
def test_valid_user_sees_a_success_message():
    pass


@scenario("login.feature", "Empty form asks for email and password")
def test_empty_form_asks_for_email_and_password():
    pass


@scenario("login.feature", "Wrong credentials show an error")
def test_wrong_credentials_show_an_error():
    pass
