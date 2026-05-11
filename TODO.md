# TODO

## Capacitor link resolver
- [ ] Implement a link resolver that maps `capacitor://localhost/track/<id>` and `capacitor://localhost/album/<id>` to the corresponding `https://monochrome.tf/track/<id>` and `https://monochrome.tf/album/<id>` URLs so downloads initiated inside the Capacitor app reach the proper HTTP endpoints.
  - Issue: downloads fail because the Capacitor app hands off `capacitor://` deep links that the download pipeline cannot resolve.
  - Desired behavior: translate those deep links into equivalent `https://monochrome.tf/` links before attempting to download so resources are accessible.
