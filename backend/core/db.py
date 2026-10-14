"""
CloudTwin PostgreSQL Database Service
Manages connections and CRUD operations against AWS RDS PostgreSQL.
"""
import os
import json
import logging
import datetime
import psycopg2
from psycopg2.extras import RealDictCursor
from typing import List, Dict, Any, Optional
from backend.core.config import settings

logger = logging.getLogger(__name__)

class DatabaseService:
    def __init__(self):
        self.db_url = settings.DATABASE_URL
        self._conn = None
        self._is_available = True

    def get_connection(self):
        if not self._is_available:
            return None
        try:
            conn = psycopg2.connect(
                self.db_url,
                connect_timeout=3
            )
            self._is_available = True
            return conn
        except Exception as e:
            logger.warning(f"Failed to connect to RDS PostgreSQL: {e}")
            self._is_available = False
            return None

    def init_database(self):
        """Ensure initial admin user exists in RDS PostgreSQL"""
        conn = self.get_connection()
        if not conn:
            logger.warning("PostgreSQL not reachable. Running with in-memory store.")
            return

        try:
            with conn:
                with conn.cursor() as cur:
                    # Ensure primary user exists for foreign keys
                    cur.execute("""
                        INSERT INTO users (id, email, full_name, role, company, tier)
                        VALUES 
                            ('user-admin-01', 'admin@cloudtwin.io', 'CloudTwin Architect', 'lead_architect', 'AWS Enterprise', 'enterprise'),
                            ('user-demo-01', 'demo@cloudtwin.io', 'CloudTwin Lead Architect', 'lead_architect', 'AWS Enterprise', 'enterprise')
                        ON CONFLICT (id) DO NOTHING;
                    """)
            logger.info("RDS PostgreSQL connection initialized successfully.")
        except Exception as e:
            logger.error(f"Error initializing RDS user: {e}")
        finally:
            conn.close()

    def get_projects(self) -> List[Dict[str, Any]]:
        conn = self.get_connection()
        if not conn:
            return []
        try:
            with conn:
                with conn.cursor(cursor_factory=RealDictCursor) as cur:
                    cur.execute("SELECT * FROM projects ORDER BY created_at DESC;")
                    rows = cur.fetchall()
                    projects = []
                    for r in rows:
                        d = dict(r)
                        if hasattr(d.get("created_at"), "isoformat"):
                            d["created_at"] = d["created_at"].isoformat()
                        if hasattr(d.get("updated_at"), "isoformat"):
                            d["updated_at"] = d["updated_at"].isoformat()
                        projects.append(d)
                    return projects
        except Exception as e:
            logger.error(f"Error fetching projects from RDS: {e}")
            return []
        finally:
            conn.close()

    def save_project(self, project: Dict[str, Any]) -> bool:
        conn = self.get_connection()
        if not conn:
            return False
        try:
            with conn:
                with conn.cursor() as cur:
                    cur.execute("""
                        INSERT INTO projects (id, user_id, name, description, cloud_provider, default_region, tags, status, created_at, updated_at)
                        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                        ON CONFLICT (id) DO UPDATE SET
                            name = EXCLUDED.name,
                            description = EXCLUDED.description,
                            tags = EXCLUDED.tags,
                            status = EXCLUDED.status,
                            updated_at = EXCLUDED.updated_at;
                    """, (
                        project["id"],
                        project.get("user_id", "user-admin-01"),
                        project["name"],
                        project.get("description", ""),
                        project.get("cloud_provider", "aws"),
                        project.get("default_region", "ap-south-1"),
                        project.get("tags", []),
                        project.get("status", "active"),
                        project.get("created_at"),
                        project.get("updated_at")
                    ))
            return True
        except Exception as e:
            logger.error(f"Error saving project to RDS: {e}")
            return False
        finally:
            conn.close()

    def delete_project(self, project_id: str) -> bool:
        conn = self.get_connection()
        if not conn:
            return False
        try:
            with conn:
                with conn.cursor() as cur:
                    cur.execute("DELETE FROM architectures WHERE project_id = %s;", (project_id,))
                    cur.execute("DELETE FROM projects WHERE id = %s;", (project_id,))
            return True
        except Exception as e:
            logger.error(f"Error deleting project {project_id} from RDS: {e}")
            return False
        finally:
            conn.close()

    def get_architectures(self) -> List[Dict[str, Any]]:
        conn = self.get_connection()
        if not conn:
            return []
        try:
            with conn:
                with conn.cursor(cursor_factory=RealDictCursor) as cur:
                    cur.execute("SELECT * FROM architectures ORDER BY updated_at DESC;")
                    rows = cur.fetchall()
                    archs = []
                    for r in rows:
                        d = dict(r)
                        if isinstance(d.get("nodes"), str):
                            d["nodes"] = json.loads(d["nodes"])
                        if isinstance(d.get("connections"), str):
                            d["connections"] = json.loads(d["connections"])
                        if isinstance(d.get("metadata"), str):
                            d["metadata"] = json.loads(d["metadata"])
                        if hasattr(d.get("created_at"), "isoformat"):
                            d["created_at"] = d["created_at"].isoformat()
                        if hasattr(d.get("updated_at"), "isoformat"):
                            d["updated_at"] = d["updated_at"].isoformat()
                        archs.append(d)
                    return archs
        except Exception as e:
            logger.error(f"Error fetching architectures from RDS: {e}")
            return []
        finally:
            conn.close()

    def save_architecture(self, arch: Dict[str, Any]) -> bool:
        conn = self.get_connection()
        if not conn:
            return False
        try:
            with conn:
                with conn.cursor() as cur:
                    nodes_json = json.dumps(arch.get("nodes", []))
                    conns_json = json.dumps(arch.get("connections", []))
                    meta_json = json.dumps(arch.get("metadata", {}))

                    cur.execute("""
                        INSERT INTO architectures (id, project_id, name, description, version, schema_version, region, nodes, connections, metadata, created_at, updated_at)
                        VALUES (%s, %s, %s, %s, %s, %s, %s, %s::jsonb, %s::jsonb, %s::jsonb, %s, %s)
                        ON CONFLICT (id) DO UPDATE SET
                            name = EXCLUDED.name,
                            description = EXCLUDED.description,
                            version = EXCLUDED.version,
                            region = EXCLUDED.region,
                            nodes = EXCLUDED.nodes,
                            connections = EXCLUDED.connections,
                            metadata = EXCLUDED.metadata,
                            updated_at = EXCLUDED.updated_at;
                    """, (
                        arch["id"],
                        arch.get("project_id"),
                        arch["name"],
                        arch.get("description", ""),
                        arch.get("version", "1.0.0"),
                        arch.get("schema_version", "1.0"),
                        arch.get("region", "ap-south-1"),
                        nodes_json,
                        conns_json,
                        meta_json,
                        arch.get("created_at"),
                        arch.get("updated_at")
                    ))
            return True
        except Exception as e:
            logger.error(f"Error saving architecture to RDS: {e}")
            return False
    def get_user_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        conn = self.get_connection()
        if not conn:
            return None
        try:
            with conn:
                with conn.cursor(cursor_factory=RealDictCursor) as cur:
                    cur.execute("SELECT * FROM users WHERE LOWER(email) = LOWER(%s);", (email,))
                    row = cur.fetchone()
                    if row:
                        d = dict(row)
                        if hasattr(d.get("created_at"), "isoformat"):
                            d["created_at"] = d["created_at"].isoformat()
                        if hasattr(d.get("updated_at"), "isoformat"):
                            d["updated_at"] = d["updated_at"].isoformat()
                        return d
                    return None
        except Exception as e:
            logger.error(f"Error fetching user by email from RDS: {e}")
            return None
        finally:
            conn.close()

    def get_user_by_id(self, user_id: str) -> Optional[Dict[str, Any]]:
        conn = self.get_connection()
        if not conn:
            return None
        try:
            with conn:
                with conn.cursor(cursor_factory=RealDictCursor) as cur:
                    cur.execute("SELECT * FROM users WHERE id = %s;", (user_id,))
                    row = cur.fetchone()
                    if row:
                        d = dict(row)
                        if hasattr(d.get("created_at"), "isoformat"):
                            d["created_at"] = d["created_at"].isoformat()
                        if hasattr(d.get("updated_at"), "isoformat"):
                            d["updated_at"] = d["updated_at"].isoformat()
                        return d
                    return None
        except Exception as e:
            logger.error(f"Error fetching user by id from RDS: {e}")
            return None
        finally:
            conn.close()

    def save_user(self, user: Dict[str, Any]) -> bool:
        conn = self.get_connection()
        if not conn:
            return False
        try:
            now = datetime.datetime.now(datetime.timezone.utc).isoformat()
            with conn:
                with conn.cursor() as cur:
                    cur.execute("""
                        INSERT INTO users (id, email, full_name, role, company, tier, avatar_url, created_at, updated_at)
                        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                        ON CONFLICT (email) DO UPDATE SET
                            full_name = EXCLUDED.full_name,
                            role = EXCLUDED.role,
                            company = EXCLUDED.company,
                            tier = EXCLUDED.tier,
                            avatar_url = EXCLUDED.avatar_url,
                            updated_at = EXCLUDED.updated_at;
                    """, (
                        user["id"],
                        user["email"],
                        user.get("full_name", ""),
                        user.get("role", "Cloud Architect"),
                        user.get("company", "Independent"),
                        user.get("tier", "pro"),
                        user.get("avatar_url", f"https://api.dicebear.com/7.x/shapes/svg?seed={user['email']}"),
                        user.get("created_at", now),
                        user.get("updated_at", now)
                    ))
            return True
        except Exception as e:
            logger.error(f"Error saving user to RDS: {e}")
            return False
        finally:
            conn.close()

db_service = DatabaseService()
