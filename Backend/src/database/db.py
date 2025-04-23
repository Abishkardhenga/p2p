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
        if not content.id:
            content.id = str(uuid.uuid4())
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
        if not purchase.id:
            # Find the highest ID and increment by 1
            max_id = 0
            for p in self.purchases:
                if p.id and isinstance(p.id, int) and p.id > max_id:
                    max_id = p.id
            purchase.id = max_id + 1
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
            title TEXT,
            description TEXT,
            llm_model TEXT,
            llm_settings TEXT,
            price REAL,
            system_prompt TEXT,
            metadata TEXT
        )
        ''')
        
        # Create purchases table
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS purchases (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT,
            content_id TEXT,
            FOREIGN KEY (user_id) REFERENCES users (id),
            FOREIGN KEY (content_id) REFERENCES content (id)
        )
        ''')
        
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
        
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute(
            """
            INSERT INTO content (
                id, title, description, llm_model, llm_settings, 
                price, system_prompt, metadata
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                content.id, content.title, content.description, content.llm_model,
                json.dumps(content.llm_settings), float(content.price), 
                content.system_prompt, json.dumps(content.metadata or {})
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
            SELECT id, title, description, llm_model, llm_settings,
                   price, system_prompt, metadata
            FROM content WHERE id = ?
            """, 
            (content_id,)
        )
        result = cursor.fetchone()
        
        conn.close()
        
        if result:
            return Content(
                id=result[0],
                title=result[1],
                description=result[2],
                llm_model=result[3],
                llm_settings=json.loads(result[4]),
                price=result[5],
                system_prompt=result[6],
                metadata=json.loads(result[7]) if result[7] else None
            )
        return None
    
    def search_content(self, query: str) -> List[Content]:
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Use LIKE for case-insensitive search
        search_param = f"%{query.lower()}%"
        cursor.execute(
            """
            SELECT id, title, description, llm_model, llm_settings,
                   price, system_prompt, metadata
            FROM content 
            WHERE LOWER(title) LIKE ? OR LOWER(description) LIKE ?
            """, 
            (search_param, search_param)
        )
        results = cursor.fetchall()
        
        conn.close()
        
        content_list = []
        for result in results:
            content_list.append(Content(
                id=result[0],
                title=result[1],
                description=result[2],
                llm_model=result[3],
                llm_settings=json.loads(result[4]),
                price=result[5],
                system_prompt=result[6],
                metadata=json.loads(result[7]) if result[7] else None
            ))
        
        return content_list
    
    def add_purchase(self, purchase: Purchase) -> Purchase:
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute(
            "INSERT INTO purchases (user_id, content_id) VALUES (?, ?)",
            (str(purchase.user_id), str(purchase.content_id))
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
            "SELECT id, user_id, content_id FROM purchases WHERE user_id = ?",
            (str(user_id),)
        )
        results = cursor.fetchall()
        
        conn.close()
        
        return [Purchase(id=result[0], user_id=result[1], content_id=result[2]) for result in results]
    
    def get_purchases_by_content(self, content_id: Union[str, int]) -> List[Purchase]:
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute(
            "SELECT id, user_id, content_id FROM purchases WHERE content_id = ?",
            (str(content_id),)
        )
        results = cursor.fetchall()
        
        conn.close()
        
        return [Purchase(id=result[0], user_id=result[1], content_id=result[2]) for result in results]


# Choose the database implementation based on environment variable
if USE_SQLITE:
    print(f"* Using SQLite database at {SQLITE_DB_PATH}")
    db = SQLiteDatabase()
else:
    print("* Using InMemoryDatabase")
    db = InMemoryDatabase()