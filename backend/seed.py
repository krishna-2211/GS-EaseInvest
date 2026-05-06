from database import SessionLocal, User
from auth import hash_password

def seed_users():
    db = SessionLocal()
    try:
        if db.query(User).count() > 0:
            print("Users already seeded, skipping.")
            return
        
        users = [
            User(
                user_id="user_001",
                name="Pralay",
                email="pralay@test.com",
                hashed_password=hash_password("pralay123"),
                style="YOLO",
                goal="Early retirement"
            ),
            User(
                user_id="user_002",
                name="Krishna",
                email="krishna@test.com",
                hashed_password=hash_password("krishna123"),
                style="Careful",
                goal="Buy a car"
            ),
            User(
                user_id="user_003",
                name="Alex",
                email="alex@test.com",
                hashed_password=hash_password("alex123"),
                style="Careful",
                goal="Build emergency fund"
            ),
        ]
        
        db.add_all(users)
        db.commit()
        print("Users seeded successfully.")
    except Exception as e:
        print(f"Seeding failed: {e}")
        db.rollback()
    finally:
        db.close()