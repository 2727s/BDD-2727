from config import path_for
from features.steps.expressions import given, then
from pages.base_page import BasePage


@given("I open the {string} practice page")
def open_practice_page(page, name):
    BasePage(page).open_path(path_for(name))


@then("the {string} practice page is open")
def practice_page_is_open(page, name):
    assert path_for(name) in page.url


@then("the inventory lists {string}")
def inventory_lists(page, product):
    page.get_by_text(product, exact=True).first.wait_for()


@then("I close the browser")
def close_the_browser(page):
    browser = page.context.browser
    if browser is not None and browser.is_connected():
        browser.close()
