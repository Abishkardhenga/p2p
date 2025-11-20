# db.py
import os
import uuid
import json
import sqlite3
from typing import Dict, List, Optional, Union
from models.schemas import Content, Purchase, User

from constants import USE_SQLITE, SQLITE_DB_PATH


class InMemoryDatabase:
    """In-memory database implementation"""
    def __init__(self):
        self.users: Dict[str, User] = {}
        self.content: Dict[str, Content] = {}
        self.purchases: List[Purchase] = []
    
    def add_user(self, user: User) -> User:
        if not user.id:
            user.id = str(uuid.uuid4())
        self.users[str(user.id)] = user
        return user

    def get_user(self, user_id: Union[str, int]) -> Optional[User]:
        return self.users.get(str(user_id))
    
    def add_content(self, content: Content) -> Content:
        print(f"\n\n adding content: {content}")
        self.content[str(content.id)] = content
        return content
    
    def update_content(self, content: Content) -> Content:
        """Update existing content (same as add for in-memory)"""
        print(f"\n\n updating content: {content}")
        self.content[str(content.id)] = content
        return content
    
    def get_content(self, content_id: str) -> Optional[Content]:
        return self.content.get(content_id)
    
    def search_content(self, query: str) -> List[Content]:
        query = query.lower()
        results = []
        for content in self.content.values():
            if query in content.title.lower() or query in content.description.lower():
                results.append(content)
        return results
    
    def add_purchase(self, purchase: Purchase) -> Purchase:
        from datetime import datetime
        if not purchase.id:
            # Find the highest ID and increment by 1
            max_id = 0
            for p in self.purchases:
                if p.id and isinstance(p.id, int) and p.id > max_id:
                    max_id = p.id
            purchase.id = max_id + 1
        
        # Set purchased_at if not provided
        if not purchase.purchased_at:
            purchase.purchased_at = datetime.utcnow().isoformat()
        
        self.purchases.append(purchase)
        return purchase
    
    def get_purchases_by_user(self, user_id: Union[str, int]) -> List[Purchase]:
        return [p for p in self.purchases if str(p.user_id) == str(user_id)]
    
    def get_purchases_by_content(self, content_id: Union[str, int]) -> List[Purchase]:
        return [p for p in self.purchases if str(p.content_id) == str(content_id)]


class SQLiteDatabase:
    """SQLite database implementation"""
    def __init__(self):
        self.db_path = SQLITE_DB_PATH
        self._initialize_db()
    
    def _initialize_db(self):
        """Initialize the database with required tables"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Create users table
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            username TEXT,
            profile_picture TEXT,
            description TEXT
        )
        ''')
        
        # Create content table
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS content (
            id TEXT PRIMARY KEY,
            owner_id TEXT,
            title TEXT,
            description TEXT,
            llm_model TEXT,
            llm_settings TEXT,
            price REAL,
            system_prompt TEXT,
            metadata TEXT,
            prompt TEXT,
            preview_url TEXT,
            encrypted_message TEXT
        )
        ''')
        
        # Create purchases table
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS purchases (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT,
            content_id TEXT,
            purchased_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id),
            FOREIGN KEY (content_id) REFERENCES content (id)
        )
        ''')
        
        # Migration: Add purchased_at column if it doesn't exist
        try:
            cursor.execute("SELECT purchased_at FROM purchases LIMIT 1")
        except sqlite3.OperationalError:
            # Column doesn't exist, add it
            cursor.execute('''
                ALTER TABLE purchases 
                ADD COLUMN purchased_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ''')
            print("✓ Added purchased_at column to purchases table")
        
        # Migration: Add encrypted_message column if it doesn't exist
        try:
            cursor.execute("SELECT encrypted_message FROM content LIMIT 1")
        except sqlite3.OperationalError:
            # Column doesn't exist, add it
            cursor.execute('''
                ALTER TABLE content 
                ADD COLUMN encrypted_message TEXT
            ''')
            print("✓ Added encrypted_message column to content table")
        
        conn.commit()
        conn.close()
    
    def add_user(self, user: User) -> User:
        if not user.id:
            user.id = str(uuid.uuid4())
        
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute(
            "INSERT INTO users (id, username, profile_picture, description) VALUES (?, ?, ?, ?)",
            (str(user.id), user.username, user.profile_picture, user.description)
        )
        
        conn.commit()
        conn.close()
        
        return user
    
    def get_user(self, user_id: Union[str, int]) -> Optional[User]:
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute("SELECT id, username, profile_picture, description FROM users WHERE id = ?", (str(user_id),))
        result = cursor.fetchone()
        
        conn.close()
        
        if result:
            return User(
                id=result[0],
                username=result[1],
                profile_picture=result[2],
                description=result[3]
            )
        return None
    
    def add_content(self, content: Content) -> Content:
        if not content.id:
            content.id = str(uuid.uuid4())
        print(f"\n\n adding content: {content}")
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute(
            """
            INSERT OR REPLACE INTO content (
                id, owner_id, title, description, llm_model, llm_settings, 
                price, system_prompt, metadata, prompt, preview_url, encrypted_message
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                content.id, content.owner_id, content.title, content.description, content.llm_model,
                json.dumps(content.llm_settings), float(content.price), 
                content.system_prompt, json.dumps(content.metadata or {}), content.prompt, content.preview_url,
                content.encrypted_message
            )
        )
        
        conn.commit()
        conn.close()
        
        return content
    
    def update_content(self, content: Content) -> Content:
        """Update existing content"""
        print(f"\n\n updating content: {content}")
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute(
            """
            UPDATE content 
            SET owner_id = ?, title = ?, description = ?, llm_model = ?, 
                llm_settings = ?, price = ?, system_prompt = ?, metadata = ?, 
                prompt = ?, preview_url = ?, encrypted_message = ?
            WHERE id = ?
            """,
            (
                content.owner_id, content.title, content.description, content.llm_model,
                json.dumps(content.llm_settings), float(content.price), 
                content.system_prompt, json.dumps(content.metadata or {}), 
                content.prompt, content.preview_url, content.encrypted_message, content.id
            )
        )
        
        conn.commit()
        conn.close()
        
        return content
    
    def get_content(self, content_id: str) -> Optional[Content]:
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute(
            """
            SELECT id, owner_id, title, description, llm_model, llm_settings,
                   price, system_prompt, metadata, prompt, preview_url, encrypted_message
            FROM content WHERE id = ?
            """, 
            (content_id,)
        )
        result = cursor.fetchone()
        
        conn.close()
        
        if result:
            print(f"\n\n got content: {result}")
            metadata = json.loads(result[8]) if result[8] else None
            preview_url = result[10] if len(result) > 10 else None
            encrypted_message = result[11] if len(result) > 11 else None
            
            print(f"📦 Parsed metadata: {metadata}")
            print(f"📸 Sample images in metadata: {metadata.get('sample_images') if metadata else None}")
            print(f"🖼️ Preview URL: {preview_url}")
            print(f"🔐 Encrypted message: {encrypted_message[:50] if encrypted_message else None}...")
            
            return Content(
                id=result[0],
                owner_id=result[1],
                title=result[2],
                description=result[3],
                llm_model=result[4],
                llm_settings=json.loads(result[5]),
                price=result[6],
                system_prompt=result[7],
                metadata=metadata,
                prompt=result[9] if result[9] else None,
                preview_url=preview_url,
                encrypted_message=encrypted_message
            )
        return None
    
    def get_content_by_owner(self, owner_id: str) -> List[Content]:
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute(
            """
            SELECT id, owner_id, title, description, llm_model, llm_settings,
                   price, system_prompt, metadata, prompt, preview_url, encrypted_message
            FROM content WHERE owner_id = ?
            """,
            (owner_id,)
        )
        results = cursor.fetchall()
        
        conn.close()

        print(f"\n\n got raw results: {results}")
        
        content_list = []
        for result in results:
            content_list.append(Content(
                id=result[0],
                owner_id=result[1],
                title=result[2],
                description=result[3],
                llm_model=result[4],
                llm_settings=json.loads(result[5]),
                price=result[6],
                system_prompt=result[7],
                metadata=json.loads(result[8]) if result[8] else None,
                prompt=result[9] if result[9] else None,
                preview_url=result[10] if len(result) > 10 else None,
                encrypted_message=result[11] if len(result) > 11 else None
            ))
        
        return content_list

    def get_total_sales_by_owner(self, owner_id: str) -> int:
        """Get total number of purchases for all content owned by a user"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute(
            """
            SELECT COUNT(p.id)
            FROM purchases p
            JOIN content c ON p.content_id = c.id
            WHERE c.owner_id = ?
            """,
            (owner_id,)
        )
        result = cursor.fetchone()
        conn.close()
        
        return result[0] if result else 0
    
    def get_sales_by_content(self, content_id: str) -> int:
        """Get number of purchases for a specific content"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute(
            "SELECT COUNT(id) FROM purchases WHERE content_id = ?",
            (content_id,)
        )
        result = cursor.fetchone()
        conn.close()
        
        return result[0] if result else 0
    def get_n_items(self, n: int) -> List[Content]:
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute(
            """
            SELECT id, owner_id, title, description, llm_model, llm_settings,
                   price, system_prompt, metadata, prompt, preview_url, encrypted_message
            FROM content
            LIMIT ?
            """,
            (n,)
        )
        results = cursor.fetchall()
        
        conn.close()
        
        content_list = []
        for result in results:
            content_list.append(Content(
                id=result[0],
                owner_id=result[1],
                title=result[2],
                description=result[3],
                llm_model=result[4],
                llm_settings=json.loads(result[5]),
                price=result[6],
                system_prompt=result[7],
                metadata=json.loads(result[8]) if result[8] else None,
                prompt=result[9] if result[9] else None,
                preview_url=result[10] if len(result) > 10 else None,
                encrypted_message=result[11] if len(result) > 11 else None
            ))
        
        return content_list
    
    def search_content(self, query: str) -> List[Content]:
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Use LIKE for case-insensitive search
        search_param = f"%{query.lower()}%"
        cursor.execute(
            """
            SELECT id, owner_id, title, description, llm_model, llm_settings,
                   price, system_prompt, metadata, prompt, preview_url, encrypted_message
            FROM content 
            WHERE LOWER(title) LIKE ? OR LOWER(description) LIKE ?
            """, 
            (search_param, search_param)
        )
        results = cursor.fetchall()
        print(f"\n\n raw search result: {results}")
        conn.close()
        
        content_list = []
        for result in results:
            content_list.append(Content(
                id=result[0],
                owner_id=result[1],
                title=result[2],
                description=result[3],
                llm_model=result[4],
                llm_settings=json.loads(result[5]),
                price=result[6],
                system_prompt=result[7],
                metadata=json.loads(result[8]) if result[8] else None,
                prompt=result[9] if result[9] else None,
                preview_url=result[10] if len(result) > 10 else None,
                encrypted_message=result[11] if len(result) > 11 else None
            ))
        
        return content_list
    
    def add_purchase(self, purchase: Purchase) -> Purchase:
        from datetime import datetime
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Set purchased_at if not provided
        if not purchase.purchased_at:
            purchase.purchased_at = datetime.utcnow().isoformat()
        
        cursor.execute(
            "INSERT INTO purchases (user_id, content_id, purchased_at) VALUES (?, ?, ?)",
            (str(purchase.user_id), str(purchase.content_id), purchase.purchased_at)
        )
        
        # Get the auto-incremented ID
        purchase.id = cursor.lastrowid
        
        conn.commit()
        conn.close()
        
        return purchase
    
    def get_purchases_by_user(self, user_id: Union[str, int]) -> List[Purchase]:
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute(
            "SELECT id, user_id, content_id, purchased_at FROM purchases WHERE user_id = ?",
            (str(user_id),)
        )
        results = cursor.fetchall()
        
        conn.close()
        
        return [Purchase(id=result[0], user_id=result[1], content_id=result[2], purchased_at=result[3]) for result in results]
    
    def get_purchases_by_content(self, content_id: Union[str, int]) -> List[Purchase]:
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute(
            "SELECT id, user_id, content_id, purchased_at FROM purchases WHERE content_id = ?",
            (str(content_id),)
        )
        results = cursor.fetchall()
        
        conn.close()
        
        return [Purchase(id=result[0], user_id=result[1], content_id=result[2], purchased_at=result[3]) for result in results]


# Choose the database implementation based on environment variable
if USE_SQLITE:
    print(f"* Using SQLite database at {SQLITE_DB_PATH}")
    db = SQLiteDatabase()
else:
    print("* Using InMemoryDatabase")
    db = InMemoryDatabase()