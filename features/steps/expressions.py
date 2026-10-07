"""Step patterns are plain strings the Cucumber extension can read.

Use {string} for quoted text, and {int}, {float}, or {word} for the other
built-in types. Do not wrap the pattern in parsers.parse: the extension
then cannot jump from the feature file to this function.
Each {string} is the next argument of the step function, after fixtures
such as page. Quotes in the feature line belong to {string}.
"""

import re
from inspect import signature

from pytest_bdd import given as bdd_given
from pytest_bdd import then as bdd_then
from pytest_bdd import when as bdd_when
from pytest_bdd.parsers import StepParser

# These come from pytest fixtures, not from {string} in the expression.
FIXTURES = {"page", "request"}


class StringExpression(StepParser):
    """Match a Cucumber expression that uses only {string}."""

    def __init__(self, expression, arg_names):
        super().__init__(expression)
        pieces = expression.split("{string}")
        placeholders = len(pieces) - 1
        if placeholders != len(arg_names):
            raise ValueError(
                f"{expression!r} has {placeholders} {{string}} placeholders, "
                f"but the step function has {arg_names}"
            )
        pattern = ""
        for index, piece in enumerate(pieces):
            pattern += re.escape(piece)
            if index < placeholders:
                # "" is allowed, so the empty email and password steps match.
                pattern += r'"([^"]*)"'
        self._regex = re.compile("^" + pattern + "$")
        self._arg_names = arg_names

    def is_matching(self, name):
        return self._regex.fullmatch(name) is not None

    def parse_arguments(self, name):
        match = self._regex.fullmatch(name)
        if match is None:
            return None
        return dict(zip(self._arg_names, match.groups()))


def _bind(decorator, expression):
    def wrap(func):
        arg_names = [name for name in signature(func).parameters if name not in FIXTURES]
        parser = StringExpression(expression, arg_names) if "{string}" in expression else expression
        # stacklevel=2 stores the step on the feature step module, not in this file.
        return decorator(parser, stacklevel=2)(func)

    return wrap


def given(expression):
    return _bind(bdd_given, expression)


def when(expression):
    return _bind(bdd_when, expression)


def then(expression):
    return _bind(bdd_then, expression)
