import { ChatMessage, UserProfile } from '../types';

interface ConversationAnalysis {
  symptoms: string[];
  cognitiveState: string[];
  timeLimitSeconds: number | null;
  declinedActivities: string[];
  intent: string;
}

export function analyzeConversation(
  message: string,
  history: ChatMessage[] = []
): ConversationAnalysis {
  const q = message.toLowerCase();

  // Combine current message with previous user messages to catch multi-turn context
  const pastUserMsgs = history
    .filter((m) => m.role === 'user')
    .slice(-3)
    .map((m) => m.content.toLowerCase())
    .join(' ');
  const fullContext = `${pastUserMsgs} ${q}`;

  const symptoms: string[] = [];
  const cognitiveState: string[] = [];
  const declinedActivities: string[] = [];
  let timeLimitSeconds: number | null = null;
  let intent = 'general_advice';

  // 1. Time constraints
  if (/(\b30\s*s(ec)?|half\s*a?\s*minute|quick\s*second)/.test(q)) {
    timeLimitSeconds = 30;
  } else if (/(\b1\s*m(in)?|one\s*minute|sixty\s*second)/.test(q)) {
    timeLimitSeconds = 60;
  } else if (/(\b2\s*m(in)?|two\s*minute|couple\s*minutes|meeting\s*(in|soon))/.test(q)) {
    timeLimitSeconds = 120;
  } else if (/(\b5\s*m(in)?|five\s*minute)/.test(q)) {
    timeLimitSeconds = 300;
  } else if (/(\b10|15)\s*m(in)?|lunch|long\s*break/.test(q)) {
    timeLimitSeconds = 600;
  }

  // 2. Physical Symptoms
  if (/(eye|eyes|screen|blur|vision|staring|monitor|glare|headache|temple|forehead|optical)/.test(fullContext)) {
    symptoms.push('eye_strain');
  }
  if (/(neck|shoulder|trap|slouch|hunch|posture|upper back|spine|stiff)/.test(fullContext)) {
    symptoms.push('neck_shoulder_tension');
  }
  if (/(wrist|hand|finger|carpal|typing|mouse|keyboard|rsi|forearm)/.test(fullContext)) {
    symptoms.push('wrist_repetitive_strain');
  }
  if (/(lower back|backache|hip|legs|sitting all day|seated too long)/.test(fullContext)) {
    symptoms.push('lower_body_fatigue');
  }
  if (/(thirsty|water|dehydrat|dry mouth|drink)/.test(fullContext)) {
    symptoms.push('dehydration');
  }

  // 3. Cognitive / Emotional State
  if (/(stress|anxious|anxiety|panic|overwhelm|pressure|deadline|bug|stuck|frustrat|burnout|angry)/.test(fullContext)) {
    cognitiveState.push('high_stress');
  }
  if (/(tired|sleepy|exhaust|low energy|drowsy|slump|fatigue|yawn|coffee|brain fog|can't focus|unfocused)/.test(fullContext)) {
    cognitiveState.push('mental_fatigue');
  }

  // 4. Activity Rejections / Declines
  if (/(don't want to walk|dont want to walk|no walking|can't leave|cannot leave|hate walking)/.test(q)) {
    declinedActivities.push('walkbreak');
  }
  if (/(no yoga|not yoga|don't want to stretch|hate stretching|can't stretch)/.test(q)) {
    declinedActivities.push('deskyoga');
  }
  if (/(no breathing|not breathing|don't like meditation)/.test(q)) {
    declinedActivities.push('mindreset');
  }

  // 5. High-level intent classification
  if (/(what did i do|completed today|history|my activities|my progress|screen time today|my stats)/.test(q)) {
    intent = 'query_history';
  } else if (/(plan|schedule|break planner|routine|agenda|organize my day)/.test(q)) {
    intent = 'plan_workday';
  } else if (/^(hi|hello|hey|good morning|good afternoon|good evening|who are you|how are you|help|what can you do)/.test(q.trim())) {
    intent = 'greeting';
  } else if (/(another option|different option|something else|what else)/.test(q)) {
    intent = 'request_alternative';
  } else if (symptoms.length > 0 || cognitiveState.length > 0) {
    intent = 'symptom_relief';
  }

  return {
    symptoms,
    cognitiveState,
    timeLimitSeconds,
    declinedActivities,
    intent
  };
}

export function generateChatResponse(
  userMsg: string,
  history: ChatMessage[] = [],
  profile?: UserProfile | null
): ChatMessage {
  const analysis = analyzeConversation(userMsg, history);
  const userName = profile?.name ? profile.name.split(' ')[0] : 'there';
  const userRole = profile?.role || 'desk worker';
  const q = userMsg.toLowerCase();

  // 1. GREETING & CASUAL INTRO
  if (analysis.intent === 'greeting') {
    return {
      role: 'assistant',
      content: `Hello ${userName}! 👋 I'm VYBE, your intelligent workplace wellness companion.

As a ${userRole}, long hours of intense problem-solving can build silent physical tension and eye fatigue. I'm actively analyzing your rhythm to recommend the best reset.

How is your body and mind feeling right now?
• "My shoulders and neck are stiff"
• "My eyes feel strained from staring at code"
• "I'm feeling stressed by a deadline"
• "I only have 2 minutes before my next meeting"`,
      suggested_actions: [
        { label: 'Check 20s EyeCare', action: 'start_eyecare' },
        { label: '2-Min Desk Yoga', action: 'start_deskyoga' },
        { label: '1-Min Mind Reset', action: 'start_mindreset' }
      ],
      source: 'rule_engine'
    };
  }

  // 2. QUERY TODAY'S STATS & ACTIVITY HISTORY
  if (analysis.intent === 'query_history') {
    let completedCount = 0;
    let totalMinutes = 0;
    try {
      const savedHist = localStorage.getItem(`vybe_hist_${profile?.user_id || 'default_user'}`);
      if (savedHist) {
        const records = JSON.parse(savedHist);
        const todayStr = new Date().toISOString().slice(0, 10);
        const todayRecords = records.filter((r: any) => r.completed_at?.startsWith(todayStr));
        completedCount = todayRecords.length;
        const totalSec = todayRecords.reduce((acc: number, r: any) => acc + (r.duration_seconds || 0), 0);
        totalMinutes = Math.round(totalSec / 60);
      }
    } catch {}

    if (completedCount === 0) {
      return {
        role: 'assistant',
        content: `You haven't logged any completed wellness sessions yet today, ${userName}. 

Starting with just one 20-second EyeCare pause or a 1-minute MindReset will help maintain peak cognitive focus for the rest of your afternoon!`,
        suggested_activity_id: 'eyecare',
        suggested_actions: [
          { label: 'Start 20s EyeCare', action: 'start_eyecare' },
          { label: 'Start 1m MindReset', action: 'start_mindreset' }
        ],
        source: 'rule_engine'
      };
    }

    return {
      role: 'assistant',
      content: `📊 Great progress today, ${userName}! 

You've completed **${completedCount} wellness sessions** totaling approximately **${totalMinutes} minutes** of focused rejuvenation. Taking these deliberate micro-breaks protects your neural stamina and prevents end-of-day burnout.`,
      suggested_actions: [
        { label: 'View Journey Analytics', action: 'navigate_journey' },
        { label: 'Take Next Break', action: 'start_deskyoga' }
      ],
      source: 'rule_engine'
    };
  }

  // 3. WORKDAY PLANNER INQUIRY
  if (analysis.intent === 'plan_workday') {
    return {
      role: 'assistant',
      content: `I recommend a rhythmic 50/10 workflow, ${userName}:

• **50 Minutes Deep Focus**: Uninterrupted engineering and problem solving.
• **5 Minutes Micro-Reset**: Alternating between optical recovery (20-20-20), biomechanical posture stretches, and hydration.
• **Protected Quiet Lunch**: All alerts are automatically silenced during your lunch block.

Would you like to open the interactive Smart Break Planner to customize your workday schedule?`,
      suggested_actions: [
        { label: 'Open Break Planner', action: 'navigate_planner' }
      ],
      source: 'rule_engine'
    };
  }

  // 4. USER DECLINED AN ACTIVITY / WANTS ALTERNATIVE
  if (analysis.intent === 'request_alternative' || analysis.declinedActivities.length > 0) {
    if (analysis.declinedActivities.includes('walkbreak') || /walk/.test(q)) {
      return {
        role: 'assistant',
        content: `Understood, ${userName}! You don't need to leave your workstation. 

A seated rhythm reset works wonders without disrupting your current setup. I recommend either **Desk Yoga (2m)** for gentle seated posture release, or **Mind Reset (1m)** for clear breathing.`,
        suggested_activity_id: 'deskyoga',
        suggested_actions: [
          { label: 'Start Desk Yoga (2m)', action: 'start_deskyoga' },
          { label: 'Start Mind Reset (1m)', action: 'start_mindreset' }
        ],
        source: 'rule_engine'
      };
    }

    if (analysis.declinedActivities.includes('deskyoga') || /yoga|stretch/.test(q)) {
      return {
        role: 'assistant',
        content: `No physical stretching needed! Let's do a zero-effort optical or breathing reset:

• **20-20-20 EyeCare (20s)**: Simply look out the window to relax your vision.
• **Mind Reset (1m)**: Guided 4-7-8 breathing to clear mental fatigue.`,
        suggested_activity_id: 'eyecare',
        suggested_actions: [
          { label: 'Start EyeCare (20s)', action: 'start_eyecare' },
          { label: 'Mind Reset (1m)', action: 'start_mindreset' }
        ],
        source: 'rule_engine'
      };
    }
  }

  // 5. SPECIFIC SYMPTOM & COGNITIVE ANALYSIS

  // A. EYE STRAIN & MONITOR FATIGUE
  if (analysis.symptoms.includes('eye_strain') || /eye|eyes|blur|headache|screen|staring/.test(q)) {
    return {
      role: 'assistant',
      content: `🔍 **Conversation Analysis: Optical Fatigue & Screen Strain**

When concentrating on code or high-contrast screens, your natural blink rate drops from 15 times/minute to under 5. This causes tear film evaporation, dry eyes, and spasms in the ciliary lens muscles.

💡 **Best Recommendation for ${userName}**:
The **20-20-20 EyeCare Protocol** (20 seconds).
Gently shift your gaze to an object at least 20 feet (6 meters) away for 20 seconds. This allows your optical muscles to completely decompress.`,
      suggested_activity_id: 'eyecare',
      suggested_actions: [
        { label: 'Start 20s EyeCare', action: 'start_eyecare' },
        { label: 'Grab Water (HydrateMate)', action: 'start_hydratemate' }
      ],
      source: 'rule_engine'
    };
  }

  // B. NECK, SHOULDER, OR POSTURE TENSION
  if (analysis.symptoms.includes('neck_shoulder_tension') || /neck|shoulder|posture|hunch|slouch|back/.test(q)) {
    return {
      role: 'assistant',
      content: `🔍 **Conversation Analysis: Upper Body & Cervical Strain**

Leaning toward your monitor creates 'forward head posture', which multiplies the gravitational load on your cervical spine up to 40 lbs. This tightens your trapezius and suboccipital muscles.

💡 **Best Recommendation for ${userName}**:
**Seated Desk Yoga (2 minutes)**.
A targeted series of gentle shoulder rolls, ear-to-shoulder neck releases, and seated spinal twists you can do without leaving your office chair.`,
      suggested_activity_id: 'deskyoga',
      suggested_actions: [
        { label: 'Start Desk Yoga (2m)', action: 'start_deskyoga' },
        { label: 'Try 1m Breathing', action: 'start_mindreset' }
      ],
      source: 'rule_engine'
    };
  }

  // C. WRIST, HAND & REPETITIVE STRAIN
  if (analysis.symptoms.includes('wrist_repetitive_strain') || /wrist|hand|finger|typing|mouse|carpal/.test(q)) {
    return {
      role: 'assistant',
      content: `🔍 **Conversation Analysis: Repetitive Typing / Ergonomic Strain**

Continuous keystroke repetitions and trackpad gripping cause micro-friction in the flexor tendons of the carpal tunnel, leading to stiffness and forearm tightness.

💡 **Best Recommendation for ${userName}**:
**Desk Yoga Mobility (2 minutes)** focusing on wrist rotations, gentle prayer flexes, and forearm extensions to restore healthy synovial fluid circulation.`,
      suggested_activity_id: 'deskyoga',
      suggested_actions: [
        { label: 'Start Wrist & Desk Yoga (2m)', action: 'start_deskyoga' }
      ],
      source: 'rule_engine'
    };
  }

  // D. STRESS, ANXIETY & OVERWHELM
  if (analysis.cognitiveState.includes('high_stress') || /stress|anxious|panic|pressure|deadline|bug|overwhelm/.test(q)) {
    return {
      role: 'assistant',
      content: `🔍 **Conversation Analysis: Sympathetic Nervous System Overdrive**

Complex debugging or tight deadlines activate your body's stress response, causing shallow thoracic breathing, elevated heart rate, and cognitive tunneling.

💡 **Best Recommendation for ${userName}**:
**Mind Reset (1 minute)** with guided 4-7-8 breathing.
This activates the parasympathetic vagus nerve, immediately signaling your brain that you are safe, clearing mental clutter, and restoring clarity.`,
      suggested_activity_id: 'mindreset',
      suggested_actions: [
        { label: 'Start Mind Reset (1m)', action: 'start_mindreset' },
        { label: 'Drink Water (HydrateMate)', action: 'start_hydratemate' }
      ],
      source: 'rule_engine'
    };
  }

  // E. LOW ENERGY, FATIGUE & AFTERNOON SLUMP
  if (analysis.cognitiveState.includes('mental_fatigue') || /tired|sleepy|exhaust|low energy|drowsy|slump|nap/.test(q)) {
    const hasLongTime = analysis.timeLimitSeconds && analysis.timeLimitSeconds >= 600;
    if (hasLongTime) {
      return {
        role: 'assistant',
        content: `🔍 **Conversation Analysis: Cognitive & Circadian Fatigue**

Your brain has spent significant glucose reserves on deep focus. With extra time available, a non-sleep deep rest session is ideal.

💡 **Best Recommendation for ${userName}**:
**Power Nap & Audio Recharge (10-15 minutes)** to clear adenosine buildup, or a brief **5-minute Walk** to elevate heart rate.`,
        suggested_activity_id: 'powernap',
        suggested_actions: [
          { label: 'Start Power Nap (10m)', action: 'start_powernap' },
          { label: 'Start Walk Break (5m)', action: 'start_walkbreak' }
        ],
        source: 'rule_engine'
      };
    }

    return {
      role: 'assistant',
      content: `🔍 **Conversation Analysis: Mid-Day Energy Dip**

Prolonged static sitting slows venous blood return, decreasing oxygen saturation to your prefrontal cortex.

💡 **Best Recommendation for ${userName}**:
A brisk **5-Minute Walk Break** to stimulate lower-limb circulation, paired with a glass of cool water from **HydrateMate**.`,
      suggested_activity_id: 'walkbreak',
      suggested_actions: [
        { label: 'Start Walk Break (5m)', action: 'start_walkbreak' },
        { label: 'Log Water (HydrateMate)', action: 'start_hydratemate' }
      ],
      source: 'rule_engine'
    };
  }

  // F. DEHYDRATION / THIRST
  if (analysis.symptoms.includes('dehydration') || /water|thirsty|drink/.test(q)) {
    return {
      role: 'assistant',
      content: `🔍 **Conversation Analysis: Fluid & Electrolyte Balance**

Even mild dehydration of 1-2% impairs working memory, processing speed, and increases headache frequency for desk workers.

💡 **Best Recommendation for ${userName}**:
**HydrateMate Checkpoint (1 minute)**.
Grab a 250ml glass of water, take a moment to stand up, and reset your posture.`,
      suggested_activity_id: 'hydratemate',
      suggested_actions: [
        { label: 'Start HydrateMate (1m)', action: 'start_hydratemate' }
      ],
      source: 'rule_engine'
    };
  }

  // G. TIGHT TIME CONSTRAINTS (e.g. 2 minutes or less)
  if (analysis.timeLimitSeconds && analysis.timeLimitSeconds <= 120) {
    if (analysis.timeLimitSeconds <= 30) {
      return {
        role: 'assistant',
        content: `With only 30 seconds before your next task, **20-20-20 EyeCare (20s)** is your best choice: look 20 feet away to relax your visual focus without missing a beat!`,
        suggested_activity_id: 'eyecare',
        suggested_actions: [
          { label: 'Start EyeCare (20s)', action: 'start_eyecare' }
        ],
        source: 'rule_engine'
      };
    }

    return {
      role: 'assistant',
      content: `With just 2 minutes available, **Desk Yoga (2m)** or **Mind Reset (1m)** are perfectly calibrated to loosen your shoulders or calm your mind before your next meeting.`,
      suggested_activity_id: 'deskyoga',
      suggested_actions: [
        { label: 'Start Desk Yoga (2m)', action: 'start_deskyoga' },
        { label: 'Start Mind Reset (1m)', action: 'start_mindreset' }
      ],
      source: 'rule_engine'
    };
  }

  // 6. DEFAULT INTELLIGENT COMPANION RESPONSE
  return {
    role: 'assistant',
    content: `🔍 **Conversation Analysis & Recommendation**

I heard you say: *"${userMsg}"*.

As a ${userRole}, maintaining cognitive rhythm requires balancing three pillars:
1. **Optical Health**: Resting your eyes from monitors every 20-45 minutes.
2. **Biomechanics**: Relieving neck, shoulder, and wrist tension.
3. **Mental Clarity**: Oxygenating with structured diaphragmatic breathing.

Which of these resets would feel best for you right now?`,
    suggested_actions: [
      { label: 'Eye Care (20s)', action: 'start_eyecare' },
      { label: 'Desk Yoga (2m)', action: 'start_deskyoga' },
      { label: 'Mind Reset (1m)', action: 'start_mindreset' },
      { label: 'Hydrate (1m)', action: 'start_hydratemate' }
    ],
    source: 'rule_engine'
  };
}
