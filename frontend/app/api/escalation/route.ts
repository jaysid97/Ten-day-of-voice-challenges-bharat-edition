import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import path from 'path';
import util from 'util';

const execPromise = util.promisify(exec);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || '';

    const pyScript = `
import json
import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend", "src")))
from db import get_human_help_requests, init_db
init_db()
status = "${status}".strip() or None
requests = get_human_help_requests(status=status)
print(json.dumps(requests, ensure_ascii=False))
`;

    const repoRoot = path.resolve(process.cwd(), '..');
    const backendPy = path.join(repoRoot, 'backend', '.venv', 'Scripts', 'python.exe');
    
    const cmd = `"${backendPy}" -c "${pyScript.replace(/"/g, '\\"').replace(/\n/g, ' ')}"`;
    const { stdout } = await execPromise(cmd, { cwd: repoRoot });
    const requests = JSON.parse(stdout.trim());

    return NextResponse.json({ success: true, requests });
  } catch (error: any) {
    console.error('Error fetching escalation requests:', error);
    return NextResponse.json({ success: false, requests: [], error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, ref_id, status, notes, caller_name, reason_category, issue_description, agent_checked } = body;

    const repoRoot = path.resolve(process.cwd(), '..');
    const backendPy = path.join(repoRoot, 'backend', '.venv', 'Scripts', 'python.exe');

    if (action === 'update_status') {
      const pyScript = `
import json
import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend", "src")))
from db import update_human_help_status, init_db
init_db()
ok = update_human_help_status("${ref_id}", "${status}", "${notes || ''}")
print(json.dumps({"success": ok}))
`;
      const cmd = `"${backendPy}" -c "${pyScript.replace(/"/g, '\\"').replace(/\n/g, ' ')}"`;
      const { stdout } = await execPromise(cmd, { cwd: repoRoot });
      const result = JSON.parse(stdout.trim());
      return NextResponse.json(result);
    }

    if (action === 'create_request') {
      const pyScript = `
import json
import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend", "src")))
from db import save_human_help_request, init_db
init_db()
res = save_human_help_request(
    caller_name="${caller_name || 'Ramesh'}",
    reason_category="${reason_category || 'Frustrated Learner / Teacher Help Needed'}",
    issue_description="${issue_description || 'Stuck on fractions'}",
    agent_checked="${agent_checked || 'Checked NCERT syllabus'}",
    user_consent_granted=True
)
print(json.dumps(res))
`;
      const cmd = `"${backendPy}" -c "${pyScript.replace(/"/g, '\\"').replace(/\n/g, ' ')}"`;
      const { stdout } = await execPromise(cmd, { cwd: repoRoot });
      const result = JSON.parse(stdout.trim());
      return NextResponse.json({ success: true, ticket: result });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Error updating escalation status:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
