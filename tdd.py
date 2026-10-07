#create function which culculate the sum of two numbersdiscount and it can't be negative

def test_calculate_discount():
    assert calculate_discount(100, 10) == 90
    assert calculate_discount(-100, 10) == 0.0



def calculate_discount(price, discount):
   if price  < 0:
    return 0.0
    return price - discount


