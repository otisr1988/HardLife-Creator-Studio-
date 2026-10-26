# HardLife Creator Studio — Security Specification

## 1. System Invariants
- Single-Owner Architecture: HardLife Creator Studio is strictly restricted to owner `kodir1988@gmail.com`.
- Zero Trust: No public read or write access allowed to any collection or document.
- Verified Email Required: All read and write operations require `request.auth.token.email_verified == true`.
- Relational and Identity Invariant: For all resources (`projects`, `media`, `renders`, `publications`, `activity_logs`, `automations`, `connected_accounts`), the `ownerId` must match `request.auth.uid`.
- Activity Logs are Append-Only: Once an audit log is written, it cannot be updated or deleted.
- ID Poisoning Guard: All path IDs must conform to alphanumeric characters and dashes (`isValidId`).

## 2. The Dirty Dozen Payloads (Negative Tests)
1. Unauthenticated Project Read: Request with null auth -> Denied.
2. Unverified Email Write: Attempt to create project when `email_verified: false` -> Denied.
3. Impersonation Attack: Non-owner email (e.g. `intruder@evil.com`) attempting to write or read -> Denied.
4. Shadow Field Injection: Attempt to write `isGlobalAdmin: true` or unknown fields on a `users` document -> Denied.
5. Project Tampering: Attempt to update another user's project ID or change `ownerId` -> Denied.
6. Malformed Document ID: Attempt to write document with 2000-character junk string as ID -> Denied.
7. Activity Log Deletion: Attempt to delete an audit trail record -> Denied.
8. Activity Log Modification: Attempt to update an existing audit trail record -> Denied.
9. Render Status Override: Unauthorized non-owner attempting to force render status to `completed` -> Denied.
10. Blanket List Scraping: Querying `projects` without `where("ownerId", "==", auth.uid)` filter -> Denied.
11. Excessive String Buffer (Denial of Wallet): Submitting a 5MB payload in a 200-char max title field -> Denied.
12. OAuth Credential Read by Third-Party: Attempt to read `connected_accounts` without matching owner UID -> Denied.
