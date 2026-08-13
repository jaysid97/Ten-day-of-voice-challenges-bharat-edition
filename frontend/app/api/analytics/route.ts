import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import path from 'path';
import util from 'util';
import fs from 'fs';

const execPromise = util.promisify(exec);

function getSrcDir(): string {
  const cwd = process.cwd();
  const candidate1 = path.join(cwd, '..', 'murf-livekit-starter', 'backend', 'src');
  if (fs.existsSync(candidate1)) return candidate1.replace(/\\/g, '/');
  const candidate2 = path.join(cwd, '..', 'backend', 'src');
  if (fs.existsSync(candidate2)) return candidate2.replace(/\\/g, '/');
  return path.resolve(cwd, '..', 'murf-livekit-starter', 'backend', 'src').replace(/\\/g, '/');
}

function getPythonPath(): string {
  const cwd = process.cwd();
  const candidate1 = path.join(cwd, '..', 'backend', '.venv', 'Scripts', 'python.exe');
  if (fs.existsSync(candidate1)) return `"${candidate1}"`;
  const candidate2 = path.join(cwd, '..', 'murf-livekit-starter', 'backend', '.venv', 'Scripts', 'python.exe');
  if (fs.existsSync(candidate2)) return `"${candidate2}"`;
  return 'python';
}

export async function GET() {
  try {
    const srcDir = getSrcDir();
    const pythonExe = getPythonPath();
    const repoRoot = path.resolve(process.cwd(), '..');

    const pyCmd = `import json, sys, os; sys.path.insert(0, r'${srcDir}'); from db import get_analytics_summary, get_call_analytics_history, init_db; init_db(); summary = get_analytics_summary(); history = get_call_analytics_history(limit=50); print(json.dumps({'summary': summary, 'history': history}, ensure_ascii=False))`;

    let stdout = '';
    try {
      const res = await execPromise(`${pythonExe} -c "${pyCmd.replace(/"/g, '\\"')}"`, { cwd: repoRoot });
      stdout = res.stdout;
    } catch {
      const res = await execPromise(`python -c "${pyCmd.replace(/"/g, '\\"')}"`, { cwd: repoRoot });
      stdout = res.stdout;
    }

    const data = JSON.parse(stdout.trim());
    return NextResponse.json({ success: true, ...data });
  } catch (error: any) {
    console.error('Error fetching call analytics:', error);
    return NextResponse.json(
      {
        success: false,
        summary: {
          total_calls: 0,
          successful_calls: 0,
          failed_calls: 0,
          success_rate_percent: 0.0,
          failure_categories: {},
        },
        history: [],
        error: error.message,
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, status, caller_name, channel, failure_category, notes } = body;

    const srcDir = getSrcDir();
    const pythonExe = getPythonPath();
    const repoRoot = path.resolve(process.cwd(), '..');

    if (action === 'simulate_call') {
      const callId = `call_sim_${Date.now()}`;
      const name = caller_name || 'Ramesh Kumar';
      const ch = channel || 'BROWSER';
      const st = status || 'SUCCESS';
      const fc = failure_category || (st === 'SUCCESS' ? 'NONE' : 'INCOMPLETE_TASK');
      const nt = notes || 'Voice agent study session';

      const pyCmd = `import json, sys, os; sys.path.insert(0, r'${srcDir}'); from db import log_call_analytics, init_db; init_db(); res = log_call_analytics(call_id='${callId}', caller_name='${name}', channel='${ch}', status='${st}', failure_category='${fc}', tools_used=['fetch_ncert_exercise_and_syllabus'], duration_seconds=120, notes='${nt}'); print(json.dumps(res, ensure_ascii=False))`;

      let stdout = '';
      try {
        const res = await execPromise(`${pythonExe} -c "${pyCmd.replace(/"/g, '\\"')}"`, { cwd: repoRoot });
        stdout = res.stdout;
      } catch {
        const res = await execPromise(`python -c "${pyCmd.replace(/"/g, '\\"')}"`, { cwd: repoRoot });
        stdout = res.stdout;
      }

      const record = JSON.parse(stdout.trim());
      return NextResponse.json({ success: true, record });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Error simulating call analytics:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
