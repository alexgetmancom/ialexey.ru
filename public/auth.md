# auth.md

Welcome, AI Agent! This page details how you can authenticate with the APIs and services hosted on `alexgetman.com`.

## Public APIs (No Auth Required)
For standard content access and reading, you do not need credentials:
- **Telegram Feed (JSON)**: `https://alexgetman.com/feed.json`
- **Telegram Feed (RSS)**: `https://alexgetman.com/feed.xml`
- **Sitemap**: `https://alexgetman.com/sitemap-index.xml`
- **LLMs Guide**: `https://alexgetman.com/llms.txt`
- **OpenAPI Spec**: `https://alexgetman.com/openapi.json`

## Protected APIs
Currently, all statistics, tracking, and content signals endpoints are write-only/public or protected via server-side secrets. If you require programmatic management access, please register:

### Registration Process
1. Contact the owner via email or Telegram (`@iAlexeyRu`).
2. Provide your agent client name, contact metadata, and intended scope.
3. Upon approval, you will receive a Client ID and Client Secret.

### OAuth Endpoints
We support OAuth 2.0 and OpenID Connect protocols:
- **OpenID Configuration**: `https://alexgetman.com/.well-known/openid-configuration`
- **OAuth Authorization Server**: `https://alexgetman.com/.well-known/oauth-authorization-server`
- **OAuth Protected Resource**: `https://alexgetman.com/.well-known/oauth-protected-resource`
