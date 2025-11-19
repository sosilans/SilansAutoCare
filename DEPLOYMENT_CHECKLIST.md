# Deployment Checklist

Use this checklist to ensure all steps are completed before and after deployment.

## Pre-Deployment Checklist

### Code Preparation
- [ ] All code changes committed and pushed to feature branch
- [ ] Code reviewed and tested locally
- [ ] All tests passing
- [ ] No console errors or warnings
- [ ] Documentation updated

### Environment Setup
- [ ] `.env` file configured (not committed to git)
- [ ] Environment variables set in Cloudways dashboard
- [ ] Database credentials verified
- [ ] API keys configured

### GitHub Configuration
- [ ] Repository secrets configured:
  - [ ] `CLOUDWAYS_SSH_KEY`
  - [ ] `CLOUDWAYS_HOST`
  - [ ] `CLOUDWAYS_USER`
  - [ ] `CLOUDWAYS_DEPLOY_PATH`
- [ ] SSH public key added to Cloudways server
- [ ] GitHub Actions enabled

### Cloudways Server Setup
- [ ] Server created and running
- [ ] SSH access verified
- [ ] Application created on server
- [ ] Domain configured (if applicable)
- [ ] SSL certificate installed
- [ ] PHP/Node version set correctly
- [ ] Required extensions installed

## Deployment Steps

### From Cursor
1. [ ] Open project in Cursor
2. [ ] Make necessary changes
3. [ ] Test changes locally
4. [ ] Commit changes with descriptive message
5. [ ] Push to `main` branch (or merge PR)

### Automated Process (GitHub Actions)
6. [ ] Monitor GitHub Actions workflow
7. [ ] Verify build completes successfully
8. [ ] Check deployment logs for errors
9. [ ] Confirm files transferred to server

## Post-Deployment Checklist

### Verification
- [ ] Application accessible at domain/IP
- [ ] Homepage loads correctly
- [ ] All routes/pages working
- [ ] Database connections working
- [ ] API endpoints responding
- [ ] Forms submitting correctly
- [ ] Images and assets loading

### Performance & Security
- [ ] SSL certificate active (HTTPS working)
- [ ] Site loads in under 3 seconds
- [ ] No console errors in browser
- [ ] Mobile responsiveness verified
- [ ] Security headers configured

### Monitoring
- [ ] Error logs checked in Cloudways
- [ ] Application logs reviewed
- [ ] Server resources (CPU, memory) normal
- [ ] Database performance acceptable

### Documentation
- [ ] Deployment date recorded
- [ ] Changes documented in changelog
- [ ] Team notified of deployment
- [ ] Known issues documented (if any)

## Rollback Plan

If deployment fails:

1. [ ] Identify the issue from logs
2. [ ] Decide: fix forward or rollback
3. [ ] If rollback:
   - [ ] SSH into Cloudways server
   - [ ] Restore previous version from backup
   - [ ] Verify site is working
   - [ ] Notify team of rollback

4. [ ] Fix issues locally
5. [ ] Test thoroughly
6. [ ] Re-deploy when ready

## Emergency Contacts

- Cloudways Support: [support link]
- Development Team: [contact info]
- Database Admin: [contact info]

## Common Issues & Solutions

### Deployment Fails
- Check GitHub Actions logs
- Verify SSH credentials
- Confirm server disk space

### Site Not Loading
- Check Cloudways server status
- Verify domain DNS settings
- Review application logs

### Database Connection Error
- Verify `.env` variables
- Check database server status
- Confirm credentials

---

**Template Version**: 1.0  
**Last Updated**: 2025-11-19
