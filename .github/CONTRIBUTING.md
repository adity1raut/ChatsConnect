# Contributing to MiniProject

Thank you for your interest in contributing! Please follow these guidelines.

# Developer Certificate of Origin

By making a contribution to this project, I certify that:

(a) The contribution was created in whole or in part by me and I
    have the right to submit it under the open source license
    indicated in the file; or

(b) The contribution is based upon previous work that, to the best
    of my knowledge, is covered under an appropriate open source
    license and I have the right under that license to submit that
    work with modifications, whether created in whole or in part
    by me, under the same open source license (unless I am
    permitted to submit under a different license), as indicated
    in the file; or

(c) The contribution was provided directly to me by some other
    person who certified (a), (b) or (c) and I have not modified
    it.

(d) I understand and agree that this project and the contribution
    are public and that a record of the contribution (including all
    personal information I submit with it, including my sign-off) is
    maintained indefinitely and may be redistributed consistent with
    this project or the open source license(s) involved.

## How to Sign Off Your Commits

To sign off your commits, add the `-s` flag to your git commit command:

```bash
git commit -s -m "Your commit message"
```

This will automatically add a "Signed-off-by" line to your commit message:

```
Signed-off-by: Your Name <your.email@example.com>
```

If you forgot to sign off your commits, you can amend them:

```bash
# For the last commit
git commit --amend -s --no-edit

# For multiple commits
git rebase HEAD~<number-of-commits> --signoff
```

## How to Contribute

1. Fork the repository
2. Create a new branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Sign off your commits (`git commit -s -m 'Add amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

## Code Style

- Run `npm run lint` before committing
- Follow the existing code style
- Write meaningful commit messages

## Pull Request Process

1. Ensure all tests pass
2. Update documentation if needed
3. Sign off all commits (DCO requirement)
4. Request review from maintainers

## Reporting Bugs

Use the [bug report template](ISSUE_TEMPLATE/bug_report.md) to report bugs.

## Suggesting Features

Use the [feature request template](ISSUE_TEMPLATE/feature_request.md) to suggest new features.