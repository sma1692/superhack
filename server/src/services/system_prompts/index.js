
export const MASTER_PROMPT = ''
// REMOVED THIS IS NOW IT WILL BE HANDELLED BY MODELFILE

export const FIX_STEPS_SYSTEM_PROMPT = (title, desc, id, tags) => `
Analyze this support ticket and provide what can we do to fix it. Be precise but analsizse each point before suggestions:
YOU HAVE TO Provide FIXING STEPS HERE
Toubleshooting won't work here.

**Ticket Details:**
- Title: ${title}
- Description: ${desc}
- Tags: ${tags}

**Your Task:**
Generate a focused list of 3-5 troubleshooting steps that directly address this issue.


**Requirements:**
- using Get_details tool can help with this query
- Start with the most likely solution
- Keep each step clear and actionable
- Include any prerequisites or warnings
- Assume basic technical competency
- Focus only on relevant solutions (omit generic advice)

**Format:**
Number each step and be specific about what actions to take.`

export const TROUBLESHOOTING_PROMPT = (title, desc, id, tags) =>
  `Ticket ${id}: ${title}
        - ticket-tags : ${tags}

        Issue: ${desc}

        Provide 3-5 preliminary troubleshooting steps to diagnose and potentially resolve this issue quickly or we narrow down the issue.

        Requirements:
        - Try to check if we can use any of the tools available
        - Start with basic checks and common causes
        - Each step should help narrow down the problem
        - Include what to look for or verify
        - Keep steps simple and quick to execute

        Number each step.`

export const CLIENTCOMMS_PROMPT = (title = 'no title', desc = 'no description', id = 'no id', troubleshooting = '<no troubleshooting generated>', fix_steps = '<no fix steps generated>') =>
  `Create a communication script for the technical support agent to use when contacting the customer about this ticket.

            **Ticket Details:**
            - ID: ${id}
            - Title: ${title}
            - Description: ${desc}

            **Troubleshooting Steps Available:**
            ${troubleshooting}

            **Fix Steps Available:**
            ${fix_steps}

            **Your Task:**
            Generate a communication script that guides the support agent on what to say to the customer.

            **Script should include:**

            **Scenario 1 - Initial Contact (no steps taken yet):**
            - Greeting and acknowledgment
            - Confirmation of issue understanding
            - What we plan to do next
            - Expected timeline

            **Scenario 2 - Troubleshooting Phase:**
            - What we've checked so far
            - What we found (or didn't find)
            - Next troubleshooting steps we'll take
            - What we need from the customer (if anything)

            **Scenario 3 - Fix Implementation:**
            - What solution we're applying
            - Why this should resolve the issue
            - Expected downtime or impact (if any)
            - What customer should expect next

            **Requirements:**
            - Write in plain language for non-technical customers
            - Be specific about actions and timelines
            - Set clear expectations at each phase
            - Include questions to ask the customer if needed
            - Keep professional but friendly tone

            Format as a conversational script (2-4 paragraphs per scenario).`

export const RESOLUTION_PROMPT = (title = 'no title', desc = 'no description', id = 'no id', troubleshooting = '<no troubleshooting generated>', fix_steps = '<no fix steps generated>') =>
  `Generate a professional customer response for this support ticket.

            **Ticket Details:**
            - ID: ${id}
            - Title: ${title}
            - Description: ${desc}

            **Troubleshooting Steps Taken:**
            ${troubleshooting}

            **Fix Steps Taken:**
            ${fix_steps}

            **Your Task:**
            Write a clear, professional response based on the situation:

            **If no troubleshooting/fix steps provided:**
            - Greet the customer warmly
            - Acknowledge their ticket submission
            - Confirm we've received their issue and will begin working on it
            - Set initial expectations

            **If troubleshooting/fix steps are provided:**
            1. Acknowledge their issue
            2. Explain steps taken to resolve it
            3. State current status (resolved/in progress/escalated)
            4. Specify next actions - what they should do or what we'll do
            5. Provide timeline if issue is ongoing

            **Requirements:**
            - Use friendly, professional tone
            - Avoid technical jargon unless necessary
            - Be specific about actions taken
            - Set clear expectations
            - Include contact info if escalation needed

            Keep response concise (2-4 paragraphs).`

