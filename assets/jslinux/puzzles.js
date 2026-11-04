/**
 * Project TALON - Recruitment Puzzle System
 * Writes the trial files into /root when the VM's shell first comes up.
 * Loaded by vm.html, which calls talon.attach(term) and routes keys
 * through talon.input().
 */

// Puzzle file contents
const TALON_FILES = {
    'README': `PROJECT TALON :: CANDIDATE ORIENTATION
=====================================

Welcome, Candidate.

You have been identified as a potential asset for DMC Industries.
This terminal contains five trials designed to assess your capabilities.

FILES:
  trial_01.txt  - Cryptographic Analysis
  trial_02.txt  - Digital Forensics
  trial_03.txt  - Logical Deduction
  trial_04.txt  - Hidden Messages
  trial_05.txt  - Final Synthesis

INSTRUCTIONS:
  1. Read each trial file: cat trial_01.txt
  2. Solve the challenge
  3. Record your answer

Upon completion, construct the final key from first character of each answer.

Good luck, Candidate.
  - OVERSEER`,

    'trial_01.txt': `TRIAL 01: CRYPTOGRAPHIC ANALYSIS
=================================
OBJECTIVE: Decode the intercepted transmission.

INTERCEPTED MESSAGE: "yfqts"

INTELLIGENCE:
  - Caesar cipher variant detected
  - Rotation value: 5 positions forward
  - Example: A->F, B->G, C->H
  - To decode: shift each letter BACK by 5

HINT: The answer relates to a bird of prey.`,

    'trial_02.txt': `TRIAL 02: DIGITAL FORENSICS
============================
OBJECTIVE: Extract coordinates from corrupted data.

RECOVERED HEX FRAGMENT:
00000010: 4c41 543a 2034 372e  LAT: 47.
00000020: 3630 3632 0a4c 4f4e  6062.LON

TASK: The answer is the LATITUDE value (XX.XXXX format).
HINT: Look at the ASCII on the right side.`,

    'trial_03.txt': `TRIAL 03: LOGICAL DEDUCTION
============================
OBJECTIVE: Identify the compromised agent.

AGENTS: FALCON, VIPER, GHOST, RAVEN

FACTS:
1. Double agent recruited after 2015
2. Double agent has NO flight clearance
3. FALCON and RAVEN have flight clearance
4. GHOST recruited in 2012
5. VIPER: ground ops only, recruited 2019

TASK: Which agent? Answer in lowercase.`,

    'trial_04.txt': `TRIAL 04: HIDDEN MESSAGES
=========================
OBJECTIVE: Find the concealed word.

MISSION REPORT EXCERPT:
-----------------------
Operational security remained paramount
the mission duration. All protocols followed
exactly as specified in field manual.

Reconnaissance data collected exceeds
Analysis teams processing intelligence
Technical specialists confirm integrity
Operations continue as planned next
Review scheduled for month end.
-----------------------

HINT: First letters reveal secrets.
TASK: The answer describes a role.`,

    'trial_05.txt': `TRIAL 05: SYNTHESIS
===================
OBJECTIVE: Construct the master key.

Combine FIRST CHARACTER of each answer:
  Trial 01: _____ -> ?
  Trial 02: _____ -> ?
  Trial 03: _____ -> ?
  Trial 04: _____ -> ?

Create keyhole: echo "XXXX" > .keyhole
Verify: sh verify.sh`,

    'verify.sh': `#!/bin/sh
KEY=$(cat .keyhole 2>/dev/null | tr -d '[:space:]')
if [ "$KEY" = "t4vo" ]; then
echo "========================================="
echo "  CANDIDATE STATUS: VERIFIED"
echo "  CLEARANCE LEVEL:  OPERATOR"
echo "========================================="
echo ""
echo "  Welcome to DMC Industries."
echo "  Contact: recruitment@dmcindustriespnw.com"
echo "  Reference: PROJECT TALON - VERIFIED"
echo ""
else
echo "[OVERSEER] Key incorrect. Try again."
echo "Hint: First letter of each trial answer"
fi`
};

/*
 * The VM's root filesystem is an ext2 block device, which fs_import_file
 * can't write to, so the files are created by typing commands into the shell.
 * To keep that invisible and independent of what the user does:
 *
 *  - injection starts the moment the first shell prompt is printed
 *  - keystrokes are held back until the files exist, then replayed
 *  - VM output is hidden while the commands run
 *  - every path is absolute, so the shell's working directory doesn't matter
 *  - each command echoes a marker, and the next command is sent only after
 *    that marker comes back. This keeps every burst well under the emulator's
 *    console input buffer (about 1 KB; anything past it is dropped).
 */
window.talon = (function () {
    const TARGET_DIR = '/root';
    const CHUNK_MAX = 400;           // printf payload chars per command
    const STEP_TIMEOUT_MS = 10000;   // shell stopped answering: give up
    const BOOT_HOLD_MS = 90000;      // never saw a prompt: stop holding keys

    const PROMPT_RE = /[#$] $/;
    const ANSI_RE = /\x1b\[[0-9;?]*[A-Za-z]/g;
    const CURSOR_REPORT_RE = /\x1b\[\d+;\d+R/g;

    let state = 'boot';              // boot -> injecting -> done
    let holdKeys = true;
    let rawWrite = null;
    let recent = '';                 // tail of visible output, for prompt detection
    let hidden = '';                 // output swallowed while injecting
    let heldKeys = '';
    let steps = [];
    let step = 0;
    let stepTimer = null;
    let bootTimer = null;

    function type(str) {
        if (typeof console_write1 !== 'function') return false;
        for (let i = 0; i < str.length; i++) console_write1(str.charCodeAt(i));
        return true;
    }

    // The "" splits the marker in the typed command, so an echoed command
    // line never matches; only printf's output does. No trailing newline,
    // so after the last marker the shell prints just its prompt.
    function marker(i) { return 'TALON_OK_' + i + '_'; }
    function markerCmd(i) { return 'printf TALON""_OK_' + i + '_'; }

    // Escape text for `printf %b '...'`, split into chunks that never cut
    // an escape sequence in half.
    function printfChunks(text) {
        const chunks = [];
        let cur = '';
        for (const ch of text) {
            const t = ch === '\\' ? '\\\\'
                    : ch === '\n' ? '\\n'
                    : ch === "'" ? "'\\''"
                    : ch;
            if (cur.length + t.length > CHUNK_MAX) {
                chunks.push(cur);
                cur = '';
            }
            cur += t;
        }
        if (cur) chunks.push(cur);
        return chunks;
    }

    function buildSteps() {
        const cmds = ['stty -echo'];
        for (const [name, content] of Object.entries(TALON_FILES)) {
            const path = TARGET_DIR + '/' + name;
            printfChunks(content + '\n').forEach((chunk, i) => {
                cmds.push(`printf %b '${chunk}' ${i ? '>>' : '>'} ${path}`);
            });
        }
        cmds.push(`chmod 755 ${TARGET_DIR}/verify.sh`);
        cmds.push('stty echo');
        return cmds.map((cmd, i) => `${cmd}; ${markerCmd(i)}\n`);
    }

    function onOutput(str) {
        if (state === 'injecting') {
            hidden += str;
            checkMarker();
            return;
        }
        rawWrite(str);
        if (state === 'boot') {
            recent = (recent + str).slice(-256);
            if (PROMPT_RE.test(recent.replace(ANSI_RE, ''))) start();
        }
    }

    function onInput(str) {
        if (state === 'injecting' || (state === 'boot' && holdKeys)) {
            heldKeys += str;
        } else {
            type(str);
        }
    }

    function start() {
        if (state === 'injecting' || typeof console_write1 !== 'function') return;
        state = 'injecting';
        clearTimeout(bootTimer);
        steps = buildSteps();
        step = 0;
        hidden = '';
        // Ctrl-U first clears anything already typed on the shell's line.
        sendStep('\x15');
    }

    function sendStep(prefix) {
        clearTimeout(stepTimer);
        stepTimer = setTimeout(abort, STEP_TIMEOUT_MS);
        type((prefix || '') + steps[step]);
    }

    function checkMarker() {
        const m = marker(step);
        const at = hidden.indexOf(m);
        if (at < 0) return;
        hidden = hidden.slice(at + m.length);
        if (++step < steps.length) sendStep();
        else finish();
    }

    function finish() {
        clearTimeout(stepTimer);
        state = 'done';
        // Redraw over the prompt that was on screen when output was hidden.
        // The marker has no newline, so what follows it is the new prompt.
        rawWrite('\r\x1b[K' + hidden);
        hidden = '';
        releaseKeys();
        console.log('TALON: files ready in ' + TARGET_DIR);
        if (window.parent !== window) {
            window.parent.postMessage({ type: 'talon-ready' }, '*');
        }
    }

    function abort() {
        console.error('TALON: shell stopped responding at step ' + step + ', giving up');
        state = 'done';
        hidden = '';
        type('\x15stty echo\n');
        releaseKeys();
    }

    function releaseKeys() {
        // Cursor-position replies belong to prompts we hid; the shell asks again.
        const keys = heldKeys.replace(CURSOR_REPORT_RE, '');
        heldKeys = '';
        if (keys) type(keys);
    }

    // Call once the terminal exists, before the VM starts printing.
    function attach(term) {
        rawWrite = term.write.bind(term);
        term.write = onOutput;
        bootTimer = setTimeout(function () {
            holdKeys = false;
            releaseKeys();
        }, BOOT_HOLD_MS);
    }

    return { attach: attach, input: onInput, inject: start };
})();
