from config import BASE_URL


class BasePage:
    """A browser tab plus a way to open a path on the practice site."""

    def __init__(self, page):
        self.page = page

    def open_path(self, path):
        self.page.goto(BASE_URL + path)
