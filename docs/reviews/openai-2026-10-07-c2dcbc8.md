# OpenAI review c2dcbc8

Model `gpt-5`, range `bb5763d..c2dcbc8`, 3 file(s), 1 request(s), 10366 tokens.

Add a `Resolution:` line under every finding: fixed in <commit>, or why not.

## Part 1 of 1

- Severity: minor
  File: app/views/redmine_paste_as_wiki_tables/_script.html.erb:33 (isTable), 41 (toTable)
  Problem: trimLineBreaks only strips CR/LF at the ends. Leading or trailing whitespace-only lines (containing spaces and/or tabs but no CR/LF) are now preserved. This can cause isTable to reject valid TSV (false negative) or toTable to include an extra empty row. With the previous $.trim, trailing spaces at the very end were removed, so such inputs were accepted/converted.
  Failure scenario: Paste "A\tB\n1\t2\n   " (note: spaces after the final newline) into a wiki editor. Expected: formatted table. Actual: isTable sees three lines, the last one has no tab, returns false; plugin falls through and the plain TSV is pasted. Similarly, paste "   \nA\tB\n1\t2": the leading whitespace-only line causes isTable to return false, so no conversion.
  Fix: After splitting, drop leading/trailing whitespace-only lines before detection and conversion (or make trimLineBreaks also remove trailing/leading whitespace-only lines while still preserving a leading tab in the first data line). For example:
  - In both isTable and toTable, immediately after lines = trimLineBreaks(text).split(/\r?\n/); add:
    while (lines.length && /^\s*$/.test(lines[0])) lines.shift();
    while (lines.length && /^\s*$/.test(lines[lines.length - 1])) lines.pop();
  - Keep the rest of the logic unchanged. Add e2e cases covering these two inputs.

  Resolution: valid, fixed in the next commit (see git log): `trimLineBreaks` now also strips blank lines made of spaces at both ends, and keeps a leading tab (empty first cell) and tab-only rows. e2e `table-paste.mjs` covers both inputs from the finding. PostgreSQL: plugin tests 8/0 failures, e2e 40 screenshots / 0 problems.
