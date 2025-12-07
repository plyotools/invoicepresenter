# Prompt for CCC Code Principles Enhancement

## Context: Analysis of Current Session

### What Actually Worked:
1. **Added dummy data for testing** - Critical insight: tests need data to work
2. **Simplified code significantly** - Removed complex logic, made onClick handler direct
3. **Used Playwright for automated testing** - Enabled verification loop
4. **Identified root cause** - onClick not being called or message not rendering

### What Didn't Work:
1. **Went in loops** - Tried same approach multiple times without success
2. **Didn't check online** - Never searched for similar React onClick issues
3. **No clear plan when stuck** - Kept trying random approaches
4. **Lost context** - Didn't maintain clear acceptance criteria throughout
5. **Overcomplicated** - Added too many layers (Mantine Notifications, DOM manipulation, etc.)

### Key Problem:
- Agent got stuck in a loop trying the same approach
- Didn't think broadly or search for solutions
- Didn't create a systematic plan when stuck
- Lost sight of the big picture (just show a message when button is clicked)

---

## Prompt for CCC Code Principles Enhancement

Please add the following mandatory principles to the Coding Principles file under "AI Agent Guidelines" section:

### 19b. Self-Solving and Problem Resolution (MANDATORY)

**CRITICAL**: AI agents must solve problems independently like an intelligent being. You are expected to find solutions yourself, not get stuck in loops.

#### When Stuck or in a Loop:
1. **Always try a different approach** - If you've tried the same approach 2-3 times without success, you MUST try something completely different
2. **Think broadly** - Consider the problem from different angles:
   - Is the problem what you think it is?
   - Are there assumptions you're making that might be wrong?
   - Could the issue be elsewhere in the codebase?
   - Is there a simpler way to achieve the goal?
3. **Search online for solutions** - When encountering a specific technical challenge:
   - Search for similar issues (e.g., "React onClick not firing", "setState not updating")
   - Look for solutions in documentation, Stack Overflow, GitHub issues
   - Check if there are known patterns or best practices
   - Reference how others solved similar problems
4. **Create and execute a plan** - When stuck:
   - **Silently create a plan** (you don't need to show it to the user)
   - Break the problem into smaller, testable steps
   - Define clear acceptance criteria for each step
   - Execute the plan systematically
   - If a step fails, adjust the plan and continue
5. **Maintain context of the big picture** - Don't lose sight of the overall goal:
   - Define clear acceptance criteria that capture the full requirement
   - Ensure acceptance criteria don't lose context of the big picture
   - Regularly check if current approach aligns with the goal
   - If you're solving a sub-problem, ensure it contributes to the main goal

#### Acceptance Criteria Definition:
- **Must be specific and testable** - "Show a message when button is clicked" not "make it work"
- **Must maintain big picture context** - Include the full requirement, not just technical details
- **Must be verifiable** - Can be checked with automated tests or clear manual verification
- **Must be written down** - Define acceptance criteria explicitly before starting implementation

#### Problem-Solving Process:
1. **Understand the problem** - Read error messages, check logs, understand what's actually happening
2. **Define acceptance criteria** - Write down what "fixed" means, maintaining big picture context
3. **Try first approach** - Implement a solution
4. **If stuck after 2-3 attempts**:
   - Stop and think: "What am I assuming that might be wrong?"
   - Search online for similar problems
   - Try a completely different approach
   - Create a plan (silently) and execute it
5. **Verify solution** - Test that acceptance criteria are met
6. **If verification fails** - Go back to step 4, don't repeat the same approach

#### Examples of Different Approaches:
- If React state isn't updating → Try: direct DOM manipulation, refs, useEffect, different state management
- If onClick isn't firing → Try: native event listeners, different event handlers, check event propagation
- If component isn't rendering → Try: simpler component, check conditional rendering, verify state values
- If test is failing → Try: different test approach, manual verification, check if test is correct

#### Never:
- Repeat the same approach more than 2-3 times
- Give up without trying a different approach
- Skip searching online for known solutions
- Work without clear acceptance criteria
- Lose sight of the big picture goal

#### Always:
- Try different approaches when stuck
- Search online for similar problems
- Think broadly about the problem
- Create and execute a plan when stuck
- Maintain context of the big picture
- Define clear, testable acceptance criteria

---

## Integration Note

This should be added as section **19b** in the AI Agent Guidelines, after section **19a. Issue Resolution Process**. It complements the existing debugging principles (section 17) and issue resolution process (section 19a) by adding mandatory requirements for:
- Trying different approaches when stuck
- Searching online for solutions
- Creating and executing plans
- Maintaining big picture context
- Defining clear acceptance criteria

The existing principles already cover:
- Testing in loops until fixed (section 7)
- Verifying fixes (section 17)
- Finding acceptance criteria (section 17, 19a)

This enhancement adds:
- **Mandatory requirement** to try different approaches
- **Mandatory requirement** to search online
- **Mandatory requirement** to create plans when stuck
- **Emphasis** on maintaining big picture context in acceptance criteria

