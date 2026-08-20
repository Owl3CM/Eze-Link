# Changelog

## 0.3.1

- Correct installed agent guidance to reference only the runtime and declaration
  files that are present in the npm package.
- Add an exact-package audit that rejects missing entry points, broken local
  documentation links, absent inline path claims, and unintended internal files.
- No runtime behavior changes from 0.3.0.

## 0.3.0

- Make request cancellation explicit through `abortId`, keep retries opt-in, and
  expose consistent typed request, upload, and timeout errors.
- Correct expired-TTL cache insertion and cached paginator merging.
- Add portable agent documentation, package metadata, and release safeguards.
