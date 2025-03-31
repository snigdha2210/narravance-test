import json
import csv
import random
from datetime import datetime, timedelta
from typing import List, Dict
import os

# Sample data for generating realistic orders
PRODUCT_CATEGORIES = [
    "Electronics",
    "Clothing",
    "Home & Garden",
    "Books",
    "Sports & Outdoors",
    "Toys & Games",
    "Beauty & Personal Care",
    "Food & Beverages",
    "Health & Wellness",
    "Automotive"
]

PRODUCTS = {
    "Electronics": ["Smartphone", "Laptop", "Headphones", "Smart Watch", "Tablet", "Camera", "Gaming Console", "TV", "Speaker", "Printer"],
    "Clothing": ["T-Shirt", "Jeans", "Dress", "Jacket", "Shoes", "Sweater", "Suit", "Accessories", "Socks", "Underwear"],
    "Home & Garden": ["Coffee Maker", "Vacuum Cleaner", "Garden Tools", "Bedding", "Furniture", "Kitchen Appliances", "Lighting", "Decor", "Storage", "Cleaning Supplies"],
    "Books": ["Fiction", "Non-Fiction", "Children's Books", "Cookbooks", "Textbooks", "Comics", "Magazines", "Art Books", "Travel Guides", "Self-Help"],
    "Sports & Outdoors": ["Yoga Mat", "Running Shoes", "Bicycle", "Camping Gear", "Sports Equipment", "Fitness Tracker", "Gym Equipment", "Hiking Gear", "Swimming Gear", "Team Sports Equipment"],
    "Toys & Games": ["Board Games", "Action Figures", "Puzzles", "Remote Control Cars", "Educational Toys", "Building Sets", "Art Supplies", "Musical Toys", "Outdoor Toys", "Science Kits"],
    "Beauty & Personal Care": ["Shampoo", "Makeup", "Skincare", "Perfume", "Hair Care", "Body Care", "Nail Care", "Tools & Brushes", "Gift Sets", "Men's Grooming"],
    "Food & Beverages": ["Snacks", "Coffee", "Tea", "Organic Food", "Supplements", "Baking Supplies", "Cooking Ingredients", "Beverages", "Health Food", "Gourmet Items"],
    "Health & Wellness": ["Vitamins", "Fitness Tracker", "Massage Tools", "First Aid Kit", "Wellness Supplements", "Medical Devices", "Health Monitors", "Therapy Equipment", "Sleep Aids", "Stress Relief"],
    "Automotive": ["Car Accessories", "Tools", "Cleaning Supplies", "Parts", "Electronics", "Maintenance", "Safety Equipment", "Interior Accessories", "Exterior Accessories", "Performance Parts"]
}

COUNTRIES = [
    "United States", "United Kingdom", "Canada", "Australia", "Germany",
    "France", "Japan", "Spain", "Italy", "Brazil", "India", "China",
    "Mexico", "South Korea", "Netherlands", "Sweden", "Norway", "Denmark",
    "Singapore", "New Zealand", "Switzerland", "Belgium", "Austria",
    "Ireland", "Finland", "Portugal", "Greece", "Poland", "Czech Republic",
    "Hungary", "Israel", "South Africa", "UAE", "Saudi Arabia", "Turkey"
]

def generate_random_date(start_date: datetime, end_date: datetime) -> datetime:
    time_between = end_date - start_date
    days_between = time_between.days
    random_days = random.randint(0, days_between)
    random_date = start_date + timedelta(days=random_days)
    # Add random hours, minutes, and seconds
    random_date += timedelta(
        hours=random.randint(0, 23),
        minutes=random.randint(0, 59),
        seconds=random.randint(0, 59)
    )
    return random_date

def generate_random_order(order_id: str, source: str) -> Dict:
    category = random.choice(PRODUCT_CATEGORIES)
    product = random.choice(PRODUCTS[category])
    quantity = random.randint(1, 5)
    unit_price = round(random.uniform(10, 1000), 2)
    total_amount = round(quantity * unit_price, 2)
    
    # Generate source-specific data
    if source == "source_a":
        source_specific = {
            "shop_name": f"Shop_{random.randint(1, 100)}",
            "shop_rating": round(random.uniform(1, 5), 1),
            "shop_location": random.choice(COUNTRIES),
            "shipping_method": random.choice(["Standard", "Express", "Next Day"]),
            "payment_method": random.choice(["Credit Card", "PayPal", "Bank Transfer"]),
            "customer_review": random.choice([True, False]),
            "discount_applied": round(random.uniform(0, 0.3), 2),
            "loyalty_points": random.randint(0, 1000)
        }
    else:  # source_b
        source_specific = {
            "store_id": f"STORE_{random.randint(1, 50)}",
            "store_type": random.choice(["Retail", "Wholesale", "Outlet"]),
            "store_region": random.choice(["North", "South", "East", "West"]),
            "delivery_type": random.choice(["Standard", "Premium", "Same Day"]),
            "payment_type": random.choice(["Card", "Digital Wallet", "Store Credit"]),
            "membership_level": random.choice(["Basic", "Silver", "Gold", "Platinum"]),
            "reward_points": random.randint(0, 2000),
            "special_offer": random.choice([True, False])
        }

    return {
        "order_id": order_id,
        "order_date": generate_random_date(
            datetime(2015, 1, 1),
            datetime(2025, 3, 30)
        ).isoformat(),
        "source": source,
        "product_name": product,
        "product_category": category,
        "quantity": quantity,
        "unit_price": unit_price,
        "total_amount": total_amount,
        "customer_id": f"CUST_{random.randint(1000, 9999)}",
        "customer_country": random.choice(COUNTRIES),
        "source_specific_data": json.dumps(source_specific)
    }

def generate_orders(num_orders: int, source: str) -> List[Dict]:
    orders = []
    for i in range(num_orders):
        order_id = f"{source.upper()}_ORD_{i+1:04d}"
        orders.append(generate_random_order(order_id, source))
    return orders

def save_to_json(orders: List[Dict], filename: str):
    with open(filename, 'w') as f:
        json.dump(orders, f, indent=2)

def save_to_csv(orders: List[Dict], filename: str):
    if not orders:
        return
    
    fieldnames = orders[0].keys()
    with open(filename, 'w', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(orders)

def main():
    # Create data directory if it doesn't exist
    data_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
    os.makedirs(data_dir, exist_ok=True)

    # Generate orders for both sources
    source_a_orders = generate_orders(200, "source_a")
    source_b_orders = generate_orders(200, "source_b")

    # Save source A orders to JSON
    source_a_json = os.path.join(data_dir, "source_a_orders.json")
    save_to_json(source_a_orders, source_a_json)
    print(f"Generated {len(source_a_orders)} orders for source A in {source_a_json}")

    # Save source B orders to CSV
    source_b_csv = os.path.join(data_dir, "source_b_orders.csv")
    save_to_csv(source_b_orders, source_b_csv)
    print(f"Generated {len(source_b_orders)} orders for source B in {source_b_csv}")

if __name__ == "__main__":
    main() 