"""
Supabase Integration Service
Handles database operations, authentication, and storage
"""

import os
from typing import Optional, List, Dict, Any
from datetime import datetime
import logging

from supabase import create_client, Client
from postgrest.exceptions import APIError

logger = logging.getLogger("panopticon.services.supabase")

# Initialize Supabase Client
SUPABASE_URL = os.getenv("SUPABASE_URL", "https://dxprwhsiktlxgvfoihvz.supabase.co")
SUPABASE_KEY = os.getenv("SUPABASE_ANON_KEY")

if not SUPABASE_KEY:
    raise ValueError("SUPABASE_ANON_KEY environment variable is required")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)


class SupabaseService:
    """Service for Supabase database operations"""

    @staticmethod
    async def get_cases(
        user_id: str,
        status: Optional[str] = None,
        limit: int = 50,
        offset: int = 0
    ) -> Dict[str, Any]:
        """
        Retrieve cases for a user
        """
        try:
            query = supabase.table("cases").select("*").eq("created_by", user_id)

            if status:
                query = query.eq("status", status)

            response = query.order("created_at", desc=True).range(offset, offset + limit - 1).execute()
            return {"data": response.data, "count": len(response.data), "error": None}
        except APIError as e:
            logger.error(f"Error fetching cases: {e}")
            return {"data": [], "count": 0, "error": str(e)}

    @staticmethod
    async def get_case_by_id(case_id: str, user_id: str) -> Dict[str, Any]:
        """
        Retrieve a specific case
        """
        try:
            response = (
                supabase.table("cases")
                .select("*")
                .eq("id", case_id)
                .eq("created_by", user_id)
                .single()
                .execute()
            )
            return {"data": response.data, "error": None}
        except APIError as e:
            logger.error(f"Error fetching case {case_id}: {e}")
            return {"data": None, "error": str(e)}

    @staticmethod
    async def create_case(
        title: str,
        description: str,
        user_id: str,
        priority: str = "medium",
        tags: Optional[List[str]] = None,
    ) -> Dict[str, Any]:
        """
        Create a new case
        """
        try:
            data = {
                "title": title,
                "description": description,
                "created_by": user_id,
                "status": "open",
                "priority": priority,
                "tags": tags or [],
                "created_at": datetime.utcnow().isoformat(),
                "updated_at": datetime.utcnow().isoformat(),
            }

            response = supabase.table("cases").insert(data).execute()
            logger.info(f"Case created: {response.data[0]['id']}")
            return {"data": response.data[0], "error": None}
        except APIError as e:
            logger.error(f"Error creating case: {e}")
            return {"data": None, "error": str(e)}

    @staticmethod
    async def update_case(
        case_id: str,
        updates: Dict[str, Any],
        user_id: str,
    ) -> Dict[str, Any]:
        """
        Update a case
        """
        try:
            updates["updated_at"] = datetime.utcnow().isoformat()

            response = (
                supabase.table("cases")
                .update(updates)
                .eq("id", case_id)
                .eq("created_by", user_id)
                .execute()
            )
            return {"data": response.data[0] if response.data else None, "error": None}
        except APIError as e:
            logger.error(f"Error updating case: {e}")
            return {"data": None, "error": str(e)}

    @staticmethod
    async def delete_case(case_id: str, user_id: str) -> Dict[str, Any]:
        """
        Delete a case
        """
        try:
            supabase.table("cases").delete().eq("id", case_id).eq(
                "created_by", user_id
            ).execute()
            logger.info(f"Case deleted: {case_id}")
            return {"error": None}
        except APIError as e:
            logger.error(f"Error deleting case: {e}")
            return {"error": str(e)}

    @staticmethod
    async def get_evidence_for_case(case_id: str, limit: int = 100) -> Dict[str, Any]:
        """
        Retrieve evidence for a case
        """
        try:
            response = (
                supabase.table("evidence")
                .select("*")
                .eq("case_id", case_id)
                .order("created_at", desc=True)
                .limit(limit)
                .execute()
            )
            return {"data": response.data, "count": len(response.data), "error": None}
        except APIError as e:
            logger.error(f"Error fetching evidence: {e}")
            return {"data": [], "count": 0, "error": str(e)}

    @staticmethod
    async def create_evidence(
        case_id: str,
        title: str,
        evidence_type: str,
        url: str,
        size: int,
        tags: Optional[List[str]] = None,
    ) -> Dict[str, Any]:
        """
        Create evidence record
        """
        try:
            data = {
                "case_id": case_id,
                "title": title,
                "type": evidence_type,
                "url": url,
                "size": size,
                "tags": tags or [],
                "analysis_results": {},
                "created_at": datetime.utcnow().isoformat(),
            }

            response = supabase.table("evidence").insert(data).execute()
            logger.info(f"Evidence created: {response.data[0]['id']}")
            return {"data": response.data[0], "error": None}
        except APIError as e:
            logger.error(f"Error creating evidence: {e}")
            return {"data": None, "error": str(e)}

    @staticmethod
    async def update_evidence_analysis(
        evidence_id: str,
        analysis_results: Dict[str, Any],
    ) -> Dict[str, Any]:
        """
        Update evidence analysis results
        """
        try:
            response = (
                supabase.table("evidence")
                .update({
                    "analysis_results": analysis_results,
                    "updated_at": datetime.utcnow().isoformat(),
                })
                .eq("id", evidence_id)
                .execute()
            )
            return {"data": response.data[0] if response.data else None, "error": None}
        except APIError as e:
            logger.error(f"Error updating evidence: {e}")
            return {"data": None, "error": str(e)}

    @staticmethod
    async def upload_file_to_storage(
        file_path: str,
        bucket: str = "evidence",
    ) -> Dict[str, Any]:
        """
        Upload file to Supabase Storage
        """
        try:
            with open(file_path, "rb") as f:
                file_data = f.read()

            response = supabase.storage.from_(bucket).upload(file_path, file_data)
            logger.info(f"File uploaded: {file_path}")

            public_url = supabase.storage.from_(bucket).get_public_url(file_path)
            return {"url": public_url, "error": None}
        except Exception as e:
            logger.error(f"Error uploading file: {e}")
            return {"url": None, "error": str(e)}

    @staticmethod
    async def delete_file_from_storage(
        file_path: str,
        bucket: str = "evidence",
    ) -> Dict[str, Any]:
        """
        Delete file from Supabase Storage
        """
        try:
            supabase.storage.from_(bucket).remove([file_path])
            logger.info(f"File deleted: {file_path}")
            return {"error": None}
        except Exception as e:
            logger.error(f"Error deleting file: {e}")
            return {"error": str(e)}

    @staticmethod
    async def search_cases(
        query: str,
        user_id: str,
        limit: int = 50,
    ) -> Dict[str, Any]:
        """
        Search cases by title or description
        """
        try:
            # Supabase full-text search
            response = (
                supabase.table("cases")
                .select("*")
                .eq("created_by", user_id)
                .ilike("title", f"%{query}%")
                .limit(limit)
                .execute()
            )

            # Also search description
            desc_results = (
                supabase.table("cases")
                .select("*")
                .eq("created_by", user_id)
                .ilike("description", f"%{query}%")
                .limit(limit)
                .execute()
            )

            # Combine results and remove duplicates
            combined = {item["id"]: item for item in response.data + desc_results.data}

            return {"data": list(combined.values()), "error": None}
        except APIError as e:
            logger.error(f"Error searching cases: {e}")
            return {"data": [], "error": str(e)}

    @staticmethod
    async def get_user_stats(user_id: str) -> Dict[str, Any]:
        """
        Get user statistics
        """
        try:
            cases_response = (
                supabase.table("cases")
                .select("id", count="exact")
                .eq("created_by", user_id)
                .execute()
            )

            evidence_response = (
                supabase.table("evidence")
                .select("id", count="exact")
                .in_("case_id", [c["id"] for c in cases_response.data])
                .execute()
            )

            return {
                "total_cases": len(cases_response.data),
                "total_evidence": len(evidence_response.data),
                "error": None,
            }
        except APIError as e:
            logger.error(f"Error fetching user stats: {e}")
            return {"total_cases": 0, "total_evidence": 0, "error": str(e)}
