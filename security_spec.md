# Security Specification: Ministry of Education (MOE) Oman Test Moderation System

This specification lays out the Attribute-Based Access Control (ABAC) invariants and security tests for the Ministry of Education Oman (moe.om) test and quiz moderation portal.

## 1. Core Security Invariants

1. **Domain Isolation (Strict MOE constraint)**:
   - Any user making standard database modifications or reading restricted data must be authenticated with an email that ends exactly in `@moe.om`.
   - The user's email verification claim must be validated: `request.auth.token.email_verified == true`.

2. **Role Integrity & Profile Lockdown**:
   - Users can only read and write their own `/users/{userId}` documents.
   - Users cannot update their own `role` once initialized, to prevent privilege escalation (e.g. a school elevating itself to a moderator).
   - Admin roles can only be granted via a trusted database configuration, not self-assigned.

3. **School Capabilities**:
   - A user with the role `school` can read their own uploaded assessments and list them.
   - A user with the role `school` can create new assessments, with `status` initially set strictly to `Pending`, and `schoolId` matching their authenticated UID.
   - A `school` can update an assessment if, and only if, it was uploaded by them AND its current status is either `Pending` or `Revision Request`. Once a test is `In Progress` or `Approved` by a moderator, it is completely locked from further school edits.

4. **Moderator Capabilities**:
   - A user with the role `moderator` can read all assessments in the system.
   - A `moderator` can claim any assessment that has a status of `Pending`. This transitions the status to `In Progress` and writes their `moderatorId`.
   - A `moderator` can update assessments assigned to them to provide feedback and transition the status to `Approved` or `Revision Request`. They cannot edit tests assigned to other moderators.

5. **Relational Integrity**:
   - All logs under `/assessments/{assessmentId}/logs/{logId}` must inherit access from the parent assessment (Master Gate pattern) and have a valid ID format.

---

## 2. The "Dirty Dozen" Malicious Payloads

The following malicious scenarios must be strictly blocked by the Firestore Rules Engine, resulting in `PERMISSION_DENIED`:

| ID | Description | Malicious Payload / Operation | Expected Result |
|----|-------------|-------------------------------|-----------------|
| D1 | Non-MOE Domain Access | Signed in with `attacker@gmail.com` trying to register user profile | `PERMISSION_DENIED` |
| D2 | Unverified Email bypass | Signed in user with `school@moe.om` but `email_verified == false` trying to create a test | `PERMISSION_DENIED` |
| D3 | Self-Assigned Moderator Role | School user attempts to write their user profile setting `role: "moderator"` | `PERMISSION_DENIED` |
| D4 | Shadow Role Escalation | Existing user profile updating `role` from `"school"` to `"moderator"` | `PERMISSION_DENIED` |
| D5 | Direct Read of Other School Profile | Authenticated user trying to read `/users/targetSchoolUID` belonging to another school | `PERMISSION_DENIED` |
| D6 | Foreign Test Overwrite | School A attempting to update or overwrite an assessment belonging to School B | `PERMISSION_DENIED` |
| D7 | Direct Creation of Approved Test | School creating a new test with `status: "Approved"` bypassing moderation review | `PERMISSION_DENIED` |
| D8 | Post-Approval School Edit | School trying to alter questions on a test after it was already approved | `PERMISSION_DENIED` |
| D9 | Unauthorized Test Claim | Moderator B trying to edit or review an assessment claimed by Moderator A | `PERMISSION_DENIED` |
| D10 | Non-Claimed Review Injection | Moderator injecting feedback/reviews directly onto a "Pending" test without claiming it | `PERMISSION_DENIED` |
| D11 | Malformed ID Poisoning | Attempt to create an assessment with a document name consisting of 1.5KB of junk characters | `PERMISSION_DENIED` |
| D12 | Orphan Log Creation | Writing a log entry directly into a subcollection using a random, non-existent assessment ID | `PERMISSION_DENIED` |

---

## 3. Deployment Security Checklist

This spec serves as the reference point for our Firestore Security configuration. We enforce complete, zero-trust rules verifying paths, sizes, and domains without relying on client-enforced constraints.
