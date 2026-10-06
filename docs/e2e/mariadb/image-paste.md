# image-paste

Run 2026-10-06T20:29:19.856Z against http://127.0.0.1:3000.

| screenshot | user | URL | shows |
|---|---|---|---|
| ![](image-paste-pasted.png) | manager | `/issues/1` | The pasted image is uploaded and the markup (inserted by Redmine) is in the note: "A note from the manager.\n<img style=\"width: 160px;\" src=\"clipboard-202610062028-skjjp.png\"><br>\n"; the issue form (#update) is open |
| ![](image-paste-saved.png) | manager | `/issues/1` | After saving the note the image is shown inline and is an attachment of the issue |
| ![](image-paste-auto-submit-off.png) | manager | `/issues/1` | With auto submit off the user is reminded to save the issue: "Remember to save your issue! This ensures that any attachments you've added are properly saved too." |
| ![](image-paste-image-paste-off.png) | manager | `/issues/1` | With "Enable Image Paste" off a pasted image does nothing |
| ![](image-paste-image-with-text.png) | manager | `/issues/1` | An image that comes with plain (non-table) text is still uploaded |
| ![](image-paste-reporter.png) | reporter | `/issues/1` | A reporter has no edit link on the manager's note: no place to paste an image |
| ![](image-paste-outsider-private.png) | outsider | `/issues/6` | An outsider cannot open an issue of the private project |
| ![](image-paste-anonymous.png) | anonymous | `/issues/1` | Anonymous users see the issue without an editor |
