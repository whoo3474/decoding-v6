# Edge boundary

There is intentionally no Worker main, binding, database, session, authentication, payment, or analytics collector in v6 launch code. This directory reserves the reviewed `/e` aggregate-event boundary only. Adding executable edge code requires the PRD-09 privacy review and an allowlisted schema first.
