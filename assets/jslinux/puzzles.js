/**
 * Project TALON - Recruitment Puzzle System
 * Creates puzzle files by sending commands to the shell
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

/**
 * Send a string to the VM console as if typed
 */
function sendToConsole(str) {
    if (typeof console_write1 !== 'function') {
        console.error('TALON: console_write1 not available');
        return false;
    }
    for (let i = 0; i < str.length; i++) {
        console_write1(str.charCodeAt(i));
    }
    return true;
}

/**
 * Send a command and press enter
 */
function sendCommand(cmd) {
    sendToConsole(cmd + '\n');
}

/**
 * Create a file using heredoc
 */
function createFile(filename, content) {
    // Escape any single quotes in content
    const escaped = content.replace(/'/g, "'\\''");
    const cmd = `cat << 'TALONEOF' > ${filename}
${content}
TALONEOF`;
    sendCommand(cmd);
}

/**
 * Inject all puzzle files
 */
function injectPuzzleFiles() {
    if (typeof console_write1 !== 'function') {
        console.log('TALON: console_write1 not available yet');
        return false;
    }

    console.log('TALON: Injecting puzzle files via shell commands...');

    // Disable echo so user doesn't see all the file content
    sendCommand('stty -echo');

    // Small delay between files to let shell process
    let delay = 100;
    Object.entries(TALON_FILES).forEach(([filename, content]) => {
        setTimeout(() => {
            createFile(filename, content);
            console.log('TALON: Created ' + filename);
        }, delay);
        delay += 300; // 300ms between each file
    });

    // Re-enable echo, clear screen, show ready message
    setTimeout(() => {
        sendCommand('stty echo');
        sendCommand('clear');
        sendCommand('echo ""');
        sendCommand('echo "[OVERSEER] Assessment files deployed."');
        sendCommand('echo ""');
        sendCommand('echo "Type: ls"');
        sendCommand('echo "Then: cat README"');
        sendCommand('echo ""');
        console.log('TALON: All files created');
        if (window.parent !== window) {
            window.parent.postMessage({ type: 'talon-ready' }, '*');
        }
    }, delay + 500);

    return true;
}

/**
 * Wait for shell to be ready, then inject files
 */
let talonInjected = false;
function waitForShellAndInject() {
    // Wait for shell prompt - try after 20 seconds when kernel should be booted
    setTimeout(function() {
        if (!talonInjected && typeof console_write1 === 'function') {
            talonInjected = true;
            injectPuzzleFiles();
        }
    }, 20000);

    // Backup attempt at 35 seconds
    setTimeout(function() {
        if (!talonInjected && typeof console_write1 === 'function') {
            talonInjected = true;
            injectPuzzleFiles();
        }
    }, 35000);
}

// Export for manual triggering
window.talonInject = injectPuzzleFiles;
window.talonSend = sendCommand;
