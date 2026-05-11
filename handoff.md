# Monochrome iOS Handoff

## What we discussed

- The repository splits configs between build/tooling files (`package.json`, `vite.config.ts`, `capacitor.config.ts`, Docker/Capacitor setups) and runtime settings stored via `localStorage`/`MonochromeDB`. You already exported your own settings into `/Users/rd/.config/monochrome` and symlinked `.env` + `settings.export.json` for easy swaps.
- Running the local Vite dev server was useful for testing, but the native experience ended up being a Capacitor-wrapped read-only build with local storage imports instead of OAuth-based accounts.
- The public Appwrite/OAuth flow cannot work inside the iOS app without backend changes, so we treated the iPhone build as a personal client: we moved login prompts to the email/credential path (Last.fm works now) and hid broken flows.
- You wanted a more iOS-like UI (solid dropdown, rounded tabs, bigger font, download prompt into Files, better spacing) and asked for notes when handing the project to Claude.

## What we implemented (key files)

- **`capacitor.config.ts`** now uses `appId: 'com.rd.monochrome'` and `appName: 'Monochrome'` to match the Xcode target. The native bundle sync (`npx cap sync ios`) writes the same values into `ios/App/App/capacitor.config.json`, so builds stay consistent.
- **`js/app.js`** detects `isIos`, adds an `ios-native` class, hides the OAuth buttons via the account dropdown while keeping email restore, and switches the local-folder CTA to a friendly warning when running on a device.
- **`styles.css`** now contains `body.ios-native` rules including:
    - Safe-area padding for notch (`padding-top: env(safe-area-inset-top)`)
    - Safe-area padding for bottom home indicator
    - Solid dropdown backgrounds (`rgb(20, 20, 20)`) instead of transparent
    - Rounded dropdowns, padded header tabs/buttons
    - Fullscreen overlay top padding
    - Close button top position adjustment for notch
    - Controls bottom padding for safe area
    - Modal padding for safe area
- **`js/settings.js`** already handles Last.fm credentials, and we leaned it to show the username/password flow automatically on iOS instead of `window.open`. Libre.fm was left untouched as you don't use it.
- **`js/download-utils.ts`** - Originally tried Web Share API, but blob URLs don't work in Capacitor sandbox. Now opens `monochrome.rip` in a new tab with instructions to download from the web version.

## Decisions made

1. Treated the iPhone build as a local client: OAuth flows remain available in the browser but are replaced with an explanatory menu + email flow on iOS. This avoids the `Invalid success param` Appwrite errors without needing backend changes.
2. Polished the UI by adding device-targeted CSS via `body.ios-native` rather than reworking the entire layout. Rounded dropdowns, padded tabs, bigger buttons, and safe-area handling give the build a more native feel.
3. **Downloads**: Web Share API with files doesn't work in Capacitor WebView. The best workaround is opening `monochrome.rip` in Safari and prompting user to download from there. This is a fundamental iOS sandbox limitation - blob URLs can't be opened from WebView.
4. Rebuilt the bundle and synced Capacitor assets after every change to keep the sideloaded app current.

## Current status / what Claude should know

- The native build is running; Last.fm credential auth works, and the UI now hides the broken OAuth options (account dropdown explains the limitation). Local folder playback is disabled on device with a warning. The `ios-native` class is set before the user-agent spoofing block.
- Downloads now open `monochrome.rip` with an alert prompting the user to download from the web version. This works but isn't ideal - a native Capacitor file-share plugin could fix this in the future.
- The visualizer/fullscreen close button now respects the notch area via extra top padding.
- Dropdowns now have solid backgrounds instead of being transparent.
- Safe-area handling added to: body, app container, fullscreen overlay, close button, controls, modals.
- Many WebView logs (constraints, accessibility, service bootstrap, PocketBase warnings) are normal for Capacitor and can be ignored unless they surface real crashes.
- Source control still has the earlier iOS project changes (bundle ID, Info.plist, Xcode workspace updates) and the new JS/CSS/download files; keep `bun run build` + `npx cap sync ios` in the workflow before reinstalling.
- No additional backend work was done: Appwrite config, PocketBase syncing, and Libre.fm flows remain untouched.

## Known limitations

- Downloads: Blob URLs don't work in Capacitor sandbox. Only workaround is using web version.
- Local file playback: Disabled because File System Access API doesn't work in WebView.

## Next steps for Claude (if you want to continue polishing)

- Replace remaining `alert`/`confirm` calls with custom modals for a cleaner iOS feel
- Consider adding a Capacitor file-share plugin for native downloads
- Tune safe-area spacing for any remaining UI elements
- The handoff workflow: `bun run build && npx cap sync ios`
