GIT hooks can be used to validate your code or commit messages prior to a commit.
If your code or commit message does not pass validation, you will be unable to commit.

Usage:

Add the script execution in .huskyrc file
```
{
  "hooks": {
    "commit-msg": "bash scripts/hooks/commit-msg"
  }
}
```

