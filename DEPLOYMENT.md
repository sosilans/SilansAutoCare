# Deployment Guide: Cursor to Cloudways

This guide explains how to deploy the SilansAutoCare application from Cursor to Cloudways hosting platform.

## Prerequisites

Before deploying, ensure you have:

1. **Cloudways Account**: An active Cloudways hosting account
2. **SSH Access**: SSH credentials for your Cloudways server
3. **GitHub Secrets**: Required secrets configured in your repository
4. **Cursor Editor**: Latest version of Cursor editor installed

## Setup Instructions

### 1. Cloudways Server Setup

1. Log in to your Cloudways account
2. Create or select your application server
3. Note down the following information:
   - SSH Host (e.g., `123.45.67.89`)
   - SSH User (e.g., `master_xxx`)
   - SSH Port (usually `22`)
   - Application Path (e.g., `/home/master_xxx/applications/xxx/public_html`)

### 2. Generate SSH Key for Deployment

On your local machine or in Cursor's terminal:

```bash
ssh-keygen -t rsa -b 4096 -C "deployment@silanosautocare" -f ~/.ssh/cloudways_deploy
```

Copy the public key to Cloudways:

```bash
cat ~/.ssh/cloudways_deploy.pub
```

Add this public key to your Cloudways server:
1. Go to Cloudways Dashboard
2. Navigate to Server → SSH Public Keys
3. Add the public key

### 3. Configure GitHub Secrets

Add the following secrets to your GitHub repository:
(Settings → Secrets and variables → Actions → New repository secret)

- `CLOUDWAYS_SSH_KEY`: Content of your private key (`~/.ssh/cloudways_deploy`)
- `CLOUDWAYS_HOST`: Your Cloudways server IP address
- `CLOUDWAYS_USER`: Your SSH username
- `CLOUDWAYS_DEPLOY_PATH`: Application deployment path

### 4. Development Workflow in Cursor

1. **Edit Code in Cursor**:
   - Open the project in Cursor
   - Make your changes
   - Use Cursor's AI features for code suggestions

2. **Test Locally**:
   ```bash
   npm install
   npm run dev
   ```

3. **Commit Changes**:
   ```bash
   git add .
   git commit -m "Your commit message"
   ```

4. **Push to GitHub**:
   ```bash
   git push origin main
   ```

### 5. Automatic Deployment

Once you push to the `main` branch:
1. GitHub Actions automatically triggers
2. The workflow builds your application
3. Files are deployed to Cloudways via SSH
4. Application restarts automatically

## Manual Deployment

If you need to deploy manually:

```bash
# Run the GitHub Actions workflow manually
gh workflow run deploy-cloudways.yml
```

Or use the "Actions" tab in GitHub and click "Run workflow".

## Deployment Configuration

The deployment is configured in `.github/workflows/deploy-cloudways.yml`:

- **Trigger**: Pushes to `main` branch
- **Build**: Runs `npm ci` and `npm run build`
- **Deploy**: Transfers files via SSH
- **Post-deploy**: Installs production dependencies on server

## Troubleshooting

### SSH Connection Issues
```bash
# Test SSH connection
ssh -i ~/.ssh/cloudways_deploy $CLOUDWAYS_USER@$CLOUDWAYS_HOST
```

### Check Deployment Logs
- Go to GitHub → Actions tab
- Click on the latest workflow run
- Review the deployment logs

### File Permissions
If you encounter permission errors:
```bash
ssh $CLOUDWAYS_USER@$CLOUDWAYS_HOST
chmod -R 755 $DEPLOY_PATH
```

## Cloudways-Specific Configuration

### Application Settings

1. **PHP Version**: Set appropriate PHP version in Cloudways dashboard
2. **Webroot**: Usually `public_html` or `public`
3. **SSL**: Enable free Let's Encrypt SSL certificate
4. **Domain**: Configure your domain in Cloudways

### Environment Variables

Set environment variables in Cloudways:
1. Go to Application Settings
2. Navigate to "Environment Variables"
3. Add required variables (DATABASE_URL, API_KEYS, etc.)

## Best Practices

1. **Always test locally** before pushing to main
2. **Use feature branches** for new features
3. **Review changes** before merging to main
4. **Monitor deployments** in GitHub Actions
5. **Backup database** before major deployments
6. **Use staging environment** for testing

## Cursor-Specific Tips

1. **Use Cursor Composer**: For AI-assisted code changes
2. **Terminal Integration**: Run commands directly in Cursor
3. **Git Integration**: Use built-in Git features
4. **Multi-file Editing**: Make consistent changes across files
5. **Code Review**: Use Cursor's AI to review before committing

## Additional Resources

- [Cloudways Documentation](https://support.cloudways.com/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Cursor Documentation](https://cursor.sh/docs)

## Support

For deployment issues:
1. Check GitHub Actions logs
2. Review Cloudways server logs
3. Contact Cloudways support if server-related
4. Create an issue in this repository

---

**Last Updated**: 2025-11-19
