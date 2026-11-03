# FASD Compass live AI service (switched off)

This folder holds an optional live AI service for the Ask FASD AI page. It is **switched off** and is **not deployed**. The website works fully without it. It is not copied to the live site, because the deploy workflow removes this folder.

## What it does

When switched on, a visitor can press "Ask for a fuller answer (uses live AI, needs internet)" under an approved answer. The service then:

1. Accepts requests only from fasdcompass.co.uk and www.fasdcompass.co.uk.
2. Rejects requests over 4,000 characters and questions over 500 characters.
3. Removes names, dates of birth, NHS numbers, phone numbers, emails and postcodes again, even though the page has already done this.
4. Answers urgent, crisis, safeguarding and questionnaire questions with the approved wording. These never go to the model.
5. Picks up to three approved FASD Compass answers (from `assets/ai-kb.js`) and sends only those, plus the cleaned question, to the model.
6. Checks the reply before returning it. It blocks replies that diagnose, predict risk, blame parents, put difficulties down to FASD, infer exposure from care history, give a "safe" amount of alcohol, ask for personal details, include links not on the allowlist, include numbers not in the approved text, or do not cite an approved source.
7. Labels the reply "AI-written answer based on FASD Compass content" and adds the source and a link to read more.

It does not log what people type. Observability is off in `wrangler.toml`.

## Before switching on

All of these are needed first:

- Clinical review of the approved answers, the system prompt and the live AI label and disclosure.
- DPIA sign-off (see the Phase 6 DPIA draft).
- An updated privacy page.
- A Cloudflare account on the Workers Paid plan, with a spending limit set.

## Deploy steps

1. Install Wrangler: `npm install -g wrangler`.
2. Log in with `wrangler login`, or use an API token. Enter the token through a secure credentials form or your own terminal. **Never put a token or key in this repository.**
3. Optional daily cap: create a KV namespace with `wrangler kv namespace create USAGE`, then add its id to the commented `[[kv_namespaces]]` block in `wrangler.toml`. The default cap is 300 questions a day (`DAILY_CAP`).
4. From this folder, run `wrangler deploy`. The service stays switched off until step 5.
5. Switch on:
   - In `wrangler.toml`, set `LIVE_AI_ENABLED = "true"` and run `wrangler deploy` again.
   - In `assets/ai-live.js`, set `LIVE_AI_ENABLED = true` and set `LIVE_AI_ENDPOINT` to the service address.
   - In `ask-fasd-ai/index.html`, add the service address to `connect-src` in the Content-Security-Policy.
   - Change the disclaimer chip text that says the answers are "not a live AI model. Nothing you type is stored or sent anywhere", so it describes the live option accurately.
   - Publish the updated privacy page.
   - Run all tests, then release through the usual review and approval.

## Rollback

Any one of these turns the live AI off. The approved answers keep working.

- Fastest: set `LIVE_AI_ENABLED = "false"` in `wrangler.toml` and run `wrangler deploy`. The service then returns "disabled" and the button stops working.
- Website: set `LIVE_AI_ENABLED = false` in `assets/ai-live.js` and push. The button disappears.
- Full: run `wrangler delete`, and revert the website to the previous release tag.

## Tests

`node tests/live-ai.test.js` runs the service against a pretend model. No account or internet is needed.
