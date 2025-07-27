#!/usr/bin/env python3
"""
Database Connection Module
Handles SQLite database setup and connection for Scizor notes
"""

import os
import sqlite3
import threading
from typing import Optional, List, Dict, Any
from datetime import datetime
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class DatabaseConnection:
    """SQLite database connection manager for Scizor notes"""
    
    def __init__(self):
        """Initialize database connection"""
        self.db_path = self._get_database_path()
        self._ensure_database_directory()
        self._initialize_database()
    
    def _get_database_path(self) -> str:
        """Get the database file path in %APPDATA%\Scizor\scizor.db"""
        app_data = os.getenv('APPDATA')
        if not app_data:
            # Fallback to user home directory if APPDATA is not available
            app_data = os.path.expanduser('~')
        
        scizor_dir = os.path.join(app_data, 'Scizor')
        return os.path.join(scizor_dir, 'scizor.db')
    
    def _ensure_database_directory(self):
        """Ensure the Scizor directory exists"""
        db_dir = os.path.dirname(self.db_path)
        if not os.path.exists(db_dir):
            try:
                os.makedirs(db_dir, exist_ok=True)
                logger.info(f"Created database directory: {db_dir}")
            except Exception as e:
                logger.error(f"Failed to create database directory: {e}")
                raise
    
    def _initialize_database(self):
        """Initialize the database and create tables if they don't exist"""
        try:
            # Get thread-local connection
            connection = self.get_connection()
            
            # Create tables
            self._create_notes_table(connection)
            self._create_clipboard_history_table(connection)
            logger.info(f"Database initialized successfully: {self.db_path}")
            
        except Exception as e:
            logger.error(f"Failed to initialize database: {e}")
            raise
    
    def _create_notes_table(self, connection: sqlite3.Connection):
        """Create the notes table if it doesn't exist"""
        create_table_sql = """
        CREATE TABLE IF NOT EXISTS notes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT,
            content TEXT NOT NULL,
            priority INTEGER DEFAULT 1,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
        """
        
        try:
            cursor = connection.cursor()
            cursor.execute(create_table_sql)
            connection.commit()
            logger.info("Notes table created/verified successfully")
        except Exception as e:
            logger.error(f"Failed to create notes table: {e}")
            raise
    
    def _create_clipboard_history_table(self, connection: sqlite3.Connection):
        """Create the clipboard_history table if it doesn't exist"""
        create_table_sql = """
        CREATE TABLE IF NOT EXISTS clipboard_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            content TEXT NOT NULL,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(content)
        )
        """
        
        try:
            cursor = connection.cursor()
            cursor.execute(create_table_sql)
            connection.commit()
            logger.info("Clipboard history table created/verified successfully")
        except Exception as e:
            logger.error(f"Failed to create clipboard_history table: {e}")
            raise
    
    def get_connection(self) -> sqlite3.Connection:
        """Get a thread-local database connection"""
        # Use thread-local storage for database connections
        if not hasattr(self, '_thread_local'):
            self._thread_local = threading.local()
        
        if not hasattr(self._thread_local, 'connection') or self._thread_local.connection is None:
            self._thread_local.connection = sqlite3.connect(self.db_path)
            self._thread_local.connection.row_factory = sqlite3.Row  # Enable row factory for dict-like access
            
        return self._thread_local.connection
    
    def close_connection(self):
        """Close the thread-local database connection"""
        if hasattr(self, '_thread_local') and hasattr(self._thread_local, 'connection'):
            if self._thread_local.connection:
                self._thread_local.connection.close()
                self._thread_local.connection = None
                logger.info("Database connection closed")
    
    def execute_query(self, query: str, params: tuple = ()) -> List[Dict[str, Any]]:
        """Execute a query and return results as a list of dictionaries"""
        connection = self.get_connection()
        try:
            cursor = connection.cursor()
            cursor.execute(query, params)
            
            if query.strip().upper().startswith('SELECT'):
                # Return results for SELECT queries
                columns = [description[0] for description in cursor.description]
                results = []
                for row in cursor.fetchall():
                    results.append(dict(zip(columns, row)))
                return results
            else:
                # Commit for INSERT, UPDATE, DELETE queries
                connection.commit()
                return []
                
        except Exception as e:
            logger.error(f"Query execution failed: {e}")
            connection.rollback()
            raise

    
    def __enter__(self):
        """Context manager entry"""
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        """Context manager exit"""
        self.close_connection()


# Global database instance
_db_instance: Optional[DatabaseConnection] = None


def get_database() -> DatabaseConnection:
    """Get the global database instance"""
    global _db_instance
    if _db_instance is None:
        _db_instance = DatabaseConnection()
    return _db_instance


def close_database():
    """Close the global database instance"""
    global _db_instance
    if _db_instance:
        _db_instance.close_connection()
        _db_instance = None
