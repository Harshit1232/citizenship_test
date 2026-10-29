# Open questions for the owner

Each item has a default already in the code, so nothing is blocked. Each default is a guess, though, and some of the guesses carry risk.

## Must decide before launch

1. **Name.** "Wattle" is a placeholder (`src/lib/site.ts`). Before committing to a name, check:
   - ASIC business names and IP Australia trade marks
   - domain availability
   - that nothing in it implies a government connection (avoid words like "official", "Commonwealth" and "Home Affairs")
2. **Price.** A$29 one-off is a placeholder. The pricing card now says "one payment", not "including GST". The "including GST" wording was removed because GST registration is only required above A$75,000 turnover, and claiming it while not registered would be wrong. Confirm your GST status before showing any tax wording. *(I'm not a tax adviser; check this with an accountant or the ATO.)*
3. **Refund promise.** The site says "14-day refund". That is a promise the business must honour, on top of Australian Consumer Law guarantees, which can't be excluded. Keep it or change it before taking money.
4. **Waitlist.** The "Full access" button is disabled ("Coming soon") because there is nowhere to send sign-ups. Choose a handler (an email tool's form, or a simple endpoint once the export goes away) and set `waitlistEnabled`.
5. **Who you are.** The trust section says "We are independent". People paying for this will want a name or company behind it. An About page with an ABN is planned for the next checkpoint.

## Behaviour changes from the old HTML, kept on purpose

6. **Pass mark rounding.** The old app rounded the percentage before comparing it with 75%. The new one compares the exact fraction (`correct × 100 ≥ 75 × n`). For 20 questions the outcome is identical. It only differs for custom lengths. For example, 41 of 55 is 74.5%: the old app rounded that to 75% and passed it, and the new app fails it. *Confirm the exact-fraction rule is what you want.*
7. **Auto-advance after answering** was removed. Picking an answer no longer jumps to the next question. People taking a timed test should be able to change their mind, and focus jumping away is disorienting for screen-reader users.
8. **Part label on exam questions** was removed. It showed "Part 4: Australian values", which revealed the values questions even when the values tag was switched off.
9. **The values check explains the correct answer only**, not why each wrong option is wrong. The bank has one explanation per question. Explaining each wrong answer would be the strongest paid feature, and it needs about 336 × 2 new explanations written and checked.

## Content and claims

10. **The pass-rate figures** (80.5% before the values change, 68.8% after) come from AAP FactCheck's report of Home Affairs data, published 7 February 2024. They are linked on the page. They count attempts, not people. If Home Affairs publishes newer figures, update `PASS_RATE_CHANGE` in `src/lib/marketing-data.ts`.
11. **Screenshots of the real test.** The "how it works" phone mockups are our own UI, not the official test. Don't add screenshots of the official test or the Home Affairs practice test, because their terms may not allow it.
12. **Answer options.** The bank uses three options per question (`meta.note`: one distractor was dropped from a four-option source). Check that three options still matches the current real test before saying "works like the real one" in paid marketing. *(I believe the real test uses three options per question, but I haven't verified that for this checkpoint.)*
13. **Hero headline.** "Pass your Australian citizenship test the first time" reads as an outcome promise, and there is no data on our users' pass rates to back it. Under Australian Consumer Law, claims about future outcomes need reasonable grounds. Lower-risk options: "Practise for the citizenship test the way it's actually marked", or keep the promise but move it to after launch, once you have first-attempt pass data from users. *(Not legal advice.)*
