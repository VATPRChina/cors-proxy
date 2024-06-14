# cors-proxy

Proxies VATSIM APIs and adds CORS headers for cross-origin access.

## Usage

```
https://cors-proxy.vatprc.net?target={URL}
```

Limitation:

- Target website must be whitelisted.
- Source origin must be whitelisted.
- Only `GET`, `HEAD` or `OPTIONS` are supported.
- Only whitelisted headers could be exchanged.

## Config

Use env vars.

| name                    | description                      | default      |
| ----------------------- | -------------------------------- | ------------ |
| `ALLOWED_TARGET_SUFFIX` | allowed suffix for target domain | `vatsim.net` |
| `ALLOWED_ORIGIN_SUFFIX` | allowed suffix for origin domain | `vatprc.net` |
