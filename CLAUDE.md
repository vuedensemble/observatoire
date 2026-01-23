# Development Instructions

## Running Python

Always use `uv run python` instead of `python` to run Python scripts and commands.

## IPython Autoreload

To automatically reload modules when they change:

```python
%load_ext autoreload
%autoreload 2
```

## Code Style

Prefer pure functions as much as possible. Functions should have all context passed via arguments rather than relying on closures or global state.
