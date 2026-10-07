Feature: Practice pages open
  # Smoke check for every card on /practice-page-selection.
  # Add a new row here when the site adds a practice page, then put the path in config.py.

  Scenario Outline: A practice page opens
    Given I open the "<page>" practice page
    Then the "<page>" practice page is open

    Examples:
      | page            |
      | login           |
      | web form        |
      | e-commerce      |
      | flight booking  |
      | ui elements     |
      | xpath           |
      | forgot password |
      | registration    |
      | api             |
