# TTI AI Phone Agent — Go Live (No Twilio required)

Business line target: **(747) 301-8586**  
Company: Total Transformation Inc. / Aaron T. Reddix  
Source: Drive pack `01_AI_PHONE_AGENT_NO_TWILIO_PACK.md` + Cold Call Code principles

## Pick one platform (fund once)
| Platform | Best for | Signup |
|---|---|---|
| **Bland AI** (Drive default) | Fast production phone agents | https://www.bland.ai |
| **Retell AI** | Natural voice quality | https://www.retellai.com |
| **Vapi** | Full control + JSON below | https://vapi.ai |
| Synthflow | No-code | https://synthflow.ai |

## Steps (simple)
1. Create account on Bland **or** Vapi **or** Retell.
2. Add a payment method (platform minutes are paid by you).
3. Create Assistant / Agent.
4. Paste **inbound** prompt from `agents/inbound-system-prompt.txt`.
5. Set first message to the greeting in that file.
6. For Vapi: import fields from `agents/vapi-assistant.json`.
7. Attach phone: free platform number first, then port **747-301-8586** when ready.
8. Optional: outbound agent using `agents/outbound-system-prompt.txt`.
9. Test 5 calls: happy path, price question, not interested, ebook buyer, hangup.
10. Turn on 24/7.

## After a YES or "I paid"
- Card ebook buyers → https://aaronreddix1987-sketch.github.io/thank-you.html
- Chime → confirm $ceomrreddix note, then send download or onboarding text
- AI Admissions sale → text onboarding + book Aaron callback

## Sales page already live
https://aaronreddix1987-sketch.github.io/agents.html

## Compliance
- Say you are AI when relevant
- Outbound: business lines, honor STOP
- No clinical guarantees
- HIPAA BAA only if client needs PHI handling
