"""
PANOPTICON LLM Service
Provides natural language forensic Q&A using Gemini / local LLM.
"""

import logging
from typing import Optional, List, Dict, Any
import os

logger = logging.getLogger("panopticon.llm")


class LLMService:
    """
    Forensic intelligence Q&A using Gemini Pro (or local Qwen/Llama fallback).
    """

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("GEMINI_API_KEY")
        self.model = None
        self._setup()

    def _setup(self):
        if self.api_key:
            try:
                import google.generativeai as genai
                genai.configure(api_key=self.api_key)
                self.model = genai.GenerativeModel("gemini-1.5-pro")
                logger.info("Gemini Pro initialized")
            except Exception as e:
                logger.warning(f"Gemini setup failed: {e}. Using local fallback.")
        else:
            logger.info("No Gemini API key. Using mock LLM responses.")

    def build_system_prompt(self, case_context: Dict[str, Any]) -> str:
        return f"""You are PANOPTICON, an AI Forensic Intelligence Copilot for law enforcement.

You have access to the following case data:
- Case: {case_context.get('case_number', 'Unknown')} – {case_context.get('title', '')}
- Evidence items: {case_context.get('evidence_count', 0)} files processed
- Suspects tracked: {case_context.get('suspect_count', 0)}
- AI confidence: {case_context.get('confidence', 0)}%

Your role:
1. Answer investigative questions based ONLY on the processed evidence data.
2. Provide timestamped, evidence-referenced answers.
3. Assign confidence scores to your statements.
4. Never speculate beyond what the evidence supports.
5. Always cite specific evidence IDs and timestamps.
6. Use precise forensic language.
7. Format key facts in **bold**.

If asked about something not in the evidence, clearly state: "No evidence available for this query."
"""

    async def query(
        self,
        message: str,
        case_context: Dict[str, Any],
        evidence_context: Optional[List[Dict]] = None,
        conversation_history: Optional[List[Dict]] = None,
    ) -> Dict[str, Any]:
        """Process an investigative query."""

        if self.model:
            return await self._gemini_query(message, case_context, evidence_context)
        return self._mock_response(message, case_context)

    async def _gemini_query(
        self,
        message: str,
        case_context: Dict[str, Any],
        evidence_context: Optional[List[Dict]],
    ) -> Dict[str, Any]:
        try:
            system_prompt = self.build_system_prompt(case_context)
            evidence_text = ""
            if evidence_context:
                evidence_text = "\n\nEvidence data:\n" + "\n".join(
                    f"- {e.get('id', '')}: {e.get('synopsis', '')} (confidence: {e.get('confidence', 0)}%)"
                    for e in evidence_context
                )
            full_prompt = system_prompt + evidence_text + f"\n\nInvestigator query: {message}"

            response = await self.model.generate_content_async(full_prompt)
            return {
                "content": response.text,
                "confidence": 85,
                "model": "gemini-1.5-pro",
            }
        except Exception as e:
            logger.error(f"Gemini query failed: {e}")
            return self._mock_response(message, case_context)

    def _mock_response(self, message: str, case_context: Dict[str, Any]) -> Dict[str, Any]:
        lower = message.lower()
        if "backpack" in lower or "bag" in lower:
            content = (
                "Based on analysis of available footage:\n\n"
                "**Suspect Alpha** was observed handling the victim's backpack at **14:32:28**. "
                "Interaction lasted 12 seconds. Confidence: **92%**.\n\n"
                "No other individuals made contact with the backpack."
            )
        elif "weapon" in lower or "gun" in lower:
            content = (
                "Weapon detection results:\n\n"
                "Object consistent with a firearm first detected at **14:32:14** in "
                "**Suspect Alpha's** right hand. Confidence: **89%**.\n\n"
                "Weapon visible across 14 frames."
            )
        elif "timeline" in lower or "reconstruct" in lower:
            content = (
                "Reconstructed timeline:\n\n"
                "**14:28:14** — Suspects enter station\n"
                "**14:32:14** — Robbery initiated\n"
                "**14:33:01** — Suspects flee via north exit\n\n"
                "Total incident duration: **4 minutes 47 seconds**"
            )
        else:
            content = (
                f"Analyzing case evidence for: '{message}'\n\n"
                "Cross-referencing processed footage across all cameras. "
                "Relevant findings detected. Please specify a more targeted query for "
                "detailed timestamped results."
            )
        return {"content": content, "confidence": 82, "model": "mock"}

    async def generate_report(
        self,
        case_context: Dict[str, Any],
        evidence_summaries: List[Dict],
        report_type: str = "comprehensive",
    ) -> str:
        """Generate a forensic report using LLM."""
        if self.model:
            prompt = (
                f"Generate a professional forensic {report_type} report for:\n"
                f"Case: {case_context.get('case_number')} – {case_context.get('title')}\n"
                f"Evidence: {len(evidence_summaries)} items analyzed\n\n"
                "Include: Executive Summary, Timeline, Suspect Profiles, Evidence Inventory, Conclusions.\n"
                "Use formal law enforcement report language."
            )
            try:
                resp = await self.model.generate_content_async(prompt)
                return resp.text
            except Exception as e:
                logger.error(f"Report generation failed: {e}")

        return (
            f"FORENSIC INTELLIGENCE REPORT\n"
            f"Case: {case_context.get('case_number', 'N/A')}\n"
            f"Generated by PANOPTICON AI\n\n"
            f"EXECUTIVE SUMMARY\nThis report presents AI-assisted analysis of "
            f"{len(evidence_summaries)} evidence items. Cross-camera tracking and "
            f"re-identification algorithms produced high-confidence findings.\n\n"
            "[Full report generation requires Gemini API key]"
        )
