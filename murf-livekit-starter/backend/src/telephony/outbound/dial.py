#!/usr/bin/env python3
"""
Official Day 6 Linphone & LiveKit Outbound Dial Script
======================================================
Usage:
  uv run python src/telephony/outbound/dial.py --to <linphone-username>
  uv run python src/telephony/outbound/dial.py --to user123 --name Ramesh --topic "NCERT Photosynthesis"
"""

import argparse
import asyncio
import json
import logging
import os
import sys
import time

# Force UTF-8 output encoding for Windows compatibility
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

from dotenv import load_dotenv

# Path resolution to load backend .env.local and db modules
backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
sys.path.insert(0, os.path.join(backend_dir, "src"))

load_dotenv(os.path.join(backend_dir, ".env.local"))

from db import init_db, is_learner_opted_out, log_outbound_call, set_learner_opt_out

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("telephony.outbound.dial")


async def dial_outbound(
    to_username: str,
    name: str = "Ramesh",
    topic: str = "NCERT Class 10 Science Photosynthesis",
    trunk_id: str = None,
):
    """Dial an outbound SIP call to a Linphone account or phone number using LiveKit SIP API."""
    init_db()
    clean_target = to_username.strip()
    user_id = clean_target.replace("sip:", "").split("@")[0].lower()

    # 1. Check Opt-Out Status
    if is_learner_opted_out(user_id):
        logger.warning(f"🚫 CALL BLOCKED: Target '{user_id}' has opted out of outbound practice calls.")
        call_id = f"call_{int(time.time())}"
        log_res = log_outbound_call(
            call_id=call_id,
            user_id=user_id,
            phone_number=clean_target,
            topic=topic,
            outcome="OPT_OUT",
            notes="Call blocked prior to dialing — learner opted out",
        )
        print(f"\n🚫 CALL BLOCKED: Target '{user_id}' has opted out of outbound practice calls.")
        return log_res

    # 2. Prepare SIP identity & Room name
    if clean_target.startswith("sip:"):
        sip_uri = clean_target
    elif "@" in clean_target:
        sip_uri = f"sip:{clean_target}"
    else:
        sip_uri = f"sip:{clean_target}@sip.linphone.org"

    room_name = f"outbound_sip_{user_id}_{int(time.time())}"
    call_id = f"call_{int(time.time())}"

    # 3. Build Call Metadata for Shiksha AI Agent
    metadata = {
        "is_outbound": True,
        "call_id": call_id,
        "user_id": user_id,
        "name": name,
        "phone_number": sip_uri,
        "topic": topic,
        "outcome_sim": "ANSWERED",
    }

    log_res = log_outbound_call(
        call_id=call_id,
        user_id=user_id,
        phone_number=sip_uri,
        topic=topic,
        outcome="ANSWERED",
        notes=f"Linphone outbound call dispatched to {sip_uri}",
    )

    # 4. LiveKit API SIP Participant Dispatch
    livekit_url = os.getenv("LIVEKIT_URL")
    api_key = os.getenv("LIVEKIT_API_KEY")
    api_secret = os.getenv("LIVEKIT_API_SECRET")
    sip_trunk_id = trunk_id or os.getenv("LIVEKIT_SIP_OUTBOUND_TRUNK_ID")

    print("\n==========================================================")
    print("📞 DAY 6 LINPHONE & LIVEKIT OUTBOUND DISPATCH")
    print("==========================================================")
    print(f"Target SIP URI:  {sip_uri}")
    print(f"Learner Name:    {name}")
    print(f"Study Topic:     {topic}")
    print(f"Room Name:       {room_name}")
    print(f"SIP Trunk ID:    {sip_trunk_id or 'Not Configured (Web Simulation Active)'}")

    if livekit_url and api_key and api_secret:
        try:
            from livekit import api
            lk_api = api.LiveKitAPI(livekit_url, api_key, api_secret)

            # Create Room
            await lk_api.room.create_room(
                api.CreateRoomRequest(name=room_name, metadata=json.dumps(metadata))
            )
            print(f"✅ Created LiveKit Room: '{room_name}' with Day 6 Outbound Metadata.")

            # Create SIP Participant if Trunk ID is provided
            if sip_trunk_id and not sip_trunk_id.startswith("ST_your_"):
                req = api.CreateSIPParticipantRequest(
                    sip_trunk_id=sip_trunk_id,
                    sip_call_to=user_id,
                    room_name=room_name,
                    participant_identity=f"sip_{user_id}",
                    participant_name=name,
                )
                sip_part = await lk_api.sip.create_sip_participant(req)
                print(f"📞 LiveKit SIP Outbound Call Initiated! SIP Call ID: {sip_part.sip_call_id}")
            else:
                print("ℹ️ Note: Set LIVEKIT_SIP_OUTBOUND_TRUNK_ID in .env.local to dispatch live SIP ring to your phone.")

            await lk_api.aclose()
        except Exception as e:
            print(f"⚠️ LiveKit API Dispatch Note: {e}")

    print("\n🗣️ MANDATED 2-SENTENCE OPENING SCRIPT TO BE SPOKEN BY AGENT:")
    print(f"1️⃣ Who & Why: 'नमस्ते {name} जी! मैं शिक्षा AI बोल रहा हूँ, आपकी डेली 5-मिनट NCERT साइंस प्रैक्टिस कॉल के लिए।'")
    print(f"2️⃣ Opt-Out:   'अगर आप ये कॉल्स बंद करना चाहते हैं, तो बस 'स्टॉप' या 'कॉल्स बंद करो' बोल दें।'")
    print(f"3️⃣ Value:     'आज हम {topic} रिवाइज करेंगे। क्या आप शुरू करने के लिए तैयार हैं?'")
    print("==========================================================\n")
    return log_res


def main():
    parser = argparse.ArgumentParser(description="Outbound call via Linphone & LiveKit SIP")
    parser.add_argument("--to", required=True, help="Linphone username or SIP URI (e.g. 'myuser' or 'sip:myuser@sip.linphone.org')")
    parser.add_argument("--name", default="Ramesh", help="Learner Name")
    parser.add_argument("--topic", default="NCERT Class 10 Science Photosynthesis", help="Study Topic")
    parser.add_argument("--trunk", default=os.getenv("LIVEKIT_SIP_OUTBOUND_TRUNK_ID"), help="SIP Outbound Trunk ID")

    args = parser.parse_args()
    asyncio.run(dial_outbound(to_username=args.to, name=args.name, topic=args.topic, trunk_id=args.trunk))


if __name__ == "__main__":
    main()
