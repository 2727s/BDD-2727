Feature: E-commerce
  # Page: https://www.qapractice.com/practice-ecommerece-website
  # The product cards on the store are the inventory.

  Background:
    Given I open the "e-commerce" practice page
    Then the "e-commerce" practice page is open

  Scenario Outline: A product is on the page
    Then the inventory lists "<product>"

    Examples:
      | product                     |
      | Laptop Pro                  |
      | Wireless Mouse              |
      | Keyboard RGB                |
      | Headphones Noise Cancelling |
      | External SSD 1TB            |

Scenario Outline: Cart is empty
    When I add the product "<product>" to the cart and I click on the "Cart" button and I click on the "Clear Cart" button
    And I click on the "Cart" button and I click on the "Clear Cart" button
    Then the cart is empty

    Examples:
      | product                     |
      | Laptop Pro                  |
      | Wireless Mouse              |
      | Keyboard RGB                |
      | Headphones Noise Cancelling |
      | External SSD 1TB            |
      | Monitor 4K                  |
      | Coca Cola 250ml             |
      | Mango Drink                 |

Scenario Outline: Cart is not empty
    When I add the product "<product>" to the cart and I click on the "Cart" button and I click on the "Clear Cart" button
    Then the cart is not empty

    Examples:
      | product                     |
      | Laptop Pro                  |
      | Wireless Mouse              |
      | Keyboard RGB                |
      | Headphones Noise Cancelling |
      | External SSD 1TB            |