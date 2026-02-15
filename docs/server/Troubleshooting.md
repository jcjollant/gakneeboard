# Troubleshooting

## VS Code Terminal Colors Disappearing

**Issue**: Terminal output text (specifically colored text) may disappear or be rendered invisibly in the VS Code integrated terminal. This was observed with standard ANSI red (`\x1b[31m`) and green (`\x1b[32m`) codes.

**Cause**: VS Code's built-in accessibility feature for minimum contrast ratio (`terminal.integrated.minimumContrastRatio`) can sometimes incorrectly calculate contrast or aggressively hide text that it deems "low contrast" against the terminal background. The default value is usually `4.5`.

**Fix**:
Add the following setting to your `.vscode/settings.json` file to disable this enforcement:

```json
{
    "terminal.integrated.minimumContrastRatio": 1
}
```

A value of `1` effectively disables the contrast adjustments, ensuring that valid ANSI color codes are rendered exactly as the output sends them.
