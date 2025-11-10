# Release Process and Docker Publishing

This document describes how to create releases and publish Docker images for the LocalStack CRUD UI.

## Overview

When you create a release, the following happens automatically:

1. Version is updated in `package.json`
2. Git tag is created and pushed
3. GitHub release is created
4. **Docker images are automatically built and published** to:
   - Docker Hub: `<your-username>/localstack-crud-ui`
   - GitHub Container Registry: `ghcr.io/gautampachnanda101/aws-ui`

## Prerequisites

### 1. Install GitHub CLI

```bash
# macOS
brew install gh

# Linux
# See: https://github.com/cli/cli/blob/trunk/docs/install_linux.md

# Windows
# See: https://github.com/cli/cli#installation
```

### 2. Authenticate with GitHub

```bash
gh auth login
```

### 3. Set Up Docker Hub Secrets (One-time setup)

To publish to Docker Hub, you need to add secrets to your GitHub repository:

1. **Create a Docker Hub Access Token:**
   - Go to [Docker Hub](https://hub.docker.com/)
   - Click on your profile → Account Settings → Security
   - Click "New Access Token"
   - Give it a name (e.g., "GitHub Actions")
   - Copy the token (you won't see it again!)

2. **Add Secrets to GitHub:**
   ```bash
   # Navigate to your repository
   gh secret set DOCKERHUB_USERNAME
   # Enter your Docker Hub username when prompted

   gh secret set DOCKERHUB_TOKEN
   # Paste your Docker Hub access token when prompted
   ```

   Or manually:
   - Go to: https://github.com/gautampachnanda101/aws-ui/settings/secrets/actions
   - Click "New repository secret"
   - Add `DOCKERHUB_USERNAME` with your Docker Hub username
   - Add `DOCKERHUB_TOKEN` with your Docker Hub access token

## Creating a Release

### Using the Release Script (Recommended)

```bash
# Run the release script
make release

# Or directly
./release.sh
```

The script will:
1. Check for uncommitted changes
2. Ask for the new version number (e.g., `1.0.0`)
3. Update `package.json`
4. Create and push a git tag
5. Create a GitHub release
6. Trigger Docker image build automatically

### Manual Release

If you prefer to do it manually:

```bash
# 1. Update version in package.json
npm version 1.0.0

# 2. Commit the change
git add package.json package-lock.json
git commit -m "chore: bump version to 1.0.0"

# 3. Create and push tag
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin main
git push origin v1.0.0

# 4. Create GitHub release
gh release create v1.0.0 \
  --title "v1.0.0" \
  --generate-notes \
  --latest
```

## Version Numbering

Follow [Semantic Versioning](https://semver.org/):

- **MAJOR** version (e.g., `2.0.0`): Breaking changes
- **MINOR** version (e.g., `1.1.0`): New features, backwards compatible
- **PATCH** version (e.g., `1.0.1`): Bug fixes, backwards compatible

Examples:
- `1.0.0` - First stable release
- `1.1.0` - Added new AWS service support
- `1.1.1` - Fixed S3 upload bug
- `2.0.0` - Redesigned UI (breaking change)

## Docker Image Publishing

### Automatic Publishing

When a release is created, GitHub Actions automatically:

1. **Builds the Docker image** using the `Dockerfile`
2. **Tags the image** with:
   - Version tag (e.g., `1.0.0`)
   - Major.minor tag (e.g., `1.0`)
   - Major tag (e.g., `1`)
   - `latest` tag
3. **Publishes to multiple registries:**
   - Docker Hub: `<username>/localstack-crud-ui`
   - GHCR: `ghcr.io/gautampachnanda101/aws-ui`
4. **Supports multiple architectures:**
   - `linux/amd64` (Intel/AMD)
   - `linux/arm64` (Apple Silicon, ARM servers)

### Monitoring the Build

After creating a release:

```bash
# View GitHub Actions workflow runs
gh run list

# Watch the latest run
gh run watch

# Or visit in browser
open https://github.com/gautampachnanda101/aws-ui/actions
```

### Using the Published Images

Once published, users can pull the image:

```bash
# From Docker Hub (if configured)
docker pull <your-dockerhub-username>/localstack-crud-ui:latest
docker pull <your-dockerhub-username>/localstack-crud-ui:1.0.0

# From GitHub Container Registry (always available)
docker pull ghcr.io/gautampachnanda101/aws-ui:latest
docker pull ghcr.io/gautampachnanda101/aws-ui:1.0.0

# Run the container
docker run -p 3000:80 ghcr.io/gautampachnanda101/aws-ui:latest
```

## Workflow Details

### GitHub Actions Workflow

The workflow (`.github/workflows/docker-publish.yml`) is triggered by:
- Creating a release via GitHub UI
- Pushing a tag that starts with `v` (e.g., `v1.0.0`)

The workflow:
1. Checks out the code
2. Sets up Docker Buildx for multi-platform builds
3. Logs in to Docker Hub and GHCR
4. Extracts metadata (tags, labels)
5. Builds and pushes the image with caching
6. Updates Docker Hub description (optional)

### Image Tags

For release `v1.2.3`, the following tags are created:
- `1.2.3` - Exact version
- `1.2` - Minor version (gets updated for patches)
- `1` - Major version (gets updated for minor/patches)
- `latest` - Latest stable release

## Troubleshooting

### Release Script Fails

**Error: "GitHub CLI (gh) is not installed"**
```bash
brew install gh
gh auth login
```

**Error: "You have uncommitted changes"**
```bash
git status
git add .
git commit -m "your message"
# Then try again
```

**Error: "Tag already exists"**
```bash
# List existing tags
git tag

# Delete tag if needed
git tag -d v1.0.0
git push origin --delete v1.0.0
```

### Docker Build Fails

**Check workflow logs:**
```bash
gh run list
gh run view <run-id>
```

**Common issues:**
- Docker Hub credentials not set → Add secrets
- Dockerfile errors → Test locally: `docker build -t test .`
- Network issues → Re-run the workflow

**Re-run failed workflow:**
```bash
gh run rerun <run-id>
```

### Docker Hub Not Publishing

Ensure secrets are set:
```bash
# Check if secrets exist (won't show values)
gh secret list

# Set if missing
gh secret set DOCKERHUB_USERNAME
gh secret set DOCKERHUB_TOKEN
```

## Testing Before Release

Before creating a release, test locally:

```bash
# 1. Test development build
npm run dev

# 2. Test production build
npm run build
npm run preview

# 3. Test Docker build
docker build -t localstack-crud-ui:test .
docker run -p 3000:80 localstack-crud-ui:test

# 4. Test with LocalStack
docker-compose up -d
# Visit http://localhost:3000
docker-compose down

# 5. Run linter
npm run lint
```

## Release Checklist

Before creating a release:

- [ ] All tests pass
- [ ] Documentation is updated
- [ ] CHANGELOG is updated (if using one)
- [ ] No uncommitted changes
- [ ] Docker Hub secrets are configured
- [ ] GitHub CLI is installed and authenticated
- [ ] Version number follows semantic versioning
- [ ] Local Docker build works: `docker build -t test .`

## Example Release Workflow

```bash
# 1. Make your changes
git add .
git commit -m "feat: add CloudWatch support"
git push

# 2. Create release (this publishes Docker images automatically)
make release
# Enter version: 1.1.0
# Enter release notes (optional)

# 3. Wait for Docker build
gh run watch

# 4. Test the published image
docker pull ghcr.io/gautampachnanda101/aws-ui:1.1.0
docker run -p 3000:80 ghcr.io/gautampachnanda101/aws-ui:1.1.0

# 5. Announce the release!
```

## GitHub Container Registry (GHCR)

GHCR images are automatically public for public repositories. No additional setup needed!

Users can pull without authentication:
```bash
docker pull ghcr.io/gautampachnanda101/aws-ui:latest
```

To make the package public (if not automatic):
1. Go to: https://github.com/users/gautampachnanda101/packages/container/aws-ui/settings
2. Scroll to "Danger Zone"
3. Click "Change visibility" → "Public"

## Continuous Deployment

To automatically deploy on every commit to main:

1. Modify `.github/workflows/docker-publish.yml`:
   ```yaml
   on:
     push:
       branches: [main]
     release:
       types: [published]
   ```

2. This will build and push `latest` tag on every main branch push

## Resources

- [GitHub CLI Documentation](https://cli.github.com/manual/)
- [Docker Hub Access Tokens](https://docs.docker.com/docker-hub/access-tokens/)
- [GitHub Container Registry](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry)
- [Semantic Versioning](https://semver.org/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
