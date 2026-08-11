#!/usr/bin/env python3
"""
Official Day 6 Linphone & Outbound Agent Entrypoint
===================================================
Run with:
  uv run python src/telephony/outbound/agent.py dev
"""

import os
import sys

# Ensure src is on python path
telephony_outbound_dir = os.path.dirname(os.path.abspath(__file__))
src_dir = os.path.abspath(os.path.join(telephony_outbound_dir, "..", ".."))
if src_dir not in sys.path:
    sys.path.insert(0, src_dir)

from agent import server, cli

if __name__ == "__main__":
    cli.run_app(server)
