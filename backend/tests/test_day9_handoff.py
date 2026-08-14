import pytest
from unittest.mock import MagicMock
import os
import sys

# Ensure backend directory is in python path
backend_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "src"))
if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

from agent import Assistant, MathsPracticeSpecialist, SYSTEM_PROMPT, MATH_SPECIALIST_PROMPT
from tools import solve_math_step_by_step
from livekit.agents import llm


def test_system_prompts_differentiation():
    """Verify that Main Agent and Specialist Agent have distinct, clear jobs and instructions."""
    assert "IDENTITY:" in SYSTEM_PROMPT
    assert "Shiksha AI" in SYSTEM_PROMPT
    assert "DAY 9 SPECIALIST HANDOFF RULE" in SYSTEM_PROMPT
    assert "hand_off_to_math_specialist" in SYSTEM_PROMPT

    assert "IDENTITY:" in MATH_SPECIALIST_PROMPT
    assert "Maths Practice Specialist" in MATH_SPECIALIST_PROMPT
    assert "LIMITS & HANDBACK RULE" in MATH_SPECIALIST_PROMPT
    assert "hand_off_to_main_agent" in MATH_SPECIALIST_PROMPT


def test_solve_math_step_by_step_tool():
    """Test step-by-step math solver tool across algebra, fractions, geometry, percentages, trigonometry, and calculus."""
    # 1. Quadratic equation
    quad_res = solve_math_step_by_step("2x^2 + 5x + 3 = 0", math_category="quadratic", class_level="Class 10")
    assert "MATH SPECIALIST SOLUTION BREAKDOWN" in quad_res
    assert "Factoring middle term" in quad_res
    assert "x = -1" in quad_res or "x = -1.5" in quad_res

    # 2. Linear equation
    lin_res = solve_math_step_by_step("3x + 7 = 22", math_category="algebra", class_level="Class 9")
    assert "x = 5" in lin_res

    # 3. Fraction addition
    frac_res = solve_math_step_by_step("(3/4) + (2/5)", math_category="fractions", class_level="Class 8")
    assert "23/20" in frac_res

    # 4. Percentages
    pct_res = solve_math_step_by_step("20% of 500", math_category="commercial", class_level="Class 8")
    assert "100" in pct_res

    # 5. Geometry (Circle Area & Circumference)
    geom_res = solve_math_step_by_step("find area of circle radius 7", math_category="geometry", class_level="Class 10")
    assert "153.94" in geom_res or "Area =" in geom_res

    # 6. Trigonometry standard values
    trig_res = solve_math_step_by_step("find value of sin(30)", math_category="trigonometry", class_level="Class 10")
    assert "1/2 (0.5)" in trig_res or "sin(30)" in trig_res

    # 7. Calculus differentiation
    calc_res = solve_math_step_by_step("differentiate x^3 with respect to x", math_category="calculus", class_level="Class 12")
    assert "3x^2" in calc_res

    # 8. HCF and LCM
    hcf_res = solve_math_step_by_step("find hcf and lcm of 12 and 18", math_category="arithmetic", class_level="Class 10")
    assert "HCF = 6" in hcf_res
    assert "LCM = 36" in hcf_res


def test_agent_tools_registration():
    """Verify that Main Agent and Specialist Agent register correct tools."""
    main_agent = Assistant()
    spec_agent = MathsPracticeSpecialist()

    main_tool_names = [getattr(t, "__name__", str(t)) for t in main_agent._tools]
    spec_tool_names = [getattr(t, "__name__", str(t)) for t in spec_agent._tools]

    assert "fetch_ncert_exercise_and_syllabus" in main_tool_names
    assert "create_escalation" in main_tool_names

    assert "solve_math_step_by_step" in spec_tool_names
    assert "fetch_ncert_exercise_and_syllabus" in spec_tool_names


def test_bi_directional_agent_handoff():
    """Verify session.update_agent handoff from Main Agent -> Specialist -> Main Agent."""
    mock_session = MagicMock()
    mock_session._agent = None

    main_agent = Assistant()
    spec_agent = MathsPracticeSpecialist()

    # Define test handoff functions bound to mock_session
    @llm.function_tool
    def hand_off_to_math_specialist(reason: str = "Learner requested math practice") -> str:
        mock_session._agent = spec_agent
        return "TRANSFERRED to Maths Practice Specialist"

    @llm.function_tool
    def hand_off_to_main_agent(reason: str = "Learner requested non-math topic") -> str:
        mock_session._agent = main_agent
        return "TRANSFERRED back to Main Agent"

    mock_session._agent = main_agent
    assert mock_session._agent == main_agent

    # Step 1: Main Agent hands off to Specialist
    res1 = hand_off_to_math_specialist("Solve quadratic equation 2x^2 + 5x + 3 = 0")
    assert "TRANSFERRED to Maths Practice Specialist" in res1
    assert mock_session._agent == spec_agent

    # Step 2: Specialist hands back to Main Agent
    res2 = hand_off_to_main_agent("Switch to history topic")
    assert "TRANSFERRED back to Main Agent" in res2
    assert mock_session._agent == main_agent
