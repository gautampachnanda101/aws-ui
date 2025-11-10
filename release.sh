#!/bin/bash

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_info() {
    echo -e "${BLUE}ℹ ${1}${NC}"
}

print_success() {
    echo -e "${GREEN}✓ ${1}${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ ${1}${NC}"
}

print_error() {
    echo -e "${RED}✗ ${1}${NC}"
}

# Function to check if gh CLI is installed
check_gh_cli() {
    if ! command -v gh &> /dev/null; then
        print_error "GitHub CLI (gh) is not installed."
        print_info "Install it from: https://cli.github.com/"
        exit 1
    fi
}

# Function to check if user is authenticated with gh
check_gh_auth() {
    if ! gh auth status &> /dev/null; then
        print_error "You are not authenticated with GitHub CLI."
        print_info "Run: gh auth login"
        exit 1
    fi
}

# Function to check for uncommitted changes
check_uncommitted_changes() {
    if [[ -n $(git status -s) ]]; then
        print_error "You have uncommitted changes. Please commit or stash them first."
        git status -s
        exit 1
    fi
}

# Function to validate version format
validate_version() {
    if [[ ! $1 =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
        print_error "Invalid version format. Use semantic versioning (e.g., 1.0.0)"
        exit 1
    fi
}

# Function to check if tag already exists
check_tag_exists() {
    if git rev-parse "v$1" >/dev/null 2>&1; then
        print_error "Tag v$1 already exists."
        exit 1
    fi
}

# Main script
main() {
    print_info "LocalStack CRUD UI - Release Script"
    echo ""

    # Pre-flight checks
    check_gh_cli
    check_gh_auth
    check_uncommitted_changes

    # Get current version from package.json
    CURRENT_VERSION=$(node -p "require('./package.json').version")
    print_info "Current version: ${CURRENT_VERSION}"
    echo ""

    # Prompt for new version
    read -p "Enter new version (e.g., 1.0.0): " NEW_VERSION

    # Validate version
    validate_version "$NEW_VERSION"
    check_tag_exists "$NEW_VERSION"

    # Confirm
    echo ""
    print_warning "This will:"
    echo "  1. Update package.json version to ${NEW_VERSION}"
    echo "  2. Create and push git tag v${NEW_VERSION}"
    echo "  3. Create a GitHub release"
    echo "  4. Trigger Docker image build and publish (via GitHub Actions)"
    echo ""
    read -p "Continue? (y/n): " -n 1 -r
    echo ""

    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_info "Release cancelled."
        exit 0
    fi

    # Update package.json version
    print_info "Updating package.json version..."
    npm version "$NEW_VERSION" --no-git-tag-version
    print_success "package.json updated to v${NEW_VERSION}"

    # Commit version change
    print_info "Committing version change..."
    git add package.json package-lock.json
    git commit -m "chore: bump version to ${NEW_VERSION}"
    print_success "Version change committed"

    # Create and push tag
    print_info "Creating git tag v${NEW_VERSION}..."
    git tag -a "v${NEW_VERSION}" -m "Release v${NEW_VERSION}"
    print_success "Tag created"

    print_info "Pushing changes and tag to GitHub..."
    git push origin main
    git push origin "v${NEW_VERSION}"
    print_success "Changes and tag pushed"

    # Get release notes
    echo ""
    print_info "Enter release notes (optional):"
    print_info "Press Ctrl+D when done, or Ctrl+C to skip"
    RELEASE_NOTES=$(cat)

    # Create GitHub release
    print_info "Creating GitHub release..."
    if [[ -n "$RELEASE_NOTES" ]]; then
        gh release create "v${NEW_VERSION}" \
            --title "v${NEW_VERSION}" \
            --notes "$RELEASE_NOTES" \
            --latest
    else
        gh release create "v${NEW_VERSION}" \
            --title "v${NEW_VERSION}" \
            --generate-notes \
            --latest
    fi
    print_success "GitHub release created"

    echo ""
    print_success "Release v${NEW_VERSION} completed successfully!"
    echo ""
    print_info "Next steps:"
    echo "  1. Docker image build triggered automatically via GitHub Actions"
    echo "  2. Monitor the build at: https://github.com/$(git config --get remote.origin.url | sed 's/.*:\(.*\)\.git/\1/')/actions"
    echo "  3. Once complete, image will be available at:"
    echo "     - Docker Hub: docker pull <your-dockerhub-username>/localstack-crud-ui:${NEW_VERSION}"
    echo "     - GHCR: docker pull ghcr.io/$(git config --get remote.origin.url | sed 's/.*:\(.*\)\.git/\1/' | tr '[:upper:]' '[:lower:]'):${NEW_VERSION}"
    echo ""
    print_info "View the release at: https://github.com/$(git config --get remote.origin.url | sed 's/.*:\(.*\)\.git/\1/')/releases/tag/v${NEW_VERSION}"
}

# Run main function
main
