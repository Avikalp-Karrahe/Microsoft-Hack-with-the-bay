"""
SOP Rule Extractor

Parses a long SOP PDF document and extracts relevant rules based on a customer scenario.
Uses document parser to parse PDF and Gemini to extract relevant rules.
"""

import sys
import os

from app.services.document_parser import DocumentParser
import google.generativeai as genai
from typing import Dict, List, Any
import json


class SOPRuleExtractor:
    """
    Extracts relevant rules from SOP documents based on customer scenarios.
    """

    def __init__(self, gemini_api_key: str):
        """
        Initialize the SOPRuleExtractor.

        Args:
            gemini_api_key: Google Gemini API key
        """
        genai.configure(api_key=gemini_api_key)
        self.document_parser = DocumentParser()

    def parse_sop_pdf(self, pdf_path: str) -> tuple:
        """
        Parse SOP PDF document using DocumentParser.

        Args:
            pdf_path: Path to the SOP PDF file

        Returns:
            Tuple of (markdown_content, chunks)
        """
        print(f"Parsing SOP PDF: {pdf_path}")

        # Parse the PDF
        results = self.document_parser.parse_documents(
            path=os.path.dirname(pdf_path),
            pattern=os.path.basename(pdf_path)
        )

        # Get markdown and chunks
        markdown = self.document_parser.get_markdown(results)
        hunks = self.document_parser.get_all_chunks(results)

        print(f"Parsed {len(chunks)} chunks from SOP document")

        return markdown, chunks, results

    def read_scenario(self, scenario_path: str) -> str:
        """
        Read customer scenario from text file.

        Args:
            scenario_path: Path to the scenario text file

        Returns:
            Scenario content as string
        """
        print(f"Reading scenario from: {scenario_path}")

        with open(scenario_path, 'r', encoding='utf-8') as f:
            scenario = f.read()

        return scenario

    def find_relevant_chunks(self, scenario: str, chunks: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Use Gemini to identify which chunks are most relevant to the scenario.

        Args:
            scenario: Customer scenario description
            chunks: All chunks from SOP document

        Returns:
            List of relevant chunks with relevance scores
        """
        print("Identifying relevant chunks using Gemini...")

        # For very long documents, we need to process chunks in batches
        # First, let's create a summary of all chunks
        chunk_summaries = []
        for i, chunk in enumerate(chunks):
            chunk_summaries.append(f"Chunk {i}: {chunk['text'][:200]}...")  # First 200 chars

        # Use Gemini to identify relevant chunk indices
        prompt = f"""You are an expert at analyzing SOP (Standard Operating Procedure) documents for debt collection.

Given a customer scenario, identify which chunks from the SOP document are most relevant for handling this case.

Customer Scenario:
{scenario}

SOP Document Chunks (total: {len(chunks)}):
{chr(10).join(chunk_summaries[:100])}

Analyze the scenario and return a JSON array of chunk indices (numbers) that contain rules, procedures, or guidelines relevant to this scenario.

Return format:
{{
    "relevant_chunk_indices": [0, 5, 12, ...],
    "reasoning": "Brief explanation of why these chunks are relevant"
}}

Return ONLY valid JSON."""

        model = genai.GenerativeModel('gemini-2.0-flash-exp')

        response = model.generate_content(
            prompt,
            generation_config=genai.GenerationConfig(
                temperature=0.2,
                response_mime_type="application/json",
            )
        )

        try:
            result = json.loads(response.text)
            relevant_indices = result.get('relevant_chunk_indices', [])

            # Get the full chunks for these indices
            relevant_chunks = []
            for idx in relevant_indices:
                if 0 <= idx < len(chunks):
                    relevant_chunks.append(chunks[idx])

            print(f"Found {len(relevant_chunks)} relevant chunks")
            return relevant_chunks, result.get('reasoning', '')

        except json.JSONDecodeError:
            print("Warning: Failed to parse Gemini response for chunk selection")
            # Fallback: return first 20 chunks
            return chunks[:20], "Fallback: using first 20 chunks"

    def extract_conversation_rules(self, scenario: str, relevant_chunks: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Extract conversation rules for AI voice agent based on the scenario.

        Args:
            scenario: Customer scenario description
            relevant_chunks: Chunks identified as relevant

        Returns:
            Dictionary containing conversation rules with justifications
        """
        print("Extracting conversation rules for AI voice agent...")

        # Combine relevant chunks
        chunks_text = "\n\n".join([
            f"[Chunk {chunk['index']} - Pages {chunk.get('pages', [])}]\n{chunk['text']}"
            for chunk in relevant_chunks
        ])

        prompt = f"""You are a debt collection compliance expert. Extract rules and guidelines that an AI voice agent must follow when calling this borrower about their debt.

Customer Scenario:
{scenario}

Relevant SOP Document Sections:
{chunks_text}

Extract conversation rules in the following categories:

1. MANDATORY_ACTIONS: Actions the agent MUST take during the call
2. PROHIBITED_ACTIONS: Actions the agent MUST NOT take during the call
3. REQUIRED_DISCLOSURES: Information that must be disclosed to the borrower
4. COMMUNICATION_GUIDELINES: How the agent should communicate (tone, language, etc.)
5. COMPLIANCE_REQUIREMENTS: Legal or regulatory requirements to follow
6. ESCALATION_TRIGGERS: Situations that require human intervention

For EACH rule, provide:
{{
  "rule": "Clear, actionable statement of the rule",
  "justification": "Why this rule applies (reference to SOP section/chunk)",
  "source_chunk": chunk_index,
  "sop_reference": "Exact quote from SOP that supports this rule"
}}

Return a JSON object with clear separation between rules and their justifications."""

        model = genai.GenerativeModel('gemini-2.0-flash-exp')

        response = model.generate_content(
            prompt,
            generation_config=genai.GenerationConfig(
                temperature=0.1,
                response_mime_type="application/json",
            )
        )

        try:
            rules = json.loads(response.text)
            return rules
        except json.JSONDecodeError:
            return {
                "extraction_error": "Failed to parse Gemini response",
                "raw_response": response.text
            }

    def generate_payment_options(self, scenario: str, relevant_chunks: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Generate compliant payment options based on SOP rules.

        Args:
            scenario: Customer scenario description
            relevant_chunks: Chunks identified as relevant

        Returns:
            Dictionary containing payment options with SOP compliance justifications
        """
        print("Generating SOP-compliant payment options...")

        # Combine relevant chunks
        chunks_text = "\n\n".join([
            f"[Chunk {chunk['index']} - Pages {chunk.get('pages', [])}]\n{chunk['text']}"
            for chunk in relevant_chunks
        ])

        prompt = f"""You are a debt collection compliance expert. Generate payment options for this customer that comply with SOP rules.

Customer Scenario:
{scenario}

Relevant SOP Document Sections:
{chunks_text}

Generate 3-5 payment options that comply with SOP guidelines. For EACH option, provide:

{{
  "option_name": "Clear name (e.g., 'Lump Sum Settlement', 'Short-term Payment Plan')",
  "description": "Detailed description of the payment option",
  "payment_schedule": {{
    "frequency": "weekly/bi-weekly/monthly",
    "duration_months": number,
    "payment_amount": number or "variable",
    "total_amount": number
  }},
  "discounts_or_fees": {{
    "settlement_discount": "percentage or null",
    "late_fees": "description or null",
    "interest_rate": "percentage or null"
  }},
  "eligibility_criteria": ["List of criteria customer must meet"],
  "sop_compliance": {{
    "applicable_rules": ["List of SOP rules this option complies with"],
    "source_chunks": [chunk_indices],
    "justification": "Why this option is compliant with SOP"
  }},
  "agent_talking_points": ["Key points agent should mention when presenting this option"]
}}

Ensure each option is clearly justified by SOP rules. Return a JSON object with payment_options array."""

        model = genai.GenerativeModel('gemini-2.0-flash-exp')

        response = model.generate_content(
            prompt,
            generation_config=genai.GenerationConfig(
                temperature=0.2,
                response_mime_type="application/json",
            )
        )

        try:
            options = json.loads(response.text)
            return options
        except json.JSONDecodeError:
            return {
                "extraction_error": "Failed to parse Gemini response",
                "raw_response": response.text
            }

    def process(self, sop_pdf_path: str, scenario_path: str) -> Dict[str, Any]:
        """
        Main workflow: parse SOP PDF, read scenario, extract conversation rules and payment options.

        Args:
            sop_pdf_path: Path to SOP PDF document
            scenario_path: Path to scenario text file

        Returns:
            Dictionary containing scenario, conversation rules, and payment options for AI voice agent
        """
        try:
            # Step 1: Parse SOP PDF
            markdown, chunks, results = self.parse_sop_pdf(sop_pdf_path)

            # Step 2: Read scenario
            scenario = self.read_scenario(scenario_path)

            # Step 3: Find relevant chunks
            relevant_chunks, reasoning = self.find_relevant_chunks(scenario, chunks)

            # Step 4: Extract conversation rules for AI voice agent
            conversation_rules = self.extract_conversation_rules(scenario, relevant_chunks)

            # Step 5: Generate SOP-compliant payment options
            payment_options = self.generate_payment_options(scenario, relevant_chunks)

            return {
                "success": True,
                "scenario": scenario,
                "sop_summary": {
                    "total_chunks": len(chunks),
                    "relevant_chunks_count": len(relevant_chunks),
                    "chunk_selection_reasoning": reasoning
                },
                "conversation_rules": conversation_rules,
                "payment_options": payment_options,
                "error": None
            }

        except Exception as e:
            import traceback
            return {
                "success": False,
                "scenario": None,
                "sop_summary": None,
                "conversation_rules": None,
                "payment_options": None,
                "error": str(e),
                "traceback": traceback.format_exc()
            }


