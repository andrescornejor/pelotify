# Plan: Sportsreel Match Video Integration

Integrate match videos from Sportsreel into the Pelotify platform to allow users to watch their games directly from the match recap.

## 1. Data Entry: Post-Match Report Flow
Currently, the `PostMatchModal` allows users to report scores and MVP. We will add a way to include the Sportsreel video link.

- [ ] **Modify `PostMatchModal.tsx`**:
    - Add a state for `sportsreelUrl`.
    - Add an input field in a new step or within the 'success' step to allow the user who reports the match to paste the Sportsreel link.
    - Update the `handleSubmit` logic to save this URL to the `matches` table in Supabase.

## 2. Display: Match Recap View
The `PostMatchView` is where users see the final results. We will add a dedicated section for the match video.

- [ ] **Create `src/components/SportsreelPlayer.tsx`**:
    - A specialized component to handle Sportsreel links.
    - Since Sportsreel uses a hash-based SPA (`/#/video/...`), we will primarily provide a high-impact call-to-action (CTA) card that opens the video.
    - *Optional*: Experience with an `<iframe>` to see if it's embeddable (checking for `X-Frame-Options`).
- [ ] **Update `PostMatchView.tsx`**:
    - Check if `match.sportsreel_url` exists.
    - If it does, render the `SportsreelPlayer` component between the scoreboard and the stats/teams sections.
    - Follow the premium aesthetic: Use gradients, blur effects, and the Sportsreel logo/branding.

## 3. Database & API
- [ ] Ensure `sportsreel_url` is properly persisted in the `matches` table.
- [ ] Verify that `useHomeData` or the match fetching logic includes the `sportsreel_url` field.

## 4. Aesthetics
- Use a dark, premium theme for the video player section.
- Add a "Viralizá tu jugada" sub-header to match Sportsreel's branding.
- Include a "Open in Sportsreel" external link for the best mobile experience.
