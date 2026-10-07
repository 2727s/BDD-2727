Feature: Login automation
  # Page: https://www.qapractice.com/practice-login-form
  # The valid account is LOGIN_EMAIL and LOGIN_PASSWORD in .env.
  # Copy this file when you add a real scenario for another practice page.

  Background:
    Given I open the "login" practice page

  Scenario: Valid user sees a success message
    When I sign in with the demo account
    Then I see "Login Successful! Welcome to Premium Banking."
    Then I close the browser

  Scenario: Empty form asks for email and password
    When I sign in as "" with password ""
    Then I see "Email and Password are required"

  Scenario: Wrong credentials show an error
    When I sign in as "wrong@example.com" with password "wrong-password"
    Then I see "Invalid email id and password"

