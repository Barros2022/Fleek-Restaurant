# Restaurant Feedback Form Design Guidelines

## Design Approach
**Reference-Based**: Drawing from premium mobile experiences (Airbnb reviews, Uber ratings, modern fintech apps). Focus on clarity, generous touch targets, and delightful micro-interactions that make form completion feel effortless.

## Layout System
**Spacing Units**: Tailwind units of 4, 6, and 8 for consistent rhythm
- Card padding: p-6
- Section gaps: space-y-8
- Input spacing: space-y-4
- Touch target minimum: h-12

**Container Strategy**:
- Max-width: max-w-lg (optimized for mobile comfort)
- Centered with mx-auto
- Side padding: px-4 (breathing room on mobile)

## Typography Hierarchy
**Font Family**: 
- Primary: Inter (Google Fonts) - clean, modern, excellent mobile readability
- Single family keeps it focused

**Scale**:
- Page title: text-2xl font-bold (welcoming but not overwhelming)
- Section headers: text-lg font-semibold
- Question labels: text-base font-medium
- Helper text: text-sm text-gray-600
- Button text: text-base font-semibold

## Component Library

### Form Structure
**Single-page scroll design** with clear visual sections separated by subtle dividers or spacing:

1. **Header Card**: Restaurant branding area with name/logo placeholder, warm greeting text, estimated completion time (e.g., "2 minutes")

2. **NPS Section**: 
   - Clear question: "How likely are you to recommend us?"
   - 11 buttons (0-10) in responsive grid (grid-cols-6 on mobile, all visible)
   - Each button: rounded-lg, equal size, generous tap area (min 44x44px)
   - Selected state: filled with accent color

3. **Star Rating Sections** (4 cards):
   - Food Quality, Service, Wait Time, Ambiance
   - Each in its own card with rounded-xl borders
   - 5 star icons (size-8) with tap targets
   - Stars fill from left to right on selection

4. **Comments Section**:
   - Textarea with rounded-xl border
   - Placeholder: "Share your experience with us..."
   - Auto-resize or fixed comfortable height (h-32)
   - Character count optional (max 500)

5. **Submit Section**:
   - Full-width primary button (w-full h-12)
   - Rounded-xl for consistency
   - "Submit Feedback" text
   - Secondary text below: "Thank you for your time!"

### Interactive Elements
**All touch targets**: Minimum 44x44px (iOS/Android standard)

**Buttons**:
- NPS buttons: rounded-lg, border-2, transition effects
- Star rating: Large tappable icons with smooth fill animation
- Submit button: Bold, prominent, disabled state until form valid

**Form Inputs**:
- Rounded-xl borders throughout
- Focus states with accent color ring
- Clear visual feedback on selection/input

### Card Design
**All sections wrapped in cards**:
- Rounded-xl borders
- Subtle shadow or border (border-gray-200)
- White/light background
- Consistent padding (p-6)
- Space between cards (space-y-6)

## Animations
**Minimal, purposeful only**:
- NPS button scale on tap (scale-95)
- Star fill animation on selection
- Submit button loading state (if async)
- Success state after submission (checkmark + message)

## Images
**No hero image** - This is a focused utility form. Users scan QR code and want immediate clarity.

**Optional subtle elements**:
- Small restaurant logo/icon at top (if branding needed)
- Success state illustration (celebration icon after submission)

## Page Flow
1. **Entry**: Clean header with restaurant name, friendly greeting
2. **Progression**: Visual hierarchy guides down the page naturally
3. **Completion**: Clear submit button, always visible/accessible
4. **Success**: Replace form with thank you message + optional "Done" button

## Mobile-First Specifics
- Portrait orientation optimized
- Thumb-friendly: Key actions in easy reach
- No horizontal scrolling
- Generous tap targets prevent mis-taps
- Single column keeps focus clear
- Progress indicator optional (3 of 6 completed)

## Accessibility
- High contrast ratios for all text
- Clear focus indicators for keyboard navigation
- ARIA labels for star ratings and NPS buttons
- Form validation with helpful error messages
- Touch target sizes exceed WCAG standards