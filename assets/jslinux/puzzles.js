/**
 * Project TALON - Recruitment Puzzle System
 * Injects puzzle files into the JSLinux VM filesystem after boot
 */

// Puzzle file definitions
const TALON_FILES = {
    // Root candidate directory
    'README': `PROJECT TALON :: CANDIDATE ORIENTATION
=====================================

Welcome, Candidate.

You have been identified as a potential asset for DMC Industries.
This terminal contains five trials designed to assess your capabilities.

STRUCTURE:
  ~/trials/     - Your assessment chambers
  ~/.overseer/  - Protocol documentation

INSTRUCTIONS:
  1. Navigate to each trial directory
  2. Read the briefing file (BRIEFING.txt)
  3. Solve the challenge
  4. Record your answer

Upon completion of all trials, construct the final key from your answers.

TRIAL SOLUTIONS (first character of each):
  Trial 01: [?]
  Trial 02: [?]
  Trial 03: [?]
  Trial 04: [?]

The final key unlocks your future.

Good luck, Candidate.

  - OVERSEER
`,

    // Hidden overseer protocol
    '.overseer/protocol.txt': `DMC INDUSTRIES - CLASSIFIED
============================
DOCUMENT: TALON Protocol v2.7
CLEARANCE: RESTRICTED

PROJECT TALON identifies exceptional individuals through
unconventional assessment. Candidates who complete all
trials demonstrate the analytical thinking required for
sensitive operations.

ASSESSMENT METRICS:
  - Pattern Recognition
  - Forensic Analysis
  - Logical Deduction
  - Attention to Detail
  - Synthesis Capability

COMPLETION PROTOCOL:
  Combine first characters of Trial 01-04 solutions.
  Enter result in Trial 05 keyhole.

CONTACT:
  Verified operators may reach recruitment at:
  recruitment@dmcindustriespnw.com

END DOCUMENT
`,

    // Trial 01: Caesar Cipher
    'trials/trial_01_cipher/BRIEFING.txt': `TRIAL 01: CRYPTOGRAPHIC ANALYSIS
=================================

OBJECTIVE: Decode the intercepted transmission.

Our analysts intercepted a coded message using a simple
substitution cipher. The enemy rotates each letter forward
by a fixed amount.

INTERCEPTED MESSAGE:
  "yfqts"

INTELLIGENCE:
  - Caesar cipher variant detected
  - Rotation value: 5 positions forward
  - Example: A->F, B->G, C->H, etc.

TASK:
  Decode the message. The plaintext is a single word.

HINT:
  The answer relates to a bird of prey - fitting for
  a project of this nature.

Record your answer and proceed to Trial 02.
`,

    'trials/trial_01_cipher/cipher_tool.sh': `#!/bin/sh
# Simple ROT cipher tool
# Usage: echo "text" | ./cipher_tool.sh [shift]

SHIFT=\${1:-5}
tr 'A-Za-z' "$(echo {A..Z}{a..z} | sed "s/./&\\n/g" | tail -n +\$((SHIFT+1)) | head -26 | tr -d '\\n')$(echo {A..Z}{a..z} | sed "s/./&\\n/g" | head -\$SHIFT | tr -d '\\n')$(echo {a..z} | sed "s/./&\\n/g" | tail -n +\$((SHIFT+1)) | tr -d '\\n')$(echo {a..z} | sed "s/./&\\n/g" | head -\$SHIFT | tr -d '\\n')"
`,

    // Trial 02: Hex Forensics
    'trials/trial_02_forensics/BRIEFING.txt': `TRIAL 02: DIGITAL FORENSICS
============================

OBJECTIVE: Extract coordinates from corrupted data.

A damaged drive contained critical location data.
Our forensics team recovered a partial hex dump.

TASK:
  Examine the hex dump and extract the hidden coordinates.
  The answer is the LATITUDE value only (e.g., XX.XXXX).

HINT:
  - Look for ASCII text hidden in the hex values
  - The coordinates reference our Seattle operations
  - Focus on bytes that decode to readable numbers

Examine: hexdump.txt
`,

    'trials/trial_02_forensics/hexdump.txt': `RECOVERED DATA FRAGMENT
=======================
Sector 0x7F4A - Partial Recovery

00000000: 4c4f 4341 5449 4f4e 2044 4154 4120 4652  LOCATION DATA FR
00000010: 4147 4d45 4e54 0a0a 4c41 543a 2034 372e  AGMENT..LAT: 47.
00000020: 3630 3632 0a4c 4f4e 473a 202d 3132 322e  6062.LONG: -122.
00000030: 3333 3231 0a0a 434c 4153 5349 4649 4544  3321..CLASSIFIED
00000040: 202d 2044 4d43 2048 5120 5345 4154 544c   - DMC HQ SEATTL
00000050: 450a                                     E.

[END FRAGMENT]

NOTE: Answer format is the latitude as shown (XX.XXXX)
`,

    // Trial 03: Logic Puzzle
    'trials/trial_03_logic/BRIEFING.txt': `TRIAL 03: LOGICAL DEDUCTION
============================

OBJECTIVE: Identify the compromised agent.

Intelligence suggests one agent in our network has been
compromised. Use the following facts to determine the
codename of the double agent.

AGENTS:
  - FALCON
  - VIPER
  - GHOST
  - RAVEN

FACTS:
  1. The double agent was recruited after 2015.
  2. The double agent does not have flight clearance.
  3. FALCON and RAVEN both have flight clearance.
  4. GHOST was recruited in 2012.
  5. VIPER specializes in ground operations.
  6. The double agent has never met FALCON.
  7. RAVEN and GHOST work together regularly.

TASK:
  Determine which agent is the double agent.
  Answer with just the codename (lowercase).

Use logical deduction to eliminate possibilities.
`,

    'trials/trial_03_logic/agent_dossiers.txt': `AGENT DOSSIERS (PARTIAL)
========================

FALCON
  Recruited: 2018
  Clearance: Flight, Ground
  Status: Active
  Notes: Veteran pilot, leads aerial reconnaissance

VIPER
  Recruited: 2019
  Clearance: Ground only
  Status: Active
  Notes: Ground operations specialist, never met FALCON

GHOST
  Recruited: 2012
  Clearance: Ground, Infiltration
  Status: Active
  Notes: Senior operative, works with RAVEN

RAVEN
  Recruited: 2014
  Clearance: Flight, Ground
  Status: Active
  Notes: GHOST's partner, experienced field agent
`,

    // Trial 04: Steganography/Acrostic
    'trials/trial_04_stego/BRIEFING.txt': `TRIAL 04: HIDDEN MESSAGES
=========================

OBJECTIVE: Extract the concealed word.

Our psychological operations team embeds messages in
seemingly ordinary text. This technique allows covert
communication through public channels.

TASK:
  Examine the "mission_report.txt" file.
  Find the hidden word using steganographic analysis.

HINT:
  Sometimes the most important message is hiding
  in plain sight. Look at the structure, not just
  the content.

The answer is a single word describing a role.
`,

    'trials/trial_04_stego/mission_report.txt': `DMC INDUSTRIES - MISSION REPORT
================================
Operation: SENTINEL WATCH
Date: [REDACTED]
Status: COMPLETE

Overview of Recent Activities:

Operational security remained paramount throughout
the mission duration. All protocols were followed
exactly as specified in the field manual.

Reconnaissance data collected exceeds expectations.
Analysis teams are processing the intelligence now.
Technical specialists confirm data integrity at 100%.
Operations will continue as planned next quarter.
Review scheduled for month end.

[END REPORT]

NOTE: First letters of each line in the main body
      may contain additional information.
`,

    // Trial 05: Final Synthesis
    'trials/trial_05_final/BRIEFING.txt': `TRIAL 05: SYNTHESIS
===================

OBJECTIVE: Construct the master key.

You have completed trials 01 through 04. Each solution
contained a piece of the final puzzle.

PROTOCOL (from .overseer/protocol.txt):
  Combine the FIRST CHARACTER of each trial's answer.

EXAMPLE:
  If your answers were: apple, banana, cherry, date
  Your key would be: abcd

SOLUTIONS TO COMBINE:
  Trial 01 (Cipher):     _____ -> first char: ?
  Trial 02 (Forensics):  _____ -> first char: ?
  Trial 03 (Logic):      _____ -> first char: ?
  Trial 04 (Stego):      _____ -> first char: ?

TASK:
  Construct your 4-character key and enter it in the
  keyhole file to verify completion.

  echo "YOUR_KEY" > .keyhole

If correct, your clearance will be upgraded.
`,

    'trials/trial_05_final/.keyhole_check.sh': `#!/bin/sh
# Keyhole verification script
# Usage: echo "key" > .keyhole && sh .keyhole_check.sh

CORRECT_KEY="t4vo"
USER_KEY=$(cat .keyhole 2>/dev/null | tr -d '[:space:]')

if [ "$USER_KEY" = "$CORRECT_KEY" ]; then
    cat << 'EOF'

    ╔═══════════════════════════════════════════════════════╗
    ║                                                       ║
    ║   ██████╗ ██████╗ ███████╗██████╗  █████╗ ████████╗  ║
    ║  ██╔═══██╗██╔══██╗██╔════╝██╔══██╗██╔══██╗╚══██╔══╝  ║
    ║  ██║   ██║██████╔╝█████╗  ██████╔╝███████║   ██║     ║
    ║  ██║   ██║██╔═══╝ ██╔══╝  ██╔══██╗██╔══██║   ██║     ║
    ║  ╚██████╔╝██║     ███████╗██║  ██║██║  ██║   ██║     ║
    ║   ╚═════╝ ╚═╝     ╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝   ╚═╝     ║
    ║                                                       ║
    ║            CANDIDATE STATUS: VERIFIED                 ║
    ║            CLEARANCE LEVEL:  OPERATOR                 ║
    ║                                                       ║
    ╚═══════════════════════════════════════════════════════╝

    "Welcome to DMC Industries. Your first assignment awaits."

    ────────────────────────────────────────────────────────

    You have demonstrated the skills we seek:
      - Cryptographic analysis
      - Digital forensics
      - Logical reasoning
      - Pattern recognition

    NEXT STEPS:
      Contact recruitment@dmcindustriespnw.com
      Reference: PROJECT TALON - VERIFIED OPERATOR

    ────────────────────────────────────────────────────────

EOF
else
    echo ""
    echo "[OVERSEER] Key verification failed."
    echo "[OVERSEER] Review your trial solutions and try again."
    echo ""
    echo "Expected format: 4 lowercase characters"
    echo "Hint: First letter of each trial answer (01-04)"
    echo ""
fi
`
};

/**
 * Inject puzzle files into the VM filesystem
 * Called after VM has finished booting and shell is ready
 */
function injectPuzzleFiles() {
    if (typeof fs_import_file !== 'function') {
        console.log('TALON: fs_import_file not available yet');
        return false;
    }

    if (typeof Module === 'undefined' || !Module._malloc || !Module.HEAPU8) {
        console.log('TALON: Module not ready yet');
        return false;
    }

    // Inject each file to /root/ (user's home directory)
    let injectedCount = 0;
    Object.entries(TALON_FILES).forEach(([path, content]) => {
        const fullPath = '/root/' + path;
        const encoder = new TextEncoder();
        const data = encoder.encode(content);

        try {
            const dataPtr = Module._malloc(data.length);
            Module.HEAPU8.set(data, dataPtr);
            fs_import_file(fullPath, dataPtr, data.length);
            Module._free(dataPtr);
            injectedCount++;
            console.log('TALON: Injected ' + fullPath);
        } catch (e) {
            console.error('TALON: Failed to inject ' + fullPath, e);
        }
    });

    if (injectedCount > 0) {
        console.log('TALON: Puzzle files injected successfully (' + injectedCount + ' files)');
        // Notify parent window that puzzles are ready
        if (window.parent !== window) {
            window.parent.postMessage({ type: 'talon-ready' }, '*');
        }
        return true;
    }
    return false;
}

/**
 * Wait for VM to be ready, then inject files
 * Polls until fs_import_file is available
 */
let talonInjected = false;
function waitForShellAndInject() {
    // Poll every 2 seconds until injection succeeds
    const pollInterval = setInterval(function() {
        if (talonInjected) {
            clearInterval(pollInterval);
            return;
        }

        console.log('TALON: Checking if VM is ready...');
        if (injectPuzzleFiles()) {
            talonInjected = true;
            clearInterval(pollInterval);
        }
    }, 2000);

    // Also try after 30 seconds as a backup (kernel should be up by then)
    setTimeout(function() {
        if (!talonInjected && injectPuzzleFiles()) {
            talonInjected = true;
        }
    }, 30000);

    // And again at 45 seconds for slow machines
    setTimeout(function() {
        if (!talonInjected && injectPuzzleFiles()) {
            talonInjected = true;
        }
    }, 45000);
}

// Export for manual triggering if needed
window.talonInject = injectPuzzleFiles;
window.talonFiles = TALON_FILES;
