# CaddyAI iOS App - UAT Test Scripts

**Version:** 1.0
**Date:** January 2026

---

## How to Use This Document

Each test script below is a step-by-step guide for testers. Follow the steps exactly and record results in the checkbox column.

---

## Script 1: First-Time User Journey

**Objective:** Simulate a new user's first experience with CaddyAI

**Prerequisites:**
- Fresh app install (or delete app data)
- Device charged and unlocked

### Steps

```
┌─────┬────────────────────────────────────────────────────────────────────┬──────┐
│ #   │ Action                                                             │ ✓/✗  │
├─────┼────────────────────────────────────────────────────────────────────┼──────┤
│ 1   │ Tap CaddyAI app icon                                               │      │
│ 2   │ VERIFY: Splash screen appears with forest green background        │      │
│ 3   │ VERIFY: CaddyAI logo animates (pulsing)                            │      │
│ 4   │ VERIFY: Gold loading bar progresses                                │      │
│ 5   │ WAIT: ~2.5 seconds                                                 │      │
│ 6   │ VERIFY: Splash fades out smoothly                                  │      │
│ 7   │ VERIFY: Onboarding Page 1 appears ("Rally Your Crew")              │      │
│ 8   │ VERIFY: Person.3 icon is pulsing                                   │      │
│ 9   │ VERIFY: "Skip" button visible in top right                         │      │
│ 10  │ VERIFY: "Continue" button at bottom                                │      │
│ 11  │ VERIFY: Page indicator shows 4 dots (first is wide)                │      │
│ 12  │ Tap "Continue" button                                              │      │
│ 13  │ FEEL: Light haptic feedback                                        │      │
│ 14  │ VERIFY: Page 2 appears ("Vote on Destinations")                    │      │
│ 15  │ VERIFY: Thumbs up icon with gold accent                            │      │
│ 16  │ Swipe left on screen                                               │      │
│ 17  │ VERIFY: Page 3 appears ("Collect Payments")                        │      │
│ 18  │ Tap "Continue" button                                              │      │
│ 19  │ VERIFY: Page 4 appears ("Plan Every Detail")                       │      │
│ 20  │ VERIFY: Button now says "Get Started"                              │      │
│ 21  │ Tap "Get Started" button                                           │      │
│ 22  │ FEEL: Medium haptic feedback                                       │      │
│ 23  │ VERIFY: Main app appears with tab bar                              │      │
│ 24  │ VERIFY: Scorecard tab is selected                                  │      │
│ 25  │ Force quit app (swipe up from app switcher)                        │      │
│ 26  │ Relaunch app                                                       │      │
│ 27  │ VERIFY: Splash shows, then MAIN APP (no onboarding)                │      │
└─────┴────────────────────────────────────────────────────────────────────┴──────┘
```

**Pass Criteria:** All 27 steps marked ✓

---

## Script 2: Complete Voting Flow

**Objective:** Test the entire voting experience from start to finish

**Prerequisites:**
- App installed and onboarding completed
- Device charged

### Steps

```
┌─────┬────────────────────────────────────────────────────────────────────┬──────┐
│ #   │ Action                                                             │ ✓/✗  │
├─────┼────────────────────────────────────────────────────────────────────┼──────┤
│ 1   │ Tap "Vote" tab in tab bar                                          │      │
│ 2   │ FEEL: Selection haptic                                             │      │
│ 3   │ VERIFY: Name input screen appears                                  │      │
│ 4   │ VERIFY: Person icon is animating                                   │      │
│ 5   │ VERIFY: "Start Voting" button is disabled (grayed)                 │      │
│ 6   │ Tap the name input field                                           │      │
│ 7   │ Type "John Smith"                                                  │      │
│ 8   │ VERIFY: "Start Voting" button is now enabled (forest green)        │      │
│ 9   │ Tap "Start Voting" button                                          │      │
│ 10  │ FEEL: Light haptic                                                 │      │
│ 11  │ VERIFY: Loading indicator appears                                  │      │
│ 12  │ WAIT: 1-2 seconds                                                  │      │
│ 13  │ VERIFY: Swipe cards appear                                         │      │
│ 14  │ VERIFY: Progress shows "1 of 2"                                    │      │
│ 15  │ VERIFY: Your name "John Smith" appears                             │      │
│ 16  │ VERIFY: Card shows trip details (title, destination, price)        │      │
│ 17  │ Start dragging card to the RIGHT                                   │      │
│ 18  │ VERIFY: Green "YES" text appears                                   │      │
│ 19  │ VERIFY: Card rotates slightly                                      │      │
│ 20  │ Release card past threshold (>100px)                               │      │
│ 21  │ FEEL: Success haptic                                               │      │
│ 22  │ VERIFY: Card animates off screen                                   │      │
│ 23  │ VERIFY: Next card appears                                          │      │
│ 24  │ VERIFY: Progress shows "2 of 2"                                    │      │
│ 25  │ Start dragging card to the LEFT                                    │      │
│ 26  │ VERIFY: Red "NOPE" text appears                                    │      │
│ 27  │ Release card past threshold                                        │      │
│ 28  │ FEEL: Medium haptic                                                │      │
│ 29  │ VERIFY: Card animates off screen                                   │      │
│ 30  │ FEEL: Success haptic (voting complete)                             │      │
│ 31  │ VERIFY: Results screen appears                                     │      │
│ 32  │ VERIFY: Chart icon at top                                          │      │
│ 33  │ VERIFY: "Thanks for voting, John Smith!" message                   │      │
│ 34  │ VERIFY: Winner has "Top Pick" badge with crown                     │      │
│ 35  │ VERIFY: Percentages add up correctly                               │      │
│ 36  │ VERIFY: Progress bars match percentages                            │      │
└─────┴────────────────────────────────────────────────────────────────────┴──────┘
```

**Pass Criteria:** All 36 steps marked ✓

---

## Script 3: Roster Management

**Objective:** Verify roster displays and nudge functionality works

### Steps

```
┌─────┬────────────────────────────────────────────────────────────────────┬──────┐
│ #   │ Action                                                             │ ✓/✗  │
├─────┼────────────────────────────────────────────────────────────────────┼──────┤
│ 1   │ Tap "Roster" tab in tab bar                                        │      │
│ 2   │ FEEL: Selection haptic                                             │      │
│ 3   │ VERIFY: "The Roster" title appears                                 │      │
│ 4   │ VERIFY: "X/12 Full" badge (forest green capsule)                   │      │
│ 5   │ VERIFY: Priority note in italic text                               │      │
│ 6   │ Scroll to view roster list                                         │      │
│ 7   │ VERIFY: Members numbered #1, #2, #3, etc.                          │      │
│ 8   │ VERIFY: Each member has avatar circle with initials                │      │
│ 9   │ VERIFY: Commissioner (Commish Dave) has trophy icon                │      │
│ 10  │ VERIFY: Handicap displayed (e.g., "8.2 HCP")                       │      │
│ 11  │ VERIFY: "Paid" shown in green for paid members                     │      │
│ 12  │ VERIFY: "Pending" shown in red for unpaid members                  │      │
│ 13  │ Find a member with "Pending" status                                │      │
│ 14  │ VERIFY: "Nudge" button appears next to their name                  │      │
│ 15  │ Tap "Nudge" button                                                 │      │
│ 16  │ FEEL: Light haptic                                                 │      │
│ 17  │ VERIFY: Toast appears at bottom: "Nudge sent to [name]"            │      │
│ 18  │ VERIFY: Toast has checkmark icon and dark background               │      │
│ 19  │ WAIT: 2.5 seconds                                                  │      │
│ 20  │ VERIFY: Toast auto-dismisses                                       │      │
│ 21  │ Continue scrolling down                                            │      │
│ 22  │ VERIFY: Red dashed "THE CUT LINE" divider appears                  │      │
│ 23  │ VERIFY: Below cut line, members appear grayed out                  │      │
│ 24  │ VERIFY: Waitlist members have "ON DECK" badge                      │      │
│ 25  │ Scroll back to top                                                 │      │
│ 26  │ VERIFY: Smooth scrolling throughout                                │      │
└─────┴────────────────────────────────────────────────────────────────────┴──────┘
```

**Pass Criteria:** All 26 steps marked ✓

---

## Script 4: Accessibility Testing (VoiceOver)

**Objective:** Verify app works with VoiceOver enabled

**Prerequisites:**
- Enable VoiceOver: Settings → Accessibility → VoiceOver → ON

### Steps

```
┌─────┬────────────────────────────────────────────────────────────────────┬──────┐
│ #   │ Action                                                             │ ✓/✗  │
├─────┼────────────────────────────────────────────────────────────────────┼──────┤
│ 1   │ With VoiceOver ON, open CaddyAI app                                │      │
│ 2   │ HEAR: App name or splash content announced                         │      │
│ 3   │ Wait for main screen                                               │      │
│ 4   │ Swipe right to move through elements                               │      │
│ 5   │ HEAR: Tab bar tabs announced with hints                            │      │
│     │   Expected: "Scorecard, Tab, View trip overview..."                │      │
│ 6   │ Double-tap to select "Roster" tab                                  │      │
│ 7   │ HEAR: "Roster" and content announced                               │      │
│ 8   │ Swipe right through roster list                                    │      │
│ 9   │ HEAR: Member names, handicaps, payment status                      │      │
│ 10  │ Find a "Nudge" button                                              │      │
│ 11  │ HEAR: "Nudge, Button"                                              │      │
│ 12  │ Double-tap to activate                                             │      │
│ 13  │ HEAR: Toast message announced                                      │      │
│ 14  │ Navigate to "Vote" tab                                             │      │
│ 15  │ HEAR: Text field for name announced                                │      │
│ 16  │ Double-tap and enter name using keyboard                           │      │
│ 17  │ Find "Start Voting" button                                         │      │
│ 18  │ Double-tap to start voting                                         │      │
│ 19  │ VERIFY: Voting cards can be navigated                              │      │
│ 20  │ Navigate to action buttons                                         │      │
│ 21  │ HEAR: "Reject" and "Accept" button labels                          │      │
│ 22  │ Double-tap to vote                                                 │      │
│ 23  │ HEAR: Vote recorded / next card                                    │      │
│ 24  │ Complete voting                                                    │      │
│ 25  │ HEAR: Results announced                                            │      │
│ 26  │ VERIFY: All critical content is accessible                         │      │
└─────┴────────────────────────────────────────────────────────────────────┴──────┘
```

**Pass Criteria:** All 26 steps marked ✓

---

## Script 5: Dark Mode Testing

**Objective:** Verify app displays correctly in dark mode

**Prerequisites:**
- Enable Dark Mode: Settings → Display & Brightness → Dark

### Steps

```
┌─────┬────────────────────────────────────────────────────────────────────┬──────┐
│ #   │ Action                                                             │ ✓/✗  │
├─────┼────────────────────────────────────────────────────────────────────┼──────┤
│ 1   │ Enable dark mode in iOS Settings                                   │      │
│ 2   │ Open CaddyAI app                                                   │      │
│ 3   │ VERIFY: Splash screen visible (forest green still works)           │      │
│ 4   │ Navigate to Scorecard tab                                          │      │
│ 5   │ VERIFY: Trip hero card readable                                    │      │
│ 6   │ VERIFY: Finance widget readable                                    │      │
│ 7   │ VERIFY: Leaderboard text visible                                   │      │
│ 8   │ Navigate to Roster tab                                             │      │
│ 9   │ VERIFY: Member list readable                                       │      │
│ 10  │ VERIFY: Cut line visible                                           │      │
│ 11  │ Navigate to Vote tab                                               │      │
│ 12  │ VERIFY: Input field visible                                        │      │
│ 13  │ VERIFY: Buttons have proper contrast                               │      │
│ 14  │ Navigate to Itinerary tab                                          │      │
│ 15  │ VERIFY: Timeline dots visible                                      │      │
│ 16  │ VERIFY: Event cards readable                                       │      │
│ 17  │ VERIFY: Footer quote readable                                      │      │
│ 18  │ Open Control Center                                                │      │
│ 19  │ Toggle to Light Mode                                               │      │
│ 20  │ VERIFY: App adapts instantly (no restart needed)                   │      │
│ 21  │ VERIFY: Colors revert to light mode                                │      │
│ 22  │ Toggle back to Dark Mode                                           │      │
│ 23  │ VERIFY: App adapts instantly                                       │      │
└─────┴────────────────────────────────────────────────────────────────────┴──────┘
```

**Pass Criteria:** All 23 steps marked ✓

---

## Script 6: Haptic Feedback Verification

**Objective:** Confirm haptic feedback is present and appropriate

**Prerequisites:**
- Haptics enabled in iOS Settings
- Volume up (some devices pair haptics with sound)

### Steps

```
┌─────┬────────────────────────────────────────────────────────────────────┬──────┐
│ #   │ Action                                                             │ ✓/✗  │
├─────┼────────────────────────────────────────────────────────────────────┼──────┤
│ 1   │ Open app and complete onboarding if needed                         │      │
│ 2   │ On main screen, tap "Roster" tab                                   │      │
│ 3   │ FEEL: Light "click" haptic (selection)                             │      │
│ 4   │ Tap "Vote" tab                                                     │      │
│ 5   │ FEEL: Same selection haptic                                        │      │
│ 6   │ Tap "Itinerary" tab                                                │      │
│ 7   │ FEEL: Same selection haptic                                        │      │
│ 8   │ Tap "Scorecard" tab                                                │      │
│ 9   │ FEEL: Same selection haptic                                        │      │
│ 10  │ Navigate to Vote tab, enter name, start voting                     │      │
│ 11  │ Swipe card to right (past threshold)                               │      │
│ 12  │ FEEL: Strong success haptic (celebration)                          │      │
│ 13  │ Swipe card to left (past threshold)                                │      │
│ 14  │ FEEL: Medium haptic (confirmation)                                 │      │
│ 15  │ Start swiping but release before threshold                         │      │
│ 16  │ FEEL: Light haptic (snap back)                                     │      │
│ 17  │ Navigate to Roster, find Nudge button                              │      │
│ 18  │ Tap Nudge button                                                   │      │
│ 19  │ FEEL: Light haptic (button press)                                  │      │
│ 20  │ Find any danger-styled button (red)                                │      │
│ 21  │ Tap it                                                             │      │
│ 22  │ FEEL: Warning haptic (stronger vibration)                          │      │
└─────┴────────────────────────────────────────────────────────────────────┴──────┘
```

**Pass Criteria:** All 22 steps marked ✓

---

## Script 7: Performance Testing

**Objective:** Verify app performs within acceptable thresholds

### Steps

```
┌─────┬────────────────────────────────────────────────────────────────────┬──────┐
│ #   │ Action                                                             │ ✓/✗  │
├─────┼────────────────────────────────────────────────────────────────────┼──────┤
│ 1   │ Force quit app completely                                          │      │
│ 2   │ Start stopwatch                                                    │      │
│ 3   │ Tap app icon                                                       │      │
│ 4   │ Stop when main screen appears                                      │      │
│ 5   │ VERIFY: Time < 3 seconds (cold start)                              │      │
│ 6   │ Navigate rapidly between all 4 tabs                                │      │
│ 7   │ VERIFY: No lag or stutter during transitions                       │      │
│ 8   │ Go to Roster tab                                                   │      │
│ 9   │ Scroll up and down quickly                                         │      │
│ 10  │ VERIFY: Smooth 60fps scrolling                                     │      │
│ 11  │ Go to Vote tab, start voting                                       │      │
│ 12  │ Swipe cards rapidly                                                │      │
│ 13  │ VERIFY: Animations are smooth                                      │      │
│ 14  │ Use app for 5 minutes continuously                                 │      │
│ 15  │ VERIFY: No noticeable slowdown                                     │      │
│ 16  │ Check battery usage in Settings                                    │      │
│ 17  │ VERIFY: CaddyAI not in top 3 battery consumers                     │      │
│ 18  │ Force quit and check memory usage (if tools available)             │      │
│ 19  │ VERIFY: Memory usage < 200MB                                       │      │
└─────┴────────────────────────────────────────────────────────────────────┴──────┘
```

**Pass Criteria:** All 19 steps marked ✓

---

## Defect Reporting Template

When a test fails, document using this template:

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│ DEFECT REPORT                                                                   │
├─────────────────────────────────────────────────────────────────────────────────┤
│ ID:          DEF-XXX                                                            │
│ Date:        [Date]                                                             │
│ Tester:      [Name]                                                             │
│ Severity:    [ ] Critical  [ ] High  [ ] Medium  [ ] Low                        │
│                                                                                 │
│ Script:      [Script name and step number]                                      │
│                                                                                 │
│ Summary:     [One-line description]                                             │
│                                                                                 │
│ Steps to Reproduce:                                                             │
│ 1.                                                                              │
│ 2.                                                                              │
│ 3.                                                                              │
│                                                                                 │
│ Expected Result:                                                                │
│ [What should happen]                                                            │
│                                                                                 │
│ Actual Result:                                                                  │
│ [What actually happened]                                                        │
│                                                                                 │
│ Device:      [Model, iOS version]                                               │
│ Build:       [App version/build number]                                         │
│ Screenshot:  [Attach if applicable]                                             │
│                                                                                 │
│ Notes:                                                                          │
│ [Any additional context]                                                        │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## Quick Reference: Expected Haptics

| Action | Expected Feedback |
|--------|-------------------|
| Tab switch | Light selection click |
| Primary button tap | Light tap |
| Danger button tap | Warning vibration |
| Swipe YES complete | Success notification |
| Swipe NO complete | Medium impact |
| Swipe snap back | Light tap |
| Onboarding continue | Light tap |
| Onboarding complete | Medium impact |

---

## Test Sign-Off

| Tester Name | Scripts Completed | Pass Rate | Signature | Date |
|-------------|-------------------|-----------|-----------|------|
| | | | | |
| | | | | |
| | | | | |

---

**Document End**
