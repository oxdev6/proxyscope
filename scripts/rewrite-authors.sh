#!/bin/bash
# Rewrite all commits to use your identity.
# Edit the variables below, then run: ./scripts/rewrite-authors.sh

GIT_AUTHOR_NAME="Your Name"
GIT_AUTHOR_EMAIL="your-email@example.com"

# Use GitHub's private email if you prefer: https://github.com/settings/emails
# GIT_AUTHOR_EMAIL="12345678+oxdev6@users.noreply.github.com"

git filter-branch -f --env-filter "
export GIT_AUTHOR_NAME=\"$GIT_AUTHOR_NAME\"
export GIT_AUTHOR_EMAIL=\"$GIT_AUTHOR_EMAIL\"
export GIT_COMMITTER_NAME=\"$GIT_AUTHOR_NAME\"
export GIT_COMMITTER_EMAIL=\"$GIT_AUTHOR_EMAIL\"
" --tag-name-filter cat -- --all

echo ""
echo "Done. Verify with: git log --format='%an <%ae>' | sort -u"
echo "Then push: git push -u origin main --force"
