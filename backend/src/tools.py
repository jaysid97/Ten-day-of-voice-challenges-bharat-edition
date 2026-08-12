import datetime
import json
import logging
import os
import urllib.request
import urllib.parse
from livekit.agents import llm
from db import get_most_recent_user_profile, get_user_profile, save_human_help_request

logger = logging.getLogger("agent.tools")

# Extensive Multi-Subject & Multi-Language Curriculum Dataset for Offline Fallbacks
CURRICULUM_DATASET = {
    "math": {
        "fractions": {
            "title": "Class 8 Mathematics: Fractions & Decimals",
            "concept": "A fraction represents a part of a whole. In a fraction a/b, 'a' is numerator and 'b' is denominator.",
            "exercise": "Solve: What is (3/4) + (2/5)? Hint: Common denominator is 20.",
            "answer": "19/20",
        },
        "algebra": {
            "title": "Class 9 Mathematics: Linear Equations",
            "concept": "Algebraic equations solve for unknown variables by balancing both sides of the equal sign.",
            "exercise": "Solve for x: 3x + 7 = 22.",
            "answer": "x = 5",
        },
        "calculus": {
            "title": "Class 11/12 Mathematics: Derivatives & Differentiation",
            "concept": "The derivative measures the instantaneous rate of change of a function with respect to a variable.",
            "exercise": "What is the derivative of f(x) = x^2 with respect to x?",
            "answer": "f'(x) = 2x",
        },
    },
    "science": {
        "photosynthesis": {
            "title": "Class 7 Science: Nutrition in Plants",
            "concept": "Photosynthesis is how green plants convert solar energy, water, and CO2 into glucose and oxygen.",
            "exercise": "Which green pigment traps solar energy during photosynthesis?",
            "answer": "Chlorophyll",
        },
        "gravity": {
            "title": "Class 9 Physics: Gravitation & Laws of Motion",
            "concept": "Universal law of gravitation states every particle attracts every other particle with force proportional to mass product.",
            "exercise": "What is the acceleration due to gravity (g) on Earth's surface?",
            "answer": "9.8 m/s^2",
        },
        "chemistry": {
            "title": "Class 10 Chemistry: Acids, Bases & Periodic Table",
            "concept": "The pH scale measures acidity or alkalinity from 0 (strong acid) to 14 (strong base), with 7 being neutral.",
            "exercise": "What is the pH value of pure distilled water at room temperature?",
            "answer": "7 (Neutral)",
        },
    },
    "history": {
        "freedom": {
            "title": "Indian History: Freedom Movement & Dandi March",
            "concept": "The Salt Satyagraha of 1930 led by Mahatma Gandhi was a major nonviolent civil disobedience campaign.",
            "exercise": "In which year did Mahatma Gandhi lead the historic Dandi Salt March?",
            "answer": "1930",
        },
        "indus": {
            "title": "Ancient History: Indus Valley Civilization",
            "concept": "Harappa and Mohenjo-daro featured advanced urban planning, grid street patterns, and sophisticated drainage systems.",
            "exercise": "Which ancient civilization was famous for the 'Great Bath' structure?",
            "answer": "Mohenjo-daro (Indus Valley Civilization)",
        },
    },
    "coding": {
        "python": {
            "title": "Computer Science: Python Programming Basics",
            "concept": "Functions in Python are defined using the 'def' keyword and return values using 'return'.",
            "exercise": "Write a 1-line Python lambda function to square a number x.",
            "answer": "square = lambda x: x ** 2",
        },
        "loops": {
            "title": "Computer Science: Control Flow & Iteration",
            "concept": "For loops iterate over sequences (lists, ranges, tuples) executing code repeatedly.",
            "exercise": "What will `list(range(1, 5))` evaluate to in Python?",
            "answer": "[1, 2, 3, 4]",
        },
    },
}

LANGUAGE_LESSONS_DATASET = {
    "hindi": {
        "beginner": {
            "script": "Devanagari (देवनागरी)",
            "greetings": "नमस्ते (Namaste - Hello), धन्यवाद (Dhanyavaad - Thank you), आपका स्वागत है (Welcome)",
            "grammar": "Hindi uses Subject-Object-Verb (SOV) word order. Nouns have masculine or feminine gender.",
            "phrase_exercise": "Translate to Hindi: 'My name is Ramesh.'",
            "solution": "मेरा नाम रमेश है। (Mera naam Ramesh hai)",
        },
    },
    "sanskrit": {
        "beginner": {
            "script": "Devanagari (देवनागरी)",
            "greetings": "नमो नमः (Namo Namah - Greetings), धन्यवादः (Dhanyavaadah - Thank you)",
            "grammar": "Sanskrit features 8 cases (विभक्ति), 3 numbers (एकवचन, द्विवचन, बहुवचन), and 3 genders.",
            "phrase_exercise": "Translate to Sanskrit: 'Knowledge gives humility.'",
            "solution": "विद्या ददाति विनयं (Vidya dadati vinayam)",
        },
    },
    "tamil": {
        "beginner": {
            "script": "Tamil Script (தமிழ்)",
            "greetings": "வணக்கம் (Vanakkam - Hello), நன்றி (Nandri - Thank you)",
            "grammar": "Tamil is an agglutinative language with Subject-Object-Verb word order.",
            "phrase_exercise": "Translate to Tamil: 'How are you?'",
            "solution": "நீங்கள் எப்படி இருக்கிறீர்கள்? (Neengal eppadi irukkeereegal?)",
        },
    },
    "french": {
        "beginner": {
            "script": "Latin Script with Accents (é, è, à, ç)",
            "greetings": "Bonjour (Hello), Merci (Thank you), Au revoir (Goodbye)",
            "grammar": "French nouns have grammatical gender (masculine/feminine) with articles 'le' and 'la'.",
            "phrase_exercise": "Translate to French: 'My name is Alex.'",
            "solution": "Je m'appelle Alex.",
        },
    },
    "spanish": {
        "beginner": {
            "script": "Latin Script with Ñ, Á, É, Í, Ó, Ú",
            "greetings": "¡Hola! (Hello), Gracias (Thank you), ¿Cómo estás? (How are you?)",
            "grammar": "Spanish verbs conjugate by person (yo, tú, él/ella, nosotros) across tenses.",
            "phrase_exercise": "Translate to Spanish: 'Thank you very much.'",
            "solution": "Muchas gracias.",
        },
    },
}


@llm.function_tool
def fetch_ncert_exercise_and_syllabus(
    subject: str,
    topic: str,
    class_level: str = "",
    user_id_or_name: str = "",
) -> str:
    """Fetch educational syllabus summary and practice exercises for ANY school/college subject.

    Supports ALL subjects: Math, Science, Physics, Chemistry, Biology, History, Geography, Civics, Economics, Computer Science / Coding, Literature, General Knowledge, etc.
    Chain tool feature: Auto-populates grade level from Day 4 SQLite memory if omitted!

    Args:
        subject: Any academic subject (e.g. 'Math', 'Science', 'History', 'Coding', 'Physics').
        topic: Specific topic or chapter (e.g. 'fractions', 'photosynthesis', 'freedom', 'python').
        class_level: Optional grade level (e.g. 'Class 8', 'Class 10'). If empty, reads from saved profile.
        user_id_or_name: Optional user name or ID to auto-fetch saved grade level from memory.
    """
    timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    # Day 4 Tool Chaining: Auto-lookup user profile if class_level is missing
    chained_info = ""
    if not class_level:
        profile = None
        if user_id_or_name:
            profile = get_user_profile(user_id_or_name)
        if not profile:
            profile = get_most_recent_user_profile()

        if profile:
            facts = profile.get("facts", {})
            class_level = facts.get("current_level", "General Education")
            learner_name = profile.get("name", "Learner")
            chained_info = f"[Auto-Chained from Day 4 Memory for {learner_name}: {class_level}] "
        else:
            class_level = "General Education"

    clean_subj = subject.strip().lower()
    clean_topic = topic.strip().lower()

    # Step 2: Attempt Live Data Fetch from Educational API (Wikipedia REST API)
    live_url = f"https://en.wikipedia.org/api/rest_v1/page/summary/{urllib.parse.quote(clean_topic)}"
    req = urllib.request.Request(
        live_url,
        headers={"User-Agent": "ShikshaAI-VoiceAgent/1.0 (EdTech Bharat Challenge)"},
    )

    try:
        logger.info(f"Connecting to Live Educational API for {subject} topic '{clean_topic}'...")
        with urllib.request.urlopen(req, timeout=3) as resp:
            if resp.status == 200:
                data = json.loads(resp.read().decode("utf-8"))
                title = data.get("title", topic.capitalize())
                extract = data.get("extract", "No extract available.")

                subj_dataset = CURRICULUM_DATASET.get(clean_subj, {})
                topic_data = subj_dataset.get(clean_topic, {})
                exercise = topic_data.get(
                    "exercise",
                    f"Practice Exercise ({subject.capitalize()}): Explain the key principles of {title} in 2 simple sentences.",
                )

                return (
                    f"STATUS: LIVE DATA FETCH SUCCESS\n"
                    f"Timestamp: Sourced live as of today ({timestamp})\n"
                    f"Target Level: {chained_info}{class_level}\n"
                    f"Subject: {subject.capitalize()}\n"
                    f"Topic Title: {title}\n"
                    f"Core Concept: {extract[:250]}...\n"
                    f"Practice Exercise: {exercise}\n"
                    f"Note for Agent: Speak this concept naturally in 1-2 friendly sentences with the practice problem."
                )
    except Exception as e:
        logger.warning(f"Live Educational API fetch failed for '{clean_topic}': {e}. Triggering Graceful Out-Loud Fallback.")

    # Step 4: Graceful Out-Loud Failure Path
    subj_dataset = CURRICULUM_DATASET.get(clean_subj, CURRICULUM_DATASET["math"])
    matched_data = None
    for key, data in subj_dataset.items():
        if key in clean_topic or clean_topic in key:
            matched_data = data
            break

    if not matched_data:
        matched_data = list(subj_dataset.values())[0]

    return (
        f"STATUS: LIVE SOURCE UNREACHABLE (GRACEFUL FALLBACK ACTIVE)\n"
        f"Timestamp: Cached Curriculum Dataset (Retrieved {timestamp})\n"
        f"Target Level: {chained_info}{class_level}\n"
        f"Subject: {subject.capitalize()}\n"
        f"Spoken Failure State: 'The live educational network connection timed out, but here is the offline curriculum lesson for {clean_topic}.'\n"
        f"Title: {matched_data['title']}\n"
        f"Concept: {matched_data['concept']}\n"
        f"Practice Exercise: {matched_data['exercise']}\n"
        f"Answer Key: {matched_data['answer']}\n"
        f"Note for Agent: Explicitly mention out loud that the live server was unreachable, then share the offline exercise naturally."
    )


@llm.function_tool
def fetch_language_lesson_and_vocabulary(
    language: str,
    topic_or_level: str = "beginner",
    user_id_or_name: str = "",
) -> str:
    """Fetch language learning lessons, script guides, vocabulary, and spoken practice exercises for ANY language.

    Supports ANY language: Hindi, Sanskrit, Tamil, Telugu, Marathi, Gujarati, Bengali, Punjabi, Kannada, Malayalam, English, French, Spanish, German, Japanese, etc.

    Args:
        language: Language to learn (e.g. 'Hindi', 'Sanskrit', 'Tamil', 'French', 'Spanish', 'English').
        topic_or_level: Topic or level (e.g. 'beginner', 'greetings', 'grammar', 'verbs').
        user_id_or_name: Optional user name or ID to auto-fetch saved profile memory.
    """
    timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    clean_lang = language.strip().lower()
    clean_level = topic_or_level.strip().lower()

    # Day 4 Tool Chaining: Auto-lookup user profile if user_id_or_name provided
    chained_info = ""
    profile = get_user_profile(user_id_or_name) if user_id_or_name else get_most_recent_user_profile()
    if profile:
        learner_name = profile.get("name", "Learner")
        chained_info = f"[Tailored for Learner: {learner_name}] "

    # Attempt Live Dictionary / Language Lookup
    live_url = f"https://en.wikipedia.org/api/rest_v1/page/summary/{urllib.parse.quote(clean_lang + ' language')}"
    req = urllib.request.Request(
        live_url,
        headers={"User-Agent": "ShikshaAI-VoiceAgent/1.0 (EdTech Bharat Challenge)"},
    )

    lang_data = LANGUAGE_LESSONS_DATASET.get(clean_lang, {}).get("beginner")

    try:
        logger.info(f"Connecting to Live Language API for '{clean_lang}'...")
        with urllib.request.urlopen(req, timeout=3) as resp:
            if resp.status == 200:
                data = json.loads(resp.read().decode("utf-8"))
                title = data.get("title", language.capitalize())
                extract = data.get("extract", f"Learning lesson for {title}.")

                greetings = lang_data.get("greetings") if lang_data else "Basic vocabulary & key phrases"
                exercise = lang_data.get("phrase_exercise") if lang_data else f"Try saying a simple greeting in {language.capitalize()}!"

                return (
                    f"STATUS: LIVE LANGUAGE FETCH SUCCESS\n"
                    f"Timestamp: Sourced live as of today ({timestamp})\n"
                    f"Target Language: {chained_info}{language.capitalize()}\n"
                    f"Language Overview: {extract[:220]}...\n"
                    f"Key Greetings/Vocab: {greetings}\n"
                    f"Spoken Practice Exercise: {exercise}\n"
                    f"Note for Agent: Speak the language lesson and practice phrase clearly and encouragingly."
                )
    except Exception as e:
        logger.warning(f"Live Language API fetch failed for '{clean_lang}': {e}. Triggering Graceful Out-Loud Fallback.")

    if not lang_data:
        lang_data = {
            "script": f"{language.capitalize()} Script",
            "greetings": f"Greetings and common expressions in {language.capitalize()}",
            "grammar": f"{language.capitalize()} sentence structure and pronunciation rules.",
            "phrase_exercise": f"Can you pronounce a basic phrase in {language.capitalize()}?",
            "solution": "Great effort!",
        }

    return (
        f"STATUS: LIVE LANGUAGE SOURCE UNREACHABLE (GRACEFUL FALLBACK ACTIVE)\n"
        f"Timestamp: Offline Language Dataset ({timestamp})\n"
        f"Target Language: {chained_info}{language.capitalize()}\n"
        f"Spoken Failure State: 'The live language server timed out, but here is your offline {language.capitalize()} lesson.'\n"
        f"Script & Structure: {lang_data['script']}\n"
        f"Essential Greetings: {lang_data['greetings']}\n"
        f"Spoken Exercise: {lang_data['phrase_exercise']}\n"
        f"Answer/Solution: {lang_data.get('solution', 'N/A')}\n"
        f"Note for Agent: Explicitly state out loud that the live language server timed out, then teach the lesson warmly."
    )


@llm.function_tool
def fetch_subject_quiz_and_solution(
    subject: str,
    topic: str,
    difficulty: str = "medium",
) -> str:
    """Fetch educational practice quizzes, step-by-step solutions, and concept breakdowns for any subject.

    Args:
        subject: The academic subject (e.g. 'Math', 'Science', 'History', 'Coding', 'Economics').
        topic: Specific topic or chapter (e.g. 'algebra', 'gravity', 'python', 'freedom').
        difficulty: Difficulty level ('easy', 'medium', 'hard').
    """
    timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    clean_subj = subject.strip().lower()
    clean_topic = topic.strip().lower()

    subj_dataset = CURRICULUM_DATASET.get(clean_subj, CURRICULUM_DATASET["math"])
    matched = subj_dataset.get(clean_topic)

    if not matched:
        for k, v in subj_dataset.items():
            if k in clean_topic or clean_topic in k:
                matched = v
                break
    if not matched:
        matched = list(subj_dataset.values())[0]

    return (
        f"STATUS: SUBJECT QUIZ GENERATED\n"
        f"Timestamp: Sourced today ({timestamp})\n"
        f"Subject: {subject.capitalize()} | Difficulty: {difficulty.capitalize()}\n"
        f"Quiz Title: {matched['title']}\n"
        f"Quiz Question: {matched['exercise']}\n"
        f"Step-by-Step Hint: {matched['concept']}\n"
        f"Solution: {matched['answer']}\n"
        f"Note for Agent: Ask the user the quiz question aloud, wait for their attempt, and give supportive feedback."
    )


@llm.function_tool
def lookup_word_meaning_and_origin(word: str) -> str:
    """Look up definition, phonetics, part of speech, and origin for an English or vocabulary word.

    Use when learner asks for word meanings, vocabulary practice, or pronunciation.

    Args:
        word: The word to look up (e.g. 'fraction', 'photosynthesis', 'curiosity').
    """
    timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    clean_word = word.strip().lower()

    live_url = f"https://api.dictionaryapi.dev/api/v2/entries/en/{urllib.parse.quote(clean_word)}"
    req = urllib.request.Request(
        live_url,
        headers={"User-Agent": "ShikshaAI-VoiceAgent/1.0 (EdTech Bharat Challenge)"},
    )

    try:
        logger.info(f"Connecting to Live Dictionary API for word '{clean_word}'...")
        with urllib.request.urlopen(req, timeout=3) as resp:
            if resp.status == 200:
                data = json.loads(resp.read().decode("utf-8"))
                entry = data[0]
                word_str = entry.get("word", clean_word)
                phonetic = entry.get("phonetic", "")
                meanings = entry.get("meanings", [])

                def_text = "No definition found."
                part_of_speech = "noun"
                if meanings:
                    part_of_speech = meanings[0].get("partOfSpeech", "noun")
                    defs = meanings[0].get("definitions", [])
                    if defs:
                        def_text = defs[0].get("definition", def_text)

                return (
                    f"STATUS: LIVE DICTIONARY FETCH SUCCESS\n"
                    f"Timestamp: Sourced live as of today ({timestamp})\n"
                    f"Word: {word_str} ({part_of_speech})\n"
                    f"Phonetic: {phonetic}\n"
                    f"Definition: {def_text}\n"
                    f"Note for Agent: State the word definition clearly in 1 short spoken sentence."
                )
    except Exception as e:
        logger.warning(f"Live Dictionary API fetch failed for '{clean_word}': {e}. Triggering Graceful Out-Loud Fallback.")

    # Graceful failure path
    return (
        f"STATUS: LIVE DICTIONARY UNREACHABLE (GRACEFUL FALLBACK ACTIVE)\n"
        f"Timestamp: Offline Vocabulary Fallback ({timestamp})\n"
        f"Spoken Failure State: 'I could not reach the live dictionary service, but let me explain {clean_word} for you.'\n"
        f"Word: {clean_word}\n"
        f"Definition: {clean_word.capitalize()} is an important key term used in your school lessons.\n"
        f"Note for Agent: State out loud that the live dictionary timed out, and give a simple definition."
    )


# -----------------------------------------------------------------------------
# Day 7: Human-in-the-Loop Escalation Tool & Discord Webhook Integration
# -----------------------------------------------------------------------------

def send_discord_webhook(ticket_data: dict) -> bool:
    """Send formatted markdown embed card of human help request to Discord Webhook if configured."""
    webhook_url = os.getenv("DISCORD_WEBHOOK_URL", "").strip()
    if not webhook_url:
        logger.info("No DISCORD_WEBHOOK_URL configured. Skipping Discord notification.")
        return False

    ref_id = ticket_data.get("ref_id", "REF-UNKNOWN")
    caller_name = ticket_data.get("caller_name", "Learner")
    urgency = str(ticket_data.get("urgency", "medium")).upper()
    
    color_map = {
        "EMERGENCY": 15158332,
        "HIGH": 15105570,
        "MEDIUM": 3447003,
        "LOW": 3066993,
    }
    embed_color = color_map.get(urgency, 3447003)

    payload = {
        "username": "Shiksha AI Escalation Desk",
        "avatar_url": "https://cdn-icons-png.flaticon.com/512/3429/3429149.png",
        "embeds": [
            {
                "title": f"Human Help Request: {ref_id} [{urgency}]",
                "description": f"Learner {caller_name} requires human teacher assistance.",
                "color": embed_color,
                "fields": [
                    {"name": "Caller Name", "value": caller_name, "inline": True},
                    {"name": "Contact / Language", "value": f"{ticket_data.get('contact_info', 'N/A')} ({ticket_data.get('preferred_language', 'Hindi')})", "inline": True},
                    {"name": "Escalation Reason", "value": ticket_data.get("reason_category", "Teacher Help Needed"), "inline": False},
                    {"name": "Issue Description", "value": ticket_data.get("issue_description", "N/A"), "inline": False},
                    {"name": "What Agent Checked", "value": ticket_data.get("agent_checked", "N/A"), "inline": False},
                    {"name": "Preferred Follow-up", "value": f"{ticket_data.get('preferred_contact_method', 'Phone Call')} (2-4 hrs timeline)", "inline": True},
                ],
                "footer": {"text": f"Status: {ticket_data.get('status', 'OPEN')} | 10 Days of Voice Agents (Day 7)"},
                "timestamp": datetime.datetime.now().isoformat(),
            }
        ],
    }

    try:
        req = urllib.request.Request(
            webhook_url,
            data=json.dumps(payload).encode("utf-8"),
            headers={"Content-Type": "application/json", "User-Agent": "ShikshaAI/1.0"},
            method="POST",
        )
        with urllib.request.urlopen(req, timeout=4) as resp:
            if resp.status in (200, 204):
                logger.info(f"Successfully posted escalation ticket {ref_id} to Discord Webhook.")
                return True
    except Exception as e:
        logger.warning(f"Failed to post escalation ticket {ref_id} to Discord Webhook: {e}")

    return False


@llm.function_tool
def create_escalation(
    caller_name: str,
    reason_category: str,
    issue_description: str,
    agent_checked: str,
    contact_info: str = "+919876543210",
    urgency: str = "medium",
    preferred_language: str = "Hindi",
    preferred_contact_method: str = "Phone Call",
    user_consent_granted: bool = True,
    db_path: str = None,
) -> str:
    """Escalate a learner problem to a human teacher by creating an official support request ticket.

    CRITICAL MANDATORY RULE: You MUST explicitly ask the caller for permission BEFORE invoking this tool.

    Escalation Reasons (Pick one):
    1. Frustrated Learner / Teacher Help Needed: The learner is upset, stuck repeatedly, or explicitly requests human teacher guidance.
    2. Exam, Certificate, or Policy Dispute: The caller reports errors in official CBSE exam hall tickets, marks re-checking disputes, or fee/scholarship issues.

    Args:
        caller_name: Name of the caller or learner.
        reason_category: Escalation reason category.
        issue_description: Short, precise summary of what happened and what help is needed.
        agent_checked: Summary of what the AI agent already tried or checked during the call.
        contact_info: Learner contact phone number or email address for follow-up.
        urgency: Urgency level (low, medium, high, emergency).
        preferred_language: Preferred language for human follow-up.
        preferred_contact_method: Preferred follow-up method (Phone Call, WhatsApp, Email).
        user_consent_granted: Must be True if the caller explicitly gave permission to share their details.
        db_path: Optional custom database path.
    """
    if not user_consent_granted:
        return (
            "ERROR: CONSENT NOT GRANTED BY CALLER.\n"
            "You cannot create a human help ticket without explicit user permission.\n"
            "Spoken Response to Caller: Understood. I will not create a support request. Let us continue studying or take a break."
        )

    try:
        from db import DB_PATH
        target_db = db_path or DB_PATH
        ticket = save_human_help_request(
            caller_name=caller_name,
            reason_category=reason_category,
            issue_description=issue_description,
            agent_checked=agent_checked,
            contact_info=contact_info,
            urgency=urgency,
            preferred_language=preferred_language,
            preferred_contact_method=preferred_contact_method,
            user_consent_granted=user_consent_granted,
            db_path=target_db,
        )

        # Dispatch to Discord Webhook if configured
        send_discord_webhook(ticket)

        ref_id = ticket["ref_id"]
        is_dup = ticket.get("is_duplicate", False)

        if is_dup:
            return (
                f"STATUS: EXISTING TICKET UPDATED ({ref_id})\n"
                f"Reference ID: {ref_id}\n"
                f"Caller: {caller_name}\n"
                f"Urgency: {urgency.upper()}\n"
                f"Next Step: A senior teacher already has an open ticket ({ref_id}) and will review the new notes.\n"
                f"Note for Agent: Tell the caller their request {ref_id} has been updated and a senior teacher will call back on {preferred_contact_method} within 2 hours."
            )

        return (
            f"STATUS: HUMAN HELP TICKET CREATED ({ref_id})\n"
            f"Reference ID: {ref_id}\n"
            f"Caller: {caller_name}\n"
            f"Urgency: {urgency.upper()}\n"
            f"Preferred Follow-up: {preferred_contact_method} in {preferred_language}\n"
            f"Next Step: Ticket saved to database & queued for senior teaching staff. Expected call back within 2-4 hours.\n"
            f"Note for Agent: State the Reference ID '{ref_id}' aloud clearly to the caller, tell them a senior teacher will contact them in 2 to 4 hours, and ask if they need anything else."
        )

    except Exception as e:
        logger.error(f"Failed to create human help request: {e}")
        return f"ERROR: Could not create human help request due to system error: {e}"

