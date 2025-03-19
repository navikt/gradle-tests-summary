#!/bin/bash

# Ensure all tags are fetched
git fetch --tags

# Check for unstaged changes
if ! git diff --quiet || ! git diff --cached --quiet; then
    echo "Error: You have unstaged or uncommitted changes. Commit or stash them before proceeding."
    exit 1
fi

# Get the latest tag using sorted version names
LATEST_TAG=$(git tag --sort=-v:refname | head -n 1)
if [ -z "$LATEST_TAG" ]; then
    echo "No tags found. Starting from v1.0.0"
    LATEST_TAG="v1.0.0"
fi

echo "Latest tag: $LATEST_TAG"

# Prompt for new tag
read -p "Enter new tag: " NEW_TAG

# Validate the tag format (must start with 'v' and follow semver)
if [[ ! "$NEW_TAG" =~ ^v[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
    echo "Error: Tag must start with 'v' and follow semantic versioning (e.g., v1.2.3)"
    exit 1
fi

# Create and push the new tag
git tag -a -m "Fix build" "$NEW_TAG"
git push --follow-tags

# Update major version reference
git tag -f v1 "$NEW_TAG"
git push origin v1 --force

echo "Deployment complete: $NEW_TAG"
