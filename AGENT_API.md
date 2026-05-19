# Agent API: lxgic-tickets

For programmatic polling of all tickets (cron jobs, the Lxgic agent).

## Endpoint

`GET https://lxgic-tickets.vercel.app/api/admin/tickets`

## Auth

Two options:

1. Cookie: `admin_session=ok` (interactive admin).
2. Bearer token (for bots):

```
Authorization: Bearer $ADMIN_API_TOKEN
```

`ADMIN_API_TOKEN` is stored in Vercel env and `.env.local`. Rotate by replacing in both places.

## Query params

| Param | Effect |
| ----- | ------ |
| `since` | ISO timestamp; only tickets with `updated_at >= since` |
| `status` | open, in_progress, resolved, wontfix, duplicate |
| `severity` | low, medium, high, critical |
| `project` | project UUID |

## Sample curl

```bash
curl -s "https://lxgic-tickets.vercel.app/api/admin/tickets?since=2026-05-18T00:00:00Z&status=open" \
  -H "Authorization: Bearer $ADMIN_API_TOKEN" | jq .
```

## Response

```json
{
  "tickets": [
    {
      "id": "uuid",
      "ticket_number": 12,
      "project_id": "uuid",
      "user_id": "uuid|null",
      "title": "Bug title",
      "description": "Long text",
      "severity": "high",
      "status": "open",
      "reporter_name": "Kai",
      "reporter_contact": "kai@example.com",
      "created_at": "ISO",
      "updated_at": "ISO",
      "projects": { "name": "Lxgic-MM Solana", "slug": "lxgic-mm-solana" },
      "ticket_attachments": [
        { "url": "https://...", "filename": "screenshot.png" }
      ],
      "ticket_replies": [
        { "author": "admin", "body": "Fixed in 1.2.3", "is_admin": true, "created_at": "ISO" }
      ]
    }
  ],
  "count": 1,
  "fetched_at": "ISO"
}
```

## Notes

- Unauthorized requests return `401 {"error":"Unauthorized"}`.
- Tickets are sorted by `updated_at desc`.
- For incremental polling: store `fetched_at`, pass it back as `since` next run.
